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
  mycoplasma: '#E7A6C9',
  hbvEnvelope: '#F2B5A0',
  hbvCore: '#6FAE8E',
  worm: '#EFE8DA',
  mite: '#F2E6CF',
  arthropodLeg: '#A97B50',
  louse: '#C9A27A',
  tick: '#B5603A',
  scutum: '#4A3428',
  basophil: '#EDE6F2',
  basophilGranule: '#2F3A8F',
  allergen: '#8FBF4D',
  antigen: '#A8C8E8',
  nebuliserMask: '#BFE3D0',
  surgicalMask: '#9CC9E8',
  ocean: '#4A90C8',
  cardigan: '#E07A5F',
  metachromaticGranule: '#2F2A6B', // Albert's / Neisser stain
  poxMembrane: '#E3B98F',
  poxCore: '#7A6BC4',
  lateralBody: '#F2A541',
  flavivirus: '#C9D3E8',
  eDomainI: '#D9534F', // flavivirus E protein domains, in their usual colours
  eDomainII: '#F2C14E',
  eDomainIII: '#5B8FD9',
  parvovirus: '#E79AAE',
  rabiesEnvelope: '#B9C7E8',
  nucleocapsid: '#8E6CC9',
  sporangium: '#5C5048',
  columella: '#D8D2C8',
  schistosomeFemale: '#8A7464',
  trypanosome: '#A9C6EA', // Giemsa-stained cytoplasm
  kinetoplast: '#5A2A82',
  endothelium: '#F2B9A8',
  plasma: '#F6D5D2',
  nlrp3: '#5A8FD0',
  lrr: '#9CC6EE',
  asc: '#F2A541',
  caspase: '#C9465A',
  eardrum: '#D9D3E6',
  middleEar: '#DCEBF5',
  labyrinth: '#E9B3C2',
  nerve: '#F2D79A',
  sclera: '#F6F2EA',
  choroid: '#9A3E3A',
  retina: '#F0A27A',
  vitreous: '#EAF4F9',
  lens: '#F2E2A8',
  iris: '#7A5A3A',
  eyeMuscle: '#CF6A5E',
  placenta: '#B04A5A',
  chorionicPlate: '#D9A3B0',
  cordJelly: '#DCE8EE',
  edta: '#8E6CC9', // blood bottle caps
  serum: '#E0B33C',
  citrate: '#7FC1E8',
  heparin: '#4FA36A',
  blood: '#8E1B2A',
  gel: '#EDE6CF',
  microscope: '#E6ECF1',
  lamp: '#F7D774',
  purpura: '#7A1F3D',
  xrayFilm: '#16202B',
  schistosomeEgg: '#E6CF92',
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

// Haemophilus coccobacilli [x, y, angle, half-length]; end radius 10, each in its own capsule.
const HAEMOPHILUS_CELLS = [[78, 72, -20, 8], [150, 62, 30, 4], [200, 108, -50, 10], [110, 130, 15, 6], [60, 170, 40, 4], [166, 170, -15, 8], [110, 206, -30, 5]];

// Mycoplasma pneumoniae on ciliated respiratory epithelium. Cells [x, y, angle, scale] are
// flask-shaped with the tip organelle at local (0, 31); the first is attached at the surface.
const MYCOPLASMA = {
  flask: 'M0 -30C20 -30 26 -12 22 2C18 14 8 20 5 28L-5 28C-8 20 -18 14 -22 2C-26 -12 -20 -30 0 -30Z',
  cells: [[112, 137, 0, 1], [180, 86, 28, 1], [64, 80, -22, 0.85]],
  epithelium: ['M24 232L24 174Q24 168 30 168L128 168L128 232Z', 'M128 232L128 168L226 168Q232 168 232 174L232 232Z'],
  // Cilia (x positions) are left out round the attached cell.
  cilia: Array.from({ length: 20 }, (_, i) => 32 + i * 10).filter(x => Math.abs(x - 112) > 26),
};

// Pneumocystis: cysts [x, y, r], a collapsed cyst, and trophic forms [x, y, r].
const PNEUMOCYSTIS = {
  cysts: [[92, 90, 34], [170, 124, 30]],
  collapsed: [104, 186, 28],
  trophs: [[196, 62, 13], [150, 56, 10], [214, 184, 11], [50, 148, 11], [166, 206, 10], [54, 214, 9]],
};

