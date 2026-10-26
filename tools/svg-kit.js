'use strict';

// Shared style tokens and drawing helpers. Every icon is drawn on a 256 × 256
// canvas with a transparent background. Shading (highlights, rims, outlines)
// is derived from one base colour per part, so the library can be re-themed
// by editing PALETTE and re-running the generator.

const fs = require('fs');
const path = require('path');

const STROKE = 3;

// The one colour used by single-colour icons; the gallery swaps it for the user's choice.
const INK = '#000000';

const PALETTE = {
  gramPositive: '#8B6FD9', // Gram stain: crystal violet
  gramNegative: '#E46F8C', // Gram stain: safranin pink
  fungus: '#E8C26A',
  virusEnvelope: '#86B6D6',
  spike: '#DF5249',
  membraneProtein: '#F3C24F',
  capsid: '#4FB3A0',
  penton: '#F2A541',
  fibre: '#8E9DAB',
  neutrophil: '#F5C8D6',
  macrophage: '#F4C29B',
  lymphocyte: '#A9D2F0',
  nucleus: '#7E57C2', // all nuclei share one purple
  heavyChain: '#3D73CF',
  lightChain: '#8CC2F0',
  receptorA: '#6CC28A',
  receptorB: '#3E9C66',
  glycan: '#5DBB63',
  disulphide: '#F2C14E',
  drugRed: '#D9534F',
  drugYellow: '#F5C445',
  fluid: '#9BD0EF',
  plastic: '#EEF4F8',
  plasticEdge: '#8DA6B8',
  labelAccent: '#F2A541',
  broth: '#B23B37',
  capYellow: '#F2B33D',
  acidFast: '#D9466F', // Ziehl–Neelsen carbol fuchsin
  capsule: '#E6DEFA',
  rsvEnvelope: '#A8D5BA',
  fusionProtein: '#E58A3C',
  attachmentProtein: '#5B7FD6',
  fluEnvelope: '#F2C48D',
  haemagglutinin: '#4F86D9',
  neuraminidase: '#D9534F',
  herpesEnvelope: '#CDB8EA',
  tegument: '#EEE5F8',
  herpesCapsid: '#5E9ED6',
  phageHead: '#5DA9E9',
  mould: '#B9D98C',
  conidia: '#4E8F3A',
  bLymphocyte: '#B8E0C8',
  plasmaCell: '#9FD3B4',
  dendritic: '#F7DFA3',
  nkCell: '#D6C9F0',
  cytotoxicGranule: '#D9534F',
  erythrocyte: '#D9473F',
  jChain: '#F2A541',
  mhcAlpha: '#B39DDB',
  mhcBeta: '#4DB6AC',
  peptide: '#F2A541',
  lipidHead: '#F4B860',
  lipidTail: '#D9B48A',
  receptorChainA: '#4FA3C7',
  receptorChainB: '#86C9E8',
  cytokine: '#F28C6B',
  kinase: '#9C7FD9',
  vialCap: '#3E8ED0',
  plunger: '#9AA6B2',
  amberGlass: '#C77B2A',
  oralPlunger: '#8E6CC9',
  suspension: '#F3C6CF',
  bloodAgar: '#B8323A',
  colony: '#F3E9D2',
  lung: '#EE9FA9',
  skin: '#D9A07A',
  hair: '#5A3A29',
  shirt: '#4DB6AC',
  shorts: '#3F5A8A',
  shoe: '#4A4A55',
  swaddle: '#F6E2A0',
  hat: '#9ED9C2',
  brain: '#F4B6C2',
  heartMuscle: '#D65A58',
  artery: '#D9473F',
  vein: '#5B8FD9',
  kidney: '#C8645A',
  renalPelvis: '#F2D4C9',
  bladder: '#E9A6A0',
  liver: '#B5544A',
  gallbladder: '#7DB46C',
  colon: '#E8A76D',
  smallIntestine: '#F2A7A7',
  epidermis: '#E2A27E',
  dermis: '#F6D3C2',
  fat: '#F7E08A',
  bone: '#F1E6C8',
  marrow: '#C84B4B',
  cartilage: '#CFE6F2',
  synovium: '#9ED9C2',
  lymphNode: '#A8D8B9',
  follicle: '#6FBF8E',
  lymph: '#F2D07A',
  spleen: '#9C4A6E',
  thymus: '#F2B8A0',
  monocyte: '#C9D9E8',
  eosinophil: '#F9E3D3',
  eosinGranule: '#F07A4A',
  platelet: '#C9A9E0',
  plasmodium: '#7E57C2',
  chromatin: '#B71C4A',
  biofilmMatrix: '#CFE3A0',
  substrate: '#B0BEC5',
  complement: '#E5707A',
  complementComplex: '#9C7FD9',
  nappy: '#F4F6F8',
};

