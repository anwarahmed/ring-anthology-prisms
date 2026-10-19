// Plays one level: builds it from its data file, runs its script, and manages co-op,
// arenas, checkpoints and the end of the level. Levels never need to touch this file.

import Phaser from 'phaser';
import { hdCamera } from '../engine/ui.js';
import { LEVELS } from '../../levels/index.js';
import { CHARACTERS } from '../content/characters.js';
import { UNITS } from '../content/units.js';
import { BODIES } from '../content/bodies.js';
import { THEMES } from '../content/themes.js';
import { TILE, ERAS, DIFFICULTY, VIEW, GRAVITY, HD, WORLD_ZOOM } from '../engine/config.js';
import { skulls } from '../engine/skulls.js';
import { parseMap, groundBelow, TILES } from '../engine/mapparse.js';
import { TILESET, COLLIDES, isSolid, isPlatform, isHazard } from '../engine/tileset.js';
import { tilesTexture, baseTextures, hexNum, TILE_PX } from '../engine/textures.js';
import { firefightLevel } from '../engine/firefight.js';
import { prewarm } from '../engine/prewarm.js';
import { buildScenery } from '../engine/scenery.js';
import { Fx, gradeCamera } from '../engine/fx.js';
import { Controls } from '../engine/input.js';
import { Player, Unit } from '../engine/actors.js';
import { setupCombat, updateProjectiles, explode } from '../engine/combat.js';
import { ScriptRunner } from '../engine/script.js';
import { Vehicle } from '../engine/vehicles.js';
import { VEHICLES } from '../content/vehicles.js';
import { dropWeapon, updatePickups } from '../engine/pickups.js';
import { audio } from '../engine/audio.js';
import { makeBot } from '../engine/bot.js';
import { session } from '../engine/session.js';

const MEDALS = { 2: 'DOUBLE KILL', 3: 'TRIPLE KILL', 4: 'OVERKILL', 5: 'KILLTACULAR', 6: 'KILLTROCITY' };

export class LevelScene extends Phaser.Scene {
  constructor() {
    super('Level');
  }

  init(data) {
    this.levelId = data.levelId;
    this.cp = data.checkpoint ?? null;
    // Firefight: the level's map and players with a generated wave script.
    this.firefight = !!data.firefight;
    this.level = this.firefight ? firefightLevel(LEVELS[this.levelId], Object.values(LEVELS)) : LEVELS[this.levelId];
    this.era = ERAS[this.level.era];
    this.diff = DIFFICULTY[session.difficulty];
    this.ended = false;
    this.stats = data.stats ?? { start: Date.now(), kills: [0, 0], medals: [[], []], downs: [0, 0] };
  }

