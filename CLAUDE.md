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
- People icons have skin-tone versions: a catalogue entry's `toneFiles` lists them, and the colour
  script redraws the icon with `SKIN_TONES` (in the kit) swapped into `PALETTE.skin`/`hair`. The
  gallery shows a skin-tone picker in the detail view for these icons.

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

## Handover (16 Nov 2026): start here

Everything is committed, merged into `main` and live. The library has 189 icons in 11 categories
and 14 figures (the sections from batch 10 onwards, below, are the latest work). The sections below are in the
order the work was done, so the counts in "Status" are older than this.

Done since batch 8, newest first:
- CD4 and CD8 T cell icons, and the figure `scid-blocks`.
- Figures: `vaccine-response` and `t-cell-development`, with a Figures category and a labels switch
  on the site.
- Batch 9: eight icons.
- Soft rings, replacing the visible rings left by the Convert to Shape fix.
- Convert to Shape fix; glass and plastic reshading; cast shadows for every category.

Waiting on the author:
- Convert to Shape has never been run on a figure. The open question is whether labels and gene
  names come through as editable text. The author was asked to convert the labelled colour
  `vaccine-response` from the live site and report back.
- The gene-to-step placements in `scid-blocks` were pushed without comment from the author. Treat
  them as unreviewed: gene symbols are used throughout (*DCLRE1C* for Artemis, *CD247* for CD3ζ),
  ADA sits at the early thymocyte, and MHC class II deficiency and ZAP-70 sit at selection.

Offered and not yet taken up:
- Clinical signs: rashes on a torso in four skin tones.
- Reshading the opaque clinical equipment; a see-through treatment for the glass test, incubator
  hood and culture plates.

### Batch 10 (16 Nov 2026)

Ten icons and two figures, taking the library to 183 icons and 5 figures. Committed, merged and
pushed on the author's "Commit and push", given without comment on the drawings.

- Primary immunodeficiency set (molecules): `nadph-oxidase`, `btk`, `cd40-ligand`,
  `il12-ifn-gamma-axis`, `perforin`.
- Flow cytometry set (clinical): `fluorescent-antibody`, `stained-cell`, `flow-cytometer`,
  `flow-dot-plot`, `flow-histogram`. The plots sit on a pale panel; fluorochromes are green and
  orange (`fluorGreen`, `fluorOrange`), and in single colour a circle and a diamond.
- Figures: `innate-response-bacteria` (two arms from the bacteria, sensing and complement, meeting
  at phagocytosis) and `flow-cytometry` (sample, antibodies, stained cell, cytometer, plots).
- Geometry is in the kit's batch 10 section; drawings are in a batch 10 section at the end of each
  icon script. In single colour the perforin icon leaves out the killer cell's granules: two dots
  above its curved edge read as a face.
- Choices the author has not commented on: BTK is shown inside B-cell receptor signalling
  (CD79, Syk, PLCγ2); the IL-12 loop is drawn at the level of cells, not molecules; the innate
  figure has no dendritic cell or link to adaptive immunity; the flow figure has no red-cell lysis
  or wash step.

### Count line and antibody deficiency figure (16 Nov 2026)

The site's count line now counts icons and figures separately ("183 icons and 6 figures"; "1 of 183
icons and 1 of 6 figures" when filtered). A sixth figure, `antibody-deficiency-blocks`, pairs with
`scid-blocks`: bone marrow (stem cell, V(D)J recombination, the BTK icon as the pre-B cell), a naive
B cell, then the lymph node (CD40 ligand, germinal centre), plasma cells and IgG and IgA. The author
has not reviewed the gene placements: BTK, IGHM, IGLL1, CD79A, CD79B and BLNK at the pre-B cell;
CD40LG and CD40 at T-cell help; AICDA and UNG at class switching; NFKB1, NFKB2, CD19 and TNFRSF13B at
the step to plasma and memory cells. Committed and pushed on "Commit and push", without comment.

### Pre-B-cell receptor, dihydrorhodamine test and site redesign (16 Nov 2026)

- Icons (186 in all): `pre-b-cell-receptor` (mu heavy chains with VpreB and lambda 5, CD79a/b; it replaces the
  BTK icon at the pre-B step of `antibody-deficiency-blocks`), and `dhr-cgd` and `dhr-carrier`, which are
  `flowHistogram` drawn with other peaks (`FLOW_HISTOGRAM.cgd` and `.carrier` in the kit).
- Figure (7 in all): `dihydrorhodamine-test` (neutrophil, NADPH oxidase, flow cytometer, then the normal,
  CGD and X-linked carrier histograms).
- Site: a hero with numbers and a showcase of floating icons (`SHOWCASE` in `assets/app.js`), sticky
  controls, category chips with counts, the whole library grouped under category headings when nothing
  is filtered, previous/next in the detail view (also the arrow keys), tags that search, and a how-to
  footer. Still static, with no external fonts or scripts. Committed and pushed on "Commit and push",
  without comment on the drawings or the design.

