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

**Scene scripts:** a card (or saga beat) can carry `scene: '...'`, a short script that
acts out exactly what the card says: actors from src/content placed, moving, firing,
kneeling, sealed in a Cryptum or turned to data; ships, fleets, portals, Halos firing,
glassing, Flood, drop pods, explosions, a backdrop of its own. The full command list is
at the top of `src/engine/stage.js`. Review with `node scripts/archive-sheet.mjs <ids>`
(or `--saga`): it photographs every card once its scene has played. Cards without a
script fall back to the automatic motifs below.

Cards are animated with no extra data (`src/engine/vignette.js`): a window under the
text shows the level's backdrop, its players running in (and off into the level, or
away after it), and motifs picked from the card's words: fleets (styled by the side
named), a Halo ring (firing, if the card says so), Flood spores, drop pods, slipspace,
battle, glassing, or calm motes. Indoor backdrops skip the sky motifs. A card can set
`motifs: [...]` to choose them.

The **prologue** (first time the first level is started) and **epilogue** (after the
last level's cards, ending on a finale) are beats in `src/content/saga.js`, played by
`SagaScene` the same way, full screen. Canon only, each beat sourced. Watch them with
`?saga=prologue` or `?saga=epilogue`. Home soundtrack ids: `prologue`, `epilogue`.

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
| `a`–`z` | entities from the level's `legend` (`{ unit }`, `{ unit, ally: true }`, `{ unit, neutral: true }`, or `{ vehicle: 'warthog' }`) |

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
| `{ lock: ['B', 'C'] }` | no | Locks camera and players between two marker columns (arena). The camera glides to frame it; players outside are walked in. Also a quiet checkpoint: if everyone goes down, the arena's trigger replays from its start (placed enemies behind a checkpoint stay cleared) |
| `{ unlock: true }` | no | Opens the arena; shows "GO >" |
| `{ checkpoint: true }` | no | Respawn point if everyone goes down |
| `{ fx: 'shake' \| 'flash' \| 'slowmo' }` | no | Screen effect |
| `{ spawn: [group, ...] }` | no | Spawns enemies |
| `{ allies: [group, ...] }` | no | Spawns allies (a group with `neutral: true` spawns bystanders nobody targets). Allies follow the players; one left far behind or shut out of a locked arena re-enters at the screen edge |
| `{ wave: [group, ...] }` | yes | Spawns, then waits until all are defeated |
| `{ hold: { seconds, every, label, groups: [[group...], ...] } }` | yes | Defense: spawns the groups in turn every `every` seconds (sooner, 1.5 s after the field is cleared) until time runs out, then waits for the rest to be defeated |
| `{ boss: { unit, from, title, subtitle } }` | yes | Letterboxed title card, boss bar; waits until the boss is defeated |
| `{ vehicle: { id: 'warthog', at: 'B' } }` | no | A drivable vehicle appears at a marker |
| `{ call: 'hookName' }` | if async | Runs `hooks.hookName(api)` |
| `{ end: { result: 'win' \| 'history' } }` | yes | Ends the level. `'history'` is for canon defeats ("AS HISTORY RECORDS") |

**Group:** `{ unit: 'sentinel', n: 3, from: 'right', gap: 0.35 }`. `from` is `right`
or `left` (just off screen, on the ground), `sky` (above the screen), or a marker
letter. Units use their own entrance (teleport, drop, fly, walk).

## Camera and transitions

The level camera is custom (`updateCamera` in LevelScene): it always eases toward the
middle of the living players, with a speed cap, inside the level or the locked arena.
Nothing in a level should move the camera instantly. Menu screens fade in and out
through `go()` in `src/engine/ui.js`; use it instead of `scene.start` for any new
screen.

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
| `explode(x, y, radius, damage)` | An explosion that hurts enemies only (orbital strikes, falling debris) |
| `scene.spawnUnit(id, x, feetY, { team: 'neutral' })` | One unit; `neutral` units (story characters) are never targeted. A walker placed inside solid ground is lifted to stand on top of it |
| `tile`, `view` | Tile size, screen size |

Use hooks for set pieces only. Anything two levels need belongs in the engine.

## Art generation (no mid-level freezes)

Character, arm, gun and vehicle art is generated at HD the first time it's needed,
which takes a noticeable moment. `src/engine/prewarm.js` lists everything a level can
show (script, legend, holds, bosses and their summons, pilots, units named in hooks,
weapons players can pick up) and makes it ahead of time: one piece per frame while the
Archive cards are read, the rest when the level loads. A unit spawned only from a hook
must be named there in quotes so it's found.

## Firefight

`src/engine/firefight.js` (pure, unit-tested) builds a Firefight from any level: its
map, theme and players, a lock on its first arena (markers B and C), and a generated
script of 3 rounds × 5 waves from the era's roster (every enemy and boss used by that
era's levels, weakest first). Waves grow in size and toughness; wave 5 of round 3 is
one of the era's bosses. No checkpoints: if everyone goes down, the set restarts.
Started from the title's FIREFIGHT item (`FirefightScene` in menus.js), with
`scene.start('Level', { levelId, firefight: true })`. A map unlocks when its level is
completed. Firefights never record campaign progress.

## Content catalogs (`src/content/`)

Add new entries through the `new-content` skill.

| File | Holds |
|---|---|
| `characters.js` | Playable characters: name (and `short` for the HUD), body, palette, shields, health, speed, jump, weapons, grenade, `kit` override, `extra` |
| `units.js` | AI units: body, palette, health, shields, speed, `ai`, weapon, range, entrance, puff color, `boss` |
| `weapons.js` | Weapons (tech, rate, `playerRate`, damage, speed, spread, pellets, projectile, splash, `life` (ms a shot lasts; short for swords and hammers), gun) and grenades. Ammo and grenades are unlimited: no magazines or reloading, with a 0.8 s grenade cooldown |
| `bodies.js` | Body rigs built from shapes and posed per frame: `humanoid` (40×52, styles `spartan`, `soldier`, `ancient-lord`, `primitive`, `sanshyuum`), `forerunner` (44×62, style `infected`), `sentinel` (36×28, hovering), `infection` (Flood hopper); Covenant rigs in `bodies-covenant.js`: `elite`, `grunt`, `jackal` (`noShield`), `hunter`, `brute` (`chieftain` crest, `bare` head), `target` (training target); `armShapes` draws the arm and weapon. Characters with `weapons: []` are drawn unarmed |
| `guns.js` | Held-weapon shapes by `kind`: `rifle`, `cannon`, `lance`, `scatter`, `pistol`, `plasma`, `needler`, `spiker`, `sword`, `hammer` |
| `themes.js` | Tile colors (`solid`, `top`, `edge`, `platform`, `hazard`, `back`, `window`) parallax layers (`gradient`, `stars`, `planet`, `halo`, `ships`, `spires`, `smoke`, `haze`, `embers`, …), `props`, `foreground`, and `decor` (back-wall `pipes`, `cables`, `banners`, `glyphs` for interiors; see scenery.js) |
| `music.js` | Chiptune tracks with calm, combat and boss layers |

**AI behaviors:** `shooter` (keeps distance, strafes, bursts), `charger` (rushes,
melee), `swarm` (hops at targets, pops on contact), `idle` (story characters), `flyer` (hovers above), `walker` (patrols), `turret`, and `boss` (cycles
`boss.attacks`: `barrage`, `charge`, `summon`, `leap`; a barrage is five-shot
volleys, fewer for multi-pellet weapons; summons come two at a time, at most four alive).

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

### Settings (graphics and music)

`src/engine/graphics.js` holds the player's SETTINGS screen choices (title and pause
menus, `src/scenes/GraphicsScene.js`), saved in localStorage:

- **Art style** (`STYLE` in `config.js`: `prerendered`, `hybrid`, `pixel`). Read once at
  load from the saved setting, or from `?style=`, which overrides it. Changing it
  reloads the page, because art is generated at startup.
- **CRT emulation** (`src/engine/crt.js`): after each Phaser frame, the whole frame
  (all stacked scenes) is copied to a texture and drawn back through a CRT shader, in
  Phaser's own WebGL context (bracketed by `pipelines.clear()` / `rebind()`). Don't
  move it to a separate overlay canvas: some desktop compositors drew that partly
  black. Effects: scanlines,
  phosphor mask (aperture grille, slot or shadow mask), bloom and halation,
  softening, curvature, vignette, convergence, persistence and noise. Each runs from
  0 to 1; presets are Off, Subtle, Arcade and Consumer TV. When every effect is 0,
  the pass is skipped and costs nothing. Scenes need no CRT code.
- **Show FPS:** a small counter in the bottom-right corner.
- **Music and effects volume** (0 to 10): `audio.setVolume('music' | 'effects', v)`,
  saved (localStorage `ring-anthology-prisms.volume`); scales the synth's music and
  effects buses and the home soundtrack.
- **Music** (only when a home soundtrack is installed, `public/home-soundtrack/`): the
  home soundtrack or the built-in music. `audio.setUseHome()` saves the choice
  (localStorage `ring-anthology-prisms.music`) and switches the music playing at once.