// Outline of a worm along the centreline pts, with width w(t) at fraction t along it.
function wormOutline(pts, w) {
  const line = densify(pts, 12), n = line.length, left = [], right = [];
  line.forEach(([x, y], i) => {
    const [p, q] = [line[Math.max(0, i - 1)], line[Math.min(n - 1, i + 1)]], l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    const [nx, ny] = [-(q[1] - p[1]) / l, (q[0] - p[0]) / l], h = w(i / (n - 1)) / 2;
    left.push([x + nx * h, y + ny * h]);
    right.push([x - nx * h, y - ny * h]);
  });
  return smoothClosedPath([...left, ...right.reverse()]);
}

// Threadworms: a female with a long pointed tail and a smaller male with a curled tail, and eggs
// flattened on one side ([x, y, angle]); widths round off at the head.
const THREADWORM = {
  female: { pts: [[56, 44], [110, 58], [150, 92], [148, 140], [110, 170], [92, 206], [118, 232]],
    // The small bump behind the head is the pair of cephalic alae.
    width: t => 18 * Math.min(1, Math.sqrt(t / 0.05), (1 - t) / 0.4) + 3 * Math.exp(-(((t - 0.06) / 0.025) ** 2)) },
  male: { pts: [[170, 168], [198, 150], [224, 166], [220, 196], [198, 206], [184, 192], [194, 180]],
    width: t => 12 * Math.min(1, Math.sqrt(t / 0.05), 0.4 + (1 - t) / 0.25) },
  egg: 'M-17 -2C-14 -9 10 -10 16 -4C20 2 14 11 2 11C-10 11 -18 6 -17 -2Z',
  larva: 'M-9 3C-11 -4 -2 -6 5 -4C10 -2 10 4 5 5',
  eggs: [[192, 46, -15], [224, 76, 25], [200, 104, -5]],
};

// Scabies mite from above. Legs on the left (the right mirrors them): [hip, foot, kind], the
// front two pairs ending in stalked suckers, the hind two in long bristles.
const SCABIES = {
  body: [128, 142, 62, 54],
  gnathosoma: 'M114 92L112 78Q112 70 120 70L136 70Q144 70 144 78L142 92Z',
  legs: [[[84, 104], [64, 86], 'sucker'], [[72, 124], [48, 116], 'sucker'], [[88, 182], [76, 198], 'bristle'], [[104, 190], [98, 206], 'bristle']],
  ridges: [100, 112, 124],
  spines: [[110, 148], [128, 144], [146, 148], [118, 164], [138, 164], [102, 132], [154, 132]],
};

// Head louse from above, centred on x = 128, beside a hair carrying a nit. Legs on the left (the
// right mirrors them) run hip, knee, claw.
const HEAD_LOUSE = {
  head: [128, 58, 15, 17],
  antenna: [[118, 48], [108, 36], [104, 24], [96, 16]],
  thorax: [128, 92, 22, 15],
  abdomen: [128, 156, 40, 62],
  legs: [[[110, 86], [84, 78], [70, 96]], [[108, 94], [80, 104], [68, 126]], [[110, 102], [86, 128], [80, 154]]],
  hair: 'M216 18C210 80 222 160 214 238',
  nit: [216, 84, 9, 16, 4],
};

// Hard tick from above. Legs on the left (the right mirrors them) run hip to foot.
const TICK = {
  body: [128, 152, 50, 62],
  scutum: 'M98 98C98 84 112 80 128 80C144 80 158 84 158 98C158 120 146 138 128 142C110 138 98 120 98 98Z',
  legs: [[[90, 104], [62, 88], [48, 60], [44, 40]], [[84, 120], [54, 112], [36, 98], [24, 92]], [[84, 140], [52, 150], [34, 168], [26, 178]], [[90, 160], [62, 184], [50, 210], [44, 228]]],
};

// Immune synapse: outline of one of the two cells, its face flattened against the other at x = face.
// side = -1 for the cell on the left, 1 for the cell on the right; bumps add dendrites.
function synapseCell(cx, cy, R, face, side, bumps = []) {
  return smoothClosedPath(polarPoints(cx, cy, a => {
    const r = R + 2 * Math.sin(5 * a + 1) + bumps.reduce((s, [c, h, w]) => s + h * Math.exp(-(wrapAngle(a - c) ** 2) / (2 * w * w)), 0);
    const towards = -side * Math.cos(a);
    return towards > 0 ? Math.min(r, Math.abs(face - cx) / towards) : r;
  }, 140));
}

// Open hand, palm towards the viewer: palm, wrist, and fingers [base, tip] (the last is the thumb).
const HAND = {
  palm: 'M84 134C84 118 96 108 112 108L150 110C164 112 170 122 168 138L164 176C160 196 146 206 128 206C104 206 88 194 86 172Z',
  wrist: 'M100 196L156 196L158 238L98 238Z',
  fingers: [[[100, 122], [96, 50]], [[120, 116], [122, 36]], [[140, 118], [148, 46]], [[158, 128], [172, 72]], [[92, 162], [52, 118]]],
  bubbles: [[206, 84, 14], [214, 128, 10], [202, 162, 7], [52, 80, 12], [40, 196, 9], [64, 44, 7]],
};

