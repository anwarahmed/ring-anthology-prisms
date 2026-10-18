# Where things stand

A handoff note so work can resume in a new session without loss. Update it whenever a
milestone lands. Everything listed as done is committed.

## Done

- **Part I (1a–1f)** built, canon-checked, finished by the bot; statuses `done`.
- **Part II (2a–2f)** built and validated (`npm test` passes). Statuses still
  `planned`: the bot finished 2d; 2a, 2b, 2c, 2e and 2f still need a bot run
  (`node tests/smoke.mjs --level <id> --finish`), and then set `done` in CAMPAIGN.md.
- **Part III research** done and written into the 3a–3m specs (no `(verify)` left).
- **Engine:** vehicles (Warthog with gunner, Ghost, Banshee), weapon drops, allies
  avoid hazards, front shields, remappable controls with guided setup, smooth camera
  and fades, co-op leash that keeps everyone on screen.
- **Graphics:** HD canvas (960×540, cameras zoomed 2×); three art styles
  (pre-rendered default, hybrid, pixel) selectable by `?style=`; HD shaded sprites,
  props and tiles; painted backgrounds (mountains, clouds, ruins, light shafts,
  industrial, temple, fog, beacons, perspective floor, ringrise for on-ring levels);
  scenery props, foreground silhouettes, light pools, vignette, ground shadows.
- **GRAPHICS screen** (title and pause menus): art style (saved; reloads), CRT presets
  and individual effects (`src/engine/crt.js` overlay), Show FPS. Comparison shots:
  `node scripts/compare-graphics.mjs`.

## In progress / next (in this order)

1. **Upgrade every screen** to the new style: title, player join, level select,
   Archive, results, pause, controls, graphics. Painted backdrops, ornate panels,
   gradient headers, era emblems, glowing selection bars.
2. **Interiors:** back-wall decoration props (pipes, cables, banners, glyph panels)
   are still to do; the user approved "richer interiors".
3. Make `node tests/smoke.mjs --level <id>` skip the general checks (they are
   timing-sensitive under load); keep them for the no-`--level` run.
4. Bot-verify 2a, 2b, 2c, 2e, 2f; mark Part II `done`; commit.
5. Resume levels: **Part III (3a–3m)** with the `new-level` skill. New content needed:
   a Jiralhanae (Brute) rig, San'Shyuum Stoics, Lekgolo/Hunter variants, Kig-Yar,
   UNSC Spartan-II trainees, Noble Team, Johnson, Forge, Red Team, Atriox, Decimus,
   Itho 'Hesiikee, Maccabeus; Choppers; themes for Janjur Qom (2100 BCE), Ulgethon,
   Rentus, High Charity, Doisac, Reach, Harvest, Trove, Algolis.
6. Then Parts IV–VII; then publish to GitHub (publish-project skill + a GitHub Pages
   variant).

## User decisions to respect

- Canon only; kid-friendly; EPIC; natural color grade; subtler foreground; stronger
  lighting; players choose the art style; CRT options wanted; unlimited ammo and
  grenades; weapon drops (no duplicates); Start plays from the level select.
- Halo rings: when standing on a ring, the far side rises from the horizon
  (`ringrise`); off a ring, show the whole ring (`halo`).
- The user plays with an 8BitDo M30 ("6B controller"); tests hide real controllers.
