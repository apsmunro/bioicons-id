# ID & Immunology Icons

Free illustrations of pathogens, immune cells, molecules and treatments for teaching, slides,
posters and papers. Each icon comes in two versions:

- **Full colour**: a soft, shaded scientific-illustration style.
- **Single colour**: a simplified version for black-and-white print or line-art slides,
  downloadable in any colour.

**Browse and download: <https://apsmunro.github.io/bioicons-id/>**

## Using the icons

- **PowerPoint / Keynote:** download the SVG and drag it onto a slide, or click
  *Copy image* and paste. Single-colour SVGs can be recoloured in PowerPoint with
  *Graphics Fill*; to recolour parts of a full-colour icon, right-click it and choose
  *Convert to Shape*.
- **Posters and print:** use the SVG (scales to any size) or a 2048–4096 px PNG.
- **Direct links:** every icon has its own address, e.g.
  `https://apsmunro.github.io/bioicons-id/#neutrophil`.

## Licence

[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/): dedicated to the public domain.
Use, adapt and share the icons for any purpose, including commercially, with no permission or
credit needed. A mention of "ID & Immunology Icons" is always appreciated.

## Requests and contributions

Missing an organism, cell or drug? [Open an issue](https://github.com/apsmunro/bioicons-id/issues)
describing what you need. Contributions are welcome by pull request; please follow
[STYLE.md](STYLE.md).

## Project layout

```
icons/<category>/<id>.svg        full-colour icons
icons/<category>/<id>-mono.svg   single-colour icons
catalogue.json                   names, categories, descriptions and search tags
STYLE.md                         the house style every icon follows
tools/svg-kit.js                 shared palette, gradients, geometry and drawing helpers
tools/draw-pilot-icons.js        code that draws the full-colour icons
tools/draw-mono-icons.js         code that draws the single-colour icons
tools/build-site.js              bundles the catalogue and SVGs for the gallery
tools/serve.js                   local preview server
index.html, assets/              the gallery website
```

## Adding or changing icons

1. Add both SVGs to `icons/<category>/`, following [STYLE.md](STYLE.md). They can be drawn
   in code (see `tools/`) or by hand in Inkscape, Illustrator or Affinity.
2. Add an entry to `catalogue.json`.
3. Rebuild the gallery data: `npm run build` (or `npm run all` to redraw the coded icons first).
4. Preview: `node tools/serve.js`, then open <http://localhost:8080>.
5. Commit and push; GitHub Pages republishes the site within a minute or two.

Requires [Node.js](https://nodejs.org/) only; there are no other dependencies.
