# Style guide

Every icon follows these rules so the set looks like one family on a slide.

## Canvas

- `viewBox="0 0 256 256"`, transparent background, roughly 16 px clear margin.
- No text inside icons. Labels belong on the slide, in the presenter's font and language.
- One subject per icon, centred.

## Shading

- Light always comes from the **top left**.
- Each part has one base colour (see `PALETTE` in `tools/svg-kit.js`); highlights,
  rims and outlines are derived from it:
  - **Rounded bodies** (cells, cocci, virions, domains): `sphereGradient`. A pale highlight
    top left, the base colour, and a slightly darker rim.
  - **Rods, capsules, tubes**: `cylinderGradient` across the short axis.
  - Optional soft white `gloss` ellipse top left.
- Recessed or background parts use the base colour darkened by about 15%.

## Lines

- Main outline: 3 px, base colour darkened 38% (`outline()`).
- Inner detail (membranes, walls, connectors): 1–2 px.
- Round line caps and joins.

## Colour conventions

| Subject | Colour | Why |
| --- | --- | --- |
| Gram-positive bacteria | violet `#8B6FD9` | crystal violet in the Gram stain |
| Gram-negative bacteria | pink `#E46F8C` | safranin counterstain |
| Mycobacteria | red `#D9466F` | carbol fuchsin in the Ziehl–Neelsen stain |
| Bacterial capsule | pale lilac halo `#E6DEFA` | |
| Fungi | warm yellow `#E8C26A` | |
| Viral envelope | soft blue `#86B6D6` | |
| Spike / attachment proteins | red `#DF5249` | |
| All nuclei | purple `#7E57C2` | as in haematoxylin-stained films |
| Antibody heavy chain | dark blue `#3D73CF` | |
| Antibody light chain | light blue `#8CC2F0` | |
| Disulphide bonds | yellow `#F2C14E` | |
| Glycans | green `#5DBB63` | |

Cell cytoplasm colours distinguish cell types: neutrophil pink, macrophage peach,
T cell blue, B-cell lineage mint (deeper for plasma cells), NK cell lavender,
dendritic cell sand. Each virus has its own envelope colour; within a virus, different
surface proteins get different colours (e.g. RSV F orange and G blue; influenza HA blue and NA red).

People are drawn without facial features, so they stay neutral and work for any audience.

## Single-colour versions

Every icon also has a simplified single-colour version (`<id>-mono.svg`) for black-and-white
print, line-art slides, or matching a slide's accent colour.

- Drawn in pure black `#000000` only (`INK` in `tools/svg-kit.js`). The gallery swaps that one
  value for the colour a user picks, so no other colour may appear in a mono file.
- No gradients, no shading, no white fills: anything that is not ink must be truly transparent,
  so the icon works on any background.
- Outlines of cells, organisms and objects: 10 px. Flagella, stalks, tubing and inner
  detail: 5–6 px. Round caps and joins.
- Nuclei and small repeated parts (cocci, antibody domains, granules) are solid shapes, with
  at least 5 px of clear space between neighbours so they stay distinct at small sizes.
- Simplify: keep the features that identify the subject (multilobed nucleus, spikes, flagella)
  and drop the rest. The icon should still read at 32 px.

## Technical rules (so icons behave in PowerPoint, Keynote and Google Slides)

- Use only paths, basic shapes, linear and radial gradients, and clip paths.
  **No filters, blurs, masks or embedded images**: slide software renders them unreliably.
- Every `id` inside an SVG starts with the icon's own id (for example `neutrophil-body`), so
  several icons pasted into one document never share gradient names.
- File names are lowercase kebab-case: `icons/<category>/<icon-id>.svg`, with the
  single-colour version beside it as `<icon-id>-mono.svg`.
- Each icon has an entry in `catalogue.json` with a name, both file paths, a description and search tags.
  Tags should include abbreviations and synonyms people actually type (PMN, MRSA, IVIG…).