  create() {
    hdCamera(this);
    baseTextures(this);
    // Low Gravity skull: higher jumps, slower falls (for everything, grenades too).
    this.physics.world.gravity.y = GRAVITY * (skulls.has('lowgrav') ? 0.55 : 1);
    // All the level's character, weapon and vehicle art, so nothing is made mid-fight.
    prewarm(this, this.level);
    const L = this.level;
    const theme = THEMES[L.theme];
    this.map = parseMap(L.map, L.legend);
    if (this.map.errors.length) console.error(`Level ${L.id} map errors`, this.map.errors);
    const W = this.map.width * TILE;
    const H = this.map.height * TILE;
    this.worldW = W;
    this.worldH = H;

    // The backdrop is its own scene under this one, with an unzoomed camera.
    this.theme = theme;
    this.scene.launch('Backdrop', { level: this });
    this.events.once('shutdown', () => this.scene.stop('Backdrop'));
    this.buildTiles(theme);
    buildScenery(this, L.theme, theme, this.map);

    this.fx = new Fx(this);
    this.actorGroup = this.physics.add.group({ runChildUpdate: false });
    this.units = [];
    this.players = [];
    this.pickups = [];
    this.vehicles = [];
    setupCombat(this);
    this.physics.world.setBounds(0, -200, W, H + 400);
    this.physics.add.collider(this.actorGroup, this.layer, null, (a, tile) => {
      if (isHazard(tile.index) && a.team === 'players') this.hazard(a);
      return !(isPlatform(tile.index) && a.dropping > this.time.now);
    });

    this.controls = new Controls(this);
    // Positions are feet (ground) points; sprites are centered above them.
    const spawn = this.cp ?? { x: this.map.spawn.x * TILE + 8, y: (this.map.spawn.y + 1) * TILE };
    session.players.forEach((sp, i) => {
      const charId = L.players[i] ?? L.players[0];
      const ch = CHARACTERS[charId];
      const p = new Player(this, this.besideSpawn(spawn, i), spawn.y - BODIES[ch.body].h / 2 - 1, i, charId, ch, sp.device, this.era);
      if (session.debug.god) p.invulnUntil = Infinity;
      this.players.push(p);
      if (session.debug.bot) this.controls.bots[sp.device] = makeBot(this, p);
    });

    for (const e of this.map.entities) {
      if (e.vehicle) this.spawnVehicle(e.vehicle, e.x * TILE + 8, (e.y + 1) * TILE);
      // After a checkpoint restart, ground already cleared stays clear.
      if (e.unit && !e.ally && !e.neutral && this.cp && e.x * TILE + 8 < this.cp.x - 8) continue;
      if (e.unit) this.spawnUnit(e.unit, e.x * TILE + 8, (e.y + 1) * TILE, { ally: !!e.ally, team: e.neutral ? 'neutral' : null, entrance: 'none' });
    }

    // The camera glides after the middle of the living players (see updateCamera).
    this.focus = { x: spawn.x, y: spawn.y };
    const cam = this.cameras.main.setZoom(HD * WORLD_ZOOM);
    this.viewW = VIEW.w / WORLD_ZOOM;
    this.viewH = VIEW.h / WORLD_ZOOM;
    this.arena = null;
    this.updateCamera(0, true);
    cam.fadeIn(600);
    gradeCamera(cam, this, theme.grade);
    this.arenaWalls = [];

    this.scene.launch('Hud', { level: this });
    this.hud = this.scene.get('Hud');

    if (L.music) audio.playMusic(L.music, 0, { level: L.id, era: L.era });
    this.runner = new ScriptRunner(this, L, this.map, this.cp?.index ?? 0);
    this.events.once('hud-ready', () => this.runner.start());
    L.hooks?.create?.(this.api());
  }

  buildTiles(theme) {
    const m = this.map;
    const key = tilesTexture(this, this.level.theme, theme);
    const at = (x, y) => (x < 0 || y < 0 || x >= m.width || y >= m.height ? TILES.solid : m.grid[y][x]);
    const open = (x, y) => at(x, y) !== TILES.solid;
    // Back walls continue behind platforms, markers and entities set into them: two
    // passes fill any such cell with at least two wall neighbors. Empty air ('.') is
    // never filled, so windows cut into a wall stay rectangular.
    let backFill = m.grid.map((row) => row.map((t) => t === TILES.back));
    for (let pass = 0; pass < 2; pass++) {
      backFill = backFill.map((row, y) => row.map((b, x) => b || (m.grid[y][x] !== TILES.solid && this.level.map[y]?.[x] !== '.' &&
        [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => backFill[y + dy]?.[x + dx]).length >= 2)));
    }
    const main = [];
    const back = [];
    for (let y = 0; y < m.height; y++) {
      const row = [];
      const brow = [];
      for (let x = 0; x < m.width; x++) {
        const t = m.grid[y][x];
        const hash = (x * 73856093) ^ (y * 19349663);
        if (t === TILES.solid) {
          const mask = (open(x, y - 1) ? 1 : 0) | (open(x + 1, y) ? 2 : 0) | (open(x, y + 1) ? 4 : 0) | (open(x - 1, y) ? 8 : 0);
          row.push(TILESET.solid + (hash & 1) * 16 + mask);
        } else if (t === TILES.platform) {
          const l = at(x - 1, y) === TILES.platform, r = at(x + 1, y) === TILES.platform;
          row.push(TILESET.platform + (!l ? 0 : !r ? 2 : 1));
        } else if (t === TILES.hazard) {
          row.push(TILESET.hazard);
          if (at(x, y - 1) !== TILES.hazard) this.flames(x, y);
        } else {
          row.push(-1);
        }
        brow.push(backFill[y][x] ? TILESET.back + ((hash >>> 3) % 23 === 0 ? 2 : hash & 1) : -1);
      }
      main.push(row);
      back.push(brow);
    }
    // Tile textures may be HD; the layers are scaled so a tile is TILE world units.
    const tm = this.make.tilemap({ data: main, tileWidth: TILE_PX, tileHeight: TILE_PX });
    const ts = tm.addTilesetImage(key, key, TILE_PX, TILE_PX, 0, 0);
    this.layer = tm.createLayer(0, ts, 0, 0).setDepth(10).setScale(TILE / TILE_PX);
    this.layer.setCollision(COLLIDES);
    this.layer.forEachTile((tile) => {
      if (isPlatform(tile.index)) tile.setCollision(false, false, true, false);
      // Ground darkens with depth below the surface.
      if (tile.index >= 0 && tile.index < 32) {
        let d = 0;
        while (d < 5 && m.grid[tile.y - d - 1]?.[tile.x] === TILES.solid) d++;
        const k = Math.round(255 * (1 - d * 0.15));
        tile.tint = (k << 16) | (k << 8) | k;
      }
    });
    const bm = this.make.tilemap({ data: back, tileWidth: TILE_PX, tileHeight: TILE_PX });
    const bts = bm.addTilesetImage(key, key, TILE_PX, TILE_PX, 0, 0);
    bm.createLayer(0, bts, 0, 0).setDepth(5).setScale(TILE / TILE_PX);
  }

