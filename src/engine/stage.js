// Scene scripts: a staged animation for one Archive card or saga beat, acting out what
// the card says. Played inside a Vignette window (src/engine/vignette.js).
//
// A script is steps separated by ';'. Each step waits for the one before it; steps
// joined with '&' run together. x and y are fractions of the window (y from the top;
// actors stand on the ground unless given a y). Names are one letter or word.
//
//   C=master-chief@0.2       place an actor: a character or unit id, veh:warthog for a
//   E=elite@0.8<             vehicle, or ship:unsc / ship:covenant-big for a ship that
//   A=ship:unsc-big@0.5,0.4  can move, leave or be destroyed. '<' faces left; @x,y
//                            floats it (flyers, ships)
//   C>0.5   C>>0.5   A>0.6,0.2   walk / run to x (flyers and ships: to x,y)
//   C^   C kneel   C stand   jump, crouch, stand up;  C unarm  no weapon in hand
//   C face <   C face >      turn
//   C fire E   C fire 0.7,0.3   three shots at an actor or a point
//   E down                   defeated: a light puff (never shown hurt)
//   C hide   C show          fade out / in
//   C beam   C beamout       arrive / leave in a beam of light
//   C seal   C wake          closed in a glowing hard-light shell (a Cryptum); it opens
//   C data                   dissolves into rising light (the Composer)
//   C glow #hex   C talk     an aura; a "..." speech mark
//   ship covenant 0>1 0.2 [big] [slow]   a ship crosses at height y (unsc, covenant,
//                            forerunner, banished, flood, keyship)
//   fleet covenant [n]       a fleet streams across the sky
//   boom 0.6 0.4 [big]   fire 0.6   spark 0.6 0.4   a blast, flames, sparks
//   ring 0.7 0.25   ringfire   ringbreak   a Halo; it fires (light wave); it is destroyed
//   planet 0.7 0.3 0.12 #hex  a world;  glass 0.6   glassing beam from orbit
//   flood 0.6   infect E     Flood spores at x; an actor turns Flood-green
//   pods 0.4 0.9 [n]         drop pods land between x0 and x1
//   portal 0.7 0.3   portal close   a slipspace rupture opens / closes
//   beam 0.5 [#hex]          a beam of light from the sky
//   bg space [#ground]   bg sky #top #bottom [#ground]   the window's own backdrop
//   flash [#hex]   shake   dark   light   quiet   wait 1
//     (dark/light: the window dims or returns; quiet: color drains, life goes still)

import Phaser from 'phaser';
import { HD } from './config.js';
import { CHARACTERS } from '../content/characters.js';
import { UNITS } from '../content/units.js';
import { VEHICLES } from '../content/vehicles.js';
import { WEAPONS } from '../content/weapons.js';
import { BODIES } from '../content/bodies.js';
import { bodyTexture, armTexture, META, hexNum } from './textures.js';
import { aimFrame } from './sprites.js';
import { ringHalves } from './titleart.js';

const SHIPS = { unsc: 'vig-ship-unsc', covenant: 'vig-ship-covenant', forerunner: 'vig-ship-forerunner', banished: 'vig-ship-banished', flood: 'vig-ship-forerunner', keyship: 'vig-ship-forerunner' };
const FACTION_LIGHT = { unsc: 0xffb84a, covenant: 0xc890ff, forerunner: 0x7ae8ff, banished: 0xff7a3a, flood: 0xb8e04a, sentinel: 0x7ae8ff };

function lookup(id) {
  if (id.startsWith('veh:')) return { def: VEHICLES[id.slice(4)], key: `veh-${id.slice(4)}`, vehicle: true };
  const def = CHARACTERS[id] ?? UNITS[id];
  return def ? { def, key: id } : null;
}

export class Stage {
  constructor(v) {
    this.v = v; // the Vignette: scene, rect, ground, scale, add(), dot()
    this.s = v.scene;
    this.cast = {};
    this.dead = false;
  }

