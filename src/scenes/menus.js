// Menu scenes: Boot, Title, Players (join + difficulty), Timeline (level select),
// Archive (canon story cards), Results and Pause.

import Phaser from 'phaser';
import { VIEW, ERAS, DIFFICULTY, LEGAL_NOTICE } from '../engine/config.js';
import { txt, go, hdCamera } from '../engine/ui.js';
import { Controls, bindingStore } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { session } from '../engine/session.js';
import { baseTextures, hexNum } from '../engine/textures.js';
import { spaceSky, ringHalves, planetHorizon, prismTexture, logoText, ERA_COLORS } from '../engine/titleart.js';
import { buildBackdrop } from '../engine/backdrop.js';
import { gradeCamera } from '../engine/fx.js';
import { menuBackdrop, ornatePanel, header, emblem, selectBar } from '../engine/menuart.js';
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

// Menu background: the painted nebula sky, era-colored glows and twinkling stars.
function starfield(scene, color) {
  return menuBackdrop(scene, color);
}

// An ornate framed panel with an era-colored border.
function panel(scene, x, y, w, h, color = 0x45e6ff) {
  return ornatePanel(scene, x, y, w, h, color);
}

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  async create() {
    hdCamera(this);
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

// The title screen: a ring megastructure over a planet, and the prism logo splitting
// one white beam into the four era colors.
export class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }
  create() {
    hdCamera(this);
    this.leaving = false;
    this.cameras.main.fadeIn(260);
    this.controls = new Controls(this);
    starfield(this);
    gradeCamera(this.cameras.main, this);
    const ring = ringHalves(this);
    const rc = { x: VIEW.w / 2, y: 132 };
    const back = this.add.image(rc.x, rc.y, ring.back).setScale(ring.scale);
    this.add.image(0, VIEW.h - 90, planetHorizon(this)).setOrigin(0);
    this.add.image(VIEW.w / 2, VIEW.h - 74, 'glow').setTint(0x45e6ff).setBlendMode('ADD').setScale(18, 1.2).setAlpha(0.35);
    const front = this.add.image(rc.x, rc.y, ring.front).setScale(ring.scale);
    this.tweens.add({ targets: [back, front], rotation: 0.035, duration: 7000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    // Prism and beams.
    const px = VIEW.w / 2, py = 52;
    this.beams = this.add.graphics().setBlendMode('ADD');
    this.add.image(px, py, 'glow').setTint(0x9fd8ff).setBlendMode('ADD').setScale(3.2).setAlpha(0.5);
    this.add.image(px, py, prismTexture(this));
    this.prism = { x: px, y: py };

    // Logo.
    const sub = this.add.image(VIEW.w / 2, 96, logoText(this, 'logo-sub', 'RING ANTHOLOGY', 8, ['#ffffff', '#b8d8ff', '#7aa0e0']));
    const title = this.add.image(VIEW.w / 2, 124, logoText(this, 'logo-main', 'PRISMS', 32, ['#ffffff', '#9ff4ff', '#3fa9f5', '#9b59d0', '#e0453a']));
    title.setScale(1.6).setAlpha(0);
    this.tweens.add({ targets: title, scale: 1, alpha: 1, duration: 700, ease: 'Back.Out', delay: 200 });
    sub.setAlpha(0);
    this.tweens.add({ targets: sub, alpha: 1, duration: 600, delay: 700 });
    this.time.delayedCall(850, () => this.cameras.main.flash(250, 255, 255, 255));
    this.add.particles(0, 0, 'px', {
      x: { min: VIEW.w / 2 - 90, max: VIEW.w / 2 + 90 }, y: { min: 108, max: 140 },
      lifespan: 700, frequency: 140, scale: { start: 1, end: 0 }, tint: [0xffffff, 0x9ff4ff, 0xffd27a], blendMode: 'ADD',
    });

    // Menu.
    panel(this, VIEW.w / 2 - 66, 158, 132, 56);
    this.bar = selectBar(this, 0x45e6ff);
    this.labels = ['PLAY', 'FIREFIGHT', 'CONTROLS', 'GRAPHICS'];
    this.items = this.labels.map((label, i) => txt(this, VIEW.w / 2, 168 + i * 12, label, { size: 8 }).setOrigin(0.5));
    this.sel = 0;
    this.refreshMenu();
    txt(this, VIEW.w / 2, 224, 'An unofficial Halo fan game', { font: 'read', size: 14, color: '#c8d8ff' }).setOrigin(0.5);
    this.add.rectangle(0, VIEW.h - 22, VIEW.w, 22, 0x05031a, 0.75).setOrigin(0);
    txt(this, VIEW.w / 2, VIEW.h - 2, LEGAL_NOTICE, { font: 'read', size: 11, color: '#8890b8', align: 'center', wrap: VIEW.w - 20, stroke: false }).setOrigin(0.5, 1);
    this.input.once('pointerdown', () => audio.unlock());
    audio.playMusic('title', 0).catch(() => {});
  }
  refreshMenu() {
    this.items.forEach((t, i) => t.setColor(i === this.sel ? '#ffffff' : '#9fb0d8'));
    this.bar.place(VIEW.w / 2 - 60, 168 + this.sel * 12 - 6, 120, 12);
  }
  drawBeams(t) {
    const g = this.beams;
    const { x, y } = this.prism;
    g.clear();
    // The beams run off both edges of the screen.
    const reach = VIEW.w / 2 + 16;
    const inY = y + 4 + (22 / 188) * (reach - 12);
    g.lineStyle(6, 0xffffff, 0.18).lineBetween(x - reach, inY, x - 12, y + 4);
    g.lineStyle(2, 0xffffff, 0.95).lineBetween(x - reach, inY, x - 12, y + 4);
    ERA_COLORS.forEach((c, i) => {
      const y0 = y + 2 + i;
      const ey = y0 + (y - 30 + i * 14 + Math.sin(t / 700 + i) * 2 - y0) * ((reach - 12) / 198);
      g.lineStyle(7, c, 0.22).lineBetween(x + 12, y0, x + reach, ey);
      g.lineStyle(2, c, 1).lineBetween(x + 12, y0, x + reach, ey);
    });
  }
  update(t) {
    this.drawBeams(t);
    const hit = anyDevice(this.controls);
    if (!hit) return;
    audio.unlock();
    if (hit.nav) {
      if (hit.s.pressed.up || hit.s.pressed.down) {
        this.sel = (this.sel + (hit.s.pressed.down ? 1 : this.labels.length - 1)) % this.labels.length;
        audio.sfx('uiMove');
        this.refreshMenu();
      }
      return;
    }
    audio.sfx('ui');
    if (this.sel === 2) return go(this, 'Controls', { returnTo: 'Title' });
    if (this.sel === 3) return go(this, 'Graphics', { returnTo: 'Title' });
    audio.playMusic('title', 0);
    go(this, 'Players', { first: hit.device, next: this.sel === 1 ? 'Firefight' : 'Timeline' });
  }
}

export class PlayersScene extends Phaser.Scene {
  constructor() { super('Players'); }
  init(data) {
    this.first = data.first;
    this.next = data.next ?? 'Timeline';
  }
  create() {
    hdCamera(this);
    this.leaving = false;
    this.cameras.main.fadeIn(260);
    this.controls = new Controls(this);
    starfield(this);
    this.devices = [this.first];
    this.setupDone = new Set();
    this.events.on('wake', () => { this.ready = this.time.now + 400; this.controls.prev = {}; this.controls.prevButtons = {}; });
    this.diffs = Object.keys(DIFFICULTY);
    this.diffIndex = Math.max(0, this.diffs.indexOf(session.difficulty));
    panel(this, 96, 54, 288, 56);
    panel(this, 140, 128, 200, 46, 0xffc23a);
    header(this, 'WHO IS PLAYING?', 26, 0x45e6ff);
    // Player badges: lit when that player has joined.
    this.badges = [0, 1].map((i) => {
      const c = [0x45e6ff, 0xffa23a][i];
      const g = this.add.graphics({ x: 124, y: 70 + i * 26 });
      g.fillStyle(c, 0.25).fillCircle(0, 0, 9);
      g.lineStyle(1, c, 1).strokeCircle(0, 0, 9);
      txt(this, 124, 70 + i * 26, `P${i + 1}`, { size: 8, color: '#ffffff' }).setOrigin(0.5);
      return g;
    });
    this.slots = [0, 1].map((i) => txt(this, 142, 70 + i * 26, '', { size: 8 }).setOrigin(0, 0.5));
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
      t.setText(d ? this.controls.label(d).toUpperCase() : 'PRESS TO JOIN').setColor(d ? '#ffffff' : '#666688');
      this.badges[i].setAlpha(d ? 1 : 0.35);
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
      go(this, this.next);
    }
  }
}

