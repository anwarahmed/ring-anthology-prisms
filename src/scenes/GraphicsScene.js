// Graphics: art style, CRT emulation and the FPS counter. Opened from the title menu or
// the pause menu (data.returnTo). CRT changes show at once (the effect is drawn over
// the whole screen, this menu included); a new art style reloads the page, because
// the art is generated when the game starts.

import Phaser from 'phaser';
import { VIEW, STYLE, STYLES } from '../engine/config.js';
import { txt, go, hdCamera, bar } from '../engine/ui.js';
import { audio } from '../engine/audio.js';
import { Controls } from '../engine/input.js';
import { graphics, CRT_PRESETS, PRESET_NAMES } from '../engine/graphics.js';
import { menuBackdrop, ornatePanel, header, selectBar } from '../engine/menuart.js';

const STYLE_NAMES = { prerendered: 'PRE-RENDERED', hybrid: 'HYBRID', pixel: 'PIXEL ART' };
const PRESETS = ['off', 'subtle', 'arcade', 'tv'];
const MASKS = ['aperture', 'slot', 'shadow'];
const MASK_NAMES = { aperture: 'APERTURE GRILLE', slot: 'SLOT MASK', shadow: 'SHADOW MASK' };
const KC = Phaser.Input.Keyboard.KeyCodes;

// Rows: a label, how to show the value, and how left/right changes it.
const ROWS = [
  { label: 'ART STYLE', kind: 'style' },
  { label: 'CRT PRESET', kind: 'preset' },
  { label: 'SCANLINES', key: 'scanlines' },
  { label: 'PHOSPHOR MASK', key: 'mask' },
  { label: 'MASK TYPE', kind: 'maskType' },
  { label: 'BLOOM / HALATION', key: 'bloom' },
  { label: 'PIXEL SOFTENING', key: 'soften' },
  { label: 'CURVATURE', key: 'curvature' },
  { label: 'VIGNETTE', key: 'vignette' },
  { label: 'CONVERGENCE', key: 'convergence' },
  { label: 'PERSISTENCE', key: 'persistence' },
  { label: 'NOISE', key: 'noise' },
  { label: 'SHOW FPS', kind: 'fps' },
  { label: 'BACK', kind: 'back' },
];

const cycle = (list, v, d) => list[(list.indexOf(v) + d + list.length) % list.length];

export class GraphicsScene extends Phaser.Scene {
  constructor() { super('Graphics'); }

  init(data) {
    this.returnTo = data?.returnTo ?? 'Title';
  }

  create() {
    hdCamera(this);
    this.leaving = false;
    this.cameras.main.fadeIn(220);
    this.controls = new Controls(this);
    this.style = STYLE;
    // A test pattern behind the menu, so CRT changes are easy to judge.
    menuBackdrop(this);
    ornatePanel(this, 40, 27, VIEW.w - 80, 190);
    this.bar = selectBar(this, 0x45e6ff);
    const g = this.add.graphics();
    [0xffffff, 0xffd23a, 0x45e6ff, 0x5fd35f, 0xd04fd0, 0xe0453a, 0x3f6cf5].forEach((c, i) => g.fillStyle(c, 0.9).fillRect(16 + i * 18, VIEW.h - 30, 16, 20));
    for (let i = 0; i < 8; i++) g.fillStyle(0x111111 * (i * 2 + 1), 1).fillRect(VIEW.w - 160 + i * 18, VIEW.h - 30, 16, 20);
    header(this, 'GRAPHICS', 14, 0x45e6ff);
    this.rows = ROWS.map((r, i) => ({
      ...r,
      name: txt(this, 60, 34 + i * 13, r.label, { size: 8 }),
      value: txt(this, VIEW.w - 60, 34 + i * 13, '', { size: 8 }).setOrigin(1, 0),
    }));
    this.bars = this.add.graphics();
    this.hint = txt(this, VIEW.w / 2, VIEW.h - 50, '', { font: 'read', size: 14, color: '#8899aa', align: 'center' }).setOrigin(0.5, 0);
    this.row = 0;
    this.enter = this.input.keyboard.addKey(KC.ENTER, false);
    this.esc = this.input.keyboard.addKey(KC.ESC, false);
    this.refresh();
  }

  refresh() {
    this.bars.clear();
    this.rows.forEach((r, i) => {
      const on = i === this.row;
      r.name.setColor(on ? '#ffffff' : '#9fb0d8');
      if (on) this.bar.place(52, 34 + i * 13 - 2, VIEW.w - 104, 12);
      let v = '';
      if (r.kind === 'style') v = `< ${STYLE_NAMES[this.style]} >`;
      else if (r.kind === 'preset') v = `< ${PRESET_NAMES[graphics.preset].toUpperCase()} >`;
      else if (r.kind === 'maskType') v = `< ${MASK_NAMES[graphics.maskType]} >`;
      else if (r.kind === 'fps') v = graphics.fps ? '< ON >' : '< OFF >';
      else if (r.key) {
        v = `${Math.round(graphics[r.key] * 10)}`;
        bar(this.bars, VIEW.w - 150, 36 + i * 13, 70, 4, graphics[r.key], on ? 0x45e6ff : 0x8899aa);
      }
      r.value.setText(v).setColor(on ? '#ffffff' : '#9fb0d8');
    });
    const r = this.rows[this.row];
    this.hint.setText(
      r.kind === 'style' ? (this.style === STYLE ? 'LEFT / RIGHT to choose how the game is drawn.' : 'Press JUMP to restart the game in this style.')
        : r.kind === 'back' ? 'Settings are saved in this browser.'
          : 'LEFT / RIGHT to change.',
    );
  }

  change(d) {
    const r = this.rows[this.row];
    if (r.kind === 'style') this.style = cycle(STYLES, this.style, d);
    else if (r.kind === 'preset') graphics.setPreset(cycle(PRESETS, CRT_PRESETS[graphics.preset] ? graphics.preset : 'off', d));
    else if (r.kind === 'maskType') {
      graphics.maskType = cycle(MASKS, graphics.maskType, d);
      graphics.preset = 'custom';
    } else if (r.kind === 'fps') graphics.fps = !graphics.fps;
    else if (r.key) {
      graphics[r.key] = Math.round(Math.min(1, Math.max(0, graphics[r.key] + d * 0.1)) * 10) / 10;
      graphics.preset = 'custom';
    } else return;
    graphics.save();
    audio.sfx('uiMove');
    this.refresh();
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
    if (!this.controls.armed() || this.leaving) return;
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
    const n = this.rows.length;
    const r = this.rows[this.row];
    if (nav === 'up' || nav === 'down') {
      this.row = (this.row + (nav === 'down' ? 1 : n - 1)) % n;
      audio.sfx('uiMove');
      return this.refresh();
    }
    if (nav === 'left' || nav === 'right') return this.change(nav === 'right' ? 1 : -1);
    if (nav === 'back' || r.kind === 'back') return this.back();
    if (r.kind === 'style' && this.style !== STYLE) {
      graphics.style = this.style;
      graphics.save();
      // Reload without any ?style= so the saved choice applies.
      window.location.href = window.location.pathname;
      return;
    }
    this.change(1);
  }
}
