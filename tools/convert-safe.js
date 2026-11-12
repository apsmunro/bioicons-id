'use strict';
// Makes a finished colour icon survive PowerPoint's "Convert to Shape", which (tested in
// PowerPoint 16 for Windows) keeps linear gradients, fill-opacity and opacity on a shape, but
//   - drops clip paths, so clipped shapes spill;
//   - flattens a radial gradient to its first stop, ignoring that stop's opacity;
//   - drops opacity set on a group.
// So, for the SVG text of one icon:
//   1. every filled shape under a clip path is cut to its final outline here, at build time,
//      and the clip path removed. A plain stroke is first turned into its outline, then cut the
//      same way. Dashed strokes, and rotated shapes with a gradient fill, stay clipped.
//   2. every opaque radial gradient gets a duplicate first stop in its mid colour. A renderer
//      ignores it (the next stop has the same offset); PowerPoint flattens to it, so a converted
//      icon keeps each part's base colour rather than its highlight.
const paper = require('paper');
paper.setup(new paper.Size(256, 256));
const { PaperOffset } = require('paperjs-offset');

const SHAPES = new Set(['path', 'circle', 'ellipse', 'rect', 'polygon']);
const GEOMETRY = new Set(['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'points', 'transform', 'clip-path']);

// A small parser for the SVG this project generates (no text nodes, no comments, no CDATA).
function parse(svg) {
  const root = { tag: '#root', attrs: {}, children: [], start: 0, end: svg.length }, stack = [root];
  const re = /<(\/?)([\w:]+)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g;
  let m;
  while ((m = re.exec(svg))) {
    const [text, closing, tag, attrText, selfClosing] = m, top = stack[stack.length - 1];
    if (closing) { top.end = m.index + text.length; top.innerEnd = m.index; stack.pop(); continue; }
    const attrs = {};
    attrText.replace(/([\w:-]+)="([^"]*)"/g, (_, k, v) => { attrs[k] = v; });
    const node = { tag, attrs, children: [], start: m.index, innerStart: m.index + text.length, end: m.index + text.length, parent: top };
    top.children.push(node);
    if (!selfClosing) stack.push(node);
  }
  return root;
}
const walk = (node, visit) => { if (visit(node) !== false) node.children.forEach(c => walk(c, visit)); };

function matrixOf(transform) {
  const M = new paper.Matrix();
  (transform || '').replace(/(\w+)\(([^)]*)\)/g, (_, kind, args) => {
    const a = args.split(/[\s,]+/).filter(Boolean).map(Number);
    if (kind === 'translate') M.translate(a[0], a[1] || 0);
    else if (kind === 'rotate') M.rotate(a[0], a.length > 1 ? new paper.Point(a[1], a[2]) : new paper.Point(0, 0));
    else if (kind === 'scale') M.scale(a[0], a.length > 1 ? a[1] : a[0], new paper.Point(0, 0));
    else if (kind === 'matrix') M.append(new paper.Matrix(...a));
    else throw new Error('transform ' + kind);
  });
  return M;
}

// The outline of a shape element as a paper item, in its parent's coordinates.
function geometry(node, withTransform = true) {
  const a = node.attrs, num = k => Number(a[k] || 0);
  let item;
  if (node.tag === 'path') item = new paper.CompoundPath({ pathData: a.d, insert: false });
  else if (node.tag === 'circle') item = new paper.Path.Circle({ center: [num('cx'), num('cy')], radius: num('r'), insert: false });
  else if (node.tag === 'ellipse') item = new paper.Path.Ellipse({ center: [num('cx'), num('cy')], radius: [num('rx'), num('ry')], insert: false });
  else if (node.tag === 'rect') {
    const rx = a.rx !== undefined ? num('rx') : num('ry'), ry = a.ry !== undefined ? num('ry') : rx;
    item = new paper.Path.Rectangle({ rectangle: new paper.Rectangle(num('x'), num('y'), num('width'), num('height')), radius: [Math.min(rx, num('width') / 2), Math.min(ry, num('height') / 2)], insert: false });
  } else if (node.tag === 'polygon') {
    const p = a.points.trim().split(/[\s,]+/).map(Number);
    item = new paper.Path({ segments: p.reduce((out, v, i) => (i % 2 ? out[out.length - 1].push(v) : out.push([v]), out), []), closed: true, insert: false });
  } else throw new Error('shape ' + node.tag);
  item.fillRule = (a['fill-rule'] || a['clip-rule']) === 'evenodd' ? 'evenodd' : 'nonzero';
  if (withTransform && a.transform) item.transform(matrixOf(a.transform));
  return item;
}

