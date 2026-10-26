'use strict';

// Draws the simplified single-colour version of each icon into the
// "monoFile" named in catalogue.json. Every mark uses INK, which the
// gallery swaps for the colour a user picks.
// Run: node tools/draw-mono-icons.js

const fs = require('fs');
const path = require('path');
const K = require('./svg-kit');
const { INK, round: n } = K;

const ROOT = path.join(__dirname, '..');

const LINE = 10; // outlines of cells, organisms and objects
const THIN = 6; // flagella, stalks, tubing and inner detail

const solid = `fill="${INK}"`;
const line = w => `fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

// ---------------------------------------------------------------- bacteria

function staphylococcus() {
  const cocci = [[100, 62], [156, 58], [70, 110], [126, 112], [182, 108], [98, 162], [154, 164], [210, 160], [126, 212]];
  return cocci.map(([x, y]) => `<circle cx="${x - 12}" cy="${y - 7}" r="24" ${solid}/>`);
}

function escherichiaColi() {
  const s = 42, r = 32;
  const flagella = [0.06, 0.17, 0.37, 0.56, 0.67, 0.87].map((u, i) =>
    `<path d="${K.smoothOpenPath(K.wavePoints(K.stadiumPoint(u, s, r), (i % 2 ? 1 : -1) * 0.3, { length: 48, amplitude: 6, wavelength: 20, phase: i }))}" ${line(THIN)}/>`);
  return [
    `<g transform="translate(128 128) rotate(-28)">`,
    ...flagella,
    `<rect x="${-(s + r)}" y="${-r}" width="${2 * (s + r)}" height="${2 * r}" rx="${r}" ${solid}/>`,
    `</g>`,
  ];
}

// ----------------------------------------------------------------- viruses

function sarsCov2() {
  const R = 56;
  const head = y => `M-9 ${y + 8}C-14 ${y - 2} -13 ${y - 10} -7 ${y - 12}C-4 ${y - 15} 4 ${y - 15} 7 ${y - 12}` +
    `C13 ${y - 10} 14 ${y - 2} 9 ${y + 8}Z`;
  const spikes = Array.from({ length: 10 }, (_, i) =>
    `<g transform="rotate(${i * 36 + 4})"><line x1="0" y1="${-(R + 2)}" x2="0" y2="${-(R + 21)}" ${line(THIN)}/>` +
    `<path d="${head(-(R + 29))}" ${solid}/></g>`);
  const faceOn = [[-20, -18], [20, -22], [0, 14], [-28, 22], [28, 18]];
  return [
    `<g transform="translate(128 128)">`,
    ...spikes,
    `<circle r="${R}" ${line(LINE)}/>`,
    ...faceOn.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" ${solid}/>`),
    `</g>`,
  ];
}

function adenovirus() {
  const S = 64;
  const { vertices: V, visibleFaces } = K.icosahedron();
  const P = v => [128 + S * v[0], 128 - S * v[1]];
  // Edges shared by two visible faces are inner edges; the rest form the silhouette.
  const edges = new Map();
  for (const f of visibleFaces) {
    for (const [a, b] of [[0, 1], [1, 2], [0, 2]]) {
      const key = [f.idx[a], f.idx[b]].sort((x, y) => x - y).join('-');
      edges.set(key, (edges.get(key) || 0) + 1);
    }
  }
  const edgeLine = (key, w) => {
    const [a, b] = key.split('-').map(i => P(V[i]));
    return `<line x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}" ${line(w)}/>`;
  };
  const rim = [...edges].filter(([, c]) => c === 1).map(([k]) => k);
  const inner = [...edges].filter(([, c]) => c === 2).map(([k]) => k);
  const rimVertices = new Set(rim.flatMap(k => k.split('-').map(Number)));
  const innerVertices = [...new Set(inner.flatMap(k => k.split('-').map(Number)))].filter(i => !rimVertices.has(i));
  const fibres = [...rimVertices].map(i => {
    const [a, b] = [P(V[i]), P(V[i].map(c => c * 1.48))];
    return `<line x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}" ${line(THIN)}/>` +
      `<circle cx="${n(b[0])}" cy="${n(b[1])}" r="9" ${solid}/>`;
  });
  return [
    ...fibres,
    ...inner.map(k => edgeLine(k, 5)),
    ...rim.map(k => edgeLine(k, LINE)),
    ...innerVertices.map(i => { const [x, y] = P(V[i]); return `<circle cx="${n(x)}" cy="${n(y)}" r="7" ${solid}/>`; }),
  ];
}

// ------------------------------------------------------------------- fungi

