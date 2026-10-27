'use strict';

// Draws the full-colour icons into the files named in catalogue.json.
// Titles and descriptions embedded in each SVG also come from the catalogue.
// Run: node tools/draw-colour-icons.js

const fs = require('fs');
const path = require('path');
const K = require('./svg-kit');
const { PALETTE: C, STROKE, STREP_CHAIN, mix, tint, shade, outline, round: n } = K;

const ROOT = path.join(__dirname, '..');

// ---------------------------------------------------------------- bacteria

function staphylococcus(id) {
  const base = C.gramPositive, back = shade(base, 0.14);
  // An irregular bunch: a recessed back layer, then front cocci from top to bottom.
  const rear = [[88, 62, 26], [142, 56, 27], [192, 84, 26], [52, 112, 26], [210, 136, 24]];
  const front = [[110, 96, 30], [164, 106, 30], [74, 148, 30], [130, 152, 31], [186, 160, 28],
    [106, 200, 27], [156, 200, 26]];
  const coccus = (grad, colour) => ([x, y, r]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}-${grad})" stroke="${outline(colour)}" stroke-width="${STROKE}"/>` +
    `<circle cx="${x}" cy="${y}" r="${r - 5}" fill="none" stroke="${tint(colour, 0.4)}" stroke-width="1.5" opacity="0.5"/>` +
    K.gloss(`${id}-gloss`, x - r * 0.32, y - r * 0.4, r * 0.36, r * 0.2);
  return {
    defs: [K.sphereGradient(`${id}-body`, base), K.sphereGradient(`${id}-back`, back), K.glossGradient(`${id}-gloss`)],
    body: [...rear.map(coccus('back', back)), ...front.map(coccus('body', base))],
  };
}

function escherichiaColi(id) {
  const base = C.gramNegative, s = 40, r = 30;
  const pili = [], flagella = [];
  for (let i = 0; i < 34; i++) {
    const p = K.stadiumPoint((i + 0.5) / 34, s, r);
    pili.push(`<line x1="${n(p.x - p.nx * 2)}" y1="${n(p.y - p.ny * 2)}" x2="${n(p.x + p.nx * 9)}" y2="${n(p.y + p.ny * 9)}"/>`);
  }
  [0.05, 0.17, 0.3, 0.42, 0.55, 0.67, 0.8, 0.92].forEach((u, i) => {
    const pts = K.wavePoints(K.stadiumPoint(u, s, r), (i % 2 ? 1 : -1) * 0.35, { phase: i });
    flagella.push(`<path d="${K.smoothOpenPath(pts)}"/>`);
  });
  const nucleoid = [];
  for (let x = -38; x <= 38; x += 4) nucleoid.push([x, 6 * Math.sin(x / 7) + 3 * Math.cos(x / 3.2)]);
  const w = 2 * (s + r), h = 2 * r;
  return {
    defs: [K.cylinderGradient(`${id}-body`, base)],
    body: [
      `<g transform="translate(128 128) rotate(-28)">`,
      `<g stroke="${shade(base, 0.25)}" stroke-width="1.4" stroke-linecap="round">${pili.join('')}</g>`,
      `<g fill="none" stroke="${shade(base, 0.3)}" stroke-width="2.5" stroke-linecap="round">${flagella.join('')}</g>`,
      `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${r}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}"/>`,
      `<rect x="${-w / 2 + 5}" y="${-h / 2 + 5}" width="${w - 10}" height="${h - 10}" rx="${r - 5}" fill="none" stroke="${shade(base, 0.2)}" stroke-width="1.5" opacity="0.55"/>`,
      `<path d="${K.smoothOpenPath(nucleoid)}" fill="none" stroke="${shade(base, 0.25)}" stroke-width="2" stroke-linecap="round" opacity="0.35"/>`,
      `<rect x="${-w / 2 + 18}" y="${-h / 2 + 7}" width="${w - 36}" height="7" rx="3.5" fill="#fff" opacity="0.4"/>`,
      `</g>`,
    ],
  };
}

function streptococcus(id) {
  const base = C.gramPositive;
  // Cocci in pairs along an S-curve: closer within a pair than between pairs.
  const cocci = K.pointsAlongBezier(...STREP_CHAIN);
  return {
    defs: [K.sphereGradient(`${id}-body`, base), K.glossGradient(`${id}-gloss`)],
    body: cocci.map(({ x, y, angle }) =>
      `<ellipse cx="${n(x)}" cy="${n(y)}" rx="22" ry="20" transform="rotate(${n(angle)} ${n(x)} ${n(y)})" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}"/>` +
      K.gloss(`${id}-gloss`, x - 7, y - 9, 8, 4.5)),
  };
}

function pneumococcus(id) {
  const base = C.gramPositive;
  return {
    defs: [K.sphereGradient(`${id}-body`, base), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(128 128) rotate(-30) scale(1.25)">`,
      `<ellipse rx="82" ry="42" fill="${C.capsule}" opacity="0.85" stroke="${tint(base, 0.35)}" stroke-width="2"/>`,
      `<ellipse rx="74" ry="35" fill="none" stroke="${tint(base, 0.5)}" stroke-width="1.5" stroke-dasharray="2 5" stroke-linecap="round"/>`,
      ...[-1, 1].map(side => `<path d="${K.lancetPath(side)}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="2.4"/>`),
      K.gloss(`${id}-gloss`, -30, -10, 12, 5, 0), K.gloss(`${id}-gloss`, 30, -10, 12, 5, 0),
      `</g>`,
    ],
  };
}

function meningococcus(id) {
  const base = C.gramNegative;
  return {
    defs: [K.sphereGradient(`${id}-body`, base), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(128 128) rotate(-20) scale(1.35)">`,
      ...[-1, 1].map(side => `<path d="${K.beanPath(side)}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="2.2" stroke-linejoin="round"/>` +
        K.gloss(`${id}-gloss`, side * 34, -16, 12, 6, side * 15)),
      `</g>`,
    ],
  };
}

function mycobacteriumTuberculosis(id) {
  const base = C.acidFast;
  const along = [Math.cos(-Math.PI / 6), Math.sin(-Math.PI / 6)], across = [-along[1], along[0]];
  const rods = [[-2, -14, 100, 3], [-1, 16, 92, -2], [0, -4, 104, 4], [1, 18, 96, -3], [2, -12, 98, 2]];
  return {
    defs: [K.cylinderGradient(`${id}-body`, base)],
    body: rods.map(([k, shift, len, jitter]) => {
      const x = 128 + across[0] * k * 30 + along[0] * shift, y = 128 + across[1] * k * 30 + along[1] * shift;
      const beads = [0, 1, 2, 3].map(j =>
        `<ellipse cx="${n(-len / 2 + 16 + j * (len - 32) / 3)}" cy="1" rx="7" ry="5" fill="${tint(base, 0.35)}" opacity="0.5"/>`);
      return `<g transform="translate(${n(x)} ${n(y)}) rotate(${-30 + jitter})">` +
        `<rect x="${-len / 2}" y="-12" width="${len}" height="24" rx="12" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}"/>` +
        beads.join('') +
        `<rect x="${-len / 2 + 12}" y="-7" width="${len - 24}" height="4" rx="2" fill="#fff" opacity="0.4"/></g>`;
    }),
  };
}

function biofilm(id) {
  const neg = C.gramNegative, pos = C.gramPositive, matrix = C.biofilmMatrix;
  const rod = (x, y, angle, colour) => `<rect x="-12" y="-5.5" width="24" height="11" rx="5.5" transform="translate(${x} ${y}) rotate(${angle})" fill="url(#${id}-rod)" stroke="${outline(colour)}" stroke-width="1.6"/>`;
  const swimmer = (x, y, angle, phase) => {
    const tail = K.wavePoints({ x: -14, y: 0, nx: -1, ny: 0 }, 0, { length: 34, amplitude: 4, wavelength: 14, phase });
    return `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="${K.smoothOpenPath(tail)}" fill="none" stroke="${shade(neg, 0.3)}" stroke-width="2" stroke-linecap="round"/>` +
      `<rect x="-15" y="-7" width="30" height="14" rx="7" fill="url(#${id}-rod)" stroke="${outline(neg)}" stroke-width="2"/></g>`;
  };
  return {
    defs: [K.cylinderGradient(`${id}-rod`, neg), K.sphereGradient(`${id}-coccus`, pos), K.cylinderGradient(`${id}-substrate`, C.substrate)],
    body: [
      `<path d="M20 208C26 170 50 150 76 156C88 120 120 110 140 128C160 104 196 112 204 140C222 146 236 176 236 208Z" fill="${matrix}" opacity="0.9" stroke="${shade(matrix, 0.3)}" stroke-width="2"/>`,
      ...K.BIOFILM_CELLS.map(([x, y, angle, kind]) => kind === 'rod' ? rod(x, y, angle, neg)
        : `<circle cx="${x}" cy="${y}" r="6.5" fill="url(#${id}-coccus)" stroke="${outline(pos)}" stroke-width="1.4"/>`),
      `<rect x="14" y="206" width="228" height="20" rx="4" fill="url(#${id}-substrate)" stroke="${outline(C.substrate)}" stroke-width="2.5"/>`,
      swimmer(84, 66, -20, 0), swimmer(176, 50, 25, 2),
    ],
  };
}

function kingella(id) {
  const base = C.gramNegative;
  const cell = (x, y, angle) => `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(angle)})">` +
    `<rect x="-17" y="-13" width="34" height="26" rx="12" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}"/>` +
    `<rect x="-12.5" y="-8.5" width="25" height="17" rx="8" fill="none" stroke="${shade(base, 0.2)}" stroke-width="1.3" opacity="0.5"/>` +
    `<rect x="-10" y="-9" width="20" height="4" rx="2" fill="#fff" opacity="0.45"/></g>`;
  // Pairs in a short chain, plus a separate pair and a single cell.
  const chain = K.pointsAlongBezier([30, 112], [90, 56], [160, 124], [226, 70], [36, 42, 36]);
  return {
    defs: [K.cylinderGradient(`${id}-body`, base)],
    body: [...chain.map(p => cell(p.x, p.y, p.angle)), cell(92, 184, 14), cell(127, 193, 14), cell(190, 168, -30)],
  };
}

function bordetella(id) {
  const base = C.gramNegative, tox = C.toxin;
  const cells = [[70, 80, 20], [120, 62, -15], [170, 92, 35], [96, 132, -40], [152, 148, 10], [204, 140, -25], [78, 188, 25], [132, 204, -10], [190, 196, 40]];
  const fimbriae = Array.from({ length: 10 }, (_, i) => {
    const p = K.stadiumPoint((i + 0.5) / 10, 6, 9);
    return `M${n(p.x + p.nx)} ${n(p.y + p.ny)}L${n(p.x + p.nx * 7)} ${n(p.y + p.ny * 7)}`;
  }).join('');
  const cell = ([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})">` +
    `<path d="${fimbriae}" stroke="${shade(base, 0.25)}" stroke-width="1.3" stroke-linecap="round"/>` +
    `<rect x="-15" y="-9" width="30" height="18" rx="9" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="2.5"/>` +
    `<rect x="-9" y="-5.5" width="18" height="3" rx="1.5" fill="#fff" opacity="0.45"/></g>`;
  // Pertussis toxin: an A subunit sitting on a ring of five B subunits.
  const toxin = (x, y) => Array.from({ length: 5 }, (_, k) => {
    const a = k * 2 * Math.PI / 5 - Math.PI / 2;
    return `<circle cx="${n(x + 7 * Math.cos(a))}" cy="${n(y + 4 + 5 * Math.sin(a))}" r="4.5" fill="url(#${id}-tox)" stroke="${outline(tox)}" stroke-width="1"/>`;
  }).join('') + `<circle cx="${x}" cy="${y - 6}" r="6" fill="url(#${id}-toxa)" stroke="${outline(shade(tox, 0.2))}" stroke-width="1"/>`;
  return {
    defs: [K.cylinderGradient(`${id}-body`, base), K.sphereGradient(`${id}-tox`, tox), K.sphereGradient(`${id}-toxa`, shade(tox, 0.2))],
    body: [...cells.map(cell), toxin(40, 140), toxin(220, 64), toxin(224, 214), toxin(36, 36)],
  };
}

function listeria(id) {
  const host = C.hostCell, rod = C.gramPositive, actin = C.actin;
  // Host cell, with a protrusion where one bacterium is pushing out towards a neighbour.
  const membrane = K.polarPoints(128, 138, a => 92 + 34 * Math.exp(-(K.wrapAngle(a + 0.7) ** 2) / (2 * 0.2 ** 2)) + 2 * Math.sin(5 * a), 140);
  const bug = (x, y, deg) => `<g transform="translate(${n(x)} ${n(y)}) rotate(${deg})">` +
    `<path d="M-15 -10L-70 0L-15 10Z" fill="url(#${id}-actin)"/>` +
    [[-26, -4], [-30, 4], [-38, -2], [-44, 3], [-52, -1]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="${shade(actin, 0.35)}" opacity="0.8"/>`).join('') +
    `<rect x="-18" y="-8" width="36" height="16" rx="8" fill="url(#${id}-rod)" stroke="${outline(rod)}" stroke-width="2.5"/>` +
    `<rect x="-12" y="-5" width="24" height="3" rx="1.5" fill="#fff" opacity="0.45"/></g>`;
  return {
    defs: [
      K.sphereGradient(`${id}-host`, host, { light: 0.5, dark: 0.08 }), K.sphereGradient(`${id}-nucleus`, C.nucleus, { light: 0.45 }),
      K.cylinderGradient(`${id}-rod`, rod),
      `<linearGradient id="${id}-actin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${actin}" stop-opacity="0"/><stop offset="0.5" stop-color="${actin}" stop-opacity="0.8"/><stop offset="1" stop-color="${shade(actin, 0.1)}"/></linearGradient>`,
    ],
    body: [
      `<path d="${K.smoothClosedPath(membrane)}" fill="url(#${id}-host)" stroke="${shade(host, 0.32)}" stroke-width="${STROKE}"/>`,
      `<circle cx="82" cy="176" r="26" fill="url(#${id}-nucleus)" stroke="${outline(C.nucleus)}" stroke-width="2.5"/>`,
      bug(211, 68, -40), bug(100, 100, -150), bug(150, 170, 20),
    ],
  };
}

function treponema(id) {
  const base = C.spirochaete;
  const helix = (cx, cy, deg, len) => {
    const a = deg * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], v = [-u[1], u[0]], pts = [];
    for (let t = -len / 2; t <= len / 2; t += 2) {
      const off = 9 * Math.min(1, (len / 2 - Math.abs(t)) / 14) * Math.sin(2 * Math.PI * t / 16);
      pts.push([cx + u[0] * t + v[0] * off, cy + u[1] * t + v[1] * off]);
    }
    return K.smoothOpenPath(pts);
  };
  return { defs: [], body: [K.pipe(helix(122, 94, -24, 190), base, 6), K.pipe(helix(134, 170, -18, 170), base, 6)] };
}

// A Gram-negative rod with its double envelope and a highlight, centred on the origin.
function gramNegativeRod(gradId, s, r, base = C.gramNegative) {
  const w = 2 * (s + r), h = 2 * r;
  return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${r}" fill="url(#${gradId})" stroke="${outline(base)}" stroke-width="${STROKE}"/>` +
    `<rect x="${-w / 2 + 4.5}" y="${-h / 2 + 4.5}" width="${w - 9}" height="${h - 9}" rx="${r - 4.5}" fill="none" stroke="${shade(base, 0.2)}" stroke-width="1.4" opacity="0.55"/>` +
    `<rect x="${n(-w / 2 + r * 0.7)}" y="${n(-h / 2 + r * 0.25)}" width="${n(w - r * 1.4)}" height="${n(Math.max(3, r * 0.22))}" rx="${n(Math.max(1.5, r * 0.11))}" fill="#fff" opacity="0.4"/>`;
}

function pseudomonas(id) {
  const base = C.gramNegative, s = 34, r = 15;
  const pole = K.stadiumPoint((2 * s + Math.PI * r / 2) / (4 * s + 2 * Math.PI * r), s, r);
  return {
    defs: [K.cylinderGradient(`${id}-body`, base)],
    body: K.PSEUDOMONAS_CELLS.map(([x, y, a], i) => `<g transform="translate(${x} ${y}) rotate(${a})">` +
      `<path d="${K.smoothOpenPath(K.wavePoints(pole, 0, { length: 64, amplitude: 6, wavelength: 24, phase: i * 2 }))}" fill="none" stroke="${shade(base, 0.3)}" stroke-width="2.5" stroke-linecap="round"/>` +
      gramNegativeRod(`${id}-body`, s, r) + `</g>`),
  };
}

function klebsiella(id) {
  const base = C.gramNegative, s = 22, r = 26;
  const fimbriae = Array.from({ length: 30 }, (_, i) => {
    const p = K.stadiumPoint((i + 0.5) / 30, s, r);
    return `M${n(p.x - p.nx * 2)} ${n(p.y - p.ny * 2)}L${n(p.x + p.nx * 7)} ${n(p.y + p.ny * 7)}`;
  }).join('');
  const rod = x => `<g transform="translate(${x} 0)"><path d="${fimbriae}" stroke="${shade(base, 0.25)}" stroke-width="1.3" stroke-linecap="round" opacity="0.6"/>` +
    gramNegativeRod(`${id}-body`, s, r) + `</g>`;
  return {
    defs: [K.cylinderGradient(`${id}-body`, base)],
    body: [
      `<g transform="translate(128 128) rotate(-28)">`,
      // A thick polysaccharide capsule around a dividing pair; no flagella.
      `<ellipse rx="114" ry="64" fill="${C.capsule}" opacity="0.85" stroke="${tint(base, 0.35)}" stroke-width="2"/>`,
      `<ellipse rx="105" ry="56" fill="none" stroke="${tint(base, 0.5)}" stroke-width="1.5" stroke-dasharray="2 5" stroke-linecap="round"/>`,
      rod(-51), rod(51),
      `</g>`,
    ],
  };
}

function salmonella(id) {
  const host = C.hostCell, neg = C.gramNegative, E = K.ENTEROCYTES;
  const rod = (x, y, deg, flagella) => {
    const tails = flagella ? [0.08, 0.22, 0.36, 0.58, 0.72, 0.86].map((u, i) =>
      K.smoothOpenPath(K.wavePoints(K.stadiumPoint(u, 12, 9), (i % 2 ? 1 : -1) * 0.3, { length: 28, amplitude: 3.5, wavelength: 12, phase: i }))).join('') : '';
    return `<g transform="translate(${x} ${y}) rotate(${deg})">` +
      (tails ? `<path d="${tails}" fill="none" stroke="${shade(neg, 0.3)}" stroke-width="2" stroke-linecap="round"/>` : '') +
      `<rect x="-21" y="-9" width="42" height="18" rx="9" fill="url(#${id}-rod)" stroke="${outline(neg)}" stroke-width="2.5"/>` +
      `<rect x="-14" y="-6" width="28" height="3" rx="1.5" fill="#fff" opacity="0.45"/></g>`;
  };
  const villi = E.microvilli.map(x => `M${x} 120V106`).join('');
  const cell = d => `<path d="${d}" fill="url(#${id}-host)" stroke="${shade(host, 0.32)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`;
  return {
    defs: [K.sphereGradient(`${id}-host`, host, { light: 0.5, dark: 0.08 }), K.sphereGradient(`${id}-nucleus`, C.nucleus, { light: 0.45 }), K.cylinderGradient(`${id}-rod`, neg)],
    body: [
      `<path d="${villi}" stroke="${shade(host, 0.32)}" stroke-width="7.5" stroke-linecap="round"/>`,
      `<path d="${villi}" stroke="${host}" stroke-width="4.5" stroke-linecap="round"/>`,
      cell(E.left), cell(E.right),
      ...[[76, 206, 24, 14], [184, 208, 22, 14]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id}-nucleus)" stroke="${outline(C.nucleus)}" stroke-width="2"/>`),
      // Inside the left cell, a bacterium in its Salmonella-containing vacuole.
      `<circle cx="78" cy="160" r="28" fill="${tint(host, 0.55)}" stroke="${shade(host, 0.3)}" stroke-width="1.8"/>`,
      rod(78, 160, 30, false),
      rod(182, 92, -8, false),
      rod(70, 56, 20, true),
    ],
  };
}

function cDifficile(id) {
  const base = C.gramPositive, sp = C.spore, s = 40, r = 15, D = K.CDIFF;
  const flagella = [0.08, 0.22, 0.36, 0.58, 0.72, 0.86].map((u, i) =>
    K.smoothOpenPath(K.wavePoints(K.stadiumPoint(u, s, r), (i % 2 ? 1 : -1) * 0.3, { length: 30, amplitude: 4, wavelength: 14, phase: i }))).join('');
  const highlight = `<rect x="-34" y="-11" width="68" height="4" rx="2" fill="#fff" opacity="0.4"/>`;
  const spore = (rx, ry) => `<ellipse rx="${rx}" ry="${ry}" fill="url(#${id}-spore)" stroke="${outline(sp)}" stroke-width="2"/>` +
    `<ellipse rx="${n(rx - 4)}" ry="${n(ry - 3.5)}" fill="none" stroke="${tint(sp, 0.45)}" stroke-width="1.5"/>`;
  const [vx, vy, va] = D.vegetative, [px, py, pa] = D.sporulating;
  return {
    defs: [K.cylinderGradient(`${id}-body`, base), K.sphereGradient(`${id}-spore`, sp, { light: 0.5 })],
    body: [
      `<g transform="translate(${vx} ${vy}) rotate(${va})">`,
      `<path d="${flagella}" fill="none" stroke="${shade(base, 0.3)}" stroke-width="2.2" stroke-linecap="round"/>`,
      `<rect x="${-(s + r)}" y="${-r}" width="${2 * (s + r)}" height="${2 * r}" rx="${r}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}"/>`,
      highlight, `</g>`,
      // A subterminal spore swells the sporulating cell slightly.
      `<g transform="translate(${px} ${py}) rotate(${pa})">`,
      `<path d="${K.sporulatingRod(s, r)}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}"/>`,
      `<g transform="translate(28 0)">${spore(14, 11.5)}</g>`,
      highlight, `</g>`,
      // Free spores, each with a faint exosporium.
      ...D.spores.map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})">` +
        `<ellipse rx="18" ry="14" fill="none" stroke="${tint(sp, 0.25)}" stroke-width="1.5" opacity="0.7"/>${spore(14, 10.5)}</g>`),
    ],
  };
}

function haemophilus(id) {
  const base = C.gramNegative, r = 10, cells = K.HAEMOPHILUS_CELLS;
  return {
    defs: [K.cylinderGradient(`${id}-body`, base)],
    body: [
      ...cells.map(([x, y, a, s]) => `<ellipse cx="${x}" cy="${y}" rx="${s + r + 9}" ry="${r + 9}" transform="rotate(${a} ${x} ${y})" fill="${C.capsule}" opacity="0.85" stroke="${tint(base, 0.35)}" stroke-width="1.5"/>`),
      ...cells.map(([x, y, a, s]) => `<g transform="translate(${x} ${y}) rotate(${a})">${gramNegativeRod(`${id}-body`, s, r)}</g>`),
    ],
  };
}

function mycoplasma(id) {
  const base = C.mycoplasma, host = C.hostCell, M = K.MYCOPLASMA;
  const cilia = M.cilia.map(x => `M${x} 168C${x - 4} 152 ${x + 4} 140 ${x} 124`).join('');
  // Bounded only by a membrane: no wall, so a single fine outline and an irregular shape.
  const cell = ([x, y, a, s]) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">` +
    `<path d="${M.flask}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="2"/>` +
    [[-8, -10], [6, -14], [-2, 2], [10, 0], [-12, 6]].map(([px, py]) => `<circle cx="${px}" cy="${py}" r="2" fill="${shade(base, 0.3)}" opacity="0.6"/>`).join('') +
    `<ellipse cy="31" rx="6.5" ry="5" fill="${shade(base, 0.35)}" stroke="${outline(base)}" stroke-width="1.5"/>` +
    K.gloss(`${id}-gloss`, -9, -18, 8, 4) + `</g>`;
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5 }), K.sphereGradient(`${id}-host`, host, { light: 0.5, dark: 0.08 }),
      K.sphereGradient(`${id}-nucleus`, C.nucleus, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${cilia}" fill="none" stroke="${shade(host, 0.35)}" stroke-width="2.5" stroke-linecap="round"/>`,
      ...M.epithelium.map(d => `<path d="${d}" fill="url(#${id}-host)" stroke="${shade(host, 0.32)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`),
      ...[[76, 206], [180, 206]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="14" fill="url(#${id}-nucleus)" stroke="${outline(C.nucleus)}" stroke-width="2"/>`),
      ...M.cells.map(cell),
    ],
  };
}

// Rotation for a cell drawn at angle a that keeps its shading lit from above: past ±90° the cell
// is flipped instead of turned upside down.
function upright(a) {
  const w = ((a % 360) + 540) % 360 - 180;
  return Math.abs(w) <= 90 ? `rotate(${w})` : `rotate(${w > 0 ? w - 180 : w + 180}) scale(-1 1)`;
}

function campylobacter(id) {
  const base = C.gramNegative, P = K.CAMPYLOBACTER, { body, poles } = K.campylobacterCell();
  const flagella = poles.map((p, i) => K.smoothOpenPath(K.wavePoints(p, 0, { length: 38, amplitude: 4, wavelength: 16, phase: i * 2 }))).join('');
  return {
    defs: [],
    body: P.cells.map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})">` +
      `<path d="${flagella}" fill="none" stroke="${shade(base, 0.3)}" stroke-width="2.5" stroke-linecap="round"/>` +
      K.pipe(K.smoothOpenPath(body), base, P.width) + `</g>`),
  };
}

function clostridiumTetani(id) {
  const base = C.gramPositive, sp = C.spore, T = K.TETANI, [cx, R] = T.spore, r = T.r;
  const drumstick = ([x, y, a]) => `<g transform="translate(${x} ${y}) ${upright(a)}">` +
    `<path d="${K.drumstickPath()}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}"/>` +
    `<rect x="${-T.s + 2}" y="-7" width="${cx - R + T.s - 4}" height="3" rx="1.5" fill="#fff" opacity="0.4"/>` +
    `<circle cx="${cx}" r="${R - 5}" fill="url(#${id}-spore)" stroke="${outline(sp)}" stroke-width="2"/>` +
    `<circle cx="${cx}" r="${R - 9.5}" fill="none" stroke="${tint(sp, 0.45)}" stroke-width="1.5"/></g>`;
  // A vegetative cell, with peritrichous flagella.
  const [vx, vy, va] = T.vegetative, vs = 36;
  const flagella = [0.04, 0.14, 0.26, 0.38, 0.54, 0.64, 0.76, 0.88].map((u, i) =>
    K.smoothOpenPath(K.wavePoints(K.stadiumPoint(u, vs, r), (i % 2 ? 1 : -1) * 0.3, { length: 28, amplitude: 4, wavelength: 14, phase: i }))).join('');
  return {
    defs: [K.cylinderGradient(`${id}-body`, base), K.sphereGradient(`${id}-spore`, sp, { light: 0.5 })],
    body: [
      `<g transform="translate(${vx} ${vy}) rotate(${va})"><path d="${flagella}" fill="none" stroke="${shade(base, 0.3)}" stroke-width="2.2" stroke-linecap="round"/>` +
      `<rect x="${-(vs + r)}" y="${-r}" width="${2 * (vs + r)}" height="${2 * r}" rx="${r}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}"/>` +
      `<rect x="${-vs}" y="-7" width="${2 * vs}" height="3" rx="1.5" fill="#fff" opacity="0.4"/></g>`,
      ...T.cells.map(drumstick),
    ],
  };
}

function corynebacteriumDiphtheriae(id) {
  const base = C.gramPositive, D = K.DIPHTHERIAE, g = C.metachromaticGranule;
  return {
    defs: [K.cylinderGradient(`${id}-body`, base)],
    body: D.cells.map(([x, y, a]) => `<g transform="translate(${n(x)} ${n(y)}) ${upright(a)}">` +
      `<path d="${D.club}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<path d="M-22 -4L22 -6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>` +
      D.granules.map(([gx, gr]) => `<circle cx="${gx}" r="${gr}" fill="${g}" stroke="${shade(g, 0.3)}" stroke-width="1"/>`).join('') + `</g>`),
  };
}

function chlamydia(id) {
  const X = K.CHLAMYDIA, [cx, cy, R] = X.cell, [nx, ny, nrx, nry, na] = X.nucleus, [ix, iy, ir] = X.inclusion, { rbs, ebs } = X.bodies, host = C.hostCell;
  const eb = ([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="3.6" fill="${C.elementaryBody}" stroke="${shade(C.elementaryBody, 0.35)}" stroke-width="0.8"/>`;
  return {
    defs: [K.sphereGradient(`${id}-host`, host, { light: 0.5, dark: 0.08 }), K.sphereGradient(`${id}-nucleus`, C.nucleus, { light: 0.45 }),
      K.sphereGradient(`${id}-rb`, C.reticulateBody, { light: 0.5 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${K.smoothClosedPath(K.polarPoints(cx, cy, a => R + 2.5 * Math.sin(5 * a + 1) + 1.5 * Math.sin(9 * a), 120))}" fill="url(#${id}-host)" stroke="${shade(host, 0.32)}" stroke-width="${STROKE}"/>`,
      `<ellipse cx="${nx}" cy="${ny}" rx="${nrx}" ry="${nry}" transform="rotate(${na} ${nx} ${ny})" fill="url(#${id}-nucleus)" stroke="${outline(C.nucleus)}" stroke-width="2"/>`,
      // The inclusion: reticulate bodies (larger, dividing) among elementary bodies (small, infectious).
      `<circle cx="${ix}" cy="${iy}" r="${ir}" fill="${C.inclusion}" stroke="${shade(C.inclusion, 0.3)}" stroke-width="2"/>`,
      ...rbs.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="9" fill="url(#${id}-rb)" stroke="${outline(C.reticulateBody)}" stroke-width="1.3"/>`),
      ...ebs.map(eb), ...X.outside.map(eb),
      K.gloss(`${id}-gloss`, 74, 74, 22, 9),
    ],
  };
}

function borrelia(id) {
  return { defs: [], body: K.BORRELIA.cells.map(c => K.pipe(K.borreliaPath(c), C.borrelia, 6)) };
}

function enterococcus(id) {
  const base = C.gramPositive, E = K.ENTEROCOCCUS;
  return {
    defs: [K.sphereGradient(`${id}-body`, base), K.glossGradient(`${id}-gloss`)],
    body: E.cocci.map(([x, y, a]) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${E.rx}" ry="${E.ry}" transform="rotate(${a} ${n(x)} ${n(y)})" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}"/>` +
      K.gloss(`${id}-gloss`, x - 6, y - 7, 7, 4)),
  };
}

// ----------------------------------------------------------------- viruses

function rsv(id) {
  const env = C.rsvEnvelope, F = C.fusionProtein, G = C.attachmentProtein, R = 60;
  const spikes = Array.from({ length: 28 }, (_, i) => {
    const turn = `<g transform="rotate(${n(i * 360 / 28 + 3)})">`;
    return i % 3 === 2
      ? turn + `<line x1="0" y1="${-(R - 3)}" x2="0" y2="${-(R + 19)}" stroke="${shade(G, 0.2)}" stroke-width="2.5" stroke-linecap="round"/>` +
        `<circle cy="${-(R + 22)}" r="4.5" fill="url(#${id}-g)" stroke="${outline(G)}" stroke-width="1.5"/></g>`
      : turn + `<line x1="0" y1="${-(R - 3)}" x2="0" y2="${-(R + 8)}" stroke="${shade(F, 0.3)}" stroke-width="4" stroke-linecap="round"/>` +
        `<ellipse cy="${-(R + 14)}" rx="6" ry="8" fill="url(#${id}-f)" stroke="${outline(F)}" stroke-width="1.5"/></g>`;
  });
  // Helical nucleocapsid: a looping strand with a tight wiggle.
  const coil = Array.from({ length: 161 }, (_, i) => {
    const t = i / 160, a = t * 2 * Math.PI * 1.15 + 0.4, r = 28 + 10 * Math.sin(2 * a + 1);
    const w = 3 * Math.sin(t * 46 * Math.PI);
    return [(r + w) * Math.cos(a), (r + w) * Math.sin(a)];
  });
  return {
    defs: [K.sphereGradient(`${id}-env`, env), K.sphereGradient(`${id}-f`, F, { focus: [0.5, 0.3] }),
      K.sphereGradient(`${id}-g`, G), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(128 128)">`,
      ...spikes,
      `<path d="${K.smoothClosedPath(K.polarPoints(0, 0, a => R + 2 * Math.sin(3 * a + 0.5)))}" fill="url(#${id}-env)" stroke="${outline(env)}" stroke-width="${STROKE}"/>`,
      `<circle r="${R - 7}" fill="none" stroke="${shade(env, 0.2)}" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round"/>`,
      `<path d="${K.smoothOpenPath(coil)}" fill="none" stroke="${outline(C.nucleus)}" stroke-width="5" stroke-linecap="round"/>`,
      `<path d="${K.smoothOpenPath(coil)}" fill="none" stroke="${C.nucleus}" stroke-width="3" stroke-linecap="round"/>`,
      K.gloss(`${id}-gloss`, -24, -30, 20, 10),
      `</g>`,
    ],
  };
}

function influenza(id) {
  const env = C.fluEnvelope, HA = C.haemagglutinin, NA = C.neuraminidase, R = 62;
  const spikes = Array.from({ length: 26 }, (_, i) => {
    const turn = `<g transform="rotate(${n(i * 360 / 26 + 2)})">`;
    return i % 5 === 2
      ? turn + `<line x1="0" y1="${-(R - 3)}" x2="0" y2="${-(R + 14)}" stroke="${shade(NA, 0.3)}" stroke-width="3" stroke-linecap="round"/>` +
        `<rect x="-6.5" y="${-(R + 24)}" width="13" height="11" rx="3.5" fill="url(#${id}-na)" stroke="${outline(NA)}" stroke-width="1.5"/></g>`
      : turn + `<rect x="-3.5" y="${-(R + 22)}" width="7" height="25" rx="3.5" fill="url(#${id}-ha)" stroke="${outline(HA)}" stroke-width="1.4"/></g>`;
  });
  const segments = [56, 64, 72, 60, 68, 52, 62, 58].map((len, i) =>
    `<rect x="${-34.5 + i * 9}" y="${2 - len / 2}" width="7" height="${len}" rx="3.5" fill="url(#${id}-rnp)" stroke="${outline(C.nucleus)}" stroke-width="1.2"/>`);
  return {
    defs: [K.sphereGradient(`${id}-env`, env), K.cylinderGradient(`${id}-ha`, HA, { horizontal: true }),
      K.sphereGradient(`${id}-na`, NA), K.cylinderGradient(`${id}-rnp`, C.nucleus, { horizontal: true }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(128 128)">`,
      ...spikes,
      `<circle r="${R}" fill="url(#${id}-env)" stroke="${outline(env)}" stroke-width="${STROKE}"/>`,
      `<circle r="${R - 7}" fill="none" stroke="${shade(env, 0.2)}" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round"/>`,
      ...segments,
      K.gloss(`${id}-gloss`, -26, -32, 18, 9),
      `</g>`,
    ],
  };
}

function herpesvirus(id) {
  const env = C.herpesEnvelope, gp = C.penton, R = 84;
  const spikes = Array.from({ length: 24 }, (_, i) =>
    `<g transform="rotate(${n(i * 15 + 4)} 128 128)"><line x1="128" y1="${128 - R + 2}" x2="128" y2="${128 - R - 8}" stroke="${shade(gp, 0.3)}" stroke-width="3" stroke-linecap="round"/>` +
    `<circle cx="128" cy="${128 - R - 12}" r="5" fill="url(#${id}-gp)" stroke="${outline(gp)}" stroke-width="1.3"/></g>`);
  const rand = K.rng(31), grains = [];
  for (let tries = 0; grains.length < 40 && tries < 5000; tries++) {
    const a = rand() * 2 * Math.PI, d = 50 + rand() * 13, p = [126 + d * Math.cos(a), 126 + d * Math.sin(a)];
    if (grains.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 9)) grains.push(p);
  }
  return {
    defs: [K.sphereGradient(`${id}-env`, env), K.sphereGradient(`${id}-gp`, gp), K.glossGradient(`${id}-gloss`)],
    body: [
      ...spikes,
      `<path d="${K.smoothClosedPath(K.polarPoints(128, 128, a => R + 2 * Math.sin(4 * a)))}" fill="url(#${id}-env)" stroke="${outline(env)}" stroke-width="${STROKE}"/>`,
      `<circle cx="126" cy="126" r="68" fill="${C.tegument}" stroke="${shade(env, 0.12)}" stroke-width="1.5"/>`,
      ...grains.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="2.2" fill="${shade(C.tegument, 0.25)}" opacity="0.6"/>`),
      ...capsidFacets(C.herpesCapsid, 46, 122, 124, 2.6),
      K.gloss(`${id}-gloss`, 80, 74, 22, 10),
    ],
  };
}

function bacteriophage(id) {
  const head = C.phageHead, tail = C.fibre;
  const facet = (pts, t) => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${t >= 0 ? tint(head, t) : shade(head, -t)}" stroke="${shade(head, 0.35)}" stroke-width="1.5" stroke-linejoin="round"/>`;
  const legs = [[[104, 190], [74, 204], [60, 236]], [[116, 192], [100, 214], [96, 238]]];
  const legPath = pts => 'M' + pts.map(p => p.join(' ')).join('L');
  return {
    defs: [K.cylinderGradient(`${id}-sheath`, tail, { horizontal: true })],
    body: [
      ...legs.flatMap(leg => [leg, leg.map(([x, y]) => [256 - x, y])]).map(leg =>
        `<path d="${legPath(leg)}" fill="none" stroke="${outline(tail)}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<path d="${legPath(leg)}" fill="none" stroke="${tail}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`),
      `<rect x="116" y="122" width="24" height="62" rx="3" fill="url(#${id}-sheath)" stroke="${outline(tail)}" stroke-width="2.5"/>`,
      `<g stroke="${shade(tail, 0.3)}" stroke-width="1.5">` +
        Array.from({ length: 9 }, (_, i) => `<line x1="117.5" y1="${129 + i * 6}" x2="138.5" y2="${129 + i * 6}"/>`).join('') + `</g>`,
      `<rect x="100" y="182" width="56" height="10" rx="3" fill="${shade(tail, 0.12)}" stroke="${outline(tail)}" stroke-width="2.5"/>`,
      `<rect x="113" y="114" width="30" height="10" rx="2" fill="${shade(tail, 0.1)}" stroke="${outline(tail)}" stroke-width="2.5"/>`,
      facet([[128, 20], [88, 42], [128, 52]], 0.45), facet([[128, 20], [168, 42], [128, 52]], 0.15),
      facet([[88, 42], [128, 52], [128, 86], [88, 96]], 0.25), facet([[168, 42], [128, 52], [128, 86], [168, 96]], -0.08),
      facet([[88, 96], [128, 86], [128, 118]], 0), facet([[168, 96], [128, 86], [128, 118]], -0.22),
      `<polygon points="128,20 168,42 168,96 128,118 88,96 88,42" fill="none" stroke="${outline(head)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<rect x="95" y="50" width="5" height="40" rx="2.5" fill="#fff" opacity="0.4"/>`,
    ],
  };
}

function rotavirus(id) {
  const outer = C.rotaOuter, mid = C.rotaMiddle, core = C.rotaCore, R = 76;
  // Triple-layered "wheel": spikes on the outer shell, spokes from the core to the rim.
  const spikes = Array.from({ length: 24 }, (_, k) => {
    const a = k * Math.PI / 12;
    return `<circle cx="${n(128 + (R + 5) * Math.cos(a))}" cy="${n(128 + (R + 5) * Math.sin(a))}" r="5.5" fill="url(#${id}-spike)" stroke="${outline(outer)}" stroke-width="1.2"/>`;
  });
  const spokes = Array.from({ length: 12 }, (_, k) => {
    const a = k * Math.PI / 6 + 0.13;
    return K.pipe(`M${n(128 + 30 * Math.cos(a))} ${n(128 + 30 * Math.sin(a))}L${n(128 + (R - 15) * Math.cos(a))} ${n(128 + (R - 15) * Math.sin(a))}`, outer, 8);
  });
  return {
    defs: [K.sphereGradient(`${id}-outer`, outer), K.sphereGradient(`${id}-mid`, mid, { light: 0.5 }), K.sphereGradient(`${id}-core`, core),
      K.sphereGradient(`${id}-spike`, shade(outer, 0.1)), K.glossGradient(`${id}-gloss`)],
    body: [
      ...spikes,
      `<circle cx="128" cy="128" r="${R}" fill="url(#${id}-outer)" stroke="${outline(outer)}" stroke-width="${STROKE}"/>`,
      `<circle cx="128" cy="128" r="${R - 14}" fill="url(#${id}-mid)" stroke="${shade(outer, 0.25)}" stroke-width="2"/>`,
      ...spokes,
      `<circle cx="128" cy="128" r="32" fill="url(#${id}-core)" stroke="${outline(core)}" stroke-width="2.5"/>`,
      K.gloss(`${id}-gloss`, 96, 92, 22, 10),
    ],
  };
}

function enterovirus(id) {
  return { defs: [], body: capsidFacets(C.enterovirus, 88, 128, 128, 5.5) };
}

function measles(id) {
  const env = C.measlesEnvelope, H = C.haemagglutinin, F = C.fusionProtein;
  const radius = a => 70 + 6 * Math.sin(3 * a + 1) + 4 * Math.sin(5 * a);
  const spikes = Array.from({ length: 34 }, (_, k) => {
    const a = k * 2 * Math.PI / 34, deg = n(a * 180 / Math.PI + 90), r = n(radius(a) - 3);
    return `<g transform="rotate(${deg}) translate(0 ${-r})">` + (k % 2
      ? `<line x1="0" y1="2" x2="0" y2="-14" stroke="${shade(H, 0.3)}" stroke-width="3" stroke-linecap="round"/><ellipse cy="-18" rx="7" ry="5" fill="url(#${id}-h)" stroke="${outline(H)}" stroke-width="1.3"/>`
      : `<line x1="0" y1="2" x2="0" y2="-8" stroke="${shade(F, 0.3)}" stroke-width="4" stroke-linecap="round"/><ellipse cy="-12" rx="5" ry="7" fill="url(#${id}-f)" stroke="${outline(F)}" stroke-width="1.3"/>`) + `</g>`;
  });
  // Helical nucleocapsid: a looping strand with herringbone ticks.
  const strand = Array.from({ length: 141 }, (_, i) => {
    const t = i / 140, a = t * 2 * Math.PI * 1.1 + 0.6, r = 34 + 12 * Math.sin(2 * a + 0.5);
    return [r * Math.cos(a), r * Math.sin(a)];
  });
  const ticks = strand.filter((_, i) => i % 4 === 2 && i < 138).map(([x, y], j) => {
    const i = j * 4 + 2, [p, q] = [strand[i - 1], strand[i + 1]], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
    return `M${n(x - dy / l * 5)} ${n(y + dx / l * 5)}L${n(x + dy / l * 5)} ${n(y - dx / l * 5)}`;
  }).join('');
  return {
    defs: [K.sphereGradient(`${id}-env`, env), K.sphereGradient(`${id}-h`, H), K.sphereGradient(`${id}-f`, F, { focus: [0.5, 0.3] }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(128 128)">`,
      ...spikes,
      `<path d="${K.smoothClosedPath(K.polarPoints(0, 0, radius))}" fill="url(#${id}-env)" stroke="${outline(env)}" stroke-width="${STROKE}"/>`,
      `<path d="${ticks}" stroke="${shade(C.nucleus, 0.1)}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`,
      `<path d="${K.smoothOpenPath(strand)}" fill="none" stroke="${C.nucleus}" stroke-width="4" stroke-linecap="round"/>`,
      K.gloss(`${id}-gloss`, -28, -34, 22, 10),
      `</g>`,
    ],
  };
}

function sarsCov2(id) {
  const env = C.virusEnvelope, sp = C.spike, R = 60;
  // Club-shaped spike trimer, centred on x = 0 with its crown at y - 15.
  const head = y => `M-9 ${y + 8}C-14 ${y - 2} -13 ${y - 10} -7 ${y - 12}C-4 ${y - 15} 4 ${y - 15} 7 ${y - 12}` +
    `C13 ${y - 10} 14 ${y - 2} 9 ${y + 8}Z`;
  const spike = (deg, reach, grad) =>
    `<g transform="rotate(${n(deg)})">` +
    `<line x1="0" y1="${-(R - 4)}" x2="0" y2="${-(R + reach - 8)}" stroke="${shade(sp, 0.35)}" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="${head(-(R + reach))}" fill="url(#${grad})" stroke="${outline(sp)}" stroke-width="2"/></g>`;
  const back = [], front = [];
  for (let i = 0; i < 11; i++) {
    back.push(spike(i * 360 / 11 + 360 / 22, 17, `${id}-spike-back`));
    front.push(spike(i * 360 / 11 + 4, 27, `${id}-spike`));
  }
  const faceOn = [[-24, -22], [18, -30], [-2, 4], [-34, 18], [30, 14], [6, 38]];
  const rand = K.rng(7), dots = [];
  for (let tries = 0; dots.length < 22 && tries < 5000; tries++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 52, p = [d * Math.cos(a), d * Math.sin(a)];
    if (faceOn.every(f => Math.hypot(f[0] - p[0], f[1] - p[1]) > 14) &&
      dots.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 10)) dots.push(p);
  }
  return {
    defs: [
      K.sphereGradient(`${id}-env`, env),
      K.sphereGradient(`${id}-spike`, sp, { focus: [0.5, 0.3] }),
      K.sphereGradient(`${id}-spike-back`, shade(sp, 0.25), { focus: [0.5, 0.3] }),
      K.glossGradient(`${id}-gloss`),
    ],
    body: [
      `<g transform="translate(128 128)">`,
      ...back,
      `<circle r="${R}" fill="url(#${id}-env)" stroke="${outline(env)}" stroke-width="${STROKE}"/>`,
      ...dots.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="3" fill="${C.membraneProtein}" stroke="${shade(C.membraneProtein, 0.3)}" stroke-width="1"/>`),
      ...faceOn.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="url(#${id}-spike)" stroke="${outline(sp)}" stroke-width="2"/>` +
        `<circle cx="${x}" cy="${y}" r="3" fill="${shade(sp, 0.3)}"/>`),
      K.gloss(`${id}-gloss`, -24, -32, 20, 11),
      ...front,
      `</g>`,
    ],
  };
}

// Shaded icosahedral capsid with hexon capsomeres, circumradius S, centred on (cx, cy).
function capsidFacets(base, S, cx = 128, cy = 128, capsomereR = 3.6) {
  const { vertices: V, visibleFaces } = K.icosahedron();
  const project = v => [cx + S * v[0], cy - S * v[1]];
  const light = K.vec.unit([-0.45, 0.6, 0.75]);
  return visibleFaces.map(f => {
    const colour = mix(shade(base, 0.25), tint(base, 0.5), Math.max(0, K.vec.dot(f.nrm, light)));
    const [A, B, D] = f.idx.map(i => project(V[i]));
    let out = `<polygon points="${[A, B, D].map(p => p.map(n).join(',')).join(' ')}" fill="${colour}" stroke="${shade(base, 0.4)}" stroke-width="1.5" stroke-linejoin="round"/>`;
    // Hexon capsomeres: interior points of a 6-step barycentric grid.
    for (let a = 1; a <= 4; a++) for (let b = 1; a + b <= 5; b++) {
      const c = 6 - a - b;
      const p = [0, 1].map(d => (a * A[d] + b * B[d] + c * D[d]) / 6);
      out += `<circle cx="${n(p[0])}" cy="${n(p[1])}" r="${capsomereR}" fill="${tint(colour, 0.22)}" stroke="${shade(colour, 0.18)}" stroke-width="0.8"/>`;
    }
    return out;
  });
}

function adenovirus(id) {
  const base = C.capsid, S = 66;
  const { vertices: V, visibleVertices: shown } = K.icosahedron();
  const project = v => [128 + S * v[0], 128 - S * v[1]];
  const facets = capsidFacets(base, S);

  const shaft = v => {
    const [x0, y0] = project(v), [x1, y1] = project(v.map(x => x * 1.5));
    const line = `x1="${n(x0)}" y1="${n(y0)}" x2="${n(x1)}" y2="${n(y1)}" stroke-linecap="round"`;
    return `<line ${line} stroke="${outline(C.fibre)}" stroke-width="5.5"/><line ${line} stroke="${C.fibre}" stroke-width="3"/>`;
  };
  const pentonBase = tint(base, 0.55);
  const dotAt = (v, scale, r, grad, colour) => {
    const [x, y] = project(v.map(c => c * scale));
    return `<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="url(#${id}-${grad})" stroke="${outline(colour)}" stroke-width="1.5"/>`;
  };
  const knob = v => dotAt(v, 1.5, 6.5, 'knob', C.penton);
  const backV = V.filter((v, i) => !shown.has(i));
  const frontV = V.filter((v, i) => shown.has(i));
  return {
    defs: [K.sphereGradient(`${id}-knob`, C.penton), K.sphereGradient(`${id}-penton`, pentonBase, { light: 0.5 })],
    body: [
      ...backV.map(v => shaft(v) + knob(v)),
      ...facets,
      ...frontV.map(shaft),
      ...frontV.map(v => dotAt(v, 1, 7, 'penton', pentonBase)),
      ...frontV.map(knob),
    ],
  };
}

function hiv(id) {
  const env = C.hivEnvelope, sp = C.spike, cap = C.hivCapsid, R = 66;
  // Env trimer: a gp41 stalk under a three-lobed gp120 head. HIV carries few spikes.
  const spikes = Array.from({ length: 12 }, (_, i) => `<g transform="rotate(${n(i * 30 + 8 + 6 * Math.sin(i * 2.3))})">` +
    `<line x1="0" y1="${-(R - 3)}" x2="0" y2="${-(R + 10)}" stroke="${shade(sp, 0.35)}" stroke-width="4" stroke-linecap="round"/>` +
    [[-5.5, R + 15], [5.5, R + 15], [0, R + 21]].map(([x, y]) => `<circle cx="${x}" cy="${-y}" r="5.5" fill="url(#${id}-spike)" stroke="${outline(sp)}" stroke-width="1.3"/>`).join('') + `</g>`);
  const rings = [-26, -14, -2, 10, 22].map(x => {
    const h = 10 + (x + 36) * 14 / 62;
    return `M${x} ${n(-h + 1.5)}Q${x + 3} 0 ${x} ${n(h - 1.5)}`;
  }).join('');
  const rna = [-5, 5].map(o => K.smoothOpenPath(Array.from({ length: 21 }, (_, i) => {
    const x = -28 + i * 2.6;
    return [x, o * (0.5 + (x + 36) / 70) + 3 * Math.sin(i * 1.4 + o)];
  })));
  return {
    defs: [K.sphereGradient(`${id}-env`, env), K.sphereGradient(`${id}-spike`, sp), K.cylinderGradient(`${id}-capsid`, cap), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(128 128)">`,
      ...spikes,
      `<path d="${K.smoothClosedPath(K.polarPoints(0, 0, a => R + 1.5 * Math.sin(4 * a + 0.6)))}" fill="url(#${id}-env)" stroke="${outline(env)}" stroke-width="${STROKE}"/>`,
      // Matrix layer under the envelope.
      `<circle r="${R - 7}" fill="none" stroke="${shade(env, 0.22)}" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round"/>`,
      `<g transform="translate(-2 4) rotate(-40)">`,
      `<path d="${K.HIV_CAPSID}" fill="url(#${id}-capsid)" stroke="${outline(cap)}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="${rings}" fill="none" stroke="${shade(cap, 0.2)}" stroke-width="1.3" opacity="0.6"/>`,
      ...rna.map(d => `<path d="${d}" fill="none" stroke="${C.nucleus}" stroke-width="3" stroke-linecap="round"/>`),
      ...[[-16, 0], [14, -3]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${C.kinase}" stroke="${outline(C.kinase)}" stroke-width="1"/>`),
      `</g>`,
      K.gloss(`${id}-gloss`, -26, -32, 20, 10),
      `</g>`,
    ],
  };
}

function norovirus(id) {
  const base = C.norovirus, R = 84;
  const light = K.vec.unit([-0.45, 0.6, 0.75]);
  const { cups, dimers } = K.calicivirusPoints();
  const lit = v => mix(shade(base, 0.3), tint(base, 0.55), Math.max(0, K.vec.dot(v, light)));
  // A feature on the sphere, foreshortened towards the rim.
  const feature = (v, r, size, fill, stroke) => {
    const deg = n(Math.atan2(-v[1], v[0]) * 180 / Math.PI + 90);
    return `<ellipse cx="${n(128 + r * v[0])}" cy="${n(128 - r * v[1])}" rx="${size}" ry="${n(size * Math.max(0.25, v[2]))}" transform="rotate(${deg} ${n(128 + r * v[0])} ${n(128 - r * v[1])})" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`;
  };
  const items = [
    ...cups.map(v => ({ v, draw: () => feature(v, R * 0.95, 11, shade(base, 0.5), shade(base, 0.6)) })),
    ...dimers.map(v => ({ v, draw: () => feature(v, R, 10.5, lit(v), shade(lit(v), 0.3)) })),
  ].filter(f => f.v[2] > 0.06).sort((a, b) => a.v[2] - b.v[2]);
  return {
    defs: [K.sphereGradient(`${id}-shell`, shade(base, 0.25), { light: 0.35 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<circle cx="128" cy="128" r="${R}" fill="url(#${id}-shell)" stroke="${outline(base)}" stroke-width="${STROKE}"/>`,
      ...items.map(f => f.draw()),
      K.gloss(`${id}-gloss`, 92, 88, 22, 10),
    ],
  };
}

function hepatitisB(id) {
  const env = C.hbvEnvelope, ag = C.attachmentProtein, dna = C.nucleus, R = 72;
  // Surface antigen (HBsAg) round the rim and studding the face of the envelope.
  const spikes = Array.from({ length: 36 }, (_, i) => `<g transform="rotate(${i * 10 + 3})">` +
    `<line x1="0" y1="${-(R - 2)}" x2="0" y2="${-(R + 6)}" stroke="${shade(ag, 0.3)}" stroke-width="3" stroke-linecap="round"/>` +
    `<ellipse cy="${-(R + 10)}" rx="4.5" ry="5" fill="url(#${id}-ag)" stroke="${outline(ag)}" stroke-width="1.2"/></g>`);
  const rand = K.rng(111), studs = [];
  for (let tries = 0; studs.length < 26 && tries < 5000; tries++) {
    const a = rand() * 2 * Math.PI, d = 50 + rand() * 14, p = [d * Math.cos(a), d * Math.sin(a)];
    if (studs.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 11)) studs.push(p);
  }
  const [g0, g1] = [[25 * Math.cos(-3.4), 25 * Math.sin(-3.4)], [25 * Math.cos(0.7), 25 * Math.sin(0.7)]];
  return {
    defs: [K.sphereGradient(`${id}-env`, env), K.sphereGradient(`${id}-ag`, ag), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(128 128)">`,
      ...spikes,
      `<circle r="${R}" fill="url(#${id}-env)" stroke="${outline(env)}" stroke-width="${STROKE}"/>`,
      ...studs.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="3.5" fill="url(#${id}-ag)" stroke="${outline(ag)}" stroke-width="1"/>`),
      `</g>`,
      // Icosahedral core (HBcAg) holding the partly double-stranded circular DNA and its polymerase.
      ...capsidFacets(C.hbvCore, 44, 128, 128, 2.6),
      `<g transform="translate(128 128)">`,
      `<circle r="20" fill="none" stroke="${dna}" stroke-width="3"/>`,
      `<path d="M${n(g0[0])} ${n(g0[1])}A25 25 0 1 1 ${n(g1[0])} ${n(g1[1])}" fill="none" stroke="${tint(dna, 0.3)}" stroke-width="3" stroke-linecap="round"/>`,
      `<circle cx="${n(g1[0])}" cy="${n(g1[1])}" r="5" fill="${C.kinase}" stroke="${outline(C.kinase)}" stroke-width="1.2"/>`,
      `</g>`,
      K.gloss(`${id}-gloss`, 94, 86, 20, 9),
    ],
  };
}

function mpox(id) {
  const m = C.poxMembrane, core = C.poxCore, lb = C.lateralBody, X = K.MPOX, [a, b, p] = X.brick;
  const ring = inset => K.polarPoints(0, 0, t => X.radius(t, inset), 160);
  const edge = ring(0);
  // Surface tubules seen edge-on: knobs spaced evenly round the outline, along its normals.
  const knobs = K.resample([...edge, edge[0]], 12.5).slice(0, -1).map(([x, y]) => {
    const [gx, gy] = [Math.sign(x) * Math.abs(x / a) ** (p - 1) / a, Math.sign(y) * Math.abs(y / b) ** (p - 1) / b], l = Math.hypot(gx, gy);
    const [kx, ky] = [x + gx / l * 3, y + gy / l * 3], deg = n(Math.atan2(gy, gx) * 180 / Math.PI);
    return `<ellipse cx="${n(kx)}" cy="${n(ky)}" rx="6.5" ry="5" transform="rotate(${deg} ${n(kx)} ${n(ky)})" fill="${tint(m, 0.15)}" stroke="${outline(m)}" stroke-width="1.5"/>`;
  });
  const dna = Array.from({ length: 41 }, (_, i) => { const x = -50 + i * 2.5; return [x, (5 + 9 * Math.abs(x) / 56) * Math.sin(x / 4.5)]; });
  const [lx, ly, lrx, lry] = X.lateral;
  return {
    defs: [K.sphereGradient(`${id}-membrane`, m, { light: 0.45 }), K.sphereGradient(`${id}-core`, core, { light: 0.45 }), K.sphereGradient(`${id}-lateral`, lb), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(128 128) rotate(-18) scale(0.92)">`,
      ...knobs,
      `<path d="${K.smoothClosedPath(edge)}" fill="url(#${id}-membrane)" stroke="${outline(m)}" stroke-width="${STROKE}"/>`,
      `<path d="${K.smoothClosedPath(ring(9))}" fill="${tint(m, 0.45)}" stroke="${shade(m, 0.2)}" stroke-width="1.5"/>`,
      ...[-1, 1].map(s => `<ellipse cx="${lx}" cy="${s * ly}" rx="${lrx}" ry="${lry}" fill="url(#${id}-lateral)" stroke="${outline(lb)}" stroke-width="2"/>`),
      `<path d="${X.core}" fill="url(#${id}-core)" stroke="${outline(core)}" stroke-width="2.5"/>`,
      `<path d="${K.smoothOpenPath(dna)}" fill="none" stroke="${tint(core, 0.5)}" stroke-width="2.5" stroke-linecap="round"/>`,
      K.gloss(`${id}-gloss`, -52, -42, 20, 8, -10),
      `</g>`,
    ],
  };
}

function dengue(id) {
  const R = 84, env = C.flavivirus, light = K.vec.unit([-0.45, 0.6, 0.75]);
  const P = v => `${n(128 + R * v[0])},${n(128 - R * v[1])}`;
  // Each dimer is two antiparallel monomers side by side, each with domains III, I and II in turn.
  const domains = [[-0.42, -0.3, 'eDomainIII'], [-0.29, -0.06, 'eDomainI'], [-0.05, 0.42, 'eDomainII']];
  const pieces = [];
  for (const raft of K.flavivirusRafts()) for (const v of [-0.19, 0, 0.19]) for (const side of [-1, 1]) {
    const w = v + side * 0.038, h = 0.032;
    for (const [u0, u1, dom] of domains) {
      const [a, b] = side > 0 ? [u0, u1] : [-u1, -u0], pts = [];
      for (let k = 0; k <= 4; k++) pts.push(K.onSphere(raft, a + (b - a) * k / 4, w - h));
      for (let k = 4; k >= 0; k--) pts.push(K.onSphere(raft, a + (b - a) * k / 4, w + h));
      const mid = K.onSphere(raft, (a + b) / 2, w);
      pieces.push({ z: mid[2], pts, colour: mix(shade(C[dom], 0.32), tint(C[dom], 0.4), Math.max(0, K.vec.dot(mid, light))) });
    }
  }
  return {
    defs: [K.sphereGradient(`${id}-env`, env, { light: 0.4 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<circle cx="128" cy="128" r="${R}" fill="url(#${id}-env)"/>`,
      ...pieces.filter(q => q.z > 0).sort((q, r) => q.z - r.z).map(q =>
        `<polygon points="${q.pts.map(P).join(' ')}" fill="${q.colour}" stroke="${shade(q.colour, 0.3)}" stroke-width="0.8" stroke-linejoin="round"/>`),
      `<circle cx="128" cy="128" r="${R}" fill="none" stroke="${outline(env)}" stroke-width="${STROKE}"/>`,
      K.gloss(`${id}-gloss`, 94, 88, 24, 10),
    ],
  };
}

function parvovirus(id) {
  const base = C.parvovirus, R = 72, light = K.vec.unit([-0.45, 0.6, 0.75]);
  const { five, three, two } = K.icosahedralAxes();
  const lit = (v, k = 0.55) => mix(shade(base, 0.3), tint(base, k), Math.max(0, K.vec.dot(v, light)));
  // A feature on the sphere, foreshortened towards the rim.
  const feature = (v, size, fill, stroke, r = R) => {
    const [x, y] = [n(128 + r * v[0]), n(128 - r * v[1])], deg = n(Math.atan2(-v[1], v[0]) * 180 / Math.PI + 90);
    return `<ellipse cx="${x}" cy="${y}" rx="${size}" ry="${n(size * Math.max(0.25, v[2]))}" transform="rotate(${deg} ${x} ${y})" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`;
  };
  const items = [
    // 5-fold axes: a pore ringed by a canyon.
    ...five.map(v => ({ v, draw: () => feature(v, 11, shade(base, 0.32), shade(base, 0.45), R * 0.99) + feature(v, 4.5, lit(v, 0.3), shade(base, 0.45)) })),
    // 3-fold axes: a spike of three loops, one from each subunit, merged (outlines first).
    ...three.map(({ centre, edges }) => {
      const loops = edges.map(e => K.vec.unit(centre.map((c, d) => c + 0.075 * (e[d] - c) / Math.hypot(...K.vec.sub(e, centre)))));
      const colour = lit(centre);
      return { v: centre, draw: () => loops.map(v => feature(v, 8, shade(colour, 0.35), shade(colour, 0.35), R * 1.02).replace('stroke-width="1.2"', 'stroke-width="3"')).join('') +
        loops.map(v => feature(v, 8, colour, 'none', R * 1.02)).join('') + feature(centre, 3, tint(colour, 0.4), 'none', R * 1.03) };
    }),
    // 2-fold axes: a shallow dimple.
    ...two.map(v => ({ v, draw: () => feature(v, 4, shade(base, 0.2), 'none', R * 0.99) })),
  ].filter(f => f.v[2] > 0.06).sort((p, q) => p.v[2] - q.v[2]);
  return {
    defs: [K.sphereGradient(`${id}-shell`, base, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<circle cx="128" cy="128" r="${R}" fill="url(#${id}-shell)" stroke="${outline(base)}" stroke-width="${STROKE}"/>`,
      ...items.map(f => f.draw()),
      K.gloss(`${id}-gloss`, 98, 94, 20, 9),
    ],
  };
}

function rabies(id) {
  const env = C.rabiesEnvelope, sp = C.spike, nc = C.nucleocapsid, B = K.RABIES, { base, tip, r } = B;
  // Glycoprotein spikes cover the virion except its flat base.
  const spikes = Array.from({ length: B.spikes }, (_, k) => B.along((k + 0.5) / B.spikes * B.perimeter)).filter(([x]) => x > -base + 5).map(([x, y, nx, ny]) =>
    `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(Math.atan2(ny, nx) * 180 / Math.PI)})"><line x1="-2" y1="0" x2="9" y2="0" stroke="${shade(sp, 0.3)}" stroke-width="3" stroke-linecap="round"/>` +
    `<ellipse cx="13" rx="5" ry="4" fill="url(#${id}-spike)" stroke="${outline(sp)}" stroke-width="1.2"/></g>`);
  // The helical nucleocapsid, seen as cross-striations.
  const coils = [];
  for (let x = -base + 12; x < tip + r - 6; x += 7) coils.push(`M${x} ${-r}L${x + 4} ${r}`);
  return {
    defs: [`<clipPath id="${id}-inner"><path d="${K.bulletPath(B, 11)}"/></clipPath>`,
      K.sphereGradient(`${id}-env`, env, { light: 0.45 }), K.sphereGradient(`${id}-spike`, sp), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(128 128) rotate(-30) translate(${(base - tip - r) / 2} 0)">`,
      ...spikes,
      `<path d="${K.bulletPath()}" fill="url(#${id}-env)" stroke="${outline(env)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<path d="${K.bulletPath(B, 7)}" fill="${tint(env, 0.4)}" stroke="${shade(env, 0.2)}" stroke-width="1.5"/>`,
      `<g clip-path="url(#${id}-inner)"><path d="${coils.join('')}" stroke="${outline(nc)}" stroke-width="5.5" stroke-linecap="round"/>` +
      `<path d="${coils.join('')}" stroke="${nc}" stroke-width="3.2" stroke-linecap="round"/></g>`,
      K.gloss(`${id}-gloss`, -30, -20, 30, 7, 0),
      `</g>`,
    ],
  };
}

function hepatitisC(id) {
  const env = C.hcvEnvelope, H = K.HEPATITIS_C, R = H.R, e1 = C.penton, e2 = C.attachmentProtein, core = C.hcvCore;
  // E1/E2 heterodimers round the envelope.
  const spikes = Array.from({ length: H.spikes }, (_, i) => `<g transform="rotate(${n(i * 360 / H.spikes + 4)} 128 128)">` +
    `<line x1="128" y1="${128 - R + 2}" x2="128" y2="${128 - R - 7}" stroke="${shade(e2, 0.3)}" stroke-width="3" stroke-linecap="round"/>` +
    `<ellipse cx="124" cy="${128 - R - 11}" rx="3.5" ry="5" fill="${e1}" stroke="${outline(e1)}" stroke-width="1"/>` +
    `<ellipse cx="131" cy="${128 - R - 12}" rx="4.5" ry="6" fill="url(#${id}-e2)" stroke="${outline(e2)}" stroke-width="1"/></g>`);
  return {
    defs: [K.sphereGradient(`${id}-env`, env, { light: 0.45 }), K.sphereGradient(`${id}-e2`, e2), K.sphereGradient(`${id}-core`, core, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      ...spikes,
      `<circle cx="128" cy="128" r="${R}" fill="url(#${id}-env)" stroke="${outline(env)}" stroke-width="${STROKE}"/>`,
      `<circle cx="128" cy="128" r="${R - 7}" fill="none" stroke="${tint(env, 0.45)}" stroke-width="2" stroke-dasharray="3 4" stroke-linecap="round"/>`,
      // The core, holding the single-stranded RNA genome.
      `<circle cx="128" cy="128" r="${H.core}" fill="url(#${id}-core)" stroke="${outline(core)}" stroke-width="2.5"/>`,
      `<path d="${K.hcvRna()}" fill="none" stroke="${shade(C.mrna, 0.25)}" stroke-width="2.5" stroke-linecap="round"/>`,
      K.gloss(`${id}-gloss`, 94, 88, 20, 9),
    ],
  };
}

function cmvCell(id) {
  const X = K.CMV_CELL, cyto = C.cmvCytoplasm, nuc = C.nucleus;
  const [cx, cy, R] = X.cell, [nx, ny, nrx, nry, na] = X.nucleus, [hx, hy, hrx, hry] = X.halo, [ix, iy, irx, iry] = X.inclusion;
  const blob = (x, y, r, k) => K.smoothClosedPath(K.polarPoints(x, y, a => r * (1 + 0.03 * Math.sin(k * a + 1)), 90));
  const ell = (x, y, rx, ry, attrs) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${na} ${x} ${y})" ${attrs}/>`;
  return {
    defs: [K.sphereGradient(`${id}-cyto`, cyto, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }),
      K.sphereGradient(`${id}-inclusion`, C.cmvInclusion, { light: 0.3 }), K.glossGradient(`${id}-gloss`)],
    body: [
      // Two normal cells for scale, then the enlarged (cytomegalic) infected cell.
      ...X.neighbours.map(([x, y, r]) => `<path d="${blob(x, y, r, 5)}" fill="url(#${id}-cyto)" stroke="${shade(cyto, 0.32)}" stroke-width="2.5"/>` +
        `<circle cx="${x - 1}" cy="${y - 1}" r="${n(r * 0.45)}" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="1.5"/>`),
      `<path d="${blob(cx, cy, R, 6)}" fill="url(#${id}-cyto)" stroke="${shade(cyto, 0.32)}" stroke-width="${STROKE}"/>`,
      ...X.granules.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.cmvInclusion}" opacity="0.8"/>`),
      // Owl's eye: chromatin pushed to the nuclear rim, a clear halo, and the large inclusion.
      ell(nx, ny, nrx, nry, `fill="${tint(nuc, 0.45)}" stroke="${outline(nuc)}" stroke-width="4"`),
      ell(hx, hy, hrx, hry, `fill="${C.halo}"`),
      ell(ix, iy, irx, iry, `fill="url(#${id}-inclusion)" stroke="${shade(C.cmvInclusion, 0.3)}" stroke-width="1.5"`),
      K.gloss(`${id}-gloss`, 82, 70, 18, 8),
    ],
  };
}

// ------------------------------------------------------------------- fungi

function candida(id) {
  const base = C.fungus, nuc = shade(base, 0.45);
  const cell = (tx, ty, rot, rx, ry, inside) =>
    `<g transform="translate(${tx} ${ty}) rotate(${rot})">` +
    `<ellipse rx="${rx}" ry="${ry}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}"/>` +
    `<ellipse rx="${rx - 6}" ry="${ry - 6}" fill="none" stroke="${tint(base, 0.5)}" stroke-width="2" opacity="0.75"/>` +
    inside + `</g>`;
  const vacuole = (x, y, rx, ry) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${tint(base, 0.72)}" stroke="${shade(base, 0.15)}" stroke-width="1.2"/>`;
  const granules = [[-36, 22], [-12, 32], [36, -26], [-50, -4], [44, 24]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${shade(base, 0.3)}" opacity="0.55"/>`).join('');
  const mother = vacuole(14, 6, 26, 21) +
    `<circle cx="-28" cy="-16" r="13" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="1.5"/>` +
    granules +
    `<circle cx="-44" cy="34" r="6" fill="none" stroke="${shade(base, 0.32)}" stroke-width="2.5"/>` +
    K.gloss(`${id}-gloss`, -30, -32, 24, 12);
  const bud = vacuole(4, 4, 13, 10) + K.gloss(`${id}-gloss`, -12, -12, 10, 6);
  return {
    defs: [K.sphereGradient(`${id}-body`, base), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [cell(102, 142, -15, 70, 58, mother), cell(188, 88, -35, 38, 31, bud)],
  };
}

function aspergillus(id) {
  const m = C.mould, c = C.conidia, vx = 128, vy = 100, vr = 22;
  const angles = Array.from({ length: 9 }, (_, i) => (-165 + i * 18.75) * Math.PI / 180);
  const radial = (a, r) => [vx + r * Math.cos(a), vy + r * Math.sin(a)];
  const phialides = angles.map(a => {
    const [p, q] = [radial(a, vr - 2), radial(a, vr + 11)];
    return K.pipe(`M${n(p[0])} ${n(p[1])}L${n(q[0])} ${n(q[1])}`, shade(m, 0.08), 5);
  });
  const conidia = [3, 2, 1, 0].flatMap(j => angles.map(a => {
    const [x, y] = radial(a, vr + 17 + j * 10.5);
    return `<circle cx="${n(x)}" cy="${n(y)}" r="5.2" fill="url(#${id}-conidium)" stroke="${outline(c)}" stroke-width="1.2"/>`;
  }));
  return {
    defs: [K.sphereGradient(`${id}-vesicle`, m), K.sphereGradient(`${id}-conidium`, c)],
    body: [
      K.pipe('M70 202Q58 188 42 178', m, 10),
      K.pipe('M172 202Q190 214 212 234', m, 10),
      K.pipe('M30 202L226 202', m, 12),
      `<g stroke="${outline(m)}" stroke-width="2">` + [56, 100, 150, 198].map(x => `<line x1="${x}" y1="196" x2="${x}" y2="208"/>`).join('') + `</g>`,
      K.pipe(`M128 202L128 ${vy + vr - 4}`, m, 11),
      ...phialides,
      `<circle cx="${vx}" cy="${vy}" r="${vr}" fill="url(#${id}-vesicle)" stroke="${outline(m)}" stroke-width="2.5"/>`,
      ...conidia,
    ],
  };
}

function cryptococcus(id) {
  const base = C.fungus, nuc = shade(base, 0.45), cap = C.capsule, cells = K.CRYPTOCOCCUS_CELLS;
  // Fine fibrils radiating through each capsule, left out where another cell lies.
  const rand = K.rng(91), fibrils = [];
  cells.forEach(([x, y, r, R]) => {
    for (let k = 0; k < R * 0.9; k++) {
      const a = rand() * 2 * Math.PI, d0 = r + 5 + rand() * (R - r - 14), d1 = d0 + 6 + rand() * 6;
      const p = [x + d1 * Math.cos(a), y + d1 * Math.sin(a)];
      if (cells.every(([cx, cy, cr]) => Math.hypot(p[0] - cx, p[1] - cy) > cr + 4)) {
        fibrils.push(`M${n(x + d0 * Math.cos(a))} ${n(y + d0 * Math.sin(a))}L${n(p[0])} ${n(p[1])}`);
      }
    }
  });
  const cell = ([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}"/>` +
    `<circle cx="${x}" cy="${y}" r="${r - 5}" fill="none" stroke="${tint(base, 0.5)}" stroke-width="1.8" opacity="0.7"/>` +
    (i === 0 ? `<circle cx="${x - 14}" cy="${y - 10}" r="13" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="1.5"/>` +
      `<ellipse cx="${x + 14}" cy="${y + 12}" rx="15" ry="12" fill="${tint(base, 0.72)}" stroke="${shade(base, 0.15)}" stroke-width="1.2"/>` +
      [[-24, 18], [2, 28], [24, -16]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="2.8" fill="${shade(base, 0.3)}" opacity="0.55"/>`).join('') : '') +
    K.gloss(`${id}-gloss`, x - r * 0.35, y - r * 0.42, r * 0.4, r * 0.2);
  return {
    defs: [K.sphereGradient(`${id}-body`, base), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      // Capsules: outline layer first, then fills, so overlapping capsules merge into one halo.
      ...cells.map(([x, y, , R]) => `<circle cx="${x}" cy="${y}" r="${R + 1}" fill="${shade(cap, 0.2)}"/>`),
      ...cells.map(([x, y, , R]) => `<circle cx="${x}" cy="${y}" r="${R - 1}" fill="${cap}"/>`),
      `<path d="${fibrils.join('')}" stroke="${shade(cap, 0.22)}" stroke-width="1.3" stroke-linecap="round" opacity="0.7"/>`,
      // The bud is drawn first so the mother cell covers its narrow neck.
      cell(cells[1], 1), cell(cells[0], 0), cell(cells[2], 2),
    ],
  };
}

function pneumocystis(id) {
  const base = C.fungus, nuc = C.nucleus, P = K.PNEUMOCYSTIS;
  // Eight intracystic bodies in a rosette.
  const rosette = (x, y, r) => Array.from({ length: 8 }, (_, k) => {
    const a = k * Math.PI / 4 + 0.2, [px, py] = [x + r * 0.52 * Math.cos(a), y + r * 0.52 * Math.sin(a)], deg = n(a * 180 / Math.PI + 90);
    return `<ellipse cx="${n(px)}" cy="${n(py)}" rx="${n(r * 0.16)}" ry="${n(r * 0.12)}" transform="rotate(${deg} ${n(px)} ${n(py)})" fill="${tint(base, 0.55)}" stroke="${shade(base, 0.3)}" stroke-width="1"/>` +
      `<circle cx="${n(px)}" cy="${n(py)}" r="${n(r * 0.06)}" fill="${nuc}"/>`;
  }).join('');
  const cyst = ([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}-cyst)" stroke="${outline(base)}" stroke-width="${STROKE}"/>` +
    `<circle cx="${x}" cy="${y}" r="${r - 4}" fill="none" stroke="${shade(base, 0.22)}" stroke-width="2"/>` + rosette(x, y, r);
  const [cx, cy, cr] = P.collapsed;
  return {
    defs: [K.sphereGradient(`${id}-cyst`, base, { light: 0.45 }), K.sphereGradient(`${id}-troph`, tint(base, 0.25), { light: 0.5 })],
    body: [
      ...P.trophs.map(([x, y, r], i) => `<path d="${K.smoothClosedPath(K.polarPoints(x, y, a => r * (1 + 0.22 * Math.sin(3 * a + i) + 0.1 * Math.sin(5 * a + 2 * i)), 40))}" fill="url(#${id}-troph)" stroke="${outline(base)}" stroke-width="1.8"/>` +
        `<circle cx="${x + 1}" cy="${y - 1}" r="${n(r * 0.3)}" fill="${nuc}"/>`),
      ...P.cysts.map(cyst),
      // A collapsed cyst, dented into a cup ("crushed ping-pong ball").
      `<circle cx="${cx}" cy="${cy}" r="${cr}" fill="url(#${id}-cyst)" stroke="${outline(base)}" stroke-width="${STROKE}"/>`,
      `<ellipse cx="${cx + 5}" cy="${cy - 6}" rx="${cr * 0.78}" ry="${cr * 0.5}" transform="rotate(-35 ${cx + 5} ${cy - 6})" fill="${shade(base, 0.25)}" stroke="${shade(base, 0.4)}" stroke-width="1.5" opacity="0.75"/>`,
    ],
  };
}

function rhizopus(id) {
  const h = C.fungus, sg = C.sporangium, col = C.columella, Z = K.RHIZOPUS;
  const width = Z.width, line = K.densify(Z.stolon, 12), i = Math.round(Z.septum * (line.length - 1));
  const [p, q] = [line[i - 1], line[i + 1]], l = Math.hypot(q[0] - p[0], q[1] - p[1]);
  const [nx, ny, w] = [-(q[1] - p[1]) / l, (q[0] - p[0]) / l, width(Z.septum) / 2 - 2];
  const [sx, sy, sr] = Z.sporangium, [cx, cy] = Z.columella, [yx, yy, yr] = Z.young;
  const spores = [];
  for (let y = -sr; y <= sr; y += 8) for (let x = -sr; x <= sr; x += 9) {
    const px = x + (Math.round(y / 8) % 2 ? 4.5 : 0);
    if (Math.hypot(px, y) < sr - 6) spores.push(`<circle cx="${n(sx + px)}" cy="${n(sy + y)}" r="2.6" fill="${tint(sg, 0.3)}"/>`);
  }
  return {
    defs: [K.cylinderGradient(`${id}-hypha`, h), K.sphereGradient(`${id}-sporangium`, sg, { light: 0.4 }), K.sphereGradient(`${id}-young`, tint(sg, 0.55), { light: 0.4 }),
      K.sphereGradient(`${id}-columella`, col, { light: 0.5 }), K.glossGradient(`${id}-gloss`)],
    body: [
      ...Z.rhizoids.map(d => K.pipe(d, shade(h, 0.1), 3.5)),
      `<path d="${K.wormOutline(Z.stolon, width)}" fill="url(#${id}-hypha)" stroke="${outline(h)}" stroke-width="2.5"/>`,
      `<path d="M${n(line[i][0] + nx * w)} ${n(line[i][1] + ny * w)}L${n(line[i][0] - nx * w)} ${n(line[i][1] - ny * w)}" stroke="${outline(h)}" stroke-width="2" stroke-linecap="round"/>`,
      ...Z.stalks.map(d => K.pipe(d, h, 8)),
      // The burst sporangium: the apophysis, the bare columella and a ragged collar.
      `<path d="M${cx - 4} ${cy + 16}L${cx - 10} ${cy + 3}L${cx + 10} ${cy + 3}L${cx + 4} ${cy + 16}Z" fill="${h}" stroke="${outline(h)}" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M${cx - 15} ${cy + 4}C${cx - 15} ${cy - 26} ${cx + 15} ${cy - 26} ${cx + 15} ${cy + 4}Z" fill="url(#${id}-columella)" stroke="${outline(col)}" stroke-width="2"/>`,
      `<path d="M${cx - 17} ${cy + 1}l3 6l3 -5l3 6M${cx + 17} ${cy + 1}l-3 6l-3 -5l-3 6" fill="none" stroke="${sg}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`,
      `<circle cx="${yx}" cy="${yy}" r="${yr}" fill="url(#${id}-young)" stroke="${outline(tint(sg, 0.55))}" stroke-width="2"/>`,
      `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="url(#${id}-sporangium)" stroke="${outline(sg)}" stroke-width="${STROKE}"/>`,
      ...spores,
      K.gloss(`${id}-gloss`, sx - 13, sy - 15, 12, 6),
      ...Z.spores.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}-sporangium)" stroke="${outline(sg)}" stroke-width="1"/>`),
    ],
  };
}

// --------------------------------------------------------------- parasites

function malaria(id) {
  const rbc = C.erythrocyte, p = C.plasmodium, chrom = C.chromatin;
  const ring = (x, y) => `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${p}" stroke-width="3.5"/>` +
    `<circle cx="${x + 10}" cy="${y - 9}" r="5" fill="${chrom}" stroke="${outline(chrom)}" stroke-width="1"/>`;
  return {
    defs: [K.sphereGradient(`${id}-front`, rbc), K.sphereGradient(`${id}-back`, shade(rbc, 0.15)),
      `<radialGradient id="${id}-pallor"><stop offset="0" stop-color="${tint(rbc, 0.35)}"/><stop offset="1" stop-color="${tint(rbc, 0.35)}" stop-opacity="0"/></radialGradient>`,
      K.glossGradient(`${id}-gloss`)],
    body: [
      `<circle cx="196" cy="64" r="44" fill="url(#${id}-back)" stroke="${outline(shade(rbc, 0.15))}" stroke-width="${STROKE}"/>`,
      `<path d="M176 74C186 54 206 50 220 60" fill="none" stroke="${outline(p)}" stroke-width="15" stroke-linecap="round"/>`,
      `<path d="M176 74C186 54 206 50 220 60" fill="none" stroke="${p}" stroke-width="11" stroke-linecap="round"/>`,
      ...[[190, 60], [200, 56], [208, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="${chrom}"/>`),
      `<circle cx="112" cy="146" r="86" fill="url(#${id}-front)" stroke="${outline(rbc)}" stroke-width="${STROKE}"/>`,
      `<circle cx="112" cy="146" r="46" fill="url(#${id}-pallor)"/>`,
      ring(84, 122), ring(140, 176), ring(150, 112),
      K.gloss(`${id}-gloss`, 66, 92, 26, 12),
    ],
  };
}

function toxoplasma(id) {
  const base = C.toxoplasma, rho = C.rhoptry, mic = C.microneme;
  // Tachyzoite: crescent with the apical (conoid) end at the top right.
  const body = 'M60 200C40 156 86 72 192 56C206 54 214 62 206 72C156 104 116 152 98 202C92 216 66 216 60 200Z';
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5 }), K.sphereGradient(`${id}-nucleus`, C.nucleus, { light: 0.45 }),
      K.sphereGradient(`${id}-rho`, rho), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${body}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<ellipse cx="96" cy="168" rx="15" ry="21" transform="rotate(30 96 168)" fill="url(#${id}-nucleus)" stroke="${outline(C.nucleus)}" stroke-width="2"/>`,
      ...[[146, 104], [158, 94], [134, 116]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="15" transform="rotate(54 ${x} ${y})" fill="url(#${id}-rho)" stroke="${outline(rho)}" stroke-width="1.2"/>`),
      ...[[182, 70], [190, 65], [176, 78], [186, 76], [196, 63], [170, 84]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2" ry="4.5" transform="rotate(54 ${x} ${y})" fill="${mic}" stroke="${outline(mic)}" stroke-width="0.8"/>`),
      ...[[118, 150], [80, 196], [124, 128]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${shade(base, 0.3)}" opacity="0.6"/>`),
      `<path d="M197 60C201 58 205 60 207 64M195 64C199 62 203 64 205 68" fill="none" stroke="${outline(base)}" stroke-width="2" stroke-linecap="round"/>`,
      K.gloss(`${id}-gloss`, 84, 126, 10, 26, 30),
    ],
  };
}

function giardia(id) {
  const base = C.giardia, G = K.GIARDIA, [dx, dy, drx, dry] = G.disc, nuc = C.nucleus;
  const flagella = [...G.flagella, ...G.flagella.map(K.mirrorX)].join('') + G.caudal;
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.12 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${flagella}" fill="none" stroke="${outline(base)}" stroke-width="3" stroke-linecap="round"/>`,
      `<path d="${G.body}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      // Ventral adhesive disc, ridged by its microribbons.
      `<ellipse cx="${dx}" cy="${dy}" rx="${drx}" ry="${dry}" fill="${tint(base, 0.45)}" stroke="${shade(base, 0.25)}" stroke-width="2"/>`,
      ...[0.82, 0.64, 0.46].map(k => `<ellipse cx="${dx}" cy="${dy}" rx="${n(drx * k)}" ry="${n(dry * k)}" fill="none" stroke="${shade(base, 0.15)}" stroke-width="1.2" opacity="0.6"/>`),
      // Axonemes running down the midline, and the two median bodies.
      `<path d="M123 70L124 206M133 70L132 206" stroke="${shade(base, 0.35)}" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>`,
      ...G.medianBodies.map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="4" transform="rotate(${a} ${x} ${y})" fill="${shade(base, 0.45)}"/>`),
      ...G.nuclei.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="17" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2"/>` +
        `<circle cx="${x}" cy="${y + 1}" r="4" fill="${shade(nuc, 0.35)}"/>`),
      K.gloss(`${id}-gloss`, 92, 62, 20, 9),
    ],
  };
}

function mosquito(id) {
  const body = C.mosquito, M = K.MOSQUITO, wing = C.wing;
  const leg = (pts, colour, w) => `<path d="M${pts.map(p => p.join(' ')).join('L')}" fill="none" stroke="${colour}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const [ax, ay] = M.abdomen.from, [bx, by] = M.abdomen.to, [w0, w1] = M.abdomen.widths;
  const len = Math.hypot(bx - ax, by - ay), deg = n(Math.atan2(by - ay, bx - ax) * 180 / Math.PI);
  const abdomen = `M0 ${-w0}C${len * 0.4} ${-w0 - 2} ${len * 0.8} ${-w1 - 2} ${len} ${-w1}Q${len + w1 + 2} 0 ${len} ${w1}C${len * 0.8} ${w1 + 2} ${len * 0.4} ${w0 + 2} 0 ${w0}Z`;
  const [hx, hy, hr] = M.head, [tx, ty, trx, try_, ta] = M.thorax, [wx, wy, wrx, wry, wa] = M.wing;
  // Sparse hair whorls along the (female) antenna.
  const [[a0x, a0y], [a1x, a1y]] = M.antenna;
  const whorls = Array.from({ length: 6 }, (_, i) => {
    const t = (i + 1) / 7, x = a0x + (a1x - a0x) * t, y = a0y + (a1y - a0y) * t;
    return `M${n(x - 4)} ${n(y + 2)}L${n(x + 4)} ${n(y - 2)}`;
  }).join('');
  return {
    defs: [K.sphereGradient(`${id}-body`, body, { light: 0.45 }), K.cylinderGradient(`${id}-abdomen`, body),
      `<linearGradient id="${id}-wing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.75"/><stop offset="1" stop-color="${wing}" stop-opacity="0.45"/></linearGradient>`],
    body: [
      ...M.farLegs.map(p => leg(p, tint(body, 0.25), 2.5)),
      `<path d="${abdomen}" transform="translate(${ax} ${ay}) rotate(${deg})" fill="url(#${id}-abdomen)" stroke="${outline(body)}" stroke-width="2.5"/>`,
      `<path d="${Array.from({ length: 6 }, (_, i) => { const x = n(len * (i + 1) / 7), h = n(w0 + (w1 - w0) * (i + 1) / 7); return `M${x} ${-h}L${x} ${h}`; }).join('')}" transform="translate(${ax} ${ay}) rotate(${deg})" stroke="${shade(body, 0.3)}" stroke-width="1.5"/>`,
      // Folded wing over the abdomen, with the dark spots along the front edge typical of Anopheles.
      `<ellipse cx="${wx}" cy="${wy}" rx="${wrx}" ry="${wry}" transform="rotate(${wa} ${wx} ${wy})" fill="url(#${id}-wing)" stroke="${shade(wing, 0.35)}" stroke-width="1.5"/>`,
      ...[-36, -16, 4, 24, 42].map(x => {
        const r = wa * Math.PI / 180, sx = n(wx + x * Math.cos(r) + 7 * Math.sin(r)), sy = n(wy + x * Math.sin(r) - 7 * Math.cos(r));
        return `<ellipse cx="${sx}" cy="${sy}" rx="4.5" ry="2.5" transform="rotate(${wa} ${sx} ${sy})" fill="${shade(body, 0.3)}" opacity="0.8"/>`;
      }),
      `<ellipse cx="${tx}" cy="${ty}" rx="${trx}" ry="${try_}" transform="rotate(${ta} ${tx} ${ty})" fill="url(#${id}-body)" stroke="${outline(body)}" stroke-width="${STROKE}"/>`,
      leg(M.proboscis, outline(body), 4.5), leg(M.proboscis, shade(body, 0.1), 2.5),
      leg(M.palps, shade(body, 0.2), 3),
      leg(M.antenna, shade(body, 0.3), 2),
      `<path d="${whorls}" stroke="${shade(body, 0.3)}" stroke-width="1.2" stroke-linecap="round"/>`,
      `<circle cx="${hx}" cy="${hy}" r="${hr}" fill="url(#${id}-body)" stroke="${outline(body)}" stroke-width="2.5"/>`,
      `<circle cx="${hx - 3}" cy="${hy - 1}" r="9" fill="${shade(body, 0.55)}"/>`,
      ...M.nearLegs.map(p => leg(p, outline(body), 4.5) + leg(p, shade(body, 0.1), 2.5)),
    ],
  };
}

function threadworm(id) {
  const w = C.worm, T = K.THREADWORM;
  const gut = pts => K.smoothOpenPath(K.densify(pts, 12).filter((_, i, a) => i > a.length * 0.06 && i < a.length * 0.62));
  const worm = ({ pts, width }) => `<path d="${K.wormOutline(pts, width)}" fill="url(#${id}-worm)" stroke="${outline(w)}" stroke-width="2.5" stroke-linejoin="round"/>` +
    `<path d="${gut(pts)}" fill="none" stroke="${shade(w, 0.22)}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>`;
  return {
    defs: [K.sphereGradient(`${id}-worm`, w, { light: 0.6, dark: 0.12 }), K.sphereGradient(`${id}-egg`, '#F7F2E6', { light: 0.6, dark: 0.1 })],
    body: [
      worm(T.male), worm(T.female),
      ...T.eggs.map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="${T.egg}" fill="url(#${id}-egg)" stroke="${shade(w, 0.35)}" stroke-width="1.8"/>` +
        `<path d="${T.larva}" fill="none" stroke="${shade(w, 0.4)}" stroke-width="2.5" stroke-linecap="round"/></g>`),
    ],
  };
}

function scabiesMite(id) {
  const body = C.mite, leg = C.arthropodLeg, S = K.SCABIES, [bx, by, rx, ry] = S.body;
  const legs = S.legs.map(([[hx, hy], [fx, fy], kind]) => {
    const l = Math.hypot(fx - hx, fy - hy), [ux, uy] = [(fx - hx) / l, (fy - hy) / l];
    const tip = kind === 'sucker'
      ? `M${fx} ${fy}L${n(fx + ux * 12)} ${n(fy + uy * 12)}`
      : `M${fx} ${fy}L${n(fx + ux * 38)} ${n(fy + uy * 38)}`;
    return { d: `M${hx} ${hy}L${fx} ${fy}`, tip, sucker: kind === 'sucker' && [fx + ux * 15, fy + uy * 15] };
  });
  const ridges = S.ridges.map(y => {
    const half = rx * Math.sqrt(1 - ((y - by) / ry) ** 2) - 10;
    return K.smoothOpenPath(Array.from({ length: 13 }, (_, i) => [bx - half + i * half / 6, y + 2 * Math.sin(i * 1.6)]));
  }).join('');
  const spines = S.spines.map(([x, y]) => `M${x - 3.5} ${y - 3}L${x} ${y + 6}L${x + 3.5} ${y - 3}Z`).join('');
  return {
    defs: [K.sphereGradient(`${id}-body`, body, { light: 0.6, dark: 0.12 }), K.cylinderGradient(`${id}-leg`, leg)],
    body: [
      `<path d="${legs.map(l => l.tip).join('')}${K.mirrorX(legs.map(l => l.tip).join(''))}" stroke="${shade(leg, 0.25)}" stroke-width="1.6" stroke-linecap="round"/>`,
      ...legs.flatMap(l => [K.pipe(l.d, leg, 9), K.pipe(K.mirrorX(l.d), leg, 9)]),
      ...legs.filter(l => l.sucker).flatMap(({ sucker: [x, y] }) => [x, 256 - x].map(sx => `<circle cx="${n(sx)}" cy="${n(y)}" r="3.5" fill="${leg}" stroke="${outline(leg)}" stroke-width="1"/>`)),
      `<path d="${S.gnathosoma}" fill="url(#${id}-leg)" stroke="${outline(leg)}" stroke-width="2" stroke-linejoin="round"/>`,
      `<ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}" fill="url(#${id}-body)" stroke="${outline(body)}" stroke-width="${STROKE}"/>`,
      // Transverse ridges at the front, and backward-pointing spines behind them.
      `<path d="${ridges}" fill="none" stroke="${shade(body, 0.28)}" stroke-width="1.6" stroke-linecap="round"/>`,
      `<path d="${spines}" fill="${shade(body, 0.35)}"/>`,
    ],
  };
}

function headLouse(id) {
  const base = C.louse, L = K.HEAD_LOUSE, legC = shade(base, 0.15);
  const poly = pts => 'M' + pts.map(p => p.join(' ')).join('L');
  const legs = L.legs.map(poly).join(''), antenna = poly(L.antenna);
  // Each leg ends in a large claw for gripping a hair.
  const claws = L.legs.map(pts => { const [x, y] = pts[pts.length - 1]; return `M${x + 3} ${y - 3}C${x - 6} ${y - 2} ${x - 7} ${y + 8} ${x} ${y + 9}`; }).join('');
  const [ax, ay, arx, ary] = L.abdomen, [hx, hy, hrx, hry] = L.head, [tx, ty, trx, try_] = L.thorax, [nx, ny, nrx, nry, na] = L.nit;
  const abdomen = K.smoothClosedPath(K.polarPoints(ax, ay, a => K.ellipseRadius(arx, ary, a) - 2.5 * (1 - Math.cos(14 * a)) / 2, 168));
  const segments = [116, 132, 148, 164, 180, 196].map(y => {
    const half = arx * Math.sqrt(1 - ((y - ay) / ary) ** 2) - 4;
    return `M${n(ax - half)} ${y}Q${ax} ${y + 5} ${n(ax + half)} ${y}`;
  }).join('');
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5 }), K.sphereGradient(`${id}-nit`, '#EDE3C8', { light: 0.6 })],
    body: [
      K.pipe(L.hair, C.hair, 4),
      `<g transform="rotate(${na} ${nx} ${ny})"><ellipse cx="${nx}" cy="${ny + nry - 2}" rx="5.5" ry="7" fill="${tint('#EDE3C8', 0.3)}" stroke="${shade('#EDE3C8', 0.3)}" stroke-width="1.2"/>` +
        `<ellipse cx="${nx}" cy="${ny}" rx="${nrx}" ry="${nry}" fill="url(#${id}-nit)" stroke="${shade('#EDE3C8', 0.4)}" stroke-width="1.8"/>` +
        `<ellipse cx="${nx}" cy="${ny - nry + 2}" rx="${nrx - 2}" ry="3" fill="${shade('#EDE3C8', 0.15)}" stroke="${shade('#EDE3C8', 0.4)}" stroke-width="1.2"/></g>`,
      `<path d="${legs}${K.mirrorX(legs)}" fill="none" stroke="${outline(legC)}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="${legs}${K.mirrorX(legs)}" fill="none" stroke="${legC}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="${claws}${K.mirrorX(claws)}" fill="none" stroke="${outline(legC)}" stroke-width="2.5" stroke-linecap="round"/>`,
      `<path d="${antenna}${K.mirrorX(antenna)}" fill="none" stroke="${outline(base)}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="${abdomen}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="${STROKE}"/>`,
      `<path d="${segments}" fill="none" stroke="${shade(base, 0.25)}" stroke-width="1.5" opacity="0.7"/>`,
      `<ellipse cx="${ax}" cy="${ay - 6}" rx="12" ry="26" fill="#8A3B2E" opacity="0.55"/>`,
      ...[124, 140, 156, 172, 188].flatMap(y => { const x = ax - arx * Math.sqrt(1 - ((y - ay) / ary) ** 2) + 9; return [x, 256 - x].map(sx => `<circle cx="${n(sx)}" cy="${y}" r="2.2" fill="${shade(base, 0.45)}"/>`); }),
      `<ellipse cx="${tx}" cy="${ty}" rx="${trx}" ry="${try_}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="2.5"/>`,
      `<ellipse cx="${hx}" cy="${hy}" rx="${hrx}" ry="${hry}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="2.5"/>`,
      // Small eyes on the sides of the head, behind the antennae.
      ...[hx - hrx + 1, hx + hrx - 1].map(x => `<circle cx="${x}" cy="${hy + 3}" r="2.5" fill="${shade(base, 0.6)}"/>`),
    ],
  };
}

function tick(id) {
  const body = C.tick, dark = C.scutum, T = K.TICK, [bx, by, rx, ry] = T.body;
  const legs = T.legs.map(pts => 'M' + pts.map(p => p.join(' ')).join('L')).join('');
  const joints = T.legs.flatMap(pts => pts.slice(1, -1)).flatMap(([x, y]) => [x, 256 - x].map(sx => `<circle cx="${sx}" cy="${y}" r="3.5" fill="${tint(dark, 0.2)}"/>`));
  return {
    defs: [K.sphereGradient(`${id}-body`, body, { light: 0.45 }), K.sphereGradient(`${id}-scutum`, dark, { light: 0.35 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${legs}${K.mirrorX(legs)}" fill="none" stroke="${outline(dark)}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="${legs}${K.mirrorX(legs)}" fill="none" stroke="${tint(dark, 0.15)}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
      ...joints,
      // Mouthparts: two palps either side of the barbed hypostome, on the basis capituli.
      ...[119, 137].map(x => `<ellipse cx="${x}" cy="50" rx="5" ry="13" fill="url(#${id}-scutum)" stroke="${outline(dark)}" stroke-width="1.5"/>`),
      `<ellipse cx="128" cy="46" rx="3" ry="13" fill="${tint(dark, 0.35)}" stroke="${outline(dark)}" stroke-width="1.2"/>`,
      `<rect x="113" y="60" width="30" height="18" rx="5" fill="url(#${id}-scutum)" stroke="${outline(dark)}" stroke-width="2"/>`,
      `<ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}" fill="url(#${id}-body)" stroke="${outline(body)}" stroke-width="${STROKE}"/>`,
      `<ellipse cx="${bx}" cy="${by + 4}" rx="${rx - 9}" ry="${ry - 10}" fill="none" stroke="${shade(body, 0.2)}" stroke-width="1.5" opacity="0.7"/>`,
      `<path d="${T.scutum}" fill="url(#${id}-scutum)" stroke="${outline(dark)}" stroke-width="2"/>`,
      K.gloss(`${id}-gloss`, 112, 98, 10, 5),
      K.gloss(`${id}-gloss`, 104, 170, 9, 16, 15),
    ],
  };
}

function schistosoma(id) {
  const m = C.worm, f = C.schistosomeFemale, egg = C.schistosomeEgg, S = K.SCHISTOSOMA;
  // The male's near fold covers one side of the female along his gynaecophoric canal.
  const line = K.densify(S.female, 12), N = line.length, [c0, c1] = S.canal.map(t => Math.round(t * (N - 1)));
  const fold = [];
  for (let i = c0; i <= c1; i += 4) {
    const [p, q] = [line[Math.max(0, i - 1)], line[Math.min(N - 1, i + 1)]], l = Math.hypot(q[0] - p[0], q[1] - p[1]);
    fold.push([line[i][0] - (q[1] - p[1]) / l * 5, line[i][1] + (q[0] - p[0]) / l * 5]);
  }
  const [ex, ey, erx, ery, ea] = S.egg, [ox, oy, orx, ory, oa] = S.oralSucker, [vx, vy, vr] = S.ventralSucker;
  const cilia = Array.from({ length: 14 }, (_, k) => {
    const a = k / 14 * 2 * Math.PI, [x, y] = [(erx - 9) * Math.cos(a), (ery - 6) * Math.sin(a)];
    return `M${n(x)} ${n(y)}L${n(x * 1.12)} ${n(y * 1.2)}`;
  }).join('');
  return {
    defs: [K.sphereGradient(`${id}-male`, m, { light: 0.6, dark: 0.12 }), K.sphereGradient(`${id}-female`, f, { light: 0.4 }), K.sphereGradient(`${id}-egg`, egg, { light: 0.5 })],
    body: [
      `<circle cx="${vx}" cy="${vy}" r="${vr}" fill="${shade(m, 0.08)}" stroke="${outline(m)}" stroke-width="2"/>`,
      `<path d="${K.wormOutline(S.male, S.maleWidth)}" fill="url(#${id}-male)" stroke="${outline(m)}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="${K.wormOutline(S.female, S.femaleWidth)}" fill="url(#${id}-female)" stroke="${outline(f)}" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="${K.wormOutline(fold, t => 9 * Math.min(1, t / 0.06, (1 - t) / 0.06))}" fill="${m}" stroke="${shade(m, 0.3)}" stroke-width="1.5" stroke-linejoin="round"/>`,
      `<ellipse cx="${ox}" cy="${oy}" rx="${orx}" ry="${ory}" transform="rotate(${oa} ${ox} ${oy})" fill="${shade(m, 0.3)}" stroke="${outline(m)}" stroke-width="1.2"/>`,
      `<g transform="translate(${ex} ${ey}) rotate(${ea})">`,
      `<path d="M4 ${ery - 3}L16 ${ery - 3}L28 ${ery + 13}Z" fill="${shade(egg, 0.15)}" stroke="${shade(egg, 0.45)}" stroke-width="1.8" stroke-linejoin="round"/>`,
      `<ellipse rx="${erx}" ry="${ery}" fill="url(#${id}-egg)" stroke="${shade(egg, 0.45)}" stroke-width="2"/>`,
      `<ellipse rx="${erx - 9}" ry="${ery - 6}" fill="${tint(egg, 0.45)}" stroke="${shade(egg, 0.3)}" stroke-width="1.5"/>`,
      `<path d="${cilia}" stroke="${shade(egg, 0.3)}" stroke-width="1.2" stroke-linecap="round"/>`,
      `</g>`,
    ],
  };
}

function trypanosoma(id) {
  const base = C.trypanosome, rbc = C.erythrocyte, T = K.TRYPANOSOMA, { at, N, outline: body, flagellum } = K.trypanosomeParts();
  const k0 = Math.round(T.kinetoplast * (N - 1));
  // The undulating membrane: between the body's convex edge and the flagellum.
  const edge = [];
  for (let i = k0; i < N; i++) { const p = at(i), d = T.width(i / (N - 1)) / 2 - 1; edge.push([p.x + p.nx * d, p.y + p.ny * d]); }
  const fin = [...flagellum.slice(0, N - k0), ...edge.reverse()];
  const nuc = at(Math.round(T.nucleus * (N - 1))), kin = at(k0 + 2);
  const deg = p => n(Math.atan2(p.ty, p.tx) * 180 / Math.PI);
  const redCell = ([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}-rbc)" stroke="${outline(rbc)}" stroke-width="2.5"/>` +
    `<circle cx="${x}" cy="${y}" r="${n(r * 0.5)}" fill="url(#${id}-pallor)"/>`;
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5 }), K.sphereGradient(`${id}-nucleus`, C.nucleus, { light: 0.45 }),
      K.sphereGradient(`${id}-rbc`, rbc, { light: 0.45 }), K.glossGradient(`${id}-gloss`),
      `<linearGradient id="${id}-pallor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(rbc, 0.2)}"/><stop offset="1" stop-color="${tint(rbc, 0.3)}"/></linearGradient>`],
    body: [
      ...T.redCells.map(redCell),
      `<path d="M${fin.map(p => p.map(n).join(' ')).join('L')}Z" fill="${tint(base, 0.5)}" opacity="0.85"/>`,
      `<path d="${body}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<ellipse cx="${n(nuc.x)}" cy="${n(nuc.y)}" rx="10" ry="6.5" transform="rotate(${deg(nuc)} ${n(nuc.x)} ${n(nuc.y)})" fill="url(#${id}-nucleus)" stroke="${outline(C.nucleus)}" stroke-width="1.5"/>`,
      `<circle cx="${n(kin.x + kin.nx * 3)}" cy="${n(kin.y + kin.ny * 3)}" r="3.5" fill="${C.kinetoplast}"/>`,
      `<path d="${K.smoothOpenPath(flagellum)}" fill="none" stroke="${shade(base, 0.45)}" stroke-width="2.5" stroke-linecap="round"/>`,
      K.gloss(`${id}-gloss`, 100, 100, 18, 4, -14),
    ],
  };
}

function leishmania(id) {
  const L = K.LEISHMANIA, [mx, my, R] = L.macrophage, cell = C.macrophage, am = C.amastigote, S = L.sandfly, sf = C.sandfly;
  const pods = [[0.4, 16, 0.25], [1.9, 14, 0.22], [3.3, 18, 0.25], [4.6, 12, 0.2]];
  const membrane = K.polarPoints(mx, my, a => R - 8 + 2.5 * Math.sin(7 * a) + pods.reduce((s, [c, h, w]) => s + h * Math.exp(-(K.wrapAngle(a - c) ** 2) / (2 * w * w)), 0), 110);
  const kidney = K.polarPoints(0, 0, a => 24 - 9 * Math.exp(-(K.wrapAngle(a - 0.3) ** 2) / (2 * 0.32 ** 2)), 60).map(([x, y]) => [L.nucleus[0] + 1.1 * x, L.nucleus[1] + y]);
  // Amastigotes, each in its vacuole: an oval body with a nucleus and a rod-shaped kinetoplast.
  const amastigote = ([x, y], k) => `<circle cx="${n(x)}" cy="${n(y)}" r="12.5" fill="${tint(cell, 0.6)}" stroke="${shade(cell, 0.2)}" stroke-width="1.2"/>` +
    `<g transform="translate(${n(x)} ${n(y)}) rotate(${(k * 47) % 180 - 90})"><ellipse rx="9" ry="6.5" fill="url(#${id}-am)" stroke="${outline(am)}" stroke-width="1.2"/>` +
    `<circle cx="-3" r="3" fill="${C.nucleus}"/><rect x="3.2" y="-2.6" width="2.4" height="5.2" rx="1.1" fill="${C.kinetoplast}"/></g>`;
  const [ax, ay, as] = S.at, [tx, ty, trx, try_] = S.thorax, [hx, hy, hr] = S.head, [bx, by, brx, bry, ba] = S.abdomen;
  const legs = S.legs.map(p => `M${p.map(q => q.join(' ')).join('L')}`).join('');
  const hairs = Array.from({ length: 9 }, (_, i) => { const x = bx - 16 + i * 4; return `M${x} ${by + 6}l1 4`; }).join('');
  return {
    defs: [K.sphereGradient(`${id}-cell`, cell, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-nucleus`, C.nucleus, { light: 0.45 }), K.sphereGradient(`${id}-am`, am, { light: 0.5 }),
      K.sphereGradient(`${id}-fly`, sf, { light: 0.45 }),
      `<linearGradient id="${id}-wing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.8"/><stop offset="1" stop-color="${C.wing}" stop-opacity="0.5"/></linearGradient>`],
    body: [
      `<path d="${K.smoothClosedPath(membrane)}" fill="url(#${id}-cell)" stroke="${shade(cell, 0.32)}" stroke-width="${STROKE}"/>`,
      `<path d="${K.smoothClosedPath(kidney)}" fill="url(#${id}-nucleus)" stroke="${outline(C.nucleus)}" stroke-width="2.5"/>`,
      ...L.amastigotes.map(amastigote),
      // Sandfly, with its hairy wings raised over its back.
      `<g transform="translate(${ax} ${ay}) scale(${as})">`,
      `<path d="${legs}" fill="none" stroke="${shade(sf, 0.3)}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
      ...S.wings.map(([x, y, rx, ry, a]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${x} ${y})" fill="url(#${id}-wing)" stroke="${shade(C.wing, 0.4)}" stroke-width="1.5" stroke-dasharray="2 2"/>`),
      `<ellipse cx="${bx}" cy="${by}" rx="${brx}" ry="${bry}" transform="rotate(${ba} ${bx} ${by})" fill="url(#${id}-fly)" stroke="${outline(sf)}" stroke-width="2"/>`,
      `<path d="${hairs}" transform="rotate(${ba} ${bx} ${by})" stroke="${shade(sf, 0.3)}" stroke-width="1" stroke-linecap="round"/>`,
      `<ellipse cx="${tx}" cy="${ty}" rx="${trx}" ry="${try_}" fill="url(#${id}-fly)" stroke="${outline(sf)}" stroke-width="2.2"/>`,
      `<path d="${S.proboscis}${S.palps}" fill="none" stroke="${shade(sf, 0.35)}" stroke-width="2.2" stroke-linecap="round"/>`,
      `<path d="${S.antenna}" fill="none" stroke="${shade(sf, 0.35)}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="3 1.5"/>`,
      `<circle cx="${hx}" cy="${hy}" r="${hr}" fill="url(#${id}-fly)" stroke="${outline(sf)}" stroke-width="2"/>`,
      `<circle cx="${hx - 2}" cy="${hy - 1}" r="4" fill="${shade(sf, 0.6)}"/>`,
      `</g>`,
    ],
  };
}

// ------------------------------------------------------------ immune cells

// A small stroked antibody (Y) with its stem base at (x, y), pointing up before rotation.
function miniAntibody(x, y, rot, s = 1) {
  const H = C.heavyChain, L = C.lightChain;
  const heavy = 'M0 6L0 -10M0 -10L-9 -20M0 -10L9 -20', light = 'M-7 -8L-14 -16M7 -8L14 -16';
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(rot)}) scale(${s})" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="${light}" stroke="${outline(L)}" stroke-width="5"/><path d="${light}" stroke="${L}" stroke-width="2.8"/>` +
    `<path d="${heavy}" stroke="${outline(H)}" stroke-width="6"/><path d="${heavy}" stroke="${H}" stroke-width="3.5"/></g>`;
}

function neutrophil(id) {
  const base = C.neutrophil, nuc = C.nucleus;
  const membrane = K.polarPoints(128, 128, a => 94 + 3 * Math.sin(5 * a + 0.4) + 2 * Math.sin(9 * a + 1.3));
  const lobes = [[92, 118, 27, 21, -25], [128, 90, 26, 20, 10], [168, 112, 25, 21, 45], [154, 158, 27, 20, -15]];
  const rand = K.rng(11), granules = [];
  for (let tries = 0; granules.length < 70 && tries < 5000; tries++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 82;
    const x = 128 + d * Math.cos(a), y = 128 + d * Math.sin(a);
    if (lobes.every(([lx, ly]) => Math.hypot(x - lx, y - ly) > 32) &&
      granules.every(([gx, gy]) => Math.hypot(x - gx, y - gy) > 7)) granules.push([x, y]);
  }
  const strand = K.smoothOpenPath(lobes.map(([x, y]) => [x, y]));
  const lobe = ([x, y, rx, ry, rot], attrs) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" ${attrs}/>`;
  const chromatin = lobes.flatMap(([x, y]) => [0, 1].map(() =>
    `<ellipse cx="${n(x + (rand() - 0.5) * 22)}" cy="${n(y + (rand() - 0.5) * 16)}" rx="6" ry="4" fill="${shade(nuc, 0.3)}" opacity="0.35"/>`));
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.08 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${K.smoothClosedPath(membrane)}" fill="url(#${id}-body)" stroke="${shade(base, 0.3)}" stroke-width="${STROKE}"/>`,
      ...granules.map(([x, y], i) => `<circle cx="${n(x)}" cy="${n(y)}" r="2.4" fill="${i % 2 ? mix(nuc, base, 0.45) : shade(base, 0.2)}" opacity="0.85"/>`),
      // Outline layer first, then fills, so lobes and strands join seamlessly.
      `<path d="${strand}" fill="none" stroke="${outline(nuc)}" stroke-width="14" stroke-linecap="round"/>`,
      ...lobes.map(l => lobe(l, `fill="${outline(nuc)}" stroke="${outline(nuc)}" stroke-width="5"`)),
      `<path d="${strand}" fill="none" stroke="${nuc}" stroke-width="9" stroke-linecap="round"/>`,
      ...lobes.map(l => lobe(l, `fill="url(#${id}-nucleus)"`)),
      ...chromatin,
      K.gloss(`${id}-gloss`, 76, 70, 24, 11),
    ],
  };
}

function macrophage(id) {
  const base = C.macrophage, nuc = C.nucleus;
  const pods = [[0.3, 34, 0.22], [1.5, 40, 0.2], [2.6, 30, 0.25], [3.7, 38, 0.2], [5.0, 32, 0.22]];
  const membrane = K.polarPoints(128, 130, a => 72 + 3 * Math.sin(7 * a) +
    pods.reduce((sum, [c, h, w]) => sum + h * Math.exp(-(K.wrapAngle(a - c) ** 2) / (2 * w * w)), 0), 96);
  const kidney = K.polarPoints(0, 0, a => 30 - 11 * Math.exp(-(K.wrapAngle(a + 0.9) ** 2) / (2 * 0.32 ** 2)), 60)
    .map(([x, y]) => [100 + 1.2 * x, 136 + y]);
  const lysosomes = [[130, 96], [90, 100], [186, 150], [110, 186], [82, 168], [124, 166], [170, 88]];
  const phagosome = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${tint(base, 0.78)}" stroke="${shade(base, 0.22)}" stroke-width="1.5"/>`;
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${K.smoothClosedPath(membrane)}" fill="url(#${id}-body)" stroke="${shade(base, 0.32)}" stroke-width="${STROKE}"/>`,
      `<path d="${K.smoothClosedPath(kidney)}" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2.5"/>`,
      phagosome(164, 112, 21),
      `<rect x="-11" y="-5" width="22" height="10" rx="5" transform="translate(164 112) rotate(30)" fill="${C.gramNegative}" stroke="${outline(C.gramNegative)}" stroke-width="1.5"/>`,
      phagosome(150, 170, 15),
      ...[[145, 171], [155, 167]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${C.gramPositive}" stroke="${outline(C.gramPositive)}" stroke-width="1.2"/>`),
      ...lysosomes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${shade(base, 0.35)}" opacity="0.8"/>`),
      K.gloss(`${id}-gloss`, 92, 84, 22, 11),
    ],
  };
}

function tCell(id) {
  const base = C.lymphocyte, nuc = C.nucleus, R = 76, cx = 128, cy = 128;
  const receptors = [];
  for (let i = 0; i < 14; i++) {
    receptors.push(`<g transform="rotate(${n(i * 360 / 14 + 12)} ${cx} ${cy})">` +
      `<rect x="${cx - 7}" y="${cy - R - 15}" width="6" height="19" rx="3" fill="${C.receptorA}" stroke="${outline(C.receptorA)}" stroke-width="1.2"/>` +
      `<rect x="${cx + 1}" y="${cy - R - 15}" width="6" height="19" rx="3" fill="${C.receptorB}" stroke="${outline(C.receptorB)}" stroke-width="1.2"/></g>`);
  }
  const membrane = K.polarPoints(cx, cy, a => R + 1.5 * Math.sin(6 * a));
  const nucleus = K.polarPoints(cx - 6, cy - 6, a => 56 + 2 * Math.sin(4 * a + 1));
  const rand = K.rng(5);
  const chromatin = Array.from({ length: 10 }, () => {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 42;
    return `<ellipse cx="${n(cx - 6 + d * Math.cos(a))}" cy="${n(cy - 6 + d * Math.sin(a))}" rx="${n(5 + rand() * 4)}" ry="${n(4 + rand() * 3)}" fill="${shade(nuc, 0.3)}" opacity="0.3"/>`;
  });
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      ...receptors,
      `<path d="${K.smoothClosedPath(membrane)}" fill="url(#${id}-body)" stroke="${shade(base, 0.32)}" stroke-width="${STROKE}"/>`,
      `<path d="${K.smoothClosedPath(nucleus)}" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2.5"/>`,
      ...chromatin,
      K.gloss(`${id}-gloss`, 98, 92, 22, 11),
    ],
  };
}

function bCell(id) {
  const base = C.bLymphocyte, nuc = C.nucleus, R = 74, cx = 128, cy = 128;
  const receptors = Array.from({ length: 12 }, (_, i) =>
    `<g transform="rotate(${i * 30 + 8} ${cx} ${cy})">${miniAntibody(cx, cy - R - 4, 0)}</g>`);
  const rand = K.rng(9);
  const chromatin = Array.from({ length: 10 }, () => {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 42;
    return `<ellipse cx="${n(cx - 5 + d * Math.cos(a))}" cy="${n(cy - 4 + d * Math.sin(a))}" rx="${n(5 + rand() * 4)}" ry="${n(4 + rand() * 3)}" fill="${shade(nuc, 0.3)}" opacity="0.3"/>`;
  });
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      ...receptors,
      `<path d="${K.smoothClosedPath(K.polarPoints(cx, cy, a => R + 1.5 * Math.sin(5 * a + 0.7)))}" fill="url(#${id}-body)" stroke="${shade(base, 0.32)}" stroke-width="${STROKE}"/>`,
      `<path d="${K.smoothClosedPath(K.polarPoints(cx - 5, cy - 4, a => 55 + 2 * Math.sin(3 * a + 0.3)))}" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2.5"/>`,
      ...chromatin,
      K.gloss(`${id}-gloss`, 98, 92, 22, 11),
    ],
  };
}

function plasmaCell(id) {
  const base = C.plasmaCell, nuc = C.nucleus, cx = 116, cy = 140, nx = 80, ny = 144;
  // Rough ER: concentric arcs around the nucleus on the far side of the cell, studded with ribosomes.
  const er = [58, 68, 78].map(r => {
    const pts = Array.from({ length: 13 }, (_, i) => { const a = (-55 + i * 9.5) * Math.PI / 180; return [nx + r * Math.cos(a), ny + r * Math.sin(a)]; });
    return `<path d="${K.smoothOpenPath(pts)}" fill="none" stroke="${shade(base, 0.28)}" stroke-width="2" stroke-linecap="round" opacity="0.75"/>` +
      pts.filter((_, i) => i % 2).map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="1.7" fill="${shade(base, 0.45)}"/>`).join('');
  });
  const clockFace = Array.from({ length: 8 }, (_, k) => {
    const a = k * 45, x = nx + 22 * Math.cos(a * Math.PI / 180), y = ny + 22 * Math.sin(a * Math.PI / 180);
    return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="7" ry="4.5" transform="rotate(${a} ${n(x)} ${n(y)})" fill="${shade(nuc, 0.35)}" opacity="0.55"/>`;
  });
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<ellipse cx="${cx}" cy="${cy}" rx="90" ry="68" transform="rotate(-12 ${cx} ${cy})" fill="url(#${id}-body)" stroke="${shade(base, 0.32)}" stroke-width="${STROKE}"/>`,
      ...er,
      `<ellipse cx="114" cy="140" rx="20" ry="28" fill="${tint(base, 0.6)}"/>`,
      `<circle cx="${nx}" cy="${ny}" r="34" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2.5"/>`,
      ...clockFace,
      `<circle cx="${nx}" cy="${ny}" r="6" fill="${shade(nuc, 0.35)}" opacity="0.55"/>`,
      K.gloss(`${id}-gloss`, 78, 96, 24, 11),
      miniAntibody(196, 58, 25, 1.1), miniAntibody(222, 104, 60, 0.95), miniAntibody(160, 36, 5, 0.95),
    ],
  };
}

function dendriticCell(id) {
  const base = C.dendritic, nuc = C.nucleus;
  const arms = [[-1.9, 54, 0.12], [-0.9, 58, 0.11], [0.15, 52, 0.13], [1.0, 46, 0.12], [1.85, 56, 0.11], [2.75, 50, 0.13], [3.7, 42, 0.12]];
  const membrane = K.polarPoints(128, 128, a => 46 + 3 * Math.sin(5 * a) +
    arms.reduce((sum, [c, h, w]) => sum + h * Math.exp(-(K.wrapAngle(a - c) ** 2) / (2 * w * w)), 0), 180);
  const vesicles = [[150, 110], [148, 150], [104, 152], [100, 112], [132, 162]];
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.12 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${K.smoothClosedPath(membrane)}" fill="url(#${id}-body)" stroke="${shade(base, 0.35)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      ...vesicles.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${tint(base, 0.6)}" stroke="${shade(base, 0.25)}" stroke-width="1.2"/>`),
      `<path d="${K.smoothClosedPath(K.polarPoints(124, 132, a => 25 + 4 * Math.sin(3 * a + 1) + 2 * Math.sin(5 * a)))}" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2.5"/>`,
      K.gloss(`${id}-gloss`, 108, 106, 14, 7),
    ],
  };
}

function nkCell(id) {
  const base = C.nkCell, nuc = C.nucleus, gr = C.cytotoxicGranule, cx = 128, cy = 128;
  const kidney = K.polarPoints(0, 0, a => 34 - 9 * Math.exp(-(K.wrapAngle(a - 0.6) ** 2) / (2 * 0.32 ** 2)), 60)
    .map(([x, y]) => [cx - 20 + 1.15 * x, cy + 4 + y]);
  // Cytotoxic granules polarised towards one side of the cell.
  const granules = [[164, 92], [178, 104], [160, 110], [174, 122], [182, 92], [150, 96], [166, 128], [188, 114], [154, 124], [170, 80], [192, 128]];
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }),
      K.sphereGradient(`${id}-granule`, gr), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${K.smoothClosedPath(K.polarPoints(cx, cy, a => 76 + 2 * Math.sin(6 * a + 0.2) + 1.5 * Math.sin(9 * a)))}" fill="url(#${id}-body)" stroke="${shade(base, 0.32)}" stroke-width="${STROKE}"/>`,
      `<path d="${K.smoothClosedPath(kidney)}" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2.5"/>`,
      ...granules.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.5" fill="url(#${id}-granule)" stroke="${outline(gr)}" stroke-width="1.2"/>`),
      K.gloss(`${id}-gloss`, 92, 86, 20, 10),
    ],
  };
}

function monocyte(id) {
  const base = C.monocyte, nuc = C.nucleus;
  // Horseshoe nucleus: a kidney with a deep indent.
  const nucleus = K.polarPoints(0, 0, a => 40 - 18 * Math.exp(-(K.wrapAngle(a + 1.2) ** 2) / (2 * 0.4 ** 2)), 72)
    .map(([x, y]) => [120 + 1.15 * x, 136 + y]);
  const rand = K.rng(17), dots = [];
  for (let tries = 0; dots.length < 40 && tries < 5000; tries++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 74, p = [128 + d * Math.cos(a), 128 + d * Math.sin(a)];
    if (Math.hypot((p[0] - 120) / 1.15, p[1] - 136) > 44 && dots.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 8)) dots.push(p);
  }
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${K.smoothClosedPath(K.polarPoints(128, 128, a => 84 + 3 * Math.sin(5 * a + 1) + 2 * Math.sin(8 * a)))}" fill="url(#${id}-body)" stroke="${shade(base, 0.32)}" stroke-width="${STROKE}"/>`,
      ...dots.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="1.7" fill="${shade(base, 0.3)}" opacity="0.6"/>`),
      ...[[176, 96, 7], [184, 150, 5], [92, 70, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${tint(base, 0.7)}" stroke="${shade(base, 0.25)}" stroke-width="1.2"/>`),
      `<path d="${K.smoothClosedPath(nucleus)}" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2.5"/>`,
      K.gloss(`${id}-gloss`, 82, 82, 22, 11),
    ],
  };
}

function eosinophil(id) {
  const base = C.eosinophil, nuc = C.nucleus, gr = C.eosinGranule;
  const lobes = [[98, 118, 27, 22, -20], [158, 118, 27, 22, 20]];
  const rand = K.rng(23), granules = [];
  for (let tries = 0; granules.length < 85 && tries < 8000; tries++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 78, p = [128 + d * Math.cos(a), 128 + d * Math.sin(a)];
    if (lobes.every(([x, y]) => Math.hypot(p[0] - x, p[1] - y) > 30) && Math.hypot(p[0] - 128, p[1] - 110) > 12 &&
      granules.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 9)) granules.push(p);
  }
  const lobe = ([x, y, rx, ry, rot], attrs) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" ${attrs}/>`;
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.08 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }),
      K.sphereGradient(`${id}-granule`, gr, { light: 0.5 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${K.smoothClosedPath(K.polarPoints(128, 128, a => 90 + 3 * Math.sin(6 * a + 0.5)))}" fill="url(#${id}-body)" stroke="${shade(base, 0.32)}" stroke-width="${STROKE}"/>`,
      ...granules.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="4.2" fill="url(#${id}-granule)"/>`),
      `<path d="M98 118Q128 102 158 118" fill="none" stroke="${outline(nuc)}" stroke-width="13" stroke-linecap="round"/>`,
      ...lobes.map(l => lobe(l, `fill="${outline(nuc)}" stroke="${outline(nuc)}" stroke-width="5"`)),
      `<path d="M98 118Q128 102 158 118" fill="none" stroke="${nuc}" stroke-width="8" stroke-linecap="round"/>`,
      ...lobes.map(l => lobe(l, `fill="url(#${id}-nucleus)"`)),
      K.gloss(`${id}-gloss`, 76, 72, 22, 10),
    ],
  };
}

function platelets(id) {
  const base = C.platelet;
  const granules = (x, y, rot, rx, ry) => [[-0.4, -0.2], [0.1, -0.35], [0.35, 0.1], [-0.15, 0.3], [0.05, 0.02]].map(([u, v]) => {
    const r = rot * Math.PI / 180, px = u * rx, py = v * ry;
    return `<circle cx="${n(x + px * Math.cos(r) - py * Math.sin(r))}" cy="${n(y + px * Math.sin(r) + py * Math.cos(r))}" r="3.2" fill="${shade(base, 0.45)}"/>`;
  }).join('');
  const disc = (x, y, rx, ry, rot) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="2.5"/>` +
    granules(x, y, rot, rx, ry);
  // Activated platelet: spiky pseudopods, granules gathered in the centre.
  const spikes = [[0.2, 26, 0.12], [1.2, 30, 0.1], [2.1, 22, 0.13], [3.0, 28, 0.11], [4.0, 24, 0.12], [5.1, 30, 0.1]];
  const activated = K.polarPoints(170, 168, a => 30 + spikes.reduce((s, [c, h, w]) => s + h * Math.exp(-(K.wrapAngle(a - c) ** 2) / (2 * w * w)), 0), 120);
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5 })],
    body: [
      disc(78, 88, 36, 23, -15), disc(176, 76, 30, 20, 20), disc(86, 180, 30, 19, 10),
      `<path d="${K.smoothClosedPath(activated)}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="2.5" stroke-linejoin="round"/>`,
      ...[[166, 164], [174, 170], [168, 174], [176, 162]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${shade(base, 0.45)}"/>`),
    ],
  };
}

function cd8Killing(id) {
  const t = C.lymphocyte, target = C.targetCell, nuc = C.nucleus, gr = C.cytotoxicGranule, virus = C.spike;
  const blebs = [[-0.7, 9], [-0.1, 10], [0.55, 8], [1.1, 7]].map(([a, r]) =>
    `<circle cx="${n(180 + 68 * Math.cos(a))}" cy="${n(130 + 68 * Math.sin(a))}" r="${r}" fill="url(#${id}-target)" stroke="${shade(target, 0.35)}" stroke-width="2"/>`);
  return {
    defs: [K.sphereGradient(`${id}-t`, t, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-target`, target, { light: 0.5, dark: 0.1 }),
      K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }), K.sphereGradient(`${id}-granule`, gr), K.sphereGradient(`${id}-virus`, virus)],
    body: [
      // Target cell (dying: blebbing membrane, condensed nucleus) under the T cell at the synapse.
      ...blebs,
      `<path d="${K.smoothClosedPath(K.polarPoints(180, 130, a => 66 + 2 * Math.sin(5 * a)))}" fill="url(#${id}-target)" stroke="${shade(target, 0.35)}" stroke-width="${STROKE}"/>`,
      `<circle cx="196" cy="134" r="20" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2"/>`,
      ...[[214, 156], [178, 160]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="url(#${id}-nucleus)"/>`),
      ...[[170, 96], [212, 104], [158, 166], [200, 182]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="url(#${id}-virus)" stroke="${outline(virus)}" stroke-width="1.5" stroke-dasharray="2 1.5"/>`),
      ...[[138, 118], [142, 132], [138, 146]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="url(#${id}-granule)" stroke="${outline(gr)}" stroke-width="1"/>`),
      `<path d="${K.smoothClosedPath(K.polarPoints(80, 132, a => 52 + 1.5 * Math.sin(6 * a)))}" fill="url(#${id}-t)" stroke="${shade(t, 0.32)}" stroke-width="${STROKE}"/>`,
      `<circle cx="70" cy="130" r="35" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2.5"/>`,
      ...[[114, 112], [120, 126], [116, 140], [122, 152], [110, 124], [110, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="url(#${id}-granule)" stroke="${outline(gr)}" stroke-width="1.2"/>`),
    ],
  };
}

function mastCell(id) {
  const base = C.mastCell, gr = C.mastGranule, cx = 116, cy = 132, R = 78;
  const rand = K.rng(51), inside = [], released = [];
  for (let tries = 0; inside.length < 70 && tries < 8000; tries++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 66, p = [cx + d * Math.cos(a), cy + d * Math.sin(a)];
    if (Math.hypot(p[0] - 100, p[1] - 136) > 30 && inside.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 9)) inside.push(p);
  }
  for (let tries = 0; released.length < 14 && tries < 8000; tries++) {
    const p = [196 + rand() * 42, 74 + rand() * 116];
    if (Math.hypot(p[0] - cx, p[1] - cy) > R + 10 && released.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 11)) released.push(p);
  }
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-nucleus`, C.nucleus, { light: 0.45 }),
      K.sphereGradient(`${id}-granule`, gr, { light: 0.45 })],
    body: [
      ...[200, 240, 280, 320].map(deg => `<g transform="rotate(${deg} ${cx} ${cy})">${miniAntibody(cx, cy - R - 3, 0)}</g>`),
      `<path d="${K.smoothClosedPath(K.polarPoints(cx, cy, a => R + 2 * Math.sin(5 * a + 1) + 1.5 * Math.sin(9 * a)))}" fill="url(#${id}-body)" stroke="${shade(base, 0.32)}" stroke-width="${STROKE}"/>`,
      `<circle cx="100" cy="136" r="24" fill="url(#${id}-nucleus)" stroke="${outline(C.nucleus)}" stroke-width="2"/>`,
      ...inside.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="4.2" fill="url(#${id}-granule)"/>`),
      ...released.map(([x, y], i) => `<circle cx="${n(x)}" cy="${n(y)}" r="4.2" fill="url(#${id}-granule)" opacity="${n(1 - (x - 196) / 70)}"/>`),
    ],
  };
}

function nets(id) {
  const base = C.neutrophil, dna = C.nucleus;
  const rand = K.rng(41), strands = [];
  for (let s = 0; s < 10; s++) {
    let a = -1.2 + s * 0.27 + (rand() - 0.5) * 0.2;
    const pts = [[70 + 46 * Math.cos(a), 128 + 46 * Math.sin(a)]];
    for (let k = 0; k < 12; k++) {
      a += (rand() - 0.5) * 0.9;
      const [px, py] = pts[pts.length - 1], q = [px + 14 * Math.cos(a), py + 14 * Math.sin(a)];
      if (q[0] > 236 || q[1] < 22 || q[1] > 234) break;
      pts.push(q);
    }
    strands.push(pts);
  }
  const all = strands.flatMap((pts, s) => pts.map(p => [...p, s]));
  const links = [];
  for (let i = 0; i < all.length && links.length < 14; i += 3) {
    const j = all.findIndex(q => q[2] !== all[i][2] && Math.hypot(q[0] - all[i][0], q[1] - all[i][1]) < 26 && q[0] > 110);
    if (j >= 0) links.push(`M${n(all[i][0])} ${n(all[i][1])}L${n(all[j][0])} ${n(all[j][1])}`);
  }
  const caught = [[strands[1], 6, 'rod', 30], [strands[4], 8, 'coccus'], [strands[6], 5, 'rod', -40], [strands[8], 9, 'coccus'], [strands[3], 10, 'rod', 70]]
    .filter(([pts, i]) => pts[i]).map(([pts, i, kind, a]) => {
      const [x, y] = pts[i];
      return kind === 'rod'
        ? `<rect x="-12" y="-5.5" width="24" height="11" rx="5.5" transform="translate(${n(x)} ${n(y)}) rotate(${a})" fill="url(#${id}-rod)" stroke="${outline(C.gramNegative)}" stroke-width="1.6"/>`
        : `<circle cx="${n(x - 4)}" cy="${n(y)}" r="5.5" fill="url(#${id}-coccus)" stroke="${outline(C.gramPositive)}" stroke-width="1.3"/><circle cx="${n(x + 6)}" cy="${n(y + 1)}" r="5.5" fill="url(#${id}-coccus)" stroke="${outline(C.gramPositive)}" stroke-width="1.3"/>`;
    });
  const lobes = [[56, 116, 16, 12, -20], [80, 106, 15, 11, 15], [88, 134, 15, 12, 40]];
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.08 }), K.sphereGradient(`${id}-nucleus`, dna, { light: 0.45 }),
      K.cylinderGradient(`${id}-rod`, C.gramNegative), K.sphereGradient(`${id}-coccus`, C.gramPositive)],
    body: [
      `<path d="${links.join('')}" stroke="${dna}" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>`,
      `<path d="${strands.map(K.smoothOpenPath).join('')}" fill="none" stroke="${dna}" stroke-width="2.6" stroke-linecap="round" opacity="0.8"/>`,
      ...strands.flatMap(pts => pts.filter((_, i) => i % 3 === 2).map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="2.3" fill="${tint(dna, 0.4)}"/>`)),
      ...caught,
      `<path d="${K.smoothClosedPath(K.polarPoints(70, 128, a => 50 + 2 * Math.sin(5 * a)))}" fill="url(#${id}-body)" stroke="${shade(base, 0.3)}" stroke-width="${STROKE}"/>`,
      ...lobes.map(([x, y, rx, ry, rot]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="url(#${id}-nucleus)" stroke="${outline(dna)}" stroke-width="2"/>`),
    ],
  };
}

function treg(id) {
  const base = C.treg, nuc = C.nucleus, cd25 = C.penton, ck = C.cytokine, R = 72, cx = 108, cy = 128;
  // T-cell receptors alternating with CD25, the IL-2 receptor α chain.
  const receptors = Array.from({ length: 14 }, (_, i) => `<g transform="rotate(${n(i * 360 / 14 + 12)} ${cx} ${cy})">` + (i % 2
    ? `<rect x="${cx - 3}" y="${cy - R - 11}" width="6" height="15" rx="3" fill="${shade(cd25, 0.1)}" stroke="${outline(cd25)}" stroke-width="1.2"/>` +
      `<circle cx="${cx}" cy="${cy - R - 15}" r="6" fill="url(#${id}-cd25)" stroke="${outline(cd25)}" stroke-width="1.3"/>`
    : `<rect x="${cx - 7}" y="${cy - R - 15}" width="6" height="19" rx="3" fill="${C.receptorA}" stroke="${outline(C.receptorA)}" stroke-width="1.2"/>` +
      `<rect x="${cx + 1}" y="${cy - R - 15}" width="6" height="19" rx="3" fill="${C.receptorB}" stroke="${outline(C.receptorB)}" stroke-width="1.2"/>`) + `</g>`);
  const rand = K.rng(97);
  const chromatin = Array.from({ length: 10 }, () => {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 38;
    return `<ellipse cx="${n(cx - 6 + d * Math.cos(a))}" cy="${n(cy - 6 + d * Math.sin(a))}" rx="${n(5 + rand() * 4)}" ry="${n(4 + rand() * 3)}" fill="${shade(nuc, 0.3)}" opacity="0.3"/>`;
  });
  // Suppressive cytokines (IL-10, TGF-β) released towards the right.
  const cytokines = [[212, 62, 9, 20], [228, 106, 8, -10], [218, 152, 10, 30], [200, 196, 8, 0]];
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }),
      K.sphereGradient(`${id}-cd25`, cd25), K.sphereGradient(`${id}-ck`, ck), K.glossGradient(`${id}-gloss`)],
    body: [
      ...receptors,
      `<path d="${K.smoothClosedPath(K.polarPoints(cx, cy, a => R + 1.5 * Math.sin(6 * a + 0.4)))}" fill="url(#${id}-body)" stroke="${shade(base, 0.32)}" stroke-width="${STROKE}"/>`,
      `<path d="${K.smoothClosedPath(K.polarPoints(cx - 6, cy - 6, a => 52 + 2 * Math.sin(4 * a + 1)))}" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2.5"/>`,
      ...chromatin,
      K.gloss(`${id}-gloss`, 78, 92, 20, 10),
      ...cytokines.map(([x, y, r, a]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${n(r * 0.8)}" transform="rotate(${a} ${x} ${y})" fill="url(#${id}-ck)" stroke="${outline(ck)}" stroke-width="1.5"/>`),
    ],
  };
}

function basophil(id) {
  const base = C.basophil, nuc = C.nucleus, gr = C.basophilGranule;
  const lobes = [[104, 122, 26, 20, -30], [152, 136, 26, 20, 20]], bridge = 'M104 122Q128 142 152 136';
  const lobe = ([x, y, rx, ry, rot], attrs) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" ${attrs}/>`;
  // Large dark granules scattered over the cytoplasm and over the nucleus, half hiding it.
  const rand = K.rng(121), granules = [];
  for (let tries = 0; granules.length < 34 && tries < 8000; tries++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 72, p = [128 + d * Math.cos(a), 128 + d * Math.sin(a)];
    if (granules.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 15)) granules.push([...p, 5 + rand() * 2]);
  }
  return {
    defs: [K.sphereGradient(`${id}-body`, base, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }),
      K.sphereGradient(`${id}-granule`, gr, { light: 0.35 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${K.smoothClosedPath(K.polarPoints(128, 128, a => 86 + 3 * Math.sin(6 * a + 0.8) + 1.5 * Math.sin(9 * a)))}" fill="url(#${id}-body)" stroke="${shade(base, 0.32)}" stroke-width="${STROKE}"/>`,
      `<path d="${bridge}" fill="none" stroke="${outline(nuc)}" stroke-width="13" stroke-linecap="round"/>`,
      ...lobes.map(l => lobe(l, `fill="${outline(nuc)}" stroke="${outline(nuc)}" stroke-width="5"`)),
      `<path d="${bridge}" fill="none" stroke="${nuc}" stroke-width="8" stroke-linecap="round"/>`,
      ...lobes.map(l => lobe(l, `fill="url(#${id}-nucleus)"`)),
      ...granules.map(([x, y, r]) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="url(#${id}-granule)"/>`),
      K.gloss(`${id}-gloss`, 78, 76, 22, 10),
    ],
  };
}

function immuneSynapse(id) {
  const t = C.lymphocyte, apc = C.dendritic, nuc = C.nucleus;
  const dendrites = [[-2.0, 24, 0.14], [-1.3, 20, 0.13], [-0.5, 10, 0.14], [0.5, 10, 0.13], [1.3, 22, 0.14], [2.0, 22, 0.14]];
  // T-cell receptors (left) bind peptide–MHC (right) across the gap, peptide in orange.
  const pairs = [100, 114, 128, 142, 156].map(y =>
    `<rect x="117" y="${y - 4}" width="10" height="4" rx="1.5" fill="${C.receptorA}" stroke="${outline(C.receptorA)}" stroke-width="0.8"/>` +
    `<rect x="117" y="${y}" width="10" height="4" rx="1.5" fill="${C.receptorB}" stroke="${outline(C.receptorB)}" stroke-width="0.8"/>` +
    `<rect x="127" y="${y - 4}" width="9" height="4" rx="1.5" fill="${C.mhcAlpha}" stroke="${outline(C.mhcAlpha)}" stroke-width="0.8"/>` +
    `<rect x="127" y="${y}" width="9" height="4" rx="1.5" fill="${C.mhcBeta}" stroke="${outline(C.mhcBeta)}" stroke-width="0.8"/>` +
    `<circle cx="127" cy="${y}" r="2.6" fill="${C.peptide}" stroke="${outline(C.peptide)}" stroke-width="0.8"/>`);
  return {
    defs: [K.sphereGradient(`${id}-t`, t, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-apc`, apc, { light: 0.5, dark: 0.12 }),
      K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${K.synapseCell(176, 128, 52, 136, 1, dendrites)}" fill="url(#${id}-apc)" stroke="${shade(apc, 0.35)}" stroke-width="${STROKE}"/>`,
      `<path d="${K.smoothClosedPath(K.polarPoints(184, 132, a => 20 + 3 * Math.sin(3 * a + 1) + 2 * Math.sin(5 * a)))}" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2.2"/>`,
      `<path d="${K.synapseCell(72, 128, 56, 120, -1)}" fill="url(#${id}-t)" stroke="${shade(t, 0.32)}" stroke-width="${STROKE}"/>`,
      `<circle cx="64" cy="126" r="34" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2.5"/>`,
      ...pairs,
      K.gloss(`${id}-gloss`, 50, 90, 16, 8), K.gloss(`${id}-gloss`, 168, 98, 12, 6),
    ],
  };
}

function redBloodCells(id) {
  const base = C.erythrocyte;
  const cell = (cx, cy, rx, ry, rot, colour, grad) =>
    `<g transform="translate(${cx} ${cy}) rotate(${rot})">` +
    `<ellipse rx="${rx}" ry="${ry}" fill="url(#${id}-${grad})" stroke="${outline(colour)}" stroke-width="${STROKE}"/>` +
    // Central pallor: a shallow dip, darker on the lit side.
    `<ellipse rx="${n(rx * 0.55)}" ry="${n(ry * 0.5)}" fill="url(#${id}-pallor)"/>` +
    K.gloss(`${id}-gloss`, -rx * 0.55, -ry * 0.62, rx * 0.25, ry * 0.12, -10) + `</g>`;
  return {
    defs: [
      K.sphereGradient(`${id}-front`, base), K.sphereGradient(`${id}-back`, shade(base, 0.15)), K.glossGradient(`${id}-gloss`),
      `<linearGradient id="${id}-pallor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(base, 0.22)}"/>` +
      `<stop offset="1" stop-color="${tint(base, 0.3)}"/></linearGradient>`,
    ],
    body: [cell(170, 90, 64, 42, -25, shade(base, 0.15), 'back'), cell(108, 148, 88, 60, -15, base, 'front')],
  };
}

function neutrophilDiapedesis(id) {
  const D = K.DIAPEDESIS, nb = C.neutrophil, en = C.endothelium, nuc = C.nucleus, [top, bottom] = D.endothelium, X = D.through.x;
  // A multilobed nucleus: lobes [x, y, rx, ry] joined by a strand, outline first so they merge.
  const nucleus = (lobes, strand) =>
    `<path d="${strand}" fill="none" stroke="${outline(nuc)}" stroke-width="7" stroke-linecap="round"/>` +
    lobes.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${outline(nuc)}" stroke="${outline(nuc)}" stroke-width="3"/>`).join('') +
    `<path d="${strand}" fill="none" stroke="${nuc}" stroke-width="4" stroke-linecap="round"/>` +
    lobes.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id}-nucleus)"/>`).join('');
  // Endothelial cells between the junctions, parted where the neutrophil squeezes through.
  const gap = x => x === X ? 10 : 2;
  const cells = D.junctions.slice(0, -1).map((x0, k) => {
    const x1 = D.junctions[k + 1], a = x0 === 16 ? 16 : x0 + gap(x0), b = x1 === 240 ? 240 : x1 - gap(x1), mid = (a + b) / 2;
    return { mid, d: `M${a + 8} ${top}L${mid - 18} ${top}Q${mid} ${top - 12} ${mid + 18} ${top}L${b - 8} ${top}Q${b} ${top} ${b} ${top + 8}L${b} ${bottom - 8}` +
      `Q${b} ${bottom} ${b - 8} ${bottom}L${a + 8} ${bottom}Q${a} ${bottom} ${a} ${bottom - 8}L${a} ${top + 8}Q${a} ${top} ${a + 8} ${top}Z` };
  });
  const [rx, ry, rr] = D.rolling, [cx, cy] = D.crawling;
  const dir = Math.atan2(D.bacteria[0][1] - cy, D.bacteria[0][0] - cx);
  const villi = Array.from({ length: 22 }, (_, k) => { const a = k / 22 * 2 * Math.PI; return `<circle cx="${n(rx + rr * Math.cos(a))}" cy="${n(ry + rr * Math.sin(a))}" r="3" fill="${nb}" stroke="${shade(nb, 0.3)}" stroke-width="1.5"/>`; });
  const tethers = [-12, -4, 4, 12].map(dx => `M${rx + dx} ${n(ry + Math.sqrt(rr * rr - dx * dx) - 1)}L${rx + dx * 1.3} ${top - 6}`).join('');
  const cell = d => `<path d="${d}" fill="url(#${id}-neutrophil)" stroke="${shade(nb, 0.32)}" stroke-width="2.5" stroke-linejoin="round"/>`;
  return {
    defs: [`<linearGradient id="${id}-plasma" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tint(C.plasma, 0.4)}"/><stop offset="1" stop-color="${C.plasma}"/></linearGradient>`,
      K.sphereGradient(`${id}-neutrophil`, nb, { light: 0.5, dark: 0.08 }), K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }),
      K.cylinderGradient(`${id}-endothelium`, en), K.sphereGradient(`${id}-rbc`, C.erythrocyte, { light: 0.45 }), K.cylinderGradient(`${id}-rod`, C.gramNegative)],
    body: [
      `<path d="M16 ${top + 8}L16 32Q16 18 30 18L226 18Q240 18 240 32L240 ${top + 8}Z" fill="url(#${id}-plasma)"/>`,
      ...D.redCells.map(([x, y, a, b, r]) => `<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" transform="rotate(${r} ${x} ${y})" fill="url(#${id}-rbc)" stroke="${outline(C.erythrocyte)}" stroke-width="2"/>`),
      ...[[16, 140, 186, 168, 240, 156], [16, 196, 120, 226, 240, 212]].map(([x0, y0, x1, y1, x2, y2]) =>
        `<path d="M${x0} ${y0}Q${x1} ${y1} ${x2} ${y2}" fill="none" stroke="${shade(C.dermis, 0.08)}" stroke-width="3" stroke-linecap="round" opacity="0.8"/>`),
      `<path d="M16 ${bottom + 4}L${X - 10} ${bottom + 4}M${X + 10} ${bottom + 4}L240 ${bottom + 4}" stroke="${shade(en, 0.35)}" stroke-width="2.5" stroke-linecap="round"/>`,
      ...cells.map(({ d }) => `<path d="${d}" fill="url(#${id}-endothelium)" stroke="${outline(en)}" stroke-width="2"/>`),
      ...cells.map(({ mid }) => `<ellipse cx="${mid}" cy="${top - 1}" rx="12" ry="5" fill="${tint(nuc, 0.2)}" stroke="${outline(nuc)}" stroke-width="1.2"/>`),
      // Rolling on selectins.
      `<path d="${tethers}" stroke="${shade(nb, 0.4)}" stroke-width="2" stroke-linecap="round"/>`,
      ...villi, cell(K.circlePath(rx, ry, rr)),
      nucleus([[rx - 10, ry, 8, 6.5], [rx + 1, ry + 7, 8, 6.5], [rx + 10, ry - 4, 7.5, 6]], `M${rx - 10} ${ry}Q${rx - 6} ${ry + 9} ${rx + 1} ${ry + 7}Q${rx + 8} ${ry + 5} ${rx + 10} ${ry - 4}`),
      // Squeezing between two endothelial cells, nucleus and all.
      cell(K.hourglassPath()),
      nucleus([[X - 8, 92, 8, 6.5], [X + 6, 100, 8, 6.5], [X, 168, 9, 7]], `M${X - 8} 92Q${X + 4} 94 ${X + 6} 100Q${X + 2} 112 ${X} 126L${X} 168`),
      // Crawling through the tissue towards bacteria.
      cell(K.crawlingCell(cx, cy, dir)),
      nucleus([[cx - 14, cy - 6, 8, 6.5], [cx - 4, cy + 4, 8, 6.5], [cx - 16, cy + 10, 7, 5.5]], `M${cx - 14} ${cy - 6}Q${cx - 2} ${cy - 2} ${cx - 4} ${cy + 4}Q${cx - 8} ${cy + 12} ${cx - 16} ${cy + 10}`),
      ...D.bacteria.map(([x, y, a]) => `<rect x="-9" y="-4.5" width="18" height="9" rx="4.5" transform="translate(${x} ${y}) rotate(${a})" fill="url(#${id}-rod)" stroke="${outline(C.gramNegative)}" stroke-width="1.6"/>`),
    ],
  };
}

function germinalCentre(id) {
  const G = K.GERMINAL_CENTRE, [fx, fy, frx, fry] = G.follicle, [cx, cy, crx, cry] = G.centre, { mantle, dark, light, tfh } = G.cells, b = C.bLymphocyte, d = C.dendritic;
  const dot = (r, fill, stroke) => ([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
  const fdc = G.fdcBranches.map(([a, m, e]) => `M${n(a[0])} ${n(a[1])}Q${n(m[0])} ${n(m[1])} ${n(e[0])} ${n(e[1])}`).join('');
  return {
    defs: [K.sphereGradient(`${id}-follicle`, tint(b, 0.35), { light: 0.4, dark: 0.08 }), K.sphereGradient(`${id}-blast`, shade(b, 0.12), { light: 0.45 }),
      K.sphereGradient(`${id}-cyte`, b, { light: 0.5 }), K.sphereGradient(`${id}-tfh`, C.lymphocyte, { light: 0.5 })],
    body: [
      `<ellipse cx="${fx}" cy="${fy}" rx="${frx}" ry="${fry}" fill="url(#${id}-follicle)" stroke="${shade(b, 0.38)}" stroke-width="${STROKE}"/>`,
      // Mantle zone of small naive B cells.
      ...mantle.map(dot(4.6, shade(b, 0.28), shade(b, 0.45))),
      `<ellipse cx="${cx}" cy="${cy}" rx="${crx}" ry="${cry}" fill="${tint(b, 0.72)}" stroke="${shade(b, 0.2)}" stroke-width="1.5"/>`,
      // Dark zone below: tightly packed, dividing centroblasts.
      `<path d="M${cx - crx} ${cy}A${crx} ${cry} 0 0 0 ${cx + crx} ${cy}Z" fill="${tint(b, 0.35)}"/>`,
      ...dark.map(dot(7.5, `url(#${id}-blast)`, shade(b, 0.4))),
      // Light zone above: centrocytes on the follicular dendritic cell network, with Tfh cells.
      `<path d="${fdc}" fill="none" stroke="${outline(d)}" stroke-width="4.5" stroke-linecap="round"/><path d="${fdc}" fill="none" stroke="${d}" stroke-width="2.5" stroke-linecap="round"/>`,
      ...G.fdc.map(dot(6.5, d, outline(d))),
      ...light.map(dot(5.5, `url(#${id}-cyte)`, shade(b, 0.4))),
      ...tfh.map(dot(6.5, `url(#${id}-tfh)`, shade(C.lymphocyte, 0.4))),
    ],
  };
}

function thSubsets(id) {
  const T = K.TH_SUBSETS, [nx, ny, nr] = T.naive;
  const cell = (x, y, r, colour, grad) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}-${grad})" stroke="${shade(colour, 0.32)}" stroke-width="${STROKE}"/>` +
    `<circle cx="${n(x - r * 0.1)}" cy="${n(y - r * 0.1)}" r="${n(r * 0.62)}" fill="url(#${id}-nucleus)" stroke="${outline(C.nucleus)}" stroke-width="2"/>` +
    K.gloss(`${id}-gloss`, x - r * 0.5, y - r * 0.55, r * 0.3, r * 0.15);
  const arrow = ([x, y]) => {
    const l = Math.hypot(x - nx, y - ny), [ux, uy] = [(x - nx) / l, (y - ny) / l];
    const a = K.straightArrow([nx + ux * (nr + 7), ny + uy * (nr + 7)], [x - ux * (T.r + 7), y - uy * (T.r + 7)], 12);
    return `<path d="${a.shaft}" stroke="${C.arrow}" stroke-width="4" stroke-linecap="round"/><polygon points="${a.head}" fill="${C.arrow}" stroke="${C.arrow}" stroke-width="1.5" stroke-linejoin="round"/>`;
  };
  return {
    defs: [K.sphereGradient(`${id}-naive`, C.lymphocyte, { light: 0.5, dark: 0.1 }), ...T.subsets.map(([, , c]) => K.sphereGradient(`${id}-${c}`, C[c], { light: 0.5, dark: 0.1 })),
      K.sphereGradient(`${id}-nucleus`, C.nucleus, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      ...T.subsets.map(arrow),
      cell(nx, ny, nr, C.lymphocyte, 'naive'),
      // Each subset with its own cytokines, a different shape for each.
      ...T.subsets.map(([x, y, c, kind]) => cell(x, y, T.r, C[c], c) +
        K.subsetCytokines([x, y]).map(([px, py]) => `<${K.cytokineShape(kind, px, py)} fill="${shade(C[c], 0.25)}" stroke="${outline(C[c])}" stroke-width="1.5" stroke-linejoin="round"/>`).join('')),
    ],
  };
}

// --------------------------------------------------------------- molecules

function iggAntibody(id) {
  const H = C.heavyChain, L = C.lightChain, hx = 128, hy = 112, deg = 48, angle = deg * Math.PI / 180;
  const domain = ([x, y], rot, colour, grad) =>
    `<ellipse cx="${n(x)}" cy="${n(y)}" rx="12.5" ry="19" transform="rotate(${rot} ${n(x)} ${n(y)})" fill="url(#${id}-${grad})" stroke="${outline(colour)}" stroke-width="2"/>`;
  const arms = [-1, 1].map(side => {
    const u = [side * Math.sin(angle), -Math.cos(angle)]; // along the arm
    const out = [side * Math.cos(angle), Math.sin(angle)]; // towards the light-chain side
    const at = (d, o) => [hx + u[0] * d + out[0] * o, hy + u[1] * d + out[1] * o];
    return { side, rot: side * deg, at, heavy: [at(44, -13), at(84, -13)], light: [at(44, 13), at(84, 13)] };
  });
  const hinges = arms.map(({ side, at }) => {
    const [x0, y0] = at(25, -13), x1 = hx + side * 14, y1 = hy + 15;
    const d = `M${n(x0)} ${n(y0)}C${n(x0)} ${n(y0 + 14)} ${x1} ${y1 - 14} ${x1} ${y1}`;
    return `<path d="${d}" fill="none" stroke="${outline(H)}" stroke-width="6" stroke-linecap="round"/>` +
      `<path d="${d}" fill="none" stroke="${H}" stroke-width="3.5" stroke-linecap="round"/>`;
  });
  const bond = (x1, y1, x2, y2) =>
    `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${shade(C.disulphide, 0.15)}" stroke-width="2.5" stroke-linecap="round"/>`;
  const glycan = `<g stroke="${outline(C.glycan)}" stroke-width="1.5">` +
    `<line x1="128" y1="138" x2="124" y2="148"/><line x1="128" y1="138" x2="132" y2="148"/>` +
    [[128, 138], [124, 148], [132, 148]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${C.glycan}"/>`).join('') + `</g>`;
  return {
    defs: [K.sphereGradient(`${id}-heavy`, H, { light: 0.5 }), K.sphereGradient(`${id}-light`, L, { light: 0.5 })],
    body: [
      ...hinges,
      ...[-1, 1].flatMap(side => [domain([hx + side * 14, hy + 34], 0, H, 'heavy'), domain([hx + side * 14, hy + 76], 0, H, 'heavy')]),
      glycan,
      ...arms.flatMap(a => [...a.heavy.map(p => domain(p, a.rot, H, 'heavy')), ...a.light.map(p => domain(p, a.rot, L, 'light'))]),
      bond(118, hy - 12, 138, hy - 12), bond(117, hy - 4, 139, hy - 4),
      ...arms.map(({ at }) => { const [a, b] = [at(28, -6), at(28, 6)]; return bond(a[0], a[1], b[0], b[1]); }),
    ],
  };
}

// One antibody unit in local coordinates: Fab arms up, Fc down (domains centred at the given
// depths; IgE has three), joined by short heavy-chain strands. Uses the icon's "heavy" and
// "light" gradients.
function antibodyUnit(id, fcDepths = [22, 60]) {
  const H = C.heavyChain, L = C.lightChain, deg = 48, angle = deg * Math.PI / 180;
  const domain = ([x, y], rot, colour, grad) =>
    `<ellipse cx="${n(x)}" cy="${n(y)}" rx="12.5" ry="19" transform="rotate(${rot} ${n(x)} ${n(y)})" fill="url(#${id}-${grad})" stroke="${outline(colour)}" stroke-width="4"/>`;
  const strands = [], fc = [], heavy = [], light = [];
  for (const side of [-1, 1]) {
    const u = [side * Math.sin(angle), -Math.cos(angle)], o = [side * Math.cos(angle), Math.sin(angle)];
    const at = (d, off) => [u[0] * d + o[0] * off, u[1] * d + o[1] * off];
    const [x0, y0] = at(20, -13), d = `M${n(x0)} ${n(y0)}Q${side * 8} 0 ${side * 14} 6`;
    strands.push(`<path d="${d}" fill="none" stroke="${outline(H)}" stroke-width="10" stroke-linecap="round"/>` +
      `<path d="${d}" fill="none" stroke="${H}" stroke-width="6" stroke-linecap="round"/>`);
    fc.push(...fcDepths.map(y => domain([side * 14, y], 0, H, 'heavy')));
    heavy.push(domain(at(36, -13), side * deg, H, 'heavy'), domain(at(76, -13), side * deg, H, 'heavy'));
    light.push(domain(at(36, 13), side * deg, L, 'light'), domain(at(76, 13), side * deg, L, 'light'));
  }
  return [...strands, ...fc, ...heavy, ...light].join('');
}

function igmPentamer(id) {
  const H = C.heavyChain, L = C.lightChain, J = C.jChain;
  const units = Array.from({ length: 5 }, (_, k) => {
    const phi = -90 + k * 72, r = phi * Math.PI / 180;
    return `<g transform="translate(${n(128 + 50 * Math.cos(r))} ${n(128 + 50 * Math.sin(r))}) rotate(${phi + 90}) scale(0.6)">${antibodyUnit(id)}</g>`;
  });
  return {
    defs: [K.sphereGradient(`${id}-heavy`, H, { light: 0.5 }), K.sphereGradient(`${id}-light`, L, { light: 0.5 }), K.sphereGradient(`${id}-j`, J)],
    body: [...units, `<circle cx="128" cy="128" r="12" fill="url(#${id}-j)" stroke="${outline(J)}" stroke-width="2"/>`],
  };
}

function igaDimer(id) {
  const H = C.heavyChain, L = C.lightChain, J = C.jChain, SC = C.secretoryComponent, s = 0.62;
  // Two units tail to tail, Fc regions meeting in the middle.
  const unit = side => `<g transform="translate(${n(128 - side * 53.6)} 128) rotate(${-90 * side}) scale(${s})">${antibodyUnit(id)}</g>`;
  // The secretory component's five domains wrap over both Fc regions.
  const sc = K.pointsAlongBezier([84, 110], [104, 82], [152, 82], [172, 110], [20, 20, 20, 20]);
  return {
    defs: [K.sphereGradient(`${id}-heavy`, H, { light: 0.5 }), K.sphereGradient(`${id}-light`, L, { light: 0.5 }),
      K.sphereGradient(`${id}-j`, J), K.sphereGradient(`${id}-sc`, SC, { light: 0.5 })],
    body: [
      unit(1), unit(-1),
      `<ellipse cx="128" cy="128" rx="8" ry="11" fill="url(#${id}-j)" stroke="${outline(J)}" stroke-width="2"/>`,
      `<path d="${K.smoothOpenPath(sc.map(p => [p.x, p.y]))}" fill="none" stroke="${outline(SC)}" stroke-width="5" stroke-linecap="round"/>`,
      ...sc.map(p => `<ellipse cx="${n(p.x)}" cy="${n(p.y)}" rx="11" ry="8" transform="rotate(${n(p.angle)} ${n(p.x)} ${n(p.y)})" fill="url(#${id}-sc)" stroke="${outline(SC)}" stroke-width="2"/>`),
    ],
  };
}

function igeMastCell(id) {
  const H = C.heavyChain, L = C.lightChain, R = C.receptorA, al = C.allergen, gr = C.mastGranule, s = 0.42;
  // IgE (three Fc domains per chain) held by FcεRI; the allergen cross-links the second and third.
  const units = [52, 128, 204].map(x => `<g transform="translate(${x} 121) scale(${s})">${antibodyUnit(id, [22, 60, 98])}</g>`);
  const receptors = [52, 128, 204].map(x => K.pipe(`M${x - 7} 172V212M${x + 7} 172V212`, R, 4) +
    [-1, 1].map(side => `<ellipse cx="${x + side * 13}" cy="166" rx="6" ry="11" transform="rotate(${side * 20} ${x + side * 13} 166)" fill="url(#${id}-fcr)" stroke="${outline(R)}" stroke-width="1.5"/>`).join(''));
  const allergen = K.smoothClosedPath(K.polarPoints(166, 78, a => 15 + 2.5 * Math.sin(5 * a + 1) + 1.5 * Math.sin(8 * a), 60));
  return {
    defs: [K.sphereGradient(`${id}-heavy`, H, { light: 0.5 }), K.sphereGradient(`${id}-light`, L, { light: 0.5 }), K.sphereGradient(`${id}-fcr`, R),
      K.sphereGradient(`${id}-lipid`, C.lipidHead), K.sphereGradient(`${id}-allergen`, al), K.sphereGradient(`${id}-granule`, gr, { light: 0.45 })],
    body: [
      lipidBilayer(`${id}-lipid`, 24, 234, 180, 206),
      ...receptors,
      ...units,
      `<path d="${allergen}" fill="url(#${id}-allergen)" stroke="${outline(al)}" stroke-width="2"/>`,
      // Granules inside the cell; one at the membrane has released histamine.
      ...[[100, 224, 13], [178, 228, 10], [40, 226, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}-granule)" stroke="${outline(gr)}" stroke-width="1.5"/>`),
      ...[[90, 152], [102, 142], [96, 164], [110, 156], [84, 166]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${tint(gr, 0.2)}" stroke="${outline(gr)}" stroke-width="0.8"/>`),
    ],
  };
}

function antibodyEpitope(id) {
  const ag = C.antigen, ep = C.peptide, igg = iggAntibody(id), s = 0.72;
  // Epitopes sit just beyond the tips of the Fab arms (105 px from the hinge along each arm,
  // before the antibody is scaled into place below the antigen).
  const tips = [-1, 1].map(side => {
    const u = [side * Math.sin(48 * Math.PI / 180), -Math.cos(48 * Math.PI / 180)], d = 105 * s + 4;
    return { x: 128 + u[0] * d, y: 150 + u[1] * d, deg: side * 48 };
  });
  return {
    defs: [...igg.defs, K.sphereGradient(`${id}-antigen`, ag, { light: 0.5 }), K.sphereGradient(`${id}-epitope`, ep)],
    body: [
      `<path d="${K.smoothClosedPath(K.polarPoints(128, 50, a => K.ellipseRadius(110, 44, a) + 3 * Math.sin(7 * a + 1) + 2 * Math.sin(11 * a), 140))}" fill="url(#${id}-antigen)" stroke="${outline(ag)}" stroke-width="${STROKE}"/>`,
      ...[[60, 40], [100, 30], [150, 36], [194, 46], [124, 60], [80, 66], [176, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${shade(ag, 0.12)}" opacity="0.6"/>`),
      ...tips.map(({ x, y, deg }) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="12" ry="7" transform="rotate(${deg} ${n(x)} ${n(y)})" fill="url(#${id}-epitope)" stroke="${outline(ep)}" stroke-width="1.5"/>`),
      `<g transform="translate(128 150) scale(${s}) translate(-128 -112)">`, ...igg.body, `</g>`,
    ],
  };
}

// Phospholipid bilayer: head groups at y = top and y = bottom, tails between.
function lipidBilayer(gradId, x0, x1, top, bottom) {
  const mid = (top + bottom) / 2, tails = [], heads = [];
  for (let x = x0; x <= x1; x += 10) {
    tails.push(`M${x - 2} ${top + 4}V${mid - 1}M${x + 2} ${top + 4}V${mid - 1}M${x - 2} ${bottom - 4}V${mid + 1}M${x + 2} ${bottom - 4}V${mid + 1}`);
    heads.push(...[top, bottom].map(y => `<circle cx="${x}" cy="${y}" r="4.6" fill="url(#${gradId})" stroke="${outline(C.lipidHead)}" stroke-width="1"/>`));
  }
  return `<path d="${tails.join('')}" stroke="${C.lipidTail}" stroke-width="1.6" stroke-linecap="round"/>` + heads.join('');
}

function mhcClassII(id) {
  const A = C.mhcAlpha, B = C.mhcBeta, P = C.peptide;
  const domain = (x, y, rx, ry, rot, colour, grad) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="url(#${id}-${grad})" stroke="${outline(colour)}" stroke-width="2.2"/>`;
  const peptide = Array.from({ length: 7 }, (_, i) => {
    const x = 98 + i * 10, y = 64 + 3 * Math.sin(i * 1.3);
    return `<circle cx="${x}" cy="${n(y)}" r="6.5" fill="url(#${id}-peptide)" stroke="${outline(P)}" stroke-width="1.2"/>`;
  });
  return {
    defs: [K.sphereGradient(`${id}-lipid`, C.lipidHead), K.sphereGradient(`${id}-alpha`, A, { light: 0.5 }),
      K.sphereGradient(`${id}-beta`, B, { light: 0.5 }), K.sphereGradient(`${id}-peptide`, P)],
    body: [
      `<g transform="translate(0 -8)">`,
      lipidBilayer(`${id}-lipid`, 24, 234, 184, 210),
      K.pipe('M104 156V222', A, 7), K.pipe('M152 156V222', B, 7),
      domain(104, 144, 22, 26, 0, A, 'alpha'), domain(152, 144, 22, 26, 0, B, 'beta'),
      domain(98, 94, 30, 21, 22, A, 'alpha'), domain(158, 94, 30, 21, -22, B, 'beta'),
      ...peptide,
      `</g>`,
    ],
  };
}

function mhcClassI(id) {
  const A = C.mhcAlpha, B = C.b2m, P = C.peptide;
  const domain = (x, y, rx, ry, rot, colour, grad) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="url(#${id}-${grad})" stroke="${outline(colour)}" stroke-width="2.2"/>`;
  // A short peptide held at both ends of the closed groove, bulging up in the middle.
  const peptide = Array.from({ length: 9 }, (_, i) =>
    `<circle cx="${100 + i * 7}" cy="${n(72 - 6 * Math.sin(i / 8 * Math.PI))}" r="5.5" fill="url(#${id}-peptide)" stroke="${outline(P)}" stroke-width="1.1"/>`);
  return {
    defs: [K.sphereGradient(`${id}-lipid`, C.lipidHead), K.sphereGradient(`${id}-alpha`, A, { light: 0.5 }),
      K.sphereGradient(`${id}-b2m`, B, { light: 0.5 }), K.sphereGradient(`${id}-peptide`, P)],
    body: [
      `<g transform="translate(0 -8)">`,
      lipidBilayer(`${id}-lipid`, 24, 234, 184, 210),
      // Only the heavy chain crosses the membrane; β2-microglobulin sits beside its α3 domain.
      K.pipe('M104 156V222', A, 7),
      domain(104, 144, 22, 26, 0, A, 'alpha'), domain(154, 146, 21, 23, 0, B, 'b2m'),
      domain(98, 94, 30, 21, 22, A, 'alpha'), domain(158, 94, 30, 21, -22, A, 'alpha'),
      ...peptide,
      `</g>`,
    ],
  };
}

function cytokineReceptor(id) {
  const A = C.receptorChainA, B = C.receptorChainB, CK = C.cytokine, JAK = C.kinase;
  const domain = (x, y, rx, ry, rot, colour, grad) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="url(#${id}-${grad})" stroke="${outline(colour)}" stroke-width="2.2"/>`;
  const cytokine = (x, y, rx, ry, rot) =>
    domain(x, y, rx, ry, rot, CK, 'cytokine') +
    `<path d="M${x - rx * 0.5} ${n(y - ry * 0.45)}L${x - rx * 0.5} ${n(y + ry * 0.45)}M${x} ${n(y - ry * 0.6)}L${x} ${n(y + ry * 0.6)}M${x + rx * 0.5} ${n(y - ry * 0.45)}L${x + rx * 0.5} ${n(y + ry * 0.45)}" ` +
    `transform="rotate(${rot} ${x} ${y})" stroke="${shade(CK, 0.22)}" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>`;
  return {
    defs: [K.sphereGradient(`${id}-lipid`, C.lipidHead), K.sphereGradient(`${id}-a`, A, { light: 0.5 }), K.sphereGradient(`${id}-b`, B, { light: 0.5 }),
      K.sphereGradient(`${id}-cytokine`, CK), K.sphereGradient(`${id}-jak`, JAK)],
    body: [
      lipidBilayer(`${id}-lipid`, 24, 234, 178, 204),
      K.pipe('M108 150V214', A, 7), K.pipe('M148 150V214', B, 7),
      domain(100, 224, 13, 9, -10, JAK, 'jak'), domain(156, 224, 13, 9, 10, JAK, 'jak'),
      domain(110, 140, 18, 24, 10, A, 'a'), domain(146, 140, 18, 24, -10, B, 'b'),
      domain(102, 98, 18, 22, 18, A, 'a'), domain(154, 98, 18, 22, -18, B, 'b'),
      cytokine(128, 74, 22, 19, 0),
      cytokine(52, 62, 15, 13, 20), cytokine(200, 46, 14, 12, -15), cytokine(212, 110, 11, 10, 10),
    ],
  };
}

function complementMac(id) {
  const comp = C.complement, cx = C.complementComplex;
  const staves = Array.from({ length: 9 }, (_, k) => {
    const t = k / 8, colour = mix(tint(comp, 0.35), shade(comp, 0.3), Math.abs(t - 0.3) / 0.7);
    return `<rect x="${n(95 + k * 7.6)}" y="98" width="7" height="96" rx="3.5" fill="${colour}" stroke="${outline(comp)}" stroke-width="1.2"/>`;
  });
  return {
    defs: [K.sphereGradient(`${id}-lipid`, C.lipidHead), K.sphereGradient(`${id}-cx`, cx, { light: 0.5 })],
    body: [
      lipidBilayer(`${id}-lipid`, 24, 88, 150, 176), lipidBilayer(`${id}-lipid`, 168, 234, 150, 176),
      `<ellipse cx="128" cy="98" rx="34" ry="10" fill="${shade(comp, 0.5)}"/>`,
      ...staves,
      `<ellipse cx="128" cy="98" rx="34" ry="10" fill="none" stroke="${outline(comp)}" stroke-width="2.5"/>`,
      ...[[92, 72, 10, 8, 0], [72, 104, 12, 10, 0], [84, 86, 16, 12, -20]].map(([x, y, rx, ry, rot]) =>
        `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="url(#${id}-cx)" stroke="${outline(cx)}" stroke-width="2"/>`),
      ...[[124, 58], [134, 74], [122, 214], [132, 230]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${C.fluid}" stroke="${outline(C.fluid)}" stroke-width="1"/>`),
    ],
  };
}

function tollLikeReceptor(id) {
  const T = C.tlr, TIR = C.kinase, { centre: [cx, cy], from, to } = K.TLR;
  // The left horseshoe; the right one mirrors it. Its inner (C-terminal) end leads to the membrane.
  const arc = K.smoothOpenPath(K.arcPoints(cx, cy, 36, from, to));
  const [ex, ey] = K.arcPoints(cx, cy, 36, from, to).pop();
  const leg = `M${n(ex)} ${n(ey)}L${n(ex)} 214`;
  // Leucine-rich repeats: ridges across each horseshoe.
  const ridges = K.arcPoints(cx, cy, 1, from + 10, to - 10, 13).map(([x, y]) => {
    const [ux, uy] = [x - cx, y - cy];
    return `M${n(cx + ux * 26)} ${n(cy + uy * 26)}L${n(cx + ux * 46)} ${n(cy + uy * 46)}`;
  }).join('');
  const sugars = [[128, 40], [122, 54], [134, 54], [128, 68]];
  return {
    defs: [K.sphereGradient(`${id}-lipid`, C.lipidHead), K.sphereGradient(`${id}-tir`, TIR), K.sphereGradient(`${id}-sugar`, C.glycan)],
    body: [
      lipidBilayer(`${id}-lipid`, 24, 234, 172, 198),
      K.pipe(leg, T, 7), K.pipe(K.mirrorX(leg), T, 7),
      ...[112, 144].map(x => `<ellipse cx="${x}" cy="222" rx="16" ry="11" fill="url(#${id}-tir)" stroke="${outline(TIR)}" stroke-width="2"/>`),
      K.pipe(arc, T, 22), K.pipe(K.mirrorX(arc), T, 22),
      `<path d="${ridges}${K.mirrorX(ridges)}" stroke="${shade(T, 0.28)}" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>`,
      // Lipopolysaccharide in the notch between the two ectodomains: lipid chains below, sugars above.
      `<path d="M124 72L120 88M128 74L128 90M132 72L136 88" stroke="${shade(C.lipidTail, 0.25)}" stroke-width="2.5" stroke-linecap="round"/>`,
      `<path d="M128 40L122 54L128 68L134 54Z" fill="none" stroke="${outline(C.glycan)}" stroke-width="1.5"/>`,
      ...sugars.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="url(#${id}-sugar)" stroke="${outline(C.glycan)}" stroke-width="1.2"/>`),
    ],
  };
}

function c3bOpsonisation(id) {
  const cell = C.macrophage, bug = C.gramPositive, c3b = C.complement, cr = C.receptorA;
  const { P: [px, py], ri } = K.OPSONISATION, at = (a, r) => [px + r * Math.cos(a * Math.PI / 180), py + r * Math.sin(a * Math.PI / 180)];
  const nucleus = K.polarPoints(0, 0, a => 26 - 9 * Math.exp(-(K.wrapAngle(a - 0.2) ** 2) / (2 * 0.35 ** 2)), 60).map(([x, y]) => [64 + 1.15 * x, 128 + y]);
  const coat = Array.from({ length: 16 }, (_, k) => k * 22.5 + 6);
  return {
    defs: [
      `<radialGradient id="${id}-cell" gradientUnits="userSpaceOnUse" cx="110" cy="118" r="140" fx="60" fy="80">` +
      `<stop offset="0" stop-color="${tint(cell, 0.5)}"/><stop offset="0.55" stop-color="${cell}"/><stop offset="1" stop-color="${shade(cell, 0.1)}"/></radialGradient>`,
      K.sphereGradient(`${id}-nucleus`, C.nucleus, { light: 0.45 }), K.sphereGradient(`${id}-bug`, bug), K.sphereGradient(`${id}-c3b`, c3b), K.glossGradient(`${id}-gloss`),
    ],
    body: [
      // Phagocyte: a round body whose two arms are closing over the bacterium.
      `<path d="${K.phagocyteCup()}" fill="url(#${id}-cell)" stroke="${shade(cell, 0.32)}" stroke-width="${STROKE}"/>`,
      `<path d="${K.smoothClosedPath(nucleus)}" fill="url(#${id}-nucleus)" stroke="${outline(C.nucleus)}" stroke-width="2.5"/>`,
      ...[[96, 92], [44, 100], [100, 168], [40, 156]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${shade(cell, 0.35)}" opacity="0.8"/>`),
      // Complement receptors on the cup's inner face, each holding a C3b molecule.
      `<path d="${[70, 95, 120, 145, 170, 195, 220, 245, 270, 295].map(a => { const [p, q] = [at(a, ri), at(a, 44)]; return `M${n(p[0])} ${n(p[1])}L${n(q[0])} ${n(q[1])}`; }).join('')}" stroke="${outline(cr)}" stroke-width="3.5" stroke-linecap="round"/>`,
      `<circle cx="${px}" cy="${py}" r="31" fill="url(#${id}-bug)" stroke="${outline(bug)}" stroke-width="${STROKE}"/>`,
      K.gloss(`${id}-gloss`, px - 11, py - 13, 11, 6),
      ...coat.map(a => { const [x, y] = at(a, 37); return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="6" ry="4.5" transform="rotate(${a} ${n(x)} ${n(y)})" fill="url(#${id}-c3b)" stroke="${outline(c3b)}" stroke-width="1.2"/>`; }),
    ],
  };
}

function inflammasome(id) {
  const I = K.INFLAMMASOME, [cx, cy] = I.centre, A = C.asc, cas = C.caspase, il = C.cytokine;
  const at = (deg, r) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
  const subunits = Array.from({ length: I.count }, (_, i) => {
    const a = i * 360 / I.count, [x, y] = at(a, I.nacht), [p, q] = [at(a, I.nacht + 8), at(a, I.lrr - 4)];
    return K.pipe(`M${n(p[0])} ${n(p[1])}L${n(q[0])} ${n(q[1])}`, C.nlrp3, 5) +
      K.pipe(K.smoothOpenPath(K.arcPoints(cx, cy, I.lrr, a - 14, a + 14, 2)), C.lrr, 11) +
      `<ellipse cx="${n(x)}" cy="${n(y)}" rx="12" ry="11" transform="rotate(${a} ${n(x)} ${n(y)})" fill="url(#${id}-nacht)" stroke="${outline(C.nlrp3)}" stroke-width="2"/>`;
  });
  const F = I.filament, beads = [];
  for (let d = F.from, k = 0; d <= F.to; d += F.step, k++) {
    const [x, y] = at(F.angle, d);
    beads.push(`<circle cx="${n(x)}" cy="${n(y)}" r="6.5" fill="url(#${id}-${k % 2 ? 'asc2' : 'asc'})" stroke="${outline(A)}" stroke-width="1.5"/>`);
  }
  const pyd = Array.from({ length: 8 }, (_, k) => { const [x, y] = at(k * 45 + 20, 10); return `<circle cx="${n(x)}" cy="${n(y)}" r="5" fill="${tint(C.nlrp3, 0.35)}" stroke="${outline(C.nlrp3)}" stroke-width="1.2"/>`; });
  const [kx, ky, ka] = I.caspase;
  // IL-1β: a β-trefoil, three lobes merged (outline first, then fill).
  const trefoil = ([x, y, a]) => {
    const lobes = [0, 120, 240].map(b => [x + 6 * Math.cos((a + b - 90) * Math.PI / 180), y + 6 * Math.sin((a + b - 90) * Math.PI / 180)]);
    return lobes.map(([lx, ly]) => `<circle cx="${n(lx)}" cy="${n(ly)}" r="7" fill="${outline(il)}" stroke="${outline(il)}" stroke-width="3"/>`).join('') +
      lobes.map(([lx, ly]) => `<circle cx="${n(lx)}" cy="${n(ly)}" r="7" fill="url(#${id}-il1b)"/>`).join('');
  };
  return {
    defs: [K.sphereGradient(`${id}-nacht`, C.nlrp3, { light: 0.5 }), K.sphereGradient(`${id}-asc`, A), K.sphereGradient(`${id}-asc2`, shade(A, 0.12)),
      K.sphereGradient(`${id}-caspase`, cas), K.sphereGradient(`${id}-caspase2`, tint(cas, 0.3)), K.sphereGradient(`${id}-il1b`, il)],
    body: [
      ...subunits, ...pyd, ...beads,
      `<g transform="translate(${kx} ${ky}) rotate(${ka})">` +
      `<ellipse cy="-8" rx="15" ry="8.5" fill="url(#${id}-caspase)" stroke="${outline(cas)}" stroke-width="2"/>` +
      `<ellipse cy="8" rx="15" ry="8.5" fill="url(#${id}-caspase2)" stroke="${outline(cas)}" stroke-width="2"/></g>`,
      ...I.il1b.map(trefoil),
    ],
  };
}

function interferonSignalling(id) {
  const I = K.INTERFERON, [top, bottom] = I.membrane, [xa, xb] = I.chains, A = C.receptorChainA, B = C.receptorChainB, J = C.kinase, ck = C.cytokine;
  const domain = (x, y, rx, ry, rot, colour, grad) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="url(#${id}-${grad})" stroke="${outline(colour)}" stroke-width="2"/>`;
  const phosphate = (x, y) => `<circle cx="${x}" cy="${y}" r="4.2" fill="${C.phosphate}" stroke="${outline(C.phosphate)}" stroke-width="1.2"/>`;
  // ISGF3: phosphorylated STAT1 and STAT2 with IRF9.
  const isgf3 = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">` + domain(-10, 0, 11, 15, 10, C.stat1, 'stat1') + domain(10, 0, 11, 15, -10, C.stat2, 'stat2') +
    domain(0, 16, 9, 6, 0, C.penton, 'irf9') + phosphate(-16, -12) + phosphate(16, -12) + `</g>`;
  const [ix, iy] = I.isgf3, arrow = K.straightArrow(...I.arrow, 11);
  const strand = phase => K.smoothOpenPath(Array.from({ length: 41 }, (_, i) => [40 + i * 4.4, I.dna + 5 * Math.sin(i / 40 * 2 * Math.PI * 3 + phase)]));
  const rungs = Array.from({ length: 20 }, (_, i) => { const x = 42 + i * 8.8, t = (x - 40) / 176 * 2 * Math.PI * 3; return `M${n(x)} ${n(I.dna + 5 * Math.sin(t))}L${n(x)} ${n(I.dna + 5 * Math.sin(t + Math.PI))}`; }).join('');
  return {
    defs: [K.sphereGradient(`${id}-lipid`, C.lipidHead), K.sphereGradient(`${id}-a`, A, { light: 0.5 }), K.sphereGradient(`${id}-b`, B, { light: 0.5 }),
      K.sphereGradient(`${id}-ifn`, ck), K.sphereGradient(`${id}-jak`, J), K.sphereGradient(`${id}-stat1`, C.stat1, { light: 0.5 }),
      K.sphereGradient(`${id}-stat2`, C.stat2, { light: 0.5 }), K.sphereGradient(`${id}-irf9`, C.penton)],
    body: [
      // Nucleus below, with ISGF3 bound to DNA.
      `<path d="${I.envelope}L240 232Q240 240 232 240L24 240Q16 240 16 232Z" fill="${tint(C.nucleus, 0.82)}"/>`,
      `<path d="${I.envelope}" fill="none" stroke="${shade(C.nucleus, 0.1)}" stroke-width="8"/><path d="${I.envelope}" fill="none" stroke="${tint(C.nucleus, 0.6)}" stroke-width="3"/>`,
      ...[60, 196].map(x => `<circle cx="${x}" cy="${n(214 - 18 * (1 - ((x - 128) / 112) ** 2))}" r="4.5" fill="${tint(C.nucleus, 0.82)}" stroke="${shade(C.nucleus, 0.1)}" stroke-width="2"/>`),
      `<path d="${rungs}" stroke="${tint(C.nucleus, 0.3)}" stroke-width="2"/>`,
      `<path d="${strand(0)}" fill="none" stroke="${C.nucleus}" stroke-width="3.5" stroke-linecap="round"/><path d="${strand(Math.PI)}" fill="none" stroke="${C.attachmentProtein}" stroke-width="3.5" stroke-linecap="round"/>`,
      isgf3(ix, iy, 0.75),
      lipidBilayer(`${id}-lipid`, 24, 234, top, bottom),
      K.pipe(`M${xa} ${I.domains[1] + 8}V${I.jak - 6}`, A, 7), K.pipe(`M${xb} ${I.domains[1] + 8}V${I.jak - 6}`, B, 7),
      domain(xa - 12, I.jak, 13, 9, -10, J, 'jak'), domain(xb + 12, I.jak, 13, 9, 10, J, 'jak'),
      ...I.domains.map(y => domain(xa, y, 13, 12, 0, A, 'a') + domain(xb, y, 13, 12, 0, B, 'b')),
      domain(128, I.ligand[1], 13, 18, 0, ck, 'ifn'),
      `<path d="M122 ${I.ligand[1] - 10}V${I.ligand[1] + 10}M128 ${I.ligand[1] - 13}V${I.ligand[1] + 13}M134 ${I.ligand[1] - 10}V${I.ligand[1] + 10}" stroke="${shade(ck, 0.22)}" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>`,
      isgf3(...I.stats, 1),
      `<path d="${arrow.shaft}" stroke="${C.arrow}" stroke-width="4" stroke-linecap="round"/><polygon points="${arrow.head}" fill="${C.arrow}"/>`,
    ],
  };
}

function complementCascade(id) {
  const X = K.COMPLEMENT, bug = C.gramPositive, c3 = C.complement, yS = X.surfaceY;
  const head = (x, y, r, colour) => `<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="url(#${id}-${colour})" stroke="${outline(C[colour])}" stroke-width="1.3"/>`;
  const stalks = (b, colour) => `<path d="${b.stem}${b.stalks}" fill="none" stroke="${outline(C[colour])}" stroke-width="4.5" stroke-linecap="round"/>` +
    `<path d="${b.stem}${b.stalks}" fill="none" stroke="${C[colour]}" stroke-width="2.5" stroke-linecap="round"/>`;
  // Classical: C1q on the Fc of two antibodies bound to the surface.
  const cx = X.classical, ay = yS(cx) - 26, hy = ay - 14;
  const c1qHeads = [[36, hy], [44, hy - 3], [52, hy - 5], [60, hy - 5], [68, hy - 3], [76, hy]];
  // Lectin: MBL on mannose residues.
  const lx = X.lectin, ly = yS(lx), mblHeads = [[112, ly - 15], [122, ly - 17], [134, ly - 17], [144, ly - 15]];
  // Alternative: C3b fixed to the surface, carrying factor Bb.
  const axx = X.alternative, ayy = yS(axx);
  const [c3x, c3y] = X.c3;
  return {
    defs: [K.cylinderGradient(`${id}-bug`, bug), K.sphereGradient(`${id}-c1q`, C.c1q), K.sphereGradient(`${id}-mbl`, C.mbl), K.sphereGradient(`${id}-complement`, c3, { light: 0.5 }),
      K.sphereGradient(`${id}-factorB`, C.factorB), K.sphereGradient(`${id}-c3a`, tint(c3, 0.35))],
    body: [
      `<path d="${X.surface}" fill="url(#${id}-bug)" stroke="${outline(bug)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      miniAntibody(44, ay, 180, 1.2), miniAntibody(68, ay, 180, 1.2),
      stalks(K.bouquet(cx, hy - 40, c1qHeads), 'c1q'), ...c1qHeads.map(([x, y]) => head(x, y, 5.5, 'c1q')),
      ...[116, 128, 140].map(x => `<polygon points="${hexagon(x, yS(x) - 5, 5.5, 30)}" fill="${C.glycan}" stroke="${outline(C.glycan)}" stroke-width="1.2"/>`),
      stalks(K.bouquet(lx, ly - 60, mblHeads), 'mbl'), ...mblHeads.map(([x, y]) => head(x, y, 5.5, 'mbl')),
      `<ellipse cx="${axx}" cy="${n(ayy - 12)}" rx="15" ry="11" fill="url(#${id}-complement)" stroke="${outline(c3)}" stroke-width="2"/>`,
      `<ellipse cx="${axx}" cy="${n(ayy - 32)}" rx="11" ry="9" fill="url(#${id}-factorB)" stroke="${outline(C.factorB)}" stroke-width="2"/>`,
      // All three converge on C3, split into C3b and the small C3a.
      ...X.arrows.map(([p, c, q]) => { const a = K.curvedArrow(p, c, q, 12); return `<path d="${a.shaft}" fill="none" stroke="${C.arrow}" stroke-width="4" stroke-linecap="round"/><polygon points="${a.head}" fill="${C.arrow}"/>`; }),
      `<ellipse cx="${c3x}" cy="${c3y}" rx="27" ry="18" fill="url(#${id}-complement)" stroke="${outline(c3)}" stroke-width="2.5"/>`,
      `<circle cx="${c3x + 40}" cy="${c3y - 18}" r="9" fill="url(#${id}-c3a)" stroke="${outline(c3)}" stroke-width="2"/>`,
      `<path d="M${c3x + 24} ${c3y - 20}l4 6l-5 2l4 6" fill="none" stroke="${C.arrow}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    ],
  };
}

function fcReceptor(id) {
  const F = K.FC_RECEPTOR, cell = C.macrophage, bug = C.gramPositive, rc = C.receptorA, [px, py] = F.P, [bx, by] = F.B;
  const at = (a, r) => [px + r * Math.cos(a * Math.PI / 180), py + r * Math.sin(a * Math.PI / 180)];
  const nucleus = K.polarPoints(0, 0, a => 24 - 8 * Math.exp(-(K.wrapAngle(a - 0.2) ** 2) / (2 * 0.35 ** 2)), 60).map(([x, y]) => [bx - 6 + 1.15 * x, by + y]);
  const angles = Array.from({ length: F.antibodies }, (_, k) => k * 360 / F.antibodies), stemR = F.bacterium + 1 + 26 * F.scale;
  const cupped = a => a > 55 && a < 305;
  return {
    defs: [`<radialGradient id="${id}-cell" gradientUnits="userSpaceOnUse" cx="112" cy="118" r="140" fx="62" fy="80">` +
      `<stop offset="0" stop-color="${tint(cell, 0.5)}"/><stop offset="0.55" stop-color="${cell}"/><stop offset="1" stop-color="${shade(cell, 0.1)}"/></radialGradient>`,
      K.sphereGradient(`${id}-nucleus`, C.nucleus, { light: 0.45 }), K.sphereGradient(`${id}-bug`, bug), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${K.phagocyteCup(F)}" fill="url(#${id}-cell)" stroke="${shade(cell, 0.32)}" stroke-width="${STROKE}"/>`,
      `<path d="${K.smoothClosedPath(nucleus)}" fill="url(#${id}-nucleus)" stroke="${outline(C.nucleus)}" stroke-width="2.5"/>`,
      // Fcγ receptors on the cup's inner face, each holding the Fc of an antibody.
      ...angles.filter(cupped).map(a => { const [[x0, y0], [x1, y1]] = [at(a, F.ri + 1), at(a, stemR + 1)]; return K.pipe(`M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}`, rc, 4); }),
      `<circle cx="${px}" cy="${py}" r="${F.bacterium}" fill="url(#${id}-bug)" stroke="${outline(bug)}" stroke-width="${STROKE}"/>`,
      K.gloss(`${id}-gloss`, px - 9, py - 11, 9, 5),
      // IgG coating the bacterium: Fab arms on its surface, Fc pointing out.
      ...angles.map(a => { const [x, y] = at(a, stemR); return miniAntibody(x, y, a - 90, F.scale); }),
    ],
  };
}

// ------------------------------------------------------- antimicrobial resistance

// A small two-tone antibiotic capsule, used as a stand-in for an antibiotic molecule.
function pill(id, x, y, rot, s = 1) {
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${rot}) scale(${s})">` +
    `<rect x="-11" y="-5" width="22" height="10" rx="5" fill="url(#${id}-pill-b)" stroke="${outline(C.drugYellow)}" stroke-width="1.3"/>` +
    `<path d="M0 -5H-6A5 5 0 0 0 -6 5H0Z" fill="url(#${id}-pill-a)" stroke="${outline(C.drugRed)}" stroke-width="1.3"/></g>`;
}
const pillGradients = id => [K.cylinderGradient(`${id}-pill-a`, C.drugRed), K.cylinderGradient(`${id}-pill-b`, C.drugYellow)];

function betaLactamase(id) {
  const enz = C.enzyme, bond = C.bond;
  // Enzyme with its active-site cleft opening to the right.
  const blob = K.polarPoints(104, 132, a => 74 + 3 * Math.sin(6 * a + 1) - 34 * Math.exp(-(K.wrapAngle(a) ** 2) / (2 * 0.3 ** 2)), 120);
  const rand = K.rng(61), dimples = [];
  for (let tries = 0; dimples.length < 14 && tries < 4000; tries++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 58, p = [104 + d * Math.cos(a), 132 + d * Math.sin(a)];
    if (Math.abs(K.wrapAngle(a)) > 0.6 && dimples.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 16)) dimples.push(p);
  }
  // β-lactam core: four-membered ring (C=O at top left) fused to the five-membered ring below.
  // The ring's C–N bond, in the active site, is shown breaking.
  const bonds = 'M150 114L176 114L176 140L150 140M150 140L142 164L163 180L184 164L176 140M150 114L138 100M154 110L142 96';
  return {
    defs: [K.sphereGradient(`${id}-enzyme`, enz, { light: 0.5 })],
    body: [
      `<path d="${K.smoothClosedPath(blob)}" fill="url(#${id}-enzyme)" stroke="${outline(enz)}" stroke-width="${STROKE}"/>`,
      ...dimples.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(3 + rand() * 2)}" fill="${shade(enz, 0.12)}" opacity="0.5"/>`),
      `<circle cx="140" cy="132" r="5" fill="${C.penton}" stroke="${outline(C.penton)}" stroke-width="1.2"/>`,
      `<path d="${bonds}" fill="none" stroke="${bond}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="M150 114L150 121M150 133L150 140" stroke="${bond}" stroke-width="5" stroke-linecap="round"/>`,
      `<path d="M139 121L134 117M140 127L133 127M139 133L134 137" stroke="${C.drugRed}" stroke-width="2.5" stroke-linecap="round"/>`,
      `<circle cx="150" cy="140" r="6.5" fill="${C.attachmentProtein}" stroke="${outline(C.attachmentProtein)}" stroke-width="1.2"/>`,
      `<circle cx="138" cy="98" r="6.5" fill="${C.drugRed}" stroke="${outline(C.drugRed)}" stroke-width="1.2"/>`,
      `<circle cx="184" cy="164" r="6.5" fill="${C.microneme}" stroke="${outline(C.microneme)}" stroke-width="1.2"/>`,
    ],
  };
}

function effluxPump(id) {
  const pump = C.pump;
  return {
    defs: [K.sphereGradient(`${id}-lipid`, C.lipidHead), K.cylinderGradient(`${id}-pump`, pump, { horizontal: true }), ...pillGradients(id)],
    body: [
      lipidBilayer(`${id}-lipid`, 24, 90, 148, 174), lipidBilayer(`${id}-lipid`, 166, 234, 148, 174),
      `<rect x="96" y="82" width="64" height="128" rx="20" fill="url(#${id}-pump)" stroke="${outline(pump)}" stroke-width="${STROKE}"/>`,
      `<rect x="117" y="88" width="22" height="116" rx="11" fill="${C.channel}" stroke="${shade(pump, 0.2)}" stroke-width="1.5"/>`,
      pill(id, 128, 178, 90), pill(id, 128, 128, 90),
      `<path d="M128 74V32M117 45L128 31L139 45" fill="none" stroke="${C.bond}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
      pill(id, 158, 46, -30), pill(id, 62, 70, 25), pill(id, 196, 92, -15),
      pill(id, 58, 212, 20), pill(id, 200, 210, -35),
    ],
  };
}

// A plasmid ring with its resistance gene, centred at (x, y).
function plasmid(x, y, r, dna, gene) {
  const [p, q] = [[x + r * Math.cos(-2.2), y + r * Math.sin(-2.2)], [x + r * Math.cos(-0.6), y + r * Math.sin(-0.6)]];
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${dna}" stroke-width="3.5"/>` +
    `<path d="M${n(p[0])} ${n(p[1])}A${r} ${r} 0 0 1 ${n(q[0])} ${n(q[1])}" fill="none" stroke="${gene}" stroke-width="5.5" stroke-linecap="round"/>`;
}

// A bacterial chromosome: a tangled loop centred at (x, y).
const nucleoid = (x, y) => K.smoothClosedPath(K.polarPoints(x, y, a => 9 + 3 * Math.sin(3 * a) + 2 * Math.sin(5 * a + 1), 40));

function plasmidTransfer(id) {
  const base = C.gramNegative, dna = C.nucleus, gene = C.drugRed, Q = K.CONJUGATION, { donor, recipient, s, r } = Q;
  const [[px, py], [cx, cy]] = [Q.plasmid, Q.chromosome];
  const rod = (cell, k) => `<g transform="translate(${cell[0]} ${cell[1]}) rotate(${cell[2]})">${gramNegativeRod(`${id}-body`, s, r)}` +
    `<path d="${nucleoid(k * cx, k * cy)}" fill="none" stroke="${shade(base, 0.35)}" stroke-width="2" opacity="0.7"/>` +
    plasmid(k * px, k * py, 10, dna, gene) + `</g>`;
  // Mating bridge, with a single strand of plasmid DNA passing from donor to recipient.
  const [b0, b1] = [K.toGlobal(donor, Q.bridge, r - 6), K.toGlobal(recipient, -Q.bridge, 6 - r)];
  const strand = [K.toGlobal(donor, px + 4, py + 9), b0, b1, K.toGlobal(recipient, -px - 4, -py - 9)];
  return {
    defs: [K.cylinderGradient(`${id}-body`, base)],
    body: [
      K.pipe(`M${n(b0[0])} ${n(b0[1])}L${n(b1[0])} ${n(b1[1])}`, tint(base, 0.15), 10),
      rod(donor, 1), rod(recipient, -1),
      `<path d="${K.smoothOpenPath(strand)}" fill="none" stroke="${gene}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="5 3"/>`,
    ],
  };
}

function susceptibilityPlate(id) {
  const agar = C.mhAgar;
  const discs = [[128, 70, 34], [188, 112, 26], [168, 182, 0], [88, 184, 40], [66, 112, 18]];
  const rand = K.rng(71), lawn = [];
  for (let k = 0; k < 220; k++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 96;
    lawn.push([128 + d * Math.cos(a), 128 + d * Math.sin(a)]);
  }
  return {
    defs: [K.sphereGradient(`${id}-agar`, agar, { light: 0.3, dark: 0.12 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<circle cx="128" cy="128" r="110" fill="#E8EFF4" stroke="${C.plasticEdge}" stroke-width="${STROKE}"/>`,
      `<circle cx="128" cy="128" r="101" fill="url(#${id}-agar)" stroke="${shade(agar, 0.3)}" stroke-width="1.5"/>`,
      ...lawn.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="1.3" fill="${shade(agar, 0.22)}" opacity="0.5"/>`),
      // Zones of inhibition: clear agar around each disc; the resistant disc has none.
      ...discs.filter(([, , z]) => z).map(([x, y, z]) => `<circle cx="${x}" cy="${y}" r="${z}" fill="${tint(agar, 0.5)}" stroke="${shade(agar, 0.18)}" stroke-width="1.2"/>`),
      ...discs.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#fff" stroke="#B8C6D1" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="3.5" fill="#E3E8EC"/>`),
      K.gloss(`${id}-gloss`, 78, 62, 36, 12, -40),
    ],
  };
}

function mrsa(id) {
  const M = K.MRSA, nag = C.glycan, nam = C.nam, pep = C.peptide, pbp = C.kinase, p2 = C.pbp2a, [r0, r1] = M.rows, xs = M.sugars;
  const links = [], residues = [];
  xs.filter((_, i) => i % 2).forEach(x => {
    if (!M.blocked(x)) links.push(`M${x} ${r0 + 9}V${r1 - 9}`);
    residues.push(...(M.blocked(x) ? [r0 + 14, r1 - 14] : [r0 + 15, r0 + 23, r0 + 31]).map(b => [x, b]));
  });
  const [bx, by] = M.pbp, [cx, cy] = M.pbp2a;
  const motion = ([x, y, a]) => `<path d="M${x - 14} ${y + 12}q-6 6 -2 14M${x - 6} ${y + 16}q-4 6 0 12" transform="rotate(${a} ${x} ${y})" fill="none" stroke="${C.arrow}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>`;
  return {
    defs: [K.sphereGradient(`${id}-nag`, nag, { light: 0.5 }), K.sphereGradient(`${id}-nam`, nam, { light: 0.5 }), K.sphereGradient(`${id}-pep`, pep),
      K.sphereGradient(`${id}-pbp`, pbp, { light: 0.5 }), K.sphereGradient(`${id}-pbp2a`, p2, { light: 0.5 }), K.sphereGradient(`${id}-lipid`, C.lipidHead), ...pillGradients(id)],
    body: [
      `<path d="${links.join('')}" stroke="${shade(pep, 0.25)}" stroke-width="3" stroke-linecap="round"/>`,
      ...residues.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="url(#${id}-pep)" stroke="${outline(pep)}" stroke-width="1"/>`),
      `<path d="${M.rows.map(y => `M${xs[0]} ${y}H${xs[xs.length - 1]}`).join('')}" stroke="${shade(nag, 0.4)}" stroke-width="3" stroke-linecap="round"/>`,
      ...M.rows.flatMap(y => xs.map((x, i) => `<polygon points="${hexagon(x, y, 9, 30)}" fill="url(#${id}-${i % 2 ? 'nam' : 'nag'})" stroke="${outline(i % 2 ? nam : nag)}" stroke-width="1.5" stroke-linejoin="round"/>`)),
      lipidBilayer(`${id}-lipid`, 24, 232, ...M.membrane),
      K.pipe(`M${bx} ${by + 22}V${M.membrane[0] - 4}`, pbp, 5), K.pipe(`M${cx} ${cy + 24}V${M.membrane[0] - 4}`, p2, 5),
      // A normal PBP, blocked by the β-lactam in its active site: no cross-links above it.
      `<path d="${K.smoothClosedPath(K.polarPoints(bx, by, a => 25 + 2 * Math.sin(5 * a) - 9 * Math.exp(-(K.wrapAngle(a + Math.PI / 2) ** 2) / (2 * 0.3 ** 2)), 90))}" fill="url(#${id}-pbp)" stroke="${outline(pbp)}" stroke-width="2.5"/>`,
      pill(id, bx, by - 20, 90, 1.1),
      // PBP2a: its active site is barely accessible, so the β-lactams bounce off and it carries on.
      `<path d="${K.smoothClosedPath(K.polarPoints(cx, cy, a => 28 + 3 * Math.sin(2 * a + 0.5) + 2 * Math.sin(5 * a), 90))}" fill="url(#${id}-pbp2a)" stroke="${outline(p2)}" stroke-width="2.5"/>`,
      `<path d="M${cx - 8} ${cy - 27}Q${cx} ${cy - 22} ${cx + 8} ${cy - 27}" fill="none" stroke="${outline(p2)}" stroke-width="2" stroke-linecap="round"/>`,
      ...M.free.map(([x, y, a]) => pill(id, x, y, a, 1.1) + motion([x, y, a])),
    ],
  };
}

function carbapenemase(id) {
  const X = K.CARBAPENEMASE, [o0, o1] = X.outer, [i0, i1] = X.inner, enz = C.carbapenemase, neg = C.gramNegative, por = C.porin;
  const gaps = X.porins.flatMap(x => [x - 14, x + 14]), spans = [[16, gaps[0]], [gaps[1], gaps[2]], [gaps[3], 240]];
  const enzyme = ([x, y, a]) => {
    const p = d => [x + 16 * Math.cos((a + d) * Math.PI / 180), y + 16 * Math.sin((a + d) * Math.PI / 180)].map(n).join(' ');
    return `<path d="M${x} ${y}L${p(28)}A16 16 0 1 1 ${p(-28)}Z" fill="url(#${id}-enzyme)" stroke="${outline(enz)}" stroke-width="2" stroke-linejoin="round"/>`;
  };
  // A broken carbapenem: the two halves of its capsule apart.
  const broken = ([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})">` +
    `<path d="M-3 -5H-9A5 5 0 0 0 -9 5H-3Z" fill="url(#${id}-pill-a)" stroke="${outline(C.drugRed)}" stroke-width="1.3" transform="rotate(-18)"/>` +
    `<path d="M3 -5H9A5 5 0 0 1 9 5H3Z" fill="url(#${id}-pill-b)" stroke="${outline(C.drugYellow)}" stroke-width="1.3" transform="rotate(18)"/></g>`;
  return {
    defs: [K.sphereGradient(`${id}-lipid`, C.lipidHead), K.sphereGradient(`${id}-enzyme`, enz, { light: 0.5 }), K.cylinderGradient(`${id}-porin`, por, { horizontal: true }), ...pillGradients(id)],
    body: [
      `<rect x="16" y="${o1}" width="224" height="${i0 - o1}" fill="${tint(neg, 0.82)}"/>`,
      `<path d="M16 ${i1}H240V232Q240 240 232 240H24Q16 240 16 232Z" fill="${tint(neg, 0.68)}"/>`,
      `<path d="M16 ${X.wall}H240" stroke="${shade(neg, 0.15)}" stroke-width="3" stroke-dasharray="10 4"/>`,
      ...spans.map(([a, b]) => lipidBilayer(`${id}-lipid`, a + 5, b - 5, o0, o1)),
      lipidBilayer(`${id}-lipid`, 21, 235, i0, i1),
      ...X.porins.map(x => `<rect x="${x - 13}" y="${o0 - 7}" width="26" height="${o1 - o0 + 14}" rx="7" fill="url(#${id}-porin)" stroke="${outline(por)}" stroke-width="2"/>` +
        `<rect x="${x - 4.5}" y="${o0 - 5}" width="9" height="${o1 - o0 + 10}" rx="4" fill="${tint(por, 0.6)}"/>`),
      ...X.incoming.map(([x, y, a]) => pill(id, x, y, a, 1.15)),
      ...X.broken.map(broken),
      ...X.enzymes.map(enzyme),
    ],
  };
}

function stewardship(id) {
  const S = K.STEWARDSHIP, [cx, cy, cs] = S.capsule, [ax, ay, r, a0, a1] = S.arc, [bx, by, br] = S.badge, col = C.stewardship, ok = C.heparin;
  const capsule = antibioticCapsule(id);
  const at = deg => [ax + r * Math.cos(deg * Math.PI / 180), ay + r * Math.sin(deg * Math.PI / 180)];
  // The review cycle: an arc most of the way round, ending in an arrowhead.
  const [p0, p1, tip] = [at(a0), at(a1 - 7), at(a1)], t = a1 * Math.PI / 180, [ux, uy] = [-Math.sin(t), Math.cos(t)];
  const base = [tip[0] - ux * 20, tip[1] - uy * 20], head = [tip, [base[0] - uy * 13, base[1] + ux * 13], [base[0] + uy * 13, base[1] - ux * 13]];
  const arc = `M${n(p0[0])} ${n(p0[1])}A${r} ${r} 0 1 1 ${n(p1[0])} ${n(p1[1])}`;
  return {
    defs: [...capsule.defs, K.sphereGradient(`${id}-badge`, ok, { light: 0.45 })],
    body: [
      `<path d="${arc}" fill="none" stroke="${outline(col)}" stroke-width="14" stroke-linecap="round"/><path d="${arc}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round"/>`,
      `<polygon points="${head.map(p => p.map(n).join(',')).join(' ')}" fill="${col}" stroke="${outline(col)}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<g transform="translate(${cx} ${cy}) scale(${cs}) translate(-128 -128)">`, ...capsule.body, `</g>`,
      `<circle cx="${bx}" cy="${by}" r="${br}" fill="url(#${id}-badge)" stroke="${outline(ok)}" stroke-width="${STROKE}"/>`,
      `<path d="M${bx - 11} ${by + 1}L${bx - 3} ${by + 9}L${bx + 12} ${by - 8}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
    ],
  };
}

// ------------------------------------------------------------------ organs

function brain(id) {
  // The supplied line art over a shaded fill of its own silhouette.
  const base = C.brain, art = K.ORGANS.brainArt;
  return {
    defs: [K.sphereGradient(`${id}-brain`, base, { light: 0.5 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${art.silhouette}" transform="${art.transform}" fill="url(#${id}-brain)"/>`,
      K.gloss(`${id}-gloss`, 88, 74, 30, 13),
      `<path d="${art.d}" transform="${art.transform}" fill="${shade(base, 0.45)}"/>`,
    ],
  };
}

function heart(id) {
  // The supplied line art, with each enclosed region filled: muscle red for the chambers,
  // arterial red for the aorta and pulmonary veins, venous blue for the venae cavae and
  // pulmonary arteries, and coronary vessels in yellow epicardial fat.
  const muscle = C.heartMuscle, atrium = shade(C.heartMuscle, 0.08), ink = shade(muscle, 0.6);
  const O = K.ORGANS, A = O.heartArt, R = O.heartRegions;
  const fill = (indices, grad) => indices.map(i => `<path d="${A.regions[i]}" fill="url(#${id}-${grad})"/>`).join('');
  return {
    defs: [
      `<clipPath id="${id}-trunk"><path d="${A.regions[R.trunk]}"/></clipPath>`,
      K.sphereGradient(`${id}-muscle`, muscle, { light: 0.45 }), K.sphereGradient(`${id}-atrium`, atrium, { light: 0.4 }),
      K.sphereGradient(`${id}-artery`, C.artery, { light: 0.45 }), K.sphereGradient(`${id}-vein`, C.vein, { light: 0.45 }),
      K.sphereGradient(`${id}-coronary`, C.fat, { light: 0.4 }), K.glossGradient(`${id}-gloss`),
    ],
    body: [
      `<g transform="${A.transform}">`,
      fill(R.muscle, 'muscle'),
      fill(R.atria, 'atrium'),
      fill([...R.aorta, ...R.pulmonaryVeins], 'artery'),
      fill(R.venous, 'vein'),
      fill(R.coronary, 'coronary'),
      `<path d="${O.pulmonaryTrunk}" clip-path="url(#${id}-trunk)" fill="url(#${id}-vein)"/>`,
      `</g>`,
      K.gloss(`${id}-gloss`, 84, 156, 14, 26, 20),
      `<g transform="${A.transform}" fill="${ink}">`,
      `<path d="${A.d}"/>`,
      `<path d="${O.pulmonaryTrunkBase}" fill="none" stroke="${ink}" stroke-width="1.1" stroke-linecap="round"/>`,
      `</g>`,
    ],
  };
}

function kidneys(id) {
  const k = C.kidney, pel = C.renalPelvis, bl = C.bladder;
  const kidney = 'M70 24C98 24 108 50 104 68C100 80 92 80 92 90C92 100 102 104 102 116C100 134 88 146 70 146C46 146 36 116 36 84C36 48 46 24 70 24Z';
  const pelvis = 'M98 74C86 76 80 84 82 90C80 96 86 104 98 106Z', ureter = 'M94 102C104 130 108 160 112 182';
  return {
    defs: [K.sphereGradient(`${id}-kidney`, k, { light: 0.45 }), K.sphereGradient(`${id}-bladder`, bl, { light: 0.5 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(0 -6)">`,
      ...[kidney, K.mirrorX(kidney)].map(d => `<path d="${d}" fill="url(#${id}-kidney)" stroke="${outline(k)}" stroke-width="${STROKE}"/>`),
      ...[pelvis, K.mirrorX(pelvis)].map(d => `<path d="${d}" fill="${pel}" stroke="${shade(pel, 0.3)}" stroke-width="1.5"/>`),
      K.gloss(`${id}-gloss`, 56, 52, 12, 18, 10), K.gloss(`${id}-gloss`, 186, 52, 12, 18, -10),
      K.pipe(ureter, tint(k, 0.45), 7), K.pipe(K.mirrorX(ureter), tint(k, 0.45), 7),
      K.pipe('M128 222L128 240', tint(k, 0.45), 7),
      `<path d="M86 186C86 172 104 166 128 166C152 166 170 172 170 186C170 214 152 228 128 228C104 228 86 214 86 186Z" fill="url(#${id}-bladder)" stroke="${outline(bl)}" stroke-width="${STROKE}"/>`,
      `</g>`,
    ],
  };
}

function liver(id) {
  const base = C.liver, gb = C.gallbladder;
  return {
    defs: [K.sphereGradient(`${id}-liver`, base, { light: 0.4 }), K.sphereGradient(`${id}-gb`, gb), K.glossGradient(`${id}-gloss`)],
    body: [
      `<ellipse cx="110" cy="174" rx="14" ry="22" transform="rotate(-20 110 174)" fill="url(#${id}-gb)" stroke="${outline(gb)}" stroke-width="2.5"/>`,
      `<path d="M38 108C36 74 86 58 150 60C198 62 228 76 222 98C216 122 178 148 138 166C114 176 88 182 70 172C46 158 40 134 38 108Z" fill="url(#${id}-liver)" stroke="${outline(base)}" stroke-width="${STROKE}"/>`,
      `<path d="M150 62C148 92 140 126 126 168" fill="none" stroke="${shade(base, 0.3)}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>`,
      K.gloss(`${id}-gloss`, 88, 96, 34, 14),
    ],
  };
}

function intestines(id) {
  const colon = C.colon, small = C.smallIntestine;
  const sacs = K.ORGANS.colonSacs();
  // Haustral folds: a short crease across the colon between neighbouring sacculations.
  const folds = sacs.slice(1).map(([x, y, r, a], i) => {
    const [px, py] = sacs[i], mx = (x + px) / 2, my = (y + py) / 2, t = a * Math.PI / 180, h = r * 0.85;
    return `M${n(mx - h * Math.sin(t))} ${n(my + h * Math.cos(t))}L${n(mx + h * Math.sin(t))} ${n(my - h * Math.cos(t))}`;
  });
  return {
    defs: [K.sphereGradient(`${id}-sac`, colon, { light: 0.45, dark: 0.12 })],
    body: [
      `<g transform="translate(0 -6)">`,
      K.pipe(K.smoothOpenPath(K.ORGANS.smallIntestine()), small, 12),
      K.pipe('M80 224C88 238 100 236 98 226', colon, 7),
      // Outline layer first, then fills, so the sacculations merge into one scalloped tube.
      ...sacs.map(([x, y, r]) => `<circle cx="${n(x)}" cy="${n(y)}" r="${r + 2.5}" fill="${outline(colon)}"/>`),
      ...sacs.map(([x, y, r]) => `<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="url(#${id}-sac)"/>`),
      `<path d="${folds.join('')}" stroke="${shade(colon, 0.3)}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>`,
      `</g>`,
    ],
  };
}

function skin(id) {
  const epi = C.epidermis, der = C.dermis, fat = C.fat;
  const xs = Array.from({ length: 27 }, (_, i) => 24 + i * 8);
  const surface = xs.map(x => [x, 60 + 3 * Math.sin(x / 10)]);
  const rete = xs.map(x => [x, 86 + 6 * Math.sin(x / 8)]);
  const fatTop = xs.map(x => [x, 154 + 4 * Math.sin(x / 18)]);
  const along = pts => K.smoothOpenPath(pts);
  const back = pts => 'L' + K.smoothOpenPath([...pts].reverse()).slice(1);
  const lobules = [];
  for (const [row, y] of [[0, 172], [1, 196]]) for (let x = 38 + row * 11; x <= 220; x += 23) lobules.push([x, y]);
  const coil = Array.from({ length: 40 }, (_, i) => { const a = i / 39 * 4 * Math.PI; return [180 + 9 * Math.cos(a) + i * 0.15, 146 + 6 * Math.sin(a)]; });
  return {
    defs: [
      `<linearGradient id="${id}-epi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tint(epi, 0.2)}"/><stop offset="1" stop-color="${shade(epi, 0.1)}"/></linearGradient>`,
      `<linearGradient id="${id}-der" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${der}"/><stop offset="1" stop-color="${shade(der, 0.08)}"/></linearGradient>`,
      K.sphereGradient(`${id}-fat`, fat, { light: 0.5 }),
    ],
    body: [
      `<path d="${along(fatTop)}L232 216L24 216Z" fill="${tint(fat, 0.4)}"/>`,
      ...lobules.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="url(#${id}-fat)" stroke="${shade(fat, 0.3)}" stroke-width="1.2"/>`),
      `<path d="${along(rete)}${back(fatTop)}Z" fill="url(#${id}-der)"/>`,
      `<path d="M24 128C64 116 104 138 144 124C176 114 206 130 232 122" fill="none" stroke="${C.artery}" stroke-width="5" stroke-linecap="round"/>`,
      `<path d="M24 140C64 130 104 150 144 138C176 128 206 144 232 136" fill="none" stroke="${C.vein}" stroke-width="5" stroke-linecap="round"/>`,
      `<path d="M182 62C184 90 176 118 182 140" fill="none" stroke="${tint(C.fluid, 0.1)}" stroke-width="3"/>`,
      `<path d="${K.smoothOpenPath(coil)}" fill="none" stroke="${shade(C.fluid, 0.15)}" stroke-width="3" stroke-linecap="round"/>`,
      K.pipe('M106 72L118 148', shade(der, 0.12), 12),
      `<ellipse cx="128" cy="106" rx="9" ry="7" fill="#F5E3A8" stroke="${shade('#F5E3A8', 0.35)}" stroke-width="1.2"/>`,
      `<ellipse cx="119" cy="152" rx="10" ry="12" fill="${shade(epi, 0.1)}" stroke="${outline(epi)}" stroke-width="1.5"/>`,
      `<path d="${along(surface)}${back(rete)}Z" fill="url(#${id}-epi)"/>`,
      `<path d="M92 20L118 148" stroke="${C.hair}" stroke-width="4" stroke-linecap="round"/>`,
      `<path d="${along(surface)}L232 216L24 216Z" fill="none" stroke="${outline(der)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
    ],
  };
}

function bone(id) {
  const b = C.bone;
  const shapes = attrs => `<rect x="-15" y="-72" width="30" height="144" ${attrs}/>` +
    [[-14, -84], [14, -84], [-14, 84], [14, 84]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="21" ${attrs}/>`).join('');
  return {
    defs: [
      `<linearGradient id="${id}-bone" gradientUnits="userSpaceOnUse" x1="-36" y1="0" x2="36" y2="0"><stop offset="0" stop-color="${shade(b, 0.08)}"/>` +
      `<stop offset="0.3" stop-color="${tint(b, 0.5)}"/><stop offset="0.65" stop-color="${b}"/><stop offset="1" stop-color="${shade(b, 0.2)}"/></linearGradient>`,
      K.cylinderGradient(`${id}-marrow`, C.marrow, { horizontal: true }),
    ],
    body: [
      `<g transform="translate(128 128) rotate(-40)">`,
      // Outline layer first, then fills, so the shaft and ends join seamlessly.
      shapes(`fill="${outline(b)}" stroke="${outline(b)}" stroke-width="6"`),
      shapes(`fill="url(#${id}-bone)"`),
      `<rect x="-8" y="-50" width="16" height="100" rx="8" fill="url(#${id}-marrow)" stroke="${shade(b, 0.35)}" stroke-width="1.5"/>`,
      ...[[-2, -30], [3, -8], [-3, 14], [2, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${tint(C.marrow, 0.35)}"/>`),
      `</g>`,
    ],
  };
}

function kneeJoint(id) {
  const b = C.bone, cart = C.cartilage, syn = C.synovium;
  return {
    defs: [K.cylinderGradient(`${id}-bone`, b, { horizontal: true })],
    body: [
      `<rect x="72" y="96" width="112" height="82" rx="34" fill="${syn}" opacity="0.45" stroke="${shade(syn, 0.3)}" stroke-width="2.5"/>`,
      `<rect x="176" y="172" width="13" height="66" rx="5" fill="url(#${id}-bone)" stroke="${outline(b)}" stroke-width="2.5"/>`,
      `<circle cx="182" cy="170" r="10" fill="url(#${id}-bone)" stroke="${outline(b)}" stroke-width="2.5"/>`,
      `<path d="M108 12L148 12L150 84C170 92 176 112 168 128C160 140 142 138 134 128L122 128C114 138 96 140 88 128C80 112 86 92 106 84Z" fill="url(#${id}-bone)" stroke="${outline(b)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<path d="M84 152Q84 144 128 144Q172 144 172 152L172 162Q168 178 150 186L148 238L108 238L106 186Q88 178 84 162Z" fill="url(#${id}-bone)" stroke="${outline(b)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<path d="M88 126C92 138 112 140 122 128M134 128C144 140 164 138 168 126M90 148Q128 140 166 148" fill="none" stroke="${shade(cart, 0.25)}" stroke-width="7" stroke-linecap="round"/>`,
      `<path d="M88 126C92 138 112 140 122 128M134 128C144 140 164 138 168 126M90 148Q128 140 166 148" fill="none" stroke="${cart}" stroke-width="4.5" stroke-linecap="round"/>`,
    ],
  };
}

function lymphNode(id) {
  const base = C.lymphNode, f = C.follicle, ly = C.lymph;
  const node = 'M60 128C60 74 100 52 140 56C184 60 206 90 204 112C202 124 186 124 186 136C186 148 204 152 202 166C198 194 168 208 132 206C90 204 60 180 60 128Z';
  const follicles = [[92, 96], [122, 76], [158, 80], [82, 134], [94, 170], [130, 186], [166, 178]];
  return {
    defs: [K.sphereGradient(`${id}-node`, base, { light: 0.5 }), K.sphereGradient(`${id}-follicle`, f, { light: 0.4 })],
    body: [
      ...['M34 74L66 94', 'M30 158L62 150', 'M96 24L110 58'].map(d => K.pipe(d, ly, 6)),
      K.pipe('M190 128L232 116', ly, 9), K.pipe('M192 140L234 142', C.artery, 7), K.pipe('M190 152L232 166', C.vein, 8),
      `<path d="${node}" fill="url(#${id}-node)" stroke="${outline(base)}" stroke-width="${STROKE}"/>`,
      `<path d="${node}" transform="translate(130 130) scale(0.92) translate(-130 -130)" fill="none" stroke="${tint(base, 0.45)}" stroke-width="2" opacity="0.8"/>`,
      `<path d="M128 130C150 128 170 132 186 136M126 146C150 150 170 150 188 146M130 114C150 112 166 118 186 126" fill="none" stroke="${shade(base, 0.22)}" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>`,
      ...follicles.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="url(#${id}-follicle)" stroke="${outline(f)}" stroke-width="1.5"/>` +
        `<circle cx="${x + 2}" cy="${y + 2}" r="7" fill="${tint(f, 0.55)}"/>`),
    ],
  };
}

// Curved spleen: convex diaphragmatic surface top left, concave hilum bottom right.
const SPLEEN = 'M48 168C40 112 82 52 148 42C190 36 214 58 210 84C206 96 190 96 182 108C168 128 168 150 150 168C126 192 96 208 70 204C56 200 50 186 48 168Z';

function spleen(id) {
  const base = C.spleen;
  return {
    defs: [K.sphereGradient(`${id}-spleen`, base, { light: 0.4 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${SPLEEN}" fill="url(#${id}-spleen)" stroke="${outline(base)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<path d="M66 106L80 112M96 66L106 78" stroke="${outline(base)}" stroke-width="3" stroke-linecap="round"/>`,
      K.pipe('M166 132C184 150 204 170 226 182', C.artery, 8),
      K.pipe('M158 142C176 166 196 188 216 206', C.vein, 10),
      K.gloss(`${id}-gloss`, 112, 82, 34, 13, -40),
    ],
  };
}

function thymus(id) {
  const base = C.thymus;
  // A lobulated lobe, wider at the bottom than the top.
  const lobe = (cx, rot, seed) => K.smoothClosedPath(K.polarPoints(0, 0, a =>
    K.ellipseRadius(30 + 8 * Math.max(0, Math.sin(a)), 86, a) + 2 * Math.sin(9 * a + seed), 120))
    .replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => {
      const r = rot * Math.PI / 180, [px, py] = [Number(x), Number(y)];
      return `${n(cx + px * Math.cos(r) - py * Math.sin(r))} ${n(132 + px * Math.sin(r) + py * Math.cos(r))}`;
    });
  return {
    defs: [K.sphereGradient(`${id}-thymus`, base, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      ...[[104, -8, 0.3], [152, 8, 1.9]].map(([cx, rot, seed]) =>
        `<path d="${lobe(cx, rot, seed)}" fill="url(#${id}-thymus)" stroke="${outline(base)}" stroke-width="${STROKE}"/>`),
      `<path d="M92 96C100 104 110 102 116 110M90 150C100 156 112 154 118 162M140 104C148 112 158 110 166 118M138 164C146 170 160 168 166 176" fill="none" stroke="${shade(base, 0.25)}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>`,
      K.gloss(`${id}-gloss`, 96, 84, 10, 22, 0), K.gloss(`${id}-gloss`, 144, 84, 10, 22, 0),
    ],
  };
}

function ear(id) {
  const E = K.EAR, sk = C.epidermis, me = C.middleEar, lab = C.labyrinth, b = C.bone, td = C.eardrum;
  const ring = ([x, y, rx, ry, a]) => {
    const e = `cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${x} ${y})" fill="none"`;
    return `<ellipse ${e} stroke="${outline(lab)}" stroke-width="10"/><ellipse ${e} stroke="${lab}" stroke-width="6"/>` +
      `<ellipse ${e} stroke="#fff" stroke-width="1.5" opacity="0.4"/>`;
  };
  const [vx, vy, vrx, vry] = E.vestibule, [dx, dy, drx, dry, da] = E.eardrum;
  const bone = `fill="url(#${id}-bone)" stroke="${outline(b)}" stroke-width="1.5"`;
  return {
    defs: [K.sphereGradient(`${id}-skin`, sk, { light: 0.45 }), K.sphereGradient(`${id}-air`, me, { light: 0.5 }), K.sphereGradient(`${id}-lab`, lab, { light: 0.5 }),
      K.sphereGradient(`${id}-bone`, b, { light: 0.5, dark: 0.25 })],
    body: [
      // Inner ear: the vestibulocochlear nerve, semicircular canals, cochlea and vestibule.
      K.pipe(E.nerve, C.nerve, 9),
      ...E.canals.map(ring),
      K.pipe(K.smoothOpenPath(K.cochleaPoints()), lab, 8),
      `<ellipse cx="${vx}" cy="${vy}" rx="${vrx}" ry="${vry}" fill="url(#${id}-lab)" stroke="${outline(lab)}" stroke-width="2"/>`,
      // Middle ear and Eustachian tube.
      K.pipe(E.tube, me, 12),
      `<path d="${E.cavity}" fill="${tint(me, 0.3)}" stroke="${shade(me, 0.3)}" stroke-width="1.8"/>`,
      // Ossicles: malleus on the eardrum, incus, and stapes in the oval window.
      `<path d="${E.stapes}" fill="none" stroke="${outline(b)}" stroke-width="4.5" stroke-linecap="round"/>`,
      `<path d="${E.stapes}" fill="none" stroke="${b}" stroke-width="2.5" stroke-linecap="round"/>`,
      `<path d="${E.incus}" ${bone}/>`, `<path d="${E.malleus}" ${bone}/>`,
      // Outer ear: pinna and external canal, ending at the eardrum.
      `<path d="${E.outer}" fill="url(#${id}-skin)" stroke="${outline(sk)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<path d="${E.canal}" fill="${shade(sk, 0.28)}"/>`,
      `<path d="${E.helix}${E.antihelix}" fill="none" stroke="${shade(sk, 0.3)}" stroke-width="3" stroke-linecap="round"/>`,
      `<ellipse cx="${dx}" cy="${dy}" rx="${drx}" ry="${dry}" transform="rotate(${da} ${dx} ${dy})" fill="${td}" stroke="${shade(td, 0.4)}" stroke-width="1.5"/>`,
    ],
  };
}

function eye(id) {
  const E = K.EYE, [cx, cy] = E.centre, R = E.R, [kx, ky, kr] = E.cornea, [lx, ly, lrx, lry] = E.lens;
  const at = (deg, r) => [n(cx + r * Math.cos(deg * Math.PI / 180)), n(cy + r * Math.sin(deg * Math.PI / 180))];
  // An arc round the back of the globe from -deg to deg.
  const back = (r, deg) => { const [a, b] = [at(-deg, r), at(deg, r)]; return `M${a[0]} ${a[1]}A${r} ${r} 0 1 1 ${b[0]} ${b[1]}`; };
  const [n0, ny, n1, nh] = E.nerve, inner = kr - 4, chamberY = Math.sqrt(inner * inner - (kx - 72) ** 2);
  const [v0, v1] = [at(-136, R - 12), at(136, R - 12)];
  return {
    defs: [K.sphereGradient(`${id}-sclera`, C.sclera, { light: 0.6, dark: 0.12 }), K.sphereGradient(`${id}-vitreous`, C.vitreous, { light: 0.5, dark: 0.06 }),
      K.sphereGradient(`${id}-lens`, C.lens, { light: 0.6 }), K.cylinderGradient(`${id}-nerve`, C.nerve), K.cylinderGradient(`${id}-iris`, C.iris, { horizontal: true }),
      K.glossGradient(`${id}-gloss`)],
    body: [
      ...E.muscles.map(d => K.pipe(d, C.eyeMuscle, 12)),
      `<path d="M${n0 - 6} ${ny - nh}L${n1} ${ny - nh - 2}L${n1} ${ny + nh + 2}L${n0 - 6} ${ny + nh}Z" fill="url(#${id}-nerve)" stroke="${outline(C.nerve)}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M${n0} ${ny}L${n1} ${ny}" stroke="${C.artery}" stroke-width="2" opacity="0.8"/>`,
      `<path d="${K.eyeGlobePath()}" fill="url(#${id}-sclera)" stroke="${outline(C.sclera)}" stroke-width="${STROKE}"/>`,
      `<path d="${back(R - 5, 146)}" fill="none" stroke="${C.choroid}" stroke-width="5"/>`,
      `<path d="${back(R - 9.5, 140)}" fill="none" stroke="${C.retina}" stroke-width="4"/>`,
      `<path d="${back(R - 12, 136)}L${v1[0]} ${v1[1]}L${v0[0]} ${v0[1]}Z" fill="url(#${id}-vitreous)"/>`,
      // Anterior chamber, between the cornea and the iris.
      `<path d="M72 ${n(ky - chamberY)}A${inner} ${inner} 0 0 0 72 ${n(ky + chamberY)}L78 ${n(ky + chamberY)}L78 ${n(ky - chamberY)}Z" fill="${tint(C.vitreous, 0.3)}"/>`,
      // Zonules from the ciliary body to the lens.
      `<path d="M${lx} ${ly - lry + 3}L82 90M${lx} ${ly + lry - 3}L82 166" stroke="${shade(C.sclera, 0.35)}" stroke-width="1.2"/>`,
      ...E.ciliary.map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="5" transform="rotate(${a} ${x} ${y})" fill="${shade(C.choroid, 0.1)}" stroke="${outline(C.choroid)}" stroke-width="1.2"/>`),
      `<ellipse cx="${lx}" cy="${ly}" rx="${lrx}" ry="${lry}" fill="url(#${id}-lens)" stroke="${shade(C.lens, 0.35)}" stroke-width="1.8"/>`,
      ...E.iris.map(([x0, y0, x1, y1]) => `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="3" fill="url(#${id}-iris)" stroke="${outline(C.iris)}" stroke-width="1.5"/>`),
      K.gloss(`${id}-gloss`, 60, 108, 6, 14, 15),
    ],
  };
}

function placenta(id) {
  const P = K.PLACENTA, [cx, cy, rx, ry] = P.disc, d = P.depth, pl = C.placenta, jelly = C.cordJelly, oxy = C.artery, deoxy = C.vein;
  // Maternal side, seen at the front edge, thickest in the middle and thinning to the margin,
  // with grooves between the cotyledons.
  const side = `M${cx - rx} ${cy}A${rx} ${ry + d} 0 0 0 ${cx + rx} ${cy}A${rx} ${ry} 0 0 1 ${cx - rx} ${cy}Z`;
  const grooves = [-0.6, -0.3, 0, 0.3, 0.6].map(f => { const x = cx + rx * f, k = Math.sqrt(1 - f * f); return `M${n(x)} ${n(cy + ry * k + 3)}L${n(x)} ${n(cy + (ry + d) * k - 3)}`; }).join('');
  const vessel = (dd, w, colour) => `<path d="${dd}" fill="none" stroke="${outline(colour)}" stroke-width="${w + 2.5}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${dd}" fill="none" stroke="${colour}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // The cord's vessels coil round its centreline: two arteries (deoxygenated, blue) and a vein.
  const line = K.densify(P.cord, 14), N = line.length;
  let s = 0;
  const frames = line.map((p, i) => {
    if (i) s += Math.hypot(p[0] - line[i - 1][0], p[1] - line[i - 1][1]);
    const [a, b] = [line[Math.max(0, i - 1)], line[Math.min(N - 1, i + 1)]], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return { p, s, nx: -(b[1] - a[1]) / l, ny: (b[0] - a[0]) / l };
  });
  const helix = (phase, amp) => K.smoothOpenPath(frames.slice(3, N - 2).map(({ p, s, nx, ny }) => [p[0] + nx * amp * Math.sin(s / 12 + phase), p[1] + ny * amp * Math.sin(s / 12 + phase)]));
  const end = frames[N - 1], endDeg = n(Math.atan2(end.ny, end.nx) * 180 / Math.PI);
  return {
    defs: [K.sphereGradient(`${id}-plate`, C.chorionicPlate, { light: 0.5 }), K.sphereGradient(`${id}-cord`, jelly, { light: 0.6 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<path d="${side}" fill="${shade(pl, 0.1)}" stroke="${outline(pl)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<path d="${grooves}" stroke="${shade(pl, 0.4)}" stroke-width="2" stroke-linecap="round"/>`,
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id}-plate)" stroke="${outline(pl)}" stroke-width="${STROKE}"/>`,
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx - 7}" ry="${ry - 5}" fill="none" stroke="${tint(C.chorionicPlate, 0.4)}" stroke-width="2" opacity="0.8"/>`,
      // Chorionic vessels: each vein (red) beside its artery (blue), which crosses over it.
      ...P.vessels.map(([a, r]) => vessel(K.placentaVessel(a, r, 3), 4.5, oxy)),
      ...P.vessels.map(([a, r]) => vessel(K.placentaVessel(a, r, -3), 3.5, deoxy)),
      K.gloss(`${id}-gloss`, cx - 46, cy - 24, 30, 9, -8),
      `<ellipse cx="${P.insertion[0]}" cy="${P.insertion[1] + 2}" rx="17" ry="9" fill="${shade(jelly, 0.15)}" stroke="${shade(jelly, 0.4)}" stroke-width="2"/>`,
      `<path d="${K.wormOutline(P.cord, () => P.cordWidth)}" fill="url(#${id}-cord)" stroke="${shade(jelly, 0.4)}" stroke-width="2.5" stroke-linejoin="round"/>`,
      vessel(helix(0, 8), 5, deoxy), vessel(helix(2.1, 8), 5, deoxy), vessel(helix(4.2, 7), 6, oxy),
      // The cut end of the cord: jelly round two arteries and the vein.
      `<g transform="translate(${n(end.p[0])} ${n(end.p[1])}) rotate(${endDeg})">` +
      `<ellipse rx="${P.cordWidth / 2}" ry="7" fill="${tint(jelly, 0.3)}" stroke="${shade(jelly, 0.4)}" stroke-width="2"/>` +
      [[-6, 0, 3, deoxy], [6, 0, 3, deoxy], [0, 1, 3.8, oxy]].map(([x, y, r, c]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${n(r * 0.6)}" fill="${c}" stroke="${outline(c)}" stroke-width="1"/>`).join('') + `</g>`,
    ],
  };
}

function heartValve(id) {
  const V = K.HEART_VALVE, [cx, cy] = V.centre, { R, inner } = V, tissue = C.valveTissue, ring = C.annulus, veg = C.vegetation;
  const at = (deg, r) => [n(cx + r * Math.cos(deg * Math.PI / 180)), n(cy + r * Math.sin(deg * Math.PI / 180))];
  const [a0, a1, a2] = V.commissures, sectors = [[a0, a1], [a1, a2], [a2, a0 + 360]];
  const rand = K.rng(83);
  return {
    defs: [K.sphereGradient(`${id}-ring`, ring, { light: 0.4 }), K.sphereGradient(`${id}-cusp`, tissue, { light: 0.6, dark: 0.12 }), K.sphereGradient(`${id}-veg`, veg, { light: 0.45 })],
    body: [
      `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${id}-ring)" stroke="${outline(ring)}" stroke-width="${STROKE}"/>`,
      // Three cusps meeting along their closure lines.
      ...sectors.map(([s, e]) => { const [p, q] = [at(s, inner), at(e, inner)]; return `<path d="M${cx} ${cy}L${p[0]} ${p[1]}A${inner} ${inner} 0 0 1 ${q[0]} ${q[1]}Z" fill="url(#${id}-cusp)" stroke="${shade(tissue, 0.3)}" stroke-width="2" stroke-linejoin="round"/>`; }),
      `<path d="${V.commissures.map(a => { const p = at(a, inner); return `M${cx} ${cy}L${p[0]} ${p[1]}`; }).join('')}" stroke="${shade(tissue, 0.45)}" stroke-width="3" stroke-linecap="round"/>`,
      // Vegetations on the closure lines, studded with bacteria.
      ...V.vegetations.map((v, k) => `<path d="${K.vegetationPath(v, k + 1)}" fill="url(#${id}-veg)" stroke="${outline(veg)}" stroke-width="2"/>` +
        Array.from({ length: Math.round(v[2] * 0.6) }, () => { const a = rand() * 2 * Math.PI, d = rand() * v[2] * 0.7; return `<circle cx="${n(v[0] + d * Math.cos(a))}" cy="${n(v[1] + d * Math.sin(a))}" r="2.2" fill="${C.gramPositive}" stroke="${outline(C.gramPositive)}" stroke-width="0.6"/>`; }).join('')),
    ],
  };
}

function meninges(id) {
  const M = K.MENINGES, [fx, fy, fw, fh, fr] = M.frame, [vx, vy, vr] = M.vessel;
  const band = ([y0, y1], fill) => `<rect x="${fx}" y="${y0}" width="${fw}" height="${y1 - y0}" fill="${fill}"/>`;
  const rand = K.rng(17), diploe = [];
  for (let k = 0; k < 26; k++) diploe.push(`<ellipse cx="${n(22 + rand() * 212)}" cy="${n(44 + rand() * 18)}" rx="${n(3 + rand() * 3)}" ry="${n(2 + rand() * 2)}" fill="${tint(C.marrow, 0.55)}" opacity="0.8"/>`);
  const trabeculae = M.trabeculae.map(x => `M${x} ${M.arachnoid + 2}C${x + 5} ${M.arachnoid + 8} ${x - 5} ${M.arachnoid + 16} ${x + 1} 116`).join('');
  return {
    defs: [`<clipPath id="${id}-frame"><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="${fr}"/></clipPath>`,
      K.cylinderGradient(`${id}-bone`, C.bone), K.cylinderGradient(`${id}-dura`, C.dura), K.sphereGradient(`${id}-cortex`, C.cortex, { light: 0.4, dark: 0.08 })],
    body: [
      `<g clip-path="url(#${id}-frame)">`,
      band(M.scalp, C.scalp), band(M.skull, `url(#${id}-bone)`), ...diploe, band(M.dura, `url(#${id}-dura)`),
      band([M.dura[1], fy + fh], C.csf),
      // Arachnoid with trabeculae across the subarachnoid space, and a vessel in the CSF.
      `<path d="${trabeculae}" fill="none" stroke="${shade(C.arachnoid, 0.2)}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<path d="M${fx} ${M.arachnoid}H${fx + fw}" stroke="${shade(C.arachnoid, 0.15)}" stroke-width="3.5"/>`,
      `<circle cx="${vx}" cy="${vy}" r="${vr}" fill="${C.artery}" stroke="${outline(C.artery)}" stroke-width="2"/>`,
      // Cortex covered by the pia, following it into a sulcus; white matter beneath.
      `<path d="${M.cortex}L240 240L16 240Z" fill="url(#${id}-cortex)"/>`,
      `<path d="${M.whiteMatter}L240 240L16 240Z" fill="${C.whiteMatter}"/>`,
      `<path d="${M.whiteMatter}" fill="none" stroke="${shade(C.cortex, 0.12)}" stroke-width="1.5" opacity="0.7"/>`,
      `<path d="${M.cortex}" fill="none" stroke="${shade(C.cortex, 0.35)}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M${fx} ${M.scalp[1]}H${fx + fw}M${fx} ${M.skull[1]}H${fx + fw}M${fx} ${M.dura[1]}H${fx + fw}" stroke="#000" stroke-opacity="0.2" stroke-width="1.5"/>`,
      `</g>`,
      `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="${fr}" fill="none" stroke="${shade(C.dura, 0.45)}" stroke-width="${STROKE}"/>`,
    ],
  };
}

// --------------------------------------------------------------- treatment

const glassGradient = id =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D5E1E9"/>` +
  `<stop offset="0.3" stop-color="#F7FBFD"/><stop offset="0.7" stop-color="#DCE6ED"/><stop offset="1" stop-color="#BACBD7"/></linearGradient>`;

function vaccine(id) {
  const edge = C.plasticEdge, cap = C.vialCap;
  const vial = 'M44 108Q44 94 58 90L60 80L88 80L90 90Q104 94 104 108L104 200Q104 210 94 210L54 210Q44 210 44 200Z';
  return {
    defs: [
      `<clipPath id="${id}-clip"><path d="${vial}"/></clipPath>`, glassGradient(`${id}-glass`),
      K.cylinderGradient(`${id}-cap`, cap, { horizontal: true }), K.cylinderGradient(`${id}-crimp`, '#B9C3CC', { horizontal: true }),
      K.cylinderGradient(`${id}-rod`, C.plunger), K.cylinderGradient(`${id}-liquid`, C.fluid),
    ],
    body: [
      `<path d="${vial}" fill="url(#${id}-glass)"/>`,
      `<g clip-path="url(#${id}-clip)"><rect x="40" y="128" width="70" height="86" fill="${tint(C.fluid, 0.2)}"/>` +
      `<line x1="40" y1="128" x2="108" y2="128" stroke="#fff" stroke-width="2" opacity="0.8"/></g>`,
      `<rect x="50" y="98" width="5" height="100" rx="2.5" fill="#fff" opacity="0.5"/>`,
      `<rect x="50" y="146" width="48" height="38" rx="2" fill="#fff" stroke="#C9D6DF" stroke-width="1.5"/>`,
      `<path d="M50 155V148a2 2 0 0 1 2-2h44a2 2 0 0 1 2 2v7Z" fill="${cap}"/>`,
      ...[[164, 32], [172, 24]].map(([y, w]) => `<rect x="56" y="${y}" width="${w}" height="3.5" rx="1.75" fill="#B8C6D1"/>`),
      `<path d="${vial}" fill="none" stroke="${edge}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<rect x="60" y="68" width="28" height="14" rx="3" fill="url(#${id}-crimp)" stroke="${shade('#B9C3CC', 0.35)}" stroke-width="2"/>`,
      `<rect x="56" y="50" width="36" height="20" rx="5" fill="url(#${id}-cap)" stroke="${outline(cap)}" stroke-width="2.5"/>`,
      // Syringe, needle towards the top right.
      `<g transform="translate(160 140) rotate(-45)">`,
      `<rect x="-100" y="-4" width="50" height="8" fill="url(#${id}-rod)" stroke="${outline(C.plunger)}" stroke-width="1.5"/>`,
      `<rect x="-106" y="-16" width="8" height="32" rx="3" fill="${C.plunger}" stroke="${outline(C.plunger)}" stroke-width="2"/>`,
      `<line x1="56" y1="0" x2="96" y2="0" stroke="${outline(C.plunger)}" stroke-width="4" stroke-linecap="round"/>`,
      `<line x1="56" y1="0" x2="96" y2="0" stroke="#D4DBE1" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M44 -8L54 -5L54 5L44 8Z" fill="${tint(cap, 0.35)}" stroke="${outline(cap)}" stroke-width="2" stroke-linejoin="round"/>`,
      `<rect x="-56" y="-14" width="100" height="28" rx="4" fill="${C.plastic}" opacity="0.9"/>`,
      `<rect x="-10" y="-11" width="52" height="22" rx="2" fill="url(#${id}-liquid)"/>`,
      `<rect x="-17" y="-12" width="8" height="24" rx="2" fill="${C.shoe}"/>`,
      `<g stroke="${edge}" stroke-width="1.2">` + Array.from({ length: 10 }, (_, i) => `<line x1="${-44 + i * 8}" y1="-14" x2="${-44 + i * 8}" y2="${i % 2 ? -9 : -5}"/>`).join('') + `</g>`,
      `<rect x="-56" y="-14" width="100" height="28" rx="4" fill="none" stroke="${edge}" stroke-width="2.5"/>`,
      `<rect x="-62" y="-24" width="7" height="48" rx="3" fill="${C.plastic}" stroke="${edge}" stroke-width="2"/>`,
      `<rect x="-48" y="6" width="86" height="4" rx="2" fill="#fff" opacity="0.55"/>`,
      `</g>`,
    ],
  };
}

function oralSuspension(id) {
  const edge = C.plasticEdge, amber = C.amberGlass, purple = C.oralPlunger;
  const bottle = 'M62 104Q62 86 80 82L84 70L130 70L134 82Q152 86 152 104L152 216Q152 228 140 228L74 228Q62 228 62 216Z';
  return {
    defs: [
      `<linearGradient id="${id}-amber" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(amber, 0.15)}"/>` +
      `<stop offset="0.3" stop-color="${tint(amber, 0.25)}"/><stop offset="0.7" stop-color="${amber}"/><stop offset="1" stop-color="${shade(amber, 0.3)}"/></linearGradient>`,
      K.cylinderGradient(`${id}-cap`, '#F2F2F2', { horizontal: true }), K.cylinderGradient(`${id}-rod`, purple, { horizontal: true }),
    ],
    body: [
      `<path d="${bottle}" fill="url(#${id}-amber)" stroke="${outline(amber)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<rect x="70" y="96" width="6" height="120" rx="3" fill="#fff" opacity="0.35"/>`,
      `<rect x="70" y="122" width="74" height="70" rx="3" fill="#fff" stroke="#C9D6DF" stroke-width="1.5"/>`,
      `<path d="M70 134V125a3 3 0 0 1 3-3h68a3 3 0 0 1 3 3v9Z" fill="${C.labelAccent}"/>`,
      ...[[146, 50], [156, 40], [166, 54], [176, 34]].map(([y, w]) => `<rect x="78" y="${y}" width="${w}" height="4" rx="2" fill="#B8C6D1"/>`),
      `<rect x="78" y="34" width="58" height="38" rx="6" fill="url(#${id}-cap)" stroke="#A7B1BA" stroke-width="2.5"/>`,
      `<g stroke="#C6CED5" stroke-width="1.2">` + Array.from({ length: 10 }, (_, i) => `<line x1="${84 + i * 5}" y1="40" x2="${84 + i * 5}" y2="66"/>`).join('') + `</g>`,
      // Oral dosing syringe, tip down.
      `<g transform="translate(196 132) rotate(12)">`,
      `<rect x="-4" y="-98" width="8" height="90" fill="url(#${id}-rod)" stroke="${outline(purple)}" stroke-width="1.5"/>`,
      `<rect x="-15" y="-104" width="30" height="8" rx="3" fill="${purple}" stroke="${outline(purple)}" stroke-width="2"/>`,
      `<rect x="-4" y="48" width="8" height="16" rx="2" fill="${C.plastic}" stroke="${edge}" stroke-width="2"/>`,
      `<rect x="-12" y="-70" width="24" height="120" rx="4" fill="${C.plastic}" opacity="0.9"/>`,
      `<rect x="-9" y="-4" width="18" height="51" rx="2" fill="${C.suspension}"/>`,
      `<rect x="-10" y="-12" width="20" height="8" rx="2" fill="${shade(purple, 0.25)}"/>`,
      `<g stroke="${edge}" stroke-width="1.2">` + Array.from({ length: 11 }, (_, i) => `<line x1="${i % 2 ? 4 : 0}" y1="${-60 + i * 10}" x2="12" y2="${-60 + i * 10}"/>`).join('') + `</g>`,
      `<rect x="-12" y="-70" width="24" height="120" rx="4" fill="none" stroke="${edge}" stroke-width="2.5"/>`,
      `<rect x="-20" y="-76" width="40" height="7" rx="3" fill="${C.plastic}" stroke="${edge}" stroke-width="2"/>`,
      `<rect x="-8" y="-64" width="4" height="108" rx="2" fill="#fff" opacity="0.5"/>`,
      `</g>`,
    ],
  };
}

function antibioticCapsule(id) {
  const cap = 'M12 -34L-58 -34A34 34 0 0 0 -58 34L12 34Q16 34 16 30L16 -30Q16 -34 12 -34Z';
  return {
    defs: [K.cylinderGradient(`${id}-cap`, C.drugRed), K.cylinderGradient(`${id}-body`, C.drugYellow)],
    body: [
      `<g transform="translate(128 128) rotate(-35)">`,
      `<rect x="-6" y="-31" width="98" height="62" rx="31" fill="url(#${id}-body)" stroke="${outline(C.drugYellow)}" stroke-width="${STROKE}"/>`,
      `<path d="${cap}" fill="url(#${id}-cap)" stroke="${outline(C.drugRed)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<rect x="-76" y="-25" width="150" height="9" rx="4.5" fill="#fff" opacity="0.45"/>`,
      `</g>`,
    ],
  };
}

function ivBag(id) {
  const edge = C.plasticEdge;
  const bag = 'M76 48Q76 30 94 30L162 30Q180 30 180 48L180 166Q180 186 160 192L140 198L116 198L96 192Q76 186 76 166Z';
  const surface = 'M70 78Q128 72 186 78';
  const ports = [[117, 16], [131, 12]].map(([x, h]) =>
    `<rect x="${x}" y="194" width="9" height="${h}" rx="2" fill="${tint(edge, 0.6)}" stroke="${edge}" stroke-width="1.5"/>`);
  const tube = 'M121 234C121 248 146 250 166 242S204 228 222 236';
  return {
    defs: [
      `<clipPath id="${id}-clip"><path d="${bag}"/></clipPath>`,
      `<linearGradient id="${id}-fluid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tint(C.fluid, 0.35)}"/>` +
      `<stop offset="0.5" stop-color="${C.fluid}"/><stop offset="1" stop-color="${shade(C.fluid, 0.08)}"/></linearGradient>`,
    ],
    body: [
      `<path d="M114 10h28a6 6 0 0 1 6 6v18h-40v-18a6 6 0 0 1 6-6zM120 20a8 4 0 1 0 16 0a8 4 0 1 0 -16 0z" fill-rule="evenodd" fill="${C.plastic}" stroke="${edge}" stroke-width="2.5"/>`,
      ...ports,
      `<path d="${tube}" fill="none" stroke="${edge}" stroke-width="5.5" stroke-linecap="round"/>`,
      `<path d="${tube}" fill="none" stroke="${tint(C.fluid, 0.3)}" stroke-width="2.5" stroke-linecap="round"/>`,
      `<rect x="111" y="208" width="20" height="26" rx="5" fill="${C.plastic}" stroke="${edge}" stroke-width="2"/>`,
      `<rect x="113" y="222" width="16" height="10" rx="3" fill="${C.fluid}"/>`,
      `<ellipse cx="121" cy="214" rx="2" ry="3" fill="${C.fluid}"/>`,
      `<path d="${bag}" fill="${C.plastic}"/>`,
      `<g clip-path="url(#${id}-clip)"><path d="${surface}L186 204L70 204Z" fill="url(#${id}-fluid)"/>` +
      `<path d="${surface}" fill="none" stroke="#fff" stroke-width="2" opacity="0.7"/></g>`,
      `<g stroke="${edge}" stroke-width="1.5" stroke-linecap="round">` +
      [92, 110, 128, 146, 164].map(y => `<line x1="164" y1="${y}" x2="172" y2="${y}"/>`).join('') + `</g>`,
      `<rect x="90" y="96" width="62" height="58" rx="4" fill="#fff" stroke="#C9D6DF" stroke-width="1.5"/>`,
      `<path d="M90 109V100a4 4 0 0 1 4-4h54a4 4 0 0 1 4 4v9Z" fill="${C.labelAccent}"/>`,
      ...[[118, 46], [128, 36], [138, 42]].map(([y, w]) => `<rect x="98" y="${y}" width="${w}" height="4" rx="2" fill="#B8C6D1"/>`),
      `<path d="${bag}" fill="none" stroke="${edge}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<rect x="84" y="40" width="7" height="136" rx="3.5" fill="#fff" opacity="0.55"/>`,
    ],
  };
}

function mrnaVaccine(id) {
  const R = 74, head = C.lipidHead;
  const rand = K.rng(81), dots = [];
  for (let tries = 0; dots.length < 18 && tries < 4000; tries++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 56, p = [128 + d * Math.cos(a), 128 + d * Math.sin(a)];
    if (dots.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 18)) dots.push(p);
  }
  const strand = Array.from({ length: 181 }, (_, i) => {
    const t = i / 180, a = t * 2 * Math.PI * 1.6 + 0.3, r = 26 + 14 * Math.sin(3 * a + 1);
    return [128 + r * Math.cos(a), 128 + r * Math.sin(a)];
  });
  const at = (a, r) => [128 + r * Math.cos(a), 128 + r * Math.sin(a)];
  const heads = Array.from({ length: 40 }, (_, k) => k * 2 * Math.PI / 40);
  const peg = [0.3, 1.1, 1.9, 2.7, 3.5, 4.3, 5.1, 5.9].map(a => {
    const pts = Array.from({ length: 9 }, (_, i) => { const r = R + 5 + i * 2.7, w = 3 * Math.sin(i * 1.4); return [128 + r * Math.cos(a) - w * Math.sin(a), 128 + r * Math.sin(a) + w * Math.cos(a)]; });
    return K.smoothOpenPath(pts);
  });
  return {
    defs: [K.sphereGradient(`${id}-lipid`, head), K.sphereGradient(`${id}-core`, C.lnpInterior, { light: 0.4, dark: 0.06 })],
    body: [
      `<path d="${peg.join('')}" fill="none" stroke="${C.peg}" stroke-width="2.5" stroke-linecap="round"/>`,
      `<circle cx="128" cy="128" r="${R - 6}" fill="url(#${id}-core)"/>`,
      ...dots.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="3" fill="${tint(head, 0.3)}" stroke="${shade(head, 0.2)}" stroke-width="0.8"/>`),
      `<path d="${K.smoothOpenPath(strand)}" fill="none" stroke="${outline(C.mrna)}" stroke-width="6" stroke-linecap="round"/>`,
      `<path d="${K.smoothOpenPath(strand)}" fill="none" stroke="${C.mrna}" stroke-width="3.5" stroke-linecap="round"/>`,
      `<path d="${heads.map(a => { const [p, q] = [at(a - 0.03, R - 4), at(a - 0.03, R - 15)], [r, s] = [at(a + 0.03, R - 4), at(a + 0.03, R - 15)]; return `M${n(p[0])} ${n(p[1])}L${n(q[0])} ${n(q[1])}M${n(r[0])} ${n(r[1])}L${n(s[0])} ${n(s[1])}`; }).join('')}" stroke="${C.lipidTail}" stroke-width="1.6" stroke-linecap="round"/>`,
      ...heads.map(a => { const [x, y] = at(a, R); return `<circle cx="${n(x)}" cy="${n(y)}" r="5.5" fill="url(#${id}-lipid)" stroke="${outline(head)}" stroke-width="1"/>`; }),
    ],
  };
}

const { hexagon } = K;

function cellWallAntibiotic(id) {
  const P = K.PEPTIDOGLYCAN, nag = C.glycan, nam = C.nam, pep = C.peptide, pbp = C.kinase;
  const [rows, xs] = [P.rows, P.sugars];
  // Peptide stems hang from each NAM; between rows they join as cross-links unless the PBP is blocked.
  const links = [], residues = [];
  rows.slice(0, -1).forEach((y, row) => xs.filter((_, i) => i % 2).forEach(x => {
    const y1 = rows[row + 1], blocked = P.blocked(x, row);
    if (!blocked) links.push(`M${x} ${y + 9}V${y1 - 9}`);
    residues.push(...(blocked ? [y + 14, y1 - 14] : [y + 15, y + 23, y + 31]).map(b => [x, b]));
  }));
  const [bx, by] = P.pbp;
  return {
    defs: [K.sphereGradient(`${id}-nag`, nag, { light: 0.5 }), K.sphereGradient(`${id}-nam`, nam, { light: 0.5 }), K.sphereGradient(`${id}-pep`, pep),
      K.sphereGradient(`${id}-pbp`, pbp, { light: 0.5 }), ...pillGradients(id)],
    body: [
      `<path d="${links.join('')}" stroke="${shade(pep, 0.25)}" stroke-width="3" stroke-linecap="round"/>`,
      ...residues.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="url(#${id}-pep)" stroke="${outline(pep)}" stroke-width="1"/>`),
      `<path d="${rows.map(y => `M${xs[0]} ${y}H${xs[xs.length - 1]}`).join('')}" stroke="${shade(nag, 0.4)}" stroke-width="3" stroke-linecap="round"/>`,
      ...rows.flatMap(y => xs.map((x, i) => `<polygon points="${hexagon(x, y, 9, 30)}" fill="url(#${id}-${i % 2 ? 'nam' : 'nag'})" stroke="${outline(i % 2 ? nam : nag)}" stroke-width="1.5" stroke-linejoin="round"/>`)),
      // Penicillin-binding protein with a β-lactam in its active site, so no cross-links form here.
      `<path d="${K.smoothClosedPath(K.polarPoints(bx, by, a => 25 + 2 * Math.sin(5 * a) - 8 * Math.exp(-(K.wrapAngle(a + 2.4) ** 2) / (2 * 0.3 ** 2)), 90))}" fill="url(#${id}-pbp)" stroke="${outline(pbp)}" stroke-width="2.5"/>`,
      pill(id, bx - 20, by - 16, 40, 1.1),
      pill(id, 60, 40, 15, 1.2), pill(id, 150, 34, -20, 1.2), pill(id, 210, 46, 25, 1.2),
    ],
  };
}

function conjugateVaccine(id) {
  const carrier = C.toxin, sugar = C.glycan, link = C.disulphide, cx = 128, cy = 140;
  const rand = K.rng(101), dimples = [];
  for (let tries = 0; dimples.length < 10 && tries < 4000; tries++) {
    const a = rand() * 2 * Math.PI, d = Math.sqrt(rand()) * 34, p = [cx + d * Math.cos(a), cy + d * Math.sin(a)];
    if (dimples.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 15)) dimples.push(p);
  }
  // Each chain bends a little as it leaves the protein.
  const chains = K.CONJUGATE_CHAINS.map(([deg, count]) => Array.from({ length: count }, (_, k) => {
    const a = (deg + k * 7) * Math.PI / 180, r = 64 + k * 17;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a), deg + k * 7];
  }));
  return {
    defs: [K.sphereGradient(`${id}-carrier`, carrier, { light: 0.5 }), K.sphereGradient(`${id}-a`, sugar, { light: 0.5 }), K.sphereGradient(`${id}-b`, tint(sugar, 0.4), { light: 0.5 })],
    body: [
      `<path d="${chains.map(ch => { const [[x, y, d]] = ch, a = d * Math.PI / 180; return `M${n(cx + 44 * Math.cos(a))} ${n(cy + 44 * Math.sin(a))}` + ch.map(([px, py]) => `L${n(px)} ${n(py)}`).join(''); }).join('')}" fill="none" stroke="${shade(sugar, 0.4)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="${K.smoothClosedPath(K.polarPoints(cx, cy, a => 46 + 4 * Math.sin(5 * a + 1) + 2 * Math.sin(9 * a), 120))}" fill="url(#${id}-carrier)" stroke="${outline(carrier)}" stroke-width="${STROKE}"/>`,
      ...dimples.map(([x, y]) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(3 + rand() * 2)}" fill="${shade(carrier, 0.12)}" opacity="0.5"/>`),
      // Covalent links from the protein to each polysaccharide.
      ...chains.map(([[, , d]]) => { const a = d * Math.PI / 180; return `<circle cx="${n(cx + 52 * Math.cos(a))}" cy="${n(cy + 52 * Math.sin(a))}" r="4.5" fill="${link}" stroke="${outline(link)}" stroke-width="1.2"/>`; }),
      ...chains.flatMap(ch => ch.map(([x, y, d], k) => `<polygon points="${hexagon(x, y, 7.5, d)}" fill="url(#${id}-${k % 2 ? 'b' : 'a'})" stroke="${outline(sugar)}" stroke-width="1.5" stroke-linejoin="round"/>`)),
    ],
  };
}

function viralVectorVaccine(id) {
  const base = C.capsid, S = 64;
  const { vertices: V, visibleVertices: shown } = K.icosahedron();
  const project = v => [128 + S * v[0], 128 - S * v[1]];
  const shaft = v => {
    const [x0, y0] = project(v), [x1, y1] = project(v.map(x => x * 1.5));
    const l = `x1="${n(x0)}" y1="${n(y0)}" x2="${n(x1)}" y2="${n(y1)}" stroke-linecap="round"`;
    return `<line ${l} stroke="${outline(C.fibre)}" stroke-width="5.5"/><line ${l} stroke="${C.fibre}" stroke-width="3"/>`;
  };
  const knob = v => { const [x, y] = project(v.map(c => c * 1.5)); return `<circle cx="${n(x)}" cy="${n(y)}" r="6.5" fill="url(#${id}-knob)" stroke="${outline(C.penton)}" stroke-width="1.5"/>`; };
  // The DNA genome inside, with the inserted gene for the target antigen in red.
  const genome = Array.from({ length: 161 }, (_, i) => {
    const a = i / 160 * 2 * Math.PI * 1.7 + 0.4, r = 24 + 12 * Math.sin(3 * a + 0.5);
    return [128 + r * Math.cos(a), 128 + r * Math.sin(a)];
  });
  const insert = genome.slice(70, 104);
  const backV = V.filter((v, i) => !shown.has(i)), frontV = V.filter((v, i) => shown.has(i));
  return {
    defs: [K.sphereGradient(`${id}-knob`, C.penton)],
    body: [
      ...backV.map(v => shaft(v) + knob(v)),
      // The capsid is drawn see-through so the genome shows.
      `<g opacity="0.5">`, ...capsidFacets(base, S), `</g>`,
      `<path d="${K.smoothOpenPath(genome)}" fill="none" stroke="${outline(C.nucleus)}" stroke-width="5.5" stroke-linecap="round"/>`,
      `<path d="${K.smoothOpenPath(genome)}" fill="none" stroke="${C.nucleus}" stroke-width="3" stroke-linecap="round"/>`,
      `<path d="${K.smoothOpenPath(insert)}" fill="none" stroke="${outline(C.spike)}" stroke-width="7.5" stroke-linecap="round"/>`,
      `<path d="${K.smoothOpenPath(insert)}" fill="none" stroke="${C.spike}" stroke-width="5" stroke-linecap="round"/>`,
      ...frontV.map(shaft), ...frontV.map(knob),
    ],
  };
}

function monoclonalAntibody(id) {
  const S = K.MAB_SYRINGE, [x, y, a] = S.at, [b0, b1, h] = S.barrel, edge = C.plasticEdge;
  return {
    defs: [K.sphereGradient(`${id}-heavy`, C.heavyChain, { light: 0.5 }), K.sphereGradient(`${id}-light`, C.lightChain, { light: 0.5 }),
      K.cylinderGradient(`${id}-rod`, C.plunger), K.cylinderGradient(`${id}-liquid`, C.fluid)],
    body: [
      `<g transform="translate(76 98) rotate(-16) scale(0.62)">${antibodyUnit(id)}</g>`,
      // Pre-filled syringe, needle towards the top right; antibody in the solution.
      `<g transform="translate(${x} ${y}) rotate(${a})">`,
      `<rect x="${S.plunger + 6}" y="-4" width="${b0 - S.plunger}" height="8" fill="url(#${id}-rod)" stroke="${outline(C.plunger)}" stroke-width="1.5"/>`,
      `<rect x="${S.plunger}" y="-16" width="8" height="32" rx="3" fill="${C.plunger}" stroke="${outline(C.plunger)}" stroke-width="2"/>`,
      `<line x1="${b1 + 12}" y1="0" x2="${S.needle}" y2="0" stroke="${outline(C.plunger)}" stroke-width="4" stroke-linecap="round"/>`,
      `<line x1="${b1 + 12}" y1="0" x2="${S.needle}" y2="0" stroke="#D4DBE1" stroke-width="2" stroke-linecap="round"/>`,
      `<path d="M${b1} -8L${b1 + 14} -5L${b1 + 14} 5L${b1} 8Z" fill="${C.plastic}" stroke="${edge}" stroke-width="2" stroke-linejoin="round"/>`,
      `<rect x="${b0}" y="${-h}" width="${b1 - b0}" height="${2 * h}" rx="4" fill="${C.plastic}" opacity="0.9"/>`,
      `<rect x="${b0 + 10}" y="${-h + 3}" width="${b1 - b0 - 13}" height="${2 * h - 6}" rx="2" fill="url(#${id}-liquid)"/>`,
      ...[[-24, 70], [-2, -110], [20, 40]].map(([px, rot]) => miniAntibody(px, 3, rot, 0.62)),
      `<rect x="${b0 + 3}" y="${-h + 2}" width="8" height="${2 * h - 4}" rx="2" fill="${C.shoe}"/>`,
      `<g stroke="${edge}" stroke-width="1.2">` + Array.from({ length: 8 }, (_, i) => `<line x1="${b0 + 18 + i * 10}" y1="${-h}" x2="${b0 + 18 + i * 10}" y2="${i % 2 ? -h + 4 : -h + 7}"/>`).join('') + `</g>`,
      `<rect x="${b0}" y="${-h}" width="${b1 - b0}" height="${2 * h}" rx="4" fill="none" stroke="${edge}" stroke-width="2.5"/>`,
      `<rect x="${b0 - 7}" y="-26" width="7" height="52" rx="3" fill="${C.plastic}" stroke="${edge}" stroke-width="2"/>`,
      `<rect x="${b0 + 6}" y="${h - 6}" width="${b1 - b0 - 12}" height="3" rx="1.5" fill="#fff" opacity="0.55"/>`,
      `</g>`,
    ],
  };
}

function nasalSprayVaccine(id) {
  const N = K.NASAL_SPRAY, [x, y, a, s] = N.at, edge = C.plasticEdge, flu = C.fluEnvelope;
  const from = (d, deg) => N.from(d, deg), tip = from(0, 0);
  const { spread, reach } = N.plume, [l, r] = [from(reach, -spread), from(reach, spread)];
  const rand = K.rng(71), mist = [];
  for (let k = 0; k < 46; k++) {
    const d = 8 + Math.sqrt(rand()) * (reach - 12), [px, py] = from(d, (rand() * 2 - 1) * spread * 0.9);
    mist.push(`<circle cx="${n(px)}" cy="${n(py)}" r="${n(1.2 + rand() * 2.2)}" fill="${tint(C.fluid, 0.3)}" stroke="${shade(C.fluid, 0.25)}" stroke-width="0.8"/>`);
  }
  // Live attenuated influenza virions in the spray.
  const virion = ([d, deg, rv]) => {
    const [vx, vy] = from(d, deg);
    const spikes = Array.from({ length: 12 }, (_, k) => { const b = k / 12 * 2 * Math.PI; return `M${n(vx + rv * Math.cos(b))} ${n(vy + rv * Math.sin(b))}L${n(vx + (rv + 4) * Math.cos(b))} ${n(vy + (rv + 4) * Math.sin(b))}`; }).join('');
    return `<path d="${spikes}" stroke="${C.haemagglutinin}" stroke-width="2" stroke-linecap="round"/>` +
      `<circle cx="${n(vx)}" cy="${n(vy)}" r="${rv}" fill="url(#${id}-flu)" stroke="${outline(flu)}" stroke-width="1.5"/>`;
  };
  const [bx, by, bw, bh] = N.barrel, [cx, cy, cw, ch] = N.clip, [px, py, pw, ph] = N.plunger, [hx, hy, hw, hh] = N.thumb;
  return {
    defs: [`<linearGradient id="${id}-plume" x1="${n(tip[0])}" y1="${n(tip[1])}" x2="${n((l[0] + r[0]) / 2)}" y2="${n((l[1] + r[1]) / 2)}" gradientUnits="userSpaceOnUse">` +
      `<stop offset="0" stop-color="${tint(C.fluid, 0.2)}" stop-opacity="0.7"/><stop offset="1" stop-color="${tint(C.fluid, 0.5)}" stop-opacity="0"/></linearGradient>`,
      glassGradient(`${id}-glass`), K.cylinderGradient(`${id}-clip`, C.vialCap, { horizontal: true }), K.cylinderGradient(`${id}-rod`, C.plunger, { horizontal: true }),
      K.sphereGradient(`${id}-flu`, flu)],
    body: [
      `<path d="M${n(tip[0])} ${n(tip[1])}L${n(l[0])} ${n(l[1])}A${reach} ${reach} 0 0 1 ${n(r[0])} ${n(r[1])}Z" fill="url(#${id}-plume)"/>`,
      ...mist, ...N.virions.map(virion),
      `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`,
      `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="url(#${id}-rod)" stroke="${outline(C.plunger)}" stroke-width="1.5"/>`,
      `<rect x="${hx}" y="${hy}" width="${hw}" height="${hh}" rx="4" fill="${C.plunger}" stroke="${outline(C.plunger)}" stroke-width="2"/>`,
      `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="url(#${id}-glass)"/>`,
      `<rect x="${bx + 4}" y="${by + 30}" width="${bw - 8}" height="${bh - 36}" rx="2" fill="${tint(C.fluid, 0.15)}"/>`,
      `<rect x="${bx + 4}" y="${by + bh - 10}" width="${bw - 8}" height="8" rx="2" fill="${C.shoe}"/>`,
      `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="none" stroke="${edge}" stroke-width="2.5"/>`,
      `<rect x="${bx + 5}" y="${by + 6}" width="4" height="${bh - 14}" rx="2" fill="#fff" opacity="0.6"/>`,
      // The dose-divider clip on the plunger rod.
      `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="3" fill="url(#${id}-clip)" stroke="${outline(C.vialCap)}" stroke-width="2"/>`,
      `<path d="${N.nozzle}" fill="${C.plastic}" stroke="${edge}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M-4 -96L-2 -70" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>`,
      `</g>`,
    ],
  };
}

function carTCell(id) {
  const T = K.CAR_T, [tx, ty, R] = T.cell, [gx, gy, gr] = T.target, nuc = C.nucleus, H = C.heavyChain, L = C.lightChain;
  // Each CAR: an scFv (heavy- and light-chain variable domains) on a hinge, crossing the membrane
  // to a co-stimulatory domain and the CD3ζ chain inside.
  const outside = deg => `<g transform="rotate(${deg} ${tx} ${ty})">` +
    `<line x1="${tx + R - 4}" y1="${ty}" x2="${tx + R + 15}" y2="${ty}" stroke="${outline(C.fibre)}" stroke-width="5" stroke-linecap="round"/>` +
    `<line x1="${tx + R - 4}" y1="${ty}" x2="${tx + R + 15}" y2="${ty}" stroke="${C.fibre}" stroke-width="2.8" stroke-linecap="round"/>` +
    `<ellipse cx="${tx + R + 22}" cy="${ty - 5.5}" rx="7.5" ry="5.5" fill="url(#${id}-heavy)" stroke="${outline(H)}" stroke-width="1.5"/>` +
    `<ellipse cx="${tx + R + 22}" cy="${ty + 5.5}" rx="7.5" ry="5.5" fill="url(#${id}-light)" stroke="${outline(L)}" stroke-width="1.5"/></g>`;
  const inside = deg => `<g transform="rotate(${deg} ${tx} ${ty})">` +
    `<circle cx="${tx + R - 9}" cy="${ty}" r="4.5" fill="${C.penton}" stroke="${outline(C.penton)}" stroke-width="1.2"/>` +
    [18, 26].map(d => `<circle cx="${tx + R - d}" cy="${ty}" r="4" fill="${C.receptorB}" stroke="${outline(C.receptorB)}" stroke-width="1.2"/>`).join('') + `</g>`;
  // CD19 on the target cell; the one facing the engaged CAR meets its scFv.
  const toT = Math.atan2(ty - gy, tx - gx) * 180 / Math.PI;
  const cd19 = deg => `<g transform="rotate(${deg} ${gx} ${gy})"><line x1="${gx + gr - 2}" y1="${gy}" x2="${gx + gr + 4}" y2="${gy}" stroke="${outline(C.mhcAlpha)}" stroke-width="3.5" stroke-linecap="round"/>` +
    `<ellipse cx="${gx + gr + 8}" cy="${gy}" rx="5" ry="6" fill="${C.mhcAlpha}" stroke="${outline(C.mhcAlpha)}" stroke-width="1.2"/></g>`;
  const blob = (x, y, r, k) => K.smoothClosedPath(K.polarPoints(x, y, a => r + 1.5 * Math.sin(k * a)));
  return {
    defs: [K.sphereGradient(`${id}-t`, C.lymphocyte, { light: 0.5, dark: 0.1 }), K.sphereGradient(`${id}-b`, C.bLymphocyte, { light: 0.5, dark: 0.1 }),
      K.sphereGradient(`${id}-nucleus`, nuc, { light: 0.45 }), K.sphereGradient(`${id}-heavy`, H, { light: 0.5 }), K.sphereGradient(`${id}-light`, L, { light: 0.5 }),
      K.glossGradient(`${id}-gloss`)],
    body: [
      ...[toT - 70, toT - 35, toT, toT + 35, toT + 70, toT + 120, toT - 120, toT + 180].map(cd19),
      `<path d="${blob(gx, gy, gr, 5)}" fill="url(#${id}-b)" stroke="${shade(C.bLymphocyte, 0.32)}" stroke-width="2.5"/>`,
      `<circle cx="${gx + 2}" cy="${gy + 2}" r="${gr - 9}" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2"/>`,
      ...T.cars.map(outside),
      `<path d="${blob(tx, ty, R, 6)}" fill="url(#${id}-t)" stroke="${shade(C.lymphocyte, 0.32)}" stroke-width="${STROKE}"/>`,
      `<path d="${blob(tx - 6, ty - 6, 30, 4)}" fill="url(#${id}-nucleus)" stroke="${outline(nuc)}" stroke-width="2.5"/>`,
      ...T.cars.map(inside),
      K.gloss(`${id}-gloss`, tx - 26, ty - 32, 16, 8),
    ],
  };
}

function ors(id) {
  const O = K.ORS, [sx, sy, sa] = O.sachet, [mx, my] = O.mug, sc = C.sachet, mug = '#F4F6F8';
  return {
    defs: [K.cylinderGradient(`${id}-sachet`, sc, { horizontal: true }), K.cylinderGradient(`${id}-mug`, mug, { horizontal: true }), K.sphereGradient(`${id}-ors`, tint(C.fluid, 0.4), { light: 0.5 })],
    body: [
      `<g transform="translate(${sx} ${sy}) rotate(${sa})">`,
      `<path d="${K.sachetPath()}" fill="url(#${id}-sachet)" stroke="${outline(sc)}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M${-O.w / 2} ${-O.h / 2 + 10}H${O.w / 2}M${-O.w / 2} ${O.h / 2 - 10}H${O.w / 2}" stroke="${shade(sc, 0.25)}" stroke-width="1.5" stroke-dasharray="3 3"/>`,
      `<rect x="-30" y="-36" width="60" height="72" rx="8" fill="#fff" opacity="0.92"/>`,
      `<path d="${K.dropPath(0, 4, 1.7)}" fill="${sc}" stroke="${outline(sc)}" stroke-width="1.5"/>`,
      `<path d="M-14 26H14" stroke="${tint(sc, 0.3)}" stroke-width="3" stroke-linecap="round"/>`,
      `<path d="M${O.w / 2} ${-O.h / 2 + 22}l-6 4l6 4" fill="none" stroke="${outline(sc)}" stroke-width="2" stroke-linejoin="round"/>`,
      `</g>`,
      `<g transform="translate(${mx} ${my})">`,
      `<path d="M26 -20C46 -20 46 14 24 14" fill="none" stroke="${outline(mug)}" stroke-width="11" stroke-linecap="round"/><path d="M26 -20C46 -20 46 14 24 14" fill="none" stroke="${mug}" stroke-width="6" stroke-linecap="round"/>`,
      `<path d="M-30 -34L30 -34L26 34Q25 42 17 42L-17 42Q-25 42 -26 34Z" fill="url(#${id}-mug)" stroke="${outline(mug)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<ellipse cy="-30" rx="27" ry="5" fill="url(#${id}-ors)" stroke="${shade(C.fluid, 0.3)}" stroke-width="1.5"/>`,
      // A spoon standing in the mug.
      `<path d="M6 -32L22 -70" stroke="${outline(C.metal)}" stroke-width="5" stroke-linecap="round"/><path d="M6 -32L22 -70" stroke="${C.metal}" stroke-width="2.5" stroke-linecap="round"/>`,
      `<ellipse cx="24" cy="-76" rx="5" ry="8" transform="rotate(22 24 -76)" fill="${C.metal}" stroke="${outline(C.metal)}" stroke-width="1.5"/>`,
      `<rect x="-22" y="-20" width="5" height="50" rx="2.5" fill="#fff" opacity="0.7"/>`,
      `</g>`,
    ],
  };
}

// ---------------------------------------------------------- clinical & lab

function bloodCultureBottle(id) {
  const glass = 'M82 98Q82 78 104 72L106 60L150 60L152 72Q174 78 174 98L174 222Q174 236 160 236L96 236Q82 236 82 222Z';
  const edge = C.plasticEdge, capC = C.capYellow;
  const bars = [2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 2, 3, 1];
  let x = 99;
  const barcode = bars.map((w, i) => {
    const r = `<rect x="${n(x)}" y="174" width="${n(w * 1.3)}" height="18" fill="#3A4650"/>`;
    x += w * 1.3 + (i % 3 ? 1.6 : 2.4);
    return r;
  });
  return {
    defs: [
      `<clipPath id="${id}-clip"><path d="${glass}"/></clipPath>`,
      `<linearGradient id="${id}-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D5E1E9"/>` +
      `<stop offset="0.3" stop-color="#F7FBFD"/><stop offset="0.7" stop-color="#DCE6ED"/><stop offset="1" stop-color="#BACBD7"/></linearGradient>`,
      `<linearGradient id="${id}-broth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tint(C.broth, 0.15)}"/>` +
      `<stop offset="0.5" stop-color="${C.broth}"/><stop offset="1" stop-color="${shade(C.broth, 0.3)}"/></linearGradient>`,
      K.cylinderGradient(`${id}-cap`, capC, { horizontal: true }),
      K.cylinderGradient(`${id}-crimp`, '#B9C3CC', { horizontal: true }),
    ],
    body: [
      `<path d="${glass}" fill="url(#${id}-glass)"/>`,
      `<g clip-path="url(#${id}-clip)"><rect x="76" y="118" width="104" height="124" fill="url(#${id}-broth)"/>` +
      `<line x1="80" y1="118" x2="176" y2="118" stroke="${tint(C.broth, 0.35)}" stroke-width="2"/>` +
      `<ellipse cx="128" cy="229" rx="32" ry="5" fill="#6E8B7B"/></g>`,
      `<rect x="90" y="84" width="7" height="140" rx="3.5" fill="#fff" opacity="0.5"/>`,
      `<rect x="90" y="134" width="76" height="66" rx="3" fill="#fff" stroke="#C9D6DF" stroke-width="1.5"/>`,
      `<path d="M90 145V137a3 3 0 0 1 3-3h70a3 3 0 0 1 3 3v8Z" fill="${capC}"/>`,
      ...[[152, 50], [161, 38]].map(([y, w]) => `<rect x="98" y="${y}" width="${w}" height="4" rx="2" fill="#B8C6D1"/>`),
      ...barcode,
      `<path d="${glass}" fill="none" stroke="${edge}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<rect x="100" y="46" width="56" height="18" rx="4" fill="url(#${id}-crimp)" stroke="${shade('#B9C3CC', 0.35)}" stroke-width="2"/>`,
      `<rect x="98" y="22" width="60" height="28" rx="6" fill="url(#${id}-cap)" stroke="${outline(capC)}" stroke-width="${STROKE}"/>`,
      `<rect x="104" y="16" width="48" height="10" rx="4" fill="${tint(capC, 0.3)}" stroke="${outline(capC)}" stroke-width="2"/>`,
    ],
  };
}

function bloodAgarPlate(id) {
  const red = C.bloodAgar, glass = C.plasticEdge, col = C.colony;
  const rand = K.rng(21);
  // Colonies placed in the unit disc, then mapped onto the foreshortened agar surface.
  const place = (count, region, r, spacing) => {
    const out = [];
    for (let tries = 0; out.length < count && tries < 8000; tries++) {
      const u = rand() * 2 - 1, v = rand() * 2 - 1;
      if (u * u + v * v > 0.82 || !region(u, v)) continue;
      const p = [128 + 88 * u, 120 + 45 * v];
      if (out.every(q => Math.hypot(q[0] - p[0], (q[1] - p[1]) * 1.9) > spacing)) out.push(p);
    }
    return out.map(p => [...p, r]);
  };
  const colonies = [
    ...place(30, (u, v) => u < -0.3, 3, 8),
    ...place(14, (u, v) => u > -0.2 && v < -0.1, 3.8, 16),
    ...place(8, (u, v) => u > -0.1 && v > 0.15, 5.2, 34),
  ];
  const streak = pts => `<path d="${K.smoothOpenPath(pts)}" fill="none" stroke="${tint(red, 0.3)}" stroke-width="1.5" opacity="0.6"/>`;
  return {
    defs: [K.sphereGradient(`${id}-agar`, red, { light: 0.3, dark: 0.2 }), K.sphereGradient(`${id}-colony`, col, { light: 0.7 })],
    body: [
      `<ellipse cx="128" cy="112" rx="104" ry="56" fill="#E8EFF4" stroke="${glass}" stroke-width="2"/>`,
      `<ellipse cx="128" cy="120" rx="96" ry="50" fill="url(#${id}-agar)" stroke="${shade(red, 0.3)}" stroke-width="1.5"/>`,
      streak([[100, 82], [130, 90], [110, 98], [148, 104], [124, 110], [170, 112]]),
      streak([[132, 132], [178, 128], [140, 144], [190, 140], [150, 156], [196, 150]]),
      ...colonies.filter(([, , r]) => r > 5).map(([x, y, r]) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(r * 2.5)}" ry="${n(r * 1.3)}" fill="${tint(red, 0.45)}" opacity="0.6"/>`),
      ...colonies.map(([x, y, r]) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${r}" ry="${n(r * 0.6)}" fill="url(#${id}-colony)" stroke="${shade(col, 0.3)}" stroke-width="0.8"/>`),
      `<path d="M24 112L24 136A104 56 0 0 0 232 136L232 112A104 56 0 0 1 24 112Z" fill="#DCE6ED" opacity="0.55" stroke="${glass}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M44 146A96 46 0 0 0 212 146" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>`,
    ],
  };
}

function lungs(id) {
  const base = C.lung, airway = tint(base, 0.35);
  const left = 'M112 92C98 74 72 76 56 100C38 128 32 178 36 214C38 232 54 238 72 232C92 226 108 222 116 210C121 172 120 124 112 92Z';
  const right = 'M144 92C158 74 184 76 200 100C218 128 224 178 220 214C218 232 202 238 184 232C164 226 148 222 140 210C148 198 152 186 146 172C140 158 136 124 144 92Z';
  const tree = 'M108 120L84 150M96 134L70 126M84 150L66 186M84 150L98 192M70 126L56 114M66 186L54 206M98 192L104 214';
  const mirror = d => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${256 - Number(x)} ${y}`);
  return {
    defs: [K.sphereGradient(`${id}-lung`, base, { light: 0.45 }), K.cylinderGradient(`${id}-trachea`, airway, { horizontal: true })],
    body: [
      ...[left, right].map(d => `<path d="${d}" fill="url(#${id}-lung)" stroke="${outline(base)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`),
      `<g fill="none" stroke="${shade(base, 0.3)}" stroke-width="2" stroke-linecap="round" opacity="0.6">` +
      `<path d="M40 150Q76 140 112 146"/><path d="M48 198Q84 170 114 126"/><path d="M216 196Q182 168 144 126"/></g>`,
      `<g fill="none" stroke="${tint(base, 0.6)}" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">` +
      `<path d="${tree}" stroke-width="4"/><path d="${mirror(tree)}" stroke-width="4"/></g>`,
      K.pipe('M128 84L128 94Q128 104 116 112L106 122', airway, 10),
      K.pipe('M128 94Q128 104 140 112L150 122', airway, 10),
      `<rect x="119" y="14" width="18" height="76" rx="6" fill="url(#${id}-trachea)" stroke="${outline(airway)}" stroke-width="2.5"/>`,
      `<g stroke="${shade(airway, 0.25)}" stroke-width="1.5">` + Array.from({ length: 8 }, (_, i) => `<line x1="120" y1="${22 + i * 8}" x2="136" y2="${22 + i * 8}"/>`).join('') + `</g>`,
    ],
  };
}

function child(id) {
  const skin = C.skin, hair = C.hair, shirt = C.shirt, shorts = C.shorts, shoe = C.shoe;
  const shirtPath = 'M98 96Q128 88 158 96L184 128L170 140L158 126L158 160L98 160L98 126L86 140L72 128Z';
  return {
    defs: [K.sphereGradient(`${id}-skin`, skin, { light: 0.35 }), K.sphereGradient(`${id}-hair`, hair, { light: 0.35 }),
      K.cylinderGradient(`${id}-shirt`, shirt, { horizontal: true }), K.cylinderGradient(`${id}-shorts`, shorts, { horizontal: true })],
    body: [
      K.pipe('M113 182L113 222', skin, 15), K.pipe('M143 182L143 222', skin, 15),
      ...[110, 146].map(x => `<ellipse cx="${x}" cy="230" rx="14" ry="7" fill="${shoe}" stroke="${outline(shoe)}" stroke-width="2"/>`),
      `<path d="M98 156L158 156L162 188L132 188L128 176L124 188L94 188Z" fill="url(#${id}-shorts)" stroke="${outline(shorts)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      K.pipe('M80 132L72 172', skin, 13), K.pipe('M176 132L184 172', skin, 13),
      `<path d="${shirtPath}" fill="url(#${id}-shirt)" stroke="${outline(shirt)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<rect x="121" y="80" width="14" height="14" fill="${shade(skin, 0.12)}"/>`,
      ...[99, 157].map(x => `<circle cx="${x}" cy="58" r="6" fill="${skin}" stroke="${outline(skin)}" stroke-width="2"/>`),
      `<circle cx="128" cy="56" r="29" fill="url(#${id}-skin)" stroke="${outline(skin)}" stroke-width="2.5"/>`,
      `<path d="M99 56C96 32 110 24 128 24C148 24 160 34 157 56C150 44 140 39 128 40C116 41 106 46 99 56Z" fill="url(#${id}-hair)" stroke="${outline(hair)}" stroke-width="2" stroke-linejoin="round"/>`,
    ],
  };
}

// Swaddled newborn seen from the front: blanket hood framing the face, wrapped body below.
const SWADDLE_BODY = 'M70 132Q100 140 128 128Q156 140 186 132C200 170 192 214 170 228C150 238 106 238 86 228C64 214 56 170 70 132Z';

function newborn(id) {
  const sw = C.swaddle, skin = C.skin;
  return {
    defs: [K.sphereGradient(`${id}-swaddle`, sw, { light: 0.5 }), K.sphereGradient(`${id}-skin`, skin, { light: 0.35 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(0 -6)">`,
      `<circle cx="128" cy="88" r="52" fill="url(#${id}-swaddle)" stroke="${outline(sw)}" stroke-width="${STROKE}"/>`,
      `<circle cx="128" cy="92" r="33" fill="url(#${id}-skin)" stroke="${outline(skin)}" stroke-width="2.5"/>`,
      `<path d="${SWADDLE_BODY}" fill="url(#${id}-swaddle)" stroke="${outline(sw)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<path d="M184 140Q150 178 108 230M72 142Q98 164 116 172" fill="none" stroke="${shade(sw, 0.25)}" stroke-width="2.5" stroke-linecap="round"/>`,
      K.gloss(`${id}-gloss`, 96, 172, 12, 28, 15),
      `</g>`,
    ],
  };
}

function baby(id) {
  const skin = C.skin, nappy = C.nappy, edge = '#AEB8C2';
  const arm = 'M100 116Q86 136 84 156', leg = 'M106 188Q88 204 70 208';
  return {
    defs: [K.sphereGradient(`${id}-skin`, skin, { light: 0.35 }), K.cylinderGradient(`${id}-torso`, skin, { horizontal: true }),
      K.sphereGradient(`${id}-nappy`, nappy, { light: 0.6, dark: 0.08 })],
    body: [
      K.pipe(leg, skin, 22), K.pipe(K.mirrorX(leg), skin, 22),
      ...[62, 194].map(x => `<ellipse cx="${x}" cy="206" rx="14" ry="11" fill="url(#${id}-skin)" stroke="${outline(skin)}" stroke-width="2"/>`),
      `<path d="M96 108Q128 98 160 108Q172 142 164 170L92 170Q84 142 96 108Z" fill="url(#${id}-torso)" stroke="${outline(skin)}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M88 158Q128 168 168 158Q172 186 152 198Q128 206 104 198Q84 186 88 158Z" fill="url(#${id}-nappy)" stroke="${edge}" stroke-width="2.5" stroke-linejoin="round"/>`,
      ...[90, 156].map(x => `<rect x="${x}" y="161" width="10" height="8" rx="2" fill="${C.hat}" stroke="${outline(C.hat)}" stroke-width="1.2"/>`),
      K.pipe(arm, skin, 17), K.pipe(K.mirrorX(arm), skin, 17),
      ...[84, 172].map(x => `<circle cx="${x}" cy="160" r="10" fill="url(#${id}-skin)" stroke="${outline(skin)}" stroke-width="2"/>`),
      ...[90, 166].map(x => `<circle cx="${x}" cy="70" r="7" fill="${skin}" stroke="${outline(skin)}" stroke-width="2"/>`),
      `<circle cx="128" cy="66" r="38" fill="url(#${id}-skin)" stroke="${outline(skin)}" stroke-width="2.5"/>`,
      `<path d="M122 30C118 22 128 16 136 22C130 22 128 26 130 30" fill="none" stroke="${C.hair}" stroke-width="3.5" stroke-linecap="round"/>`,
    ],
  };
}

function thermometer(id) {
  const red = C.mercury, edge = C.plasticEdge;
  return {
    defs: [glassGradient(`${id}-glass`), K.sphereGradient(`${id}-bulb`, red), K.cylinderGradient(`${id}-column`, red, { horizontal: true })],
    body: [
      `<g transform="translate(128 128) rotate(40)">`,
      `<rect x="-16" y="-100" width="32" height="172" rx="16" fill="url(#${id}-glass)" stroke="${edge}" stroke-width="${STROKE}"/>`,
      `<g stroke="${edge}" stroke-width="1.5">` + Array.from({ length: 16 }, (_, i) => `<line x1="${i % 2 ? 8 : 4}" y1="${-88 + i * 9}" x2="14" y2="${-88 + i * 9}"/>`).join('') + `</g>`,
      `<rect x="-5" y="-62" width="10" height="140" rx="5" fill="url(#${id}-column)"/>`,
      `<circle cy="82" r="24" fill="url(#${id}-bulb)" stroke="${outline(red)}" stroke-width="${STROKE}"/>`,
      `<rect x="-11" y="-92" width="4" height="150" rx="2" fill="#fff" opacity="0.5"/>`,
      `</g>`,
    ],
  };
}

function stethoscope(id) {
  const metal = C.metal, tube = C.tubing;
  return {
    defs: [K.sphereGradient(`${id}-disc`, metal, { light: 0.6 }), K.sphereGradient(`${id}-diaphragm`, tint(metal, 0.4), { light: 0.6 }), K.sphereGradient(`${id}-tip`, tube, { light: 0.4 })],
    body: [
      K.pipe('M128 128C128 178 92 214 124 226C152 236 168 222 172 202', tube, 12),
      K.pipe('M84 46C84 92 100 120 128 128C156 120 172 92 172 46', metal, 7),
      `<circle cx="128" cy="128" r="8" fill="url(#${id}-disc)" stroke="${outline(metal)}" stroke-width="2"/>`,
      ...[84, 172].map(x => `<ellipse cx="${x}" cy="38" rx="9" ry="11" fill="url(#${id}-tip)" stroke="${outline(tube)}" stroke-width="2"/>`),
      K.pipe('M172 200L178 190', metal, 8),
      `<circle cx="190" cy="172" r="30" fill="url(#${id}-disc)" stroke="${outline(metal)}" stroke-width="${STROKE}"/>`,
      `<circle cx="190" cy="172" r="21" fill="url(#${id}-diaphragm)" stroke="${shade(metal, 0.25)}" stroke-width="1.5"/>`,
    ],
  };
}

function lumbarPuncture(id) {
  const b = C.bone, edge = C.metal;
  const ys = [70, 132, 194];
  // Spinous process of each vertebra, sloping down and back from the canal.
  const process = y => `M132 ${y - 18}L186 ${y - 2}Q200 ${y + 6} 188 ${y + 16}L132 ${y + 18}Z`;
  return {
    defs: [K.sphereGradient(`${id}-bone`, b, { light: 0.5 }), K.cylinderGradient(`${id}-needle`, edge),
      K.cylinderGradient(`${id}-hub`, C.penton), K.sphereGradient(`${id}-drop`, C.csf, { light: 0.6 })],
    body: [
      `<rect x="106" y="36" width="26" height="200" fill="${C.csf}"/>`,
      `<path d="M112 36V236M119 36V236M126 36V236" stroke="${C.lymph}" stroke-width="2" opacity="0.8"/>`,
      ...[95, 157].map(y => `<rect x="44" y="${y}" width="58" height="12" rx="6" fill="${C.intervertebralDisc}" stroke="${shade(C.intervertebralDisc, 0.3)}" stroke-width="2"/>`),
      ...ys.map(y => `<rect x="40" y="${y - 24}" width="62" height="48" rx="10" fill="url(#${id}-bone)" stroke="${outline(b)}" stroke-width="${STROKE}"/>`),
      ...ys.map(y => `<path d="${process(y)}" fill="url(#${id}-bone)" stroke="${outline(b)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`),
      `<path d="M120 164L224 151" stroke="${outline(edge)}" stroke-width="5" stroke-linecap="round"/>`,
      `<path d="M120 164L224 151" stroke="#D4DBE1" stroke-width="2.5" stroke-linecap="round"/>`,
      `<rect x="222" y="143" width="22" height="15" rx="3" transform="rotate(-7 233 150)" fill="url(#${id}-hub)" stroke="${outline(C.penton)}" stroke-width="2"/>`,
      `<path d="M236 166C240 172 242 176 242 179A6 6 0 0 1 230 179C230 176 232 172 236 166Z" fill="url(#${id}-drop)" stroke="${shade(C.csf, 0.35)}" stroke-width="1.5"/>`,
    ],
  };
}

function npSwab(id) {
  const edge = C.plasticEdge, cap = C.vialCap, tip = C.swabTip;
  const tube = 'M150 84H200V218Q200 228 190 228H160Q150 228 150 218Z';
  const fuzz = K.polarPoints(0, 0, a => K.ellipseRadius(8, 18, a), 28).map(([x, y]) => {
    const l = Math.hypot(x, y) || 1;
    return `M${n(x)} ${n(y)}L${n(x + x / l * 3.5)} ${n(y + y / l * 3.5)}`;
  }).join('');
  return {
    defs: [`<clipPath id="${id}-clip"><path d="${tube}"/></clipPath>`, glassGradient(`${id}-glass`),
      K.cylinderGradient(`${id}-cap`, cap, { horizontal: true }), K.sphereGradient(`${id}-tip`, tip, { light: 0.5 })],
    body: [
      `<path d="${tube}" fill="url(#${id}-glass)"/>`,
      `<g clip-path="url(#${id}-clip)"><rect x="146" y="164" width="60" height="70" fill="${C.medium}"/>` +
      `<line x1="146" y1="164" x2="204" y2="164" stroke="#fff" stroke-width="2" opacity="0.7"/></g>`,
      `<rect x="156" y="104" width="38" height="44" rx="2" fill="#fff" stroke="#C9D6DF" stroke-width="1.5"/>`,
      `<path d="M156 113V106a2 2 0 0 1 2-2h34a2 2 0 0 1 2 2v7Z" fill="${cap}"/>`,
      ...[[122, 26], [130, 18]].map(([y, w]) => `<rect x="162" y="${y}" width="${w}" height="3.5" rx="1.75" fill="#B8C6D1"/>`),
      `<path d="${tube}" fill="none" stroke="${edge}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<rect x="146" y="50" width="58" height="36" rx="6" fill="url(#${id}-cap)" stroke="${outline(cap)}" stroke-width="${STROKE}"/>`,
      K.pipe('M40 30L114 198', '#E9EEF2', 6),
      `<circle cx="70" cy="98" r="4.5" fill="none" stroke="${edge}" stroke-width="2"/>`,
      `<g transform="translate(121 214) rotate(-23.8)"><path d="${fuzz}" stroke="${shade(tip, 0.25)}" stroke-width="1.5" stroke-linecap="round"/>` +
      `<ellipse rx="8" ry="18" fill="url(#${id}-tip)" stroke="${outline(tip)}" stroke-width="1.5"/></g>`,
    ],
  };
}

function ivCannula(id) {
  const edge = C.plasticEdge, hub = C.vialCap, W = K.CANNULA;
  return {
    defs: [glassGradient(`${id}-body`), K.cylinderGradient(`${id}-hub`, hub), K.sphereGradient(`${id}-wing`, tint(hub, 0.15), { light: 0.45 }),
      K.sphereGradient(`${id}-port`, hub, { light: 0.5 }), K.cylinderGradient(`${id}-cap`, '#F2F2F2')],
    body: [
      `<g transform="translate(136 120) rotate(-35) scale(1.22)">`,
      `<path d="${W.catheter}" fill="#F4F7F9" stroke="${edge}" stroke-width="1.8" stroke-linejoin="round"/>`,
      `<path d="M-40 -1.2L-100 -0.6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.9"/>`,
      // Flat wings either side, colour-coded by gauge (blue: 22 G).
      ...[W.wing, W.wing.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${x} ${-Number(y)}`)].map(d =>
        `<path d="${d}" fill="url(#${id}-wing)" stroke="${outline(hub)}" stroke-width="2" stroke-linejoin="round"/>`),
      `<path d="M-40 -9L-30 -11L-6 -11L-6 11L-30 11L-40 9Z" fill="url(#${id}-hub)" stroke="${outline(hub)}" stroke-width="2" stroke-linejoin="round"/>`,
      `<rect x="-8" y="-11" width="50" height="22" rx="5" fill="url(#${id}-body)" stroke="${edge}" stroke-width="2"/>`,
      `<rect x="0" y="-7" width="36" height="3" rx="1.5" fill="#fff" opacity="0.7"/>`,
      // Injection port, seen from above, with its hinged cap.
      `<circle cx="10" cy="0" r="12" fill="url(#${id}-port)" stroke="${outline(hub)}" stroke-width="2"/>`,
      `<circle cx="10" cy="0" r="6" fill="${shade(hub, 0.15)}" stroke="${outline(hub)}" stroke-width="1.2"/>`,
      `<rect x="42" y="-9" width="24" height="18" rx="3" fill="url(#${id}-cap)" stroke="#A7B1BA" stroke-width="2"/>`,
      `<path d="M48 -9V9M54 -9V9M60 -9V9" stroke="#C6CED5" stroke-width="1.3"/>`,
      `</g>`,
    ],
  };
}

function piccLine(id) {
  const tube = C.oralPlunger, clear = '#E3EEF5', edge = C.plasticEdge, L = K.PICC, [hx, hy, ha] = L.hub;
  const connector = ([x, y, a], cap) => `<g transform="translate(${x} ${y}) rotate(${a})">` +
    `<rect x="-14" y="-7" width="20" height="14" rx="3" fill="url(#${id}-clear)" stroke="${edge}" stroke-width="2"/>` +
    `<rect x="4" y="-8.5" width="14" height="17" rx="3" fill="${cap}" stroke="${outline(cap)}" stroke-width="2"/>` +
    `<path d="M8 -8.5V8.5M12 -8.5V8.5" stroke="${shade(cap, 0.2)}" stroke-width="1.2"/></g>`;
  const clamp = ([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})">` +
    `<path d="M-7 -12H7V5Q7 12 0 12Q-7 12 -7 5Z" fill="url(#${id}-tube)" stroke="${outline(tube)}" stroke-width="2" stroke-linejoin="round"/></g>`;
  return {
    defs: [K.cylinderGradient(`${id}-tube`, tube, { horizontal: true }), K.cylinderGradient(`${id}-clear`, clear), K.sphereGradient(`${id}-hub`, tube, { light: 0.45 })],
    body: [
      K.pipe(L.catheter, tube, 6),
      ...L.legs.map(d => K.pipe(d, clear, 6)),
      ...L.clamps.map(clamp),
      connector(L.connectors[0], C.drugRed), connector(L.connectors[1], '#F2F2F2'),
      // Junction hub with suture wings.
      `<g transform="translate(${hx} ${hy}) rotate(${ha})">`,
      `<path d="M-14 -24Q-4 -24 -4 -14L4 -14Q4 -24 14 -24Q20 -24 20 -16L20 16Q20 24 14 24Q4 24 4 14L-4 14Q-4 24 -14 24Q-20 24 -20 16L-20 -16Q-20 -24 -14 -24Z" fill="url(#${id}-hub)" stroke="${outline(tube)}" stroke-width="2.5" stroke-linejoin="round"/>`,
      ...[[-12, -16], [12, -16], [-12, 16], [12, 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff" stroke="${outline(tube)}" stroke-width="1.2"/>`),
      `</g>`,
    ],
  };
}

function urineDipstick(id) {
  const edge = C.plasticEdge, urine = C.urine, lid = C.drugRed;
  const pot = 'M44 116H124V214Q124 228 110 228H58Q44 228 44 214Z';
  const pads = ['#B9A3D6', '#F2B8C6', '#F5C79E', '#C9DC7A', '#F2A541', '#5E9E5A', '#6FB7A8', '#E9A0A0', '#9FD5D1'];
  return {
    defs: [`<clipPath id="${id}-clip"><path d="${pot}"/></clipPath>`, glassGradient(`${id}-glass`), K.cylinderGradient(`${id}-lid`, lid, { horizontal: true }),
      `<linearGradient id="${id}-urine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tint(urine, 0.25)}"/><stop offset="1" stop-color="${shade(urine, 0.12)}"/></linearGradient>`],
    body: [
      `<path d="${pot}" fill="url(#${id}-glass)"/>`,
      `<g clip-path="url(#${id}-clip)"><rect x="40" y="150" width="90" height="82" fill="url(#${id}-urine)"/>` +
      `<line x1="40" y1="150" x2="128" y2="150" stroke="#fff" stroke-width="2" opacity="0.7"/></g>`,
      `<rect x="52" y="122" width="6" height="96" rx="3" fill="#fff" opacity="0.5"/>`,
      `<path d="${pot}" fill="none" stroke="${edge}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<rect x="38" y="94" width="92" height="24" rx="5" fill="url(#${id}-lid)" stroke="${outline(lid)}" stroke-width="2.5"/>`,
      `<path d="${Array.from({ length: 10 }, (_, i) => `M${46 + i * 8.5} 98V114`).join('')}" stroke="${shade(lid, 0.2)}" stroke-width="1.3"/>`,
      // Reagent strip: a plain handle at the top, test pads below.
      `<g transform="translate(184 128) rotate(14)">`,
      `<rect x="-13" y="-104" width="26" height="208" rx="3" fill="#FBFCFD" stroke="${edge}" stroke-width="2.5"/>`,
      ...pads.map((c, i) => `<rect x="-9" y="${-66 + i * 19}" width="18" height="13" rx="2" fill="${c}" stroke="${shade(c, 0.3)}" stroke-width="1.2"/>`),
      `</g>`,
    ],
  };
}

function gramStainSlide(id) {
  const edge = C.plasticEdge, smear = C.smear, pos = C.gramPositive, neg = C.gramNegative;
  const [fx, fy, fr] = [140, 86, 64];
  const cocci = [[112, 60], [124, 54], [118, 70], [130, 66], [106, 72], [168, 112], [178, 104], [174, 120], [186, 114], [96, 118], [104, 126]];
  const rods = [[150, 58, 30], [166, 76, -20], [130, 104, 70], [102, 96, 10], [150, 132, -35], [188, 82, 50], [124, 132, 15]];
  return {
    defs: [`<clipPath id="${id}-field"><circle cx="${fx}" cy="${fy}" r="${fr}"/></clipPath>`, glassGradient(`${id}-glass`),
      K.sphereGradient(`${id}-pos`, pos), K.cylinderGradient(`${id}-neg`, neg)],
    body: [
      // Slide: frosted label end on the left, stained smear on the right.
      `<g transform="rotate(-6 128 190)">`,
      `<rect x="20" y="162" width="216" height="58" rx="3" fill="url(#${id}-glass)" stroke="${edge}" stroke-width="${STROKE}"/>`,
      `<rect x="23" y="165" width="52" height="52" fill="#DCE3E9"/>`,
      `<path d="${Array.from({ length: 6 }, (_, i) => `M${28 + i * 8} 170L${28 + i * 8 - 4} 212`).join('')}" stroke="#C9D3DB" stroke-width="1.5" stroke-linecap="round"/>`,
      `<path d="${K.smoothClosedPath(K.polarPoints(170, 191, a => K.ellipseRadius(40, 17, a) + 2 * Math.sin(6 * a), 60))}" fill="${smear}" opacity="0.85"/>`,
      `<rect x="80" y="168" width="150" height="4" rx="2" fill="#fff" opacity="0.6"/>`,
      `</g>`,
      // Magnified field of the smear.
      `<path d="M150 184L${fx - 44} ${fy + 47}M188 180L${fx + 52} ${fy + 38}" stroke="${edge}" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round"/>`,
      `<circle cx="${fx}" cy="${fy}" r="${fr}" fill="#FBF0F4"/>`,
      `<g clip-path="url(#${id}-field)">`,
      ...rods.map(([x, y, a]) => `<rect x="-11" y="-4.5" width="22" height="9" rx="4.5" transform="translate(${x} ${y}) rotate(${a})" fill="url(#${id}-neg)" stroke="${outline(neg)}" stroke-width="1.3"/>`),
      ...cocci.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="url(#${id}-pos)" stroke="${outline(pos)}" stroke-width="1.3"/>`),
      `</g>`,
      `<circle cx="${fx}" cy="${fy}" r="${fr}" fill="none" stroke="#3A4650" stroke-width="6"/>`,
    ],
  };
}

function lateralFlowTest(id) {
  const edge = C.plasticEdge, line = C.lateralFlowLine;
  return {
    defs: [K.cylinderGradient(`${id}-case`, '#F4F6F8', { horizontal: true })],
    body: [
      `<g transform="translate(128 128) rotate(-20)">`,
      `<rect x="-42" y="-106" width="84" height="212" rx="18" fill="url(#${id}-case)" stroke="${edge}" stroke-width="${STROKE}"/>`,
      `<rect x="-34" y="-98" width="5" height="190" rx="2.5" fill="#fff" opacity="0.7"/>`,
      `<path d="M-18 -90H18M-18 -82H18M-18 -74H18" stroke="#C6CED5" stroke-width="2" stroke-linecap="round"/>`,
      // Result window: control line and test line both showing (positive).
      `<rect x="-16" y="-56" width="32" height="66" rx="6" fill="#D5E0E8" stroke="${edge}" stroke-width="2"/>`,
      `<rect x="-12" y="-52" width="24" height="58" rx="3" fill="#FCFCFD"/>`,
      ...[-40, -16].map(y => `<rect x="-12" y="${y}" width="24" height="5" rx="1.5" fill="${line}"/>`),
      // Sample well.
      `<circle cx="0" cy="58" r="18" fill="#D5E0E8" stroke="${edge}" stroke-width="2"/>`,
      `<circle cx="0" cy="58" r="10" fill="#EBD8E0" stroke="${shade('#D5E0E8', 0.2)}" stroke-width="1.5"/>`,
      `</g>`,
    ],
  };
}

function nebuliserMask(id) {
  const mask = C.nebuliserMask, edge = shade(mask, 0.45), tube = tint(mask, 0.25), P = C.plasticEdge;
  const shape = 'M128 36C152 36 172 66 184 98C196 132 188 158 168 168C150 176 106 176 88 168C68 158 60 132 72 98C84 66 104 36 128 36Z';
  const pot = 'M106 186H150V214Q150 226 138 226H118Q106 226 106 214Z';
  return {
    defs: [`<clipPath id="${id}-pot"><path d="${pot}"/></clipPath>`, glassGradient(`${id}-glass`), K.sphereGradient(`${id}-mask`, mask, { light: 0.6, dark: 0.1 })],
    body: [
      K.pipe('M76 106C48 100 30 108 20 122', '#DDE3E8', 4), K.pipe(K.mirrorX('M76 106C48 100 30 108 20 122'), '#DDE3E8', 4),
      K.pipe('M128 224C128 240 170 242 196 232C218 224 230 210 234 196', tube, 7),
      // Nebuliser chamber under the mask, holding the drug solution.
      `<rect x="118" y="168" width="20" height="20" rx="3" fill="url(#${id}-glass)" stroke="${P}" stroke-width="2"/>`,
      `<path d="${pot}" fill="url(#${id}-glass)"/>`,
      `<g clip-path="url(#${id}-pot)"><rect x="100" y="204" width="56" height="26" fill="${C.fluid}"/></g>`,
      `<path d="${pot}" fill="none" stroke="${P}" stroke-width="2.5"/>`,
      `<rect x="102" y="182" width="52" height="8" rx="3" fill="${tint(mask, 0.1)}" stroke="${edge}" stroke-width="2"/>`,
      `<path d="${shape}" fill="url(#${id}-mask)" opacity="0.8"/>`,
      // Mist rising from the chamber into the mask.
      `<path d="M116 164C110 154 122 148 116 136M128 166C122 154 134 146 128 132M140 164C134 154 146 148 140 136" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity="0.85"/>`,
      `<path d="${shape}" fill="none" stroke="${edge}" stroke-width="${STROKE}"/>`,
      // Exhalation ports on either side.
      ...[[76, 132], [180, 132]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="9" fill="${tint(mask, 0.1)}" stroke="${edge}" stroke-width="2"/>`),
      `<path d="${shape}" transform="translate(128 108) scale(0.9) translate(-128 -108)" fill="none" stroke="${tint(mask, 0.5)}" stroke-width="2.5" opacity="0.8"/>`,
      `<path d="M104 64C94 80 86 98 82 116" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.6"/>`,
    ],
  };
}

function incubator(id) {
  const edge = C.plasticEdge, cab = '#E4EAEF', sw = C.swaddle, skin = C.skin;
  const hood = 'M34 150V94Q34 62 66 62H190Q222 62 222 94V150Z';
  return {
    defs: [K.cylinderGradient(`${id}-cab`, cab), K.sphereGradient(`${id}-swaddle`, sw, { light: 0.5 }), K.sphereGradient(`${id}-skin`, skin, { light: 0.35 }),
      `<linearGradient id="${id}-hood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6F2FA" stop-opacity="0.8"/><stop offset="1" stop-color="#CFE4F2" stop-opacity="0.45"/></linearGradient>`],
    body: [
      // Stand and wheels.
      ...[62, 186].map(x => `<rect x="${x}" y="194" width="10" height="28" fill="${C.metal}" stroke="${outline(C.metal)}" stroke-width="2"/>`),
      `<rect x="52" y="212" width="152" height="8" rx="3" fill="${C.metal}" stroke="${outline(C.metal)}" stroke-width="2"/>`,
      ...[67, 191].map(x => `<circle cx="${x}" cy="228" r="8" fill="${C.shoe}" stroke="${outline(C.shoe)}" stroke-width="2"/>`),
      `<rect x="40" y="148" width="176" height="48" rx="6" fill="url(#${id}-cab)" stroke="${edge}" stroke-width="${STROKE}"/>`,
      `<rect x="166" y="158" width="38" height="22" rx="3" fill="#3A4650"/>`,
      `<path d="M171 172L178 172L182 164L187 178L191 168L199 168" fill="none" stroke="#7CD992" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="M52 172H150" stroke="#C6CED5" stroke-width="2" stroke-linecap="round"/>`,
      // Baby lying on the mattress inside the clear hood.
      `<rect x="42" y="138" width="172" height="10" rx="3" fill="${C.hat}" stroke="${outline(C.hat)}" stroke-width="1.5"/>`,
      `<ellipse cx="140" cy="128" rx="30" ry="12" fill="url(#${id}-swaddle)" stroke="${outline(sw)}" stroke-width="2"/>`,
      `<circle cx="102" cy="126" r="12" fill="url(#${id}-skin)" stroke="${outline(skin)}" stroke-width="2"/>`,
      `<path d="${hood}" fill="url(#${id}-hood)" stroke="${edge}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      // Portholes near each end, level with the baby.
      ...[58, 198].map(x => `<circle cx="${x}" cy="116" r="14" fill="#DCEAF4" fill-opacity="0.5" stroke="${edge}" stroke-width="4"/>`),
      `<path d="M44 128V96Q44 72 68 72H120" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`,
    ],
  };
}

function pcrTube(id) {
  const edge = C.plasticEdge, tube = 'M-22 -52H22V6L5 62Q0 70 -5 62L-22 6Z';
  // A stretch of double-stranded DNA: two strands round a vertical axis with base pairs between.
  const strand = phase => Array.from({ length: 45 }, (_, i) => [198 + 20 * Math.sin(i / 44 * 2.8 * 2 * Math.PI + phase), 36 + i * 4.2]);
  const [s1, s2] = [strand(0), strand(Math.PI)];
  const rungs = s1.filter((_, i) => i % 2 === 1).map((p, k) => {
    const q = s2[k * 2 + 1];
    return `<line x1="${n(p[0])}" y1="${n(p[1])}" x2="${n(q[0])}" y2="${n(q[1])}" stroke="${['#F2A541', '#5DBB63', '#E5707A', '#5B8FD9'][k % 4]}" stroke-width="3" stroke-linecap="round"/>`;
  });
  return {
    defs: [`<clipPath id="${id}-tube"><path d="${tube}"/></clipPath>`, glassGradient(`${id}-glass`), K.cylinderGradient(`${id}-cap`, C.plastic, { horizontal: true })],
    body: [
      ...rungs,
      `<path d="${K.smoothOpenPath(s1)}" fill="none" stroke="${C.nucleus}" stroke-width="4.5" stroke-linecap="round"/>`,
      `<path d="${K.smoothOpenPath(s2)}" fill="none" stroke="${C.attachmentProtein}" stroke-width="4.5" stroke-linecap="round"/>`,
      `<g transform="translate(96 140) rotate(-10)">`,
      `<path d="${tube}" fill="url(#${id}-glass)"/>`,
      `<g clip-path="url(#${id}-tube)"><rect x="-26" y="22" width="52" height="50" fill="${C.fluid}"/><line x1="-24" y1="22" x2="24" y2="22" stroke="#fff" stroke-width="2" opacity="0.7"/></g>`,
      `<path d="${tube}" fill="none" stroke="${edge}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<rect x="-16" y="-44" width="5" height="44" rx="2.5" fill="#fff" opacity="0.6"/>`,
      `<rect x="-26" y="-62" width="52" height="12" rx="3" fill="url(#${id}-cap)" stroke="${edge}" stroke-width="2.5"/>`,
      // The hinged cap, open.
      `<path d="M-26 -58L-40 -66" stroke="${edge}" stroke-width="5" stroke-linecap="round"/>`,
      `<g transform="translate(-58 -78) rotate(-38)"><rect x="-22" y="-6" width="44" height="12" rx="4" fill="url(#${id}-cap)" stroke="${edge}" stroke-width="2.5"/>` +
        `<rect x="-14" y="6" width="28" height="10" rx="2" fill="${C.plastic}" stroke="${edge}" stroke-width="2"/></g>`,
      `</g>`,
    ],
  };
}

function handHygiene(id) {
  const skin = C.skin, H = K.HAND, water = C.fluid;
  const fingers = H.fingers.map(([[x0, y0], [x1, y1]]) => `M${x0} ${y0}L${x1} ${y1}`);
  const widths = [18, 18, 18, 16, 20];
  // Knuckle creases a third and two-thirds of the way up each finger.
  const creases = H.fingers.slice(0, 4).flatMap(([[x0, y0], [x1, y1]], i) => [0.45, 0.72].map(t => {
    const [x, y] = [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t], l = Math.hypot(x1 - x0, y1 - y0), [px, py] = [-(y1 - y0) / l, (x1 - x0) / l], h = widths[i] * 0.3;
    return `M${n(x - px * h)} ${n(y - py * h)}L${n(x + px * h)} ${n(y + py * h)}`;
  })).join('');
  const bubble = ([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity="0.35" stroke="#8FC7E8" stroke-width="2"/>` +
    `<path d="M${n(x - r * 0.55)} ${n(y - r * 0.2)}A${n(r * 0.6)} ${n(r * 0.6)} 0 0 1 ${n(x - r * 0.1)} ${n(y - r * 0.6)}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  const drop = (x, y, s) => `<path d="M${x} ${y - 12 * s}C${x + 4 * s} ${y - 4 * s} ${x + 8 * s} ${y} ${x + 8 * s} ${y + 4 * s}A${8 * s} ${8 * s} 0 0 1 ${x - 8 * s} ${y + 4 * s}C${x - 8 * s} ${y} ${x - 4 * s} ${y - 4 * s} ${x} ${y - 12 * s}Z" fill="${water}" stroke="${shade(water, 0.35)}" stroke-width="1.5"/>`;
  return {
    defs: [`<radialGradient id="${id}-skin" gradientUnits="userSpaceOnUse" cx="120" cy="120" r="130" fx="96" fy="80">` +
      `<stop offset="0" stop-color="${tint(skin, 0.35)}"/><stop offset="0.55" stop-color="${skin}"/><stop offset="1" stop-color="${shade(skin, 0.16)}"/></radialGradient>`],
    body: [
      // Outline layer first, then fills, so palm, wrist and fingers join seamlessly.
      ...fingers.map((d, i) => `<path d="${d}" stroke="${outline(skin)}" stroke-width="${widths[i] + 5}" stroke-linecap="round"/>`),
      ...[H.palm, H.wrist].map(d => `<path d="${d}" fill="${outline(skin)}" stroke="${outline(skin)}" stroke-width="5" stroke-linejoin="round"/>`),
      ...fingers.map((d, i) => `<path d="${d}" stroke="url(#${id}-skin)" stroke-width="${widths[i]}" stroke-linecap="round"/>`),
      ...[H.palm, H.wrist].map(d => `<path d="${d}" fill="url(#${id}-skin)"/>`),
      `<path d="${creases}M104 178C116 168 136 164 152 170" fill="none" stroke="${shade(skin, 0.25)}" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>`,
      ...H.bubbles.map(bubble),
      drop(196, 206, 1.1), drop(222, 182, 0.8), drop(30, 130, 0.8),
    ],
  };
}

function faceMask(id) {
  const m = C.surgicalMask, loop = 'M50 100C14 92 12 160 48 158';
  const body = 'M48 92Q128 78 208 92L212 164Q128 182 44 164Z';
  return {
    defs: [K.cylinderGradient(`${id}-mask`, m)],
    body: [
      K.pipe(loop, '#F4F6F8', 4), K.pipe(K.mirrorX(loop), '#F4F6F8', 4),
      `<path d="${body}" fill="url(#${id}-mask)" stroke="${outline(m)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      // Pleats, each a fold line with a highlight below it.
      ...['M52 114Q128 104 204 114', 'M52 134Q128 126 204 134', 'M52 152Q128 148 204 152'].map(d =>
        `<path d="${d}" fill="none" stroke="${shade(m, 0.28)}" stroke-width="2.2" stroke-linecap="round"/>` +
        `<path d="${d}" transform="translate(0 3)" fill="none" stroke="${tint(m, 0.5)}" stroke-width="1.8" stroke-linecap="round"/>`),
      ...['M48 92L58 91L60 166L44 164Z', K.mirrorX('M48 92L58 91L60 166L44 164Z')].map(d => `<path d="${d}" fill="${shade(m, 0.12)}" stroke="${outline(m)}" stroke-width="2" stroke-linejoin="round"/>`),
      `<path d="M104 90Q128 86 152 90" fill="none" stroke="${C.metal}" stroke-width="4" stroke-linecap="round"/>`,
    ],
  };
}

function parentAndBaby(id) {
  const skin = C.skin, hair = C.hair, top = C.cardigan, sw = C.swaddle;
  const torso = 'M84 94Q128 82 172 94Q190 100 192 124L194 238H62L64 124Q66 100 84 94Z';
  return {
    defs: [K.sphereGradient(`${id}-skin`, skin, { light: 0.35 }), K.sphereGradient(`${id}-hair`, hair, { light: 0.35 }),
      K.cylinderGradient(`${id}-top`, top, { horizontal: true }), K.sphereGradient(`${id}-swaddle`, sw, { light: 0.5 })],
    body: [
      `<rect x="119" y="70" width="18" height="22" fill="${shade(skin, 0.12)}"/>`,
      `<path d="${torso}" fill="url(#${id}-top)" stroke="${outline(top)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<path d="M112 90L128 110L144 90" fill="none" stroke="${shade(top, 0.25)}" stroke-width="2.5" stroke-linejoin="round"/>`,
      // The arm the baby rests on, the baby, then the arm wrapped over the baby.
      K.pipe('M80 104C62 128 60 166 76 184C92 198 150 198 186 182', top, 24),
      `<circle cx="94" cy="140" r="24" fill="url(#${id}-swaddle)" stroke="${outline(sw)}" stroke-width="2.5"/>`,
      `<ellipse cx="148" cy="156" rx="52" ry="25" transform="rotate(-12 148 156)" fill="url(#${id}-swaddle)" stroke="${outline(sw)}" stroke-width="2.5"/>`,
      `<circle cx="94" cy="140" r="15" fill="url(#${id}-skin)" stroke="${outline(skin)}" stroke-width="2"/>`,
      `<path d="M112 164Q142 146 186 134" fill="none" stroke="${shade(sw, 0.25)}" stroke-width="2.2" stroke-linecap="round"/>`,
      K.pipe('M176 104C196 124 200 156 188 172C180 182 166 184 154 180', top, 22),
      // Hands, drawn flattened along each forearm.
      ...[[192, 179, -25], [150, 178, 10]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="7.5" transform="rotate(${a} ${x} ${y})" fill="url(#${id}-skin)" stroke="${outline(skin)}" stroke-width="2"/>`),
      ...[103, 153].map(x => `<circle cx="${x}" cy="54" r="5.5" fill="${skin}" stroke="${outline(skin)}" stroke-width="2"/>`),
      `<circle cx="128" cy="52" r="25" fill="url(#${id}-skin)" stroke="${outline(skin)}" stroke-width="2.5"/>`,
      `<path d="M103 52C100 30 114 24 128 24C146 24 158 32 153 52C146 42 138 38 128 39C116 40 108 44 103 52Z" fill="url(#${id}-hair)" stroke="${outline(hair)}" stroke-width="2" stroke-linejoin="round"/>`,
    ],
  };
}

function globe(id) {
  const sea = C.ocean, R = 76, cx = 120, cy = 136;
  const plane = 'M24 0C24 -3 20 -4.5 15 -4.5L5 -4.5L-7 -22L-13 -22L-6 -4.5L-17 -4.5L-23 -13L-27 -13L-24 0L-27 13L-23 13L-17 4.5L-6 4.5L-13 22L-7 22L5 4.5L15 4.5C20 4.5 24 3 24 0Z';
  return {
    defs: [K.sphereGradient(`${id}-sea`, sea, { light: 0.45 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${id}-sea)" stroke="${outline(sea)}" stroke-width="${STROKE}"/>`,
      `<path d="${K.graticule(cx, cy, R).map(K.smoothOpenPath).join('')}" fill="none" stroke="${tint(sea, 0.55)}" stroke-width="2" stroke-linecap="round" opacity="0.85"/>`,
      K.gloss(`${id}-gloss`, cx - 30, cy - 36, 24, 11),
      // Flight path round the globe, ending in an aeroplane.
      `<path d="M30 206C22 128 110 40 192 58" fill="none" stroke="${C.shoe}" stroke-width="2.5" stroke-dasharray="6 6" stroke-linecap="round"/>`,
      `<path d="${plane}" transform="translate(208 64) rotate(14) scale(1.15)" fill="#F4F6F8" stroke="${C.shoe}" stroke-width="2" stroke-linejoin="round"/>`,
    ],
  };
}

function pregnantPerson(id) {
  const skin = C.skin, hair = C.hair, dress = C.dress, shoe = C.shoe;
  return {
    defs: [K.sphereGradient(`${id}-skin`, skin, { light: 0.35 }), K.sphereGradient(`${id}-hair`, hair, { light: 0.35 }),
      K.cylinderGradient(`${id}-dress`, dress, { horizontal: true })],
    body: [
      K.pipe('M110 196L108 228', skin, 13), K.pipe('M136 196L140 228', skin, 13),
      ...[[103, 233], [145, 233]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="6" fill="${shoe}" stroke="${outline(shoe)}" stroke-width="2"/>`),
      `<rect x="116" y="68" width="14" height="18" fill="${shade(skin, 0.12)}"/>`,
      `<path d="M106 84Q96 92 96 106Q94 118 84 128Q58 148 70 174Q80 188 92 198L152 198Q146 170 148 140Q150 108 142 84Z" fill="url(#${id}-dress)" stroke="${outline(dress)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      K.pipe('M126 94Q118 122 100 144', skin, 12),
      `<circle cx="97" cy="148" r="7.5" fill="url(#${id}-skin)" stroke="${outline(skin)}" stroke-width="2"/>`,
      `<circle cx="150" cy="44" r="11" fill="url(#${id}-hair)" stroke="${outline(hair)}" stroke-width="2"/>`,
      `<circle cx="122" cy="52" r="25" fill="url(#${id}-skin)" stroke="${outline(skin)}" stroke-width="2.5"/>`,
      `<path d="M100 46C104 28 128 22 142 32C152 40 150 58 140 68C138 54 130 44 100 46Z" fill="url(#${id}-hair)" stroke="${outline(hair)}" stroke-width="2" stroke-linejoin="round"/>`,
    ],
  };
}

function bloodBottles(id) {
  const B = K.BLOOD_BOTTLES, edge = C.plasticEdge;
  const label = (x, y, w, hgt) => `<rect x="${x}" y="${y}" width="${w}" height="${hgt}" rx="1.5" fill="#fff" stroke="#C9D6DF" stroke-width="1"/>` +
    [8, 14, 20].map(dy => `<rect x="${x + 3}" y="${y + dy}" width="${w - (dy === 14 ? 10 : 6)}" height="2.5" rx="1.25" fill="#B8C6D1"/>`).join('');
  const adult = ([x, cap]) => {
    const tube = `M${x - 12} 58L${x - 12} 204Q${x - 12} 218 ${x} 218Q${x + 12} 218 ${x + 12} 204L${x + 12} 58Z`;
    return `<path d="${tube}" fill="url(#${id}-glass)"/>` +
      `<path d="M${x - 12} 110L${x + 12} 110L${x + 12} 204Q${x + 12} 218 ${x} 218Q${x - 12} 218 ${x - 12} 204Z" fill="url(#${id}-blood)"/>` +
      label(x - 12, 124, 24, 46) +
      `<path d="${tube}" fill="none" stroke="${edge}" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<rect x="${x - 8}" y="66" width="4" height="40" rx="2" fill="#fff" opacity="0.6"/>` +
      `<rect x="${x - 15}" y="34" width="30" height="28" rx="5" fill="url(#${id}-${cap})" stroke="${outline(C[cap])}" stroke-width="2.5"/>` +
      `<path d="M${x - 8} 39V57M${x} 39V57M${x + 8} 39V57" stroke="${shade(C[cap], 0.2)}" stroke-width="2" stroke-linecap="round"/>`;
  };
  // Paediatric microtubes, with a hinged cap.
  const paediatric = ([x, cap]) => {
    const tube = `M${x - 9} 160L${x - 9} 206Q${x - 9} 218 ${x} 218Q${x + 9} 218 ${x + 9} 206L${x + 9} 160Z`;
    return `<path d="${tube}" fill="url(#${id}-glass)"/>` +
      `<path d="M${x - 9} 184L${x + 9} 184L${x + 9} 206Q${x + 9} 218 ${x} 218Q${x - 9} 218 ${x - 9} 206Z" fill="url(#${id}-blood)"/>` +
      `<path d="${tube}" fill="none" stroke="${edge}" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<rect x="${x - 6}" y="164" width="3" height="18" rx="1.5" fill="#fff" opacity="0.6"/>` +
      `<path d="M${x + 10} 156C${x + 18} 154 ${x + 18} 144 ${x + 10} 142" fill="none" stroke="${outline(C[cap])}" stroke-width="4.5" stroke-linecap="round"/>` +
      `<path d="M${x + 10} 156C${x + 18} 154 ${x + 18} 144 ${x + 10} 142" fill="none" stroke="${C[cap]}" stroke-width="2.5" stroke-linecap="round"/>` +
      `<rect x="${x - 11}" y="152" width="22" height="9" rx="2" fill="url(#${id}-${cap})" stroke="${outline(C[cap])}" stroke-width="2"/>` +
      `<rect x="${x - 10}" y="132" width="20" height="14" rx="4" fill="url(#${id}-${cap})" stroke="${outline(C[cap])}" stroke-width="2"/>`;
  };
  const caps = [...new Set([...B.adult, ...B.paediatric].map(([, c]) => c))];
  return {
    defs: [glassGradient(`${id}-glass`), ...caps.map(c => K.cylinderGradient(`${id}-${c}`, C[c], { horizontal: true })),
      `<linearGradient id="${id}-blood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(C.blood, 0.15)}"/>` +
      `<stop offset="0.35" stop-color="${tint(C.blood, 0.15)}"/><stop offset="1" stop-color="${shade(C.blood, 0.3)}"/></linearGradient>`],
    body: [
      `<ellipse cx="132" cy="220" rx="110" ry="6" fill="#3A4650" opacity="0.12"/>`,
      ...B.adult.map(adult), ...B.paediatric.map(paediatric),
    ],
  };
}

function microscope(id) {
  const M = K.MICROSCOPE, body = C.microscope, dark = C.tubing, [sx, sy, sw, sh] = M.stage, [lx, ly, lr] = M.lamp, [kx, ky, kr] = M.knob;
  const [gx, gy, gw, gh] = M.slide, [cx, cy, cw, ch] = M.condenser;
  const part = d => `<path d="${d}" fill="url(#${id}-body)" stroke="${outline(body)}" stroke-width="2.5" stroke-linejoin="round"/>`;
  return {
    defs: [K.sphereGradient(`${id}-body`, body, { light: 0.6, dark: 0.12 }), K.cylinderGradient(`${id}-dark`, dark, { horizontal: true }),
      K.sphereGradient(`${id}-lamp`, C.lamp, { light: 0.7 }), K.sphereGradient(`${id}-knob`, dark, { light: 0.35 })],
    body: [
      part(M.base),
      `<path d="M${lx - lr} ${ly}A${lr} ${lr} 0 0 1 ${lx + lr} ${ly}Z" fill="url(#${id}-lamp)" stroke="${shade(C.lamp, 0.4)}" stroke-width="2"/>`,
      part(M.arm),
      // The eyepiece, then the head over its base.
      K.pipe(M.eyepiece, dark, 16),
      `<rect x="80" y="14" width="22" height="12" rx="3" transform="rotate(-52 91 20)" fill="${shade(dark, 0.2)}" stroke="${outline(dark)}" stroke-width="2"/>`,
      part(M.head),
      `<path d="${M.nosepiece}" fill="url(#${id}-dark)" stroke="${outline(dark)}" stroke-width="2" stroke-linejoin="round"/>`,
      ...M.objectives.map((d, i) => K.pipe(d, i === 1 ? C.metal : shade(C.metal, 0.12), 9)),
      ...M.objectives.map(d => { const [x, y] = d.match(/L(\S+) (\S+)/).slice(1).map(Number); return `<circle cx="${x}" cy="${y}" r="3.5" fill="${dark}"/>`; }),
      `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="2" fill="url(#${id}-dark)" stroke="${outline(dark)}" stroke-width="2"/>`,
      `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="3" fill="url(#${id}-dark)" stroke="${outline(dark)}" stroke-width="2"/>`,
      `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="1" fill="#E3EEF5" stroke="${C.plasticEdge}" stroke-width="1.5"/>`,
      `<ellipse cx="${gx + gw / 2}" cy="${gy + 2.5}" rx="8" ry="1.8" fill="${C.smear}"/>`,
      `<circle cx="${kx}" cy="${ky}" r="${kr}" fill="url(#${id}-knob)" stroke="${outline(dark)}" stroke-width="2"/>`,
      `<circle cx="${kx}" cy="${ky}" r="${kr * 0.5}" fill="${shade(dark, 0.15)}" stroke="${tint(dark, 0.3)}" stroke-width="2"/>`,
    ],
  };
}

function glassTest(id) {
  const G = K.GLASS_TEST, sk = C.skin, pu = C.purpura, [bx, by, brx, bry] = G.base, [rx, ry, rrx, rry] = G.rim;
  const under = ([x, y]) => ((x - bx) / brx) ** 2 + ((y - by) / bry) ** 2 < 0.9;
  const spot = ([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}-spot)" stroke="${shade(pu, 0.3)}" stroke-width="0.8"/>`;
  // The glass: sides from the base to the rim; the silhouette for its tint, then the edges.
  const silhouette = `M${bx - brx} ${by}L${rx - rrx} ${ry}A${rrx} ${rry} 0 0 1 ${rx + rrx} ${ry}L${bx + brx} ${by}A${brx} ${bry} 0 0 1 ${bx - brx} ${by}Z`;
  const glassEdge = '#8FA9BB';
  return {
    defs: [K.sphereGradient(`${id}-skin`, sk, { light: 0.35, dark: 0.1 }), K.sphereGradient(`${id}-spot`, pu, { light: 0.25 }),
      `<linearGradient id="${id}-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8F2F8" stop-opacity="0.55"/>` +
      `<stop offset="0.25" stop-color="#FFFFFF" stop-opacity="0.2"/><stop offset="0.75" stop-color="#E8F2F8" stop-opacity="0.15"/><stop offset="1" stop-color="#C9DAE6" stop-opacity="0.5"/></linearGradient>`],
    body: [
      `<path d="${G.skin}" fill="url(#${id}-skin)" stroke="${outline(sk)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      ...G.spots.filter(p => !under(p)).map(spot),
      // Pressed skin blanches under the glass, but the purpura does not fade.
      `<ellipse cx="${bx}" cy="${by}" rx="${brx}" ry="${bry}" fill="${tint(sk, 0.45)}"/>`,
      ...G.spots.filter(under).map(spot),
      `<path d="${silhouette}" fill="url(#${id}-glass)"/>`,
      `<ellipse cx="${rx}" cy="${ry}" rx="${rrx}" ry="${rry}" fill="#F4F9FC" fill-opacity="0.35" stroke="${glassEdge}" stroke-width="2.5"/>`,
      `<ellipse cx="${bx}" cy="${by - 7}" rx="${brx - 3}" ry="${bry - 2}" fill="none" stroke="${glassEdge}" stroke-width="1.5" opacity="0.6"/>`,
      `<path d="M${bx - brx} ${by}L${rx - rrx} ${ry}M${bx + brx} ${by}L${rx + rrx} ${ry}M${bx - brx} ${by}A${brx} ${bry} 0 0 0 ${bx + brx} ${by}" fill="none" stroke="${glassEdge}" stroke-width="2.5" stroke-linecap="round"/>`,
      `<path d="M${bx - brx + 14} ${by - 14}L${rx - rrx + 16} ${ry + 18}" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.6"/>`,
      `<path d="M${bx + brx - 12} ${by - 18}L${rx + rrx - 14} ${ry + 22}" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.45"/>`,
    ],
  };
}

function chestXray(id) {
  const X = K.CHEST_XRAY, [fx, fy, fw, fh, fr] = X.film, film = C.xrayFilm;
  const bone = (d, w, o) => `<path d="${d}" fill="none" stroke="#EEF3F6" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
  const ribs = X.ribs.map(([y, drop]) => `M122 ${y}C104 ${y - 12} 66 ${y - 10} 52 ${y + drop}`).join('');
  const front = X.ribs.slice(0, 6).map(([y, drop]) => `M54 ${y + drop}C64 ${y + drop + 16} 84 ${y + drop + 26} 104 ${y + drop + 30}`).join('');
  const vertebrae = Array.from({ length: 12 }, (_, i) => `<rect x="117" y="${30 + i * 17}" width="22" height="13" rx="3" fill="#EEF3F6" opacity="0.3"/>`);
  const [gx, gy, grx, gry] = X.gastricBubble;
  return {
    defs: [`<clipPath id="${id}-film"><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="${fr}"/></clipPath>`,
      `<radialGradient id="${id}-bg" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="${tint(film, 0.08)}"/><stop offset="1" stop-color="${shade(film, 0.3)}"/></radialGradient>`,
      `<radialGradient id="${id}-lung" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="${shade(film, 0.2)}"/><stop offset="0.8" stop-color="${tint(film, 0.1)}"/>` +
      `<stop offset="1" stop-color="${tint(film, 0.25)}"/></radialGradient>`],
    body: [
      `<g clip-path="url(#${id}-film)">`,
      `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="url(#${id}-bg)"/>`,
      `<path d="${X.torso}" fill="#9AA8B5" opacity="0.5"/>`,
      ...[38, 218].map(x => `<circle cx="${x}" cy="66" r="16" fill="#EEF3F6" opacity="0.35"/>`),
      `<path d="M118 118C122 104 138 100 148 112C164 128 186 162 188 194C176 206 148 208 122 204C114 188 112 148 118 118Z" fill="#EEF3F6" opacity="0.18"/>`,
      `<path d="${X.rightLung}" fill="url(#${id}-lung)"/>`,
      `<path d="${X.leftLung}" fill="url(#${id}-lung)"/>`,
      `<ellipse cx="${gx}" cy="${gy}" rx="${grx}" ry="${gry}" fill="${shade(film, 0.1)}" opacity="0.8"/>`,
      ...vertebrae,
      bone(front + K.mirrorX(front), 4, 0.22),
      bone(ribs + K.mirrorX(ribs), 6, 0.5),
      bone(X.clavicle + K.mirrorX(X.clavicle), 8, 0.65),
      `</g>`,
      `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="${fr}" fill="none" stroke="#5D6B78" stroke-width="${STROKE}"/>`,
    ],
  };
}

function pipette(id) {
  const P = K.PIPETTE, [x, y, a, s] = P.at, body = C.pipette, edge = C.plasticEdge, [wx, wy, ww, wh] = P.window, [dx, dy] = P.drop;
  return {
    defs: [K.cylinderGradient(`${id}-body`, body, { horizontal: true }), K.cylinderGradient(`${id}-shaft`, '#C9D3DC', { horizontal: true }),
      K.cylinderGradient(`${id}-button`, C.vialCap, { horizontal: true }), K.cylinderGradient(`${id}-liquid`, C.fluid, { horizontal: true })],
    body: [
      `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`,
      `<rect x="${P.rod[0]}" y="${P.rod[1]}" width="${P.rod[2]}" height="${P.rod[3]}" fill="${C.metal}" stroke="${outline(C.metal)}" stroke-width="1.5"/>`,
      `<rect x="${P.button[0]}" y="${P.button[1]}" width="${P.button[2]}" height="${P.button[3]}" rx="4" fill="url(#${id}-button)" stroke="${outline(C.vialCap)}" stroke-width="2"/>`,
      `<path d="${P.ejector}" fill="${shade(body, 0.1)}" stroke="${outline(body)}" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="${P.hook}" fill="url(#${id}-body)" stroke="${outline(body)}" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="${P.body}" fill="url(#${id}-body)" stroke="${outline(body)}" stroke-width="${STROKE}"/>`,
      `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="2" fill="#2F3A44"/>`,
      ...[0, 1, 2].map(i => `<rect x="${wx + 3}" y="${wy + 3 + i * 8}" width="${ww - 6}" height="4" rx="1" fill="#9FE0B0"/>`),
      `<rect x="-12" y="-84" width="4" height="100" rx="2" fill="#fff" opacity="0.6"/>`,
      `<path d="${P.shaft}" fill="url(#${id}-shaft)" stroke="${outline('#C9D3DC')}" stroke-width="2" stroke-linejoin="round"/>`,
      `<path d="${P.tip}" fill="${C.pipetteTip}" fill-opacity="0.85" stroke="${edge}" stroke-width="1.8" stroke-linejoin="round"/>`,
      `<path d="${P.liquid}" fill="url(#${id}-liquid)"/>`,
      `<path d="${K.dropPath(dx, dy, 0.55)}" fill="${C.fluid}" stroke="${shade(C.fluid, 0.35)}" stroke-width="1.2"/>`,
      `</g>`,
    ],
  };
}

function wellPlate(id) {
  const P = K.WELL_PLATE, pt = (u, v) => K.platePoint(u, v).map(n).join(','), edge = C.plasticEdge, el = C.elisa;
  const top = [pt(10, 0), pt(P.W, 0), pt(P.W, P.D), pt(0, P.D), pt(0, 10)];
  const [fl, fr] = [K.platePoint(0, P.D), K.platePoint(P.W, P.D)];
  return {
    defs: [`<linearGradient id="${id}-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="${C.plastic}"/></linearGradient>`],
    body: [
      `<polygon points="${n(fl[0])},${n(fl[1])} ${n(fr[0])},${n(fr[1])} ${n(fr[0])},${n(fr[1] + P.side)} ${n(fl[0])},${n(fl[1] + P.side)}" fill="${shade(C.plastic, 0.12)}" stroke="${edge}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<polygon points="${top.join(' ')}" fill="url(#${id}-top)" stroke="${edge}" stroke-width="2.5" stroke-linejoin="round"/>`,
      // ELISA: two columns of standards fading down, then samples (yellow where positive).
      ...K.plateWells().map(({ x, y, rx, ry, level }) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rx)}" ry="${n(ry)}" fill="${shade(C.plastic, 0.2)}"/>` +
        `<ellipse cx="${n(x)}" cy="${n(y + ry * 0.2)}" rx="${n(rx * 0.82)}" ry="${n(ry * 0.72)}" fill="${level ? mix(tint(el, 0.85), shade(el, 0.08), level) : '#FFFFFF'}"/>`),
    ],
  };
}

function centrifuge(id) {
  const X = K.CENTRIFUGE, [tx, ty, trx, try_] = X.top, h = X.height, [cx, cy, crx, cry] = X.chamber, [rx, ry, rrx, rry] = X.rotor, [lx, ly, lrx, lry] = X.lid, body = C.centrifuge;
  const [px, py, pw, ph] = X.panel, [bx, by, br] = X.button, caps = ['#F4F6F8', '#F3B6C3', C.capYellow];
  const slots = K.rotorSlots().sort((p, q) => p.y - q.y);
  return {
    defs: [K.cylinderGradient(`${id}-side`, body, { horizontal: true }), K.sphereGradient(`${id}-top`, body, { light: 0.6, dark: 0.1 }), K.sphereGradient(`${id}-rotor`, C.rotor, { light: 0.6 }),
      K.sphereGradient(`${id}-lid`, shade(body, 0.05), { light: 0.5 })],
    body: [
      // The lid, open behind.
      `<ellipse cx="${lx}" cy="${ly}" rx="${lrx}" ry="${lry}" fill="url(#${id}-lid)" stroke="${outline(body)}" stroke-width="${STROKE}"/>`,
      `<ellipse cx="${lx}" cy="${ly - 4}" rx="${lrx - 26}" ry="${lry - 18}" fill="${tint(C.fluid, 0.55)}" stroke="${shade(body, 0.3)}" stroke-width="2"/>`,
      `<path d="M${tx - trx} ${ty}L${tx - trx} ${ty + h}A${trx} ${try_} 0 0 0 ${tx + trx} ${ty + h}L${tx + trx} ${ty}Z" fill="url(#${id}-side)" stroke="${outline(body)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<ellipse cx="${tx}" cy="${ty}" rx="${trx}" ry="${try_}" fill="url(#${id}-top)" stroke="${outline(body)}" stroke-width="${STROKE}"/>`,
      `<ellipse cx="${cx}" cy="${cy}" rx="${crx}" ry="${cry}" fill="#4A5560" stroke="${shade(body, 0.4)}" stroke-width="2"/>`,
      `<ellipse cx="${rx}" cy="${ry}" rx="${rrx}" ry="${rry}" fill="url(#${id}-rotor)" stroke="${outline(C.rotor)}" stroke-width="2"/>`,
      // Tubes in balanced pairs; empty slots show as holes.
      ...slots.map(({ x, y, loaded }, k) => loaded
        ? `<ellipse cx="${n(x)}" cy="${n(y - 2)}" rx="7" ry="4.5" fill="${caps[k % 3]}" stroke="${outline(caps[k % 3])}" stroke-width="1.5"/>`
        : `<ellipse cx="${n(x)}" cy="${n(y)}" rx="5.5" ry="3" fill="#4A5560"/>`),
      `<ellipse cx="${rx}" cy="${ry}" rx="10" ry="5" fill="${shade(C.rotor, 0.25)}" stroke="${outline(C.rotor)}" stroke-width="1.5"/>`,
      `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="3" fill="#2F3A44"/>`,
      `<rect x="${px + 6}" y="${py + 5}" width="${pw - 12}" height="${ph - 10}" rx="1.5" fill="#9FE0B0"/>`,
      `<circle cx="${bx}" cy="${by}" r="${br}" fill="${C.vialCap}" stroke="${outline(C.vialCap)}" stroke-width="2"/>`,
    ],
  };
}

// ------------------------------------------------------------ transmission

// A neutral head-and-shoulders figure with its base centre at (x, y), scaled by s.
function bust(id, x, y, s) {
  const B = K.TRANSMISSION.bust, [hx, hy, hr] = B.head, fig = C.silhouette, w = n(STROKE / s);
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="${B.neck}" fill="${shade(fig, 0.15)}"/>` +
    `<path d="${B.shoulders}" fill="url(#${id}-figure)" stroke="${outline(fig)}" stroke-width="${w}"/>` +
    `<circle cx="${hx}" cy="${hy}" r="${hr}" fill="url(#${id}-figure)" stroke="${outline(fig)}" stroke-width="${w}"/></g>`;
}
const figureDefs = id => [K.sphereGradient(`${id}-figure`, C.silhouette, { light: 0.45 })];
const arrowMarks = ({ shaft, head }) => `<path d="${shaft}" fill="none" stroke="${C.arrow}" stroke-width="4.5" stroke-linecap="round"/>` +
  `<polygon points="${head}" fill="${C.arrow}" stroke="${C.arrow}" stroke-width="1.5" stroke-linejoin="round"/>`;
// An open hand in the figures' colour, centred at (x, y), scaled by s and mirrored if flip.
function neutralHand(id, x, y, s, flip = false) {
  const H = K.HAND, fig = C.silhouette, widths = [18, 18, 18, 16, 20];
  const fingers = H.fingers.map(([[x0, y0], [x1, y1]]) => `M${x0} ${y0}L${x1} ${y1}`);
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s}) translate(-128 -140)">` +
    fingers.map((d, i) => `<path d="${d}" stroke="${outline(fig)}" stroke-width="${widths[i] + 6}" stroke-linecap="round"/>`).join('') +
    [H.palm, H.wrist].map(d => `<path d="${d}" fill="${outline(fig)}" stroke="${outline(fig)}" stroke-width="6" stroke-linejoin="round"/>`).join('') +
    fingers.map((d, i) => `<path d="${d}" stroke="url(#${id}-hand)" stroke-width="${widths[i]}" stroke-linecap="round"/>`).join('') +
    [H.palm, H.wrist].map(d => `<path d="${d}" fill="url(#${id}-hand)"/>`).join('') + `</g>`;
}
const handDefs = id => [`<radialGradient id="${id}-hand" gradientUnits="userSpaceOnUse" cx="120" cy="120" r="130" fx="96" fy="80">` +
  `<stop offset="0" stop-color="${tint(C.silhouette, 0.4)}"/><stop offset="0.55" stop-color="${C.silhouette}"/><stop offset="1" stop-color="${shade(C.silhouette, 0.16)}"/></radialGradient>`];
const germ = ([x, y, kind, a = 0]) => kind === 'rod'
  ? `<rect x="-7" y="-3.5" width="14" height="7" rx="3.5" transform="translate(${x} ${y}) rotate(${a})" fill="${C.gramNegative}" stroke="${outline(C.gramNegative)}" stroke-width="1.3"/>`
  : `<circle cx="${x}" cy="${y}" r="4" fill="${C.gramPositive}" stroke="${outline(C.gramPositive)}" stroke-width="1.3"/>`;

function dropletTransmission(id) {
  const T = K.TRANSMISSION, fl = C.fluid;
  return {
    defs: [...figureDefs(id), K.sphereGradient(`${id}-drop`, fl, { light: 0.55 })],
    body: [
      ...T.pair.map(([x, y, s]) => bust(id, x, y, s)),
      // Large droplets, falling within a short distance.
      ...T.droplets.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}-drop)" stroke="${shade(fl, 0.35)}" stroke-width="1.5"/>`),
      arrowMarks(K.curvedArrow(...T.over)),
    ],
  };
}

function airborneTransmission(id) {
  const T = K.TRANSMISSION, fl = C.fluid;
  const air = T.air.map((y, k) => K.smoothOpenPath(Array.from({ length: 31 }, (_, i) => [86 + i * 5, y + 5 * Math.sin(i / 30 * 2 * Math.PI * 2.5 + k)]))).join('');
  return {
    defs: figureDefs(id),
    body: [
      `<path d="${air}" fill="none" stroke="${tint(fl, 0.2)}" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>`,
      ...T.pair.map(([x, y, s]) => bust(id, x, y, s)),
      // Fine aerosol, drifting well beyond the nearest person.
      ...T.aerosol.map(([x, y], k) => `<circle cx="${n(x)}" cy="${n(y)}" r="${2 + (k % 3) * 0.5}" fill="${shade(fl, 0.15)}"/>`),
      arrowMarks(K.curvedArrow(...T.over)),
    ],
  };
}

function contactTransmission(id) {
  const T = K.TRANSMISSION.hands;
  return {
    defs: handDefs(id),
    body: [
      neutralHand(id, ...T.at[0], T.scale), neutralHand(id, ...T.at[1], T.scale, true),
      ...T.germs.map(germ),
      arrowMarks(K.straightArrow(...T.arrow, 14)),
    ],
  };
}

function faecalOralTransmission(id) {
  const F = K.TRANSMISSION.faecalOral, [nx, ny] = F.nappy, [hx, hy, hs] = F.hand, [mx, my] = F.mug, nap = C.nappy, mug = '#F4F6F8';
  return {
    defs: [...handDefs(id), K.cylinderGradient(`${id}-nappy`, nap, { horizontal: true }), K.cylinderGradient(`${id}-mug`, mug, { horizontal: true })],
    body: [
      // Nappy, hands, then food or drink.
      `<g transform="translate(${nx} ${ny})"><path d="${K.TRANSMISSION.nappy}" fill="url(#${id}-nappy)" stroke="${outline(nap)}" stroke-width="${STROKE}" stroke-linejoin="round"/>` +
        `<path d="M-31 -2C-25 6 -20 14 -18 22M31 -2C25 6 20 14 18 22" fill="none" stroke="${shade(nap, 0.25)}" stroke-width="2" stroke-dasharray="3 3"/>` +
        `<rect x="-38" y="-24" width="76" height="8" rx="3" fill="${C.hat}" stroke="${outline(C.hat)}" stroke-width="2"/>` +
        [-1, 1].map(s => `<rect x="${s > 0 ? 32 : -42}" y="-18" width="10" height="9" rx="2" fill="${C.vialCap}" stroke="${outline(C.vialCap)}" stroke-width="1.5"/>`).join('') + `</g>`,
      neutralHand(id, hx, hy, hs),
      `<g transform="translate(${mx} ${my})"><path d="M26 -10C42 -10 42 16 24 16" fill="none" stroke="${outline(mug)}" stroke-width="10" stroke-linecap="round"/><path d="M26 -10C42 -10 42 16 24 16" fill="none" stroke="${mug}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M-28 -24L28 -24L25 22Q24 30 16 30L-16 30Q-24 30 -25 22Z" fill="url(#${id}-mug)" stroke="${outline(mug)}" stroke-width="${STROKE}" stroke-linejoin="round"/>` +
        `<ellipse cy="-20" rx="25" ry="5" fill="${tint(C.fluid, 0.3)}" stroke="${shade(C.fluid, 0.3)}" stroke-width="1.5"/></g>`,
      ...[[hx - 6, hy + 2, 'rod', -20], [hx + 8, hy + 16, 'coccus'], [mx - 10, my - 19, 'coccus'], [mx + 8, my - 22, 'rod', 10]].map(germ),
      ...F.arrows.map(([p, c, q]) => arrowMarks(K.curvedArrow(p, c, q))),
    ],
  };
}

function vectorTransmission(id) {
  const V = K.TRANSMISSION.vector, [mx, my, ms] = V.mosquito, m = mosquito(`${id}-mosquito`);
  return {
    defs: [...figureDefs(id), ...m.defs],
    body: [
      ...V.pair.map(([x, y, s]) => bust(id, x, y, s)),
      `<g transform="translate(${mx} ${my}) scale(${ms}) translate(-128 -128)">`, ...m.body, `</g>`,
      ...V.arrows.map(([p, c, q]) => arrowMarks(K.curvedArrow(p, c, q))),
    ],
  };
}

function verticalTransmission(id) {
  const V = K.TRANSMISSION.vertical, fig = C.silhouette, [hx, hy, hr] = V.head, [ux, uy, urx, ury] = V.uterus, F = V.fetus, fetal = tint(C.silhouette, 0.45);
  const [fhx, fhy, fhr] = F.head, [fbx, fby, fbrx, fbry, fba] = F.body;
  const virion = ([x, y]) => `<path d="${Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4; return `M${n(x + 5 * Math.cos(a))} ${n(y + 5 * Math.sin(a))}L${n(x + 8 * Math.cos(a))} ${n(y + 8 * Math.sin(a))}`; }).join('')}" stroke="${shade(C.spike, 0.2)}" stroke-width="2" stroke-linecap="round"/>` +
    `<circle cx="${x}" cy="${y}" r="5" fill="${C.spike}" stroke="${outline(C.spike)}" stroke-width="1.2"/>`;
  return {
    defs: [...figureDefs(id), K.sphereGradient(`${id}-uterus`, '#F4C9CF', { light: 0.5 }), K.sphereGradient(`${id}-fetus`, fetal, { light: 0.5 })],
    body: [
      `<path d="${V.body}" fill="url(#${id}-figure)" stroke="${outline(fig)}" stroke-width="${STROKE}" stroke-linejoin="round"/>`,
      `<circle cx="${hx}" cy="${hy}" r="${hr}" fill="url(#${id}-figure)" stroke="${outline(fig)}" stroke-width="${STROKE}"/>`,
      // The uterus, with the placenta and a curled fetus.
      `<ellipse cx="${ux}" cy="${uy}" rx="${urx}" ry="${ury}" fill="url(#${id}-uterus)" stroke="${shade('#F4C9CF', 0.4)}" stroke-width="2"/>`,
      `<path d="${V.placenta}" fill="${C.placenta}" stroke="${outline(C.placenta)}" stroke-width="1.5"/>`,
      `<path d="${F.cord}" fill="none" stroke="${shade(C.cordJelly, 0.3)}" stroke-width="3" stroke-linecap="round"/>`,
      `<ellipse cx="${fbx}" cy="${fby}" rx="${fbrx}" ry="${fbry}" transform="rotate(${fba} ${fbx} ${fby})" fill="url(#${id}-fetus)" stroke="${outline(fetal)}" stroke-width="2"/>`,
      `<circle cx="${fhx}" cy="${fhy}" r="${fhr}" fill="url(#${id}-fetus)" stroke="${outline(fetal)}" stroke-width="2"/>`,
      ...V.pathogens.map(virion),
      arrowMarks(K.curvedArrow(...V.arrow)),
    ],
  };
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
  'chlamydia': chlamydia,
  'borrelia': borrelia,
  'enterococcus': enterococcus,
  'hepatitis-c': hepatitisC,
  'cmv-infected-cell': cmvCell,
  'leishmania': leishmania,
  'germinal-centre': germinalCentre,
  't-helper-subsets': thSubsets,
  'interferon-signalling': interferonSignalling,
  'complement-cascade': complementCascade,
  'fc-receptor': fcReceptor,
  'mrsa': mrsa,
  'carbapenemase': carbapenemase,
  'antimicrobial-stewardship': stewardship,
  'heart-valve': heartValve,
  'meninges': meninges,
  'oral-rehydration': ors,
  'pipette': pipette,
  'well-plate': wellPlate,
  'centrifuge': centrifuge,
  'droplet-transmission': dropletTransmission,
  'airborne-transmission': airborneTransmission,
  'contact-transmission': contactTransmission,
  'faecal-oral-transmission': faecalOralTransmission,
  'vector-borne-transmission': vectorTransmission,
  'vertical-transmission': verticalTransmission,
};

const catalogue = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalogue.json'), 'utf8'));
for (const [id, draw] of Object.entries(DRAWINGS)) {
  const meta = catalogue.icons.find(icon => icon.id === id);
  if (!meta) throw new Error(`No catalogue entry for "${id}"`);
  const { defs, body } = draw(id);
  K.writeIcon(ROOT, meta.file, K.svgDocument({ id, title: meta.name, description: meta.description, defs, body }));
  // Skin-tone versions of the people icons: redrawn with the palette's skin and hair swapped.
  for (const [toneId, file] of Object.entries(meta.toneFiles || {})) {
    const tone = K.SKIN_TONES.find(t => t.id === toneId), saved = [C.skin, C.hair];
    [C.skin, C.hair] = [tone.skin, tone.hair];
    const svgId = `${id}-${toneId}`, drawn = draw(svgId);
    [C.skin, C.hair] = saved;
    K.writeIcon(ROOT, file, K.svgDocument({ id: svgId, title: `${meta.name} (${tone.label.toLowerCase()} skin tone)`, description: meta.description, ...drawn }));
  }
}