  // Fire licking up from hazard tiles.
  flames(x, y) {
    const color = hexNum(THEMES[this.level.theme].tiles.hazard);
    this.add.particles(x * TILE + 8, y * TILE + 4, 'px', {
      x: { min: -7, max: 7 }, speedY: { min: -50, max: -20 }, speedX: { min: -6, max: 6 },
      lifespan: { min: 300, max: 700 }, frequency: 70, scale: { start: 1.4, end: 0 },
      alpha: { start: 1, end: 0 }, tint: [color, 0xffd27a, 0xffffff], blendMode: 'ADD',
    }).setDepth(12);
  }

  actorList() {
    return [...this.players, ...this.units, ...this.vehicles];
  }

  update(time, deltaMs) {
    if (this.ended) {
      // Nobody acts once the level is over, but physics still runs: stop walkers in
      // place and keep every arm on its body (they were left floating).
      for (const u of this.units) if (u.alive && !u.bodyDef.flying) u.setVelocityX(0);
      for (const a of [...this.players, ...this.units]) if (a.alive) { a.syncGun(); a.syncPilot?.(); }
      return;
    }
    const dt = Math.min(deltaMs, 50) / 1000;
    for (const p of this.players) {
      const s = this.controls.read(p.device);
      if (s.pressed.pause) return this.pause();
      // SWAP next to a vehicle gets in; SWAP inside gets out.
      if (s.pressed.swap && p.alive) {
        if (p.vehicle) { p.vehicle.leave(p); s.pressed.swap = false; }
        else {
          const v = this.vehicles.find((vh) => vh.alive && vh.seatFor() && Math.abs(vh.x - p.x) < 40 && Math.abs(vh.y - p.y) < 40);
          if (v && v.enter(p)) s.pressed.swap = false;
        }
      }
      if (p.vehicle) p.vehicle.drive(dt, s, p);
      else p.tick(dt, s);
    }
    for (const v of this.vehicles) v.tick(dt);
    for (const u of this.units) u.tick(dt);
    // A locked arena holds enemies too: one that wandered out through the walls could
    // never be reached, and the wave could never be cleared.
    if (this.arena) {
      for (const u of this.units) {
        if (!u.alive || u.team !== 'enemies') continue;
        const x = Phaser.Math.Clamp(u.x, this.arena.x0 + 10, this.arena.x1 - 10);
        if (x !== u.x) {
          u.setX(x);
          u.setVelocityX(0);
        }
      }
    }
    this.units = this.units.filter((u) => u.alive || u.active);
    updateProjectiles(this);
    updatePickups(this, dt);

    // Camera focus and co-op leash.
    const alive = this.players.filter((p) => p.alive);
    if (alive.length) {
      this.focus.x = alive.reduce((s, p) => s + p.x, 0) / alive.length;
      this.focus.y = alive.reduce((s, p) => s + p.y, 0) / alive.length;
      this.leash(alive, dt);
    }
    this.updateCamera(dt);
    this.runner.update();
    if (this.map.exit && !this.arena && alive.some((p) => Math.abs(p.x - (this.map.exit.x * TILE + 8)) < 12 && Math.abs(p.y - this.map.exit.y * TILE) < 40)) {
      this.endLevel({ result: 'win' });
    }
    this.level.hooks?.update?.(this.api(), dt);
  }

