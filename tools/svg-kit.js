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
  toxin: '#F2A541',
  hostCell: '#F6E3D4',
  actin: '#F2A541',
  spirochaete: '#4FA3A6',
  rotaOuter: '#E8A23B',
  rotaMiddle: '#F5D08A',
  rotaCore: '#C97B2E',
  enterovirus: '#E3816F',
  measlesEnvelope: '#C9E3A5',
  toxoplasma: '#9FD3C7',
  rhoptry: '#E58A3C',
  microneme: '#F2C14E',
  enzyme: '#7FB3D5',
  bond: '#3A4650',
  pump: '#9C7FD9',
  channel: '#EDE5FA',
  mhAgar: '#E9C98B',
  lnpInterior: '#FFF4E0',
  mrna: '#E5707A',
  peg: '#8BC3E8',
  targetCell: '#E8D9C4',
  mastCell: '#EBD3EC',
  mastGranule: '#7B3F98',
  mercury: '#E04B4B',
  metal: '#B9C3CC',
  tubing: '#3E4A59',
  csf: '#BFE3F7',
  intervertebralDisc: '#BFD7E6',
  swabTip: '#F6D9A8',
  medium: '#F3B6C3',
  dress: '#9C7FD9',
  spore: '#4FA36A', // Schaeffer–Fulton malachite green
  hivEnvelope: '#F3D9A4',
  hivCapsid: '#3FA7A0',
  norovirus: '#8FA3E3',
  giardia: '#B9D7EE',
  b2m: '#F4A3A8', // β2-microglobulin
  secretoryComponent: '#B07CC6',
  tlr: '#5FA8D3',
  treg: '#9ED8D0',
  nam: '#6F9BE0', // N-acetylmuramic acid (NAG uses glycan green)
  urine: '#F2D35B',
  mosquito: '#8B6B4A',
  wing: '#DCE6EE',
  lateralFlowLine: '#B0306A',
  smear: '#C99BD6',
};

// Skin and hair colours for the people icons. "medium" matches PALETTE and is used for each
// icon's main file; the others are drawn into the files listed in its catalogue "toneFiles".
const SKIN_TONES = [
  { id: 'light', label: 'Light', skin: '#F2CDA8', hair: '#8C5A33' },
  { id: 'medium', label: 'Medium', skin: '#D9A07A', hair: '#5A3A29' },
  { id: 'brown', label: 'Brown', skin: '#A8714B', hair: '#2F2119' },
  { id: 'dark', label: 'Dark', skin: '#6B4430', hair: '#1E1612' },
];

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

// Pseudomonas rods, each with a single polar flagellum: [x, y, angle].
const PSEUDOMONAS_CELLS = [[86, 78, -32], [112, 132, -26], [146, 180, -34]];

// Salmonella invading the gut epithelium: two enterocytes, the right one ruffling its apical
// membrane up around a bacterium; microvilli (x positions) line the left cell's brush border.
const ENTEROCYTES = {
  left: 'M24 232L24 124Q24 118 30 118L128 118L128 232Z',
  right: 'M128 232L128 118L134 118C140 100 130 76 140 58C148 44 172 42 180 52C184 58 178 64 172 62C162 60 154 70 156 84' +
    'C158 100 168 112 184 112C198 112 208 104 210 92C212 80 206 70 210 64C214 58 222 58 224 66C228 84 222 104 228 118' +
    'Q232 118 232 124L232 232Z',
  microvilli: Array.from({ length: 9 }, (_, i) => 34 + i * 11),
};

// C. difficile: a vegetative rod, a rod with a subterminal spore, and free spores ([x, y, angle]).
const CDIFF = { vegetative: [92, 74, -22], sporulating: [130, 154, -22], spores: [[198, 96, -30], [214, 150, 15], [58, 194, 20], [196, 214, -10]] };