// Points along the visible (front) parts of a globe's lines of latitude and longitude, as
// separate runs, for a globe of radius R at (cx, cy) tilted by tilt radians towards the viewer.
function graticule(cx, cy, R, tilt = 0.35, spin = 0.3) {
  const runs = [];
  const project = (lat, lon) => {
    const [x, y, z] = [Math.cos(lat) * Math.sin(lon + spin), Math.sin(lat), Math.cos(lat) * Math.cos(lon + spin)];
    const [y1, z1] = [y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)];
    return [cx + R * x, cy - R * y1, z1];
  };
  const trace = f => {
    let run = [];
    for (let k = 0; k <= 120; k++) {
      const [x, y, z] = f(k / 120);
      if (z > 0) run.push([x, y]); else { if (run.length > 1) runs.push(run); run = []; }
    }
    if (run.length > 1) runs.push(run);
  };
  for (let lon = 0; lon < 360; lon += 30) trace(t => project(-Math.PI / 2 + t * Math.PI, lon * Math.PI / 180));
  for (const lat of [-60, -30, 0, 30, 60]) trace(t => project(lat * Math.PI / 180, t * 2 * Math.PI));
  return runs;
}

// Icosahedral symmetry axes on the unit sphere: 5-fold (vertices), 3-fold (face centres, each with
// its three edge midpoints) and 2-fold (edge midpoints).
function icosahedralAxes() {
  const { vertices: V } = icosahedron();
  const close = (i, j) => Math.hypot(...vec.sub(V[i], V[j])) < 1.2;
  const mid = (...vs) => vec.unit([0, 1, 2].map(d => vs.reduce((sum, v) => sum + v[d], 0)));
  const two = [], three = [];
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
    if (!close(i, j)) continue;
    two.push(mid(V[i], V[j]));
    for (let k = j + 1; k < 12; k++) {
      if (close(i, k) && close(j, k)) three.push({ centre: mid(V[i], V[j], V[k]), edges: [[i, j], [j, k], [i, k]].map(([a, b]) => mid(V[a], V[b])) });
    }
  }
  return { five: V, three, two };
}

// Campylobacter: S-shaped cells [x, y, angle], each one sine wave (amplitude amp) over its length
// 2 * half, with a single flagellum leaving each pole along the cell's direction there.
const CAMPYLOBACTER = { cells: [[104, 68, -16], [158, 128, 12], [94, 198, -18]], half: 46, amp: 13, width: 15 };
function campylobacterCell({ half, amp } = CAMPYLOBACTER) {
  const body = Array.from({ length: 25 }, (_, i) => { const t = -half + i * half / 12; return [t, amp * Math.sin(Math.PI * t / half)]; });
  const slope = -amp * Math.PI / half, l = Math.hypot(1, slope);
  return { body, poles: [{ x: half, y: 0, nx: 1 / l, ny: slope / l }, { x: -half, y: 0, nx: -1 / l, ny: -slope / l }] };
}

// Clostridium tetani: slender rods (half-length s, end radius r) swollen at one end by a round
// terminal spore (centre x, radius R) into a drumstick; cells [x, y, angle], and a vegetative rod.
const TETANI = { s: 40, r: 10, spore: [46, 18], cells: [[96, 62, -24], [168, 112, 196], [66, 160, -12]], vegetative: [168, 206, -18] };
function drumstickPath({ s, r, spore: [cx, R] } = TETANI) {
  const xi = round(cx - Math.sqrt(R * R - r * r));
  return `M${-s} ${-r}L${xi} ${-r}A${R} ${R} 0 1 1 ${xi} ${r}L${-s} ${r}A${r} ${r} 0 0 1 ${-s} ${-r}Z`;
}

// Corynebacterium diphtheriae: club-shaped rods, narrow end at local -x, left joined at an angle
// after snapping division. Pairs are [junction x, y, angle of each arm]: each arm runs out from
// the junction, narrow end first. Metachromatic granules [x, r] sit at the poles.
const DIPHTHERIAE = {
  club: 'M-26 -7L26 -11A11 11 0 0 1 26 11L-26 7A7 7 0 0 1 -26 -7Z',
  pairs: [[54, 124, -76, -14], [198, 46, 168, 104], [118, 214, -60, -148], [222, 154, 196, 118]],
  singles: [[124, 126, -34]],
  granules: [[-24, 3.2], [27, 4.6]],
  get cells() {
    return [...this.pairs.flatMap(([x, y, ...arms]) => arms.map(a => {
      const t = a * Math.PI / 180;
      return [x + 36 * Math.cos(t), y + 36 * Math.sin(t), a];
    })), ...this.singles];
  },
};

