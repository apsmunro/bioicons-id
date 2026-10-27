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

function streptococcus() {
  return K.pointsAlongBezier(...K.STREP_CHAIN).map(({ x, y }) => `<circle cx="${n(x)}" cy="${n(y)}" r="17" ${solid}/>`);
}

function pneumococcus() {
  return [
    `<g transform="translate(128 128) rotate(-30) scale(1.25)">`,
    `<ellipse rx="82" ry="42" ${line(4)}/>`,
    `<path d="${K.lancetPath(-1)}" ${solid}/>`,
    `<path d="${K.lancetPath(1)}" ${solid}/>`,
    `</g>`,
  ];
}

function meningococcus() {
  return [`<g transform="translate(128 128) rotate(-20) scale(1.35)">`, `<path d="${K.beanPath(-1)}" ${solid}/>`, `<path d="${K.beanPath(1)}" ${solid}/>`, `</g>`];
}

function mycobacteriumTuberculosis() {
  const along = [Math.cos(-Math.PI / 6), Math.sin(-Math.PI / 6)], across = [-along[1], along[0]];
  return [[-2, -14, 100], [-1, 16, 92], [0, -4, 104], [1, 18, 96], [2, -12, 98]].map(([k, shift, len]) => {
    const x = 128 + across[0] * k * 30 + along[0] * shift, y = 128 + across[1] * k * 30 + along[1] * shift;
    return `<rect x="${-len / 2}" y="-10" width="${len}" height="20" rx="10" transform="translate(${n(x)} ${n(y)}) rotate(-30)" ${solid}/>`;
  });
}

function biofilm() {
  const swimmer = (x, y, angle, phase) => {
    const tail = K.wavePoints({ x: -14, y: 0, nx: -1, ny: 0 }, 0, { length: 34, amplitude: 4, wavelength: 14, phase });
    return `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="${K.smoothOpenPath(tail)}" ${line(3)}/>` +
      `<rect x="-15" y="-7" width="30" height="14" rx="7" ${solid}/></g>`;
  };
  return [
    `<path d="M20 202C26 170 50 150 76 156C88 120 120 110 140 128C160 104 196 112 204 140C222 146 236 176 236 202" ${line(4)}/>`,
    ...K.BIOFILM_CELLS.map(([x, y, angle, kind]) => kind === 'rod'
      ? `<rect x="-11" y="-4.5" width="22" height="9" rx="4.5" transform="translate(${x} ${y}) rotate(${angle})" ${solid}/>`
      : `<circle cx="${x}" cy="${y}" r="5.5" ${solid}/>`),
    `<rect x="14" y="208" width="228" height="16" rx="4" ${solid}/>`,
    swimmer(84, 66, -20, 0), swimmer(176, 50, 25, 2),
  ];
}

function kingella() {
  const cell = (x, y, a) => `<rect x="-16" y="-12" width="32" height="24" rx="11" transform="translate(${n(x)} ${n(y)}) rotate(${n(a)})" ${solid}/>`;
  const chain = K.pointsAlongBezier([30, 112], [90, 56], [160, 124], [226, 70], [36, 42, 36]);
  return [...chain.map(p => cell(p.x, p.y, p.angle)), cell(92, 184, 14), cell(127, 193, 14), cell(190, 168, -30)];
}

function bordetella() {
  const cells = [[70, 80, 20], [120, 62, -15], [170, 92, 35], [96, 132, -40], [152, 148, 10], [204, 140, -25], [78, 188, 25], [132, 204, -10], [190, 196, 40]];
  const fimbriae = Array.from({ length: 10 }, (_, i) => {
    const p = K.stadiumPoint((i + 0.5) / 10, 6, 9);
    return `M${n(p.x + p.nx * 2)} ${n(p.y + p.ny * 2)}L${n(p.x + p.nx * 8)} ${n(p.y + p.ny * 8)}`;
  }).join('');
  const toxin = (x, y) => Array.from({ length: 5 }, (_, k) => {
    const a = k * 2 * Math.PI / 5 - Math.PI / 2;
    return `<circle cx="${n(x + 7 * Math.cos(a))}" cy="${n(y + 4 + 5 * Math.sin(a))}" r="4" ${solid}/>`;
  }).join('') + `<circle cx="${x}" cy="${y - 8}" r="5.5" ${solid}/>`;
  return [
    ...cells.map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="${fimbriae}" ${line(2)}/>` +
      `<rect x="-15" y="-9" width="30" height="18" rx="9" ${solid}/></g>`),
    toxin(40, 140), toxin(220, 64), toxin(224, 214), toxin(36, 36),
  ];
}

function listeria() {
  const membrane = K.polarPoints(128, 138, a => 92 + 34 * Math.exp(-(K.wrapAngle(a + 0.7) ** 2) / (2 * 0.2 ** 2)) + 2 * Math.sin(5 * a), 140);
  const bug = (x, y, deg) => `<g transform="translate(${n(x)} ${n(y)}) rotate(${deg})">` +
    `<path d="M-22 -7L-66 0L-22 7Z" ${solid}/><rect x="-17" y="-8" width="34" height="16" rx="8" ${solid}/></g>`;
  return [
    `<path d="${K.smoothClosedPath(membrane)}" ${line(LINE)}/>`,
    `<circle cx="82" cy="176" r="24" ${solid}/>`,
    bug(211, 68, -40), bug(100, 100, -150), bug(150, 170, 20),
  ];
}

function treponema() {
  const helix = (cx, cy, deg, len) => {
    const a = deg * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], v = [-u[1], u[0]], pts = [];
    for (let t = -len / 2; t <= len / 2; t += 2) {
      const off = 9 * Math.min(1, (len / 2 - Math.abs(t)) / 14) * Math.sin(2 * Math.PI * t / 16);
      pts.push([cx + u[0] * t + v[0] * off, cy + u[1] * t + v[1] * off]);
    }
    return K.smoothOpenPath(pts);
  };
  return [`<path d="${helix(122, 94, -24, 190)}${helix(134, 170, -18, 170)}" ${line(6)}/>`];
}

function pseudomonas() {
  const s = 34, r = 15;
  const pole = K.stadiumPoint((2 * s + Math.PI * r / 2) / (4 * s + 2 * Math.PI * r), s, r);
  return K.PSEUDOMONAS_CELLS.map(([x, y, a], i) => `<g transform="translate(${x} ${y}) rotate(${a})">` +
    `<path d="${K.smoothOpenPath(K.wavePoints(pole, 0, { length: 64, amplitude: 6, wavelength: 24, phase: i * 2 }))}" ${line(5)}/>` +
    `<rect x="${-(s + r)}" y="${-r}" width="${2 * (s + r)}" height="${2 * r}" rx="${r}" ${solid}/></g>`);
}

function klebsiella() {
  return [
    `<g transform="translate(128 128) rotate(-28)">`,
    `<ellipse rx="114" ry="64" ${line(4)}/>`,
    ...[-51, 51].map(x => `<rect x="${x - 48}" y="-26" width="96" height="52" rx="26" ${solid}/>`),
    `</g>`,
  ];
}

function salmonella() {
  const E = K.ENTEROCYTES;
  const rod = (x, y, deg, len, h, flagella) => `<g transform="translate(${x} ${y}) rotate(${deg})">` +
    (flagella ? `<path d="${[0.1, 0.4, 0.6, 0.9].map((u, i) =>
      K.smoothOpenPath(K.wavePoints(K.stadiumPoint(u, (len - h) / 2, h / 2), (i % 2 ? 1 : -1) * 0.3, { length: 30, amplitude: 4, wavelength: 14, phase: i }))).join('')}" ${line(3)}/>` : '') +
    `<rect x="${-len / 2}" y="${-h / 2}" width="${len}" height="${h}" rx="${h / 2}" ${solid}/></g>`;
  return [
    `<path d="${E.microvilli.map(x => `M${x} 114V104`).join('')}" ${line(5)}/>`,
    `<path d="${E.left}" ${line(8)}/>`, `<path d="${E.right}" ${line(8)}/>`,
    `<ellipse cx="76" cy="212" rx="22" ry="11" ${solid}/>`, `<ellipse cx="184" cy="212" rx="20" ry="11" ${solid}/>`,
    `<circle cx="78" cy="160" r="28" ${line(4)}/>`,
    rod(78, 160, 30, 34, 15), rod(182, 92, -8, 34, 15), rod(70, 56, 20, 36, 16, true),
  ];
}

function cDifficile() {
  const s = 40, r = 15, D = K.CDIFF, [vx, vy, va] = D.vegetative, [px, py, pa] = D.sporulating;
  const flagella = [0.08, 0.22, 0.36, 0.58, 0.72, 0.86].map((u, i) =>
    K.smoothOpenPath(K.wavePoints(K.stadiumPoint(u, s, r), (i % 2 ? 1 : -1) * 0.3, { length: 30, amplitude: 4, wavelength: 14, phase: i }))).join('');
  return [
    `<g transform="translate(${vx} ${vy}) rotate(${va})"><path d="${flagella}" ${line(3.5)}/>` +
      `<rect x="${-(s + r)}" y="${-r}" width="${2 * (s + r)}" height="${2 * r}" rx="${r}" ${solid}/></g>`,
    // The sporulating cell in outline, so its spore shows inside.
    `<g transform="translate(${px} ${py}) rotate(${pa})"><path d="${K.sporulatingRod(s, r)}" ${line(6)}/><ellipse cx="28" rx="11" ry="8.5" ${solid}/></g>`,
    ...D.spores.map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><ellipse rx="17" ry="13" ${line(3)}/><ellipse rx="9" ry="6" ${solid}/></g>`),
  ];
}

function haemophilus() {
  return K.HAEMOPHILUS_CELLS.map(([x, y, a, s]) => `<g transform="translate(${x} ${y}) rotate(${a})">` +
    `<ellipse rx="${s + 19}" ry="19" ${line(3)}/><rect x="${-(s + 10)}" y="-10" width="${2 * (s + 10)}" height="20" rx="10" ${solid}/></g>`);
}

function mycoplasma() {
  const M = K.MYCOPLASMA;
  return [
    `<path d="${M.cilia.map(x => `M${x} 163C${x - 4} 150 ${x + 4} 138 ${x} 124`).join('')}" ${line(3)}/>`,
    ...M.epithelium.map(d => `<path d="${d}" ${line(8)}/>`),
    ...[[76, 206], [180, 206]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="13" ${solid}/>`),
    ...M.cells.map(([x, y, a, s]) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="${M.flask}" ${solid}/><ellipse cy="31" rx="6.5" ry="5" ${solid}/></g>`),
  ];
}

function campylobacter() {
  const P = K.CAMPYLOBACTER, { body, poles } = K.campylobacterCell();
  const flagella = poles.map((p, i) => K.smoothOpenPath(K.wavePoints(p, 0, { length: 38, amplitude: 4, wavelength: 16, phase: i * 2 }))).join('');
  return P.cells.map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="${flagella}" ${line(4)}/><path d="${K.smoothOpenPath(body)}" ${line(18)}/></g>`);
}

function clostridiumTetani() {
  const T = K.TETANI, [cx, R] = T.spore, r = T.r, [vx, vy, va] = T.vegetative, vs = 36;
  const flagella = [0.04, 0.14, 0.26, 0.38, 0.54, 0.64, 0.76, 0.88].map((u, i) =>
    K.smoothOpenPath(K.wavePoints(K.stadiumPoint(u, vs, r), (i % 2 ? 1 : -1) * 0.3, { length: 28, amplitude: 4, wavelength: 14, phase: i }))).join('');
  return [
    `<g transform="translate(${vx} ${vy}) rotate(${va})"><path d="${flagella}" ${line(3.5)}/><rect x="${-(vs + r)}" y="${-r}" width="${2 * (vs + r)}" height="${2 * r}" rx="${r}" ${solid}/></g>`,
    // Each drumstick: a solid rod ending in a ring round its spore.
    ...T.cells.map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="${-T.s - r}" y="${-r}" width="${T.s + r + cx - R + 4}" height="${2 * r}" rx="${r}" ${solid}/>` +
      `<circle cx="${cx}" r="${R - 2.5}" ${line(5)}/><circle cx="${cx}" r="8" ${solid}/></g>`),
  ];
}

function corynebacteriumDiphtheriae() {
  const D = K.DIPHTHERIAE;
  // Solid clubs with their polar granules left clear.
  return D.cells.map(([x, y, a]) => `<path d="${D.club}${D.granules.map(([gx, r]) => K.circlePath(gx, 0, r)).join('')}" transform="translate(${n(x)} ${n(y)}) rotate(${a})" fill-rule="evenodd" ${solid}/>`);
}

// ----------------------------------------------------------------- viruses

function rotavirus() {
  const R = 74, at = (a, r) => [n(128 + r * Math.cos(a)), n(128 + r * Math.sin(a))];
  return [
    ...Array.from({ length: 24 }, (_, k) => { const [x, y] = at(k * Math.PI / 12, R + 12); return `<circle cx="${x}" cy="${y}" r="4.5" ${solid}/>`; }),
    `<circle cx="128" cy="128" r="${R}" ${line(LINE)}/>`,
    `<circle cx="128" cy="128" r="58" ${line(4)}/>`,
    `<path d="${Array.from({ length: 12 }, (_, k) => { const a = k * Math.PI / 6 + 0.13, [x0, y0] = at(a, 28), [x1, y1] = at(a, 56); return `M${x0} ${y0}L${x1} ${y1}`; }).join('')}" ${line(6)}/>`,
    `<circle cx="128" cy="128" r="27" ${solid}/>`,
  ];
}

function enterovirus() {
  const { V, P, rim, inner, innerVertices, edgeLine } = icosahedronLines(88);
  return [
    ...inner.map(k => edgeLine(k, 4)),
    ...rim.map(k => edgeLine(k, 9)),
    ...innerVertices.map(i => { const [x, y] = P(V[i]); return `<circle cx="${n(x)}" cy="${n(y)}" r="6" ${solid}/>`; }),
  ];
}

function measles() {
  const radius = a => 66 + 6 * Math.sin(3 * a + 1) + 4 * Math.sin(5 * a);
  const spikes = Array.from({ length: 28 }, (_, k) => {
    const a = k * 2 * Math.PI / 28, deg = n(a * 180 / Math.PI + 90), r = n(radius(a) + 3);
    return `<g transform="rotate(${deg}) translate(0 ${-r})">` + (k % 2
      ? `<line x1="0" y1="0" x2="0" y2="-12" ${line(3)}/><ellipse cy="-17" rx="6.5" ry="4.5" ${solid}/>`
      : `<line x1="0" y1="0" x2="0" y2="-7" ${line(4)}/><ellipse cy="-12" rx="4.5" ry="6.5" ${solid}/>`) + `</g>`;
  });
  const strand = Array.from({ length: 141 }, (_, i) => {
    const t = i / 140, a = t * 2 * Math.PI * 1.1 + 0.6, r = 32 + 11 * Math.sin(2 * a + 0.5);
    return [r * Math.cos(a), r * Math.sin(a)];
  });
  return [`<g transform="translate(128 128)">`, ...spikes,
    `<path d="${K.smoothClosedPath(K.polarPoints(0, 0, radius))}" ${line(LINE)}/>`,
    `<path d="${K.smoothOpenPath(strand)}" ${line(4.5)}/>`, `</g>`];
}

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

// Visible edges of an icosahedron of circumradius S centred on (cx, cy), split into
// silhouette (rim) and inner edges, with the vertices on each.
function icosahedronLines(S, cx = 128, cy = 128) {
  const { vertices: V, visibleFaces } = K.icosahedron();
  const P = v => [cx + S * v[0], cy - S * v[1]];
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
  return { V, P, rim, inner, rimVertices, innerVertices, edgeLine };
}

function adenovirus() {
  const { V, P, rim, inner, rimVertices, innerVertices, edgeLine } = icosahedronLines(64);
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

function rsv() {
  const R = 58;
  const spikes = Array.from({ length: 24 }, (_, i) => {
    const turn = `<g transform="rotate(${n(i * 15 + 3)})">`;
    return i % 3 === 2
      ? turn + `<line x1="0" y1="${-(R + 3)}" x2="0" y2="${-(R + 20)}" ${line(4)}/><circle cy="${-(R + 24)}" r="5" ${solid}/></g>`
      : turn + `<line x1="0" y1="${-(R + 3)}" x2="0" y2="${-(R + 10)}" ${line(THIN)}/><ellipse cy="${-(R + 16)}" rx="6" ry="8" ${solid}/></g>`;
  });
  const coil = Array.from({ length: 161 }, (_, i) => {
    const t = i / 160, a = t * 2 * Math.PI * 1.15 + 0.4, r = 27 + 9 * Math.sin(2 * a + 1);
    const w = 3 * Math.sin(t * 46 * Math.PI);
    return [(r + w) * Math.cos(a), (r + w) * Math.sin(a)];
  });
  return [`<g transform="translate(128 128)">`, ...spikes, `<circle r="${R}" ${line(LINE)}/>`, `<path d="${K.smoothOpenPath(coil)}" ${line(5)}/>`, `</g>`];
}

function influenza() {
  const R = 60;
  const spikes = Array.from({ length: 20 }, (_, i) => {
    const turn = `<g transform="rotate(${i * 18 + 2})">`;
    return i % 5 === 2
      ? turn + `<line x1="0" y1="${-(R + 3)}" x2="0" y2="${-(R + 14)}" ${line(4)}/><circle cy="${-(R + 20)}" r="6.5" ${solid}/></g>`
      : turn + `<rect x="-4" y="${-(R + 24)}" width="8" height="21" rx="4" ${solid}/></g>`;
  });
  const segments = [56, 64, 72, 60, 68, 52, 62, 58].map((len, i) =>
    `<rect x="${n(-39.75 + i * 10.5)}" y="${n(2 - len * 0.475)}" width="6" height="${n(len * 0.95)}" rx="3" ${solid}/>`);
  return [`<g transform="translate(128 128)">`, ...spikes, `<circle r="${R}" ${line(LINE)}/>`, ...segments, `</g>`];
}

function herpesvirus() {
  const R = 80;
  const spikes = Array.from({ length: 22 }, (_, i) =>
    `<g transform="rotate(${n(i * 360 / 22 + 4)} 128 128)"><line x1="128" y1="${128 - R - 3}" x2="128" y2="${128 - R - 10}" ${line(4)}/>` +
    `<circle cx="128" cy="${128 - R - 15}" r="5" ${solid}/></g>`);
  const tegument = Array.from({ length: 26 }, (_, i) => {
    const a = i * 2 * Math.PI / 26;
    return `<circle cx="${n(126 + 64 * Math.cos(a))}" cy="${n(126 + 64 * Math.sin(a))}" r="2.6" ${solid}/>`;
  });
  const { P, V, rim, inner, innerVertices, edgeLine } = icosahedronLines(42, 122, 124);
  return [
    ...spikes,
    `<circle cx="128" cy="128" r="${R}" ${line(LINE)}/>`,
    ...tegument,
    ...inner.map(k => edgeLine(k, 4)),
    ...rim.map(k => edgeLine(k, 8)),
    ...innerVertices.map(i => { const [x, y] = P(V[i]); return `<circle cx="${n(x)}" cy="${n(y)}" r="5" ${solid}/>`; }),
  ];
}

function bacteriophage() {
  const legs = [[[104, 196], [74, 208], [60, 236]], [[116, 197], [100, 216], [96, 238]]];
  return [
    `<polygon points="128,20 168,42 168,96 128,118 88,96 88,42" ${solid} stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
    `<rect x="114" y="123" width="28" height="7" rx="2" ${solid}/>`,
    ...Array.from({ length: 8 }, (_, k) => `<rect x="117" y="${133 + k * 7}" width="22" height="4.5" rx="1.5" ${solid}/>`),
    `<rect x="100" y="188" width="56" height="9" rx="3" ${solid}/>`,
    ...legs.flatMap(leg => [leg, leg.map(([x, y]) => [256 - x, y])])
      .map(leg => `<path d="M${leg.map(p => p.join(' ')).join('L')}" ${line(5)}/>`),
  ];
}

