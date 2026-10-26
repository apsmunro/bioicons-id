# ID & Immunology Icons — notes for Claude

A free (CC0) library of scientific illustrations for paediatric infectious diseases and
immunology talks, built for and with its author (GitHub `apsmunro`, a paediatric ID and
immunology clinical academic). Every icon comes in a shaded **full-colour** version and a
simplified **single-colour** version.

- Live site: https://apsmunro.github.io/bioicons-id/ (GitHub Pages, deployed from `main`)
- Repository: https://github.com/apsmunro/bioicons-id
- [README.md](README.md): project layout and how to add icons. [STYLE.md](STYLE.md): the house style. Read both first.

## How icons are made

- Most icons are drawn in code: `tools/draw-colour-icons.js` and `tools/draw-mono-icons.js`,
  one function per icon, grouped by category section, registered in each file's `DRAWINGS`.
  Shared palette, gradients and geometry live in `tools/svg-kit.js` (`PALETTE`, `ORGANS`,
  `STREP_CHAIN`, `BIOFILM_CELLS`, `pipe`, `capsidFacets`, …). Geometry shared by both versions
  of an icon belongs in the kit so the two stay in step.
- `icons/` and `assets/icon-data.js` are generated: never hand-edit them. Run `npm run all`
  (draw both versions, then bundle). Output is deterministic; after a change, check with
  `git status` that only the intended icons changed.
- Each icon needs a `catalogue.json` entry: id, name, category, `file`, `monoFile`, description
  and search tags (include clinical terms and abbreviations people type).
- Single-colour files must use only `#000000` (the gallery swaps it for the chosen colour), with
  transparent gaps instead of white fills.

### Drawings supplied by the author

The brain and heart are built from the author's own Inkscape drawings in `tools/sources/`
(single filled paths, CC0). `lineArt()` reads them; their bounds were measured in a browser
(`getBBox`) and are hard-coded in `ORGANS.brainArt` / `ORGANS.heartArt`.

- Single colour: the drawing as-is, fitted to the canvas.
- Colour: regions between the lines are filled by structure. `splitSubpaths()` breaks the path
  into pieces; enclosed regions (holes) are found in the browser with `isPointInFill`, then
  mapped by index in `ORGANS.heartRegions`. If the author sends a new drawing, re-measure the
  bounds and redo the region map: the indices will change.
- The heart's pulmonary trunk shares a region with the coronary bands; `pulmonaryTrunk` (a
  clip polygon) and `pulmonaryTrunkBase` (short ink lines) separate it.

## Working routine

1. Work on a new branch per batch of changes (e.g. `batch-5-icons`).
2. Preview locally with `PORT=8081 node tools/serve.js` (run in the background) and open
   http://localhost:8081 in the browser pane. Don't use `preview_start`: its saved config
   pointed at an old folder and served stale files.
3. Check every new or changed icon visually, in both versions, at a decent size. Screenshots
   of the browser pane often time out at first; retrying works.
4. Show the author and wait for approval. Only commit, merge into `main` (fast-forward) and
   push when asked. The first push occasionally fails transiently; a retry works.
5. After pushing, wait for the Pages build (`gh api repos/apsmunro/bioicons-id/pages/builds/latest`)
   and confirm the live site serves the new icons.

## Author's preferences

- BioRender-like shaded style for colour; clean line-icon style for single colour.
- Anatomy and science should be accurate; the author reviews closely and will push back on odd shapes.
- People have no facial features. British spelling throughout.

## Status (26 Oct 2026)

73 icons in 10 categories: bacteria 11, viruses 9, fungi 2, parasites 2, immune cells 14,
molecules 5, organs & body systems 12, treatment 5, antimicrobial resistance 3, clinical & lab 10.

## Ideas not yet done

- Pathogens: *Haemophilus*, *Klebsiella*, *Pseudomonas*, *Salmonella*, *C. difficile* (spores),
  *Mycoplasma*, norovirus, HIV, hepatitis B, *Cryptococcus*, *Pneumocystis*, *Giardia*, a helminth,
  scabies mite, head louse.
- Immunology: Treg, basophil, IgA dimer, IgE on a mast cell, MHC class I, Toll-like receptor,
  immune synapse, C3b opsonisation, antigen/epitope binding.
- Resistance and vaccines: plasmid transfer, antibiotic acting on the cell wall, viral-vector
  and conjugate vaccines.
- Clinical: cannula/PICC, nebuliser or oxygen mask, neonatal incubator, urine dipstick, Gram
  stain slide, PCR tube, lateral-flow test, blood bottles, parent and baby, mosquito, tick,
  transmission routes, hand hygiene, mask, globe.
- Other skin tones for the people icons.
- Known weaknesses: the single-colour β-lactamase reads a little like an apple with a bite out
  at small sizes; the supplied brain and heart drawings have fine lines that look light below ~64 px.
