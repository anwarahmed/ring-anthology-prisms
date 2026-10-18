// Plays one level: builds it from its data file, runs its script, and manages co-op,
// arenas, checkpoints and the end of the level. Levels never need to touch this file.

import Phaser from 'phaser';
import { LEVELS } from '../../levels/index.js';
import { CHARACTERS } from '../content/characters.js';
import { UNITS } from '../content/units.js';
import { BODIES } from '../content/bodies.js';
import { THEMES } from '../content/themes.js';
import { TILE, ERAS, DIFFICULTY, VIEW } from '../engine/config.js';
import { parseMap, groundBelow, TILES } from '../engine/mapparse.js';
import { TILESET, COLLIDES, isPlatform, isHazard } from '../engine/tileset.js';
import { tilesTexture, baseTextures, hexNum } from '../engine/textures.js';
import { buildBackdrop } from '../engine/backdrop.js';
import { Fx } from '../engine/fx.js';
import { Controls } from '../engine/input.js';
import { Player, Unit } from '../engine/actors.js';
import { setupCombat, updateProjectiles } from '../engine/combat.js';
import { ScriptRunner } from '../engine/script.js';
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
    this.level = LEVELS[this.levelId];
    this.era = ERAS[this.level.era];
    this.diff = DIFFICULTY[session.difficulty];
    this.ended = false;
    this.stats = data.stats ?? { start: Date.now(), kills: [0, 0], medals: [[], []], downs: [0, 0] };
  }

  create() {
    baseTextures(this);
    const L = this.level;
    const theme = THEMES[L.theme];
    this.map = parseMap(L.map, L.legend);
    if (this.map.errors.length) console.error(`Level ${L.id} map errors`, this.map.errors);
    const W = this.map.width * TILE;
    const H = this.map.height * TILE;
    this.worldW = W;
    this.worldH = H;

    buildBackdrop(this, theme, W);
    this.buildTiles(theme);

    this.fx = new Fx(this);
    this.actorGroup = this.physics.add.group({ runChildUpdate: false });
    this.units = [];
    this.players = [];
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
      const p = new Player(this, spawn.x - i * 20, spawn.y - BODIES[ch.body].h / 2 - 1, i, charId, ch, sp.device, this.era);
      if (session.debug.god) p.invulnUntil = Infinity;
      this.players.push(p);
      if (session.debug.bot) this.controls.bots[sp.device] = makeBot(this, p);
    });

    for (const e of this.map.entities) {
      if (e.unit) this.spawnUnit(e.unit, e.x * TILE + 8, (e.y + 1) * TILE, { ally: !!e.ally, entrance: 'none' });
    }

    // Camera follows the middle of the living players.
    this.focus = this.add.zone(spawn.x, spawn.y, 1, 1);
    const cam = this.cameras.main;
    cam.setBounds(0, 0, W, H);
    cam.startFollow(this.focus, true, 0.09, 0.09, 0, 20);
    cam.setDeadzone(40, 50);
    cam.fadeIn(600);
    this.arena = null;
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
    // passes fill any open cell with at least two wall neighbors.
    let backFill = m.grid.map((row) => row.map((t) => t === TILES.back));
    for (let pass = 0; pass < 2; pass++) {
      backFill = backFill.map((row, y) => row.map((b, x) => b || (m.grid[y][x] !== TILES.solid &&
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
    const tm = this.make.tilemap({ data: main, tileWidth: TILE, tileHeight: TILE });
    const ts = tm.addTilesetImage(key, key, TILE, TILE, 0, 0);
    this.layer = tm.createLayer(0, ts, 0, 0).setDepth(10);
    this.layer.setCollision(COLLIDES);
    this.layer.forEachTile((tile) => {
      if (isPlatform(tile.index)) tile.setCollision(false, false, true, false);
    });
    const bm = this.make.tilemap({ data: back, tileWidth: TILE, tileHeight: TILE });
    const bts = bm.addTilesetImage(key, key, TILE, TILE, 0, 0);
    bm.createLayer(0, bts, 0, 0).setDepth(5);
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
    return [...this.players, ...this.units];
  }

  update(time, deltaMs) {
    if (this.ended) return;
    const dt = Math.min(deltaMs, 50) / 1000;
    for (const p of this.players) {
      const s = this.controls.read(p.device);
      if (s.pressed.pause) return this.pause();
      p.tick(dt, s);
    }
    for (const u of this.units) u.tick(dt);
    this.units = this.units.filter((u) => u.alive || u.active);
    updateProjectiles(this);

    // Camera focus and co-op leash.
    const alive = this.players.filter((p) => p.alive);
    if (alive.length) {
      this.focus.x = alive.reduce((s, p) => s + p.x, 0) / alive.length;
      this.focus.y = alive.reduce((s, p) => s + p.y, 0) / alive.length;
      const v = this.cameras.main.worldView;
      const lo = this.arena ? this.arena.x0 : v.x;
      const hi = this.arena ? this.arena.x1 : v.right;
      for (const p of alive) {
        // The camera has no view on the first frame; only leash once it does.
        const nx = v.width > 0 ? Phaser.Math.Clamp(p.x, lo + 6, hi - 6) : p.x;
        if (nx !== p.x) { p.x = nx; p.body.velocity.x = 0; }
        if (p.y > this.worldH + 40) p.hurt(9999, 'explosive');
      }
    }
    this.runner.update();
    if (this.map.exit && !this.arena && alive.some((p) => Math.abs(p.x - (this.map.exit.x * TILE + 8)) < 12 && Math.abs(p.y - this.map.exit.y * TILE) < 40)) {
      this.endLevel({ result: 'win' });
    }
    this.level.hooks?.update?.(this.api(), dt);
  }

  hazard(p) {
    if (this.time.now > (p.hazardAt ?? 0)) {
      p.hazardAt = this.time.now + 400;
      p.hurt(15, 'explosive');
      p.body.velocity.y = -260;
    }
  }

  // --- Spawning -------------------------------------------------------------------

  // y is the feet point for walkers and the center for flyers.
  spawnUnit(id, x, y, { ally = false, entrance } = {}) {
    const def = UNITS[id];
    if (!def) { console.error('Unknown unit', id); return null; }
    const B = BODIES[def.body];
    const u = new Unit(this, x, B.flying ? y : y - (B.h / 2) * (def.scale ?? 1) - 1, id, def, { ally });
    this.units.push(u);
    const how = entrance ?? def.entrance;
    if (how === 'teleport') this.fx.teleportIn(u, hexNum(def.pal.glow ?? def.puff));
    return u;
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
    if (flying || from === 'sky') return { x, y: v.y + 30 };
    const col = Math.floor(x / TILE);
    const g = groundBelow(this.map.grid, col, Math.floor(v.y / TILE));
    return { x, y: (g ?? this.map.height - 2) * TILE };
  }

  async spawnGroup(list, ally = false) {
    const out = [];
    for (const g of list) {
      const def = UNITS[g.unit];
      for (let i = 0; i < (g.n ?? 1); i++) {
        const pt = this.spawnPoint(g.from ?? 'right', i, def?.body === 'sentinel');
        const u = this.spawnUnit(g.unit, pt.x, pt.y, { ally: ally || g.ally });
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

  summonFor(boss) {
    const s = boss.def.boss.summon;
    if (s) this.spawnGroup([{ unit: s, n: 2, from: 'sky' }]);
  }

  // --- Arenas, checkpoints, effects ---------------------------------------------------

  lockArena(c0, c1) {
    const x0 = c0 * TILE, x1 = (c1 + 1) * TILE;
    this.arena = { x0, x1 };
    this.cameras.main.setBounds(x0, 0, x1 - x0, this.worldH);
    for (const x of [x0 + 2, x1 - 2]) {
      const wall = this.add.rectangle(x, this.worldH / 2, 3, this.worldH, this.era.color, 0.5).setDepth(25).setBlendMode('ADD');
      this.tweens.add({ targets: wall, alpha: 0.2, duration: 300, yoyo: true, repeat: -1 });
      this.arenaWalls.push(wall);
    }
    audio.setIntensity(Math.max(1, audio.intensity));
  }

  unlockArena() {
    this.arena = null;
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
    this.arenaWalls.forEach((w) => w.destroy());
    this.arenaWalls = [];
    audio.setIntensity(0);
    this.hud.go();
  }

  checkpoint(index) {
    const p = this.players.find((pl) => pl.alive) ?? this.players[0];
    this.cp = { index, x: p.x, y: p.y + p.meta.h / 2 };
    for (const pl of this.players) pl.grenadeCount = Math.max(pl.grenadeCount, 3);
    audio.sfx('checkpoint');
    this.hud.announce('CHECKPOINT', '#ffffff', true);
  }

  scriptFx(name) {
    if (name === 'shake') this.fx.shake(0.02, 600);
    if (name === 'flash') this.fx.flash(0xffffff, 300);
    if (name === 'slowmo') this.fx.slowmo(0.3, 1500);
  }

  onUnitDefeated(unit, from) {
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
    this.scene.restart({ levelId: this.levelId, checkpoint: this.cp, stats: this.stats });
  }

  pause() {
    this.scene.pause();
    this.scene.launch('Pause', { level: this });
  }

  endLevel({ result = 'win' } = {}) {
    if (this.ended) return;
    this.ended = true;
    session.complete(this.levelId);
    this.time.delayedCall(result === 'history' ? 2500 : 1200, () => {
      this.cameras.main.fadeOut(900);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop('Hud');
        this.scene.start('Results', { levelId: this.levelId, result, stats: this.stats });
      });
    });
  }

  // The object a level's hooks receive.
  api() {
    return {
      scene: this, players: this.players, units: this.units, fx: this.fx, hud: this.hud, audio,
      tile: TILE, view: VIEW, marker: (k) => this.map.markers[k],
      spawn: (list, ally) => this.spawnGroup(list, ally),
    };
  }
}