function hiv() {
  const R = 62;
  const spikes = Array.from({ length: 12 }, (_, i) => `<g transform="rotate(${n(i * 30 + 8 + 6 * Math.sin(i * 2.3))})">` +
    `<line x1="0" y1="${-(R + 4)}" x2="0" y2="${-(R + 13)}" ${line(4)}/>` +
    [[-5, R + 18], [5, R + 18], [0, R + 25]].map(([x, y]) => `<circle cx="${x}" cy="${-y}" r="5" ${solid}/>`).join('') + `</g>`);
  return [
    `<g transform="translate(128 128)">`, ...spikes,
    `<circle r="${R}" ${line(LINE)}/>`,
    `<path d="${K.HIV_CAPSID}" transform="translate(-2 4) rotate(-40) scale(0.92)" ${solid}/>`,
    `</g>`,
  ];
}

function norovirus() {
  const R = 84;
  // Only the arch-forming dimers are drawn; the gaps between them are the cup-shaped depressions.
  return [
    `<circle cx="128" cy="128" r="${R}" ${line(LINE)}/>`,
    ...K.calicivirusPoints().dimers.filter(v => v[2] > 0.3).map(v => {
      const [x, y] = [n(128 + 0.88 * R * v[0]), n(128 - 0.88 * R * v[1])], deg = n(Math.atan2(-v[1], v[0]) * 180 / Math.PI + 90);
      return `<ellipse cx="${x}" cy="${y}" rx="10.5" ry="${n(10.5 * v[2])}" transform="rotate(${deg} ${x} ${y})" ${solid}/>`;
    }),
  ];
}

function hepatitisB() {
  const R = 70, { rim, edgeLine } = icosahedronLines(42);
  const [g0, g1] = [[17 * Math.cos(-3.4), 17 * Math.sin(-3.4)], [17 * Math.cos(0.7), 17 * Math.sin(0.7)]];
  return [
    ...Array.from({ length: 30 }, (_, i) => `<g transform="rotate(${i * 12 + 3} 128 128)"><line x1="128" y1="${128 - R - 4}" x2="128" y2="${128 - R - 9}" ${line(3.5)}/>` +
      `<circle cx="128" cy="${128 - R - 13}" r="4.5" ${solid}/></g>`),
    `<circle cx="128" cy="128" r="${R}" ${line(LINE)}/>`,
    ...rim.map(k => edgeLine(k, 6)),
    // The circular DNA, one strand complete and the other partial, with its polymerase.
    `<path d="M${n(128 + g0[0])} ${n(128 + g0[1])}A17 17 0 1 1 ${n(128 + g1[0])} ${n(128 + g1[1])}" ${line(4)}/>`,
    `<circle cx="${n(128 + g1[0])}" cy="${n(128 + g1[1])}" r="5" ${solid}/>`,
  ];
}

function mpox() {
  const X = K.MPOX, [a, b, p] = X.brick, [lx, ly, lrx, lry] = X.lateral;
  const edge = K.polarPoints(0, 0, t => X.radius(t), 160);
  const tubules = K.resample([...edge, edge[0]], 14).slice(0, -1).map(([x, y]) => {
    const [gx, gy] = [Math.sign(x) * Math.abs(x / a) ** (p - 1) / a, Math.sign(y) * Math.abs(y / b) ** (p - 1) / b], l = Math.hypot(gx, gy);
    return `M${n(x + gx / l * 4)} ${n(y + gy / l * 4)}L${n(x + gx / l * 11)} ${n(y + gy / l * 11)}`;
  }).join('');
  return [
    `<g transform="translate(128 128) rotate(-18) scale(0.92)">`,
    `<path d="${tubules}" ${line(5)}/>`,
    `<path d="${K.smoothClosedPath(edge)}" ${line(LINE)}/>`,
    `<path d="${X.core}" ${solid}/>`,
    ...[-1, 1].map(s => `<ellipse cx="${lx}" cy="${s * ly}" rx="${lrx}" ry="${lry}" ${solid}/>`),
    `</g>`,
  ];
}

function dengue() {
  const R = 84, P = v => `${n(128 + R * v[0])} ${n(128 - R * v[1])}`;
  // Each raft's three dimers as parallel lines, on the side facing the viewer.
  const lines = K.flavivirusRafts().filter(raft => raft.c[2] > 0.42).flatMap(raft => [-0.19, 0, 0.19].map(v =>
    'M' + Array.from({ length: 7 }, (_, k) => P(K.onSphere(raft, -0.36 + k * 0.12, v))).join('L')));
  return [`<circle cx="128" cy="128" r="${R}" ${line(8)}/>`, `<path d="${lines.join('')}" ${line(5)}/>`];
}

function parvovirus() {
  const R = 72, { five, three } = K.icosahedralAxes();
  const feature = (v, size, attrs) => {
    const [x, y] = [n(128 + R * v[0]), n(128 - R * v[1])], deg = n(Math.atan2(-v[1], v[0]) * 180 / Math.PI + 90);
    return `<ellipse cx="${x}" cy="${y}" rx="${size}" ry="${n(size * Math.max(0.3, v[2]))}" transform="rotate(${deg} ${x} ${y})" ${attrs}/>`;
  };
  return [
    `<circle cx="128" cy="128" r="${R}" ${line(8)}/>`,
    // Pores at the 5-fold axes, spikes at the 3-fold axes.
    ...five.filter(v => v[2] > 0.3).map(v => feature(v, 9, line(3.5))),
    ...three.filter(({ centre }) => centre[2] > 0.3).map(({ centre }) => feature(centre, 8, solid)),
  ];
}