function candida() {
  const cell = (tx, ty, rot, rx, ry, inside) =>
    `<g transform="translate(${tx} ${ty}) rotate(${rot})"><ellipse rx="${rx}" ry="${ry}" ${line(LINE)}/>${inside}</g>`;
  const mother = `<circle cx="-26" cy="-14" r="14" ${solid}/>` +
    `<ellipse cx="18" cy="8" rx="22" ry="18" ${line(THIN)}/>` +
    `<circle cx="-38" cy="30" r="6" ${line(5)}/>`;
  const bud = `<ellipse cx="2" cy="2" rx="11" ry="9" ${line(5)}/>`;
  // The bud sits just touching the mother so the two outlines merge at the neck.
  return [cell(100, 144, -15, 68, 56, mother), cell(192, 86, -35, 36, 29, bud)];
}

// ------------------------------------------------------------ immune cells

function neutrophil() {
  const membrane = K.polarPoints(128, 128, a => 90 + 3 * Math.sin(5 * a + 0.4) + 2 * Math.sin(9 * a + 1.3));
  const lobes = [[92, 118, 27, 21, -25], [128, 90, 26, 20, 10], [168, 112, 25, 21, 45], [154, 158, 27, 20, -15]];
  const rand = K.rng(11), granules = [];
  for (let tries = 0; granules.length < 18 && tries < 5000; tries++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 74;
    const x = 128 + d * Math.cos(a), y = 128 + d * Math.sin(a);
    if (lobes.every(([lx, ly]) => Math.hypot(x - lx, y - ly) > 36) &&
      granules.every(([gx, gy]) => Math.hypot(x - gx, y - gy) > 15)) granules.push([x, y]);
  }
  return [
    `<path d="${K.smoothClosedPath(membrane)}" ${line(LINE)}/>`,
    `<path d="${K.smoothOpenPath(lobes.map(([x, y]) => [x, y]))}" ${line(10)}/>`,
    ...lobes.map(([x, y, rx, ry, rot]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" ${solid}/>`),
    ...granules.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="3.5" ${solid}/>`),
  ];
}

function macrophage() {
  const pods = [[0.3, 31, 0.22], [1.5, 36, 0.2], [2.6, 27, 0.25], [3.7, 34, 0.2], [5.0, 29, 0.22]];
  const membrane = K.polarPoints(128, 130, a => 68 + 3 * Math.sin(7 * a) +
    pods.reduce((sum, [c, h, w]) => sum + h * Math.exp(-(K.wrapAngle(a - c) ** 2) / (2 * w * w)), 0), 96);
  const kidney = K.polarPoints(0, 0, a => 28 - 10 * Math.exp(-(K.wrapAngle(a + 0.9) ** 2) / (2 * 0.32 ** 2)), 60)
    .map(([x, y]) => [100 + 1.2 * x, 136 + y]);
  return [
    `<path d="${K.smoothClosedPath(membrane)}" ${line(LINE)}/>`,
    `<path d="${K.smoothClosedPath(kidney)}" ${solid}/>`,
    `<circle cx="164" cy="112" r="19" ${line(5)}/>`,
    `<rect x="-9" y="-4.5" width="18" height="9" rx="4.5" transform="translate(164 112) rotate(30)" ${solid}/>`,
    `<circle cx="150" cy="170" r="13" ${line(5)}/>`,
    ...[[146, 171], [155, 167]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" ${solid}/>`),
    ...[[130, 96], [90, 100], [186, 150], [82, 168], [118, 172]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" ${solid}/>`),
  ];
}

function tCell() {
  const R = 72, cx = 128, cy = 128;
  const receptors = Array.from({ length: 12 }, (_, i) =>
    `<g transform="rotate(${i * 30 + 15} ${cx} ${cy})">` +
    [-5, 5].map(dx => `<line x1="${cx + dx}" y1="${cy - R - 4}" x2="${cx + dx}" y2="${cy - R - 20}" ${line(5)}/>`).join('') + `</g>`);
  return [
    ...receptors,
    `<circle cx="${cx}" cy="${cy}" r="${R}" ${line(LINE)}/>`,
    `<path d="${K.smoothClosedPath(K.polarPoints(cx - 6, cy - 6, a => 50 + 2 * Math.sin(4 * a + 1)))}" ${solid}/>`,
  ];
}

// --------------------------------------------------------------- molecules

function iggAntibody() {
  const hx = 128, hy = 112, deg = 48, angle = deg * Math.PI / 180;
  const domain = ([x, y], rot) =>
    `<ellipse cx="${n(x)}" cy="${n(y)}" rx="10" ry="16" transform="rotate(${rot} ${n(x)} ${n(y)})" ${solid}/>`;
  const out = [];
  for (const side of [-1, 1]) {
    const u = [side * Math.sin(angle), -Math.cos(angle)];
    const o = [side * Math.cos(angle), Math.sin(angle)];
    const at = (d, off) => [hx + u[0] * d + o[0] * off, hy + u[1] * d + o[1] * off];
    const [x0, y0] = at(25, -13), x1 = hx + side * 14, y1 = hy + 15;
    out.push(`<path d="M${n(x0)} ${n(y0)}C${n(x0)} ${n(y0 + 14)} ${x1} ${y1 - 14} ${x1} ${y1}" ${line(THIN)}/>`);
    out.push(...[at(44, -13), at(84, -13), at(44, 13), at(84, 13)].map(p => domain(p, side * deg)));
    out.push(domain([x1, hy + 34], 0), domain([x1, hy + 76], 0));
  }
  out.push(...[hy - 12, hy - 4].map(y => `<line x1="118" y1="${y}" x2="138" y2="${y}" ${line(4)}/>`));
  // Enlarged slightly: the domains read better at small sizes.
  return [`<g transform="translate(128 126) scale(1.12) translate(-128 -126)">`, ...out, `</g>`];
}

// --------------------------------------------------------------- treatment

function antibioticCapsule() {
  return [
    `<g transform="translate(128 128) rotate(-35)">`,
    `<path d="M0 -32L-58 -32A32 32 0 0 0 -58 32L0 32Z" ${solid}/>`,
    `<rect x="-90" y="-32" width="180" height="64" rx="32" ${line(LINE)}/>`,
    `<line x1="22" y1="-14" x2="58" y2="-14" ${line(THIN)}/>`,
    `</g>`,
  ];
}

function ivBag() {
  const bag = 'M76 48Q76 30 94 30L162 30Q180 30 180 48L180 166Q180 186 160 192L140 198L116 198L96 192Q76 186 76 166Z';
  const fluid = 'M90 92L166 92L166 162Q166 176 152 180L136 184L120 184L104 180Q90 176 90 162Z';
  return [
    `<rect x="112" y="10" width="32" height="22" rx="6" ${line(THIN)}/>`,
    `<line x1="122" y1="20" x2="134" y2="20" ${line(5)}/>`,
    `<path d="${bag}" ${line(LINE)}/>`,
    `<path d="${fluid}" ${solid}/>`,
    `<rect x="117" y="202" width="9" height="11" ${solid}/>`,
    `<rect x="131" y="202" width="9" height="8" ${solid}/>`,
    `<rect x="113" y="215" width="18" height="19" rx="4" ${line(5)}/>`,
    `<path d="M122 234C122 248 146 250 166 242S204 228 222 236" ${line(THIN)}/>`,
  ];
}

// ---------------------------------------------------------- clinical & lab

function bloodCultureBottle() {
  const glass = 'M82 104Q82 84 104 78L106 68L150 68L152 78Q174 84 174 104L174 222Q174 236 160 236L96 236Q82 236 82 222Z';
  const bars = [2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 3, 1];
  let x = 108;
  const barcode = bars.map((w, i) => {
    const bar = `<rect x="${n(x)}" y="146" width="${n(w * 1.6)}" height="18" ${solid}/>`;
    x += w * 1.6 + (i % 3 ? 2 : 3);
    return bar;
  });
  return [
    `<rect x="98" y="14" width="60" height="28" rx="6" ${solid}/>`,
    `<rect x="102" y="48" width="52" height="12" rx="3" ${solid}/>`,
    `<path d="${glass}" ${line(LINE)}/>`,
    `<rect x="100" y="112" width="56" height="62" rx="4" ${line(5)}/>`,
    `<rect x="108" y="124" width="34" height="6" rx="3" ${solid}/>`,
    ...barcode,
    `<path d="M96 190L160 190L160 218Q160 224 154 224L102 224Q96 224 96 218Z" ${solid}/>`,
  ];
}

// ------------------------------------------------------------------------

const DRAWINGS = {
  'staphylococcus': staphylococcus,
  'escherichia-coli': escherichiaColi,
  'sars-cov-2': sarsCov2,
  'adenovirus': adenovirus,
  'candida': candida,
  'neutrophil': neutrophil,
  'macrophage': macrophage,
  't-cell': tCell,
  'igg-antibody': iggAntibody,
  'antibiotic-capsule': antibioticCapsule,
  'iv-bag': ivBag,
  'blood-culture-bottle': bloodCultureBottle,
};

const catalogue = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalogue.json'), 'utf8'));
for (const [id, draw] of Object.entries(DRAWINGS)) {
  const meta = catalogue.icons.find(icon => icon.id === id);
  if (!meta || !meta.monoFile) throw new Error(`No catalogue monoFile for "${id}"`);
  const svgId = `${id}-mono`;
  K.writeIcon(ROOT, meta.monoFile, K.svgDocument({
    id: svgId, title: `${meta.name} (single colour)`, description: meta.description, defs: [], body: draw(),
  }));
}