const round = v => Math.round(v * 100) / 100;

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}

function rgbToHex(rgb) {
  return '#' + rgb.map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
}

function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
}

const tint = (c, t) => mix(c, '#ffffff', t);
const shade = (c, t) => mix(c, '#000000', t);
const outline = c => shade(c, 0.38);

// Spherical shading: bright highlight top-left, base colour, darker rim.
function sphereGradient(id, base, { light = 0.6, dark = 0.16, focus = [0.33, 0.28] } = {}) {
  return `<radialGradient id="${id}" cx="0.45" cy="0.42" r="0.62" fx="${focus[0]}" fy="${focus[1]}">` +
    `<stop offset="0" stop-color="${tint(base, light)}"/>` +
    `<stop offset="0.55" stop-color="${base}"/>` +
    `<stop offset="1" stop-color="${shade(base, dark)}"/></radialGradient>`;
}

// Cylinder shading across the short axis of a shape (top → bottom by default).
function cylinderGradient(id, base, { horizontal = false } = {}) {
  const dir = horizontal ? 'x1="0" y1="0" x2="1" y2="0"' : 'x1="0" y1="0" x2="0" y2="1"';
  return `<linearGradient id="${id}" ${dir}>` +
    `<stop offset="0" stop-color="${shade(base, 0.06)}"/>` +
    `<stop offset="0.25" stop-color="${tint(base, 0.5)}"/>` +
    `<stop offset="0.6" stop-color="${base}"/>` +
    `<stop offset="1" stop-color="${shade(base, 0.22)}"/></linearGradient>`;
}