// Mpox virion in section: a rounded brick (superellipse with semi-axes a, b and power p) with
// surface tubules round its edge, a dumbbell-shaped core, and a lateral body in each concavity.
const MPOX = {
  brick: [92, 68, 4],
  core: 'M-56 -30C-30 -30 -28 -14 0 -14C28 -14 30 -30 56 -30Q64 -30 64 -22L64 22Q64 30 56 30C30 30 28 14 0 14C-28 14 -30 30 -56 30Q-64 30 -64 22L-64 -22Q-64 -30 -56 -30Z',
  lateral: [0, 34, 30, 9],
  radius(t, inset = 0) { const [a, b, p] = this.brick; return ((Math.abs(Math.cos(t)) / (a - inset)) ** p + (Math.abs(Math.sin(t)) / (b - inset)) ** p) ** (-1 / p); },
};

// Flavivirus (dengue) surface: 30 rafts of three parallel E-protein dimers, one raft on each
// icosahedral 2-fold axis with its dimers along the edge, so the rafts form a herringbone.
// Each raft has its centre c (unit vector) and directions e1 (along the edge) and e2 (across).
function flavivirusRafts() {
  const { vertices: V } = icosahedron();
  const rafts = [];
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
    if (Math.hypot(...vec.sub(V[i], V[j])) > 1.2) continue;
    const c = vec.unit(V[i].map((x, d) => x + V[j][d])), e1 = vec.unit(vec.sub(V[j], V[i]));
    rafts.push({ c, e1, e2: vec.cross(c, e1) });
  }
  return rafts;
}
// Point (u, v) on a raft's tangent plane, pressed onto the unit sphere.
const onSphere = ({ c, e1, e2 }, u, v) => vec.unit([0, 1, 2].map(d => c[d] + u * e1[d] + v * e2[d]));

// Rabies virion: a bullet with a flat base at x = -base and a hemispherical tip (centre x = tip,
// radius r), and the number of glycoprotein spikes round its curved and long sides.
const RABIES = {
  base: 80, tip: 30, r: 32, spikes: 30,
  get perimeter() { return 2 * (this.base + this.tip) + Math.PI * this.r; },
  // Point and outward normal [x, y, nx, ny] at distance d round the outline, from the base along the top.
  along(d) {
    const { base, tip, r } = this, L = base + tip, arc = Math.PI * r;
    if (d < L) return [-base + d, -r, 0, -1];
    if (d < L + arc) { const a = -Math.PI / 2 + (d - L) / r; return [tip + r * Math.cos(a), r * Math.sin(a), Math.cos(a), Math.sin(a)]; }
    return [tip - (d - L - arc), r, 0, 1];
  },
};
const bulletPath = ({ base, tip, r } = RABIES, inset = 0) => {
  const h = r - inset;
  return `M${-base + inset} ${-h}L${tip} ${-h}A${h} ${h} 0 0 1 ${tip} ${h}L${-base + inset} ${h}Z`;
};

// Rhizopus: a broad, ribbon-like stolon anchored by rhizoids at a node, from which sporangiophores
// rise: one with an intact sporangium, one burst open to show its columella, and a young one.
const RHIZOPUS = {
  stolon: [[20, 214], [60, 206], [102, 212], [146, 206], [190, 212], [236, 202]],
  // Broad hyphae of uneven width.
  width: t => (16 + 3 * Math.sin(9 * t + 1)) * Math.min(1, Math.sqrt(Math.min(t, 1 - t) / 0.03)),
  septum: 0.8,
  rhizoids: ['M98 218C94 226 86 230 80 238', 'M104 220C104 228 106 232 104 238', 'M110 218C116 224 124 228 130 236', 'M88 228L80 228', 'M116 226L120 232'],
  stalks: ['M100 206C98 172 96 136 92 102', 'M108 206C118 174 160 166 168 124', 'M96 208C82 194 68 176 60 154'],
  sporangium: [92, 66, 36],
  columella: [168, 108],
  young: [56, 140, 14],
  spores: [[148, 70, 4], [192, 80, 4], [180, 58, 3.5], [156, 46, 3.5], [206, 104, 3.5], [212, 62, 3], [140, 96, 3]],
};