const round = d => d.replace(/-?\d*\.\d+(?:e-?\d+)?/g, v => String(Math.round(Number(v) * 100) / 100)).replace(/,/g, ' ');
const attrText = attrs => Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join('');
const painted = v => v !== undefined && v !== 'none';

// The leaves of a subtree, each with the matrix and attributes it inherits below the clipped
// element; null if any part of the subtree cannot be cut (stroked, group opacity, not a shape).
function leaves(node, matrix, inherited) {
  if (node.attrs['clip-path']) return null;
  if (node.tag === 'g') {
    if (node.attrs.opacity !== undefined) return null;
    const m = matrix.clone().append(matrixOf(node.attrs.transform)), own = { ...inherited };
    for (const [k, v] of Object.entries(node.attrs)) if (k !== 'transform') own[k] = v;
    const out = [];
    for (const child of node.children) { const l = leaves(child, m, own); if (!l) return null; out.push(...l); }
    return out;
  }
  if (!SHAPES.has(node.tag)) return null;
  const attrs = { ...inherited, ...node.attrs };
  if (painted(attrs.stroke)) {
    // A stroke can be outlined if it is a plain colour, not dashed; with a fill as well, only if
    // nothing is see-through (the two would overlap along the edge).
    if (/^url\(/.test(attrs.stroke) || attrs['stroke-dasharray']) return null;
    if (painted(attrs.fill === undefined ? 'black' : attrs.fill) && (attrs.opacity !== undefined || attrs['stroke-opacity'] !== undefined)) return null;
  }
  const m = matrix.clone().append(matrixOf(node.attrs.transform));
  // A gradient fill is positioned by the shape's own box or by user space: only safe to keep if the shape is not moved.
  if (/^url\(/.test(attrs.fill || '') && !m.isIdentity()) return null;
  return [{ node, matrix: m, attrs }];
}

// The outline of a shape's stroke, as a filled shape.
function strokeOutline(shape, attrs, scale) {
  const half = Number(attrs['stroke-width'] || 1) * scale / 2;
  const options = { cap: attrs['stroke-linecap'] || 'butt', join: attrs['stroke-linejoin'] || 'miter', insert: false };
  const parts = shape.children && shape.children.length ? shape.children : [shape];
  return parts.map(p => PaperOffset.offsetStroke(p, half, options)).reduce((a, b) => a.unite(b, { insert: false }));
}

function cut(leaf, clip) {
  const shape = geometry(leaf.node, false);
  shape.transform(leaf.matrix);
  const a = leaf.attrs, base = {};
  for (const [k, v] of Object.entries(a)) if (!GEOMETRY.has(k) && !k.startsWith('stroke')) base[k] = v;
  const piece = (item, attrs) => {
    const result = item.intersect(clip, { insert: false });
    if (!result.pathData || result.isEmpty() || Math.abs(result.area) < 0.5) return '';
    return `<path d="${round(result.pathData)}"${attrText(result.fillRule === 'evenodd' ? { ...attrs, 'fill-rule': 'evenodd' } : attrs)}/>`;
  };
  let out = '';
  if (painted(a.fill === undefined ? 'black' : a.fill)) out += piece(shape, base);
  if (painted(a.stroke)) {
    const { 'fill-rule': _, 'fill-opacity': __, ...rest } = base;
    const attrs = { ...rest, fill: a.stroke };
    if (a['stroke-opacity'] !== undefined) attrs['fill-opacity'] = a['stroke-opacity'];
    out += piece(strokeOutline(shape, a, Math.sqrt(Math.abs(leaf.matrix.a * leaf.matrix.d - leaf.matrix.b * leaf.matrix.c))), attrs);
  }
  return out;
}

function bakeClips(svg) {
  const root = parse(svg), clips = {}, edits = [];
  walk(root, node => { if (node.tag === 'clipPath') { clips[node.attrs.id] = node; return false; } });
  const clipGeometry = id => {
    const node = clips[id];
    if (!node) throw new Error('no clipPath ' + id);
    if (!node.geometry) node.geometry = node.children.map(c => geometry(c)).reduce((a, b) => a.unite(b, { insert: false }));
    return node.geometry;
  };
  walk(root, node => {
    if (node.tag === 'clipPath') return false;
    const ref = node.attrs['clip-path'];
    if (!ref) return;
    const id = ref.match(/#([^)]+)/)[1], clip = clipGeometry(id), identity = new paper.Matrix();
    const { 'clip-path': _, ...rest } = node.attrs;
    let out;
    if (node.tag === 'g') {
      // Cut each child that can be cut; keep runs of the others inside the clip path, in order.
      const parts = [];
      for (const child of node.children) {
        const l = leaves(child, identity, {});
        if (l) parts.push({ text: l.map(leaf => cut(leaf, clip)).join('') });
        else if (parts.length && parts[parts.length - 1].kept) parts[parts.length - 1].text += svg.slice(child.start, child.end);
        else parts.push({ kept: true, text: svg.slice(child.start, child.end) });
      }
      const inner = parts.map(p => p.kept ? `<g clip-path="${ref}">${p.text}</g>` : p.text).join('');
      out = Object.keys(rest).length ? `<g${attrText(rest)}>${inner}</g>` : inner;
    } else {
      // A clipped shape: its own transform applies to the clip too, so cut before transforming.
      const { transform, ...own } = node.attrs;
      const l = leaves({ ...node, attrs: (({ 'clip-path': __, ...o }) => o)(own) }, identity, {});
      if (!l) return false;
      const cutShape = cut(l[0], clip);
      out = cutShape && transform ? cutShape.replace('/>', ` transform="${transform}"/>`) : cutShape;
    }
    edits.push([node.start, node.end, out]);
    return false;
  });
  edits.sort((a, b) => b[0] - a[0]).forEach(([s, e, text]) => { svg = svg.slice(0, s) + text + svg.slice(e); });
  // Drop clip paths nothing uses any more.
  return svg.replace(/<clipPath id="([^"]+)">.*?<\/clipPath>/g, (text, id) => svg.includes(`url(#${id})`) ? text : '');
}

// Give each opaque radial gradient a duplicate first stop in the colour of its middle stop.
function flattenToBase(svg) {
  return svg.replace(/(<radialGradient\b[^>]*>)(.*?)(<\/radialGradient>)/g, (text, open, stops, close) => {
    if (stops.includes('stop-opacity')) return text;
    const list = [...stops.matchAll(/<stop offset="([^"]+)" stop-color="([^"]+)"\/>/g)].map(m => [Number(m[1]), m[2]]);
    if (list.length < 2 || list[0][0] !== 0) return text;
    const base = list.reduce((best, s) => Math.abs(s[0] - 0.5) < Math.abs(best[0] - 0.5) ? s : best)[1];
    return `${open}<stop offset="0" stop-color="${base}"/>${stops}${close}`;
  });
}

const convertSafe = svg => flattenToBase(bakeClips(svg));
// What conversion would still break in this SVG, for reporting.
const remaining = svg => ({
  clips: (svg.match(/clip-path="/g) || []).length,
  fadingRadials: [...svg.matchAll(/<radialGradient\b[^>]*>(.*?)<\/radialGradient>/g)].filter(m => m[1].includes('stop-opacity')).length,
  groupOpacity: (svg.match(/<g (?:[^>]* )?opacity="/g) || []).length,
});

module.exports = { convertSafe, remaining };