  // Smooth camera: always eases toward a target framing, so arena locks, unlocks and
  // co-op shifts scroll continuously instead of snapping.
  updateCamera(dt, snap = false) {
    const cam = this.cameras.main;
    const vw = this.viewW, vh = this.viewH;
    const lo = this.arena ? this.arena.x0 : 0;
    const hi = (this.arena ? this.arena.x1 : this.worldW) - vw;
    const tx = hi < lo ? (lo + hi) / 2 : Phaser.Math.Clamp(this.focus.x - vw / 2, lo, hi);
    // The players' feet sit low in the frame: the view shows play space, not much
    // solid ground below the floor.
    const ty = Phaser.Math.Clamp(this.focus.y - vh * 0.66, 0, Math.max(0, this.worldH - vh));
    if (snap) {
      cam.setScroll(tx, ty);
      return;
    }
    // Ease toward the target, with a speed cap so big reframes are a glide, not a whip.
    const ease = (from, to, rate, max) => {
      const step = (to - from) * (1 - Math.exp(-dt * rate));
      return from + Math.sign(step) * Math.min(Math.abs(step), max * dt);
    };
    cam.setScroll(ease(cam.scrollX, tx, this.arena ? 3.5 : 6, 420), ease(cam.scrollY, ty, 4, 260));
  }

  // Co-op leash. The screen edges are a hard wall: every player (or their vehicle)
  // stays fully in view, on both sides. A locked arena adds its own walls; someone
  // caught outside it when it locks is walked in, not teleported.
  leash(alive, dt) {
    const cam = this.cameras.main;
    for (const p of alive) {
      const o = p.vehicle ?? p;
      if (!p.vehicle && p.y > this.worldH + 40) p.hurt(9999, 'explosive');
      const half = o.body.width / 2 + 3;
      const vLo = cam.scrollX + half, vHi = cam.scrollX + this.viewW - half;
      if (o.x < vLo || o.x > vHi) {
        o.x = Phaser.Math.Clamp(o.x, vLo, vHi);
        o.body.velocity.x = 0;
      }
      if (!this.arena) continue;
      const aLo = this.arena.x0 + half, aHi = this.arena.x1 - half;
      const out = o.x < aLo ? aLo - o.x : o.x > aHi ? aHi - o.x : 0;
      if (!out) continue;
      o.x += Math.abs(out) > 24 ? Math.sign(out) * Math.min(Math.abs(out), 320 * dt) : out;
      o.body.velocity.x = 0;
    }
  }

  hazard(p) {
    if (this.time.now > (p.hazardAt ?? 0)) {
      p.hazardAt = this.time.now + 400;
      p.hurt(15, 'explosive');
      p.body.velocity.y = -260;
    }
  }

  // --- Spawning -------------------------------------------------------------------

  // A drivable vehicle, standing (or hovering) on the ground at feetY.
  spawnVehicle(id, x, feetY) {
    const B = BODIES[VEHICLES[id].body];
    const v = new Vehicle(this, x, feetY - B.h / 2 - 1, id);
    this.vehicles.push(v);
    return v;
  }

  // y is the feet point for walkers and the center for flyers. A walker whose spot is
  // inside solid ground (a raised block, a wall) is lifted to stand on top of it, so it
  // never gets pushed out through the floor.
  spawnUnit(id, x, y, { ally = false, team = null, entrance } = {}) {
    const def = UNITS[id];
    if (!def) { console.error('Unknown unit', id); return null; }
    const B = BODIES[def.body];
    if (!B.flying) y = this.standingY(x, y, B.h * (def.scale ?? 1));
    const u = new Unit(this, x, B.flying ? y : y - (B.h / 2) * (def.scale ?? 1) - 1, id, def, { ally, team });
    this.units.push(u);
    const how = entrance ?? def.entrance;
    if (how === 'teleport') this.fx.teleportIn(u, hexNum(def.pal.glow ?? def.puff));
    return u;
  }

  // The nearest feet point to y where a body h tall fits in open space.
  standingY(x, y, h) {
    const solid = (row) => {
      const t = this.layer.getTileAtWorldXY(x, row * TILE + 1);
      return !!t && t.index >= 0 && !isPlatform(t.index) && t.collides;
    };
    const tall = Math.ceil(h / TILE);
    const start = Math.floor((y - 1) / TILE);
    const fits = (row) => { for (let k = 0; k < tall; k++) if (solid(row - k)) return false; return true; };
    if (fits(start)) return y;
    // Up a few tiles (onto a raised block), else down (out of a ceiling), never through
    // a ceiling or floor into another room.
    for (let n = 1; n <= 4 && start - n > 0; n++) if (fits(start - n)) return (start - n + 1) * TILE;
    for (let n = 1; n <= 12 && start + n < this.map.height; n++) if (fits(start + n)) return (start + n + 1) * TILE;
    return y;
  }

