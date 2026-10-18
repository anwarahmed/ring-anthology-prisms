# Where things stand

A handoff note so work can resume in a new session without loss (the user's token
quota runs out periodically). **Resume from the first unticked box in "The plan".**
Tick boxes and commit after each step. Everything ticked is committed.

## The plan (user, 2026-10-18: "Continue 1 to 7. Keep track of progress.")

1. **Restyle every screen** to match the in-game art: painted backdrops, ornate
   panels, gradient headers, era emblems, glowing selection bars.
   - [x] Shared menu art helpers (`src/engine/menuart.js`)
   - [x] Title
   - [x] Player join (Players)
   - [x] Level select (Timeline)
   - [x] Archive cards
   - [x] Results
   - [x] Pause
   - [x] Controls
   - [x] Graphics
   Review all menu screens with `node scripts/screens.mjs` (test-results/screens/sheet.png).
2. **Richer interiors:** back-wall decoration props (pipes, cables, banners, glyph
   panels) for indoor themes.
   - [x] Decoration kinds in scenery.js, placed on back-wall areas
   - [x] Added to indoor themes; screenshots reviewed (new themes: add a `decor` list)
3. **Reliable tests** (keyboard/menu checks fail when the machine is loaded):
   - [x] Replace fixed waits with waiting on outcomes; retry key presses (passes at load 20)
   - [x] `--level <id>` runs skip the general checks; `--checks` runs only them
4. **Part II:** bot-finish 2a, 2b, 2c, 2e, 2f (2d done); set `done` in CAMPAIGN.md.
   - [ ] 2a  - [ ] 2b  - [ ] 2c  - [x] 2e  - [ ] 2f  - [ ] statuses + commit
   (Write batches of standard levels with `scripts/levelgen.py` + `scripts/genmap.py`.)
   (Bot runs: `test-results/verify.sh <ids>` runs three at a time; logs in
   test-results/finish/. If lost: a loop over `node tests/smoke.mjs --level <id> --finish`.)
5. **Part III (3a–3m)** with the `new-level` skill. New content: a Jiralhanae (Brute)
   rig, San'Shyuum Stoics, Lekgolo/Hunter variants, Kig-Yar, Spartan-II trainees,
   Noble Team, Johnson, Forge, Red Team, Atriox, Decimus, Itho 'Hesiikee, Maccabeus,
   Choppers; themes for Janjur Qom (2100 BCE), Ulgethon, Rentus, High Charity,
   Doisac, Reach, Harvest, Trove, Algolis.
   - [x] content (brute rig, 15 characters, 16 units, weapons, Chopper, Scorpion, 11 themes, 3 tracks)  - [ ] 3a - [ ] 3b - [ ] 3c - [ ] 3d - [ ] 3e - [ ] 3f - [ ] 3g
   - [ ] 3h - [ ] 3i - [ ] 3j - [ ] 3k - [ ] 3l - [ ] 3m
   Status: all 13 written and committed (validator passes). A box is ticked once the
   bot finishes the level (`node tests/smoke.mjs --level <id> --finish`) and its
   CAMPAIGN.md status is set to done. Map generator for standard
   levels: `python3 scripts/genmap.py SEED [--hazard] [--indoor] [--ceiling]`.
6. **Parts IV–VII, Firefight, publish** (GitHub repo + Pages via the bare-clone layout
   in ~/Developer/GitHub/anwarahmed/; the user authorized creating the repo).
   - [ ] Part IV (4a–4f) (written + committed; bot pending)  - [ ] Part V (5a–5h) (written + committed; bot pending)  - [ ] Part VI (6a–6g)
   - [ ] Part VII (7a–7g)  - [ ] Firefight  - [ ] publish
7. **Halo 3 chiptune arrangements:** blocked until the user supplies MIDI files
   (docs/LEGAL.md: Halo 3 music only, into the gitignored home-soundtrack folder).
   Ask when everything else is done.

## Done

- **Part I (1a–1f)** built, canon-checked, finished by the bot; statuses `done`.
- **Part II (2a–2f)** built and validated; 2d bot-finished.
- **Part III research** done and written into the 3a–3m specs (no `(verify)` left).
- **Engine:** vehicles (Warthog with gunner, Ghost, Banshee), weapon drops, allies
  avoid hazards and keep their own spots, front shields, remappable controls with
  guided setup, smooth camera and fades, co-op leash that keeps everyone on screen.
- **Graphics:** HD canvas (960×540, cameras zoomed 2×, worldView corrected in
  `hdCamera`); three art styles (pre-rendered default, hybrid, pixel); HD shaded
  sprites, props and tiles; painted backgrounds; scenery props, ground-standing
  pillars, light pools, vignette, ground shadows.
- **GRAPHICS screen** (title and pause menus): art style (saved; reloads), CRT presets
  and individual effects (`src/engine/crt.js`), Show FPS. Comparison shots:
  `node scripts/compare-graphics.mjs`.
- **Playtest fixes (2026-10-18):** left half of the screen not drawn; CRT overlay
  drawn black; units falling through the floor; stacked allies; floating arms after
  defeat; checkpoint restart loop; indoor spawns above the ceiling; level select
  points at the next level. Each has a smoke check.

## User decisions to respect

- Canon only; kid-friendly; EPIC; natural color grade; subtler foreground; stronger
  lighting; players choose the art style; CRT options wanted; unlimited ammo and
  grenades; weapon drops (no duplicates); Start plays from the level select.
- Halo rings: when standing on a ring, the far side rises from the horizon
  (`ringrise`); off a ring, show the whole ring (`halo`).
- The user plays with an 8BitDo M30 ("6B controller"); tests hide real controllers.
- The user records bugs as screen recordings in ~/Videos; extract frames with ffmpeg.