function glossGradient(id) {
  return `<radialGradient id="${id}"><stop offset="0" stop-color="#fff" stop-opacity="0.85"/>` +
    `<stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
}

// Soft specular highlight.
function gloss(gradId, cx, cy, rx, ry, rotate = -30) {
  const [x, y] = [round(cx), round(cy)];
  return `<ellipse cx="${x}" cy="${y}" rx="${round(rx)}" ry="${round(ry)}" transform="rotate(${rotate} ${x} ${y})" fill="url(#${gradId})"/>`;
}

// Smooth paths through points (Catmull–Rom converted to cubic Béziers).
function smoothClosedPath(pts) {
  const n = pts.length;
  let d = `M${round(pts[0][0])} ${round(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += bezierSegment(p0, p1, p2, p3);
  }
  return d + 'Z';
}

function smoothOpenPath(pts) {
  const n = pts.length;
  let d = `M${round(pts[0][0])} ${round(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p3 = pts[Math.min(n - 1, i + 2)];
    d += bezierSegment(p0, pts[i], pts[i + 1], p3);
  }
  return d;
}

function bezierSegment(p0, p1, p2, p3) {
  const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
  const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
  return `C${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(p2[0])} ${round(p2[1])}`;
}

// Points around a centre whose radius varies with angle (for organic outlines).
function polarPoints(cx, cy, radiusAt, n = 72) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI, r = radiusAt(a);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
}

const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));

// Point and outward normal at fraction u around a stadium (rod) outline
// with straight half-length s and end radius r, centred on the origin.
function stadiumPoint(u, s, r) {
  let d = u * (4 * s + 2 * Math.PI * r);
  if (d < 2 * s) return { x: -s + d, y: -r, nx: 0, ny: -1 };
  d -= 2 * s;
  if (d < Math.PI * r) {
    const a = -Math.PI / 2 + d / r;
    return { x: s + r * Math.cos(a), y: r * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) };
  }
  d -= Math.PI * r;
  if (d < 2 * s) return { x: s - d, y: r, nx: 0, ny: 1 };
  d -= 2 * s;
  const a = Math.PI / 2 + d / r;
  return { x: -s + r * Math.cos(a), y: r * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) };
}

// Points along a wavy filament (e.g. a flagellum) leaving point p along
// its normal, turned by tilt radians. The wave grows in over the first 8 px.
function wavePoints(p, tilt, { length = 46, amplitude = 5, wavelength = 18, phase = 0 } = {}) {
  const dx = p.nx * Math.cos(tilt) - p.ny * Math.sin(tilt);
  const dy = p.nx * Math.sin(tilt) + p.ny * Math.cos(tilt);
  const pts = [];
  for (let t = -3; t <= length; t += 3) {
    const a = amplitude * Math.sin((t / wavelength) * 2 * Math.PI + phase) * Math.min(1, Math.max(0, t) / 8);
    pts.push([p.x + dx * t - dy * a, p.y + dy * t + dx * a]);
  }
  return pts;
}

// Centres spaced along a cubic Bézier by the given gaps (n gaps → n + 1 points),
// centred on the curve, each with its tangent angle in degrees.
function pointsAlongBezier(p0, p1, p2, p3, gaps) {
  const at = t => { const u = 1 - t; return [0, 1].map(k => u ** 3 * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t ** 3 * p3[k]); };
  const samples = Array.from({ length: 801 }, (_, i) => at(i / 800));
  const dist = [0];
  for (let i = 1; i < samples.length; i++) {
    dist.push(dist[i - 1] + Math.hypot(samples[i][0] - samples[i - 1][0], samples[i][1] - samples[i - 1][1]));
  }
  let d = (dist[dist.length - 1] - gaps.reduce((a, b) => a + b, 0)) / 2;
  const out = [];
  for (let k = 0; k <= gaps.length; k++) {
    const i = Math.max(1, Math.min(samples.length - 2, dist.findIndex(x => x >= d)));
    const [p, q] = [samples[i - 1], samples[i + 1]];
    out.push({ x: samples[i][0], y: samples[i][1], angle: Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI });
    d += gaps[k] || 0;
  }
  return out;
}

// Bézier and gaps for the streptococcal chain, shared by its colour and single-colour icons.
const STREP_CHAIN = [[22, 178], [84, 6], [170, 250], [234, 80], [39, 45, 39, 45, 39, 45]];

// Bacteria embedded in a biofilm: [x, y, angle, kind] with kind 'rod' or 'coccus'.
const BIOFILM_CELLS = [[46, 194, 20, 'rod'], [66, 176, -30, 'rod'], [88, 196, 60, 'rod'], [98, 164, 10, 'rod'], [120, 146, -50, 'rod'],
  [114, 186, 30, 'rod'], [140, 166, 80, 'rod'], [146, 196, -10, 'rod'], [162, 140, 20, 'rod'], [172, 174, -40, 'rod'],
  [192, 154, 70, 'rod'], [196, 194, 15, 'rod'], [216, 180, -25, 'rod'], [74, 200, 0, 'coccus'], [132, 140, 0, 'coccus'],
  [168, 196, 0, 'coccus'], [212, 160, 0, 'coccus'], [96, 182, 0, 'coccus']];

// One coccus of a pneumococcal pair: an oval, slightly fuller where the pair meets (x = 0)
// and tapering a little towards the far end. side = 1 draws the right-hand coccus, -1 the left.
const lancetPath = side => {
  const p = (x, y) => `${x * side} ${y}`;
  return `M${p(4, 0)}C${p(4, -14)} ${p(15, -22)} ${p(30, -22)}C${p(46, -22)} ${p(60, -11)} ${p(62, 0)}` +
    `C${p(60, 11)} ${p(46, 22)} ${p(30, 22)}C${p(15, 22)} ${p(4, 14)} ${p(4, 0)}Z`;
};

// One coccus of a meningococcal pair: a coffee bean with its concave face towards x = 0.
const beanPath = side => {
  const p = (x, y) => `${x * side} ${y}`;
  return `M${p(10, -32)}C${p(34, -44)} ${p(60, -30)} ${p(60, 0)}C${p(60, 30)} ${p(34, 44)} ${p(10, 32)}` +
    `C${p(2, 28)} ${p(2, 20)} ${p(8, 14)}C${p(12, 8)} ${p(12, -8)} ${p(8, -14)}C${p(2, -20)} ${p(2, -28)} ${p(10, -32)}Z`;
};

// A tube (hypha, limb, airway) drawn as layered strokes: outline, body colour, soft highlight.
function pipe(d, colour, width) {
  const common = `d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  return `<path ${common} stroke="${outline(colour)}" stroke-width="${width + 5}"/>` +
    `<path ${common} stroke="${colour}" stroke-width="${width}"/>` +
    `<path ${common} stroke="#fff" stroke-width="${round(Math.max(1.5, width * 0.22))}" opacity="0.4" transform="translate(${round(-width * 0.18)} ${round(-width * 0.18)})"/>`;
}

// Mirror an absolute-coordinate path ("x y" pairs only) left–right across the canvas centre.
const mirrorX = d => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${round(256 - Number(x))} ${y}`);

// Radius of an ellipse with semi-axes rx, ry in direction a (radians).
const ellipseRadius = (rx, ry, a) => 1 / Math.sqrt((Math.cos(a) / rx) ** 2 + (Math.sin(a) / ry) ** 2);

// Circle as a path, so circles can be combined into one shape (e.g. with holes via evenodd).
const circlePath = (cx, cy, r) =>
  `M${round(cx - r)} ${round(cy)}a${r} ${r} 0 1 0 ${round(2 * r)} 0a${r} ${r} 0 1 0 ${round(-2 * r)} 0Z`;

const vec = {
  unit: v => { const l = Math.hypot(...v); return v.map(x => x / l); },
  sub: (a, b) => a.map((x, i) => x - b[i]),
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
};

// Unit icosahedron tilted so no vertex points straight at the viewer (+z).
// Faces carry outward normals; visibleFaces are sorted back to front.
function icosahedron({ tiltX = 0.38, tiltY = 0.52 } = {}) {
  const { unit, sub, dot, cross } = vec;
  const phi = (1 + Math.sqrt(5)) / 2;
  const turn = ([x, y, z]) => {
    const y1 = y * Math.cos(tiltX) - z * Math.sin(tiltX), z1 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
    return [x * Math.cos(tiltY) + z1 * Math.sin(tiltY), y1, -x * Math.sin(tiltY) + z1 * Math.cos(tiltY)];
  };
  const vertices = [[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0], [0, -1, phi], [0, 1, phi],
    [0, -1, -phi], [0, 1, -phi], [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]]
    .map(v => turn(unit(v)));
  const faces = [];
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) for (let k = j + 1; k < 12; k++) {
    const [a, b, c] = [vertices[i], vertices[j], vertices[k]];
    if (Math.hypot(...sub(a, b)) > 1.2 || Math.hypot(...sub(a, c)) > 1.2 || Math.hypot(...sub(b, c)) > 1.2) continue;
    let nrm = unit(cross(sub(b, a), sub(c, a)));
    const centre = [0, 1, 2].map(d => (a[d] + b[d] + c[d]) / 3);
    if (dot(nrm, centre) < 0) nrm = nrm.map(x => -x);
    faces.push({ idx: [i, j, k], nrm, z: centre[2] });
  }
  const visibleFaces = faces.filter(f => f.nrm[2] > 0).sort((p, q) => p.z - q.z);
  const visibleVertices = new Set(visibleFaces.flatMap(f => f.idx));
  return { vertices, visibleFaces, visibleVertices };
}

// Deterministic pseudo-random numbers (mulberry32), so regenerated icons are identical.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const escapeXml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svgDocument({ id, title, description, defs, body }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="${id}-title">
<title id="${id}-title">${escapeXml(title)}</title>
<desc>${escapeXml(description)}</desc>
<defs>${defs.join('')}</defs>
${body.join('\n')}
</svg>
`;
}

// Writes an icon's SVG to the path catalogue.json gives for it.
function writeIcon(root, file, svg) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, svg);
  console.log(`Drew ${file}`);
}

module.exports = {
  STROKE, INK, PALETTE, round, mix, tint, shade, outline,
  sphereGradient, cylinderGradient, glossGradient, gloss,
  smoothClosedPath, smoothOpenPath, polarPoints, wrapAngle, stadiumPoint, wavePoints,
  pointsAlongBezier, STREP_CHAIN, BIOFILM_CELLS, lancetPath, beanPath, pipe, mirrorX, ellipseRadius, circlePath, vec, icosahedron, rng, svgDocument, writeIcon,
};