function rabies() {
  const B = K.RABIES, count = 22;
  const spikes = Array.from({ length: count }, (_, k) => B.along((k + 0.5) / count * B.perimeter)).filter(([x]) => x > -B.base + 8);
  const coils = [];
  for (let x = -B.base + 14; x < B.tip + B.r - 8; x += 10) coils.push(`M${x} ${-B.r}L${x + 4} ${B.r}`);
  return [
    `<g transform="translate(128 128) rotate(-30) translate(${(B.base - B.tip - B.r) / 2} 0)">`,
    `<clipPath id="rabies-mono-inner"><path d="${K.bulletPath(B, 13)}"/></clipPath>`,
    `<path d="${spikes.map(([x, y, nx, ny]) => `M${n(x + nx * 4)} ${n(y + ny * 4)}L${n(x + nx * 10)} ${n(y + ny * 10)}`).join('')}" ${line(3.5)}/>`,
    ...spikes.map(([x, y, nx, ny]) => `<circle cx="${n(x + nx * 14)}" cy="${n(y + ny * 14)}" r="3.5" ${solid}/>`),
    `<path d="${K.bulletPath()}" ${line(LINE)}/>`,
    `<g clip-path="url(#rabies-mono-inner)"><path d="${coils.join('')}" ${line(4)}/></g>`,
    `</g>`,
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

function aspergillus() {
  const vx = 128, vy = 100;
  const angles = Array.from({ length: 9 }, (_, i) => (-165 + i * 18.75) * Math.PI / 180);
  const at = (a, r) => [n(vx + r * Math.cos(a)), n(vy + r * Math.sin(a))];
  return [
    `<path d="M70 202Q58 188 42 178M172 202Q190 214 212 234" ${line(10)}/>`,
    `<path d="M30 202L226 202" ${line(12)}/>`,
    `<path d="M128 202L128 116" ${line(10)}/>`,
    ...angles.map(a => { const [p, q] = [at(a, 18), at(a, 30)]; return `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" ${line(5)}/>`; }),
    `<circle cx="${vx}" cy="${vy}" r="20" ${solid}/>`,
    ...[0, 1, 2].flatMap(j => angles.map(a => { const [x, y] = at(a, 38 + j * 11); return `<circle cx="${x}" cy="${y}" r="4" ${solid}/>`; })),
  ];
}

function cryptococcus() {
  const cells = K.CRYPTOCOCCUS_CELLS;
  // Outer edge of the merged capsules: each capsule's circle, left out where it lies inside another.
  const edges = cells.flatMap(([x, y, , R], i) => {
    const runs = [[]];
    for (let k = 0; k <= 180; k++) {
      const a = k / 180 * 2 * Math.PI, p = [x + R * Math.cos(a), y + R * Math.sin(a)];
      if (cells.some(([cx, cy, , cR], j) => j !== i && Math.hypot(p[0] - cx, p[1] - cy) < cR)) runs.push([]);
      else runs[runs.length - 1].push(p);
    }
    return runs.filter(r => r.length > 1).map(r => 'M' + r.map(p => p.map(n).join(' ')).join('L'));
  });
  const [[mx, my, mr], bud, small] = cells;
  return [
    `<path d="${edges.join('')}" ${line(4)}/>`,
    `<circle cx="${mx}" cy="${my}" r="${mr}" ${line(8)}/>`,
    ...[bud, small].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${line(6)}/>`),
    `<circle cx="${mx - 14}" cy="${my - 10}" r="12" ${solid}/>`,
    `<ellipse cx="${mx + 14}" cy="${my + 12}" rx="13" ry="10" ${line(4)}/>`,
  ];
}

function pneumocystis() {
  const P = K.PNEUMOCYSTIS, [cx, cy, cr] = P.collapsed;
  const rosette = (x, y, r) => Array.from({ length: 8 }, (_, k) => {
    const a = k * Math.PI / 4 + 0.2;
    return `<circle cx="${n(x + r * 0.52 * Math.cos(a))}" cy="${n(y + r * 0.52 * Math.sin(a))}" r="${r > 32 ? 4 : 3.5}" ${solid}/>`;
  }).join('');
  return [
    ...P.trophs.map(([x, y, r], i) => `<path d="${K.smoothClosedPath(K.polarPoints(x, y, a => r * (1 + 0.22 * Math.sin(3 * a + i) + 0.1 * Math.sin(5 * a + 2 * i)), 40))}" ${solid}/>`),
    ...P.cysts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${line(6)}/>` + rosette(x, y, r)),
    `<circle cx="${cx}" cy="${cy}" r="${cr}" ${line(6)}/>`,
    // The fold of the collapsed cyst.
    `<path d="M${cx - 12} ${cy - 14}Q${cx + 14} ${cy - 14} ${cx + 14} ${cy + 10}" ${line(4)}/>`,
  ];
}

function rhizopus() {
  const Z = K.RHIZOPUS, [sx, sy, sr] = Z.sporangium, [cx, cy] = Z.columella, [yx, yy, yr] = Z.young;
  const spores = [];
  for (let y = -sr; y <= sr; y += 10) for (let x = -sr; x <= sr; x += 11) {
    const px = x + (Math.round(y / 10) % 2 ? 5.5 : 0);
    if (Math.hypot(px, y) < sr - 13) spores.push(`<circle cx="${n(sx + px)}" cy="${n(sy + y)}" r="3" ${solid}/>`);
  }
  return [
    `<path d="${Z.rhizoids.join('')}" ${line(4)}/>`,
    `<path d="${K.wormOutline(Z.stolon, Z.width)}" ${solid}/>`,
    `<path d="${Z.stalks.join('')}" ${line(7)}/>`,
    `<path d="M${cx - 4} ${cy + 16}L${cx - 10} ${cy + 3}L${cx + 10} ${cy + 3}L${cx + 4} ${cy + 16}Z" ${solid}/>`,
    `<path d="M${cx - 15} ${cy + 4}C${cx - 15} ${cy - 26} ${cx + 15} ${cy - 26} ${cx + 15} ${cy + 4}Z" ${solid}/>`,
    `<circle cx="${yx}" cy="${yy}" r="${yr}" ${solid}/>`,
    `<circle cx="${sx}" cy="${sy}" r="${sr - 3}" ${line(6)}/>`,
    ...spores,
    ...Z.spores.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${solid}/>`),
  ];
}

// --------------------------------------------------------------- parasites

function malaria() {
  const ring = (x, y) => `<circle cx="${x}" cy="${y}" r="12" ${line(4)}/><circle cx="${x + 10}" cy="${y - 9}" r="5" ${solid}/>`;
  return [
    `<circle cx="204" cy="58" r="34" ${line(8)}/>`,
    `<path d="M190 66C197 51 210 48 219 56" ${line(10)}/>`,
    `<circle cx="110" cy="150" r="80" ${line(LINE)}/>`,
    ring(82, 126), ring(138, 180), ring(146, 116),
  ];
}

function toxoplasma() {
  return [
    `<path d="M60 200C40 156 86 72 192 56C206 54 214 62 206 72C156 104 116 152 98 202C92 216 66 216 60 200Z" ${line(LINE)}/>`,
    `<ellipse cx="96" cy="166" rx="13" ry="19" transform="rotate(30 96 166)" ${solid}/>`,
    ...[[146, 104], [160, 92], [132, 118]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="13" transform="rotate(54 ${x} ${y})" ${solid}/>`),
    ...[[182, 72], [192, 66], [174, 82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" ${solid}/>`),
  ];
}

function giardia() {
  const G = K.GIARDIA, [dx, dy, drx, dry] = G.disc;
  return [
    `<path d="${[...G.flagella, ...G.flagella.map(K.mirrorX)].join('')}${G.caudal}" ${line(4)}/>`,
    `<path d="${G.body}" ${line(8)}/>`,
    `<ellipse cx="${dx}" cy="${dy}" rx="${drx}" ry="${dry}" ${line(4)}/>`,
    ...G.nuclei.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="16" ${solid}/>`),
    ...G.medianBodies.map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="4.5" transform="rotate(${a} ${x} ${y})" ${solid}/>`),
    `<path d="M123 162L124 198M133 162L132 198" ${line(3)}/>`,
  ];
}

function mosquito() {
  const M = K.MOSQUITO, poly = pts => 'M' + pts.map(p => p.join(' ')).join('L');
  const [ax, ay] = M.abdomen.from, [bx, by] = M.abdomen.to, [w0, w1] = M.abdomen.widths;
  const len = Math.hypot(bx - ax, by - ay), deg = n(Math.atan2(by - ay, bx - ax) * 180 / Math.PI);
  const [hx, hy, hr] = M.head, [tx, ty, trx, try_, ta] = M.thorax, [wx, wy, wrx, wry, wa] = M.wing;
  // The wing is lifted a little off the abdomen so more of its outline shows.
  const lift = 9, t = wa * Math.PI / 180;
  return [
    `<path d="${[...M.farLegs, ...M.nearLegs].map(poly).join('')}" ${line(3.5)}/>`,
    `<path d="M0 ${-w0}C${n(len * 0.4)} ${-w0 - 2} ${n(len * 0.8)} ${-w1 - 2} ${n(len)} ${-w1}Q${n(len + w1 + 2)} 0 ${n(len)} ${w1}C${n(len * 0.8)} ${w1 + 2} ${n(len * 0.4)} ${w0 + 2} 0 ${w0}Z" transform="translate(${ax} ${ay}) rotate(${deg})" ${solid}/>`,
    `<ellipse cx="${n(wx + lift * Math.sin(t))}" cy="${n(wy - lift * Math.cos(t))}" rx="${wrx}" ry="${wry}" transform="rotate(${wa} ${n(wx + lift * Math.sin(t))} ${n(wy - lift * Math.cos(t))})" ${line(3.5)}/>`,
    `<ellipse cx="${tx}" cy="${ty}" rx="${trx}" ry="${try_}" transform="rotate(${ta} ${tx} ${ty})" ${solid}/>`,
    `<circle cx="${hx}" cy="${hy}" r="${hr}" ${solid}/>`,
    `<path d="${poly(M.proboscis)}" ${line(4.5)}/>`,
    `<path d="${poly(M.palps)}${poly(M.antenna)}" ${line(3.5)}/>`,
  ];
}

function threadworm() {
  const T = K.THREADWORM;
  return [
    ...[T.male, T.female].map(({ pts, width }) => `<path d="${K.wormOutline(pts, width)}" ${solid}/>`),
    ...T.eggs.map(([x, y, a]) => `<path d="${T.egg}" transform="translate(${x} ${y}) rotate(${a}) scale(1.15)" ${line(3.5)}/>`),
  ];
}

function scabiesMite() {
  const S = K.SCABIES, [bx, by, rx, ry] = S.body;
  const parts = S.legs.map(([[hx, hy], [fx, fy], kind]) => {
    const l = Math.hypot(fx - hx, fy - hy), [ux, uy] = [(fx - hx) / l, (fy - hy) / l], reach = kind === 'sucker' ? 12 : 38;
    return { leg: `M${hx} ${hy}L${fx} ${fy}`, tip: `M${fx} ${fy}L${n(fx + ux * reach)} ${n(fy + uy * reach)}`, sucker: kind === 'sucker' && [n(fx + ux * 16), n(fy + uy * 16)] };
  });
  const legs = parts.map(p => p.leg).join(''), tips = parts.map(p => p.tip).join('');
  const ridges = S.ridges.map(y => {
    const half = rx * Math.sqrt(1 - ((y - by) / ry) ** 2) - 12;
    return K.smoothOpenPath(Array.from({ length: 13 }, (_, i) => [bx - half + i * half / 6, y + 2 * Math.sin(i * 1.6)]));
  }).join('');
  return [
    `<path d="${tips}${K.mirrorX(tips)}" ${line(2.5)}/>`,
    `<path d="${legs}${K.mirrorX(legs)}" ${line(8)}/>`,
    ...parts.filter(p => p.sucker).flatMap(({ sucker: [x, y] }) => [x, 256 - x].map(sx => `<circle cx="${n(sx)}" cy="${y}" r="4" ${solid}/>`)),
    `<path d="${S.gnathosoma}" ${solid}/>`,
    `<ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}" ${line(8)}/>`,
    `<path d="${ridges}" ${line(2.5)}/>`,
    `<path d="${S.spines.map(([x, y]) => `M${x - 4} ${y - 3}L${x} ${y + 7}L${x + 4} ${y - 3}Z`).join('')}" ${solid}/>`,
  ];
}

function headLouse() {
  const L = K.HEAD_LOUSE, poly = pts => 'M' + pts.map(p => p.join(' ')).join('L');
  const legs = L.legs.map(poly).join(''), antenna = poly(L.antenna);
  const claws = L.legs.map(pts => { const [x, y] = pts[pts.length - 1]; return `M${x + 3} ${y - 3}C${x - 6} ${y - 2} ${x - 7} ${y + 8} ${x} ${y + 9}`; }).join('');
  const [ax, ay, arx, ary] = L.abdomen, [hx, hy, hrx, hry] = L.head, [tx, ty, trx, try_] = L.thorax, [nx, ny, nrx, nry, na] = L.nit;
  return [
    `<path d="${L.hair}" ${line(4)}/>`,
    `<ellipse cx="${nx}" cy="${ny}" rx="${nrx}" ry="${nry}" transform="rotate(${na} ${nx} ${ny})" ${solid}/>`,
    `<path d="${legs}${K.mirrorX(legs)}" ${line(5)}/>`,
    `<path d="${claws}${K.mirrorX(claws)}" ${line(3)}/>`,
    `<path d="${antenna}${K.mirrorX(antenna)}" ${line(3.5)}/>`,
    `<path d="${K.smoothClosedPath(K.polarPoints(ax, ay, a => K.ellipseRadius(arx, ary, a) - 2.5 * (1 - Math.cos(14 * a)) / 2, 168))}" ${solid}/>`,
    `<ellipse cx="${tx}" cy="${ty}" rx="${trx}" ry="${try_}" ${solid}/>`,
    `<ellipse cx="${hx}" cy="${hy}" rx="${hrx}" ry="${hry}" ${solid}/>`,
  ];
}

function tick() {
  const T = K.TICK, [bx, by, rx, ry] = T.body, legs = T.legs.map(pts => 'M' + pts.map(p => p.join(' ')).join('L')).join('');
  return [
    `<path d="${legs}${K.mirrorX(legs)}" ${line(6)}/>`,
    ...[119, 137].map(x => `<ellipse cx="${x}" cy="50" rx="5" ry="13" ${solid}/>`),
    `<rect x="113" y="60" width="30" height="18" rx="5" ${solid}/>`,
    `<ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}" ${line(8)}/>`,
    `<path d="${T.scutum}" ${solid}/>`,
  ];
}

function schistosoma() {
  const S = K.SCHISTOSOMA, [ex, ey, erx, ery, ea] = S.egg;
  return [
    // The male in outline, so the female shows lying in his canal.
    `<path d="${K.wormOutline(S.male, S.maleWidth)}" ${line(5)}/>`,
    `<path d="${K.wormOutline(S.female, S.femaleWidth)}" ${solid}/>`,
    `<g transform="translate(${ex} ${ey}) rotate(${ea})"><ellipse rx="${erx}" ry="${ery}" ${line(5)}/>` +
      `<path d="M4 ${ery + 1}L16 ${ery + 1}L28 ${ery + 13}Z" ${solid}/><ellipse rx="${erx - 10}" ry="${ery - 8}" ${solid}/></g>`,
  ];
}

function trypanosoma() {
  const T = K.TRYPANOSOMA, { at, N, outline, flagellum } = K.trypanosomeParts(), p = at(Math.round(T.nucleus * (N - 1)));
  const tilt = Math.atan2(p.ty, p.tx), nucleus = K.smoothClosedPath(K.polarPoints(p.x, p.y, a => K.ellipseRadius(8, 4.5, a - tilt), 24));
  return [
    ...T.redCells.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r - 3}" ${line(6)}/>`),
    `<path d="${outline}${nucleus}" fill-rule="evenodd" ${solid}/>`,
    `<path d="${K.smoothOpenPath(flagellum)}" ${line(3.5)}/>`,
  ];
}

// ------------------------------------------------------------ immune cells

// Stroked Y antibody with its stem base at (x, y), pointing up before rotation.
const antibodyY = (x, y, rot = 0, s = 1) =>
  `<path d="M0 6L0 -10M0 -10L-9 -20M0 -10L9 -20" transform="translate(${n(x)} ${n(y)}) rotate(${n(rot)}) scale(${s})" ${line(4.5)}/>`;

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

function bCell() {
  const R = 72, cx = 128, cy = 128;
  return [
    ...Array.from({ length: 12 }, (_, i) => `<g transform="rotate(${i * 30 + 8} ${cx} ${cy})">${antibodyY(cx, cy - R - 4)}</g>`),
    `<path d="${K.smoothClosedPath(K.polarPoints(cx, cy, a => R + 1.5 * Math.sin(5 * a + 0.7)))}" ${line(LINE)}/>`,
    `<path d="${K.smoothClosedPath(K.polarPoints(cx - 5, cy - 4, a => 50 + 2 * Math.sin(3 * a + 0.3)))}" ${solid}/>`,
  ];
}

function plasmaCell() {
  const nx = 80, ny = 144;
  // Clock-face nucleus: chromatin clumps shown as holes in a solid disc.
  const holes = [K.circlePath(nx, ny, 4.5), ...Array.from({ length: 8 }, (_, k) =>
    K.circlePath(nx + 20 * Math.cos(k * Math.PI / 4), ny + 20 * Math.sin(k * Math.PI / 4), 4.5))];
  const er = [46, 58, 70].map(r => {
    const pts = Array.from({ length: 13 }, (_, i) => { const a = (-55 + i * 9.5) * Math.PI / 180; return [nx + r * Math.cos(a), ny + r * Math.sin(a)]; });
    return `<path d="${K.smoothOpenPath(pts)}" ${line(4)}/>`;
  });
  return [
    `<ellipse cx="116" cy="140" rx="88" ry="66" transform="rotate(-12 116 140)" ${line(LINE)}/>`,
    ...er,
    `<path d="${K.circlePath(nx, ny, 32)}${holes.join('')}" fill-rule="evenodd" ${solid}/>`,
    antibodyY(196, 58, 25, 1.1), antibodyY(222, 104, 60, 0.95), antibodyY(160, 36, 5, 0.95),
  ];
}

function dendriticCell() {
  const arms = [[-1.9, 54, 0.12], [-0.9, 58, 0.11], [0.15, 52, 0.13], [1.0, 46, 0.12], [1.85, 56, 0.11], [2.75, 50, 0.13], [3.7, 42, 0.12]];
  const membrane = K.polarPoints(128, 128, a => 46 + 3 * Math.sin(5 * a) +
    arms.reduce((sum, [c, h, w]) => sum + h * Math.exp(-(K.wrapAngle(a - c) ** 2) / (2 * w * w)), 0), 180);
  return [
    `<path d="${K.smoothClosedPath(membrane)}" ${line(8)}/>`,
    `<path d="${K.smoothClosedPath(K.polarPoints(124, 132, a => 23 + 4 * Math.sin(3 * a + 1) + 2 * Math.sin(5 * a)))}" ${solid}/>`,
  ];
}