// Level select along the history: Parts left/right, levels up/down.
export class TimelineScene extends Phaser.Scene {
  constructor() { super('Timeline'); }
  init(data) { this.after = data?.after ?? null; }
  create() {
    hdCamera(this);
    this.leaving = false;
    this.cameras.main.fadeIn(260);
    this.controls = new Controls(this);
    this.glows = starfield(this);
    this.partIndex = this.registry.get('partIndex') ?? 0;
    this.levelIndex = this.registry.get('levelIndex') ?? 0;
    // Back from a finished level: point at the next playable level.
    if (this.after) this.selectNextAfter(this.after);
    // Phaser reuses this scene object on every visit: drop everything drawn last time
    // (it was destroyed with the old screen), or the next part change fails.
    this.frame = null;
    this.title = null;
    this.bar = null;
    this.partShown = null;
    this.rows = [];
    this.hint = txt(this, VIEW.w / 2, VIEW.h - 4, 'Up/down: level · Left/right: part · Start: play · Ability: back', { font: 'read', size: 14, color: '#9aa4c8' }).setOrigin(0.5, 1);
    this.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, false);
    this.g = this.add.graphics().setDepth(3);
    // The four eras along the top; the current part's era is lit.
    this.eraMarks = ERA_LIST.map((e, i) => {
      const x = 84 + i * 104;
      const mark = emblem(this, e, x, 40, 5);
      const name = txt(this, x + 10, 40, ERAS[e].name.toUpperCase(), { font: 'read', size: 12, color: ERAS[e].css }).setOrigin(0, 0.5);
      return { e, mark, name };
    });
    audio.playMusic('archive', 0);
    this.draw();
  }
  get selectedId() {
    return CAMPAIGN.parts[this.partIndex]?.levels[this.levelIndex]?.id;
  }
  selectNextAfter(id) {
    const i = ORDER.findIndex((l) => l.id === id);
    const next = ORDER.slice(i + 1).find((l) => LEVELS[l.id] && this.unlocked(l.id));
    if (i < 0 || !next) return;
    CAMPAIGN.parts.forEach((part, pi) => {
      const li = part.levels.findIndex((l) => l.id === next.id);
      if (li >= 0) {
        this.partIndex = pi;
        this.levelIndex = li;
      }
    });
    this.registry.set('partIndex', this.partIndex);
    this.registry.set('levelIndex', this.levelIndex);
  }
  unlocked(id) {
    if (session.debug.all) return true;
    const built = ORDER.filter((l) => LEVELS[l.id]);
    const i = built.findIndex((l) => l.id === id);
    return i === 0 || (i > 0 && session.isDone(built[i - 1].id));
  }
  draw() {
    const part = CAMPAIGN.parts[this.partIndex];
    const era = part.levels[0]?.era ?? 'forerunner';
    const color = ERAS[era]?.color ?? 0x45e6ff;
    if (this.partShown !== this.partIndex) {
      this.partShown = this.partIndex;
      this.title?.destroy();
      this.title = header(this, part.title.toUpperCase(), 18, color, 8);
      this.frame?.destroy();
      this.frame = panel(this, 22, 52, VIEW.w - 44, 200, color).setDepth(1);
      this.bar ??= selectBar(this, color, 2);
      this.bar.setColor(color);
      this.glows.forEach((gl) => gl.setTint(color));
      this.eraMarks.forEach((m) => { const on = m.e === era; m.mark.setAlpha(on ? 1 : 0.35); m.name.setAlpha(on ? 1 : 0.35); });
    }
    this.rows.forEach((r) => r.destroy());
    this.rows = [];
    this.g.clear();
    const first = Math.max(0, Math.min(this.levelIndex - 5, part.levels.length - 11));
    part.levels.slice(first, first + 11).forEach((l, k) => {
      const i = first + k;
      const built = !!LEVELS[l.id];
      const open = built && this.unlocked(l.id);
      const sel = i === this.levelIndex;
      const done = built && session.isDone(l.id);
      const status = !built ? 'COMING SOON' : !open ? 'LOCKED' : done ? 'DONE' : 'PLAY';
      const textColor = sel ? '#ffffff' : open ? '#c8d0e8' : '#5a5f78';
      const y = 60 + k * 17;
      if (sel) this.bar.place(30, y - 2, VIEW.w - 60, 14);
      this.rows.push(emblem(this, l.era, 44, y + 5, 4).setAlpha(open ? 1 : 0.4).setDepth(3));
      this.rows.push(txt(this, 56, y + 1, `${l.id.toUpperCase()}  ${l.title.toUpperCase()}`, { size: 8, color: textColor }).setDepth(3));
      const statusColor = status === 'PLAY' ? ERAS[l.era]?.css : status === 'DONE' ? '#ffd27a' : textColor;
      this.rows.push(txt(this, VIEW.w - 36, y + 1, status === 'DONE' ? '* DONE' : status, { size: 8, color: statusColor }).setOrigin(1, 0).setDepth(3));
    });
    // Scroll hints when the part has more levels than fit.
    if (first > 0) this.g.fillStyle(color, 0.9).fillTriangle(VIEW.w / 2 - 5, 58, VIEW.w / 2 + 5, 58, VIEW.w / 2, 54);
    if (first + 11 < part.levels.length) this.g.fillStyle(color, 0.9).fillTriangle(VIEW.w / 2 - 5, 247, VIEW.w / 2 + 5, 247, VIEW.w / 2, 251);
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
        return go(this, 'Archive', { levelId: l.id, which: 'before' });
      }
    } else if (s.pressed.ability) {
      return go(this, 'Title');
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
    hdCamera(this);
    this.leaving = false;
    this.cameras.main.fadeIn(260);
    if (!this.cards.length) return this.next();
    this.controls = new Controls(this);
    baseTextures(this);
    buildBackdrop(this, THEMES[this.level.theme], VIEW.w);
    gradeCamera(this.cameras.main, this);
    const era = ERAS[this.level.era];
    panel(this, 10, 8, VIEW.w - 20, VIEW.h - 16, era.color).setAlpha(0.95);
    const lines = this.add.graphics();
    for (const y of [46, VIEW.h - 34]) {
      const c = era.color;
      lines.fillGradientStyle(c, c, c, c, 0, 1, 0, 1).fillRect(20, y, (VIEW.w - 40) / 2, 1);
      lines.fillGradientStyle(c, c, c, c, 1, 0, 1, 0).fillRect(VIEW.w / 2, y, (VIEW.w - 40) / 2, 1);
    }
    emblem(this, this.level.era, 26, 19, 5);
    txt(this, 37, 15, 'ARCHIVE', { size: 8, color: era.css });
    this.when = txt(this, VIEW.w - 22, 15, '', { size: 8, color: '#ccc' }).setOrigin(1, 0);
    this.title = null;
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
    this.title?.destroy();
    this.title = header(this, c.title.toUpperCase(), 34, ERAS[this.level.era].color, 8);
    this.body.setText('');
    this.typed = 0;
    this.full = c.text;
    this.source.setText(c.source ? `Source: ${c.source}` : '');
    for (const t of [this.when, this.title.img, this.title.g, this.body, this.source]) {
      t.setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 220 });
    }
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
    if (this.which === 'before') go(this, 'Level', { levelId: this.levelId });
    else go(this, 'Timeline', { after: this.levelId });
  }
}