// Schistosoma: the male (centreline from his anterior end, with oral and ventral suckers) holding
// the slender female in his gynaecophoric canal; her ends protrude from it. An egg with a lateral
// spine (S. mansoni) holds a miracidium.
const SCHISTOSOMA = {
  male: [[44, 72], [80, 54], [120, 60], [148, 90], [156, 132], [168, 172], [196, 194], [222, 198]],
  maleWidth: t => 26 * Math.min(1, Math.sqrt(t / 0.05), 0.3 + (1 - t) / 0.15),
  // She follows his centreline from his third point on, leaving the canal at both ends.
  get female() { return [[84, 102], [100, 78], ...this.male.slice(2), [238, 208]]; },
  femaleWidth: t => 10 * Math.min(1, Math.sqrt(t / 0.04), 0.3 + (1 - t) / 0.1),
  // The canal holds the female between these fractions of her length.
  canal: [0.25, 0.875],
  // The oral sucker opens at his anterior tip; the ventral sucker stands out from his underside.
  oralSucker: [47, 71, 4, 6.5, -62],
  ventralSucker: [80, 69, 6.5],
  egg: [72, 198, 32, 16, -12],
};

// Trypanosome (trypomastigote) in blood: a slender body, posterior end to the left, with its
// flagellum running from the kinetoplast along an undulating membrane and free beyond the
// anterior tip. Red cells [x, y, r].
const TRYPANOSOMA = {
  body: [[30, 150], [62, 118], [108, 98], [158, 100], [198, 122], [218, 150]],
  width: t => 22 * Math.min(1, Math.sqrt(t / 0.06)) * Math.min(1, (1 - t) / 0.45),
  kinetoplast: 0.1,
  nucleus: 0.48,
  redCells: [[64, 204, 28], [196, 52, 24], [190, 212, 22]],
};
// Points along the trypanosome: its centreline, normals pointing to the membrane (convex) side,
// the body outline, and the flagellum (membrane edge, then free) as one run of points.
function trypanosomeParts({ body, width, kinetoplast } = TRYPANOSOMA) {
  const line = densify(body, 14), N = line.length;
  const at = i => {
    const [p, q] = [line[Math.max(0, i - 1)], line[Math.min(N - 1, i + 1)]], l = Math.hypot(q[0] - p[0], q[1] - p[1]);
    return { x: line[i][0], y: line[i][1], nx: (q[1] - p[1]) / l, ny: -(q[0] - p[0]) / l, tx: (q[0] - p[0]) / l, ty: (q[1] - p[1]) / l };
  };
  const flagellum = [];
  for (let i = Math.round(kinetoplast * (N - 1)); i < N; i++) {
    const t = i / (N - 1), p = at(i), envelope = Math.min(1, (t - kinetoplast) / 0.08, (1 - t) / 0.12);
    const d = width(t) / 2 + envelope * (4 + 6 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 5.5 * t)));
    flagellum.push([p.x + p.nx * d, p.y + p.ny * d]);
  }
  const tip = at(N - 1);
  for (let s = 4; s <= 30; s += 4) flagellum.push([tip.x + tip.tx * s - tip.nx * 3 * Math.sin(s / 5), tip.y + tip.ty * s - tip.ny * 3 * Math.sin(s / 5)]);
  return { at, N, outline: wormOutline(body, width), flagellum };
}

// Neutrophil leaving a venule: the lumen above the endothelium (cells between junctions at x),
// a neutrophil rolling, one squeezing through the junction at x = 128, and one crawling through
// the tissue towards bacteria.
const DIAPEDESIS = {
  lumen: [16, 18, 224, 104],
  endothelium: [122, 138],
  junctions: [16, 70, 128, 186, 240],
  rolling: [52, 92, 26],
  through: { x: 128, top: [96, 22], bottom: [166, 20], neck: 6 },
  crawling: [188, 196],
  bacteria: [[224, 226, 30], [212, 214, -40], [232, 206, 70]],
  redCells: [[176, 58, 22, 11, -10], [210, 88, 18, 9, 20]],
};
// Outline of the neutrophil squeezing through a junction: two lobes joined by a narrow neck.
function hourglassPath({ x, top: [ty, tr], bottom: [by, br], neck } = DIAPEDESIS.through) {
  const yt = ty + Math.sqrt(tr * tr - neck * neck), yb = by - Math.sqrt(br * br - neck * neck);
  return `M${x - neck} ${round(yt)}A${tr} ${tr} 0 1 1 ${x + neck} ${round(yt)}L${x + neck} ${round(yb)}A${br} ${br} 0 1 1 ${x - neck} ${round(yb)}Z`;
}
// A crawling neutrophil: a broad leading edge (lamellipodium) towards dir (radians) and a tail.
const crawlingCell = (cx, cy, dir, R = 26) => smoothClosedPath(polarPoints(cx, cy, a => {
  const d = wrapAngle(a - dir);
  return R + 9 * Math.exp(-(d * d) / 0.5) - 6 * Math.exp(-((Math.abs(d) - 1.6) ** 2) / 0.2) + 7 * Math.exp(-((Math.abs(d) - Math.PI) ** 2) / 0.08) + 1.5 * Math.sin(7 * a);
}, 120));