  X(f) { return this.v.rect.x + f * this.v.rect.w; }
  Y(f) { return this.v.rect.y + f * this.v.rect.h; }
  wait(ms) { return new Promise((r) => this.s.time.delayedCall(ms, r)); }
  tween(cfg) { return new Promise((r) => this.s.tweens.add({ ...cfg, onComplete: r })); }

  async play(script) {
    try {
      for (const step of script.split(';').map((t) => t.trim()).filter(Boolean)) {
        if (this.dead) return;
        await Promise.all(step.split('&').map((c) => this.run(c.trim())));
      }
    } finally {
      this.done = true;
    }
  }

  stop() {
    this.dead = true;
  }

  update() {
    for (const a of Object.values(this.cast)) this.syncArm(a);
  }

  // --- Actors -------------------------------------------------------------------------

  spawn(name, spec) {
    const m = spec.match(/^([\w:-]+)@(-?[\d.]+)(?:,([\d.]+))?(<)?$/);
    if (!m) throw new Error(`scene: bad actor '${spec}'`);
    const [, id, xs, ys, left] = m;
    if (id.startsWith('ship:')) {
      // A ship as an actor (it can move, be destroyed or leave): ship:unsc, ship:covenant-big.
      const [kind, size] = id.slice(5).split('-');
      const img = this.s.add.image(this.X(Number(xs)), this.Y(Number(ys ?? 0.3)), SHIPS[kind] ?? SHIPS.unsc).setScale((size === 'big' ? 1.6 : 0.9) / HD).setFlipX(!!left);
      if (kind === 'flood') img.setTint(0xb8e04a);
      if (kind === 'keyship') img.setTint(0xd8e8ff).setScale(2.4 / HD);
      this.v.add(img);
      this.cast[name] = { name, body: img, arm: null, flying: true, light: FACTION_LIGHT[kind] ?? 0xffc26a };
      img.setAlpha(0);
      return this.tween({ targets: img, alpha: 1, duration: 250 });
    }
    const info = lookup(id);
    if (!info?.def) throw new Error(`scene: unknown actor '${id}'`);
    const key = bodyTexture(this.s, info.key, info.def);
    const meta = META.get(key);
    const k = (this.v.scale * (info.def.scale ?? 1)) / HD;
    const body = this.s.add.sprite(this.X(Number(xs)), 0, key).setScale(k).setFlipX(!!left);
    const B = BODIES[info.def.body];
    const flying = ys !== undefined || B?.flying;
    body.y = ys !== undefined ? this.Y(Number(ys)) : B?.flying ? this.Y(0.45) : this.v.ground - (meta.h / 2) * k;
    body.play(`${key}-idle`);
    let arm = null;
    if (!info.vehicle && B?.reach && !B.flying) {
      const w = info.def.weapon ?? info.def.weapons?.[0] ?? null;
      arm = this.s.add.sprite(0, 0, armTexture(this.s, info.key, info.def, w ?? 'none', w ? WEAPONS[w] : null), aimFrame(1, 0.1).i).setScale(k).setFlipX(!!left);
    }
    this.v.add(body, true);
    if (arm) this.v.add(arm, true);
    const a = { name, key, meta, body, arm, k, def: info.def, flying, light: FACTION_LIGHT[info.def.faction] ?? 0xffffff };
    this.cast[name] = a;
    this.syncArm(a);
    for (const o of [body, arm]) if (o) { o.setAlpha(0); this.s.tweens.add({ targets: o, alpha: 1, duration: 250 }); }
    return Promise.resolve();
  }

  syncArm(a) {
    if (!a.arm || !a.body.active || !a.meta) return;
    const sh = a.meta.shoulders[a.body.frame.name] ?? a.meta.shoulders[0];
    const f = a.body.flipX ? -1 : 1;
    a.arm.setPosition(a.body.x + (sh[0] - a.meta.w / 2) * f * a.k, a.body.y + (sh[1] - a.meta.h / 2) * a.k).setFlipX(a.body.flipX).setAlpha(a.body.alpha).setVisible(a.body.visible);
  }

  anim(a, name) {
    if (this.dead || !a.body.anims) return; // the card has moved on and the actor is gone
    const k = `${a.key}-${name}`;
    a.body.play(this.s.anims.exists(k) ? k : `${a.key}-idle`, true);
  }

