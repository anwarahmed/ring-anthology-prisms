// Skulls: switch the fun modifiers (src/engine/skulls.js) on and off. Opened from the
// title menu.

import Phaser from 'phaser';
import { VIEW } from '../engine/config.js';
import { txt, go, hdCamera } from '../engine/ui.js';
import { audio } from '../engine/audio.js';
import { Controls } from '../engine/input.js';
import { menuBackdrop, ornatePanel, header, selectBar } from '../engine/menuart.js';
import { SKULLS, skulls } from '../engine/skulls.js';

const KC = Phaser.Input.Keyboard.KeyCodes;

export class SkullsScene extends Phaser.Scene {
  constructor() { super('Skulls'); }

  create() {
    hdCamera(this);
    this.leaving = false;
    this.cameras.main.fadeIn(220);
    this.controls = new Controls(this);
    menuBackdrop(this, 0xffd27a);
    header(this, 'SKULLS', 18, 0xffd27a);
    ornatePanel(this, 50, 42, VIEW.w - 100, 162, 0xffd27a);
    this.bar = selectBar(this, 0xffd27a);
    this.rows = [...SKULLS, { id: 'back', name: 'BACK' }].map((k, i) => ({
      ...k,
      name: txt(this, 70, 56 + i * 36, k.name, { size: 8 }),
      value: k.text ? txt(this, VIEW.w - 70, 56 + i * 36, '', { size: 8 }).setOrigin(1, 0) : null,
      about: k.text ? txt(this, 70, 69 + i * 36, k.text, { font: 'read', size: 14, color: '#9aa4c8' }) : null,
    }));
    txt(this, VIEW.w / 2, 212, 'Skulls change how every level plays. Turn them off any time.', { font: 'read', size: 14, color: '#c8d0e8', align: 'center' }).setOrigin(0.5, 0);
    this.row = 0;
    this.enter = this.input.keyboard.addKey(KC.ENTER, false);
    this.esc = this.input.keyboard.addKey(KC.ESC, false);
    this.refresh();
  }

  refresh() {
    this.rows.forEach((r, i) => {
      const on = i === this.row;
      r.name.setColor(on ? '#ffffff' : '#c8b88a');
      if (on) this.bar.place(62, 56 + i * 36 - 4, VIEW.w - 124, r.about ? 30 : 14);
      r.value?.setText(skulls.has(r.id) ? 'ON' : 'OFF').setColor(skulls.has(r.id) ? '#ffd27a' : '#6a6f88');
    });
  }

  update() {
    if (!this.controls.armed() || this.leaving) return;
    let nav = null;
    for (const d of this.controls.devices()) {
      const s = this.controls.read(d);
      if (s.pressed.up) nav = 'up';
      else if (s.pressed.down) nav = 'down';
      else if (s.pressed.left || s.pressed.right || s.pressed.jump || s.pressed.fire) nav = 'ok';
      else if (s.pressed.pause) nav = 'back';
    }
    if (Phaser.Input.Keyboard.JustDown(this.enter)) nav = 'ok';
    if (Phaser.Input.Keyboard.JustDown(this.esc)) nav = 'back';
    if (!nav) return;
    const r = this.rows[this.row];
    if (nav === 'up' || nav === 'down') {
      this.row = (this.row + (nav === 'down' ? 1 : this.rows.length - 1)) % this.rows.length;
    } else if (nav === 'back' || r.id === 'back') {
      audio.sfx('uiMove');
      return go(this, 'Title');
    } else {
      skulls.toggle(r.id);
      audio.sfx(skulls.has(r.id) ? 'party' : 'uiMove');
    }
    audio.sfx('uiMove');
    this.refresh();
  }
}