export class ResultsScene extends Phaser.Scene {
  constructor() { super('Results'); }
  init(data) { this.data_ = data; }
  create() {
    hdCamera(this);
    this.leaving = false;
    this.cameras.main.fadeIn(260);
    const { levelId, result, stats } = this.data_;
    const level = LEVELS[levelId];
    const era = ERAS[level.era];
    this.controls = new Controls(this);
    starfield(this, era.color);
    panel(this, 40, 18, VIEW.w - 80, 214, era.color);
    header(this, this.data_.firefight ? 'FIREFIGHT COMPLETE' : result === 'history' ? 'AS HISTORY RECORDS' : 'MISSION COMPLETE', 34, era.color);
    emblem(this, level.era, VIEW.w / 2 - 4 - level.title.length * 4 - 8, 56, 4);
    txt(this, VIEW.w / 2 - 4, 56, level.title.toUpperCase(), { size: 8 }).setOrigin(0.5);
    const secs = Math.round((Date.now() - stats.start) / 1000);
    txt(this, VIEW.w / 2, 74, `TIME ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}   ${DIFFICULTY[session.difficulty].label.toUpperCase()}`, { size: 8, color: '#bbb' }).setOrigin(0.5);
    session.players.forEach((_, i) => {
      const x = session.players.length === 1 ? VIEW.w / 2 : VIEW.w * (0.3 + i * 0.4);
      ornatePanel(this, x - 70, 92, 140, 106, [0x45e6ff, 0xffa23a][i], { alpha: 0.6 });
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
      if (this.data_.firefight) go(this, 'Firefight');
      else go(this, 'Archive', { levelId: this.data_.levelId, which: 'after' });
    }
  }
}

export class PauseScene extends Phaser.Scene {
  constructor() { super('Pause'); }
  init(data) { this.level = data.level; }
  create() {
    hdCamera(this);
    this.controls = new Controls(this);
    const color = this.level.era.color;
    this.add.rectangle(0, 0, VIEW.w, VIEW.h, 0x000000, 0.55).setOrigin(0);
    panel(this, 110, 22, 260, 200, color);
    header(this, 'PAUSED', 44, color);
    this.bar = selectBar(this, color);
    this.options = ['RESUME', 'RESTART CHECKPOINT', 'CONTROLS', 'GRAPHICS', 'QUIT TO TIMELINE'];
    this.sel = 0;
    this.items = this.options.map((o, i) => txt(this, VIEW.w / 2, 78 + i * 18, o, { size: 8 }).setOrigin(0.5));
    const help = 'Change buttons under CONTROLS, and screen effects under GRAPHICS.';
    txt(this, VIEW.w / 2, 172, help, { font: 'read', size: 14, color: '#9aa4c8', align: 'center', wrap: 230 }).setOrigin(0.5, 0);
    this.ready = this.time.now + 250;
    this.refresh();
  }
  refresh() {
    this.items.forEach((t, i) => t.setColor(i === this.sel ? '#ffffff' : '#9fb0d8'));
    this.bar.place(130, 78 + this.sel * 18 - 7, 220, 14);
  }
  update() {
    if (!this.controls.armed() || this.time.now < this.ready) return;
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
      if (this.sel === 2 || this.sel === 3) {
        this.scene.sleep();
        this.scene.launch(this.sel === 2 ? 'Controls' : 'Graphics', { returnTo: 'Pause' });
        return;
      }
      this.scene.stop();
      if (this.sel === 1) return this.level.restart();
      this.scene.stop('Hud');
      this.scene.stop('Level');
      this.scene.start(this.level.firefight ? 'Firefight' : 'Timeline');
    }
  }
}