### Routes of vertical infection (16 Nov 2026)

An eighth figure, `vertical-infection-routes`, chosen on the author's "you choose": three rows (before birth across the
placenta, during birth, after birth through breast milk), each a stage icon and its organisms. Rubella, Zika and
listeria are left out; rubella and Zika have no icon. Committed and pushed on "Commit and push", without comment; only the
labelled colour version was checked in PowerPoint.

### Antibiotic targets and two immunodeficiency figures (24 Nov 2026)

- Icon (187 in all): `bacterial-cell`, a rod cut open (wall with peptidoglycan ticks, membrane bilayer, the
  chromosome as one strand coiled into loops, plasmid, ribosomes and a polysome, three folate steps).
  Geometry in `BACTERIAL_CELL` (kit, batch 11 section), with `stadiumPath` and `nucleoidLoops`.
- Figures (11 in all): `antibiotic-targets` (the cell with drug classes at their targets, and four resistance
  icons in a box), `msmd-blocks` (the IL-12 / interferon-γ loop with gene defects) and `hlh-blocks`
  (granule movement and fusion with gene defects, then what happens when killing fails).
- Figures can now have `leaders`: thin lines from a label to the part it names, ending in a dot. They are
  drawn with the labels, so they vanish from the unlabelled versions. `onIcon` in the figure script turns
  an icon's own 256 px coordinates into figure coordinates.
