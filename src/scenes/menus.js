// Menu scenes: Boot, Title, Players (join + difficulty), Timeline (level select),
// Archive (canon story cards), Results and Pause.

import Phaser from 'phaser';
import { VIEW, ERAS, DIFFICULTY, LEGAL_NOTICE } from '../engine/config.js';
import { txt } from '../engine/ui.js';
import { Controls, bindingStore } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { session } from '../engine/session.js';
import { baseTextures, hexNum } from '../engine/textures.js';
import { buildBackdrop } from '../engine/backdrop.js';
import { LEVELS, CAMPAIGN, ORDER } from '../../levels/index.js';
import { THEMES } from '../content/themes.js';

const ERA_LIST = ['forerunner', 'covenant', 'created', 'banished'];

// Any button on any device counts as "press start" / "confirm".
function anyDevice(controls) {
  for (const d of ['kb1', 'kb2', 'pad0', 'pad1', 'pad2', 'pad3']) {
    const s = controls.read(d);
    if (s.pressed.jump || s.pressed.fire || s.pressed.pause || controls.anyButton(d)) return { device: d, s };
    if (s.pressed.up || s.pressed.down || s.pressed.left || s.pressed.right) return { device: d, s, nav: true };
  }
  return null;
}

function starfield(scene) {
  const g = scene.add.graphics();
  for (let i = 0; i < 120; i++) {
    g.fillStyle(0xffffff, Math.random() * 0.8 + 0.2).fillRect(Math.random() * VIEW.w, Math.random() * VIEW.h, 1, 1);
  }
}

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  async create() {
    baseTextures(this);
    try {
      await Promise.all([document.fonts.load('8px "Press Start 2P"'), document.fonts.load('16px VT323')]);
    } catch { /* fonts fall back to monospace */ }
    if (session.debug.level && LEVELS[session.debug.level]) {
      this.scene.start('Level', { levelId: session.debug.level });
    } else {
      this.scene.start('Title');
    }
  }
}

// The logo: one white beam enters a prism and splits into the four era colors.
function prismLogo(scene, cx, cy) {
  const g = scene.add.graphics();
  const draw = (t) => {
    g.clear();
    g.lineStyle(3, 0xffffff, 0.9).lineBetween(cx - 140, cy + 18, cx - 14, cy);
    ERA_LIST.forEach((e, i) => {
      const spread = (i - 1.5) * 9 + Math.sin(t / 600 + i) * 1.5;
      g.lineStyle(3, ERAS[e].color, 0.95).lineBetween(cx + 12, cy - 2 + i * 2, cx + 150, cy - 18 + spread * 2.2);
      g.lineStyle(7, ERAS[e].color, 0.15).lineBetween(cx + 12, cy - 2 + i * 2, cx + 150, cy - 18 + spread * 2.2);
    });
    g.fillStyle(0x0b0f1e, 1).fillTriangle(cx - 22, cy + 18, cx + 22, cy + 18, cx, cy - 22);
    g.lineStyle(2, 0xdff4ff, 1).strokeTriangle(cx - 22, cy + 18, cx + 22, cy + 18, cx, cy - 22);
  };
  const tick = (t) => draw(t);
  scene.events.on('update', tick);
  scene.events.once('shutdown', () => scene.events.off('update', tick));
  draw(0);
}

