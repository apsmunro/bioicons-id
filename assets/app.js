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
  };

  const isMono = icon => state.variant === 'mono' && icon.monoSvg;
  const svgFor = icon => (isMono(icon) ? icon.monoSvg.split(INK).join(state.ink) : icon.svg);
  const svgUrl = icon => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgFor(icon));
  const fileBase = icon => (isMono(icon) ? `${icon.id}-mono${state.ink === INK ? '' : '-' + state.ink.slice(1)}` : icon.id);

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
      b.textContent = c.label;
      b.setAttribute('aria-pressed', String(c.id === state.category));
      b.addEventListener('click', () => { state.category = c.id; renderChips(); renderGrid(); });
      return b;
    }));
  }

  function renderGrid() {
    const shown = lib.icons.filter(matches);
    grid.replaceChildren(...shown.map(icon => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'card';
      b.innerHTML = '<span class="thumb"><img alt="" loading="lazy"></span><span class="name"></span><span class="cat"></span>';
      b.querySelector('img').src = svgUrl(icon);
      b.querySelector('.name').textContent = icon.name;
      b.querySelector('.cat').textContent = categoryLabel[icon.category];
      b.addEventListener('click', () => openIcon(icon));
      li.append(b);
      return li;
    }));
    $('#count').textContent = `${shown.length} of ${lib.icons.length} icons`;
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

  function refresh() {
    $$('[data-variant]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.variant === state.variant)));
    renderInkPickers();
    renderGrid();
    if (state.current) $('#detail-img').src = svgUrl(state.current);
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
      const li = document.createElement('li');
      li.textContent = t;
      return li;
    }));
    say('');
    history.replaceState(null, '', '#' + icon.id);
    if (!dialog.open) dialog.showModal();
  }

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
        canvas.width = canvas.height = size;
        canvas.getContext('2d').drawImage(img, 0, 0, size, size);
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
      say(`PNG (${size} × ${size}) downloaded.`);
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
  });
  $$('button[data-bg]').forEach(b => b.addEventListener('click', () => setBackground(b.dataset.bg)));
  $$('button[data-variant]').forEach(b => b.addEventListener('click', () => setVariant(b.dataset.variant)));

  const { name, licence, licenceUrl } = lib.library;
  $('#licence').innerHTML = `Free to use for any purpose, with no permission or credit needed ` +
    `(<a href="${licenceUrl}">${licence}</a>). A mention of “${name}” is always appreciated.`;

  setBackground(storage.get('icon-bg') || 'light');
  renderChips();
  refresh();
  const linked = lib.icons.find(i => '#' + i.id === location.hash);
  if (linked) openIcon(linked);
})();