  spawnPoint(from, i, flying) {
    const v = this.cameras.main.worldView;
    if (this.map.markers[from]) {
      const m = this.map.markers[from];
      return { x: m.x * TILE + 8 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 18, y: flying ? m.y * TILE - 30 : (m.y + 1) * TILE };
    }
    let x;
    if (from === 'left') x = v.x - 14 - i * 16;
    else if (from === 'sky') x = v.x + 60 + Math.random() * (v.width - 120);
    else x = v.right + 14 + i * 16;
    x = Phaser.Math.Clamp(x, 8, this.worldW - 8);
    // In a locked arena, edge spawns come in just inside its walls: outside them they
    // could never reach the players, and the wave could never be cleared.
    if (this.arena) x = Phaser.Math.Clamp(x, this.arena.x0 + 12 + i * 4, this.arena.x1 - 12 - i * 4);
    // Start below any ceiling at the top of the view (indoor levels), so nothing
    // spawns on the roof or inside it.
    const col = Math.floor(x / TILE);
    let open = Math.max(0, Math.floor(v.y / TILE));
    while (open < this.map.height - 1 && [TILES.solid, TILES.platform].includes(this.map.grid[open]?.[col])) open++;
    if (flying) return { x, y: Math.max(v.y + 30, open * TILE + 20) };
    if (from === 'sky') return { x, y: (open + 2) * TILE };
    const g = groundBelow(this.map.grid, col, open);
    return { x, y: (g ?? this.map.height - 2) * TILE };
  }

  async spawnGroup(list, ally = false) {
    const out = [];
    for (const g of list) {
      const def = UNITS[g.unit];
      for (let i = 0; i < (g.n ?? 1); i++) {
        const pt = this.spawnPoint(g.from ?? 'right', i, def?.body === 'sentinel');
        const u = this.spawnUnit(g.unit, pt.x, pt.y, { ally: ally || g.ally, team: g.neutral ? 'neutral' : null });
        if (u) out.push(u);
        await new Promise((r) => this.time.delayedCall((g.gap ?? 0.35) * 1000, r));
      }
    }
    return out;
  }

  async spawnBoss({ unit, from = 'right', title, subtitle }) {
    audio.setIntensity(2);
    audio.sfx('boss');
    await this.hud.bossIntro(title ?? UNITS[unit].name, subtitle ?? '');
    const pt = this.spawnPoint(from, 0, UNITS[unit].body === 'sentinel');
    const boss = this.spawnUnit(unit, pt.x, pt.y);
    this.fx.shake(0.015, 400);
    this.hud.bossBar(boss);
    return boss;
  }

  // A boss's summons: two at a time, and never more than four of them alive.
  summonFor(boss) {
    const s = boss.def.boss.summon;
    if (!s) return;
    const alive = this.units.filter((u) => u.alive && u.id === s && !u.ally).length;
    if (alive < 4) this.spawnGroup([{ unit: s, n: Math.min(2, 4 - alive), from: 'sky' }]);
  }

  // --- Arenas, checkpoints, effects ---------------------------------------------------

  lockArena(c0, c1) {
    const x0 = c0 * TILE, x1 = (c1 + 1) * TILE;
    this.arena = { x0, x1 };
    for (const x of [x0 + 2, x1 - 2]) {
      const wall = this.add.rectangle(x, this.worldH / 2, 3, this.worldH, this.era.color, 0.5).setDepth(25).setBlendMode('ADD');
      this.tweens.add({ targets: wall, alpha: 0.2, duration: 300, yoyo: true, repeat: -1 });
      this.arenaWalls.push(wall);
    }
    audio.setIntensity(Math.max(1, audio.intensity));
  }

  unlockArena() {
    this.arena = null;
    this.arenaWalls.forEach((w) => w.destroy());
    this.arenaWalls = [];
    audio.setIntensity(0);
    this.hud.go();
  }

