// Controls: rebind every action per keyboard layout or controller, with a live tester.
// Opened from the title menu or the pause menu (data.returnTo).

import Phaser from 'phaser';
import { VIEW } from '../engine/config.js';
import { txt } from '../engine/ui.js';
import { audio } from '../engine/audio.js';
import { Controls, ACTIONS, bindingStore, bindingLabel } from '../engine/input.js';

const NAMES = { up: 'UP / AIM UP', down: 'DOWN / CROUCH', left: 'LEFT', right: 'RIGHT', jump: 'JUMP', fire: 'FIRE', ability: 'ABILITY', grenade: 'GRENADE', swap: 'SWAP WEAPON', melee: 'MELEE', pause: 'PAUSE' };
const KC = Phaser.Input.Keyboard.KeyCodes;

export class ControlsScene extends Phaser.Scene {
  constructor() { super('Controls'); }

  init(data) {
    this.returnTo = data?.returnTo ?? 'Title';
  }

  create() {
    this.controls = new Controls(this);
    this.add.rectangle(0, 0, VIEW.w, VIEW.h, 0x05070d, 0.96).setOrigin(0);
    txt(this, VIEW.w / 2, 10, 'CONTROLS', { size: 16 }).setOrigin(0.5, 0);
    this.deviceIndex = 0;
    this.row = 0;
    this.capture = null;
    this.cool = 0;
    this.deviceText = txt(this, VIEW.w / 2, 36, '', { size: 8 }).setOrigin(0.5, 0);
    this.rows = ACTIONS.map((a, i) => ({
      name: txt(this, 70, 54 + i * 13, NAMES[a], { size: 8 }),
      bind: txt(this, VIEW.w - 70, 54 + i * 13, '', { size: 8 }).setOrigin(1, 0),
    }));
    this.resetText = txt(this, VIEW.w / 2, 202, 'RESET TO DEFAULTS', { size: 8 }).setOrigin(0.5, 0);
    this.backText = txt(this, VIEW.w / 2, 216, 'BACK', { size: 8 }).setOrigin(0.5, 0);
    this.hint = txt(this, VIEW.w / 2, 234, '', { font: 'read', size: 16, color: '#8899aa', align: 'center', wrap: VIEW.w - 30 }).setOrigin(0.5, 0);
    this.enter = this.input.keyboard.addKey(KC.ENTER, false);
    this.esc = this.input.keyboard.addKey(KC.ESC, false);
    this.input.keyboard.on('keydown', (e) => this.onKey(e));
    this.refresh();
  }

  get device() {
    const list = this.controls.devices();
    this.deviceIndex = Math.min(this.deviceIndex, list.length - 1);
    return list[this.deviceIndex];
  }

  refresh() {
    const dev = this.device;
    const key = this.controls.storeKey(dev);
    const binds = key ? bindingStore.get(key) : null;
    const sel = (r) => (this.row === r ? '#3fa9f5' : '#ffffff');
    this.deviceText.setText(`< ${this.controls.label(dev).toUpperCase()} >`).setColor(sel(0));
    ACTIONS.forEach((a, i) => {
      const r = this.rows[i];
      const capturing = this.capture?.action === a;
      r.name.setColor(sel(i + 1));
      r.bind.setText(capturing ? 'PRESS...' : binds ? binds[a].map(bindingLabel).join(' / ') : '-');
      r.bind.setColor(capturing ? '#ffd27a' : sel(i + 1));
    });
    this.resetText.setColor(sel(ACTIONS.length + 1));
    this.backText.setColor(sel(ACTIONS.length + 2));
    this.hint.setText(this.capture
      ? `Press the ${dev.startsWith('kb') ? 'key' : 'button or direction'} for ${NAMES[this.capture.action]}\n(wait 8 seconds to cancel)`
      : 'Up/down: choose · Left/right (top row): device · Jump/Enter: rebind · Esc: back\nButtons light up green when pressed');
  }

  onKey(e) {
    if (!this.capture || !this.capture.kb || this.time.now < this.capture.from) return;
    bindingStore.set(this.capture.key, this.capture.action, e.keyCode);
    this.finishCapture();
  }

  startCapture(action) {
    const dev = this.device;
    const key = this.controls.storeKey(dev);
    if (!key) return;
    this.capture = { action, key, kb: dev.startsWith('kb'), pad: dev.startsWith('pad') ? Number(dev.slice(3)) : null, from: this.time.now + 200, until: this.time.now + 8000, base: null };
    audio.sfx('ui');
    this.refresh();
  }

  finishCapture() {
    this.capture = null;
    this.cool = this.time.now + 350;
    audio.sfx('checkpoint');
    this.refresh();
  }

  back() {
    audio.sfx('uiMove');
    if (this.returnTo === 'Pause') {
      this.scene.stop();
      this.scene.wake('Pause');
    } else {
      this.scene.start(this.returnTo);
    }
  }

  update() {
    const c = this.capture;
    if (c) {
      if (this.time.now > c.until) { this.capture = null; this.refresh(); return; }
      if (c.pad !== null && this.time.now > c.from) {
        if (!c.base) {
          if (this.controls.padIdle(c.pad)) c.base = this.controls.snapshot(c.pad);
        } else {
          const b = this.controls.padChange(c.pad, c.base);
          if (b) {
            bindingStore.set(c.key, c.action, b);
            this.finishCapture();
          }
        }
      }
      return;
    }

    // Live tester: light up what the selected device is holding.
    const live = this.controls.raw(this.device);
    ACTIONS.forEach((a, i) => {
      const held = a === 'up' ? live.y < -0.5 : a === 'down' ? live.y > 0.5 : a === 'left' ? live.x < -0.5 : a === 'right' ? live.x > 0.5 : live[a];
      if (held) this.rows[i].name.setColor('#7fe07f');
      else this.rows[i].name.setColor(this.row === i + 1 ? '#3fa9f5' : '#ffffff');
    });

    if (this.time.now < this.cool) return;
    // Navigation: any device, plus Enter/Esc that always work.
    let nav = null;
    for (const d of this.controls.devices()) {
      const s = this.controls.read(d);
      if (s.pressed.up) nav = 'up';
      else if (s.pressed.down) nav = 'down';
      else if (s.pressed.left) nav = 'left';
      else if (s.pressed.right) nav = 'right';
      else if (s.pressed.jump || s.pressed.fire) nav = 'ok';
      else if (s.pressed.pause) nav = 'back';
    }
    if (Phaser.Input.Keyboard.JustDown(this.enter)) nav = 'ok';
    if (Phaser.Input.Keyboard.JustDown(this.esc)) nav = 'back';
    if (!nav) return;
    const last = ACTIONS.length + 2;
    if (nav === 'up') this.row = (this.row + last) % (last + 1);
    if (nav === 'down') this.row = (this.row + 1) % (last + 1);
    if ((nav === 'left' || nav === 'right') && this.row === 0) {
      const n = this.controls.devices().length;
      this.deviceIndex = (this.deviceIndex + (nav === 'right' ? 1 : n - 1)) % n;
    }
    if (nav === 'back') return this.back();
    if (nav === 'ok') {
      if (this.row >= 1 && this.row <= ACTIONS.length) return this.startCapture(ACTIONS[this.row - 1]);
      if (this.row === ACTIONS.length + 1) {
        const key = this.controls.storeKey(this.device);
        if (key) bindingStore.reset(key);
        audio.sfx('ui');
      }
      if (this.row === last) return this.back();
    }
    audio.sfx('uiMove');
    this.refresh();
  }
}