// NLRP3 inflammasome seen from above: a wheel of NLRP3 subunits (NACHT domains inside, LRR
// domains outside) round a central hub, from which an ASC filament recruits caspase-1, which
// releases IL-1β.
const INFLAMMASOME = {
  centre: [94, 96], count: 10, nacht: 30, lrr: 54,
  filament: { angle: 54, from: 18, to: 104, step: 12 },
  caspase: [168, 190, 54],
  il1b: [[214, 166, 10], [200, 224, -30], [232, 210, 40]],
};

// Ear in section: pinna and external canal (to the eardrum), the air-filled middle ear with the
// ossicles and the Eustachian tube, and the inner ear (vestibule, semicircular canals, cochlea).
const EAR = {
  outer: 'M124 114L84 112C76 112 72 108 70 100C66 82 66 60 56 44C48 30 34 28 26 40C16 56 14 86 16 116C18 146 22 172 30 190C36 204 48 208 56 198C62 188 64 168 70 156C72 148 76 144 84 144L124 142Z',
  canal: 'M124 121L88 119C80 119 74 123 70 128C74 133 80 137 88 137L124 135Z',
  antihelix: 'M54 58C42 72 38 102 42 132C44 150 48 166 54 176',
  eardrum: [127, 128, 3.5, 21, -8],
  cavity: 'M130 106C130 92 136 82 148 80C160 78 170 84 172 98C174 112 172 132 168 146C164 156 158 164 150 168L140 164C134 156 130 142 130 128Z',
  tube: 'M148 160C160 186 176 206 200 226',
  helix: 'M56 52C52 42 44 40 38 48C31 62 28 96 30 132C32 156 36 172 42 184',
  // Malleus: head in the attic, its handle down the eardrum to the umbo. Incus: body beside the
  // malleus head, short process back, long process down to the stapes. Stapes: two crura and a
  // footplate in the oval window.
  malleus: 'M134 82C140 80 145 84 144 91C143 97 139 100 136 103L132 133Q130 136 128 133L130 102C127 97 127 85 134 82Z',
  incus: 'M146 86C150 81 158 81 162 85L170 90L162 95C159 99 157 104 157 110L158 120Q159 126 155 126Q152 125 152 120L151 108C149 102 145 98 145 93Z',
  stapes: 'M158 123C162 117 166 116 169 117M158 123C162 129 166 130 169 129M170 115L170 131',
  vestibule: [182, 124, 11, 14],
  canals: [[188, 82, 13, 25, -12], [212, 102, 22, 11, 38], [168, 104, 15, 7, -18]],
  cochlea: [204, 156, 22],
  nerve: 'M200 128C214 126 226 120 238 116',
};
// Points of the cochlear spiral: about 2.6 turns inwards from its base at the vestibule.
const cochleaPoints = ([cx, cy, R] = EAR.cochlea) => Array.from({ length: 80 }, (_, i) => {
  const t = i / 79, a = -2.4 + t * 2.6 * 2 * Math.PI, r = R * (1 - 0.78 * t);
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});

// Eye in section, front to the left: the globe (sclera, meeting the cornea at the limbus), lens,
// iris, ciliary body, and the optic nerve and two rectus muscles running back to the orbital apex.
const EYE = {
  centre: [132, 128], R: 74,
  limbus: 146.9, // degrees from the back of the globe
  cornea: [100.8, 128, 50.8],
  lens: [90, 128, 11, 26],
  iris: [[76, 88, 82, 116], [76, 140, 82, 168]], // x0, y0, x1, y1 of each half
  ciliary: [[80, 86, -40], [80, 170, 40]],
  muscles: ['M104 60C136 42 192 60 238 112', 'M104 196C136 214 192 196 238 144'],
  nerve: [200, 128, 240, 12],
};
// Outline of the globe: the sclera round the back, the cornea at the front.
function eyeGlobePath({ centre: [cx, cy], R, limbus, cornea: [kx, , kr] } = EYE) {
  const t = limbus * Math.PI / 180, [x, y] = [cx + R * Math.cos(t), R * Math.sin(t)];
  return `M${round(x)} ${round(cy - y)}A${R} ${R} 0 1 1 ${round(x)} ${round(cy + y)}A${kr} ${kr} 0 0 1 ${round(x)} ${round(cy - y)}Z`;
}

