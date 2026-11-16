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
const LINE_HEIGHT = 29;
const ALERT = '#C0392B';
const escapeText = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// An icon placed with its centre at (x, y), `size` px across, turned by `rotate` degrees.
const place = ({ x, y, size, rotate = 0 }, inner) =>
  `<g transform="translate(${x} ${y})${rotate ? ` rotate(${rotate})` : ''} scale(${n(size / 256)}) translate(-128 -128)">${inner}</g>`;

// Each figure: canvas size; regions [x, y, width, height, corner radius, palette colour], the
// tissues that steps happen inside; icons [icon id, x, y, size, rotate]; arrows
// [[x0, y0], [x1, y1]], or [[x0, y0], [cx, cy], [x1, y1]] to bend towards a control point; and
// labels [text, x, y] (centred on x, with y the baseline of the first line; | starts a new line).
// blocks [x, y] mark where a pathway is interrupted (a barred ring), and alerts are labels for
// them, such as gene names: set in red italics, so they still stand apart in single colour.
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
  't-cell-development': {
    title: 'T-cell development in the thymus',
    description: 'A haematopoietic stem cell from the bone marrow seeds the thymus, where early thymocytes rearrange their T-cell receptor genes by V(D)J recombination, ' +
      'express a T-cell receptor and are tested by positive and negative selection; the survivors leave as naive CD4 and CD8 T cells for the lymph nodes and spleen.',
    width: 1200, height: 640,
    regions: [[262, 24, 918, 374, 70, 'thymus']],
    icons: [
      ['bone', 110, 118, 160], ['haematopoietic-stem-cell', 110, 400, 180],
      ['t-cell', 372, 190, 140], ['vdj-recombination', 575, 190, 150], ['t-cell-receptor', 775, 190, 150], ['immune-synapse', 1010, 220, 200],
      ['cd4-t-cell', 962, 512, 130], ['cd8-t-cell', 1072, 530, 118],
      ['lymph-node', 700, 518, 150], ['spleen', 520, 518, 150],
    ],
    arrows: [
      [[110, 240], [110, 300]], [[204, 372], [262, 300], [300, 222]],
      [[450, 190], [492, 190]], [[658, 190], [698, 190]], [[854, 192], [902, 204]],
      [[1010, 330], [1010, 432]], [[882, 518], [792, 518]],
    ],
    labels: [
      ['Bone marrow', 110, 222], ['Haematopoietic|stem cell', 110, 516],
      ['Early|thymocyte', 372, 294], ['V(D)J|recombination', 575, 294], ['T-cell|receptor', 775, 294], ['Positive and|negative selection', 1010, 66], ['Thymus', 344, 374],
      ['Naive CD4 and CD8 T cells', 1016, 624], ['Lymph nodes and spleen', 610, 624],
    ],
  },
  'scid-blocks': {
    title: 'Where severe combined immunodeficiency blocks T-cell development',
    description: 'T-cell development from the bone marrow through the thymus, marked where inherited defects stop it: AK2 in the stem cell; IL2RG, JAK3, IL7R and ADA in the early thymocyte; ' +
      'RAG1, RAG2 and DCLRE1C (Artemis) at V(D)J recombination; the CD3 chains at the T-cell receptor; CIITA, RFXANK and ZAP70 at selection; and FOXN1 or 22q11 deletion in the thymus itself.',
    width: 1200, height: 712,
    regions: [[262, 24, 918, 446, 70, 'thymus']],
    icons: [
      ['bone', 110, 118, 160], ['haematopoietic-stem-cell', 110, 400, 180],
      ['t-cell', 372, 190, 140], ['vdj-recombination', 575, 190, 150], ['t-cell-receptor', 775, 190, 150], ['immune-synapse', 1010, 220, 200],
      ['cd4-t-cell', 962, 584, 130], ['cd8-t-cell', 1072, 602, 118],
      ['lymph-node', 700, 590, 150], ['spleen', 520, 590, 150],
    ],
    arrows: [
      [[110, 240], [110, 300]], [[204, 372], [262, 300], [300, 222]],
      [[450, 190], [492, 190]], [[658, 190], [698, 190]], [[854, 192], [902, 204]],
      [[1010, 404], [1010, 504]], [[882, 590], [792, 590]],
    ],
    labels: [
      ['Bone marrow', 110, 222], ['Haematopoietic|stem cell', 110, 516],
      ['Early|thymocyte', 372, 294], ['V(D)J|recombination', 575, 294], ['T-cell|receptor', 775, 294], ['Positive and|negative selection', 1010, 66], ['Thymus', 330, 444],
      ['Naive CD4 and CD8 T cells', 1016, 696], ['Lymph nodes and spleen', 610, 696],
    ],
    blocks: [[32, 330], [436, 126], [650, 126], [850, 126], [1116, 138], [398, 436]],
    alerts: [
      ['AK2', 110, 580], ['IL2RG, JAK3,|IL7R, ADA', 372, 360], ['RAG1, RAG2,|DCLRE1C', 575, 360], ['CD3D, CD3E,|CD247', 775, 360],
      ['CIITA, RFXANK, ZAP70', 1010, 384], ['FOXN1, 22q11 deletion', 548, 444],
    ],
  },
};