- **Compare:** `node scripts/compare-graphics.mjs [--level 2a]` writes screenshots of
  each style and preset to `test-results/compare/`.

Positions in the engine are feet points: map rows, markers and spawns place a unit's
feet on the ground, and the sprite is centered above them.

## Skulls and records

**Skulls** (`src/engine/skulls.js`, title menu SKULLS, saved in this browser) are fun
modifiers: Grunt Birthday Party (confetti and a cheer on every defeat, in `fx.puff`),
Low Gravity (world gravity × 0.55 in LevelScene) and Thunderstorm (enemies get 1.5×
health and shields, in the Unit constructor).

**Records:** finishing a level saves its best time and most medals
(`session.record`); the level select shows them for finished levels.

## Vehicles

`src/content/vehicles.js` (rigs and stats) and `src/engine/vehicles.js`. Press SWAP
next to a vehicle to get in (as driver, or as gunner if the driver's seat is taken and
it has one) and SWAP again to get out. The driver steers with the move controls,
jumps with JUMP (ground vehicles), and fires forward; a gunner aims freely and does
the firing. Empty vehicles are neutral; occupied ones take every hit for their crew,
and wreck in an explosion that throws the crew out. Driving fast into enemies runs
them over (`splatter`). Kinds: `ground`, `hover`, `air`. Drivable: `warthog` (driver +
gunner), `ghost`, `banshee`, `chopper`, `scorpion`, `mongoose`, `hornet`, `broadsword`.
Open vehicles (`seatAt` in vehicles.js) show their riders in their seats, drawn just
behind the vehicle so only the head and shoulders show; the Warthog's gunner stands
at the turret (`gunnerStands`). Closed vehicles hide their crew. Enemy vehicles are ordinary
units in `units.js` using a vehicle body (`ghost-enemy`, `banshee-enemy`).

**Front shields:** bodies with `frontShield` (Jackals, Hunters) block shots that hit
them from the front and take 1.5× damage from behind. A body with `shieldBreak: N`
(Jackals) has an energy shield instead: shots from the front wear it down (plasma
counts double) and at N it breaks for 5 s. A unit with `noShield: true`
(Skirmishers, bare Lekgolo) has none. Grenades and melee get through.

## Weapon drops

An enemy that dies holding a gun (a weapon with `gun` art) drops it
(`src/engine/pickups.js`). The gun glows on the ground for 12 s, blinking in its last
3 s. A player who walks over it and doesn't carry that weapon picks it up and switches
to it. A player can carry any number of weapons, never two of the same; SWAP cycles
through them, and the HUD shows `2/3`. Give slow enemy weapons a `playerRate`, so a
picked-up gun fires at a fair player rate.

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
(`src/engine/input.js`). A controller with a known layout (`src/engine/padart.js`,
matched by its id: so far the 8BitDo M30 / Mega Drive Mini 6B, "6B controller") is drawn
beside the list; bindings are named by its button labels, the selected action's
buttons are outlined and pressed ones light up. The defaults:


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