// Placenta, fetal surface up: the disc (ellipse, with its thickness showing at the front), the
// cord rising from its insertion, and the chorionic vessels branching from it ([angle, reach]).
const PLACENTA = {
  disc: [118, 164, 100, 58], depth: 14,
  insertion: [124, 154],
  cord: [[124, 154], [128, 122], [146, 86], [180, 62], [212, 46]],
  cordWidth: 28,
  vessels: [[-160, 0.85], [-118, 0.8], [-62, 0.82], [-14, 0.86], [30, 0.84], [92, 0.8], [150, 0.86]],
};
// A branching chorionic vessel along direction deg reaching fraction reach of the disc's radius;
// offset shifts it sideways so artery and vein run side by side.
function placentaVessel(deg, reach, offset = 0, { disc: [cx, cy, rx, ry], insertion: [ix, iy] } = PLACENTA) {
  const t = deg * Math.PI / 180, [ux, uy] = [Math.cos(t), Math.sin(t)];
  const p = f => [ix + (cx - ix + rx * ux) * f - uy * offset * ry / rx, iy + (cy - iy + ry * uy) * f + ux * offset];
  const [a, b, c] = [p(0.08), p(0.5 * reach), p(reach)];
  const fork = s => { const u = t + s * 0.5; return [b[0] + (c[0] - b[0]) * 0.6 + Math.cos(u) * rx * 0.2, b[1] + (c[1] - b[1]) * 0.6 + Math.sin(u) * ry * 0.2]; };
  return `M${round(a[0])} ${round(a[1])}Q${round((a[0] + b[0]) / 2 + uy * 6)} ${round((a[1] + b[1]) / 2 - ux * 4)} ${round(b[0])} ${round(b[1])}` +
    `L${round(c[0])} ${round(c[1])}M${round(b[0])} ${round(b[1])}L${round(fork(1)[0])} ${round(fork(1)[1])}`;
}

// Monoclonal antibody: a pre-filled syringe (local coordinates, needle towards +x, drawn rotated)
// and a large antibody beside it.
const MAB_SYRINGE = { at: [158, 150, -45], barrel: [-50, 40, 15], plunger: -104, needle: 92 };

// Nasal-spray vaccine applicator (local coordinates, nozzle up, drawn tilted), its spray plume and
// the live attenuated influenza virions in it.
const NASAL_SPRAY = {
  at: [170, 172, -42, 0.85],
  nozzle: 'M-7 -100L-5 -112Q0 -118 5 -112L7 -100L13 -64L-13 -64Z',
  barrel: [-15, -64, 30, 92],
  clip: [-19, 34, 38, 12],
  plunger: [-5, 46, 10, 30],
  thumb: [-22, 76, 44, 9],
  // The plume spreads spread degrees either side of the nozzle's axis and reaches reach px from its
  // tip; virions are [distance, degrees off the axis, radius].
  plume: { spread: 24, reach: 104 },
  // Canvas point d px from the nozzle tip, deg degrees off the nozzle's axis.
  from(d, deg) {
    const [x, y, a, s] = this.at, t = a * Math.PI / 180, axis = Math.atan2(-Math.cos(t), Math.sin(t)) + deg * Math.PI / 180;
    return [x + Math.sin(t) * 118 * s + d * Math.cos(axis), y - Math.cos(t) * 118 * s + d * Math.sin(axis)];
  },
  virions: [[46, -6, 8], [72, 11, 7], [84, -12, 6.5], [28, 9, 5.5]],
};

// CAR T cell (left) binding a target cell (right). CAR directions in degrees round the T cell; the
// ones facing the target engage its CD19.
const CAR_T = { cell: [110, 112, 62], target: [206, 194, 32], cars: [-140, -95, -50, -5, 40, 85, 130, 175, 220], engaged: 40 };

// Blood bottles: adult tubes [x, cap colour] and paediatric microtubes [x, cap colour].
const BLOOD_BOTTLES = { adult: [[42, 'edta'], [80, 'serum'], [118, 'citrate'], [156, 'heparin']], paediatric: [[194, 'edta'], [224, 'serum']] };

// Compound microscope from the side, the user to the left: base with lamp, arm with focus knob,
// stage with a slide, objectives on the nosepiece, and the head with an eyepiece.
const MICROSCOPE = {
  base: 'M48 224Q48 208 64 208L200 208Q216 208 216 224L216 226Q216 234 208 234L56 234Q48 234 48 226Z',
  arm: 'M80 208C66 178 64 136 78 108C86 92 98 80 112 72L132 94C120 102 110 114 106 130C100 154 104 182 114 208Z',
  head: 'M106 56L172 52Q182 52 182 62L182 84Q182 94 172 94L118 96Q108 96 106 86Z',
  eyepiece: 'M120 60L92 24',
  nosepiece: 'M134 96L182 96L176 108L140 108Z',
  objectives: ['M148 108L144 128', 'M160 108L160 134', 'M172 108L176 126'],
  stage: [102, 138, 116, 10],
  slide: [130, 133, 64, 5],
  condenser: [146, 148, 28, 10],
  lamp: [160, 208, 13],
  knob: [92, 172, 15],
};