// Outline of a rod (half-length s, end radius r) swollen by a subterminal spore: the rod merged
// with an oval bulge [x, rx, ry]. Traced as the farther of the two boundaries along each ray.
function sporulatingRod(s = 40, r = 15, [bx, rx, ry] = [28, 21, 18]) {
  return smoothClosedPath(polarPoints(0, 0, a => {
    const c = Math.cos(a), sn = Math.abs(Math.sin(a));
    const flat = sn > 0 ? r / sn : Infinity;
    const rod = flat * Math.abs(c) <= s ? flat : s * Math.abs(c) + Math.sqrt(r * r - s * s * sn * sn);
    const A = (c / rx) ** 2 + (Math.sin(a) / ry) ** 2, B = -2 * bx * c / rx ** 2, D = B * B - 4 * A * (bx * bx / rx ** 2 - 1);
    return Math.max(rod, D > 0 ? (-B + Math.sqrt(D)) / (2 * A) : 0);
  }, 144));
}

// HIV conical capsid, narrow end to the left, centred near the origin.
const HIV_CAPSID = 'M-36 -10L26 -24A24 24 0 0 1 26 24L-36 10A10 10 0 0 1 -36 -10Z';

// Cryptococcus: [x, y, cell radius, capsule radius]; the second cell is a narrow-necked bud.
const CRYPTOCOCCUS_CELLS = [[110, 140, 44, 80], [152, 95, 20, 40], [200, 196, 18, 34]];

// Giardia trophozoite seen from the ventral side, anterior end up.
const GIARDIA = {
  body: 'M128 36C178 36 202 64 200 96C198 132 162 170 138 200Q128 212 118 200C94 170 58 132 56 96C54 64 78 36 128 36Z',
  disc: [128, 92, 52, 40],
  nuclei: [[106, 90], [150, 90]],
  medianBodies: [[114, 146, 25], [142, 146, -25]],
  // The free parts of the four pairs of flagella (left side; the right mirrors it), then the caudal pair.
  flagella: ['M61 118C46 128 48 146 30 158', 'M99 176C86 186 90 204 68 216', 'M111 192C104 206 110 220 100 234'],
  caudal: 'M124 206C120 216 124 226 118 238M132 206C136 216 132 226 138 238',
};

// Bacterial conjugation: donor above, recipient below, as rods [x, y, angle] (half-length s, end
// radius r) joined by a mating bridge from x = bridge on the donor's underside to x = -bridge on
// the recipient's upper side (local coordinates). Plasmids sit near the bridge, chromosomes away from it.
const CONJUGATION = { donor: [100, 82, -12], recipient: [156, 176, -12], s: 30, r: 27, bridge: 20, plasmid: [14, 4], chromosome: [-18, -2] };

// Canvas position of local point (u, v) on a shape placed at [x, y, angle in degrees].
const toGlobal = ([x, y, a], u, v) => {
  const t = a * Math.PI / 180;
  return [x + u * Math.cos(t) - v * Math.sin(t), y + u * Math.sin(t) + v * Math.cos(t)];
};

// Toll-like receptor dimer: centre of the left horseshoe ectodomain (the right mirrors it) and
// the arc it spans (degrees, clockwise from the right); its inner end leads down to the membrane.
const TLR = { centre: [84, 100], from: 160, to: 380 };

// C3b opsonisation: outline of a phagocyte whose two arms cup a bacterium at P. The round body
// (centre B, radius rb) meets arms that run round P between radii ri and ro, with rounded tips at
// ±tip degrees. The cup's inner face is the arc at radius ri.
const OPSONISATION = { B: [70, 128], rb: 58, P: [178, 128], ri: 50, ro: 68, tip: 45 };
function phagocyteCup({ B: [bx, by], rb, P: [px, py], ri, ro, tip } = OPSONISATION) {
  const at = (deg, r) => [px + r * Math.cos(deg * Math.PI / 180), py + r * Math.sin(deg * Math.PI / 180)].map(round).join(' ');
  // Where the arms' outer edges meet the body.
  const d = px - bx, a = (rb * rb - ro * ro + d * d) / (2 * d), h = Math.sqrt(rb * rb - a * a);
  const join = 180 - Math.atan2(h, d - a) * 180 / Math.PI, cap = (ro - ri) / 2;
  return `M${round(bx + a)} ${round(by + h)}A${rb} ${rb} 0 1 1 ${round(bx + a)} ${round(by - h)}` +
    `A${ro} ${ro} 0 0 1 ${at(360 - tip, ro)}A${cap} ${cap} 0 0 1 ${at(360 - tip, ri)}` +
    `A${ri} ${ri} 0 1 0 ${at(tip, ri)}A${cap} ${cap} 0 0 1 ${at(tip, ro)}A${ro} ${ro} 0 0 1 ${at(join, ro)}Z`;
}