// Firefight: pick a map. A map unlocks when its campaign level is completed.
export class FirefightScene extends Phaser.Scene {
  constructor() { super('Firefight'); }
  create() {
    hdCamera(this);
    this.leaving = false;
    this.cameras.main.fadeIn(260);
    this.controls = new Controls(this);
    this.glows = starfield(this, 0xe0453a);
    header(this, 'FIREFIGHT', 18, 0xe0453a);
    txt(this, VIEW.w / 2, 34, '3 rounds of 5 waves. A boss waits at the end.', { font: 'read', size: 14, color: '#c8b8b8' }).setOrigin(0.5, 0);
    panel(this, 22, 52, VIEW.w - 44, 200, 0xe0453a).setDepth(1);
    this.bar = selectBar(this, 0xe0453a, 2);
    this.maps = ORDER.filter((l) => LEVELS[l.id]);
    this.sel = Math.min(this.registry.get('ffIndex') ?? 0, this.maps.length - 1);
    this.rows = [];
    this.g = this.add.graphics().setDepth(3);
    txt(this, VIEW.w / 2, VIEW.h - 4, 'Up/down: map · Start: fight · Ability: back', { font: 'read', size: 14, color: '#9aa4c8' }).setOrigin(0.5, 1);
    this.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, false);
    audio.playMusic('last-stand', 0);
    this.draw();
  }
  open(id) {
    return session.debug.all || session.isDone(id);
  }
  draw() {
    this.rows.forEach((r) => r.destroy());
    this.rows = [];
    this.g.clear();
    const first = Math.max(0, Math.min(this.sel - 5, this.maps.length - 11));
    this.maps.slice(first, first + 11).forEach((l, k) => {
      const i = first + k;
      const open = this.open(l.id);
      const y = 60 + k * 17;
      if (i === this.sel) this.bar.place(30, y - 2, VIEW.w - 60, 14);
      this.rows.push(emblem(this, l.era, 44, y + 5, 4).setAlpha(open ? 1 : 0.4).setDepth(3));
      this.rows.push(txt(this, 56, y + 1, `${l.id.toUpperCase()}  ${LEVELS[l.id].title.toUpperCase()}`, { size: 8, color: i === this.sel ? '#ffffff' : open ? '#c8d0e8' : '#5a5f78' }).setDepth(3));
      this.rows.push(txt(this, VIEW.w - 36, y + 1, open ? 'FIGHT' : 'FINISH THE LEVEL', { size: 8, color: open ? '#ff8a6a' : '#5a5f78' }).setOrigin(1, 0).setDepth(3));
    });
    if (first > 0) this.g.fillStyle(0xe0453a, 0.9).fillTriangle(VIEW.w / 2 - 5, 58, VIEW.w / 2 + 5, 58, VIEW.w / 2, 54);
    if (first + 11 < this.maps.length) this.g.fillStyle(0xe0453a, 0.9).fillTriangle(VIEW.w / 2 - 5, 247, VIEW.w / 2 + 5, 247, VIEW.w / 2, 251);
  }
  update() {
    let s = null;
    for (const d of this.controls.devices()) {
      const r = this.controls.read(d);
      if (Object.values(r.pressed).some(Boolean)) s = r;
    }
    const enter = Phaser.Input.Keyboard.JustDown(this.enter);
    if (!s && !enter) return;
    s = s ?? { pressed: {} };
    if (s.pressed.up || s.pressed.down) {
      this.sel = (this.sel + (s.pressed.down ? 1 : this.maps.length - 1)) % this.maps.length;
      this.registry.set('ffIndex', this.sel);
      audio.sfx('uiMove');
      return this.draw();
    }
    if (s.pressed.pause || enter) {
      const l = this.maps[this.sel];
      if (!this.open(l.id)) return;
      audio.sfx('ui');
      return go(this, 'Level', { levelId: l.id, firefight: true });
    }
    if (s.pressed.ability) return go(this, 'Title');
  }
}