// Glass test: a tumbler pressed onto skin, seen from slightly above; the skin under its base is
// blanched by the pressure but the purpura stays visible. Spots [x, y, r].
const GLASS_TEST = {
  skin: 'M16 110C60 88 196 88 240 110L240 232Q240 240 232 240L24 240Q16 240 16 232Z',
  skinEdge: 'M16 110C60 88 196 88 240 110',
  base: [128, 186, 54, 17],
  rim: [128, 56, 70, 22],
  spots: [[100, 186, 4], [126, 178, 3], [150, 192, 5], [118, 198, 3], [142, 176, 2.5], [86, 194, 2.5], [160, 182, 3], [128, 190, 7],
    [40, 166, 4], [56, 204, 3], [36, 122, 3], [214, 118, 3.5], [226, 134, 2.5], [44, 140, 2.5], [204, 160, 5], [222, 196, 3.5], [196, 222, 3], [64, 228, 4], [30, 214, 3], [218, 144, 2.5], [184, 210, 2.5], [76, 160, 2.5]],
};

// Chest X-ray (PA view): the film, the lung fields (the patient's right on the viewer's left, its
// diaphragm higher), the heart shadow bulging to the viewer's right, and the ribs.
const CHEST_XRAY = {
  film: [24, 18, 208, 220, 12],
  torso: 'M100 18L100 44C78 48 54 54 44 72C34 96 32 150 34 238L222 238C224 150 222 96 212 72C202 54 178 48 156 44L156 18Z',
  rightLung: 'M84 66C70 72 58 100 54 136C50 166 48 186 50 200C66 194 90 186 112 188C116 160 116 112 112 82C106 70 96 64 84 66Z',
  leftLung: 'M172 66C186 72 198 100 202 136C206 166 208 190 206 204C196 202 186 200 180 198C176 176 160 150 144 132C142 112 142 92 146 80C152 70 162 64 172 66Z',
  // Posterior ribs on the viewer's left (the right mirrors them): [y at the spine, drop to the side].
  ribs: [[60, 18], [76, 20], [92, 22], [108, 24], [124, 26], [140, 28], [156, 30], [172, 30]],
  clavicle: 'M118 66C104 62 92 58 80 60C70 62 62 60 52 54',
  gastricBubble: [178, 214, 12, 7],
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
    const d = lineArt('brain-line-art.svg'), scale = 224 / 740.084;
    return {
      d,
      scale,
      silhouette: splitSubpaths(d)[0],
      transform: `translate(128 128) scale(${scale.toFixed(4)}) translate(-412.988 -531.264)`,
    };
  },
  // Heart: line art supplied as an SVG (tools/sources/heart-line-art.svg), one filled path. Its
  // subpaths are the outer edge, the enclosed regions between the lines (grouped below by
  // structure, numbered in path order) and ink details. Bounds (x 6.420–198.160,
  // y 13.129–284.604, measured in a browser) fitted to the canvas.
  get heartArt() {
    const d = lineArt('heart-line-art.svg'), scale = 224 / 271.475;
    return {
      d,
      scale,
      regions: splitSubpaths(d),
      transform: `translate(128 128) scale(${scale.toFixed(4)}) translate(-102.29 -148.866)`,
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
  OPSONISATION, phagocyteCup, arcPoints, hexagon, HAEMOPHILUS_CELLS, MYCOPLASMA, PNEUMOCYSTIS, wormOutline, THREADWORM,
  SCABIES, HEAD_LOUSE, TICK, synapseCell, HAND, graticule, PEPTIDOGLYCAN, CONJUGATE_CHAINS, CANNULA, PICC, MOSQUITO, calicivirusPoints,
  CAMPYLOBACTER, campylobacterCell, TETANI, drumstickPath, DIPHTHERIAE, MPOX, flavivirusRafts, onSphere, RABIES, bulletPath, RHIZOPUS,
  SCHISTOSOMA, TRYPANOSOMA, trypanosomeParts, DIAPEDESIS, hourglassPath, crawlingCell, INFLAMMASOME, EAR, cochleaPoints, EYE, eyeGlobePath,
  PLACENTA, placentaVessel, MAB_SYRINGE, NASAL_SPRAY, CAR_T, BLOOD_BOTTLES, GLASS_TEST, CHEST_XRAY, MICROSCOPE, icosahedralAxes,
};
