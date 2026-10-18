// Controls: rebind every action per keyboard layout or controller, with a live tester.
// Opened from the title menu or the pause menu (data.returnTo). With data.wizard set to
// a device, it walks through every action in turn (first-time setup for a controller
// the browser doesn't recognize).

import Phaser from 'phaser';
import { VIEW } from '../engine/config.js';
import { txt, go, hdCamera } from '../engine/ui.js';
import { menuBackdrop, ornatePanel, header, selectBar } from '../engine/menuart.js';
import { audio } from '../engine/audio.js';
import { Controls, ACTIONS, bindingStore, bindingLabel } from '../engine/input.js';

const NAMES = { up: 'UP / AIM UP', down: 'DOWN / CROUCH', left: 'LEFT', right: 'RIGHT', jump: 'JUMP', fire: 'FIRE', ability: 'ABILITY', grenade: 'GRENADE', swap: 'SWAP WEAPON', melee: 'MELEE', pause: 'PAUSE' };
const KC = Phaser.Input.Keyboard.KeyCodes;

export class ControlsScene extends Phaser.Scene {
  constructor() { super('Controls'); }

  init(data) {
    this.returnTo = data?.returnTo ?? 'Title';
    this.wizard = data?.wizard ?? null;
  }

  create() {
    hdCamera(this);
    this.leaving = false;
    this.cameras.main.fadeIn(220);
    this.controls = new Controls(this);
    menuBackdrop(this);
    ornatePanel(this, 40, 31, VIEW.w - 80, 200);
    header(this, this.wizard ? 'SET UP YOUR CONTROLLER' : 'CONTROLS', 16, 0x45e6ff, this.wizard ? 8 : 16);
    this.bar = selectBar(this, 0x45e6ff);
    this.deviceIndex = this.wizard ? Math.max(0, this.controls.devices().indexOf(this.wizard)) : 0;
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
    this.hint = txt(this, VIEW.w / 2, 236, '', { font: 'read', size: 14, color: '#9aa4c8', align: 'center', wrap: VIEW.w - 30 }).setOrigin(0.5, 0);
    this.enter = this.input.keyboard.addKey(KC.ENTER, false);
    this.esc = this.input.keyboard.addKey(KC.ESC, false);
    this.input.keyboard.on('keydown', (e) => this.onKey(e));
    this.refresh();
    if (this.wizard) this.time.delayedCall(300, () => this.startCapture(ACTIONS[0]));
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
    const sel = (r) => (this.row === r ? '#ffffff' : '#9fb0d8');
    const rowY = this.row === 0 ? 36 : this.row <= ACTIONS.length ? 54 + (this.row - 1) * 13 : this.row === ACTIONS.length + 1 ? 202 : 216;
    this.bar.place(52, rowY - 2, VIEW.w - 104, 12);
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
      ? `Press the ${dev.startsWith('kb') ? 'key' : 'button or direction'} for ${NAMES[this.capture.action]}\n(wait 8 seconds to ${this.wizard ? 'keep the current one' : 'cancel'})`
      : 'Up/down: choose · Left/right: device · Jump/Enter: rebind · Esc: back\nButtons light up green when pressed');
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
    const done = this.capture?.action;
    this.capture = null;
    this.cool = this.time.now + 350;
    audio.sfx('checkpoint');
    this.refresh();
    if (this.wizard) this.wizardNext(done);
  }

  // Wizard: move on to the next action; after the last one, return to the menu.
  wizardNext(done) {
    const i = ACTIONS.indexOf(done);
    if (i < ACTIONS.length - 1) {
      this.row = i + 2;
      this.time.delayedCall(250, () => this.startCapture(ACTIONS[i + 1]));
      return;
    }
    this.hint.setText('All set! You can change these any time under CONTROLS.');
    this.time.delayedCall(1500, () => this.back());
  }

  back() {
    audio.sfx('uiMove');
    if (this.scene.isSleeping(this.returnTo)) {
      this.scene.stop();
      this.scene.wake(this.returnTo);
    } else {
      go(this, this.returnTo);
    }
  }

  update() {
    if (!this.controls.armed()) return;
    const c = this.capture;
    if (c) {
      if (this.time.now > c.until) {
        // Timed out: keep the current binding (the wizard moves on).
        this.capture = null;
        this.refresh();
        if (this.wizard) this.wizardNext(c.action);
        return;
      }
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
      else this.rows[i].name.setColor(this.row === i + 1 ? '#ffffff' : '#9fb0d8');
    });

    if (this.time.now < this.cool || this.wizard) return;
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