  // Player i's start x: P1 on the spawn point, partners 20 px to a side that has solid
  // ground at the same height (a checkpoint can sit right at a pit's edge).
  besideSpawn(spawn, i) {
    if (i === 0) return spawn.x;
    const solidAt = (x) => isSolid(this.layer.getTileAtWorldXY(x, spawn.y + 2)?.index ?? -1);
    for (const d of [-20, 20, -10, 10]) if (solidAt(spawn.x + d * i)) return spawn.x + d * i;
    return spawn.x;
  }

  // index: the script trigger a restart resumes from. quiet: the automatic one taken
  // when an arena locks (index is that arena's own trigger, so the fight replays).
  checkpoint(index, quiet = false) {
    if (this.firefight || (quiet && this.cp && this.cp.index > index)) return;
    const p = this.players.find((pl) => pl.alive) ?? this.players[0];
    // Feet on solid ground: never mid-jump over a pit or on a drop-through platform.
    const spot = p.safeSpot ?? { x: p.x, y: p.body.bottom };
    this.cp = { index, x: spot.x, y: spot.y };
    if (quiet) return;
    audio.sfx('checkpoint');
    this.hud.announce('CHECKPOINT', '#ffffff', true);
  }

  scriptFx(name) {
    if (name === 'shake') this.fx.shake(0.02, 600);
    if (name === 'flash') this.fx.flash(0xffffff, 300);
    if (name === 'slowmo') this.fx.slowmo(0.3, 1500);
  }

  onUnitDefeated(unit, from) {
    if (unit.team === 'enemies' && unit.weapon?.gun) dropWeapon(this, unit.x, unit.y, unit.def.weapon);
    if (unit.def.boss) {
      this.fx.slowmo(0.25, 1600);
      this.fx.flash(0xffffff, 400);
      this.fx.shake(0.03, 800);
      audio.setIntensity(1);
    }
    if (from?.index === undefined || unit.ally) return;
    const i = from.index;
    this.stats.kills[i]++;
    const now = this.time.now;
    from.streak = now - (from.lastKill ?? -9999) < 4000 ? (from.streak ?? 1) + 1 : 1;
    from.lastKill = now;
    const medal = MEDALS[Math.min(6, from.streak)];
    if (medal) {
      this.stats.medals[i].push(medal);
      this.hud.announce(medal, this.era.css);
    }
  }

  onPlayerDown(p) {
    this.stats.downs[p.index]++;
    const partner = this.players.find((o) => o.alive);
    if (partner) {
      this.hud.announce(`P${p.index + 1} DOWN`, '#ff5555');
      this.time.delayedCall(this.diff.respawn * 1000, () => {
        const mate = this.players.find((o) => o.alive);
        if (!this.ended && mate) p.respawn(mate.x - mate.facing * 16, mate.y - 20);
      });
      return;
    }
    // Everyone is down: back to the last checkpoint.
    this.ended = true;
    this.hud.announce('RETRY FROM CHECKPOINT', '#ffffff', true);
    this.time.delayedCall(1800, () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => this.restart());
    });
  }

  restart() {
    this.scene.stop('Hud');
    this.scene.restart({ levelId: this.levelId, checkpoint: this.cp, stats: this.stats, firefight: this.firefight });
  }

  pause() {
    this.scene.pause();
    this.scene.launch('Pause', { level: this });
  }

  endLevel({ result = 'win' } = {}) {
    if (this.ended) return;
    this.ended = true;
    if (!this.firefight) {
      session.complete(this.levelId);
      session.record(this.levelId, { time: Math.round((Date.now() - this.stats.start) / 1000), medals: this.stats.medals.reduce((n, m) => n + m.length, 0) });
    }
    this.time.delayedCall(result === 'history' ? 2500 : 1200, () => {
      this.cameras.main.fadeOut(900);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop('Hud');
        this.scene.start('Results', { levelId: this.levelId, result, stats: this.stats, firefight: this.firefight });
      });
    });
  }

  // The object a level's hooks receive.
  api() {
    return {
      scene: this, players: this.players, units: this.units, fx: this.fx, hud: this.hud, audio,
      tile: TILE, view: { w: this.viewW, h: this.viewH }, marker: (k) => this.map.markers[k],
      spawn: (list, ally) => this.spawnGroup(list, ally),
      // An explosion that hurts enemies only (orbital strikes, collapses on the enemy).
      explode: (x, y, radius = 40, damage = 50) => explode(this, x, y, radius, damage, 'players', null),
    };
  }
}
