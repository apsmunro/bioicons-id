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
  vec, icosahedron, rng, svgDocument, writeIcon,
};
