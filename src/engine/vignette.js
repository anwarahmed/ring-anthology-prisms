// Archive card animations: a framed window under the card text showing the level's
// backdrop, the level's player characters, and a motif that matches what the card
// says (a fleet passing, a Halo ring firing, Flood spores, drop pods, a slipspace
// rupture, a distant battle, glassing, or quiet drifting motes). Before a level the
// characters run in, and run off into the level at the end; after it they walk away.
// Motifs are picked from the card's words, so no card needs animation data.

import Phaser from 'phaser';
import { HD, ERAS } from './config.js';
import { CHARACTERS } from '../content/characters.js';
import { WEAPONS } from '../content/weapons.js';
import { BODIES } from '../content/bodies.js';
import { bodyTexture, armTexture, META } from './textures.js';
import { aimFrame } from './sprites.js';
import { ringHalves } from './titleart.js';
import { THEMES } from '../content/themes.js';

// Motifs in priority order; a card shows the first two that match.
const MOTIFS = [
  ['ringFire', /\bfired\b|\bfiring\b|\bfire the\b|the array|activat/],
  ['glassing', /glass(ed|ing)/],
  ['flood', /\bflood\b|parasite|gravemind|primordial|contagion|infect/],
  ['slipspace', /slipspace|portal|\bjump(ed)?\b/],
  ['pods', /drop pod|\bpods?\b|\bodsts?\b|dropped from/],
  ['ring', /\bhalo\b|\brings?\b|installation|zeta/],
  ['fleet', /\bships?\b|fleet|cruiser|carrier|frigate|dreadnought|pillar of autumn|spirit of fire|infinity|keyship|warship|pelican|phantom|armada/],
  ['battle', /battle|\bwar\b|attack|fight|invad|defend|siege|army|armies|rebel|uprising/],
];