export class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }
  create() {
    this.controls = new Controls(this);
    starfield(this);
    // A great ring turning slowly in the dark (no logo, no canon artwork).
    const ring = this.add.graphics().setPosition(VIEW.w / 2, VIEW.h * 0.48);
    ring.lineStyle(10, 0x7fb7ff, 0.12).strokeEllipse(0, 0, 420, 90);
    ring.lineStyle(4, 0xa8c8ff, 0.7).strokeEllipse(0, 0, 400, 84);
    this.tweens.add({ targets: ring, rotation: 0.06, duration: 6000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    prismLogo(this, VIEW.w / 2, 78);
    txt(this, VIEW.w / 2, 120, 'RING ANTHOLOGY', { size: 8, color: '#bfd8ff' }).setOrigin(0.5);
    const title = txt(this, VIEW.w / 2, 144, 'PRISMS', { size: 24 }).setOrigin(0.5);
    this.tweens.add({ targets: title, alpha: 0.8, duration: 1200, yoyo: true, repeat: -1 });
    // PLAY / CONTROLS. Up/down to choose; any jump/fire/start to confirm.
    this.items = ['PLAY', 'CONTROLS'].map((label, i) => txt(this, VIEW.w / 2, 182 + i * 13, label, { size: 8 }).setOrigin(0.5));
    this.sel = 0;
    this.blink = this.tweens.add({ targets: this.items[0], alpha: 0.35, duration: 500, yoyo: true, repeat: -1 });
    this.refreshMenu();
    txt(this, VIEW.w / 2, 206, 'An unofficial Halo fan game', { font: 'read', size: 16, color: '#9aa' }).setOrigin(0.5);
    txt(this, VIEW.w / 2, VIEW.h - 6, LEGAL_NOTICE, { font: 'read', size: 12, color: '#778', align: 'center', wrap: VIEW.w - 30, stroke: false }).setOrigin(0.5, 1);
    this.input.once('pointerdown', () => audio.unlock());
    audio.playMusic('title', 0).catch(() => {});
  }
  refreshMenu() {
    this.items.forEach((t, i) => t.setText(i === this.sel ? `> ${['PLAY', 'CONTROLS'][i]} <` : ['PLAY', 'CONTROLS'][i]).setAlpha(1));
    this.blink.remove();
    this.blink = this.tweens.add({ targets: this.items[this.sel], alpha: 0.35, duration: 500, yoyo: true, repeat: -1 });
  }
  update() {
    const hit = anyDevice(this.controls);
    if (!hit) return;
    audio.unlock();
    if (hit.nav) {
      if (hit.s.pressed.up || hit.s.pressed.down) {
        this.sel = 1 - this.sel;
        audio.sfx('uiMove');
        this.refreshMenu();
      }
      return;
    }
    audio.sfx('ui');
    if (this.sel === 1) return this.scene.start('Controls', { returnTo: 'Title' });
    audio.playMusic('title', 0);
    this.scene.start('Players', { first: hit.device });
  }
}

export class PlayersScene extends Phaser.Scene {
  constructor() { super('Players'); }
  init(data) { this.first = data.first; }
  create() {
    this.controls = new Controls(this);
    starfield(this);
    this.devices = [this.first];
    this.setupDone = new Set();
    this.events.on('wake', () => { this.ready = this.time.now + 400; this.controls.prev = {}; this.controls.prevButtons = {}; });
    this.diffs = Object.keys(DIFFICULTY);
    this.diffIndex = Math.max(0, this.diffs.indexOf(session.difficulty));
    txt(this, VIEW.w / 2, 24, 'WHO IS PLAYING?', { size: 16 }).setOrigin(0.5);
    this.slots = [0, 1].map((i) => txt(this, VIEW.w / 2, 70 + i * 26, '', { size: 8 }).setOrigin(0.5));
    txt(this, VIEW.w / 2, 140, 'DIFFICULTY', { size: 8, color: '#aaa' }).setOrigin(0.5);
    this.diffText = txt(this, VIEW.w / 2, 158, '', { size: 16 }).setOrigin(0.5);
    txt(this, VIEW.w / 2, 200, 'P1: LEFT/RIGHT TO CHOOSE, JUMP TO START', { size: 8, color: '#aaa' }).setOrigin(0.5);
    txt(this, VIEW.w / 2, 216, 'P2: PRESS JUMP OR FIRE ON ANOTHER CONTROLLER OR KEYS', { font: 'read', size: 16, color: '#aaa' }).setOrigin(0.5);
    this.ready = this.time.now + 300;
    this.refresh();
  }
  refresh() {
    this.slots.forEach((t, i) => {
      const d = this.devices[i];
      t.setText(d ? `P${i + 1}  ${this.controls.label(d).toUpperCase()}` : `P${i + 1}  (PRESS TO JOIN)`).setColor(d ? '#ffffff' : '#666666');
    });
    this.diffText.setText(`< ${DIFFICULTY[this.diffs[this.diffIndex]].label.toUpperCase()} >`);
  }
  update() {
    if (this.time.now < this.ready) return;
    if (this.devices.length < 2) {
      const d = this.controls.joinPressed(this.devices);
      if (d) {
        this.devices.push(d);
        audio.sfx('ui');
        this.refresh();
      }
    }
    // A controller the browser doesn't recognize gets a one-time guided button setup.
    const unknown = this.devices.find((d) => !this.controls.isStandard(d) && !bindingStore.has(this.controls.storeKey(d)) && !this.setupDone.has(d));
    if (unknown) {
      this.setupDone.add(unknown);
      this.scene.sleep();
      this.scene.launch('Controls', { returnTo: 'Players', wizard: unknown });
      return;
    }
    const s = this.controls.read(this.devices[0]);
    if (s.pressed.left || s.pressed.right) {
      this.diffIndex = (this.diffIndex + (s.pressed.right ? 1 : this.diffs.length - 1)) % this.diffs.length;
      audio.sfx('uiMove');
      this.refresh();
    }
    if (s.pressed.jump || s.pressed.pause || this.controls.anyButton(this.devices[0])) {
      session.players = this.devices.map((device) => ({ device }));
      session.difficulty = this.diffs[this.diffIndex];
      audio.sfx('ui');
      this.scene.start('Timeline');
    }
  }
}

// Level select along the history: Parts left/right, levels up/down.
export class TimelineScene extends Phaser.Scene {
  constructor() { super('Timeline'); }
  create() {
    this.controls = new Controls(this);
    starfield(this);
    this.partIndex = this.registry.get('partIndex') ?? 0;
    this.levelIndex = this.registry.get('levelIndex') ?? 0;
    this.header = txt(this, VIEW.w / 2, 12, '', { size: 8 }).setOrigin(0.5, 0);
    this.rows = [];
    this.hint = txt(this, VIEW.w / 2, VIEW.h - 10, 'UP/DOWN: LEVEL  LEFT/RIGHT: PART  START: PLAY  ABILITY: BACK', { size: 8, color: '#888' }).setOrigin(0.5, 1);
    this.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, false);
    this.g = this.add.graphics();
    audio.playMusic('archive', 0);
    this.draw();
  }
  unlocked(id) {
    if (session.debug.all) return true;
    const built = ORDER.filter((l) => LEVELS[l.id]);
    const i = built.findIndex((l) => l.id === id);
    return i === 0 || (i > 0 && session.isDone(built[i - 1].id));
  }
  draw() {
    const part = CAMPAIGN.parts[this.partIndex];
    this.header.setText(`< ${part.title.toUpperCase()} >`);
    this.rows.forEach((r) => r.destroy());
    this.rows = [];
    this.g.clear();
    // Era timeline strip.
    ERA_LIST.forEach((e, i) => this.g.fillStyle(ERAS[e].color, 0.9).fillRect(40 + i * 100, 30, 98, 3));
    const first = Math.max(0, Math.min(this.levelIndex - 5, part.levels.length - 11));
    part.levels.slice(first, first + 11).forEach((l, k) => {
      const i = first + k;
      const built = !!LEVELS[l.id];
      const open = built && this.unlocked(l.id);
      const sel = i === this.levelIndex;
      const status = !built ? 'COMING SOON' : !open ? 'LOCKED' : session.isDone(l.id) ? 'DONE' : 'PLAY';
      const color = sel ? '#ffffff' : open ? '#bbbbbb' : '#555555';
      const y = 44 + k * 18;
      if (sel) this.g.fillStyle(ERAS[l.era]?.color ?? 0x888888, 0.25).fillRect(30, y - 3, VIEW.w - 60, 15);
      this.g.fillStyle(ERAS[l.era]?.color ?? 0x888888, 1).fillRect(34, y, 4, 9);
      this.rows.push(txt(this, 46, y, `${l.id.toUpperCase()}  ${l.title.toUpperCase()}`, { size: 8, color }));
      this.rows.push(txt(this, VIEW.w - 36, y, status, { size: 8, color: status === 'PLAY' ? ERAS[l.era]?.css : color }).setOrigin(1, 0));
    });
  }
  // Start (each device's pause binding, or Enter) plays; ability goes back.
  update() {
    let s = null;
    for (const d of this.controls.devices()) {
      const r = this.controls.read(d);
      if (Object.values(r.pressed).some(Boolean)) s = r;
    }
    const enter = Phaser.Input.Keyboard.JustDown(this.enter);
    if (!s && !enter) return;
    s = s ?? { pressed: {} };
    const parts = CAMPAIGN.parts;
    if (s.pressed.left || s.pressed.right) {
      this.partIndex = (this.partIndex + (s.pressed.right ? 1 : parts.length - 1)) % parts.length;
      this.levelIndex = 0;
    } else if (s.pressed.up || s.pressed.down) {
      const n = parts[this.partIndex].levels.length;
      this.levelIndex = (this.levelIndex + (s.pressed.down ? 1 : n - 1)) % n;
    } else if (s.pressed.pause || enter) {
      const l = parts[this.partIndex].levels[this.levelIndex];
      if (LEVELS[l.id] && this.unlocked(l.id)) {
        audio.sfx('ui');
        this.registry.set('partIndex', this.partIndex);
        this.registry.set('levelIndex', this.levelIndex);
        return this.scene.start('Archive', { levelId: l.id, which: 'before' });
      }
    } else if (s.pressed.ability) {
      return this.scene.start('Title');
    } else {
      return;
    }
    audio.sfx('uiMove');
    this.draw();
  }
}

