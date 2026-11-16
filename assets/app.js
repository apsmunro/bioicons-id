'use strict';

(() => {
  const lib = window.ICON_LIBRARY;
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);
  const grid = $('#grid'), search = $('#search'), chips = $('#categories'), dialog = $('#detail');
  const categoryLabel = Object.fromEntries(lib.categories.map(c => [c.id, c.label]));

  // Single-colour SVGs are drawn in INK; it is swapped for the chosen colour.
  const INK = '#000000';
  const PRESET_INKS = [['#000000', 'Black'], ['#ffffff', 'White'], ['#1f3a68', 'Navy'], ['#5a45c8', 'Purple']];

  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* private mode */ } },
  };

  const state = {
    query: '',
    category: 'all',
    current: null,
    variant: storage.get('icon-variant') === 'mono' ? 'mono' : 'colour',
    ink: /^#[0-9a-f]{6}$/.test(storage.get('icon-ink') || '') ? storage.get('icon-ink') : INK,
    // Skin tone for the people icons; "medium" is each icon's main file.
    tone: lib.skinTones.some(t => t.id === storage.get('icon-tone')) ? storage.get('icon-tone') : 'medium',
    // Whether figures are shown and downloaded with their labels.
    labels: storage.get('icon-labels') !== 'off',
  };

  const isMono = icon => state.variant === 'mono' && icon.monoSvg;
  const toned = icon => !isMono(icon) && icon.toneSvgs && icon.toneSvgs[state.tone];
  // Figures come with or without labels.
  const labelled = icon => state.labels && icon.labelledSvg;
  const svgFor = icon => (isMono(icon) ? ((labelled(icon) && icon.labelledMonoSvg) || icon.monoSvg).split(INK).join(state.ink)
    : toned(icon) || (labelled(icon) ? icon.labelledSvg : icon.svg));
  const svgUrl = icon => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgFor(icon));
  const fileBase = icon => (isMono(icon) ? `${icon.id}-mono${state.ink === INK ? '' : '-' + state.ink.slice(1)}`
    : toned(icon) ? `${icon.id}-${state.tone}` : icon.id) + (labelled(icon) ? '-labelled' : '');

  for (const icon of lib.icons) {
    icon.searchText = [icon.name, icon.description, categoryLabel[icon.category], ...(icon.tags || [])]
      .join(' ').toLowerCase();
  }

  function matches(icon) {
    if (state.category !== 'all' && icon.category !== state.category) return false;
    return state.query.split(/\s+/).filter(Boolean).every(term => icon.searchText.includes(term));
  }

  function renderChips() {
    const used = lib.categories.filter(c => lib.icons.some(i => i.category === c.id));
    chips.replaceChildren(...[{ id: 'all', label: 'All' }, ...used].map(c => {
      const b = document.createElement('button');
      b.type = 'button';
      const count = document.createElement('span');
      count.textContent = c.id === 'all' ? lib.icons.length : lib.icons.filter(i => i.category === c.id).length;
      b.append(c.label, count);
      b.setAttribute('aria-pressed', String(c.id === state.category));
      b.addEventListener('click', () => { state.category = c.id; renderChips(); renderGrid(); });
      return b;
    }));
  }

  function renderGrid() {
    // With nothing filtered, the library is shown category by category, each under a heading.
    const grouped = state.category === 'all' && !state.query, order = lib.categories.map(c => c.id);
    const shown = lib.icons.filter(matches);
    if (grouped) shown.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
    state.shown = shown;
    grid.classList.toggle('grouped', grouped);
    grid.replaceChildren(...shown.flatMap((icon, i) => {
      const li = document.createElement('li');
      // Figures are wide, so their cards take two columns.
      if (icon.aspect > 1.2) li.className = 'wide';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'card';
      b.innerHTML = '<span class="thumb"><img alt="" loading="lazy"></span><span class="name"></span><span class="cat"></span>';
      b.querySelector('img').src = svgUrl(icon);
      b.querySelector('.name').textContent = icon.name;
      b.querySelector('.cat').textContent = categoryLabel[icon.category];
      b.addEventListener('click', () => openIcon(icon));
      li.append(b);
      if (!grouped || (i && shown[i - 1].category === icon.category)) return [li];
      const heading = document.createElement('li');
      heading.className = 'group';
      heading.innerHTML = '<h2></h2><span></span>';
      heading.querySelector('h2').textContent = categoryLabel[icon.category];
      heading.querySelector('span').textContent = shown.filter(other => other.category === icon.category).length;
      return [heading, li];
    }));
    // Icons and figures are counted separately: "183 icons and 5 figures", or "12 of 183 icons…" when filtered.
    const tally = (isFigure, word) => {
      const total = lib.icons.filter(i => (i.category === 'figures') === isFigure).length, n = shown.filter(i => (i.category === 'figures') === isFigure).length;
      return `${n === total ? total : `${n} of ${total}`} ${word}${total === 1 ? '' : 's'}`;
    };
    $('#count').textContent = `${tally(false, 'icon')} and ${tally(true, 'figure')}`;
    $('#empty').hidden = shown.length > 0;
  }

  function renderInkPickers() {
    for (const box of $$('.ink')) {
      box.hidden = state.variant !== 'mono';
      const presets = PRESET_INKS.map(([colour, name]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'swatch';
        b.style.setProperty('--swatch', colour);
        b.setAttribute('aria-label', name);
        b.title = name;
        b.setAttribute('aria-pressed', String(state.ink === colour));
        b.addEventListener('click', () => setInk(colour));
        return b;
      });
      const custom = document.createElement('label');
      custom.className = 'swatch custom';
      custom.title = 'Choose any colour';
      custom.setAttribute('aria-pressed', String(!PRESET_INKS.some(([c]) => c === state.ink)));
      custom.innerHTML = '<span class="visually-hidden">Choose any colour</span><input type="color">';
      const input = custom.querySelector('input');
      input.value = state.ink;
      input.addEventListener('change', () => setInk(input.value));
      const label = document.createElement('span');
      label.className = 'ink-label';
      label.textContent = 'Colour';
      box.replaceChildren(label, ...presets, custom);
    }
  }

  // Skin-tone swatches, shown in the detail view for full-colour people icons.
  function renderTonePicker() {
    const box = $('.tone'), icon = state.current;
    box.hidden = !(icon && icon.toneSvgs && state.variant === 'colour');
    const label = document.createElement('span');
    label.className = 'ink-label';
    label.textContent = 'Skin tone';
    box.replaceChildren(label, ...lib.skinTones.map(({ id, label: name, skin }) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch';
      b.style.setProperty('--swatch', skin);
      b.setAttribute('aria-label', name);
      b.title = name;
      b.setAttribute('aria-pressed', String(state.tone === id));
      b.addEventListener('click', () => setTone(id));
      return b;
    }));
  }

  // The labels switch, shown in the detail view for figures.
  function renderLabelsSwitch() {
    const icon = state.current;
    $('.labels').hidden = !(icon && icon.labelledSvg);
    $('#detail-preview').classList.toggle('wide', Boolean(icon && icon.aspect > 1.2));
    $$('[data-labels]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.labels === 'on') === state.labels)));
  }

  function setLabels(on) {
    state.labels = on;
    storage.set('icon-labels', on ? 'on' : 'off');
    refresh();
  }

  function refresh() {
    $$('[data-variant]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.variant === state.variant)));
    renderInkPickers();
    renderTonePicker();
    renderLabelsSwitch();
    renderGrid();
    if (state.current) $('#detail-img').src = svgUrl(state.current);
  }

  function setTone(tone) {
    state.tone = tone;
    storage.set('icon-tone', tone);
    refresh();
  }

  function setVariant(variant) {
    state.variant = variant;
    storage.set('icon-variant', variant);
    refresh();
  }

  function setInk(colour) {
    state.ink = colour.toLowerCase();
    storage.set('icon-ink', state.ink);
    // White ink is invisible on the light preview, so switch to the dark one.
    if (state.ink === '#ffffff' && grid.dataset.bg === 'light') setBackground('dark');
    refresh();
  }

  function setBackground(bg) {
    grid.dataset.bg = bg;
    $('#detail-preview').dataset.bg = bg;
    $$('[data-bg]').forEach(b => { if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(b.dataset.bg === bg)); });
    storage.set('icon-bg', bg);
  }

  function openIcon(icon) {
    state.current = icon;
    $('#detail-img').src = svgUrl(icon);
    $('#detail-img').alt = icon.name;
    $('#detail-category').textContent = categoryLabel[icon.category];
    $('#detail-name').textContent = icon.name;
    $('#detail-desc').textContent = icon.description;
    $('#detail-tags').replaceChildren(...(icon.tags || []).map(t => {
      const li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button';
      b.textContent = t;
      b.title = `Search for “${t}”`;
      b.addEventListener('click', () => searchFor(t));
      li.append(b);
      return li;
    }));
    renderTonePicker();
    renderLabelsSwitch();
    say('');
    history.replaceState(null, '', '#' + icon.id);
    if (!dialog.open) dialog.showModal();
  }

  // A tag searches the whole library for itself.
  function searchFor(text) {
    dialog.close();
    search.value = text;
    state.query = text.trim().toLowerCase();
    state.category = 'all';
    renderChips();
    renderGrid();
    $('#browse').scrollIntoView();
  }

  // The previous or next icon among those shown.
  function step(by) {
    const list = state.shown || [], at = list.indexOf(state.current);
    if (list.length) openIcon(list[(at + by + list.length) % list.length]);
  }
  $('#prev').addEventListener('click', () => step(-1));
  $('#next').addEventListener('click', () => step(1));

  dialog.addEventListener('close', () => {
    state.current = null;
    history.replaceState(null, '', location.pathname + location.search);
  });
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

  const say = msg => { $('#status').textContent = msg; };

  function save(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function pngBlob(icon, size) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // `size` is the width; figures are wider than they are tall.
        canvas.width = size;
        canvas.height = Math.round(size / (icon.aspect || 1));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(b => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png');
      };
      img.onerror = () => reject(new Error('Could not render the SVG'));
      img.src = svgUrl(icon);
    });
  }

  $('#dl-svg').addEventListener('click', () => {
    const icon = state.current;
    save(new Blob([svgFor(icon)], { type: 'image/svg+xml' }), `${fileBase(icon)}.svg`);
    say('SVG downloaded.');
  });

  $('#dl-png').addEventListener('click', async () => {
    const icon = state.current, size = Number($('#png-size').value);
    try {
      save(await pngBlob(icon, size), `${fileBase(icon)}-${size}px.png`);
      say(`PNG (${size} × ${Math.round(size / (icon.aspect || 1))}) downloaded.`);
    } catch (err) {
      say(err.message);
    }
  });

  $('#copy-png').addEventListener('click', async () => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob(state.current, 1024) })]);
      say('Image copied. Paste it into your slide.');
    } catch {
      say('This browser blocked copying images. Use Download PNG instead.');
    }
  });

  $('#copy-svg').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(svgFor(state.current));
      say('SVG code copied.');
    } catch {
      say('This browser blocked clipboard access. Use Download SVG instead.');
    }
  });

  search.addEventListener('input', () => { state.query = search.value.trim().toLowerCase(); renderGrid(); });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== search && !dialog.open) { e.preventDefault(); search.focus(); }
    if (dialog.open && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !/^(SELECT|INPUT)$/.test(document.activeElement.tagName)) step(e.key === 'ArrowLeft' ? -1 : 1);
  });
  $$('button[data-bg]').forEach(b => b.addEventListener('click', () => setBackground(b.dataset.bg)));
  $$('button[data-variant]').forEach(b => b.addEventListener('click', () => setVariant(b.dataset.variant)));
  $$('button[data-labels]').forEach(b => b.addEventListener('click', () => setLabels(b.dataset.labels === 'on')));

  const { name, licence, licenceUrl } = lib.library;
  $('#licence').innerHTML = `Free to use for any purpose, with no permission or credit needed ` +
    `(<a href="${licenceUrl}">${licence}</a>). A mention of “${name}” is always appreciated.`;

  // The numbers under the title.
  const figures = lib.icons.filter(i => i.category === 'figures').length;
  $('#stats').replaceChildren(...[[lib.icons.length - figures, 'icons'], [figures, 'figures'], [lib.categories.length - 1, 'categories'], [2, 'styles each']].map(([value, label]) => {
    const li = document.createElement('li');
    li.innerHTML = '<strong></strong><span></span>';
    li.querySelector('strong').textContent = value;
    li.querySelector('span').textContent = label;
    return li;
  }));

  // A few icons floating beside the title: [id, left, top, width (% of the showcase), tilt, delay].
  const SHOWCASE = [['sars-cov-2', 30, 26, 40, 3, 0], ['neutrophil', 2, 8, 27, -4, -2], ['igg-antibody', 70, 4, 26, 5, -4], ['bacteriophage', 74, 44, 24, -3, -1],
    ['staphylococcus', 4, 54, 25, 4, -5], ['t-cell', 52, 70, 24, -5, -3], ['vaccine', 27, 73, 21, 3, -6], ['macrophage', 40, 0, 22, -3, -2.5]];
  $('#showcase').replaceChildren(...SHOWCASE.flatMap(([id, x, y, s, r, d]) => {
    const icon = lib.icons.find(i => i.id === id);
    if (!icon) return [];
    const img = document.createElement('img');
    img.alt = '';
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(icon.svg);
    img.style.cssText = `--x:${x}%;--y:${y}%;--s:${s}%;--r:${r}deg;--d:${d}s`;
    return [img];
  }));

  setBackground(storage.get('icon-bg') || 'light');
  renderChips();
  refresh();
  const linked = lib.icons.find(i => '#' + i.id === location.hash);
  if (linked) openIcon(linked);
})();