const FLEET = [
  ['banished', /banished|atriox|escharum/],
  ['forerunner', /forerunner|keyship|didact|librarian|ecumene|mantle/],
  ['covenant', /covenant|san'shyuum|sangheili|prophet|dreadnought|phantom/],
  ['unsc', /unsc|human|pillar of autumn|spirit of fire|infinity|frigate|pelican|odst/],
];
// Motifs that need open sky: indoor backdrops (no sky layers) skip them.
const SKY = new Set(['ringFire', 'glassing', 'slipspace', 'pods', 'ring', 'fleet']);
const OUTDOOR = new Set(['clouds', 'mountains', 'hills', 'planet', 'spires', 'halo', 'ringrise']);

const ERA_FLEET = { forerunner: 'forerunner', covenant: 'covenant', created: 'unsc', banished: 'banished' };

export function motifsFor(card, outdoor = true) {
  const words = `${card.title} ${card.text}`.toLowerCase();
  const list = MOTIFS.filter(([m, re]) => re.test(words) && (outdoor || !SKY.has(m))).map(([m]) => m);
  if (list.includes('ringFire')) return ['ringFire'];
  return list.length ? list.slice(0, 2) : ['calm'];
}

// Every side the card names (ships alternate between them), else the era's.
function fleetsFor(card, era) {
  const words = `${card.title} ${card.text}`.toLowerCase();
  const sides = FLEET.filter(([, re]) => re.test(words)).map(([f]) => f);
  return sides.length ? sides : [ERA_FLEET[era]];
}

// Small shared textures, drawn once at HD resolution.
function textures(scene) {
  if (scene.textures.exists('vig-dot')) return;
  const g = scene.make.graphics({ add: false });
  g.fillStyle(0xffffff, 1).fillCircle(4 * HD, 4 * HD, 4 * HD).generateTexture('vig-dot', 8 * HD, 8 * HD).clear();
  const ship = (key, draw, w, h) => { draw(g); g.generateTexture(key, w * HD, h * HD); g.clear(); };
  const s = HD;
  ship('vig-ship-unsc', (q) => {
    q.fillStyle(0x6c747e, 1).fillTriangle(0, 6 * s, 58 * s, 2 * s, 58 * s, 12 * s).fillRect(46 * s, 1 * s, 16 * s, 12 * s);
    q.fillStyle(0x9aa4ae, 1).fillRect(20 * s, 4 * s, 36 * s, 2 * s);
    q.fillStyle(0x7ad8ff, 1).fillRect(62 * s, 3 * s, 2 * s, 8 * s);
  }, 64, 14);
  ship('vig-ship-covenant', (q) => {
    q.fillStyle(0x6a3a9a, 1).fillEllipse(30 * s, 8 * s, 58 * s, 14 * s).fillEllipse(44 * s, 12 * s, 26 * s, 6 * s);
    q.fillStyle(0xa77ad8, 1).fillEllipse(26 * s, 6 * s, 38 * s, 5 * s);
    q.fillStyle(0xd8a8ff, 1).fillCircle(8 * s, 8 * s, 2 * s);
  }, 60, 16);
  ship('vig-ship-forerunner', (q) => {
    q.fillStyle(0x3a3f4a, 1).fillTriangle(0, 7 * s, 30 * s, 0, 30 * s, 14 * s).fillTriangle(60 * s, 7 * s, 30 * s, 0, 30 * s, 14 * s);
    q.fillStyle(0x7ae8ff, 1).fillRect(8 * s, 6.5 * s, 44 * s, 1 * s);
  }, 60, 14);
  ship('vig-ship-banished', (q) => {
    q.fillStyle(0x5a2a22, 1).fillRect(4 * s, 3 * s, 50 * s, 9 * s).fillTriangle(0, 7 * s, 8 * s, 0, 8 * s, 14 * s);
    q.fillStyle(0x8a3a2a, 1).fillTriangle(20 * s, 3 * s, 26 * s, -3 * s, 32 * s, 3 * s).fillTriangle(36 * s, 3 * s, 42 * s, -2 * s, 48 * s, 3 * s);
    q.fillStyle(0xff8a3a, 1).fillRect(54 * s, 5 * s, 3 * s, 5 * s);
  }, 58, 15);
  ship('vig-pod', (q) => {
    q.fillStyle(0x4a5058, 1).fillRect(2 * s, 0, 6 * s, 12 * s).fillTriangle(2 * s, 12 * s, 8 * s, 12 * s, 5 * s, 16 * s);
    q.fillStyle(0xffb24a, 1).fillRect(3 * s, -1, 4 * s, 2 * s);
  }, 10, 16);
}

export class Vignette {
  // level: { players, theme, era } (a level, or a saga beat). scale: hero size; frame:
  // outline the window; max: how many heroes.
  constructor(scene, rect, level, { scale = 1, frame = true, max = 2 } = {}) {
    this.scene = scene;
    this.scale = scale;
    this.max = max;
    this.rect = rect;
    this.level = level;
    this.era = ERAS[level.era];
    textures(scene);
    const layers = (THEMES[level.theme]?.backdrop ?? []).map((l) => l.type);
    this.outdoor = layers.some((t) => OUTDOOR.has(t));
    this.skyRing = layers.includes('halo') || layers.includes('ringrise'); // already drawn
    if (frame) scene.add.graphics().setDepth(5).lineStyle(1, this.era.color, 0.9).strokeRect(rect.x - 0.5, rect.y - 0.5, rect.w + 1, rect.h + 1);
    this.ground = rect.y + rect.h - 5;
    this.layer = scene.add.container(0, 0).setDepth(2);
    this.front = scene.add.container(0, 0).setDepth(4);
    const mask = scene.make.graphics({ add: false }).fillStyle(0xffffff).fillRect(rect.x, rect.y, rect.w, rect.h).createGeometryMask();
    this.layer.setMask(mask);
    this.front.setMask(mask);
    this.front.add(scene.add.rectangle(rect.x, this.ground, rect.w, rect.y + rect.h - this.ground, 0x000000, 0.35).setOrigin(0, 0));
    this.parts = [];
    this.timers = [];
    this.heroes = this.makeHeroes();
  }

  // The level's player characters, with their arm and weapon like in the level.
  makeHeroes() {
    const ids = [...new Set(this.level.players ?? [])].filter((id) => CHARACTERS[id]).slice(0, this.max);
    return ids.map((id, i) => {
      const def = CHARACTERS[id];
      const key = bodyTexture(this.scene, id, def);
      const meta = META.get(key);
      const body = this.scene.add.sprite(-99, 0, key).setScale(this.scale / HD);
      body.play(`${key}-idle`);
      const B = BODIES[def.body];
      let arm = null;
      if (B.reach && !B.flying) {
        const w = def.weapons?.[0] ?? null;
        arm = this.scene.add.sprite(-99, 0, armTexture(this.scene, id, def, w ?? 'none', w ? WEAPONS[w] : null), aimFrame(1, 0.25).i).setScale(this.scale / HD);
      }
      this.front.add(body);
      if (arm) this.front.add(arm);
      return { key, meta, body, arm, home: this.rect.x + 54 * this.scale + i * 30 * this.scale, y: this.ground - (meta.h / 2 / HD) * this.scale };
    });
  }

  syncArms() {
    for (const h of this.heroes) {
      h.body.y = h.y;
      if (!h.arm) continue;
      const sh = h.meta.shoulders[h.body.frame.name] ?? h.meta.shoulders[0];
      const f = h.body.flipX ? -1 : 1;
      const k = this.scale / HD;
      h.arm.setPosition(h.body.x + (sh[0] - h.meta.w / 2) * f * k, h.body.y + (sh[1] - h.meta.h / 2) * k).setFlipX(h.body.flipX);
    }
  }

  move(h, toX, ms, then = 'idle') {
    this.scene.tweens.killTweensOf(h.body);
    h.body.setFlipX(toX < h.body.x).play(`${h.key}-run`, true);
    this.scene.tweens.add({ targets: h.body, x: toX, duration: ms, ease: 'Sine.InOut', onComplete: () => h.body.play(`${h.key}-${then}`, true) });
  }

  // The heroes' entrance (before a level) or their standing pose (after it).
  enter(which) {
    this.heroes.forEach((h, i) => {
      if (which === 'before') {
        h.body.x = this.rect.x - 20 - i * 24;
        this.scene.time.delayedCall(250 + i * 180, () => this.move(h, h.home, 1300));
      } else {
        h.body.x = h.home;
        h.body.setFlipX(false);
      }
    });
  }

  // Before the level: run off to the right, into it. After it: walk away.
  exit(which) {
    this.heroes.forEach((h, i) => this.move(h, this.rect.x + this.rect.w + 30 + i * 20, which === 'before' ? 700 : 1600, 'run'));
  }

  update() {
    this.syncArms();
  }

  // Swaps the motif for this card's.
  setCard(card) {
    for (const t of this.timers) t.remove();
    this.timers = [];
    const old = this.parts;
    this.parts = [];
    for (const p of old) this.scene.tweens.add({ targets: p, alpha: 0, duration: 300, onComplete: () => p.destroy() });
    for (const m of card.motifs ?? motifsFor(card, this.outdoor)) this[m](card);
  }

  add(obj, front = false) {
    (front ? this.front : this.layer).add(obj);
    this.parts.push(obj);
    return obj;
  }

  every(ms, fn) {
    fn();
    this.timers.push(this.scene.time.addEvent({ delay: ms, loop: true, callback: fn }));
  }

  dot(x, y, color, scale = 1, alpha = 1) {
    return this.add(this.scene.add.image(x, y, 'vig-dot').setScale(scale / HD).setTint(color).setAlpha(alpha).setBlendMode(Phaser.BlendModes.ADD));
  }

  // --- Motifs -------------------------------------------------------------------------

  calm() {
    const r = this.rect;
    this.every(500, () => {
      const d = this.dot(r.x + Math.random() * r.w, this.ground - Math.random() * 10, this.era.color, 0.5, 0);
      this.scene.tweens.add({ targets: d, y: d.y - 30 - Math.random() * 30, alpha: { from: 0.6, to: 0 }, duration: 4000, onComplete: () => d.destroy() });
    });
  }

  // The 3D ribbon ring from the title screen, small and tilted, in the window's sky.
  ring() {
    const r = this.rect;
    this.ringAt = { x: r.x + r.w * 0.7, y: r.y + r.h * 0.22 };
    if (this.skyRing) return;
    const halo = ringHalves(this.scene, 70, 0.2, 0.08, 'vig-ring');
    for (const key of [halo.back, halo.front]) {
      const img = this.add(this.scene.add.image(this.ringAt.x, this.ringAt.y, key).setScale(halo.scale).setAngle(-8).setAlpha(0));
      this.scene.tweens.add({ targets: img, alpha: 0.95, duration: 600 });
    }
  }

  ringFire() {
    this.ring();
    const r = this.rect;
    this.every(3200, () => {
      const wave = this.add(this.scene.add.circle(this.ringAt.x, this.ringAt.y, 4, 0xffffff, 0.9).setBlendMode(Phaser.BlendModes.ADD));
      this.scene.tweens.add({ targets: wave, radius: r.w, alpha: 0, duration: 1600, ease: 'Cubic.Out', onComplete: () => wave.destroy() });
      const flash = this.add(this.scene.add.rectangle(r.x, r.y, r.w, r.h, 0xffffff, 0.5).setOrigin(0, 0), true);
      this.scene.tweens.add({ targets: flash, alpha: 0, duration: 700, onComplete: () => flash.destroy() });
    });
  }

  fleet(card) {
    const r = this.rect;
    const sides = fleetsFor(card, this.level.era);
    let n = 0;
    this.every(1700, () => {
      const key = `vig-ship-${sides[n % sides.length]}`;
      const y = r.y + 10 + ((n++ * 17) % Math.max(12, r.h * 0.45));
      const far = n % 2 === 0;
      const s = this.add(this.scene.add.image(r.x - 70, y, key).setScale((far ? 0.55 : 0.9) / HD).setAlpha(far ? 0.7 : 1));
      this.scene.tweens.add({ targets: s, x: r.x + r.w + 70, duration: far ? 11000 : 7000, onComplete: () => s.destroy() });
    });
  }

  flood() {
    const r = this.rect;
    this.every(160, () => {
      const d = this.dot(r.x + Math.random() * r.w, this.ground, 0x9fd86a, 0.35 + Math.random() * 0.4, 0);
      this.scene.tweens.add({ targets: d, y: r.y + Math.random() * r.h * 0.6, x: d.x + (Math.random() - 0.5) * 40, alpha: { from: 0.7, to: 0 }, duration: 3500 + Math.random() * 2000, onComplete: () => d.destroy() });
    });
  }

  slipspace() {
    const r = this.rect;
    const cx = r.x + r.w * 0.72;
    const cy = r.y + r.h * 0.35;
    const rings = [0, 1, 2].map((i) => this.add(this.scene.add.ellipse(cx, cy, 30 + i * 16, 14 + i * 7).setStrokeStyle(1.5, 0x7ab8ff, 0.8 - i * 0.2).setBlendMode(Phaser.BlendModes.ADD)));
    rings.forEach((e, i) => this.scene.tweens.add({ targets: e, scale: 1.25, alpha: 0.3, duration: 900 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.InOut' }));
    this.add(this.scene.add.ellipse(cx, cy, 22, 10, 0xcfe6ff, 0.9).setBlendMode(Phaser.BlendModes.ADD));
  }

  pods() {
    const r = this.rect;
    this.every(900, () => {
      const x = r.x + r.w * (0.35 + Math.random() * 0.6);
      const p = this.add(this.scene.add.image(x + 40, r.y - 10, 'vig-pod').setScale(0.8 / HD).setAngle(-12));
      this.scene.tweens.add({ targets: p, x, y: this.ground - 6, duration: 900, ease: 'Quad.In', onComplete: () => {
        p.destroy();
        const puff = this.dot(x, this.ground - 2, 0xffc27a, 1.6, 0.9);
        this.scene.tweens.add({ targets: puff, scale: 4 / HD, alpha: 0, duration: 500, onComplete: () => puff.destroy() });
      } });
    });
  }

  battle() {
    const r = this.rect;
    this.every(450, () => {
      const x = r.x + r.w * (0.4 + Math.random() * 0.58);
      const y = r.y + r.h * (0.35 + Math.random() * 0.5);
      const c = Math.random() < 0.5 ? 0xffa23a : this.era.color;
      const b = this.dot(x, y, c, 0.8, 0.9);
      this.scene.tweens.add({ targets: b, scale: 3 / HD, alpha: 0, duration: 450, onComplete: () => b.destroy() });
      if (Math.random() < 0.5) {
        const t = this.add(this.scene.add.line(0, 0, x, y, x - 30 - Math.random() * 40, y + (Math.random() - 0.5) * 20, c, 0.8).setOrigin(0, 0).setLineWidth(0.6));
        this.scene.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() });
      }
    });
  }

  glassing() {
    const r = this.rect;
    this.every(1400, () => {
      const x = r.x + r.w * (0.35 + Math.random() * 0.6);
      const beam = this.add(this.scene.add.rectangle(x, r.y, 4, this.ground - r.y, 0xff7ad8, 0.75).setOrigin(0.5, 0).setBlendMode(Phaser.BlendModes.ADD));
      const glow = this.dot(x, this.ground - 2, 0xffa26a, 2, 0.8);
      this.scene.tweens.add({ targets: [beam, glow], alpha: 0, duration: 1100, delay: 300, onComplete: () => { beam.destroy(); glow.destroy(); } });
    });
  }

  destroy() {
    for (const t of this.timers) t.remove();
  }
}