// The Archive: neutral, sourced story cards shown before and after each level.
export class ArchiveScene extends Phaser.Scene {
  constructor() { super('Archive'); }
  init(data) {
    this.levelId = data.levelId;
    this.which = data.which;
    this.level = LEVELS[this.levelId];
    this.cards = this.level.archive?.[this.which] ?? [];
    this.i = 0;
  }
  create() {
    if (!this.cards.length) return this.next();
    this.controls = new Controls(this);
    baseTextures(this);
    buildBackdrop(this, THEMES[this.level.theme], VIEW.w);
    this.add.rectangle(0, 0, VIEW.w, VIEW.h, 0x000000, 0.55).setOrigin(0);
    const era = ERAS[this.level.era];
    this.add.rectangle(VIEW.w / 2, 48, VIEW.w - 40, 1, era.color);
    this.add.rectangle(VIEW.w / 2, VIEW.h - 34, VIEW.w - 40, 1, era.color);
    txt(this, 20, 12, 'ARCHIVE', { size: 8, color: era.css });
    this.when = txt(this, VIEW.w - 20, 12, '', { size: 8, color: '#ccc' }).setOrigin(1, 0);
    this.title = txt(this, 20, 28, '', { size: 8 });
    this.body = txt(this, 20, 58, '', { font: 'read', size: 16, wrap: VIEW.w - 40 });
    this.source = txt(this, 20, VIEW.h - 30, '', { font: 'read', size: 14, color: '#999', wrap: VIEW.w - 130 });
    this.more = txt(this, VIEW.w - 20, VIEW.h - 12, '', { size: 8, color: era.css }).setOrigin(1, 1);
    this.tweens.add({ targets: this.more, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
    audio.playMusic('archive', 0);
    this.show();
    this.ready = this.time.now + 400;
  }
  show() {
    const c = this.cards[this.i];
    this.when.setText(`${c.when ?? ''}${c.where ? ' · ' + c.where : ''}`.toUpperCase());
    this.title.setText(c.title.toUpperCase());
    this.body.setText('');
    this.typed = 0;
    this.full = c.text;
    this.source.setText(c.source ? `Source: ${c.source}` : '');
    this.more.setText(this.i < this.cards.length - 1 ? 'NEXT >' : this.which === 'before' ? 'BEGIN >' : 'CONTINUE >');
  }
  update(_t, dms) {
    if (!this.controls) return;
    if (this.typed < this.full.length) {
      this.typed = Math.min(this.full.length, this.typed + dms * 0.06);
      this.body.setText(this.full.slice(0, Math.floor(this.typed)));
    }
    const hit = anyDevice(this.controls);
    if (!hit || hit.nav || this.time.now < this.ready) return;
    if (this.typed < this.full.length) { this.typed = this.full.length; this.body.setText(this.full); return; }
    audio.sfx('uiMove');
    this.i++;
    if (this.i < this.cards.length) this.show();
    else this.next();
  }
  next() {
    if (this.which === 'before') this.scene.start('Level', { levelId: this.levelId });
    else this.scene.start('Timeline');
  }
}

export class ResultsScene extends Phaser.Scene {
  constructor() { super('Results'); }
  init(data) { this.data_ = data; }
  create() {
    const { levelId, result, stats } = this.data_;
    const level = LEVELS[levelId];
    const era = ERAS[level.era];
    this.controls = new Controls(this);
    starfield(this);
    txt(this, VIEW.w / 2, 30, result === 'history' ? 'AS HISTORY RECORDS' : 'MISSION COMPLETE', { size: 16, color: era.css }).setOrigin(0.5);
    txt(this, VIEW.w / 2, 54, level.title.toUpperCase(), { size: 8 }).setOrigin(0.5);
    const secs = Math.round((Date.now() - stats.start) / 1000);
    txt(this, VIEW.w / 2, 74, `TIME ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}   ${DIFFICULTY[session.difficulty].label.toUpperCase()}`, { size: 8, color: '#bbb' }).setOrigin(0.5);
    session.players.forEach((_, i) => {
      const x = session.players.length === 1 ? VIEW.w / 2 : VIEW.w * (0.3 + i * 0.4);
      txt(this, x, 104, `P${i + 1}`, { size: 8, color: era.css }).setOrigin(0.5);
      txt(this, x, 120, `KILLS ${stats.kills[i]}`, { size: 8 }).setOrigin(0.5);
      txt(this, x, 134, `MEDALS ${stats.medals[i].length}`, { size: 8 }).setOrigin(0.5);
      const best = [...new Set(stats.medals[i])].slice(-3).join('\n');
      txt(this, x, 150, best, { size: 8, color: '#ffd27a', align: 'center' }).setOrigin(0.5, 0);
    });
    const c = txt(this, VIEW.w / 2, VIEW.h - 20, 'CONTINUE >', { size: 8 }).setOrigin(0.5);
    this.tweens.add({ targets: c, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
    this.ready = this.time.now + 800;
    audio.setIntensity(0);
  }
  update() {
    const hit = anyDevice(this.controls);
    if (hit && !hit.nav && this.time.now > this.ready) {
      audio.sfx('ui');
      this.scene.start('Archive', { levelId: this.data_.levelId, which: 'after' });
    }
  }
}

export class PauseScene extends Phaser.Scene {
  constructor() { super('Pause'); }
  init(data) { this.level = data.level; }
  create() {
    this.controls = new Controls(this);
    this.add.rectangle(0, 0, VIEW.w, VIEW.h, 0x000000, 0.7).setOrigin(0);
    txt(this, VIEW.w / 2, 40, 'PAUSED', { size: 16 }).setOrigin(0.5);
    this.options = ['RESUME', 'RESTART CHECKPOINT', 'CONTROLS', 'QUIT TO TIMELINE'];
    this.sel = 0;
    this.items = this.options.map((o, i) => txt(this, VIEW.w / 2, 80 + i * 18, o, { size: 8 }).setOrigin(0.5));
    const help = 'Change any button under CONTROLS.';
    txt(this, VIEW.w / 2, 170, help, { font: 'read', size: 16, color: '#aaa', align: 'center' }).setOrigin(0.5, 0);
    this.ready = this.time.now + 250;
    this.refresh();
  }
  refresh() {
    this.items.forEach((t, i) => t.setColor(i === this.sel ? this.level.era.css : '#ffffff').setText((i === this.sel ? '> ' : '') + this.options[i]));
  }
  update() {
    if (this.time.now < this.ready) return;
    const hit = anyDevice(this.controls);
    if (!hit) return;
    const s = hit.s;
    if (s.pressed.up || s.pressed.down) {
      this.sel = (this.sel + (s.pressed.down ? 1 : this.options.length - 1)) % this.options.length;
      audio.sfx('uiMove');
      return this.refresh();
    }
    if (s.pressed.pause || ((s.pressed.jump || s.pressed.fire) && this.sel === 0)) {
      this.scene.stop();
      return this.scene.resume('Level');
    }
    if (s.pressed.jump || s.pressed.fire) {
      if (this.sel === 2) {
        this.scene.sleep();
        this.scene.launch('Controls', { returnTo: 'Pause' });
        return;
      }
      this.scene.stop();
      if (this.sel === 1) return this.level.restart();
      this.scene.stop('Hud');
      this.scene.stop('Level');
      this.scene.start('Timeline');
    }
  }
}