  async move(a, x, run, y) {
    const to = this.X(x);
    if (Math.abs(to - a.body.x) > 1) a.body.setFlipX(to < a.body.x);
    if (!a.flying) this.anim(a, 'run');
    const ms = (Math.abs(to - a.body.x) / this.v.rect.w) * (run ? 1400 : a.meta ? 2600 : 4200) + 150;
    const dy = y === undefined ? 0 : Math.abs(this.Y(y) - a.body.y) / this.v.rect.h * 2600;
    await this.tween({ targets: a.body, x: to, ...(y === undefined ? {} : { y: this.Y(y) }), duration: Math.max(ms, dy), ease: 'Sine.InOut' });
    if (!a.flying) this.anim(a, 'idle');
  }

  target(spec) {
    const t = this.cast[spec];
    if (t) return { x: t.body.x, y: t.body.y };
    const [x, y] = spec.split(',').map(Number);
    return { x: this.X(x), y: this.Y(y) };
  }

  async fire(a, spec) {
    const t = this.target(spec);
    a.body.setFlipX(t.x < a.body.x);
    if (a.arm) a.arm.setFrame(aimFrame(t.x - a.body.x, t.y - a.body.y).i);
    for (let i = 0; i < 3; i++) {
      const from = a.arm ? { x: a.arm.x + (a.body.flipX ? -8 : 8) * this.v.scale, y: a.arm.y } : { x: a.body.x, y: a.body.y };
      const b = this.v.dot(from.x, from.y, a.light, 0.6);
      this.s.tweens.add({ targets: b, x: t.x + (Math.random() - 0.5) * 6, y: t.y + (Math.random() - 0.5) * 6, duration: 260, onComplete: () => { b.destroy(); this.v.dot(t.x, t.y, a.light, 1.4, 0.8); } });
      await this.wait(160);
    }
    await this.wait(200);
  }

  async down(a) {
    const g = this.v.dot(a.body.x, a.body.y, a.light, 3, 0.95);
    this.s.tweens.add({ targets: g, scale: 7 / HD, alpha: 0, duration: 500, onComplete: () => g.destroy() });
    for (let i = 0; i < 10; i++) {
      const d = this.v.dot(a.body.x, a.body.y, a.light, 0.8);
      const ang = (i / 10) * Math.PI * 2;
      this.s.tweens.add({ targets: d, x: d.x + Math.cos(ang) * 14, y: d.y + Math.sin(ang) * 14, alpha: 0, duration: 450, onComplete: () => d.destroy() });
    }
    await this.tween({ targets: [a.body, a.arm].filter(Boolean), alpha: 0, duration: 200 });
    a.body.setVisible(false);
  }

