# Ring Anthology: Prisms

An unofficial Halo fan game for Anwar and his kids (ages 7 to 13+): a 2D co-op
side-scroller through the whole Halo timeline. Phaser 3.90 and Vite, plain JavaScript
(ES modules), no backend.

## Rules that never bend

1. **Canon only.** Nothing new is added to the Halo story: no invented characters,
   events, bosses, dialogue or narrator. Gameplay may stage a canon event but never
   change it. Uncertain facts are marked **(verify)** and checked with the `lore-check`
   skill. See "The canon rule" in docs/CAMPAIGN.md.
2. **Legal.** Follow docs/LEGAL.md: original art and sound only, no Halo music except
   Halo 3, never commercial, the Microsoft notice on the title screen and in the
   README, no data collection, no network calls.
3. **Kid-friendly.** Enemies vanish in light puffs. Deaths are told gently on Archive
   cards, never shown (docs/LORE.md, "Kid-friendly presentation").
4. **EPIC.** Every level needs spectacle: arenas, set pieces, screen shake, slow
   motion, music swells, letterboxed boss intros.

## Working on levels

Use the project skills in `.claude/skills/`:

| Skill | When |
|---|---|
| `new-level` | Building a level from its CAMPAIGN.md entry |
| `new-content` | Adding a character, unit, weapon, body, theme or track |
| `lore-check` | Before writing any story text; clears (verify) items |
| `playtest` | After any change to a level or the engine |

**Token budget:** to build a level, read its CAMPAIGN.md entry, docs/ENGINE.md, and
the template. Do not read other levels or the engine source unless the engine itself
must change. When the engine changes, update docs/ENGINE.md in the same change.

## Layout

- `levels/<id>/level.js`: one data file per level. Registered automatically; the play order comes from docs/CAMPAIGN.md.
- `src/content/`: data catalogs (characters, units, weapons, bodies, themes, music). Pure ESM, no Phaser, so Node scripts can import them.
- `src/engine/`: engine modules. `config.js`, `rules.js` and `mapparse.js` are pure and unit-tested.
- `src/scenes/`: Phaser scenes (`LevelScene`, `HudScene`, `menus.js`).
- `scripts/validate.mjs`: level, catalog and legal checks. `tests/`: unit tests, smoke test, probe.

## Commands

- `npm start`: play
- `npm test`: unit tests and validator
- `npm run smoke`: headless run of the title screen and every level (Chromium; set `CHROMIUM_PATH` if it's not `/usr/bin/chromium`)
- `node tests/smoke.mjs --level <id> --finish`: the bot plays the level to the end (no general checks)
- `node tests/smoke.mjs --checks`: only the general checks (menus, controls, pause, spawns, ...)
- `node tests/probe.mjs --level <id>`: state dump every 5 s
- `node tests/perf.mjs [ids] [--seconds 90]`: the bot plays each level on the real GPU; frames over 50 ms and mid-level art go to test-results/perf.txt
- `node tests/sheets.mjs [ids]`: screenshot contact sheet per level (bot playing) in test-results/sheets/, for visual review
- `npm run soundtrack`: download the PRIVATE home soundtrack (Halo music, home play only) into public/home-soundtrack/private/. Never commit or publish it.
- Screenshots and test output go to `test-results/` (gitignored)
