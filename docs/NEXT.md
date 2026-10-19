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
   - [x] 2a  - [x] 2b  - [x] 2c  - [x] 2e  - [x] 2f  - [x] statuses + commit
   (Write batches of standard levels with `scripts/levelgen.py` + `scripts/genmap.py`.)
   (Bot runs: `test-results/verify.sh <ids>` runs three at a time; logs in
   test-results/finish/. If lost: a loop over `node tests/smoke.mjs --level <id> --finish`.)
5. **Part III (3a–3m)** with the `new-level` skill. New content: a Jiralhanae (Brute)
   rig, San'Shyuum Stoics, Lekgolo/Hunter variants, Kig-Yar, Spartan-II trainees,
   Noble Team, Johnson, Forge, Red Team, Atriox, Decimus, Itho 'Hesiikee, Maccabeus,
   Choppers; themes for Janjur Qom (2100 BCE), Ulgethon, Rentus, High Charity,
   Doisac, Reach, Harvest, Trove, Algolis.
   - [x] content (brute rig, 15 characters, 16 units, weapons, Chopper, Scorpion, 11 themes, 3 tracks)  - [x] 3a - [x] 3b - [x] 3c - [x] 3d - [x] 3e - [x] 3f - [x] 3g
   - [x] 3h - [x] 3i - [x] 3j - [x] 3k - [x] 3l - [x] 3m
   Status: all 13 written and committed (validator passes). A box is ticked once the
   bot finishes the level (`node tests/smoke.mjs --level <id> --finish`) and its
   CAMPAIGN.md status is set to done. Map generator for standard
   levels: `python3 scripts/genmap.py SEED [--hazard] [--indoor] [--ceiling]`.
6. **Parts IV–VII, Firefight, publish** (GitHub repo + Pages via the bare-clone layout
   in ~/Developer/GitHub/anwarahmed/; the user authorized creating the repo).
   - [x] Part IV (4a–4f)  - [x] Part V (5a–5h)  - [x] Part VI (6a–6g)
   - [x] Part VII (7a–7g)  - [x] Firefight  - [x] publish
7. **Halo music (home only):** the user chose a PRIVATE route instead of public
   chiptune arrangements. The private repo anwarahmed/ring-anthology-prisms-soundtrack
   (created, PRIVATE) holds game-ready clips + manifest.json; `npm run soundtrack`
   clones it into public/home-soundtrack/private/ (gitignored, stripped from builds,
   blocked by the Pages workflow). The game plays manifest entries per level/era/track,
   with calm/combat/boss files following intensity (src/engine/audio.js). [x] DONE
   2026-10-18: every level and the menus have home music, built by the private repo's
   tools/build.mjs from its music plan (tools/soundtrack.txt); verified playing in the
   browser, including intensity switches.
   `music-sources/` (sheet references) is no longer needed.
8. **Polish (user, 2026-10-19: "continue with the rest of the tasks"):**
   - [x] Performance scan: every level on the real GPU path, log frame hitches (> 50 ms)
     and fix the causes. `node tests/perf.mjs`: all 53 levels 60 fps, no slow frames
     (2026-10-19), nothing to fix
   - [x] Sound: MUSIC and EFFECTS volume sliders on the SETTINGS screen (saved)
   - [x] Visual polish: a screenshot of every level's arenas (`node tests/sheets.mjs`);
     fixed: stacked medal/pickup/checkpoint text, empty defenses (next group comes
     early when the field is cleared), HUD cut by the letterbox, Sangheili names
     starting with an apostrophe, allies left behind or shut out of arenas (the 4f
     Scarab never followed)

9. **Next round (user, 2026-10-19: "let's do those" + animations, prologue, epilogue).**
   The user will playtest later; the 30-minute quota check-in resumes from here.
   - [x] Halo Infinite OST (zip in the private repo's sources/): clips for the Zeta
     Halo levels (7c–7g), music plan + manifest, commit+push PRIVATE repo only
   - [x] Controller picture on the CONTROLS screen (user's 8BitDo M30, drawn in code;
     src/engine/padart.js). L/R = buttons 6/7 per SDL's mapping: unverified on the
     real pad (the live highlight shows it)
   - [ ] Two-player + difficulty pass: bot-finish levels with 2 players on Easy and
     Normal (no god mode); fix stuck spots, far checkpoints, P2 off screen
   - [ ] Leftovers: 3m glowing decoration; bot leaves a stuck vehicle sooner
   - [ ] Level intro/outro animations that match the Archive cards (before/after)
   - [ ] Prologue (before Part I) and grand animated epilogue after the last level;
     canon-only text (lore-check), kid-friendly
   - [ ] Extras: medals and best times on the level select; Skulls menu (fun
     modifiers); more Firefight maps

## Published

- Repo: https://github.com/anwarahmed/ring-anthology-prisms (public). Play:
  https://anwarahmed.github.io/ring-anthology-prisms/ . Every push to main runs
  `npm test`, builds and deploys (`.github/workflows/pages.yml`).
- Working copy: ~/Work/ring-anthology-prisms (remote origin). Bare clone with a `main`
  worktree: ~/Developer/GitHub/anwarahmed/ring-anthology-prisms (the user's layout).
- **Push after committing** (`git push`) so the site updates.

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
- **SETTINGS screen** (title and pause menus): art style (saved; reloads), CRT presets
  and individual effects (`src/engine/crt.js`), Show FPS, music and effects volume, and MUSIC (home soundtrack
  or built-in; only with a home soundtrack). Comparison shots:
  `node scripts/compare-graphics.mjs`.
- **Playtest fixes (2026-10-18):** left half of the screen not drawn; CRT overlay
  drawn black; units falling through the floor; stacked allies; floating arms after
  defeat; checkpoint restart loop; indoor spawns above the ceiling; level select
  points at the next level. Each has a smoke check.
- **Playtest fixes (2026-10-19):** softer explosions; level select after a level; held
  directions repeat in menus; breakable Jackal shields; arenas keep enemies inside;
  Halo rings drawn as 3D ribbons (off-ring) and a new arching ring-rise sky (on-ring,
  with pristine / damaged / unfinished states); new Warthog with visible riders;
  riders in every vehicle drawn down to the hull (no floating helmets).

## User decisions to respect

- Canon only; kid-friendly; EPIC; natural color grade; subtler foreground; stronger
  lighting; players choose the art style; CRT options wanted; unlimited ammo and
  grenades; weapon drops (no duplicates); Start plays from the level select.
- Halo rings: when standing on a ring, the far side rises from the horizon
  (`ringrise`); off a ring, show the whole ring (`halo`).
- The user plays with an 8BitDo M30 ("6B controller"); tests hide real controllers.
- The user records bugs as screen recordings in ~/Videos; extract frames with ffmpeg.
