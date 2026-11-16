'use strict';

// Draws the figures: wide diagrams assembled from the icons, in full colour and single colour.
// Each figure places icons (drawn by the two icon scripts, so they match exactly) and joins
// them with arrows. Every figure is written with and without labels (the labels are ordinary
// SVG text, so they stay editable); the two share one layout.
// Run: node tools/draw-figures.js

const path = require('path');
const K = require('./svg-kit');
const colour = require('./draw-colour-icons');
const mono = require('./draw-mono-icons');
const { PALETTE: C, INK, round: n } = K;

const ROOT = path.join(__dirname, '..');
const FONT = 'font-family="Arial, Helvetica, sans-serif" font-size="24" text-anchor="middle"';
const escapeText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// An icon placed with its centre at (x, y), `size` px across, turned by `rotate` degrees.
const place = ({ x, y, size, rotate = 0 }, inner) =>
  `<g transform="translate(${x} ${y})${rotate ? ` rotate(${rotate})` : ''} scale(${n(size / 256)}) translate(-128 -128)">${inner}</g>`;

// Each figure: canvas size; regions [x, y, width, height, corner radius, palette colour], the
// tissues that steps happen inside; icons [icon id, x, y, size, rotate]; arrows
// [[x0, y0], [x1, y1]]; and labels [text, x, y] (centred on x, with y the baseline).
const FIGURES = {
  'vaccine-response': {
    title: 'Immune response to a vaccine',
    description: 'A vaccine is taken up by a dendritic cell, which travels to a lymph node and activates a helper T cell; the T cell helps a B cell, ' +
      'which enters a germinal centre and gives rise to memory B cells and to plasma cells, which secrete antibodies.',
    width: 1200, height: 690,
    regions: [[456, 24, 728, 420, 70, 'lymphNode']],
    icons: [
      ['vaccine', 100, 150, 160], ['dendritic-cell', 330, 150, 170],
      ['t-cell', 602, 170, 150], ['b-cell', 812, 170, 150], ['germinal-centre', 1040, 240, 196],
      ['b-cell', 1080, 572, 130], ['plasma-cell', 850, 572, 150],
      ['igg-antibody', 630, 540, 100, -18], ['igg-antibody', 530, 604, 108, 12], ['igg-antibody', 420, 546, 100, 25], ['igg-antibody', 318, 602, 96, -10],
    ],
    arrows: [
      [[194, 150], [240, 150]], [[430, 150], [508, 158]], [[690, 170], [728, 170]], [[898, 178], [940, 196]],
      [[1062, 346], [1076, 494]], [[984, 334], [896, 492]],
      [[766, 572], [700, 572]],
    ],
    labels: [
      ['Vaccine', 100, 262], ['Dendritic cell', 330, 262],
      ['Helper T cell', 602, 276], ['B cell', 812, 276], ['Germinal centre', 1040, 124], ['Lymph node', 600, 416],
      ['Memory B cell', 1080, 672], ['Plasma cell', 850, 672], ['Antibodies', 474, 680],
    ],
  },
};

function draw(id, { title, description, width, height, regions = [], icons, arrows, labels }) {
  const text = fill => labels.map(([label, x, y]) => `<text x="${x}" y="${y}" ${FONT} fill="${fill}">${escapeText(label)}</text>`).join('');
  const withLabels = (svg, fill) => svg.replace('</svg>', `${text(fill)}</svg>`);
  const marks = arrows.map(([p, q]) => K.straightArrow(p, q, 22));
  const box = ([x, y, w, h, r]) => `x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"`;

  // Full colour: each icon is drawn under its own id, so no two share a gradient.
  const defs = [], body = [];
  regions.forEach(region => body.push(`<rect ${box(region)} fill="${K.tint(C[region[5]], 0.72)}" stroke="${K.shade(C[region[5]], 0.25)}" stroke-width="3"/>`));
  marks.forEach(a => body.push(`<path d="${a.shaft}" fill="none" stroke="${C.arrow}" stroke-width="7" stroke-linecap="round"/>` +
    `<polygon points="${a.head}" fill="${C.arrow}" stroke="${C.arrow}" stroke-width="2" stroke-linejoin="round"/>`));
  icons.forEach(([icon, x, y, size, rotate], i) => {
    const drawn = colour.DRAWINGS[icon](`${id}-${i}-${icon}`);
    defs.push(...drawn.defs);
    body.push(place({ x, y, size, rotate }, drawn.body.join('')));
  });
  const full = colour.finish(id, K.svgDocument({ id, title, description, defs, body, width, height }));
  K.writeIcon(ROOT, `figures/${id}.svg`, full);
  K.writeIcon(ROOT, `figures/${id}-labelled.svg`, withLabels(full, C.arrow));

  // Single colour.
  const lines = regions.map(region => `<rect ${box(region)} fill="none" stroke="${INK}" stroke-width="5"/>`);
  marks.forEach(a => lines.push(`<path d="${a.shaft}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><polygon points="${a.head}" fill="${INK}"/>`));
  icons.forEach(([icon, x, y, size, rotate]) => lines.push(place({ x, y, size, rotate }, mono.DRAWINGS[icon]().join(''))));
  const plain = K.svgDocument({ id: `${id}-mono`, title: `${title} (single colour)`, description, defs: [], body: lines, width, height });
  K.writeIcon(ROOT, `figures/${id}-mono.svg`, plain);
  K.writeIcon(ROOT, `figures/${id}-mono-labelled.svg`, withLabels(plain, INK));
}

for (const [id, figure] of Object.entries(FIGURES)) draw(id, figure);
if (colour.clippedSoft.length) { console.error(`Soft shapes inside a clip path: ${colour.clippedSoft.join(', ')}`); process.exitCode = 1; }
