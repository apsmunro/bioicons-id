'use strict';

// Draws the pilot icon set into the files named in catalogue.json.
// Titles and descriptions embedded in each SVG also come from the catalogue.
// Run: node tools/draw-pilot-icons.js

const fs = require('fs');
const path = require('path');
const K = require('./svg-kit');
const { PALETTE: C, STROKE, mix, tint, shade, outline, round: n } = K;

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

// ----------------------------------------------------------------- viruses

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

function adenovirus(id) {
  const base = C.capsid, S = 66;
  const { vertices: V, visibleFaces: visible, visibleVertices: shown } = K.icosahedron();
  const project = v => [128 + S * v[0], 128 - S * v[1]];
  const light = K.vec.unit([-0.45, 0.6, 0.75]);

  const facets = visible.map(f => {
    const colour = mix(shade(base, 0.25), tint(base, 0.5), Math.max(0, K.vec.dot(f.nrm, light)));
    const [A, B, D] = f.idx.map(i => project(V[i]));
    let out = `<polygon points="${[A, B, D].map(p => p.map(n).join(',')).join(' ')}" fill="${colour}" stroke="${shade(base, 0.4)}" stroke-width="1.5" stroke-linejoin="round"/>`;
    // Hexon capsomeres: interior points of a 6-step barycentric grid.
    for (let a = 1; a <= 4; a++) for (let b = 1; a + b <= 5; b++) {
      const c = 6 - a - b;
      const p = [0, 1].map(d => (a * A[d] + b * B[d] + c * D[d]) / 6);
      out += `<circle cx="${n(p[0])}" cy="${n(p[1])}" r="3.6" fill="${tint(colour, 0.22)}" stroke="${shade(colour, 0.18)}" stroke-width="0.8"/>`;
    }
    return out;
  });

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

// ------------------------------------------------------------ immune cells

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

// --------------------------------------------------------------- treatment

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
  if (!meta) throw new Error(`No catalogue entry for "${id}"`);
  const { defs, body } = draw(id);
  K.writeIcon(ROOT, meta.file, K.svgDocument({ id, title: meta.name, description: meta.description, defs, body }));
}