- Unreviewed choices: the gene placements in both figures (IRF8 and IKBKG at IL-12 production, CYBB at the
  respiratory burst; in HLH, LYST and AP3B1 at granule formation, RAB27A with UNC13D, STX11 and STXBP2 at docking and fusion, and PRF1 on its own at the perforin step, which the author asked to stand out; the syndromes (FHL2 to 5, Griscelli 2, Chédiak–Higashi, Hermansky–Pudlak 2) sit in plain text under the genes, also at the author's request); the cell is a generic rod with no outer
  membrane, so polymyxins point at the cell membrane. Committed and pushed on "Commit and push"; the author asked for PRF1 to
  stand out and for the FHL numbers, and otherwise did not comment on the science.

### Gram-negative cell and complement deficiency (24 Nov 2026)

- Icons (189 in all): `gram-negative-cell` (LPS, outer membrane with porins, thin peptidoglycan in the
  periplasm, inner membrane; the contents of `bacterial-cell` drawn at `gramNegative.scale` inside, taken
  from that drawing so the two stay in step) and `porin-loss` (resistance: drug through a porin, bouncing
  off where one was lost). `onStadium` in the kit places things round a stadium.
- `antibiotic-targets` now uses the Gram-negative cell: polymyxins at the outer membrane; daptomycin and
  glycopeptides marked "(Gram-positives)"; porin loss added as a fifth resistance mechanism.
- Figure (12 in all): `complement-blocks` (the cascade icon with leaders to its three pathways, then C3b
  and the membrane attack complex; genes in red, what each deficiency causes in plain text). Unreviewed:
  MBL2/MASP2 as "infections in early childhood", CFH/CFI with C3, and eculizumab under C5 to C9. Committed and pushed
  on "Commit and push", without comment on the science.

### Neonatal sepsis and meningitis (24 Nov 2026)

- Figures (14 in all): `neonatal-sepsis` (early onset from the mother: GBS, E. coli, Listeria; late onset from
  lines and the unit, with the incubator as the preterm baby: staphylococci, Gram-negatives, Candida) and
  `meningitis-pathogenesis` (droplets and carriage, bloodstream, meninges, neutrophils in CSF, lumbar puncture;
  then the usual causes in newborns and in older children). Both use existing icons only.
- Figure labels can now set words in italics with `*text*` (for species names); no existing label changed.
- The gallery was checked in the browser for everything from the antibiotic figure onwards. Committed and pushed
  on "Commit and push", without comment on the science.

How the author works: short go-aheads ("Crack on!", "Commit and push", "You choose"), and close
review of the pictures. Show every change as a PowerPoint-rendered picture before asking to
commit. After a merge, list any leftover branch and untracked pictures and ask before deleting;
delete only what was named.

Practical notes for the build:
- `npm run all` sometimes fails on Windows with `UNKNOWN: unknown error, open …svg`. It is a
  transient file lock; run it again.
- Do not patch files with `sed` or shell heredocs that contain backslashes: they were mangled more
  than once. Use the Edit tool, or a small Node script with plain string replacement.
- Pictures for the author are made by putting SVGs on a slide with pptxgenjs and exporting it
  through PowerPoint's COM interface. The scripts lived in a session scratchpad and are gone;
  they are a few lines each and quick to rewrite.

## Status (27 Oct 2026, batch 8)

163 icons in 11 categories: bacteria 23, viruses 18, fungi 5, parasites & vectors 11, immune cells 20,
molecules 15, organs & body systems 17, treatment 12, antimicrobial resistance 7, clinical & lab 29,
transmission 6. Seven icons with skin (child, newborn, baby, pregnant person, hand hygiene, parent and
baby, glass test) come in four skin tones. The single-colour brain and heart have their lines
thickened (`ART_THICKEN` in the mono script) so they hold up at small sizes.

The transmission icons (droplet, airborne, contact, faecal–oral, vector-borne, vertical) were agreed
with the author as one SVG per route, built from the same few parts in `TRANSMISSION` (kit): neutral
head-and-shoulders figures (no skin, so no tone versions), the route's agent, and `curvedArrow`.

### Batch 9 (13 Nov 2026)

Eight icons, taking the library to 171: EBV infecting a B cell, human papillomavirus, Ebola virus,
Helicobacter pylori, haematopoietic stem cell, T-cell receptor complex, V(D)J recombination and
Entamoeba histolytica. Their geometry is in the kit's batch 9 section and their drawings in a
batch 9 section at the end of each script. A separate VZV icon was dropped: its particle would
be identical to the herpesvirus icon, which already carries the VZV and EBV search tags.

### Figures (16 Nov 2026)

A new kind of item: wide diagrams assembled from the icons, in `figures/`, drawn by
`tools/draw-figures.js` (part of `npm run all`). The first is `vaccine-response`. A figure is a list of
icons with positions, arrows, regions (tissues drawn as pale rounded boxes) and labels; the icon
scripts now export `DRAWINGS` and only write files when run directly, and `svgDocument` takes a
width and height. The author asked for labels to be optional, so every figure is written with and
without them (`-labelled`), in colour and single colour. On the site figures are the `figures`
category: a catalogue entry adds `labelledFile` and `labelledMonoFile`, cards span two columns, and
the detail view has a labels switch. Labels render in PowerPoint as a picture; whether they stay
editable after Convert to Shape has not been tested.

The second figure is `t-cell-development` (bone marrow, stem cell, the thymus as a region, naive
T cells, lymph nodes and spleen). Arrows can bend (a third, middle point is the control point) and
a `|` in a label starts a new line. Check a figure by rendering its labelled versions in PowerPoint:
labels run into each other easily, so prefer two short lines to one long one.

The third figure, `scid-blocks`, is the thymus layout with `blocks` (barred rings where a defect
stops the pathway) and `alerts` (gene names in red italics). The rings are part of the drawing, so
they also appear in the unlabelled versions. The author has not yet reviewed which genes sit at
which step.

CD4 and CD8 T cells are icons of their own (`cd4-t-cell`, `cd8-t-cell`): `tCell` takes a co-receptor,
which replaces every other receptor. CD4 is one tall orange rod, CD8 a pair of pink stalks with round
heads; in single colour, a thick bar and a stalk with a round head.

## Shading model (11 Nov 2026)

All colour icons were moved to a second shading model, set in the kit: shadows mix towards a
deep, slightly cooler tone of the base colour (`deepen`; `shade` is now the same thing), highlights
towards a warm white (`lift`), a soft sheen replaces the bright gloss, outlines are 2.5 px, and
overlapping objects cast soft shadows (`castGradient` plus clip paths; still no filters). Six icons
were redrawn by hand to use it fully: staphylococcus, red blood cells, T cell, liver, kidneys and
child. The other icons only inherited the new gradients and outlines.

The other people (newborn, baby, pregnant person, parent and baby) were then reshaded the same
way, keeping their poses so the single-colour versions still match. `joined` and `shadowOn` in
the colour script draw merged outlines and cast shadows for people.

The early organs then gained surface detail with unchanged outlines: lungs (fissures as grooves,
a bronchial tree that narrows by generation), spleen (hilum groove, branching artery and vein),
thymus (septa dividing the lobes into lobules, front lobe shading the back one) and liver (round
ligament, lower border rolling under). Both versions of the liver take their outline and
falciform ligament from `LIVER` in the kit.

Cast shadows are added a category at a time with two helpers at the top of the colour script:
`stackShadows` (objects overlapping each other, such as cocci in a chain) and `surfaceClip` with
`shadowsOn` (objects on one surface, such as a nucleus on its cell). Bacteria are done: streptococcus,
enterococcus, M. tuberculosis, C. diphtheriae, listeria, salmonella, mycoplasma and chlamydia.
Capsules are treated as a halo, not a surface, and spores inside a cell cast nothing.

Immune cells are done too (15 icons): each nucleus shades its cytoplasm with `shadowOf`, with
`lobesShape` merging multilobed nuclei into one silhouette, and the T cell shades its target in
CD8 killing. Platelets, diapedesis and the germinal centre were left: nothing large overlaps.

Viruses are done (8 icons): a capsid or core shades the inside of its particle in herpesvirus, HIV,
hepatitis B, hepatitis C, rotavirus and mpox (`capsidShape` gives the silhouette of a capsid drawn
by `capsidFacets`); the face-on spikes shade the SARS-CoV-2 envelope; the nucleus shades the CMV
cell. Surface views and particles whose genome is a loose ribbon were left.

Fungi and parasites are done (7 icons): candida (nucleus, and the bud on the mother cell),
cryptococcus, toxoplasma, leishmania and giardia (nuclei), malaria (front red cell on the back one)
and schistosoma (female on male). The arthropods, hyphae and worms were left.

Molecules: only the two with a whole cell got shadows (the phagocyte's nucleus in C3b opsonisation
and Fc receptor). The rest are schematic diagrams of domains and membranes, where shadows would
add clutter, so they were left on purpose.

Organs: lymph node (follicles on the cortex), heart valve (vegetations on the cusps) and placenta
(cord on the fetal surface) got shadows. The brain and heart are the author's drawings and were not
touched; the cross-sections (skin, eye, ear, meninges, knee, bone) and the intestines were left.

The last four categories are done (10 icons), which completes the cast shadows. Treatment: vaccine
(the syringe's plunger on the vial) and CAR T cell (nuclei). Resistance: susceptibility plate (discs
on the agar). Clinical: blood agar plate (colonies) and microscope (head, stage and focus knob on the
arm). Transmission: the head shades the shoulders in `bust` (droplet, airborne, vector-borne), and in
vertical transmission the head shades the body and the fetus the wall of the uterus. Everything else
in these categories is a single object, objects that sit apart, or a schematic diagram, and was left.

## Glass and plastic (12 Nov 2026)

The glass and clear-plastic kit (14 icons) was reshaded with four helpers at the top of the treatment
section of the colour script: `glassGradient`, `roundingGradient` (the vessel's shape laid over its
contents, darkening both sides), `meniscus` and `barrelLight` (syringe barrels). Done: vaccine, oral
suspension, IV bag, monoclonal antibody, nasal spray, blood culture bottle, blood bottles, NP swab,
urine dipstick, nebuliser mask, PCR tube, thermometer, IV cannula and Gram stain slide (flat glass,
its own gentle gradient). Left: the glass test (a see-through tumbler), the incubator hood and the
culture plates.

Browser screenshots time out often. A reliable way to check icons is to put them on a slide with
pptxgenjs and have the installed PowerPoint export it as a PNG (COM automation from PowerShell); this
also proves they render in PowerPoint. PowerPoint for Windows renders all 163 icons correctly;
Keynote and older Office are untested.

## Convert to Shape (12 Nov 2026)

The author tested PowerPoint's Convert to Shape and found shadows spilling and highlights turning
solid white. STYLE.md's technical rules record what PowerPoint keeps and drops. The fix has two
parts: `softEllipse` in the kit (sheens, soft shadows and dips as nested plain ellipses;
`glossGradient` now only registers a sheen's strength), and `tools/convert-safe.js`, applied to
every colour icon as it is written, which cuts clipped shapes to their outline with `paper` and
`paperjs-offset` (dev dependencies: run `npm install` before `npm run all`). Two clip paths remain,
in the meninges and the Gram stain slide; single-colour icons are not processed.

Conversion can be run by automation (select the picture, `ExecuteMso('ObjectsUngroup')`), but
PowerPoint shows a confirmation dialog that someone must click, and complex icons take about a
minute each. Do not send keystrokes to the author's PowerPoint to answer it.

### Soft rings (13 Nov 2026)

The nested plain ellipses showed as concentric rings, which the author disliked. Each ring of a
`softEllipse` now has its own radial fade (`softFill`; one gradient per colour per icon, named by
`svgDocument`), so the patch is smooth as a picture. The author tested conversion: PowerPoint
flattens each ring but keeps its opacity, so the rings reappear only once converted, which the
author accepts. A straight-line fade was tried and rejected: it can only be soft on one side.

A soft patch cannot be cut to a clip path. `convert-safe.js` passes one through untouched if it
lies wholly inside its clip; otherwise the colour script fails and names the icon. Shadows that
must be trimmed to a shape (staphylococcus, red blood cells) use the stepped kind instead.

## Ideas not yet done

- The globe has lines of latitude and longitude but no continents; drawing coastlines accurately
  would need real map data.
- A throat/tonsils icon was dropped: an open-throat view (two tonsils, uvula, tongue) reads as a face.
- Watch for faces: two round features above a horizontal one read as a face (it happened with
  the nebuliser mask, the incubator's portholes, the aortic valve's cusp curves, and germs drawn
  inside a single-colour outline), which the author wants to avoid.
