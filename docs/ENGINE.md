# Engine Reference

Everything needed to build a level without reading the engine's code or any other
level. A level is one data file: `levels/<id>/level.js`. It's registered automatically,
and its place in the timeline comes from [CAMPAIGN.md](CAMPAIGN.md).

Start from [`levels/_template/level.js`](../levels/_template/level.js).

## The level file

```js
export default {
  id: '1a',                      // must match the folder and a CAMPAIGN.md entry
  title: 'Lord of Admirals',
  era: 'forerunner',             // forerunner | covenant | created | banished
  theme: 'charum-hakkor',        // src/content/themes.js (tiles + backdrop)
  music: 'last-stand',           // src/content/music.js
  players: ['forthencho', 'ancient-human-soldier'],  // P1, P2 (src/content/characters.js)
  archive: { before: [card, ...], after: [card, ...] },
  legend: { h: { unit: 'ancient-human-defender', ally: true } },
  map: [ '#....', ... ],         // ASCII rows, all the same width
  script: [ trigger, ... ],
  hooks: { async name(api) {} }, // optional custom set pieces
};
```

### Archive cards

```js
{ title: 'The Surrender', when: 'c. 107,472 BCE', where: 'Citadel Charum',
  text: 'Neutral, kid-readable, canon only.', source: 'Halopedia: Battle of Charum Hakkor' }
```

Every card needs `title`, `text` and `source`. Cards that tell an archive scene from
CAMPAIGN.md go in the `before` list of the level that follows that scene.

## The map

Rows of characters, all the same width. One tile is 16 px. The screen is 30 × 17 tiles.
Keep the ground at row 13 (rows 13–16 solid) unless the level needs height.

| Char | Meaning |
|---|---|
| `.` | air |
| `#` | solid |
| `=` | one-way platform (jump up through it; crouch + jump drops down) |
| `^` | hazard (hurts and bounces players) |
| `:` | background wall (decoration, no collision) |
| `P` | player spawn (exactly one) |
| `X` | exit: reaching it ends the level (when no arena is locked) |
| `A`–`Z` except `P`, `X` | markers for the script (each used once) |
| `a`–`z` | entities from the level's `legend` |

**Legend entries:** `{ unit: '<unit id>' }` places an enemy, and
`{ unit: '<unit id>', ally: true }` places an ally. Placed units appear without an
entrance effect.

**Arenas** are locked between two marker columns. An arena should be at most 30 tiles
wide so it fits on screen.

**Tip:** generate long maps with a short script that paints rectangles, then paste the
rows into the level file. Check that `npm run validate` reports equal widths.

## The script

A list of triggers. `on: 'start'` runs when the level begins; `on: 'B'` runs when any
player reaches marker B's column. Each trigger runs its `do` actions in order.
Blocking actions finish before the next action starts.

| Action | Blocks | Effect |
|---|---|---|
| `{ objective: 'Hold the gate' }` | no | Shows the objective at the top |
| `{ say: 'text', who: 'Name' }` | yes | Subtitle. **Canon quotes or neutral narration only** |
| `{ music: 'track', intensity: 0 }` | no | Switches track |
| `{ intensity: 0\|1\|2 }` | no | Calm, combat, or boss layers (the music swell) |
| `{ wait: 2 }` | yes | Seconds |
| `{ lock: ['B', 'C'] }` | no | Locks camera and players between two marker columns (arena) |
| `{ unlock: true }` | no | Opens the arena; shows "GO >" |
| `{ checkpoint: true }` | no | Respawn point if everyone goes down; refills grenades |
| `{ fx: 'shake' \| 'flash' \| 'slowmo' }` | no | Screen effect |
| `{ spawn: [group, ...] }` | no | Spawns enemies |
| `{ allies: [group, ...] }` | no | Spawns allies |
| `{ wave: [group, ...] }` | yes | Spawns, then waits until all are defeated |
| `{ hold: { seconds, every, label, groups: [[group...], ...] } }` | yes | Defense: spawns the groups in turn every `every` seconds until time runs out, then waits for the rest to be defeated |
| `{ boss: { unit, from, title, subtitle } }` | yes | Letterboxed title card, boss bar; waits until the boss is defeated |
| `{ call: 'hookName' }` | if async | Runs `hooks.hookName(api)` |
| `{ end: { result: 'win' \| 'history' } }` | yes | Ends the level. `'history'` is for canon defeats ("AS HISTORY RECORDS") |

**Group:** `{ unit: 'sentinel', n: 3, from: 'right', gap: 0.35 }`. `from` is `right`
or `left` (just off screen, on the ground), `sky` (above the screen), or a marker
letter. Units use their own entrance (teleport, drop, fly, walk).

## Hooks API

`hooks.create(api)`, `hooks.update(api, dt)`, and any name used by `call`. The `api`:

| Field | What it is |
|---|---|
| `scene` | The level scene (Phaser) |
| `players`, `units` | Live actors |
| `fx` | `puff`, `explosion`, `shake`, `flash`, `slowmo`, `hitstop`, `glow`, `ring`, `teleportIn` |
| `hud` | `say`, `objective`, `announce`, `letterbox`, `bossIntro`, `timer` |
| `audio` | `sfx(name)`, `setIntensity(n)`, `playMusic(id, n)` |
| `marker(k)` | `{ x, y }` in tiles |
| `spawn(groups, ally)` | Same as the spawn action; resolves to the units |
| `tile`, `view` | Tile size, screen size |