// Points on a circular arc from a0 to a1 degrees (clockwise from the right), every step degrees.
function arcPoints(cx, cy, r, a0, a1, step = 5) {
  const count = Math.round(Math.abs(a1 - a0) / step);
  return Array.from({ length: count + 1 }, (_, i) => {
    const a = (a0 + (a1 - a0) * i / count) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
}

// Peptidoglycan: glycan strands (rows, y) of alternating NAG and NAM sugars (x), cross-linked
// by peptides between rows at every NAM. Cross-links are missing where the PBP is blocked.
const PEPTIDOGLYCAN = {
  rows: [76, 122, 168],
  sugars: Array.from({ length: 10 }, (_, i) => 34 + i * 21),
  pbp: [198, 210],
  blocked: (x, row) => row === 1 && x > 150,
};

// Conjugate vaccine: polysaccharide chains on a carrier protein centred at (128, 140):
// [direction in degrees, number of sugars], with sugars every 17 px from radius 64.
const CONJUGATE_CHAINS = [[-165, 3], [-122, 4], [-80, 4], [-38, 4], [-2, 3], [78, 3], [148, 3]];

// Peripheral IV cannula in local coordinates, catheter towards -x (drawn rotated).
const CANNULA = {
  catheter: 'M-34 -4L-106 -2.5Q-114 0 -106 2.5L-34 4Z',
  wing: 'M-30 -10L-26 -36Q-24 -44 -16 -44L-4 -44Q4 -44 4 -36L2 -10Z',
};

// PICC line: catheter, junction hub [x, y, angle] and two extension legs ending in connectors.
const PICC = {
  catheter: 'M114 142C92 164 50 158 44 192C38 226 98 236 140 220C176 206 200 214 222 230',
  hub: [124, 132, -45],
  legs: ['M130 122C138 100 150 78 160 58', 'M136 128C158 114 184 102 204 92'],
  connectors: [[164, 50, -64], [212, 88, -24]],
  clamps: [[146, 92, -64], [176, 108, -24]],
};

// Anopheles mosquito at rest, side view: head down, body and proboscis in one line at about 45°.
const MOSQUITO = {
  proboscis: [[96, 166], [38, 222]],
  palps: [[90, 156], [34, 210]],
  head: [104, 154, 13],
  antenna: [[98, 146], [66, 122]],
  thorax: [132, 126, 30, 23, -40],
  abdomen: { from: [150, 106], to: [222, 40], widths: [14, 5] },
  // The folded wing lies along the back, above the abdomen.
  wing: [176, 68, 56, 10, -42],
  // Legs from the thorax, each [hip, knee, ankle, foot]; the far-side legs are listed first.
  farLegs: [[[126, 142], [112, 190], [108, 214], [102, 236]], [[136, 142], [168, 180], [176, 208], [190, 232]], [[142, 136], [182, 126], [214, 132], [236, 116]]],
  nearLegs: [[[122, 140], [100, 186], [86, 212], [74, 236]], [[132, 142], [150, 186], [148, 214], [156, 236]], [[140, 140], [188, 146], [218, 176], [238, 168]]],
};

// Dense polyline through pts along an open Catmull–Rom curve.
function densify(pts, steps = 12) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(k => 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
        (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// Path data of a line-art SVG in tools/sources (a single filled path).
const lineArt = file => fs.readFileSync(path.join(__dirname, 'sources', file), 'utf8')
  .match(/\sd="([^"]+)"/)[1].replace(/\s+/g, ' ').trim();

// Split SVG path data into its subpaths, each rewritten in absolute coordinates so it can
// be drawn on its own. Handles M, L, H, V, C, S, Q and Z (upper or lower case).
function splitSubpaths(d) {
  const tokens = d.match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?|[a-zA-Z]/gi);
  const subpaths = [];
  let i = 0, cmd = 'M', cx = 0, cy = 0, sx = 0, sy = 0, cur = null;
  const num = () => parseFloat(tokens[i++]);
  const pair = rel => { const x = num(), y = num(); return rel ? [x + cx, y + cy] : [x, y]; };
  while (i < tokens.length) {
    if (/^[a-z]$/i.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    if (C === 'M') {
      [cx, cy] = pair(rel);
      [sx, sy] = [cx, cy];
      cur = [`M${round(cx)} ${round(cy)}`];
      subpaths.push(cur);
      cmd = rel ? 'l' : 'L'; // further pairs after a move are lines
    } else if (C === 'L') {
      [cx, cy] = pair(rel);
      cur.push(`L${round(cx)} ${round(cy)}`);
    } else if (C === 'H') {
      cx = num() + (rel ? cx : 0);
      cur.push(`L${round(cx)} ${round(cy)}`);
    } else if (C === 'V') {
      cy = num() + (rel ? cy : 0);
      cur.push(`L${round(cx)} ${round(cy)}`);
    } else if (C === 'C' || C === 'S' || C === 'Q') {
      const count = C === 'C' ? 3 : 2, pts = [];
      for (let k = 0; k < count; k++) pts.push(pair(rel));
      [cx, cy] = pts[pts.length - 1];
      cur.push(C + pts.map(p => p.map(round).join(' ')).join(' '));
    } else if (C === 'Z') {
      cur.push('Z');
      [cx, cy] = [sx, sy];
    } else {
      throw new Error(`Unsupported path command "${cmd}"`);
    }
  }
  return subpaths.map(s => s.join(''));
}

// Points every `spacing` px along a polyline, starting at its first point.
function resample(poly, spacing) {
  const out = [poly[0]];
  let carry = 0;
  for (let i = 1; i < poly.length; i++) {
    const [a, b] = [poly[i - 1], poly[i]], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let d = spacing - carry;
    for (; d <= len; d += spacing) out.push([a[0] + (b[0] - a[0]) * d / len, a[1] + (b[1] - a[1]) * d / len]);
    carry = len - (d - spacing);
  }
  return out;
}

// Organ geometry shared by the colour and single-colour drawings.
const ORGANS = {
  // Brain: line art supplied as an SVG (tools/sources/brain-line-art.svg), one filled path whose
  // first subpath is the outer edge. Its bounds (x 42.946–783.030, y 186.590–875.937, measured in a
  // browser) are fitted to the canvas with a 16 px margin.
  get brainArt() {
    const d = lineArt('brain-line-art.svg');
    return {
      d,
      silhouette: splitSubpaths(d)[0],
      transform: `translate(128 128) scale(${(224 / 740.084).toFixed(4)}) translate(-412.988 -531.264)`,
    };
  },
  // Heart: line art supplied as an SVG (tools/sources/heart-line-art.svg), one filled path. Its
  // subpaths are the outer edge, the enclosed regions between the lines (grouped below by
  // structure, numbered in path order) and ink details. Bounds (x 6.420–198.160,
  // y 13.129–284.604, measured in a browser) fitted to the canvas.
  get heartArt() {
    const d = lineArt('heart-line-art.svg');
    return {
      d,
      regions: splitSubpaths(d),
      transform: `translate(128 128) scale(${(224 / 271.475).toFixed(4)}) translate(-102.29 -148.866)`,
    };
  },
  heartRegions: {
    muscle: [1, 5, 7, 8, 10, 11, 12, 13, 14, 15, 16, 22, 24, 25, 26, 28, 29, 31, 32, 34, 35, 45, 53], // ventricles, between the vessels
    atria: [18, 30, 54], // right atrium, left auricle, and the gap under the arch
    aorta: [41],
    venous: [50, 6, 55], // superior and inferior venae cavae, right pulmonary artery
    pulmonaryVeins: [48, 39, 46, 37],
    // Coronary vessels. Region 2 also includes the pulmonary trunk and left pulmonary artery,
    // which are coloured separately (pulmonaryTrunk below).
    coronary: [2, 4, 9, 17, 20, 21, 23, 27, 36],
    trunk: 2,
  },
  // Short lines across the two coronary bands where they leave the base of the pulmonary trunk,
  // closing it off from them (drawing coordinates).
  pulmonaryTrunkBase: 'M86.6 124.2L90.8 125.8M131.6 135.5L137.4 134.8',
  // Everything in region 2 above those lines: the pulmonary trunk and left pulmonary artery.
  pulmonaryTrunk: 'M60 20L86.6 124.2L90.8 125.8L131.6 135.5L137.4 134.8L200 60L200 20Z',
  // Colon centreline: caecum, ascending, transverse (sagging), descending, sigmoid, rectum.
  colon: [[66, 206], [66, 170], [66, 128], [68, 90], [84, 68], [116, 80], [150, 80], [180, 60], [198, 74], [198, 120],
    [198, 168], [190, 194], [164, 204], [142, 196], [128, 208], [128, 230]],
  // Sacculations along the colon: [x, y, radius, direction of travel in degrees]. The caecum
  // is larger and the rectum narrower.
  colonSacs() {
    const pts = resample(densify(this.colon, 16), 18);
    return pts.map(([x, y], i) => {
      const [p, q] = [pts[Math.max(0, i - 1)], pts[Math.min(pts.length - 1, i + 1)]];
      return [x, y, i === 0 ? 21 : i >= pts.length - 2 ? 13 : 17, Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI];
    });
  },
  // Small-bowel loops packed inside the colon frame, ending at the caecum.
  smallIntestine() {
    const pts = [];
    [112, 131, 150, 169].forEach((y, row) => {
      const xs = row % 2 ? [164, 144, 124, 104] : [104, 124, 144, 164];
      xs.forEach((x, i) => pts.push([x, y + 2.5 * Math.sin(i * 1.7 + row)]));
      if (row < 3) pts.push([row % 2 ? 96 : 170, y + 9.5]);
    });
    pts.push([90, 186], [80, 198]);
    return densify(pts, 10);
  },
};

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

// Polygon points of a hexagon (a sugar ring) of radius r at (x, y), turned by deg.
const hexagon = (x, y, r, deg = 0) => Array.from({ length: 6 }, (_, k) => {
  const a = (k * 60 + deg) * Math.PI / 180;
  return `${round(x + r * Math.cos(a))},${round(y + r * Math.sin(a))}`;
}).join(' ');

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

// Calicivirus (norovirus) surface on the unit sphere: 32 cup-shaped depressions at the 5-fold
// (vertex) and 3-fold (face) axes, ringed by 90 arch-forming P-domain dimers at the 2-fold
// (edge) and quasi-2-fold (vertex–face) positions.
function calicivirusPoints() {
  const { vertices: V } = icosahedron();
  const close = (i, j) => Math.hypot(...vec.sub(V[i], V[j])) < 1.2;
  const mid = (...vs) => vec.unit([0, 1, 2].map(d => vs.reduce((sum, v) => sum + v[d], 0)));
  const edges = [], faces = [];
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
    if (!close(i, j)) continue;
    edges.push([i, j]);
    for (let k = j + 1; k < 12; k++) if (close(i, k) && close(j, k)) faces.push([i, j, k]);
  }
  const centres = faces.map(f => mid(...f.map(i => V[i])));
  return {
    cups: [...V, ...centres],
    dimers: [...edges.map(([i, j]) => mid(V[i], V[j])), ...faces.flatMap((f, k) => f.map(i => mid(V[i], centres[k])))],
  };
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
  pointsAlongBezier, densify, resample, splitSubpaths, ORGANS, STREP_CHAIN, BIOFILM_CELLS, lancetPath, beanPath, pipe, mirrorX, ellipseRadius, circlePath, vec, icosahedron, rng, svgDocument, writeIcon,
  SKIN_TONES, PSEUDOMONAS_CELLS, ENTEROCYTES, CDIFF, sporulatingRod, HIV_CAPSID, CRYPTOCOCCUS_CELLS, GIARDIA, CONJUGATION, toGlobal, TLR,
  OPSONISATION, phagocyteCup, arcPoints, hexagon, PEPTIDOGLYCAN, CONJUGATE_CHAINS, CANNULA, PICC, MOSQUITO, calicivirusPoints,
};