function nkCell() {
  const cx = 128, cy = 128;
  const kidney = K.polarPoints(0, 0, a => 34 - 9 * Math.exp(-(K.wrapAngle(a - 0.6) ** 2) / (2 * 0.32 ** 2)), 60)
    .map(([x, y]) => [cx - 20 + 1.15 * x, cy + 4 + y]);
  return [
    `<path d="${K.smoothClosedPath(K.polarPoints(cx, cy, a => 72 + 2 * Math.sin(6 * a + 0.2) + 1.5 * Math.sin(9 * a)))}" ${line(LINE)}/>`,
    `<path d="${K.smoothClosedPath(kidney)}" ${solid}/>`,
    ...[[150, 94], [168, 90], [160, 110], [180, 106], [176, 124]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" ${solid}/>`),
  ];
}

function monocyte() {
  const nucleus = K.polarPoints(0, 0, a => 40 - 18 * Math.exp(-(K.wrapAngle(a + 1.2) ** 2) / (2 * 0.4 ** 2)), 72)
    .map(([x, y]) => [120 + 1.15 * x, 136 + y]);
  return [
    `<path d="${K.smoothClosedPath(K.polarPoints(128, 128, a => 82 + 3 * Math.sin(5 * a + 1) + 2 * Math.sin(8 * a)))}" ${line(LINE)}/>`,
    `<path d="${K.smoothClosedPath(nucleus)}" ${solid}/>`,
    ...[[176, 96, 7], [182, 150, 5], [92, 72, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${line(3)}/>`),
  ];
}

function eosinophil() {
  const lobes = [[98, 118, 27, 22, -20], [158, 118, 27, 22, 20]];
  const rand = K.rng(23), granules = [];
  for (let tries = 0; granules.length < 36 && tries < 8000; tries++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 72, p = [128 + d * Math.cos(a), 128 + d * Math.sin(a)];
    if (lobes.every(([x, y]) => Math.hypot(p[0] - x, p[1] - y) > 34) && Math.hypot(p[0] - 128, p[1] - 110) > 16 &&
      granules.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 14)) granules.push(p);
  }
  return [
    `<path d="${K.smoothClosedPath(K.polarPoints(128, 128, a => 88 + 3 * Math.sin(6 * a + 0.5)))}" ${line(LINE)}/>`,
    `<path d="M98 118Q128 102 158 118" ${line(10)}/>`,
    ...lobes.map(([x, y, rx, ry, rot]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" ${solid}/>`),
    ...granules.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="4" ${solid}/>`),
  ];
}

function platelets() {
  const dots = (x, y) => [[-10, -4], [4, -7], [10, 4], [-4, 7]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="3.5" ${solid}/>`).join('');
  const spikes = [[0.2, 26, 0.12], [1.2, 30, 0.1], [2.1, 22, 0.13], [4.0, 24, 0.12], [5.1, 30, 0.1]];
  const activated = K.polarPoints(170, 168, a => 28 + spikes.reduce((s, [c, h, w]) => s + h * Math.exp(-(K.wrapAngle(a - c) ** 2) / (2 * w * w)), 0), 120);
  return [
    ...[[78, 88, 36, 23, -15], [176, 76, 30, 20, 20], [84, 182, 30, 19, 10]].map(([x, y, rx, ry, rot]) =>
      `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" ${line(5)}/>` + dots(x, y)),
    `<path d="${K.smoothClosedPath(activated)}" ${line(5)}/>`,
    `<circle cx="168" cy="166" r="4" ${solid}/><circle cx="178" cy="172" r="4" ${solid}/>`,
  ];
}

function cd8Killing() {
  return [
    ...[[-0.7, 8], [-0.1, 9], [0.55, 7], [1.1, 6]].map(([a, r]) => `<circle cx="${n(190 + (60 + r + 4) * Math.cos(a))}" cy="${n(130 + (60 + r + 4) * Math.sin(a))}" r="${r}" ${line(4)}/>`),
    `<circle cx="190" cy="130" r="60" ${line(LINE)}/>`,
    `<circle cx="204" cy="134" r="17" ${solid}/>`,
    ...[[178, 98], [218, 100], [168, 164], [206, 172]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" ${solid}/>`),
    `<circle cx="78" cy="132" r="50" ${line(LINE)}/>`,
    `<circle cx="70" cy="132" r="28" ${solid}/>`,
    ...[[110, 114], [112, 132], [110, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" ${solid}/>`),
  ];
}

function mastCell() {
  const cx = 116, cy = 132, R = 76;
  const rand = K.rng(51), inside = [], released = [];
  for (let tries = 0; inside.length < 30 && tries < 8000; tries++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 62, p = [cx + d * Math.cos(a), cy + d * Math.sin(a)];
    if (Math.hypot(p[0] - 100, p[1] - 136) > 32 && inside.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 14)) inside.push(p);
  }
  for (let tries = 0; released.length < 8 && tries < 8000; tries++) {
    const p = [200 + rand() * 38, 74 + rand() * 116];
    if (Math.hypot(p[0] - cx, p[1] - cy) > R + 12 && released.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 15)) released.push(p);
  }
  return [
    ...[200, 240, 280, 320].map(deg => `<g transform="rotate(${deg} ${cx} ${cy})">${antibodyY(cx, cy - R - 4)}</g>`),
    `<path d="${K.smoothClosedPath(K.polarPoints(cx, cy, a => R + 2 * Math.sin(5 * a + 1)))}" ${line(LINE)}/>`,
    `<circle cx="100" cy="136" r="22" ${solid}/>`,
    ...[...inside, ...released].map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="4.5" ${solid}/>`),
  ];
}

function nets() {
  const rand = K.rng(41), strands = [];
  for (let s = 0; s < 10; s++) {
    let a = -1.2 + s * 0.27 + (rand() - 0.5) * 0.2;
    const pts = [[70 + 50 * Math.cos(a), 128 + 50 * Math.sin(a)]];
    for (let k = 0; k < 12; k++) {
      a += (rand() - 0.5) * 0.9;
      const [px, py] = pts[pts.length - 1], q = [px + 14 * Math.cos(a), py + 14 * Math.sin(a)];
      if (q[0] > 236 || q[1] < 22 || q[1] > 234) break;
      pts.push(q);
    }
    strands.push(pts);
  }
  const caught = [[strands[1], 6, 30], [strands[6], 5, -40], [strands[3], 10, 70]].filter(([p, i]) => p[i])
    .map(([p, i, a]) => `<rect x="-12" y="-5.5" width="24" height="11" rx="5.5" transform="translate(${n(p[i][0])} ${n(p[i][1])}) rotate(${a})" ${solid}/>`);
  return [
    `<path d="${strands.map(K.smoothOpenPath).join('')}" ${line(2.5)}/>`,
    ...caught,
    `<circle cx="70" cy="128" r="46" ${line(8)}/>`,
    ...[[56, 116, 14, 11, -20], [80, 106, 13, 10, 15], [88, 134, 13, 11, 40]].map(([x, y, rx, ry, rot]) =>
      `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" ${solid}/>`),
  ];
}

function treg() {
  const R = 72, cx = 108, cy = 128;
  // T-cell receptors (pairs) alternating with CD25 (stalk and knob).
  const receptors = Array.from({ length: 14 }, (_, i) => `<g transform="rotate(${n(i * 360 / 14 + 12)} ${cx} ${cy})">` + (i % 2
    ? `<line x1="${cx}" y1="${cy - R - 4}" x2="${cx}" y2="${cy - R - 12}" ${line(5)}/><circle cx="${cx}" cy="${cy - R - 18}" r="5.5" ${solid}/>`
    : [-5, 5].map(dx => `<line x1="${cx + dx}" y1="${cy - R - 4}" x2="${cx + dx}" y2="${cy - R - 20}" ${line(5)}/>`).join('')) + `</g>`);
  return [
    ...receptors,
    `<circle cx="${cx}" cy="${cy}" r="${R}" ${line(LINE)}/>`,
    `<path d="${K.smoothClosedPath(K.polarPoints(cx - 6, cy - 6, a => 48 + 2 * Math.sin(4 * a + 1)))}" ${solid}/>`,
    ...[[212, 62, 9, 20], [228, 106, 8, -10], [218, 152, 10, 30], [200, 196, 8, 0]].map(([x, y, r, a]) =>
      `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${n(r * 0.8)}" transform="rotate(${a} ${x} ${y})" ${solid}/>`),
  ];
}

function basophil() {
  const lobes = [[104, 122, 26, 20, -30], [152, 136, 26, 20, 20]];
  // Granules lying over the nucleus show as holes in it; the rest are solid dots in the cytoplasm.
  const holes = [[[-13, -3], [1, 7], [12, -7]], [[-12, 6], [-1, -7], [12, 4]]];
  const inLobe = ([x, y], [lx, ly, rx, ry, rot], pad) => {
    const r = -rot * Math.PI / 180, [dx, dy] = [x - lx, y - ly], [u, v] = [dx * Math.cos(r) - dy * Math.sin(r), dx * Math.sin(r) + dy * Math.cos(r)];
    return (u / (rx + pad)) ** 2 + (v / (ry + pad)) ** 2 < 1;
  };
  const rand = K.rng(121), granules = [];
  for (let tries = 0; granules.length < 18 && tries < 8000; tries++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 68, p = [128 + d * Math.cos(a), 128 + d * Math.sin(a)];
    if (lobes.every(l => !inLobe(p, l, 11)) && Math.hypot(p[0] - 128, p[1] - 134) > 16 && granules.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 17)) granules.push(p);
  }
  return [
    `<path d="${K.smoothClosedPath(K.polarPoints(128, 128, a => 84 + 3 * Math.sin(6 * a + 0.8) + 1.5 * Math.sin(9 * a)))}" ${line(LINE)}/>`,
    `<path d="M104 122Q128 142 152 136" ${line(10)}/>`,
    ...lobes.map(([x, y, rx, ry, rot], i) => `<path d="${`M${-rx} 0a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`}${holes[i].map(([hx, hy]) => K.circlePath(hx, hy, 4)).join('')}" transform="translate(${x} ${y}) rotate(${rot})" fill-rule="evenodd" ${solid}/>`),
    ...granules.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="5.5" ${solid}/>`),
  ];
}

function immuneSynapse() {
  const dendrites = [[-2.0, 24, 0.14], [-1.3, 20, 0.13], [-0.5, 10, 0.14], [0.5, 10, 0.13], [1.3, 22, 0.14], [2.0, 22, 0.14]];
  return [
    `<path d="${K.synapseCell(176, 128, 52, 140, 1, dendrites)}" ${line(LINE)}/>`,
    `<path d="${K.smoothClosedPath(K.polarPoints(186, 130, a => 18 + 3 * Math.sin(3 * a + 1) + 2 * Math.sin(5 * a)))}" ${solid}/>`,
    `<path d="${K.synapseCell(72, 128, 56, 114, -1)}" ${line(LINE)}/>`,
    `<circle cx="64" cy="126" r="30" ${solid}/>`,
    // Receptor–peptide–MHC pairs bridging the gap.
    `<path d="${[100, 114, 128, 142, 156].map(y => `M119 ${y}H135`).join('')}" ${line(4)}/>`,
    ...[100, 114, 128, 142, 156].map(y => `<circle cx="127" cy="${y}" r="3.5" ${solid}/>`),
  ];
}

function redBloodCells() {
  // A cell seen face-on (with central pallor) beside one seen edge-on (biconcave profile).
  return [
    `<circle cx="98" cy="128" r="68" ${line(LINE)}/>`,
    `<circle cx="98" cy="128" r="32" ${line(THIN)}/>`,
    `<path d="M208 53C226 53 232 70 226 95C222 112 222 144 226 161C232 186 226 203 208 203C190 203 184 186 190 161C194 144 194 112 190 95C184 70 190 53 208 53Z" ${line(LINE)}/>`,
  ];
}

function neutrophilDiapedesis() {
  const D = K.DIAPEDESIS, [top, bottom] = D.endothelium, X = D.through.x, [rx, ry, rr] = D.rolling, [cx, cy] = D.crawling;
  // Lobes joined by a strand, so the nucleus reads as one multilobed shape rather than dots.
  const lobes = list => `<path d="M${list.map(([x, y]) => `${x} ${y}`).join('L')}" ${line(5)}/>` +
    list.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6.5" ry="5.5" ${solid}/>`).join('');
  // Endothelial cells, parted widely enough round the migrating cell to leave a clear gap.
  const cells = D.junctions.slice(0, -1).map((x0, k) => {
    const x1 = D.junctions[k + 1], a = x0 === 16 ? 16 : x0 + (x0 === X ? 14 : 3), b = x1 === 240 ? 240 : x1 - (x1 === X ? 14 : 3);
    return `<rect x="${a}" y="${top}" width="${b - a}" height="${bottom - top}" rx="6" ${solid}/>`;
  });
  const dir = Math.atan2(D.bacteria[0][1] - cy, D.bacteria[0][0] - cx);
  return [
    ...D.redCells.map(([x, y, a, b, r]) => `<ellipse cx="${x}" cy="${y}" rx="${a - 2}" ry="${b - 2}" transform="rotate(${r} ${x} ${y})" ${line(4)}/>`),
    ...cells,
    `<circle cx="${rx}" cy="${ry}" r="${rr - 4}" ${line(6)}/>`, lobes([[rx - 9, ry], [rx + 1, ry + 6], [rx + 9, ry - 4]]),
    `<path d="${K.hourglassPath()}" ${line(6)}/>`, lobes([[X - 7, 92], [X + 6, 100], [X, 168]]),
    `<path d="${K.crawlingCell(cx, cy, dir)}" ${line(6)}/>`, lobes([[cx - 14, cy - 6], [cx - 4, cy + 4], [cx - 16, cy + 10]]),
    ...D.bacteria.map(([x, y, a]) => `<rect x="-9" y="-4.5" width="18" height="9" rx="4.5" transform="translate(${x} ${y}) rotate(${a})" ${solid}/>`),
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

function igmPentamer() {
  const units = Array.from({ length: 5 }, (_, k) => {
    const phi = -90 + k * 72, r = phi * Math.PI / 180;
    return `<path d="M0 38L0 2M0 2L-40 -38M0 2L40 -38" transform="translate(${n(128 + 56 * Math.cos(r))} ${n(128 + 56 * Math.sin(r))}) rotate(${phi + 90})" ${line(11)}/>`;
  });
  return [...units, `<circle cx="128" cy="128" r="11" ${solid}/>`];
}

function mhcClassII() {
  const domain = (x, y, rx, ry, rot) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" ${solid}/>`;
  const peptide = Array.from({ length: 7 }, (_, i) => [96 + i * 10.7, 58 + 3 * Math.sin(i * 1.3)]);
  return [
    `<g transform="translate(0 -8)">`,
    `<path d="M24 184H232M24 210H232" ${line(5)}/>`,
    `<path d="M104 166V222M152 166V222" ${line(THIN)}/>`,
    domain(104, 144, 20, 24, 0), domain(152, 144, 20, 24, 0),
    domain(98, 94, 27, 19, 22), domain(158, 94, 27, 19, -22),
    `<path d="${K.smoothOpenPath(peptide)}" ${line(11)}/>`,
    `</g>`,
  ];
}

function cytokineReceptor() {
  const blob = (x, y, rx, ry, rot) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" ${solid}/>`;
  return [
    `<path d="M24 178H232M24 204H232" ${line(5)}/>`,
    `<path d="M108 162V214M148 162V214" ${line(THIN)}/>`,
    blob(100, 224, 12, 8, -10), blob(156, 224, 12, 8, 10),
    blob(108, 142, 16, 22, 10), blob(148, 142, 16, 22, -10),
    blob(102, 94, 16, 20, 18), blob(154, 94, 16, 20, -18),
    blob(128, 68, 18, 16, 0),
    blob(52, 62, 15, 13, 20), blob(200, 46, 14, 12, -15), blob(212, 110, 11, 10, 10),
  ];
}

function complementMac() {
  return [
    `<path d="M24 150H88M168 150H234M24 176H88M168 176H234" ${line(5)}/>`,
    ...Array.from({ length: 7 }, (_, k) => `<line x1="${98 + k * 10}" y1="104" x2="${98 + k * 10}" y2="192" ${line(5)}/>`),
    `<ellipse cx="128" cy="98" rx="34" ry="10" ${line(4)}/>`,
    ...[[90, 70, 9, 7, 0], [70, 104, 11, 9, 0], [80, 86, 13, 9, -20]].map(([x, y, rx, ry, rot]) =>
      `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" ${solid}/>`),
    ...[[124, 58], [134, 74], [122, 214], [132, 230]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" ${solid}/>`),
  ];
}

function mhcClassI() {
  const domain = (x, y, rx, ry, rot) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" ${solid}/>`;
  const peptide = Array.from({ length: 9 }, (_, i) => [100 + i * 7, 65 - 6 * Math.sin(i / 8 * Math.PI)]);
  return [
    `<g transform="translate(0 -8)">`,
    `<path d="M24 184H232M24 210H232" ${line(5)}/>`,
    `<path d="M104 166V222" ${line(THIN)}/>`,
    domain(104, 144, 20, 24, 0), domain(154, 146, 19, 21, 0),
    domain(98, 94, 27, 19, 22), domain(158, 94, 27, 19, -22),
    `<path d="${K.smoothOpenPath(peptide)}" ${line(7)}/>`,
    `</g>`,
  ];
}

function igeMastCell() {
  return [
    `<path d="M24 180H232M24 206H232" ${line(5)}/>`,
    `<path d="${[52, 128, 204].map(x => `M${x} 172V122M${x} 122L${x - 26} 94M${x} 122L${x + 26} 94`).join('')}" ${line(8)}/>`,
    ...[52, 128, 204].flatMap(x => [-1, 1].map(side => `<ellipse cx="${x + side * 14}" cy="168" rx="4.5" ry="9" transform="rotate(${side * 20} ${x + side * 14} 168)" ${solid}/>`)),
    `<path d="${K.smoothClosedPath(K.polarPoints(166, 78, a => 14 + 2.5 * Math.sin(5 * a + 1) + 1.5 * Math.sin(8 * a), 60))}" ${solid}/>`,
    ...[[100, 226, 11], [178, 228, 9], [40, 226, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${solid}/>`),
    ...[[88, 152], [102, 140], [98, 164], [112, 154]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" ${solid}/>`),
  ];
}

function antibodyEpitope() {
  const s = 0.72;
  const tips = [-1, 1].map(side => {
    const u = [side * Math.sin(48 * Math.PI / 180), -Math.cos(48 * Math.PI / 180)], d = 105 * s + 4;
    return [n(128 + u[0] * d), n(150 + u[1] * d), side * 48];
  });
  return [
    `<path d="${K.smoothClosedPath(K.polarPoints(128, 50, a => K.ellipseRadius(108, 42, a) + 3 * Math.sin(7 * a + 1) + 2 * Math.sin(11 * a), 140))}" ${line(8)}/>`,
    ...tips.map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="7" transform="rotate(${a} ${x} ${y})" ${solid}/>`),
    `<g transform="translate(128 150) scale(${s}) translate(-128 -112)">`, ...iggAntibody(), `</g>`,
  ];
}

function igaDimer() {
  const unit = (x, deg) => `<path d="M0 38L0 2M0 2L-40 -38M0 2L40 -38" transform="translate(${x} 128) rotate(${deg})" ${line(11)}/>`;
  return [unit(80, -90), unit(176, 90), `<circle cx="128" cy="128" r="7" ${solid}/>`, `<path d="M92 106Q128 74 164 106" ${line(9)}/>`];
}

function tollLikeReceptor() {
  const { centre: [cx, cy], from, to } = K.TLR;
  const arc = K.smoothOpenPath(K.arcPoints(cx, cy, 34, from, to));
  const [ex, ey] = K.arcPoints(cx, cy, 34, from, to).pop(), leg = `M${n(ex)} ${n(ey)}L${n(ex)} 212`;
  return [
    `<path d="M24 172H232M24 198H232" ${line(5)}/>`,
    `<path d="${leg}${K.mirrorX(leg)}" ${line(6)}/>`,
    `<path d="${arc}${K.mirrorX(arc)}" ${line(14)}/>`,
    ...[112, 144].map(x => `<ellipse cx="${x}" cy="222" rx="13" ry="10" ${solid}/>`),
    ...[[128, 40], [121, 54], [135, 54], [128, 68]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" ${solid}/>`),
    `<path d="M123 78L120 90M133 78L136 90" ${line(3)}/>`,
  ];
}

function c3bOpsonisation() {
  const { P: [px, py] } = K.OPSONISATION, at = (a, r) => [n(px + r * Math.cos(a * Math.PI / 180)), n(py + r * Math.sin(a * Math.PI / 180))];
  const nucleus = K.polarPoints(0, 0, a => 26 - 9 * Math.exp(-(K.wrapAngle(a - 0.2) ** 2) / (2 * 0.35 ** 2)), 60).map(([x, y]) => [64 + 1.15 * x, 128 + y]);
  return [
    `<path d="${K.phagocyteCup()}" ${line(6)}/>`,
    `<path d="${K.smoothClosedPath(nucleus)}" ${solid}/>`,
    `<circle cx="${px}" cy="${py}" r="26" ${solid}/>`,
    ...Array.from({ length: 16 }, (_, k) => { const a = k * 22.5 + 6, [x, y] = at(a, 36); return `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="3.5" transform="rotate(${a} ${x} ${y})" ${solid}/>`; }),
  ];
}

function inflammasome() {
  const I = K.INFLAMMASOME, [cx, cy] = I.centre;
  const at = (deg, r) => [n(cx + r * Math.cos(deg * Math.PI / 180)), n(cy + r * Math.sin(deg * Math.PI / 180))];
  const subunits = Array.from({ length: I.count }, (_, i) => {
    const a = i * 360 / I.count, [x, y] = at(a, I.nacht), [p, q] = [at(a, I.nacht + 9), at(a, I.lrr - 5)];
    return `<path d="M${p[0]} ${p[1]}L${q[0]} ${q[1]}" ${line(4)}/><path d="${K.smoothOpenPath(K.arcPoints(cx, cy, I.lrr, a - 11, a + 11, 2))}" ${line(10)}/>` +
      `<ellipse cx="${x}" cy="${y}" rx="10" ry="9" transform="rotate(${a} ${x} ${y})" ${solid}/>`;
  });
  // The ASC filament is shown where it has left the wheel.
  const beads = [];
  for (let d = 70; d <= I.filament.to; d += 13) { const [x, y] = at(I.filament.angle, d); beads.push(`<circle cx="${x}" cy="${y}" r="4.5" ${solid}/>`); }
  const [kx, ky, ka] = I.caspase;
  return [
    ...subunits, `<circle cx="${cx}" cy="${cy}" r="11" ${solid}/>`, ...beads,
    `<g transform="translate(${kx} ${ky}) rotate(${ka})"><ellipse cy="-9" rx="14" ry="6.5" ${solid}/><ellipse cy="9" rx="14" ry="6.5" ${solid}/></g>`,
    ...I.il1b.map(([x, y, a]) => [0, 120, 240].map(b => {
      const t = (a + b - 90) * Math.PI / 180;
      return `<circle cx="${n(x + 6 * Math.cos(t))}" cy="${n(y + 6 * Math.sin(t))}" r="7" ${solid}/>`;
    }).join('')),
  ];
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

function vaccine() {
  const vial = 'M44 108Q44 94 58 90L60 80L88 80L90 90Q104 94 104 108L104 200Q104 210 94 210L54 210Q44 210 44 200Z';
  return [
    `<path d="${vial}" ${line(8)}/>`,
    `<path d="M54 132H94V196Q94 200 90 200H58Q54 200 54 196Z" ${solid}/>`,
    `<rect x="60" y="66" width="28" height="7" rx="2" ${solid}/>`,
    `<rect x="56" y="44" width="36" height="19" rx="5" ${solid}/>`,
    `<g transform="translate(160 140) rotate(-45)">`,
    `<line x1="-100" y1="0" x2="-60" y2="0" ${line(THIN)}/>`,
    `<rect x="-108" y="-16" width="8" height="32" rx="3" ${solid}/>`,
    `<rect x="-66" y="-24" width="6" height="48" rx="3" ${solid}/>`,
    `<rect x="-56" y="-14" width="100" height="28" rx="4" ${line(5)}/>`,
    `<rect x="-8" y="-8" width="46" height="16" rx="2" ${solid}/>`,
    `<rect x="-20" y="-9" width="6" height="18" rx="2" ${solid}/>`,
    ...Array.from({ length: 5 }, (_, i) => `<line x1="${-46 + i * 8}" y1="-10" x2="${-46 + i * 8}" y2="-5" ${line(2)}/>`),
    `<path d="M48 -7L57 -4L57 4L48 7Z" ${solid}/>`,
    `<line x1="57" y1="0" x2="96" y2="0" ${line(4)}/>`,
    `</g>`,
  ];
}

function oralSuspension() {
  const bottle = 'M62 104Q62 86 80 82L84 70L130 70L134 82Q152 86 152 104L152 216Q152 228 140 228L74 228Q62 228 62 216Z';
  return [
    `<path d="${bottle}" ${line(LINE)}/>`,
    `<rect x="78" y="28" width="58" height="32" rx="6" ${solid}/>`,
    `<rect x="76" y="122" width="62" height="64" rx="3" ${line(5)}/>`,
    ...[[136, 44], [148, 34], [160, 46], [172, 28]].map(([y, w]) => `<rect x="85" y="${y}" width="${w}" height="5" rx="2.5" ${solid}/>`),
    `<g transform="translate(196 132) rotate(12)">`,
    `<line x1="0" y1="-98" x2="0" y2="-80" ${line(THIN)}/>`,
    `<rect x="-15" y="-106" width="30" height="8" rx="3" ${solid}/>`,
    `<rect x="-20" y="-82" width="40" height="6" rx="3" ${solid}/>`,
    `<rect x="-12" y="-70" width="24" height="120" rx="4" ${line(5)}/>`,
    `<rect x="-6" y="-2" width="12" height="46" rx="2" ${solid}/>`,
    `<rect x="-7" y="-12" width="14" height="5" rx="2" ${solid}/>`,
    `<rect x="-4" y="52" width="8" height="12" rx="2" ${solid}/>`,
    `</g>`,
  ];
}

function mrnaVaccine() {
  const R = 74;
  const strand = Array.from({ length: 181 }, (_, i) => {
    const t = i / 180, a = t * 2 * Math.PI * 1.6 + 0.3, r = 26 + 14 * Math.sin(3 * a + 1);
    return [128 + r * Math.cos(a), 128 + r * Math.sin(a)];
  });
  const peg = [0.3, 1.1, 1.9, 2.7, 3.5, 4.3, 5.1, 5.9].map(a => K.smoothOpenPath(Array.from({ length: 9 }, (_, i) => {
    const r = R + 7 + i * 2.7, w = 3 * Math.sin(i * 1.4);
    return [128 + r * Math.cos(a) - w * Math.sin(a), 128 + r * Math.sin(a) + w * Math.cos(a)];
  })));
  return [
    `<path d="${peg.join('')}" ${line(3)}/>`,
    ...Array.from({ length: 32 }, (_, k) => { const a = k * 2 * Math.PI / 32; return `<circle cx="${n(128 + R * Math.cos(a))}" cy="${n(128 + R * Math.sin(a))}" r="4.5" ${solid}/>`; }),
    `<path d="${K.smoothOpenPath(strand)}" ${line(5)}/>`,
  ];
}

const { hexagon } = K;

function cellWallAntibiotic() {
  const P = K.PEPTIDOGLYCAN, [rows, xs] = [P.rows, P.sugars], [bx, by] = P.pbp;
  const pegs = rows.slice(0, -1).flatMap((y, row) => xs.filter((_, i) => i % 2).map(x => {
    const y1 = rows[row + 1];
    // Uncross-linked stems hang free where the PBP is blocked.
    return P.blocked(x, row) ? `M${x} ${y + 9}V${y + 16}M${x} ${y1 - 16}V${y1 - 9}` : `M${x} ${y + 9}V${y1 - 9}`;
  }));
  return [
    `<path d="${pegs.join('')}" ${line(5)}/>`,
    `<path d="${rows.map(y => `M${xs[0]} ${y}H${xs[xs.length - 1]}`).join('')}" ${line(3)}/>`,
    ...rows.flatMap(y => xs.map(x => `<polygon points="${hexagon(x, y, 7.5, 30)}" ${solid}/>`)),
    `<path d="${K.smoothClosedPath(K.polarPoints(bx, by, a => 25 + 2 * Math.sin(5 * a) - 8 * Math.exp(-(K.wrapAngle(a + 2.4) ** 2) / (2 * 0.3 ** 2)), 90))}" ${line(5)}/>`,
    ...[[bx - 20, by - 16, 40, 1.1], [60, 40, 15, 1.2], [150, 34, -20, 1.2], [210, 46, 25, 1.2]].map(([x, y, a, s]) =>
      `<rect x="-11" y="-5" width="22" height="10" rx="5" transform="translate(${x} ${y}) rotate(${a}) scale(${s})" ${solid}/>`),
  ];
}

function conjugateVaccine() {
  const cx = 128, cy = 140;
  const chains = K.CONJUGATE_CHAINS.map(([deg, count]) => Array.from({ length: count }, (_, k) => {
    const a = (deg + k * 7) * Math.PI / 180, r = 64 + k * 17;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a), deg + k * 7];
  }));
  return [
    `<path d="${chains.map(ch => { const a = ch[0][2] * Math.PI / 180; return `M${n(cx + 44 * Math.cos(a))} ${n(cy + 44 * Math.sin(a))}` + ch.map(([x, y]) => `L${n(x)} ${n(y)}`).join(''); }).join('')}" ${line(3)}/>`,
    `<path d="${K.smoothClosedPath(K.polarPoints(cx, cy, a => 46 + 4 * Math.sin(5 * a + 1) + 2 * Math.sin(9 * a), 120))}" ${solid}/>`,
    ...chains.flat().map(([x, y, d]) => `<polygon points="${hexagon(x, y, 6, d)}" ${solid}/>`),
  ];
}

function viralVectorVaccine() {
  const { V, P, rim, rimVertices, edgeLine } = icosahedronLines(64);
  const genome = Array.from({ length: 161 }, (_, i) => {
    const a = i / 160 * 2 * Math.PI * 1.7 + 0.4, r = 22 + 11 * Math.sin(3 * a + 0.5);
    return [128 + r * Math.cos(a), 128 + r * Math.sin(a)];
  });
  return [
    ...[...rimVertices].map(i => {
      const [a, b] = [P(V[i]), P(V[i].map(c => c * 1.48))];
      return `<line x1="${n(a[0])}" y1="${n(a[1])}" x2="${n(b[0])}" y2="${n(b[1])}" ${line(THIN)}/><circle cx="${n(b[0])}" cy="${n(b[1])}" r="9" ${solid}/>`;
    }),
    ...rim.map(k => edgeLine(k, 8)),
    `<path d="${K.smoothOpenPath(genome)}" ${line(4)}/>`,
    `<path d="${K.smoothOpenPath(genome.slice(70, 104))}" ${line(10)}/>`,
  ];
}

function monoclonalAntibody() {
  const S = K.MAB_SYRINGE, [x, y, a] = S.at, [b0, b1, h] = S.barrel;
  return [
    // A bold antibody: the full domain drawing breaks up at this size.
    `<path d="M0 44L0 4M0 4L-30 -32M0 4L30 -32" transform="translate(76 98) rotate(-16)" ${line(16)}/>`,
    `<path d="M-14 -4L-38 -32M14 -4L38 -32" transform="translate(76 98) rotate(-16)" ${line(9)}/>`,
    `<g transform="translate(${x} ${y}) rotate(${a})">`,
    `<line x1="${S.plunger + 6}" y1="0" x2="${b0 - 2}" y2="0" ${line(THIN)}/>`,
    `<rect x="${S.plunger}" y="-16" width="8" height="32" rx="3" ${solid}/>`,
    `<rect x="${b0 - 9}" y="-26" width="7" height="52" rx="3" ${solid}/>`,
    `<rect x="${b0}" y="${-h}" width="${b1 - b0}" height="${2 * h}" rx="4" ${line(5)}/>`,
    `<rect x="${b0 + 4}" y="${-h + 4}" width="7" height="${2 * h - 8}" rx="2" ${solid}/>`,
    `<rect x="${b0 + 16}" y="${-h + 7.5}" width="${b1 - b0 - 24}" height="${2 * h - 15}" rx="2" ${solid}/>`,
    `<path d="M${b1 + 2} -7L${b1 + 14} -5L${b1 + 14} 5L${b1 + 2} 7Z" ${solid}/>`,
    `<line x1="${b1 + 14}" y1="0" x2="${S.needle}" y2="0" ${line(4)}/>`,
    `</g>`,
  ];
}

function nasalSprayVaccine() {
  const N = K.NASAL_SPRAY, [x, y, a, s] = N.at, { spread, reach } = N.plume;
  const rand = K.rng(71), mist = [];
  for (let tries = 0; mist.length < 22 && tries < 2000; tries++) {
    const d = 10 + Math.sqrt(rand()) * (reach - 14), p = N.from(d, (rand() * 2 - 1) * spread * 0.9);
    const clear = N.virions.every(([vd, deg, r]) => { const v = N.from(vd, deg); return Math.hypot(p[0] - v[0], p[1] - v[1]) > r + 12; });
    if (clear && mist.every(q => Math.hypot(p[0] - q[0], p[1] - q[1]) > 10)) mist.push(p);
  }
  const [bx, by, bw, bh] = N.barrel, [cx, cy, cw, ch] = N.clip, [px, py, pw, ph] = N.plunger, [hx, hy, hw, hh] = N.thumb;
  return [
    ...mist.map(([mx, my]) => `<circle cx="${n(mx)}" cy="${n(my)}" r="2.6" ${solid}/>`),
    ...N.virions.map(([d, deg, r]) => {
      const [vx, vy] = N.from(d, deg);
      const spikes = Array.from({ length: 10 }, (_, k) => { const b = k / 10 * 2 * Math.PI; return `M${n(vx + (r + 1) * Math.cos(b))} ${n(vy + (r + 1) * Math.sin(b))}L${n(vx + (r + 5) * Math.cos(b))} ${n(vy + (r + 5) * Math.sin(b))}`; }).join('');
      return `<path d="${spikes}" ${line(2.5)}/><circle cx="${n(vx)}" cy="${n(vy)}" r="${r}" ${solid}/>`;
    }),
    `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`,
    `<line x1="0" y1="${by + bh + 2}" x2="0" y2="${py + ph}" ${line(THIN)}/>`,
    `<rect x="${hx}" y="${hy}" width="${hw}" height="${hh}" rx="4" ${solid}/>`,
    `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="3" ${solid}/>`,
    `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" ${line(5)}/>`,
    `<rect x="${bx + 8}" y="${by + 34}" width="${bw - 16}" height="${bh - 42}" rx="2" ${solid}/>`,
    `<path d="${N.nozzle}" ${solid}/>`,
    `</g>`,
  ];
}

function carTCell() {
  const T = K.CAR_T, [tx, ty, R] = T.cell, [gx, gy, gr] = T.target;
  const blob = (x, y, r, k) => K.smoothClosedPath(K.polarPoints(x, y, a => r + 1.5 * Math.sin(k * a)));
  const toT = Math.atan2(ty - gy, tx - gx) * 180 / Math.PI;
  return [
    ...[toT - 70, toT - 35, toT, toT + 35, toT + 70, toT + 120, toT - 120, toT + 180].map(deg => `<g transform="rotate(${n(deg)} ${gx} ${gy})">` +
      `<line x1="${gx + gr + 1}" y1="${gy}" x2="${gx + gr + 5}" y2="${gy}" ${line(3)}/><circle cx="${gx + gr + 8}" cy="${gy}" r="4" ${solid}/></g>`),
    `<path d="${blob(gx, gy, gr - 3, 5)}" ${line(6)}/>`,
    `<circle cx="${gx + 2}" cy="${gy + 2}" r="${gr - 14}" ${solid}/>`,
    // Each CAR: hinge, scFv outside, and its signalling domain inside the membrane.
    ...T.cars.map(deg => `<g transform="rotate(${deg} ${tx} ${ty})"><line x1="${tx + R + 4}" y1="${ty}" x2="${tx + R + 14}" y2="${ty}" ${line(4)}/>` +
      `<circle cx="${tx + R + 21}" cy="${ty - 7.5}" r="5.5" ${solid}/><circle cx="${tx + R + 21}" cy="${ty + 7.5}" r="5.5" ${solid}/><circle cx="${tx + R - 13}" cy="${ty}" r="4.5" ${solid}/></g>`),
    `<path d="${blob(tx, ty, R, 6)}" ${line(8)}/>`,
    `<path d="${blob(tx - 6, ty - 6, 24, 4)}" ${solid}/>`,
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

function bloodAgarPlate() {
  const rand = K.rng(21);
  const place = (count, region, r, spacing) => {
    const out = [];
    for (let tries = 0; out.length < count && tries < 8000; tries++) {
      const u = rand() * 2 - 1, v = rand() * 2 - 1;
      if (u * u + v * v > 0.8 || !region(u, v)) continue;
      const p = [128 + 88 * u, 120 + 45 * v];
      if (out.every(q => Math.hypot(q[0] - p[0], (q[1] - p[1]) * 1.9) > spacing)) out.push([...p, r]);
    }
    return out;
  };
  const colonies = [
    ...place(20, u => u < -0.3, 4, 13),
    ...place(10, (u, v) => u > -0.2 && v < -0.1, 4.5, 20),
    ...place(6, (u, v) => u > -0.1 && v > 0.15, 6.5, 36),
  ];
  return [
    `<ellipse cx="128" cy="112" rx="104" ry="56" ${line(8)}/>`,
    `<path d="M24 112V136A104 56 0 0 0 232 136V112" ${line(8)}/>`,
    `<path d="${K.smoothOpenPath([[100, 82], [130, 90], [110, 98], [148, 104], [124, 110], [170, 112]])}" ${line(2.5)}/>`,
    `<path d="${K.smoothOpenPath([[132, 132], [178, 128], [140, 144], [190, 140], [150, 156], [196, 150]])}" ${line(2.5)}/>`,
    ...colonies.map(([x, y, r]) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${r}" ry="${n(r * 0.62)}" ${solid}/>`),
  ];
}

function lungs() {
  const left = 'M112 92C98 74 72 76 56 100C38 128 32 178 36 214C38 232 54 238 72 232C92 226 108 222 116 210C121 172 120 124 112 92Z';
  const right = 'M144 92C158 74 184 76 200 100C218 128 224 178 220 214C218 232 202 238 184 232C164 226 148 222 140 210C148 198 152 186 146 172C140 158 136 124 144 92Z';
  const tree = 'M108 120L84 150M96 134L70 126M84 150L66 186M84 150L98 192M70 126L56 114M66 186L54 206M98 192L104 214';
  const mirror = d => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${256 - Number(x)} ${y}`);
  return [
    `<path d="${left}" ${line(LINE)}/>`, `<path d="${right}" ${line(LINE)}/>`,
    `<path d="${tree}${mirror(tree)}" ${line(4)}/>`,
    `<path d="M128 88Q128 104 116 112L106 122M128 88Q128 104 140 112L150 122" ${line(8)}/>`,
    ...Array.from({ length: 8 }, (_, k) => `<rect x="119" y="${14 + k * 9}" width="18" height="6" rx="2" ${solid}/>`),
  ];
}

function child() {
  return [
    `<path d="M113 182L113 222M143 182L143 222" ${line(15)}/>`,
    ...[110, 146].map(x => `<ellipse cx="${x}" cy="230" rx="14" ry="7" ${solid}/>`),
    `<path d="M98 156L158 156L162 188L132 188L128 176L124 188L94 188Z" ${solid}/>`,
    `<path d="M80 132L72 172M176 132L184 172" ${line(13)}/>`,
    `<path d="M98 96Q128 88 158 96L184 128L170 140L158 126L158 160L98 160L98 126L86 140L72 128Z" ${solid} stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
    ...[99, 157].map(x => `<circle cx="${x}" cy="58" r="6" ${solid}/>`),
    `<circle cx="128" cy="56" r="29" ${solid}/>`,
  ];
}

function newborn() {
  // Silhouette: hood and wrapped body in ink, the face cut out of the hood (evenodd).
  return [
    `<g transform="translate(0 -6)">`,
    `<path d="${K.circlePath(128, 88, 52)}${K.circlePath(128, 92, 30)}" fill-rule="evenodd" ${solid}/>`,
    `<path d="M70 132Q100 140 128 128Q156 140 186 132C200 170 192 214 170 228C150 238 106 238 86 228C64 214 56 170 70 132Z" ${solid}/>`,
    `</g>`,
  ];
}

function baby() {
  const arm = 'M100 116Q86 136 84 156', leg = 'M106 188Q88 204 70 208';
  return [
    `<path d="${leg}${K.mirrorX(leg)}" ${line(22)}/>`,
    ...[62, 194].map(x => `<ellipse cx="${x}" cy="206" rx="14" ry="11" ${solid}/>`),
    `<path d="M96 108Q128 98 160 108Q172 142 164 170L92 170Q84 142 96 108Z" ${solid}/>`,
    `<path d="M88 158Q128 168 168 158Q172 186 152 198Q128 206 104 198Q84 186 88 158Z" ${solid}/>`,
    `<path d="${arm}${K.mirrorX(arm)}" ${line(17)}/>`,
    ...[84, 172].map(x => `<circle cx="${x}" cy="160" r="10" ${solid}/>`),
    ...[93, 163].map(x => `<circle cx="${x}" cy="68" r="7" ${solid}/>`),
    `<circle cx="128" cy="64" r="35" ${solid}/>`,
  ];
}

// ------------------------------------------------------- antimicrobial resistance

const pillShape = (x, y, rot) => `<rect x="-11" y="-5" width="22" height="10" rx="5" transform="translate(${n(x)} ${n(y)}) rotate(${rot})" ${solid}/>`;

function betaLactamase() {
  // The drug sits inside a lumpy enzyme outline with only a shallow dent at its active site:
  // a round outline with a deep cleft read as an apple with a bite out of it at small sizes.
  const blob = K.polarPoints(118, 128, a => K.ellipseRadius(92, 80, a) + 4 * Math.sin(5 * a + 1) + 2 * Math.sin(8 * a) -
    12 * Math.exp(-(K.wrapAngle(a) ** 2) / (2 * 0.25 ** 2)), 140);
  return [
    `<path d="${K.smoothClosedPath(blob)}" ${line(LINE)}/>`,
    // β-lactam ring (its C–N bond breaking) fused to the five-membered ring.
    `<g transform="translate(-6 -4)">`,
    `<path d="M150 114L176 114L176 140L150 140M150 140L142 164L163 180L184 164L176 140M150 114L138 100M150 114L150 121M150 133L150 140" ${line(6)}/>`,
    `<path d="M139 121L134 117M140 127L133 127M139 133L134 137" ${line(3)}/>`,
    ...[[150, 140], [137, 98], [184, 164]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.5" ${solid}/>`),
    `</g>`,
  ];
}

function effluxPump() {
  return [
    `<path d="M24 148H86M170 148H234M24 174H86M170 174H234" ${line(5)}/>`,
    `<rect x="96" y="82" width="64" height="128" rx="20" ${line(8)}/>`,
    `<rect x="117" y="92" width="22" height="108" rx="11" ${line(4)}/>`,
    pillShape(128, 176, 90), pillShape(128, 128, 90),
    `<path d="M128 72V32M117 45L128 31L139 45" ${line(4)}/>`,
    pillShape(158, 46, -30), pillShape(62, 70, 25), pillShape(196, 92, -15), pillShape(58, 212, 20), pillShape(200, 210, -35),
  ];
}

function plasmidTransfer() {
  const Q = K.CONJUGATION, { donor, recipient, s, r } = Q, [[px, py], [cx, cy]] = [Q.plasmid, Q.chromosome];
  const gene = (x, y) => { const [p, q] = [[x + 10 * Math.cos(-2.2), y + 10 * Math.sin(-2.2)], [x + 10 * Math.cos(-0.6), y + 10 * Math.sin(-0.6)]]; return `M${n(p[0])} ${n(p[1])}A10 10 0 0 1 ${n(q[0])} ${n(q[1])}`; };
  const rod = ([x, y, a], k) => `<g transform="translate(${x} ${y}) rotate(${a})">` +
    `<rect x="${-(s + r)}" y="${-r}" width="${2 * (s + r)}" height="${2 * r}" rx="${r}" ${line(8)}/>` +
    `<path d="${K.smoothClosedPath(K.polarPoints(k * cx, k * cy, a => 0.8 * (9 + 3 * Math.sin(3 * a) + 2 * Math.sin(5 * a + 1)), 40))}" ${line(3)}/>` +
    `<circle cx="${k * px}" cy="${k * py}" r="10" ${line(4)}/><path d="${gene(k * px, k * py)}" ${line(8)}/></g>`;
  const [b0, b1] = [K.toGlobal(donor, Q.bridge, r), K.toGlobal(recipient, -Q.bridge, -r)];
  return [`<path d="M${n(b0[0])} ${n(b0[1])}L${n(b1[0])} ${n(b1[1])}" ${line(6)}/>`, rod(donor, 1), rod(recipient, -1)];
}

function susceptibilityPlate() {
  const discs = [[128, 70, 34], [188, 112, 26], [168, 182, 0], [88, 184, 40], [66, 112, 18]];
  return [
    `<circle cx="128" cy="128" r="108" ${line(8)}/>`,
    `<circle cx="128" cy="128" r="98" ${line(3)}/>`,
    ...discs.filter(([, , z]) => z).map(([x, y, z]) => `<circle cx="${x}" cy="${y}" r="${z}" ${line(3)} stroke-dasharray="4 5"/>`),
    ...discs.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" ${solid}/>`),
  ];
}

// ------------------------------------------------------------------ organs

// The supplied line art's fine lines look faint below about 64 px, so the single-colour versions
// stroke them in ink as well, thickening every line by this many pixels on the canvas.
const ART_THICKEN = 1.5;
const thickened = scale => `stroke="${INK}" stroke-width="${n(ART_THICKEN / scale)}" stroke-linejoin="round"`;

function brain() {
  // The supplied line art, fitted to the canvas.
  const art = K.ORGANS.brainArt;
  return [`<path d="${art.d}" transform="${art.transform}" ${solid} ${thickened(art.scale)}/>`];
}

function heart() {
  // The supplied line art, fitted to the canvas, with the line at the pulmonary trunk's base completed.
  const A = K.ORGANS.heartArt;
  return [
    `<g transform="${A.transform}">`,
    `<path d="${A.d}" ${solid} ${thickened(A.scale)}/>`,
    `<path d="${K.ORGANS.pulmonaryTrunkBase}" fill="none" stroke="${INK}" stroke-width="${n(1.1 + ART_THICKEN / A.scale)}" stroke-linecap="round"/>`,
    `</g>`,
  ];
}

function kidneys() {
  const kidney = 'M70 24C98 24 108 50 104 68C100 80 92 80 92 90C92 100 102 104 102 116C100 134 88 146 70 146C46 146 36 116 36 84C36 48 46 24 70 24Z';
  const pelvis = 'M98 76C88 78 84 84 85 90C84 96 88 102 98 104Z', ureter = 'M94 102C104 130 108 160 112 180';
  return [
    `<g transform="translate(0 -6)">`,
    `<path d="${kidney}${K.mirrorX(kidney)}" ${line(LINE)}/>`,
    `<path d="${pelvis}${K.mirrorX(pelvis)}" ${solid}/>`,
    `<path d="${ureter}${K.mirrorX(ureter)}M128 226L128 240" ${line(6)}/>`,
    `<path d="M86 186C86 172 104 166 128 166C152 166 170 172 170 186C170 214 152 228 128 228C104 228 86 214 86 186Z" ${line(LINE)}/>`,
    `</g>`,
  ];
}

function liver() {
  return [
    `<path d="M38 108C36 74 86 58 150 60C198 62 228 76 222 98C216 122 178 148 138 166C114 176 88 182 70 172C46 158 40 134 38 108Z" ${line(LINE)}/>`,
    `<path d="M150 66C148 94 140 126 128 160" ${line(4)}/>`,
    `<ellipse cx="108" cy="188" rx="12" ry="16" transform="rotate(-20 108 188)" ${solid}/>`,
  ];
}

function intestines() {
  return [
    `<g transform="translate(0 -6)">`,
    `<path d="${K.smoothOpenPath(K.ORGANS.smallIntestine())}" ${line(10)}/>`,
    `<path d="M80 224C88 238 100 236 98 226" ${line(7)}/>`,
    ...K.ORGANS.colonSacs().map(([x, y, r]) => `<circle cx="${n(x)}" cy="${n(y)}" r="${r}" ${solid}/>`),
    `</g>`,
  ];
}

function skin() {
  const xs = Array.from({ length: 27 }, (_, i) => 24 + i * 8);
  const surface = K.smoothOpenPath(xs.map(x => [x, 60 + 3 * Math.sin(x / 10)]));
  const lobules = [];
  for (const [row, y] of [[0, 174], [1, 198]]) for (let x = 40 + row * 11; x <= 218; x += 23) lobules.push([x, y]);
  return [
    `<path d="${surface}L232 216L24 216Z" ${line(8)}/>`,
    `<path d="${K.smoothOpenPath(xs.map(x => [x, 86 + 6 * Math.sin(x / 8)]))}" ${line(4)}/>`,
    `<path d="${K.smoothOpenPath(xs.map(x => [x, 154 + 4 * Math.sin(x / 18)]))}" ${line(3)}/>`,
    ...lobules.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" ${line(3)}/>`),
    `<path d="M28 126C64 114 104 136 144 122C176 112 206 128 228 120M28 140C64 130 104 150 144 138C176 128 206 144 228 136" ${line(4)}/>`,
    `<path d="M182 64C184 92 176 118 182 138" ${line(3)}/>`,
    `<path d="M92 20L118 146" ${line(4)}/>`,
    `<ellipse cx="119" cy="152" rx="9" ry="11" ${solid}/>`,
  ];
}

function bone() {
  // One shape: shaft and four end lobes wound the same way, the marrow window wound the
  // opposite way so it stays a hole.
  const ends = [[-14, -84], [14, -84], [-14, 84], [14, 84]].map(([x, y]) => K.circlePath(x, y, 21)).join('');
  return [`<path d="M-15 -72V72H15V-72Z${ends}M-8 -50H8V50H-8Z" transform="translate(128 128) rotate(-40)" ${solid}/>`];
}

function kneeJoint() {
  return [
    `<rect x="72" y="96" width="112" height="82" rx="34" ${line(3)} stroke-dasharray="2 8"/>`,
    `<path d="M108 12L148 12L150 84C170 92 176 112 168 128C160 140 142 138 134 128L122 128C114 138 96 140 88 128C80 112 86 92 106 84Z" ${line(LINE)}/>`,
    `<path d="M84 152Q84 144 128 144Q172 144 172 152L172 162Q168 178 150 186L148 238L108 238L106 186Q88 178 84 162Z" ${line(LINE)}/>`,
    `<rect x="186" y="180" width="10" height="56" rx="5" ${line(5)}/>`,
    `<circle cx="191" cy="171" r="8" ${line(5)}/>`,
  ];
}

function lymphNode() {
  return [
    `<path d="M34 74L64 92M30 158L60 151M96 24L108 54" ${line(6)}/>`,
    `<path d="M196 126L232 116M198 140L234 142M196 154L232 166" ${line(6)}/>`,
    `<path d="M60 128C60 74 100 52 140 56C184 60 206 90 204 112C202 124 186 124 186 136C186 148 204 152 202 166C198 194 168 208 132 206C90 204 60 180 60 128Z" ${line(LINE)}/>`,
    `<path d="M128 130C150 128 168 132 180 136M126 146C150 150 168 150 180 146M130 114C150 112 164 118 178 126" ${line(3)}/>`,
    ...[[92, 96], [122, 78], [158, 82], [84, 134], [94, 170], [130, 184], [164, 176]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" ${solid}/>`),
  ];
}

function spleen() {
  return [
    `<path d="M48 168C40 112 82 52 148 42C190 36 214 58 210 84C206 96 190 96 182 108C168 128 168 150 150 168C126 192 96 208 70 204C56 200 50 186 48 168Z" ${line(LINE)}/>`,
    `<path d="M68 108L80 113M98 68L106 78" ${line(4)}/>`,
    `<path d="M170 136C186 152 204 170 226 182M162 146C178 168 196 188 216 206" ${line(7)}/>`,
  ];
}

function thymus() {
  const lobe = cx => K.smoothClosedPath(K.polarPoints(cx, 132, a => K.ellipseRadius(22 + 6 * Math.max(0, Math.sin(a)), 84, a) + 1.5 * Math.sin(9 * a), 120));
  return [`<path d="${lobe(94)}${lobe(162)}" ${line(LINE)}/>`];
}

function thermometer() {
  return [
    `<g transform="translate(128 128) rotate(40)">`,
    `<rect x="-16" y="-100" width="32" height="160" rx="16" ${line(7)}/>`,
    `<path d="${Array.from({ length: 8 }, (_, i) => `M5 ${-82 + i * 16}H11`).join('')}" ${line(3)}/>`,
    `<rect x="-5" y="-62" width="10" height="140" rx="5" ${solid}/>`,
    `<circle cy="82" r="24" ${solid}/>`,
    `</g>`,
  ];
}

function stethoscope() {
  return [
    `<path d="M128 128C128 178 92 214 124 226C152 236 168 222 172 202" ${line(10)}/>`,
    `<path d="M84 46C84 92 100 120 128 128C156 120 172 92 172 46M172 200L178 190" ${line(6)}/>`,
    ...[84, 172].map(x => `<ellipse cx="${x}" cy="38" rx="9" ry="11" ${solid}/>`),
    `<circle cx="190" cy="172" r="28" ${line(7)}/>`,
    `<circle cx="190" cy="172" r="14" ${solid}/>`,
  ];
}

function lumbarPuncture() {
  const ys = [70, 132, 194];
  return [
    `<path d="M112 40V232M119 40V232M126 40V232" ${line(2.5)}/>`,
    ...[95, 157].map(y => `<rect x="46" y="${y + 2}" width="54" height="8" rx="4" ${solid}/>`),
    ...ys.map(y => `<rect x="42" y="${y - 22}" width="58" height="44" rx="9" ${line(6)}/>`),
    ...ys.map(y => `<path d="M136 ${y - 16}L186 ${y - 1}Q198 ${y + 6} 188 ${y + 14}L136 ${y + 16}Z" ${line(6)}/>`),
    `<path d="M120 164L222 151" ${line(4)}/>`,
    `<rect x="222" y="143" width="20" height="14" rx="3" transform="rotate(-7 232 150)" ${solid}/>`,
    `<path d="M236 166C240 172 242 176 242 179A6 6 0 0 1 230 179C230 176 232 172 236 166Z" ${solid}/>`,
  ];
}

function npSwab() {
  return [
    `<path d="M150 90H200V218Q200 228 190 228H160Q150 228 150 218Z" ${line(8)}/>`,
    `<path d="M160 166H190V214Q190 218 186 218H164Q160 218 160 214Z" ${solid}/>`,
    `<rect x="146" y="48" width="58" height="34" rx="6" ${solid}/>`,
    `<path d="M40 30L114 198" ${line(6)}/>`,
    `<ellipse rx="8" ry="18" transform="translate(121 214) rotate(-23.8)" ${solid}/>`,
  ];
}

function ivCannula() {
  const W = K.CANNULA;
  return [
    `<g transform="translate(136 120) rotate(-35) scale(1.22)">`,
    `<path d="${W.catheter}" ${solid}/>`,
    `<path d="${W.wing}${W.wing.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${x} ${-Number(y)}`)}" ${solid}/>`,
    `<path d="M-40 -9L-30 -11L-6 -11L-6 11L-30 11L-40 9Z" ${solid}/>`,
    `<rect x="-2" y="-9" width="42" height="18" rx="4" ${line(4)}/>`,
    `<path d="${K.circlePath(12, 0, 12)}${K.circlePath(12, 0, 5)}" fill-rule="evenodd" ${solid}/>`,
    `<rect x="44" y="-9" width="22" height="18" rx="3" ${solid}/>`,
    `</g>`,
  ];
}

function piccLine() {
  const L = K.PICC, [hx, hy, ha] = L.hub;
  return [
    `<path d="${L.catheter}" ${line(6)}/>`,
    `<path d="${L.legs.join('')}" ${line(5)}/>`,
    ...L.clamps.map(([x, y, a]) => `<path d="M-7 -12H7V5Q7 12 0 12Q-7 12 -7 5Z" transform="translate(${x} ${y}) rotate(${a})" ${solid}/>`),
    ...L.connectors.map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-14" y="-7" width="20" height="14" rx="3" ${line(3)}/><rect x="9" y="-8.5" width="12" height="17" rx="3" ${solid}/></g>`),
    `<path d="M-14 -24Q-4 -24 -4 -14L4 -14Q4 -24 14 -24Q20 -24 20 -16L20 16Q20 24 14 24Q4 24 4 14L-4 14Q-4 24 -14 24Q-20 24 -20 16L-20 -16Q-20 -24 -14 -24Z" transform="translate(${hx} ${hy}) rotate(${ha})" ${solid}/>`,
  ];
}

function urineDipstick() {
  return [
    `<path d="M44 116H124V214Q124 228 110 228H58Q44 228 44 214Z" ${line(6)}/>`,
    `<path d="M53 152H115V211Q115 219 107 219H61Q53 219 53 211Z" ${solid}/>`,
    `<rect x="38" y="94" width="92" height="24" rx="5" ${solid}/>`,
    `<g transform="translate(184 128) rotate(14)">`,
    `<rect x="-13" y="-104" width="26" height="208" rx="3" ${line(4)}/>`,
    ...Array.from({ length: 9 }, (_, i) => `<rect x="-5.5" y="${-66 + i * 19}" width="11" height="13" rx="2" ${solid}/>`),
    `</g>`,
  ];
}

function gramStainSlide() {
  const [fx, fy, fr] = [140, 86, 64];
  // Fewer, more widely spaced organisms than the colour version, so each stays distinct.
  const cocci = [[112, 62], [126, 60], [119, 74], [168, 98], [182, 96], [175, 110], [106, 108], [118, 118]];
  const rods = [[152, 56, 30], [166, 72, -20], [98, 86, 80], [140, 100, 15], [146, 128, -35]];
  return [
    `<g transform="rotate(-6 128 190)">`,
    `<rect x="20" y="162" width="216" height="58" rx="3" ${line(5)}/>`,
    `<rect x="28" y="169" width="44" height="44" ${solid}/>`,
    `<path d="${K.smoothClosedPath(K.polarPoints(170, 191, a => K.ellipseRadius(38, 15, a) + 2 * Math.sin(6 * a), 60))}" ${solid}/>`,
    `</g>`,
    `<path d="M150 182L${fx - 44} ${fy + 50}M188 178L${fx + 52} ${fy + 41}" ${line(3)} stroke-dasharray="5 6"/>`,
    `<circle cx="${fx}" cy="${fy}" r="${fr}" ${line(6)}/>`,
    ...rods.map(([x, y, a]) => `<rect x="-10" y="-4" width="20" height="8" rx="4" transform="translate(${x} ${y}) rotate(${a})" ${solid}/>`),
    ...cocci.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" ${solid}/>`),
  ];
}

function lateralFlowTest() {
  return [
    `<g transform="translate(128 128) rotate(-20)">`,
    `<rect x="-42" y="-106" width="84" height="212" rx="18" ${line(6)}/>`,
    `<path d="M-18 -90H18M-18 -82H18M-18 -74H18" ${line(3)}/>`,
    `<rect x="-18" y="-58" width="36" height="70" rx="6" ${line(4)}/>`,
    ...[-40, -16].map(y => `<rect x="-11" y="${y}" width="22" height="5" rx="1.5" ${solid}/>`),
    `<circle cx="0" cy="58" r="16" ${line(4)}/>`,
    `<circle cx="0" cy="58" r="7" ${solid}/>`,
    `</g>`,
  ];
}

function nebuliserMask() {
  const shape = 'M128 36C152 36 172 66 184 98C196 132 188 158 168 168C150 176 106 176 88 168C68 158 60 132 72 98C84 66 104 36 128 36Z';
  return [
    `<path d="M76 106C48 100 30 108 20 122${K.mirrorX('M76 106C48 100 30 108 20 122')}" ${line(4)}/>`,
    `<path d="M128 224C128 240 170 242 196 232C218 224 230 210 234 196" ${line(6)}/>`,
    `<rect x="118" y="170" width="20" height="16" ${solid}/>`, `<rect x="102" y="182" width="52" height="8" rx="3" ${solid}/>`,
    `<path d="M106 186H150V214Q150 226 138 226H118Q106 226 106 214Z" ${line(5)}/>`,
    `<path d="M114 204H142V212Q142 218 136 218H120Q114 218 114 212Z" ${solid}/>`,
    // Mask outline and its soft rim; the mist and side ports are left out at this simplicity.
    `<path d="${shape}" ${line(8)}/>`,
    `<path d="${shape}" transform="translate(128 108) scale(0.84) translate(-128 -108)" ${line(3)}/>`,
  ];
}

function incubator() {
  return [
    ...[62, 186].map(x => `<rect x="${x}" y="194" width="10" height="28" ${solid}/>`),
    `<rect x="52" y="212" width="152" height="8" rx="3" ${solid}/>`,
    ...[67, 191].map(x => `<circle cx="${x}" cy="228" r="8" ${solid}/>`),
    `<rect x="40" y="150" width="176" height="44" rx="6" ${line(6)}/>`,
    `<rect x="166" y="160" width="36" height="20" rx="3" ${solid}/>`,
    `<path d="M34 150V94Q34 62 66 62H190Q222 62 222 94V150Z" ${line(6)}/>`,
    ...[58, 198].map(x => `<circle cx="${x}" cy="116" r="13" ${line(4)}/>`),
    `<path d="M42 142H214" ${line(4)}/>`,
    `<ellipse cx="140" cy="129" rx="30" ry="11" ${solid}/>`, `<circle cx="102" cy="127" r="11" ${solid}/>`,
  ];
}

function pcrTube() {
  const strand = phase => Array.from({ length: 45 }, (_, i) => [198 + 20 * Math.sin(i / 44 * 2.8 * 2 * Math.PI + phase), 36 + i * 4.2]);
  const [s1, s2] = [strand(0), strand(Math.PI)];
  return [
    `<path d="${s1.filter((_, i) => i % 2 === 1).map((p, k) => { const q = s2[k * 2 + 1]; return `M${n(p[0])} ${n(p[1])}L${n(q[0])} ${n(q[1])}`; }).join('')}" ${line(3)}/>`,
    `<path d="${K.smoothOpenPath(s1)}${K.smoothOpenPath(s2)}" ${line(4.5)}/>`,
    `<g transform="translate(96 140) rotate(-10)">`,
    `<path d="M-22 -52H22V6L5 62Q0 70 -5 62L-22 6Z" ${line(5)}/>`,
    `<path d="M-8 30H8L1 52Q0 54 -1 52Z" ${solid}/>`,
    `<rect x="-26" y="-64" width="52" height="12" rx="3" ${solid}/>`,
    `<path d="M-26 -58L-40 -66" ${line(5)}/>`,
    `<rect x="-22" y="-6" width="44" height="12" rx="4" transform="translate(-58 -78) rotate(-38)" ${line(4)}/>`,
    `</g>`,
  ];
}

function handHygiene() {
  const H = K.HAND, widths = [16, 16, 16, 14, 18];
  const drop = (x, y, s) => `<path d="M${x} ${y - 12 * s}C${x + 4 * s} ${y - 4 * s} ${x + 8 * s} ${y} ${x + 8 * s} ${y + 4 * s}A${8 * s} ${8 * s} 0 0 1 ${x - 8 * s} ${y + 4 * s}C${x - 8 * s} ${y} ${x - 4 * s} ${y - 4 * s} ${x} ${y - 12 * s}Z" ${solid}/>`;
  return [
    ...H.fingers.map(([[x0, y0], [x1, y1]], i) => `<path d="M${x0} ${y0}L${x1} ${y1}" ${line(widths[i])}/>`),
    `<path d="${H.palm}${H.wrist}" ${solid}/>`,
    ...H.bubbles.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${line(3)}/>`),
    drop(196, 206, 1.1), drop(222, 182, 0.8), drop(30, 130, 0.8),
  ];
}

function faceMask() {
  return [
    `<path d="M50 100C14 92 12 160 48 158${K.mirrorX('M50 100C14 92 12 160 48 158')}" ${line(5)}/>`,
    `<path d="M48 92Q128 78 208 92L212 164Q128 182 44 164Z" ${line(8)}/>`,
    `<path d="M58 114Q128 104 198 114M58 134Q128 126 198 134M58 152Q128 148 198 152" ${line(4)}/>`,
  ];
}

function parentAndBaby() {
  return [
    ...[103, 153].map(x => `<circle cx="${x}" cy="54" r="5.5" ${solid}/>`),
    `<circle cx="128" cy="52" r="25" ${solid}/>`,
    // A solid figure with a space cut out of the chest for the baby, then the baby inside it:
    // hood with the face cut out, and the wrapped body.
    `<path d="M84 94Q128 82 172 94Q190 100 192 124L194 238H62L64 124Q66 100 84 94ZM70 150a58 34 0 1 0 116 0a58 34 0 1 0 -116 0Z" fill-rule="evenodd" ${solid}/>`,
    `<path d="${K.circlePath(96, 146, 17)}${K.circlePath(96, 146, 9)}" fill-rule="evenodd" ${solid}/>`,
    `<ellipse cx="142" cy="156" rx="38" ry="20" transform="rotate(-12 142 156)" ${solid}/>`,
  ];
}

function globe() {
  const R = 76, cx = 120, cy = 136;
  // The flight path, left out where it would cross the globe.
  const flight = [];
  for (let k = 0; k <= 60; k++) {
    const t = k / 60, u = 1 - t;
    const p = [0, 1].map(d => u ** 3 * [30, 206][d] + 3 * u * u * t * [22, 128][d] + 3 * u * t * t * [110, 40][d] + t ** 3 * [192, 58][d]);
    flight.push(Math.hypot(p[0] - cx, p[1] - cy) > R + 10 ? p : null);
  }
  const runs = flight.reduce((acc, p) => { if (p) acc[acc.length - 1].push(p); else if (acc[acc.length - 1].length) acc.push([]); return acc; }, [[]]).filter(r => r.length > 1);
  return [
    `<circle cx="${cx}" cy="${cy}" r="${R}" ${line(LINE)}/>`,
    `<path d="${K.graticule(cx, cy, R).map(K.smoothOpenPath).join('')}" ${line(3)}/>`,
    `<path d="${runs.map(K.smoothOpenPath).join('')}" ${line(3.5)} stroke-dasharray="7 7"/>`,
    `<path d="M24 0C24 -3 20 -4.5 15 -4.5L5 -4.5L-7 -22L-13 -22L-6 -4.5L-17 -4.5L-23 -13L-27 -13L-24 0L-27 13L-23 13L-17 4.5L-6 4.5L-13 22L-7 22L5 4.5L15 4.5C20 4.5 24 3 24 0Z" transform="translate(208 64) rotate(14) scale(1.15)" ${solid}/>`,
  ];
}

function pregnantPerson() {
  return [
    `<path d="M110 196L108 228M136 196L140 228" ${line(13)}/>`,
    ...[[103, 233], [145, 233]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="6" ${solid}/>`),
    `<path d="M106 84Q96 92 96 106Q94 118 84 128Q58 148 70 174Q80 188 92 198L152 198Q146 170 148 140Q150 108 142 84Z" ${solid}/>`,
    `<circle cx="150" cy="44" r="11" ${solid}/>`,
    `<circle cx="122" cy="52" r="25" ${solid}/>`,
  ];
}

function ear() {
  const E = K.EAR, [vx, vy, vrx, vry] = E.vestibule, [dx, dy, drx, dry, da] = E.eardrum;
  return [
    `<path d="${E.nerve}" ${line(6)}/>`,
    ...E.canals.map(([x, y, rx, ry, a]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${x} ${y})" ${line(5)}/>`),
    `<path d="${K.smoothOpenPath(K.cochleaPoints())}" ${line(6)}/>`,
    `<ellipse cx="${vx}" cy="${vy}" rx="${vrx}" ry="${vry}" ${solid}/>`,
    `<path d="${E.tube}" ${line(8)}/>`,
    `<path d="${E.malleus}${E.incus}" ${solid}/>`, `<path d="${E.stapes}" ${line(3)}/>`,
    `<path d="${E.outer}" ${line(6)}/>`, `<path d="${E.canal}" ${solid}/>`, `<path d="${E.helix}${E.antihelix}" ${line(4)}/>`,
    `<ellipse cx="${dx}" cy="${dy}" rx="${drx}" ry="${dry}" transform="rotate(${da} ${dx} ${dy})" ${line(3)}/>`,
  ];
}

function eye() {
  const E = K.EYE, [cx, cy] = E.centre, R = E.R, [, ly, lrx, lry] = E.lens, [n0, ny, n1, nh] = E.nerve;
  const at = (deg, r) => [n(cx + r * Math.cos(deg * Math.PI / 180)), n(cy + r * Math.sin(deg * Math.PI / 180))];
  const [a, b] = [at(-138, R - 13), at(138, R - 13)];
  return [
    `<path d="M${n0 - 4} ${ny - nh}L${n1} ${ny - nh - 2}L${n1} ${ny + nh + 2}L${n0 - 4} ${ny + nh}Z" ${solid}/>`,
    `<path d="${K.eyeGlobePath()}" ${line(8)}/>`,
    // The retina lining the back of the globe, the lens, and the iris in front of it.
    `<path d="M${a[0]} ${a[1]}A${R - 13} ${R - 13} 0 1 1 ${b[0]} ${b[1]}" ${line(4)}/>`,
    `<ellipse cx="92" cy="${ly}" rx="${lrx - 1}" ry="${lry}" ${solid}/>`,
    ...E.iris.map(([, y0, , y1]) => `<rect x="73" y="${y0}" width="6" height="${y1 - y0}" rx="3" ${solid}/>`),
  ];
}

function placenta() {
  const P = K.PLACENTA, [cx, cy, rx, ry] = P.disc, d = P.depth;
  return [
    `<path d="M${cx - rx} ${cy}A${rx} ${ry + d} 0 0 0 ${cx + rx} ${cy}" ${line(6)}/>`,
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${line(8)}/>`,
    `<path d="${P.vessels.map(([a, r]) => K.placentaVessel(a, r, 0)).join('')}" ${line(4)}/>`,
    `<path d="${K.wormOutline(P.cord, () => P.cordWidth)}" ${solid}/>`,
  ];
}

function bloodBottles() {
  const B = K.BLOOD_BOTTLES;
  const adult = ([x]) => `<path d="M${x - 12} 58L${x - 12} 204Q${x - 12} 218 ${x} 218Q${x + 12} 218 ${x + 12} 204L${x + 12} 58Z" ${line(5)}/>` +
    `<path d="M${x - 4.5} 112L${x + 4.5} 112L${x + 4.5} 204Q${x + 4.5} 210 ${x} 210Q${x - 4.5} 210 ${x - 4.5} 204Z" ${solid}/>` +
    `<rect x="${x - 15}" y="30" width="30" height="24" rx="5" ${solid}/>`;
  const paediatric = ([x]) => `<path d="M${x - 9} 162L${x - 9} 206Q${x - 9} 218 ${x} 218Q${x + 9} 218 ${x + 9} 206L${x + 9} 162Z" ${line(4)}/>` +
    `<path d="M${x - 3} 186L${x + 3} 186L${x + 3} 207Q${x} 211 ${x - 3} 207Z" ${solid}/>` +
    `<rect x="${x - 11}" y="150" width="22" height="9" rx="2" ${solid}/><rect x="${x - 10}" y="130" width="20" height="13" rx="4" ${solid}/>` +
    `<path d="M${x + 11} 155C${x + 18} 153 ${x + 18} 145 ${x + 11} 142" ${line(3)}/>`;
  return [...B.adult.map(adult), ...B.paediatric.map(paediatric)];
}

function microscope() {
  const M = K.MICROSCOPE, [sx, sy, sw, sh] = M.stage, [lx, ly, lr] = M.lamp, [kx, ky, kr] = M.knob, [cx, cy, cw, ch] = M.condenser;
  return [
    `<path d="${M.base}" ${solid}/>`,
    `<path d="M${lx - lr} ${ly - 5}A${lr} ${lr} 0 0 1 ${lx + lr} ${ly - 5}Z" ${solid}/>`,
    // The arm, with the focus knob left as a ring round its hub.
    `<path d="${M.arm}${K.circlePath(kx, ky, kr - 2)}${K.circlePath(kx, ky, kr - 8)}" fill-rule="evenodd" ${solid}/>`,
    `<path d="${M.eyepiece}" ${line(16)}/>`,
    `<path d="${M.head}" ${solid}/>`,
    `<path d="${M.nosepiece}" ${solid}/>`,
    `<path d="${M.objectives.map(d => d.replace(/L(\S+) (\S+)$/, (m, x, y) => `L${x} ${Math.min(Number(y), 126)}`)).join('')}" ${line(9)}/>`,
    `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="3" ${solid}/>`,
    `<rect x="${cx}" y="${cy + 5}" width="${cw}" height="${ch}" rx="2" ${solid}/>`,
  ];
}

function glassTest() {
  const G = K.GLASS_TEST, [bx, by, brx, bry] = G.base, [rx, ry, rrx, rry] = G.rim;
  return [
    `<path d="${G.skinEdge}" ${line(6)}/>`,
    ...G.spots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 0.5}" ${solid}/>`),
    `<ellipse cx="${rx}" cy="${ry}" rx="${rrx}" ry="${rry}" ${line(6)}/>`,
    `<path d="M${bx - brx} ${by}L${rx - rrx} ${ry}M${bx + brx} ${by}L${rx + rrx} ${ry}M${bx - brx} ${by}A${brx} ${bry} 0 0 0 ${bx + brx} ${by}" ${line(6)}/>`,
    `<path d="M${bx - brx} ${by}A${brx} ${bry} 0 0 1 ${bx + brx} ${by}" ${line(3)}/>`,
  ];
}

function chestXray() {
  const X = K.CHEST_XRAY, [fx, fy, fw, fh, fr] = X.film;
  const ribs = X.ribs.map(([y, drop]) => `M122 ${y}C104 ${y - 12} 66 ${y - 10} 52 ${y + drop}`).join('');
  return [
    `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="${fr}" ${line(6)}/>`,
    `<clipPath id="chest-x-ray-mono-lungs"><path d="${X.rightLung}${X.leftLung}"/></clipPath>`,
    `<path d="${X.rightLung}${X.leftLung}" ${line(5)}/>`,
    `<g clip-path="url(#chest-x-ray-mono-lungs)"><path d="${ribs}${K.mirrorX(ribs)}" ${line(4)}/></g>`,
    `<path d="${X.clavicle}${K.mirrorX(X.clavicle)}" ${line(6)}/>`,
    ...Array.from({ length: 6 }, (_, i) => `<rect x="121" y="${40 + i * 17}" width="14" height="11" rx="3" ${solid}/>`),
  ];
}

// ------------------------------------------------------------------------

const DRAWINGS = {
  'staphylococcus': staphylococcus,
  'escherichia-coli': escherichiaColi,
  'streptococcus': streptococcus,
  'pneumococcus': pneumococcus,
  'meningococcus': meningococcus,
  'mycobacterium-tuberculosis': mycobacteriumTuberculosis,
  'biofilm': biofilm,
  'kingella': kingella,
  'bordetella': bordetella,
  'listeria': listeria,
  'treponema': treponema,
  'pseudomonas': pseudomonas,
  'klebsiella': klebsiella,
  'salmonella': salmonella,
  'c-difficile': cDifficile,
  'haemophilus': haemophilus,
  'mycoplasma': mycoplasma,
  'hepatitis-b': hepatitisB,
  'pneumocystis': pneumocystis,
  'threadworm': threadworm,
  'scabies-mite': scabiesMite,
  'head-louse': headLouse,
  'tick': tick,
  'sars-cov-2': sarsCov2,
  'adenovirus': adenovirus,
  'rsv': rsv,
  'influenza': influenza,
  'herpesvirus': herpesvirus,
  'bacteriophage': bacteriophage,
  'rotavirus': rotavirus,
  'enterovirus': enterovirus,
  'measles': measles,
  'hiv': hiv,
  'norovirus': norovirus,
  'candida': candida,
  'aspergillus': aspergillus,
  'cryptococcus': cryptococcus,
  'malaria': malaria,
  'toxoplasma': toxoplasma,
  'giardia': giardia,
  'mosquito': mosquito,
  'neutrophil': neutrophil,
  'macrophage': macrophage,
  't-cell': tCell,
  'b-cell': bCell,
  'plasma-cell': plasmaCell,
  'dendritic-cell': dendriticCell,
  'nk-cell': nkCell,
  'red-blood-cells': redBloodCells,
  'monocyte': monocyte,
  'eosinophil': eosinophil,
  'platelets': platelets,
  'cd8-killing': cd8Killing,
  'mast-cell': mastCell,
  'nets': nets,
  'treg': treg,
  'basophil': basophil,
  'immune-synapse': immuneSynapse,
  'ige-mast-cell': igeMastCell,
  'antibody-epitope': antibodyEpitope,
  'viral-vector-vaccine': viralVectorVaccine,
  'igg-antibody': iggAntibody,
  'igm-pentamer': igmPentamer,
  'mhc-class-ii': mhcClassII,
  'cytokine-receptor': cytokineReceptor,
  'complement-mac': complementMac,
  'mhc-class-i': mhcClassI,
  'iga-dimer': igaDimer,
  'toll-like-receptor': tollLikeReceptor,
  'c3b-opsonisation': c3bOpsonisation,
  'brain': brain,
  'heart': heart,
  'kidneys': kidneys,
  'liver': liver,
  'intestines': intestines,
  'skin': skin,
  'bone': bone,
  'knee-joint': kneeJoint,
  'lymph-node': lymphNode,
  'spleen': spleen,
  'thymus': thymus,
  'antibiotic-capsule': antibioticCapsule,
  'iv-bag': ivBag,
  'vaccine': vaccine,
  'oral-suspension': oralSuspension,
  'mrna-vaccine': mrnaVaccine,
  'cell-wall-antibiotic': cellWallAntibiotic,
  'conjugate-vaccine': conjugateVaccine,
  'beta-lactamase': betaLactamase,
  'efflux-pump': effluxPump,
  'susceptibility-plate': susceptibilityPlate,
  'plasmid-transfer': plasmidTransfer,
  'blood-culture-bottle': bloodCultureBottle,
  'blood-agar-plate': bloodAgarPlate,
  'lungs': lungs,
  'child': child,
  'newborn': newborn,
  'baby': baby,
  'thermometer': thermometer,
  'stethoscope': stethoscope,
  'lumbar-puncture': lumbarPuncture,
  'np-swab': npSwab,
  'pregnant-person': pregnantPerson,
  'iv-cannula': ivCannula,
  'picc-line': piccLine,
  'urine-dipstick': urineDipstick,
  'gram-stain-slide': gramStainSlide,
  'lateral-flow-test': lateralFlowTest,
  'nebuliser-mask': nebuliserMask,
  'incubator': incubator,
  'pcr-tube': pcrTube,
  'hand-hygiene': handHygiene,
  'face-mask': faceMask,
  'parent-and-baby': parentAndBaby,
  'globe': globe,
  'campylobacter': campylobacter,
  'clostridium-tetani': clostridiumTetani,
  'corynebacterium-diphtheriae': corynebacteriumDiphtheriae,
  'mpox': mpox,
  'dengue': dengue,
  'parvovirus-b19': parvovirus,
  'rabies': rabies,
  'rhizopus': rhizopus,
  'schistosoma': schistosoma,
  'trypanosoma': trypanosoma,
  'neutrophil-diapedesis': neutrophilDiapedesis,
  'inflammasome': inflammasome,
  'ear': ear,
  'eye': eye,
  'placenta': placenta,
  'monoclonal-antibody': monoclonalAntibody,
  'nasal-spray-vaccine': nasalSprayVaccine,
  'car-t-cell': carTCell,
  'blood-bottles': bloodBottles,
  'microscope': microscope,
  'glass-test': glassTest,
  'chest-x-ray': chestXray,
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