  async actor(a, verb, arg) {
    switch (verb) {
      case 'fire': return this.fire(a, arg);
      case 'down': return this.down(a);
      case 'unarm': if (a.arm) { a.arm.destroy(); a.arm = null; } return Promise.resolve();
      case 'kneel': this.anim(a, 'crouch'); return this.wait(200);
      case 'stand': this.anim(a, 'idle'); return this.wait(150);
      case 'face': a.body.setFlipX(arg === '<'); return Promise.resolve();
      case 'hide': return this.tween({ targets: [a.body, a.arm].filter(Boolean), alpha: 0, duration: 400 });
      case 'show': a.body.setVisible(true); return this.tween({ targets: [a.body, a.arm].filter(Boolean), alpha: 1, duration: 400 });
      case 'talk': {
        const t = this.s.add.text(a.body.x, a.body.y - (a.meta.h / 2) * a.k - 4, '...', { fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ffffff' }).setOrigin(0.5, 1).setResolution(HD);
        this.v.add(t, true);
        await this.wait(900);
        return this.tween({ targets: t, alpha: 0, duration: 250 });
      }
      case 'glow': {
        const g = this.s.add.image(a.body.x, a.body.y, 'glow').setTint(hexNum(arg ?? '#7ae8ff')).setBlendMode('ADD').setScale(1.6 * this.v.scale).setAlpha(0);
        this.v.add(g, true);
        this.s.tweens.add({ targets: g, alpha: 0.7, duration: 500, yoyo: true, hold: 600, repeat: -1 });
        return this.wait(500);
      }
      case 'beam': {
        await this.beam(a.body.x, '#bfefff');
        return this.actor(a, 'show');
      }
      case 'beamout': {
        const b = this.beam(a.body.x, '#bfefff');
        await this.actor(a, 'hide');
        return b;
      }
      case 'seal': {
        const r = (a.meta.h / 2) * a.k + 4;
        const shell = this.s.add.ellipse(a.body.x, a.body.y, r * 1.3, r * 2, 0x7ae8ff, 0.25).setStrokeStyle(1.5, 0xbff4ff, 0.9).setScale(0.2);
        this.v.add(shell, true);
        a.shell = shell;
        await this.tween({ targets: shell, scale: 1, duration: 700, ease: 'Back.Out' });
        return this.tween({ targets: [a.body, a.arm].filter(Boolean), alpha: 0.35, duration: 600 });
      }
      case 'wake': {
        // The shell breaks open and the actor comes back to full light.
        if (a.shell) { this.flash('#bff4ff'); this.s.tweens.add({ targets: a.shell, scale: 1.6, alpha: 0, duration: 500 }); }
        return this.tween({ targets: [a.body, a.arm].filter(Boolean), alpha: 1, duration: 500 });
      }
      case 'data': {
        for (let i = 0; i < 24; i++) {
          const d = this.v.dot(a.body.x + (Math.random() - 0.5) * 10 * this.v.scale, a.body.y + (Math.random() - 0.5) * 20 * this.v.scale, 0x9ff4ff, 0.6);
          this.s.tweens.add({ targets: d, y: d.y - 40 - Math.random() * 30, alpha: 0, duration: 1400, delay: i * 30, onComplete: () => d.destroy() });
        }
        return this.tween({ targets: [a.body, a.arm].filter(Boolean), alpha: 0, duration: 1200 });
      }
      case 'infect': {
        a.body.setTint(0xb8e04a);
        a.arm?.setTint(0xb8e04a);
        a.light = 0xb8e04a;
        return this.flood(a.body.x, 6);
      }
      default: throw new Error(`scene: unknown action '${verb}'`);
    }
  }

  // --- Effects ------------------------------------------------------------------------

  beam(x, hex = '#bfefff') {
    const r = this.v.rect;
    const b = this.s.add.rectangle(x, r.y, 6, this.v.ground - r.y, hexNum(hex), 0.8).setOrigin(0.5, 0).setBlendMode('ADD').setScale(0.2, 1);
    this.v.add(b, true);
    return this.tween({ targets: b, scaleX: 1, duration: 250, yoyo: true, hold: 300 }).then(() => b.destroy());
  }

  ship(kind, path, y, opts) {
    const [x0, x1] = path.split('>').map(Number);
    const big = opts.includes('big') || kind === 'keyship';
    const img = this.s.add.image(this.X(x0), this.Y(Number(y)), SHIPS[kind] ?? SHIPS.unsc).setScale((big ? 1.6 : 0.9) / HD).setFlipX(x1 < x0);
    if (kind === 'flood') img.setTint(0xb8e04a);
    if (kind === 'keyship') img.setTint(0xd8e8ff);
    this.v.add(img);
    const ms = (opts.includes('slow') ? 9000 : 4500) * Math.abs(x1 - x0);
    return this.tween({ targets: img, x: this.X(x1), duration: ms, ease: x1 > 0 && x1 < 1 ? 'Sine.Out' : 'Linear' });
  }

  async fleet(kind, n = 5) {
    for (let i = 0; i < n; i++) {
      this.ship(kind, i % 2 ? '1.15>-0.15' : '-0.15>1.15', String(0.08 + (i % 4) * 0.09), i % 3 ? [] : ['big']);
      await this.wait(350);
    }
  }

  boom(x, y, big) {
    const s = big ? 2.2 : 1;
    const g = this.v.dot(this.X(x), this.Y(y), 0xffc26a, 1.5 * s, 1);
    this.s.tweens.add({ targets: g, scale: (7 * s) / HD, alpha: 0, duration: 600, onComplete: () => g.destroy() });
    for (let i = 0; i < 12 * s; i++) {
      const d = this.v.dot(this.X(x), this.Y(y), [0xffe08a, 0xff8a3a, 0xffffff][i % 3], 0.7);
      const ang = Math.random() * Math.PI * 2, r = (10 + Math.random() * 14) * s;
      this.s.tweens.add({ targets: d, x: d.x + Math.cos(ang) * r, y: d.y + Math.sin(ang) * r, alpha: 0, duration: 600, onComplete: () => d.destroy() });
    }
    if (big) this.s.cameras.main.shake(250, 0.004);
    return this.wait(350);
  }

  fireAt(x) {
    const ev = this.s.time.addEvent({ delay: 90, loop: true, callback: () => {
      const d = this.v.dot(this.X(x) + (Math.random() - 0.5) * 18, this.v.ground - 2, [0xffb84a, 0xff6a2a][Math.random() < 0.5 ? 0 : 1], 0.8);
      this.s.tweens.add({ targets: d, y: d.y - 10 - Math.random() * 14, alpha: 0, scale: 0.2 / HD, duration: 700, onComplete: () => d.destroy() });
    } });
    this.v.timers.push(ev);
    return this.wait(200);
  }

  ring(x, y) {
    const halo = ringHalves(this.s, 70, 0.2, 0.08, 'vig-ring');
    this.ringAt = { x: this.X(x), y: this.Y(y) };
    this.ringImgs = [];
    for (const key of [halo.back, halo.front]) {
      const img = this.s.add.image(this.ringAt.x, this.ringAt.y, key).setScale(halo.scale).setAngle(-8).setAlpha(0);
      this.v.add(img);
      this.ringImgs.push(img);
      this.s.tweens.add({ targets: img, alpha: 0.95, duration: 700 });
    }
    return this.wait(500);
  }

  async ringfire() {
    const at = this.ringAt ?? { x: this.X(0.7), y: this.Y(0.25) };
    for (let i = 0; i < 3; i++) {
      const w = this.s.add.circle(at.x, at.y, 4, 0xffffff, 0.9).setBlendMode('ADD');
      this.v.add(w);
      this.s.tweens.add({ targets: w, radius: this.v.rect.w * 1.2, alpha: 0, duration: 1600, ease: 'Cubic.Out', onComplete: () => w.destroy() });
      await this.wait(260);
    }
    return this.flash('#ffffff');
  }

  // The ring breaks apart in a chain of blasts and fades away.
  async ringbreak() {
    const at = this.ringAt ?? { x: this.X(0.7), y: this.Y(0.25) };
    const fx = (dx, dy) => this.boom((at.x + dx - this.v.rect.x) / this.v.rect.w, (at.y + dy - this.v.rect.y) / this.v.rect.h, true);
    for (const [dx, dy] of [[-60, 4], [50, -6], [-20, 10], [66, 4], [0, -10]]) { fx(dx, dy); await this.wait(180); }
    this.flash('#ffffff');
    return this.tween({ targets: this.ringImgs ?? [], alpha: 0, duration: 900 });
  }

  planet(x, y, r, hex) {
    const R = Number(r) * this.v.rect.w;
    const p = this.s.add.circle(this.X(x), this.Y(y), R, hexNum(hex ?? '#4a8ac8'));
    const shade = this.s.add.circle(this.X(x) + R * 0.3, this.Y(y) + R * 0.2, R * 0.95, 0x000000, 0.35);
    const rim = this.s.add.circle(this.X(x), this.Y(y), R).setStrokeStyle(1.5, 0xffffff, 0.5);
    for (const o of [p, shade, rim]) { this.v.add(o); o.setAlpha(0); this.s.tweens.add({ targets: o, alpha: o === shade ? 0.35 : 1, duration: 600 }); }
    this.planetAt = { x: this.X(x), y: this.Y(y), R, body: p };
    return this.wait(400);
  }

  async glass(x) {
    const X = this.X(x), r = this.v.rect;
    const beam = this.s.add.rectangle(X, r.y, 5, this.v.ground - r.y, 0xff7ad8, 0.85).setOrigin(0.5, 0).setBlendMode('ADD');
    this.v.add(beam);
    const glow = this.v.dot(X, this.v.ground - 2, 0xffa26a, 3, 0.9);
    await this.wait(700);
    this.fireAt(x);
    await this.tween({ targets: [beam, glow], alpha: 0, duration: 600 });
    beam.destroy();
    glow.destroy();
  }

  flood(X, n = 18) {
    const ev = this.s.time.addEvent({ delay: 120, repeat: n, callback: () => {
      const d = this.v.dot(X + (Math.random() - 0.5) * 40, this.v.ground, 0x9fd86a, 0.35 + Math.random() * 0.4, 0.8);
      this.s.tweens.add({ targets: d, y: this.v.rect.y + Math.random() * this.v.rect.h * 0.6, x: d.x + (Math.random() - 0.5) * 40, alpha: 0, duration: 3000, onComplete: () => d.destroy() });
    } });
    this.v.timers.push(ev);
    return this.wait(600);
  }

  async pods(x0, x1, n = 4) {
    for (let i = 0; i < n; i++) {
      const x = this.X(Number(x0) + ((Number(x1) - Number(x0)) * (i + 0.5)) / n);
      const p = this.s.add.image(x + 40, this.v.rect.y - 10, 'vig-pod').setScale(0.8 / HD).setAngle(-12);
      this.v.add(p);
      this.s.tweens.add({ targets: p, x, y: this.v.ground - 6, duration: 800, ease: 'Quad.In', onComplete: () => { p.setAngle(0); this.boom(((x - this.v.rect.x) / this.v.rect.w), (this.v.ground - this.v.rect.y) / this.v.rect.h); } });
      await this.wait(260);
    }
    return this.wait(900);
  }

  portal(x, y, close) {
    if (close === 'close' || x === 'close') {
      const p = this.portalParts ?? [];
      return this.tween({ targets: p, scale: 0, alpha: 0, duration: 500 });
    }
    const cx = this.X(Number(x)), cy = this.Y(Number(y));
    this.portalParts = [0, 1, 2].map((i) => this.v.add(this.s.add.ellipse(cx, cy, 30 + i * 16, 14 + i * 7).setStrokeStyle(1.5, 0x7ab8ff, 0.8 - i * 0.2).setBlendMode('ADD').setScale(0)));
    this.portalParts.push(this.v.add(this.s.add.ellipse(cx, cy, 22, 10, 0xcfe6ff, 0.9).setBlendMode('ADD').setScale(0)));
    return this.tween({ targets: this.portalParts, scale: 1, duration: 600, ease: 'Back.Out' });
  }

  flash(hex = '#ffffff') {
    const r = this.v.rect;
    const f = this.s.add.rectangle(r.x, r.y, r.w, r.h, hexNum(hex), 0.7).setOrigin(0, 0);
    this.v.add(f, true);
    return this.tween({ targets: f, alpha: 0, duration: 600 }).then(() => f.destroy());
  }

  shade(alpha) {
    if (!this.dim) {
      const r = this.v.rect;
      this.dim = this.v.add(this.s.add.rectangle(r.x, r.y, r.w, r.h, 0x000000, 0).setOrigin(0, 0), true);
      this.dim.setDepth?.(1);
    }
    return this.tween({ targets: this.dim, fillAlpha: alpha, duration: 900 });
  }

  // quiet: the color drains out of the world behind the actors (a fired Halo; life goes
// still). Actors on stage are unaffected: they were somewhere safe.
  quiet() {
    const r = this.v.rect;
    const g = this.v.add(this.s.add.rectangle(r.x, r.y, r.w, r.h, 0x8a8f9a, 0).setOrigin(0, 0).setBlendMode('MULTIPLY'));
    return this.tween({ targets: g, fillAlpha: 1, duration: 1500 });
  }

  // A backdrop for the window, behind everything else in the scene: space (stars), or a
  // sky gradient (top color, bottom color), with an optional ground strip color.
  bg(kind, a, b, ground) {
    const r = this.v.rect;
    const g = this.s.add.graphics();
    if (kind === 'space') {
      g.fillStyle(0x05060e, 1).fillRect(r.x, r.y, r.w, r.h);
      for (let i = 0; i < 70; i++) g.fillStyle(0xffffff, 0.3 + Math.random() * 0.7).fillRect(r.x + Math.random() * r.w, r.y + Math.random() * r.h, 1, 1);
    } else {
      g.fillGradientStyle(hexNum(a), hexNum(a), hexNum(b), hexNum(b), 1).fillRect(r.x, r.y, r.w, r.h);
    }
    const gr = kind === 'space' ? a : ground;
    if (gr) g.fillStyle(hexNum(gr), 1).fillRect(r.x, this.v.ground - 2, r.w, r.y + r.h - this.v.ground + 2);
    this.v.layer.addAt(g, 0);
    this.v.parts.push(g);
    return Promise.resolve();
  }

  // --- Dispatch -----------------------------------------------------------------------

  run(cmd) {
    if (!cmd || this.dead) return Promise.resolve();
    let m = cmd.match(/^(\w+)=(.+)$/);
    if (m) return this.spawn(m[1], m[2]);
    m = cmd.match(/^(\w+)(>>?)(-?[\d.]+)(?:,(-?[\d.]+))?$/);
    if (m) return this.move(this.need(m[1]), Number(m[3]), m[2] === '>>', m[4] === undefined ? undefined : Number(m[4]));
    m = cmd.match(/^(\w+)\^$/);
    if (m) {
      const a = this.need(m[1]);
      this.anim(a, 'jump');
      return this.tween({ targets: a.body, y: a.body.y - 18 * this.v.scale, duration: 280, yoyo: true, ease: 'Quad.Out' }).then(() => this.anim(a, 'idle'));
    }
    const [w, ...args] = cmd.split(/\s+/);
    if (this.cast[w]) return this.actor(this.cast[w], args[0], args[1]);
    switch (w) {
      case 'bg': return this.bg(args[0], args[1], args[2], args[3]);
      case 'wait': return this.wait(Number(args[0] ?? 1) * 1000);
      case 'ship': return this.ship(args[0], args[1], args[2] ?? '0.2', args.slice(3));
      case 'fleet': return this.fleet(args[0], Number(args[1] ?? 5));
      case 'boom': return this.boom(Number(args[0]), Number(args[1] ?? 0.7), args[2] === 'big');
      case 'fire': return this.fireAt(Number(args[0]));
      case 'spark': { const d = this.v.dot(this.X(Number(args[0])), this.Y(Number(args[1])), 0xffffff, 1.2); return this.tween({ targets: d, alpha: 0, duration: 300 }); }
      case 'ring': return this.ring(Number(args[0] ?? 0.7), Number(args[1] ?? 0.25));
      case 'ringfire': return this.ringfire();
      case 'ringbreak': return this.ringbreak();
      case 'planet': return this.planet(Number(args[0]), Number(args[1]), args[2] ?? '0.12', args[3]);
      case 'glass': return this.glass(Number(args[0]));
      case 'flood': return this.flood(this.X(Number(args[0])));
      case 'pods': return this.pods(args[0], args[1], Number(args[2] ?? 4));
      case 'portal': return this.portal(args[0], args[1], args[2]);
      case 'beam': return this.beam(this.X(Number(args[0])), args[1]);
      case 'flash': return this.flash(args[0]);
      case 'shake': this.s.cameras.main.shake(300, 0.006); return this.wait(300);
      case 'dark': return this.shade(0.55);
      case 'light': return this.shade(0);
      case 'quiet': return this.quiet();
      default: throw new Error(`scene: unknown step '${cmd}'`);
    }
  }

  need(name) {
    const a = this.cast[name];
    if (!a) throw new Error(`scene: no actor '${name}'`);
    return a;
  }

  // Everyone on stage runs off to the right (into the level).
  exitAll() {
    for (const a of Object.values(this.cast)) if (a.body.visible && a.body.alpha > 0.5 && !a.flying) this.move(a, 1.2, true);
  }
}