function draw(id, { title, description, width, height, regions = [], icons, arrows, labels, blocks = [], alerts = [] }) {
  const lines = (list, attrs) => list.map(([label, x, y]) => label.split('|').map((line, i) =>
    `<text x="${x}" y="${y + i * LINE_HEIGHT}" ${FONT} ${attrs}>${escapeText(line)}</text>`).join('')).join('');
  const text = (fill, alertFill) => lines(labels, `fill="${fill}"`) + lines(alerts, `font-style="italic" fill="${alertFill}"`);
  // A barred ring: the pathway stops here.
  const block = ([x, y], stroke) => `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="${stroke}" stroke-width="6"/>` +
    `<path d="M${x - 10.6} ${y - 10.6}L${x + 10.6} ${y + 10.6}" stroke="${stroke}" stroke-width="6"/>`;
  const withLabels = (svg, fill, alertFill) => svg.replace('</svg>', `${text(fill, alertFill)}</svg>`);
  const marks = arrows.map(points => (points.length === 3 ? K.curvedArrow(...points, 22) : K.straightArrow(...points, 22)));
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
  blocks.forEach(b => body.push(block(b, ALERT)));
  const full = colour.finish(id, K.svgDocument({ id, title, description, defs, body, width, height }));
  K.writeIcon(ROOT, `figures/${id}.svg`, full);
  K.writeIcon(ROOT, `figures/${id}-labelled.svg`, withLabels(full, C.arrow, ALERT));

  // Single colour.
  const marksAndIcons = regions.map(region => `<rect ${box(region)} fill="none" stroke="${INK}" stroke-width="5"/>`);
  marks.forEach(a => marksAndIcons.push(`<path d="${a.shaft}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><polygon points="${a.head}" fill="${INK}"/>`));
  icons.forEach(([icon, x, y, size, rotate]) => marksAndIcons.push(place({ x, y, size, rotate }, mono.DRAWINGS[icon]().join(''))));
  blocks.forEach(b => marksAndIcons.push(block(b, INK)));
  const plain = K.svgDocument({ id: `${id}-mono`, title: `${title} (single colour)`, description, defs: [], body: marksAndIcons, width, height });
  K.writeIcon(ROOT, `figures/${id}-mono.svg`, plain);
  K.writeIcon(ROOT, `figures/${id}-mono-labelled.svg`, withLabels(plain, INK, INK));
}

for (const [id, figure] of Object.entries(FIGURES)) draw(id, figure);
if (colour.clippedSoft.length) { console.error(`Soft shapes inside a clip path: ${colour.clippedSoft.join(', ')}`); process.exitCode = 1; }
