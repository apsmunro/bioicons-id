# Style guide

Every icon follows these rules so the set looks like one family on a slide.

## Canvas

- `viewBox="0 0 256 256"`, transparent background, roughly 16 px clear margin.
- No text inside icons. Labels belong on the slide, in the presenter's font and language.
- One subject per icon, centred.

## Shading

- Light always comes from the **top left**.
- Each part has one base colour (see `PALETTE` in `tools/svg-kit.js`); highlights,
  shadows and outlines are derived from it:
  - **Highlights** go towards a warm white (`lift`).
  - **Shadows** go towards a deep tone of the same colour, turned slightly towards blue-violet
    (`deepen`), never towards black or grey.
  - **Rounded bodies** (cells, cocci, virions, domains): `sphereGradient` or `formGradient`,
    one gradient centred on the highlight: light, base colour, core shadow, then a little
    reflected light at the far rim. `formGradientAt` places the same shading by hand on
    irregular shapes such as organs.
  - **Rods, capsules, tubes**: `cylinderGradient` across the short axis; `limbGradient` for
    limbs and tapered parts.
  - A broad, soft `sheen` (or `gloss`) top left. Keep it soft: no small bright spots.
- Where one object lies over another, it casts a soft shadow on it: draw the upper shape
  again, offset down and to the right, filled with a `castGradient` or a low-opacity deep
  tone, and clipped to the shape beneath.
- **Glass and clear plastic** (vials, bottles, tubes, pots, syringes): fill the vessel with
  `glassGradient`, draw its contents flat (liquid, label), then lay the vessel's own shape over
  them filled with `roundingGradient`, so everything inside curves with the vessel. Show the
  surface of a liquid as a shallow ellipse (`meniscus`), finish with a long soft `sheen` on the
  lit side, and let a cap or crimp shade the glass just below it. Syringe barrels use
  `barrelLight`. Flat glass (a slide) and soft bags are not cylinders: shade them more gently.
- Recessed or background parts use the base colour deepened by about 12%.

## Lines

- Main outline: 2.5 px, a deep tone of the fill (`outline()`).
- Inner detail (membranes, walls, connectors): 1–2 px.
- Round line caps and joins.
- Parts that belong together (an arm and its hand) share one outline: draw the outlines
  first, then the fills on top.

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

Organs use natural tissue colours. Arteries are red and veins blue (the pulmonary trunk is
blue, as it carries deoxygenated blood); lymphatics are yellow. Paired organs are drawn once
and mirrored (`mirrorX` in `tools/svg-kit.js`) so both sides match exactly.

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
- Colour icons must survive PowerPoint's **Convert to Shape**, which keeps linear gradients and
  the opacity of a single shape but drops clip paths, flattens radial gradients to their first
  stop, and ignores opacity set on a group. So:
  - Anything soft-edged (a sheen, a soft shadow, a dip) is a `softEllipse`: nested plain
    ellipses. Never a radial gradient that fades to transparent.
  - Write clip paths freely in the drawing code; `tools/convert-safe.js` cuts each clipped
    shape (and plain stroke) to its final outline when the icon is generated. Dashed strokes,
    and rotated shapes with a gradient fill, cannot be cut: keep those out of clip paths.
  - Radial shading still flattens on conversion; the same step makes it flatten to the part's
    base colour.
  - Put opacity on shapes, not on groups.
- Every `id` inside an SVG starts with the icon's own id (for example `neutrophil-body`), so
  several icons pasted into one document never share gradient names.
- File names are lowercase kebab-case: `icons/<category>/<icon-id>.svg`, with the
  single-colour version beside it as `<icon-id>-mono.svg`.
- Each icon has an entry in `catalogue.json` with a name, both file paths, a description and search tags.
  Tags should include abbreviations and synonyms people actually type (PMN, MRSA, IVIG…).