Use hooks for set pieces only. Anything two levels need belongs in the engine.

## Content catalogs (`src/content/`)

Add new entries through the `new-content` skill.

| File | Holds |
|---|---|
| `characters.js` | Playable characters: body, palette, shields, health, speed, jump, weapons, grenade, `kit` override, `extra` |
| `units.js` | AI units: body, palette, health, shields, speed, `ai`, weapon, range, entrance, puff color, `boss` |
| `weapons.js` | Weapons (tech, rate, damage, speed, spread, pellets, mag, reload, projectile, splash) and grenades |
| `bodies.js` | Body rigs built from shapes and posed per frame: `humanoid` (40×52, styles `spartan`, `soldier`, `ancient-lord`), `forerunner` (44×62), `sentinel` (36×28, hovering); `armShapes` draws the arm and weapon |
| `guns.js` | Held-weapon shapes by `kind`: `rifle`, `cannon`, `lance`, `scatter` |
| `themes.js` | Tile colors (`solid`, `top`, `edge`, `platform`, `hazard`, `back`, `window`) and parallax layers (`gradient`, `stars`, `planet`, `halo`, `ships`, `spires`, `smoke`, `haze`, `embers`) |
| `music.js` | Chiptune tracks with calm, combat and boss layers |

**AI behaviors:** `shooter` (keeps distance, strafes, bursts), `charger` (rushes,
melee), `flyer` (hovers above), `walker` (patrols), `turret`, and `boss` (cycles
`boss.attacks`: `barrage`, `charge`, `summon`, `leap`).

**Tech vs shields:** plasma strips shields, ballistic hurts health, hard-light is
balanced, explosive and melee hit both (`src/engine/rules.js`).

## Art pipeline

Everything is drawn in code, in a 16-bit style:

- **Sprites** (`src/engine/raster.js`): bodies and weapons are capsules, ellipses and
  polygons. Each pixel is shaded from its surface normal, with one light from the
  upper left, into a 5-tone hue-shifted ramp per material. It adds light dithering,
  dark outlines, separation lines where parts overlap, and specular glints.
  Materials come from the palette (`armor`, `helmet`, `trim`, `dark`, `visor`,
  `cape`, `glow`); `glow` is emissive.
- **Frames:** 15 per walking body (idle ×4, run ×8, jump, fall, crouch), posed by
  `pose()` in `bodies.js`, with feet planted on the ground. Arms and weapons are a
  separate overlay at 9 aim angles, attached at the body's shoulder point.
- **Tiles** (`src/engine/tileset.js`): stone courses, plus edge highlights and
  shadows chosen by which sides are exposed. Tile indices: solid 0–31, platform 32–34,
  hazard 35, background wall 36–38. Background walls fill in behind markers and
  platforms set into them, and hazards emit flames.
- **Preview:** `node scripts/preview-sprites.mjs [id ...]` renders every frame, plus
  arms at three angles, to `test-results/sprites.png`. Check new art there first.

Positions in the engine are feet points: map rows, markers and spawns place a unit's
feet on the ground, and the sprite is centered above them.

## Era kits

Every era uses the same buttons, with different powers (`src/engine/kits.js`). A
character can override the kit when its technology differs from the era's.

| Kit | Ability button | Passive |
|---|---|---|
| forerunner | Hard-light dash | Hover (hold jump while falling) |
| covenant | Sprint (hold) or, with `extra: 'camo'`, active camo | Crouch = cover, half damage |
| created | Thruster dash | Ground pound (hold down + ability in the air) |
| banished | Grappleshot (walls pull you, enemies pull you into a melee) | — |

## Controls

Every action can be rebound per keyboard layout or controller on the **Controls**
screen (title menu and pause menu). Bindings are saved per controller name
(`src/engine/input.js`). The defaults:


| | Move/aim | Jump | Fire | Ability | Grenade | Swap | Melee | Pause |
|---|---|---|---|---|---|---|---|---|
| Keys 1 | WASD | G | F | H | T | R | V | Esc |
| Keys 2 | Arrows | L | K | ; | P | O | M | Backspace |
| Gamepad | Sticks / d-pad | A | RT / X | LT / B | LB | Y | RB | Start |

## Testing

| Command | What it does |
|---|---|
| `npm test` | Unit tests and the validator |
| `npm run validate` | Checks levels, catalogs and legal rules |
| `npm run smoke` | Title screen plus every level for 20 s in headless Chromium |
| `node tests/smoke.mjs --level 1a --finish` | The bot plays the level to the end |
| `node tests/probe.mjs --level 1a` | Prints players, arena and enemies every 5 s |
| `npm start` | Play in the browser |

URL switches: `?level=1a` (skip menus), `&p2=kb2` (second player on keys 2), `&bot=1`
(autopilot), `&god=1`, `&all=1` (unlock all levels), `&difficulty=easy`.
