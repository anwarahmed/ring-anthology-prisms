---
name: playtest
description: >
  Playtest Ring Anthology: Prisms headlessly: run the tests and validator, have the
  autopilot bot play a level to the end in Chromium, probe the game state, and review
  screenshots for bugs and missing spectacle. Use after building or changing a level
  or the engine, when asked to "test", "playtest", "check the level", or "does it
  work", and before committing.
---

# Playtesting

All output goes to `test-results/` (gitignored). Chromium is at `/usr/bin/chromium`;
elsewhere, set `CHROMIUM_PATH`.

## Steps

1. `npm test`: the unit tests and validator must pass.
2. `node tests/smoke.mjs --level <id> --finish --shots test-results/<id>`: the bot
   (in god mode, with two players) plays until the results screen and takes a
   screenshot every 10 s. It fails on any page error, or if the level doesn't finish in
   15 minutes. Run it in the background if it might take more than 10 minutes.
3. **If it gets stuck:** `node tests/probe.mjs --level <id> --seconds 180 --every 10`
   prints players, the arena, the triggers fired, and live enemies.
   - Players with huge `y` and `vy` have fallen out of the world.
   - The same `fired=` for a long time with `enemies=0` means a wave is waiting on a
     unit that can't be reached.
   - Players never reaching a marker means the map is blocking them.
4. **Review 3–5 screenshots** (start, each arena, the climax) for:
   - HUD text overlapping, or unreadable text
   - players off screen, inside walls, or stacked out of reach
   - arenas with no visible action, or enemies spawning invisibly
   - missing spectacle: no bombardment, no shake or glow, a flat ending
5. `npm run smoke` before committing an engine change, to cover the title screen and
   every level.

## Reporting

Say what passed with evidence (the "finished" line, the test counts), what failed with
its output, and which screenshots you looked at. Don't call a level done unless the bot
finished it.

The bot only proves the level *can* be finished. Remind the user that real
playtesting with the kids decides whether it's fun and fair. Ask what they found too
hard, too easy, or boring, and tune difficulty with the waves and hold timings.
