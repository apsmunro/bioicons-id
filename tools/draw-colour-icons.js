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
  const right = 'M2 0C2 -18 14 -26 28 -24C42 -22 54 -10 62 0C54 10 42 22 28 24C14 26 2 18 2 0Z';
  const left = 'M-2 0C-2 -18 -14 -26 -28 -24C-42 -22 -54 -10 -62 0C-54 10 -42 22 -28 24C-14 26 -2 18 -2 0Z';
  return {
    defs: [K.sphereGradient(`${id}-body`, base), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(128 128) rotate(-30) scale(1.25)">`,
      `<ellipse rx="80" ry="44" fill="${C.capsule}" opacity="0.85" stroke="${tint(base, 0.35)}" stroke-width="2"/>`,
      `<ellipse rx="72" ry="37" fill="none" stroke="${tint(base, 0.5)}" stroke-width="1.5" stroke-dasharray="2 5" stroke-linecap="round"/>`,
      ...[left, right].map(d => `<path d="${d}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="2.4"/>`),
      K.gloss(`${id}-gloss`, -30, -12, 12, 5, 0), K.gloss(`${id}-gloss`, 26, -12, 12, 5, 0),
      `</g>`,
    ],
  };
}

function meningococcus(id) {
  const base = C.gramNegative;
  const bean = side => `M${6 * side} -34C${40 * side} -40 ${60 * side} -18 ${60 * side} 4C${60 * side} 28 ${38 * side} 40 ${6 * side} 34` +
    `C${14 * side} 14 ${14 * side} -14 ${6 * side} -34Z`;
  const pili = [-1, 1].flatMap(side => Array.from({ length: 11 }, (_, i) => {
    const a = (-70 + i * 14) * Math.PI / 180, cx = side * 33;
    const [x, y] = [cx + side * 28 * Math.cos(a), 38 * Math.sin(a)], [ux, uy] = [side * Math.cos(a), Math.sin(a)];
    return `<line x1="${n(x - ux * 3)}" y1="${n(y - uy * 3)}" x2="${n(x + ux * 8)}" y2="${n(y + uy * 8)}"/>`;
  }));
  return {
    defs: [K.sphereGradient(`${id}-body`, base), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(128 128) rotate(-20) scale(1.35)">`,
      `<g stroke="${shade(base, 0.25)}" stroke-width="1.1" stroke-linecap="round">${pili.join('')}</g>`,
      ...[-1, 1].map(side => `<path d="${bean(side)}" fill="url(#${id}-body)" stroke="${outline(base)}" stroke-width="2.2"/>` +
        `<path d="${bean(side)}" transform="translate(${33 * side} 0) scale(0.84) translate(${-33 * side} 0)" fill="none" stroke="${shade(base, 0.2)}" stroke-width="1.2" opacity="0.5"/>` +
        K.gloss(`${id}-gloss`, side * 30, -18, 12, 6, side * 15)),
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

function igmPentamer(id) {
  const H = C.heavyChain, L = C.lightChain, J = C.jChain, deg = 48, angle = deg * Math.PI / 180;
  const domain = ([x, y], rot, colour, grad) =>
    `<ellipse cx="${n(x)}" cy="${n(y)}" rx="12.5" ry="19" transform="rotate(${rot} ${n(x)} ${n(y)})" fill="url(#${id}-${grad})" stroke="${outline(colour)}" stroke-width="4"/>`;
  // One antibody unit in local coordinates: Fab arms up, Fc down, joined by short heavy-chain strands.
  const unit = () => {
    const strands = [], fc = [], heavy = [], light = [];
    for (const side of [-1, 1]) {
      const u = [side * Math.sin(angle), -Math.cos(angle)], o = [side * Math.cos(angle), Math.sin(angle)];
      const at = (d, off) => [u[0] * d + o[0] * off, u[1] * d + o[1] * off];
      const [x0, y0] = at(20, -13), d = `M${n(x0)} ${n(y0)}Q${side * 8} 0 ${side * 14} 6`;
      strands.push(`<path d="${d}" fill="none" stroke="${outline(H)}" stroke-width="10" stroke-linecap="round"/>` +
        `<path d="${d}" fill="none" stroke="${H}" stroke-width="6" stroke-linecap="round"/>`);
      fc.push(domain([side * 14, 22], 0, H, 'heavy'), domain([side * 14, 60], 0, H, 'heavy'));
      heavy.push(domain(at(36, -13), side * deg, H, 'heavy'), domain(at(76, -13), side * deg, H, 'heavy'));
      light.push(domain(at(36, 13), side * deg, L, 'light'), domain(at(76, 13), side * deg, L, 'light'));
    }
    return [...strands, ...fc, ...heavy, ...light].join('');
  };
  const units = Array.from({ length: 5 }, (_, k) => {
    const phi = -90 + k * 72, r = phi * Math.PI / 180;
    return `<g transform="translate(${n(128 + 50 * Math.cos(r))} ${n(128 + 50 * Math.sin(r))}) rotate(${phi + 90}) scale(0.6)">${unit()}</g>`;
  });
  return {
    defs: [K.sphereGradient(`${id}-heavy`, H, { light: 0.5 }), K.sphereGradient(`${id}-light`, L, { light: 0.5 }), K.sphereGradient(`${id}-j`, J)],
    body: [...units, `<circle cx="128" cy="128" r="12" fill="url(#${id}-j)" stroke="${outline(J)}" stroke-width="2"/>`],
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

function newborn(id) {
  const sw = C.swaddle, skin = C.skin, hat = C.hat;
  return {
    defs: [K.sphereGradient(`${id}-swaddle`, sw, { light: 0.5 }), K.sphereGradient(`${id}-skin`, skin, { light: 0.35 }),
      K.sphereGradient(`${id}-hat`, hat, { light: 0.5 }), K.glossGradient(`${id}-gloss`)],
    body: [
      `<g transform="translate(-8 0)">`,
      // Blanket hood behind the head, then the wrapped body over it.
      `<circle cx="84" cy="96" r="46" fill="url(#${id}-swaddle)" stroke="${outline(sw)}" stroke-width="${STROKE}"/>`,
      `<g transform="translate(142 150) rotate(-32)">`,
      `<ellipse rx="92" ry="56" fill="url(#${id}-swaddle)" stroke="${outline(sw)}" stroke-width="${STROKE}"/>`,
      `<path d="M-40 -52Q-12 0 -32 54M12 -55Q38 0 22 55" fill="none" stroke="${shade(sw, 0.25)}" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>`,
      `</g>`,
      `<circle cx="84" cy="94" r="31" fill="url(#${id}-skin)" stroke="${outline(skin)}" stroke-width="2.5"/>`,
      `<path d="M55 84C53 64 68 56 86 56C104 56 116 66 114 82C98 74 72 74 55 84Z" fill="url(#${id}-hat)" stroke="${outline(hat)}" stroke-width="2.5" stroke-linejoin="round"/>`,
      `<path d="M56 82C78 71 100 72 113 80" fill="none" stroke="${shade(hat, 0.15)}" stroke-width="4" stroke-linecap="round"/>`,
      `<circle cx="70" cy="56" r="8" fill="url(#${id}-hat)" stroke="${outline(hat)}" stroke-width="2"/>`,
      K.gloss(`${id}-gloss`, 150, 120, 30, 12, -32),
      `</g>`,
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
  'sars-cov-2': sarsCov2,
  'adenovirus': adenovirus,
  'rsv': rsv,
  'influenza': influenza,
  'herpesvirus': herpesvirus,
  'bacteriophage': bacteriophage,
  'candida': candida,
  'aspergillus': aspergillus,
  'neutrophil': neutrophil,
  'macrophage': macrophage,
  't-cell': tCell,
  'b-cell': bCell,
  'plasma-cell': plasmaCell,
  'dendritic-cell': dendriticCell,
  'nk-cell': nkCell,
  'red-blood-cells': redBloodCells,
  'igg-antibody': iggAntibody,
  'igm-pentamer': igmPentamer,
  'mhc-class-ii': mhcClassII,
  'cytokine-receptor': cytokineReceptor,
  'antibiotic-capsule': antibioticCapsule,
  'iv-bag': ivBag,
  'vaccine': vaccine,
  'oral-suspension': oralSuspension,
  'blood-culture-bottle': bloodCultureBottle,
  'blood-agar-plate': bloodAgarPlate,
  'lungs': lungs,
  'child': child,
  'newborn': newborn,
};

const catalogue = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalogue.json'), 'utf8'));
for (const [id, draw] of Object.entries(DRAWINGS)) {
  const meta = catalogue.icons.find(icon => icon.id === id);
  if (!meta) throw new Error(`No catalogue entry for "${id}"`);
  const { defs, body } = draw(id);
  K.writeIcon(ROOT, meta.file, K.svgDocument({ id, title: meta.name, description: meta.description, defs, body }));
}
