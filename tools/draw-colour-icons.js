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
