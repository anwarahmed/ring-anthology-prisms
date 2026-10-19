// The prologue (before the first level, once) and the epilogue (after the last level):
// full-screen animated beats from src/content/saga.js, each the theme's backdrop with
// heroes and motifs (src/engine/vignette.js) over a letterboxed caption. Any button
// moves on; PAUSE skips the rest. The epilogue ends on a grand finale.
// data: { which: 'prologue' | 'epilogue', i, then: [sceneKey, data] }

import Phaser from 'phaser';
import { VIEW, ERAS, LEGAL_NOTICE } from '../engine/config.js';
import { txt, go, hdCamera } from '../engine/ui.js';
import { Controls } from '../engine/input.js';
import { audio } from '../engine/audio.js';
import { baseTextures } from '../engine/textures.js';
import { buildBackdrop } from '../engine/backdrop.js';
import { gradeCamera } from '../engine/fx.js';
import { Vignette } from '../engine/vignette.js';
import { spaceSky, ringHalves, planetHorizon, prismTexture, logoText } from '../engine/titleart.js';
import { emblem } from '../engine/menuart.js';
import { SAGA } from '../content/saga.js';
import { THEMES } from '../content/themes.js';
import { session } from '../engine/session.js';
import { anyDevice } from './menus.js';

const BAR = 74; // caption bar height

export class SagaScene extends Phaser.Scene {
  constructor() { super('Saga'); }

  init(data) {
    this.which = data.which;
    this.i = data.i ?? 0;
    this.then = data.then ?? ['Timeline', {}];
    this.beat = SAGA[this.which][this.i];
  }

  create() {
    hdCamera(this);
    this.leaving = false;
    this.cameras.main.fadeIn(500);
    this.controls = new Controls(this);
    baseTextures(this);
    if (this.i === 0) audio.playMusic(this.which, 0, { fallback: this.which === 'prologue' ? 'archive' : 'title' });
    this.vignette = null;
    if (this.beat.finale) this.finale();
    else this.scene_();
    this.ready = this.time.now + 700;
  }

  scene_() {
    const b = this.beat;
    const era = ERAS[b.era];
    buildBackdrop(this, THEMES[b.theme], VIEW.w);
    gradeCamera(this.cameras.main, this);
    this.vignette = new Vignette(this, { x: 0, y: 0, w: VIEW.w, h: VIEW.h - BAR }, b, { scale: 1.6, frame: false });
    this.vignette.enter('before');
    this.vignette.setCard(b);
    const bars = this.add.graphics().setDepth(10);
    bars.fillStyle(0x000000, 0.92).fillRect(0, VIEW.h - BAR, VIEW.w, BAR);
    bars.fillStyle(era.color, 0.9).fillRect(0, VIEW.h - BAR, VIEW.w, 1);
    emblem(this, b.era, 18, VIEW.h - BAR + 13, 4).setDepth(11);
    const title = txt(this, 28, VIEW.h - BAR + 9, b.title.toUpperCase(), { size: 8, color: era.css }).setDepth(11);
    const step = txt(this, VIEW.w - 12, VIEW.h - BAR + 9, `${this.i + 1} / ${SAGA[this.which].length - (SAGA[this.which].at(-1).finale ? 1 : 0)}`, { size: 8, color: '#777' }).setOrigin(1, 0).setDepth(11);
    this.body = txt(this, 12, VIEW.h - BAR + 24, '', { font: 'read', size: 16, wrap: VIEW.w - 24 }).setDepth(11);
    txt(this, 12, VIEW.h - 13, b.source ? `Source: ${b.source}` : '', { font: 'read', size: 12, color: '#888' }).setDepth(11);
    for (const t of [title, step]) { t.setAlpha(0); this.tweens.add({ targets: t, alpha: 1, duration: 600 }); }
    this.full = b.text;
    this.typed = 0;
  }

  // The grand finale: the title's ring over a planet, every era's light from the prism,
  // the heroes of each era lined up, and THE END.
  finale() {
    spaceSky(this);
    gradeCamera(this.cameras.main, this);
    const ring = ringHalves(this);
    const back = this.add.image(VIEW.w / 2, 132, ring.back).setScale(ring.scale * 0.6).setAlpha(0);
    this.add.image(0, VIEW.h - 90, planetHorizon(this)).setOrigin(0);
    const front = this.add.image(VIEW.w / 2, 132, ring.front).setScale(ring.scale * 0.6).setAlpha(0);
    this.tweens.add({ targets: [back, front], alpha: 1, scale: ring.scale, duration: 4000, ease: 'Cubic.Out' });
    this.tweens.add({ targets: [back, front], rotation: 0.035, duration: 7000, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay: 4000 });

    // The prism splits a white beam into the four era colors.
    const px = VIEW.w / 2;
    const py = 44;
    const beams = this.add.graphics().setBlendMode('ADD');
    this.add.image(px, py, 'glow').setTint(0x9fd8ff).setBlendMode('ADD').setScale(3.2).setAlpha(0.5);
    this.add.image(px, py, prismTexture(this));
    const colors = Object.values(ERAS).map((e) => e.color);
    let t = 0;
    this.time.addEvent({ delay: 30, loop: true, callback: () => {
      t += 0.03;
      beams.clear();
      beams.lineStyle(2, 0xffffff, 0.7).lineBetween(0, py + 6, px - 6, py);
      colors.forEach((c, k) => {
        const a = (k - 1.5) * 0.12 + Math.sin(t + k) * 0.01;
        beams.lineStyle(2, c, 0.6).lineBetween(px + 6, py, VIEW.w, py + Math.tan(a) * (VIEW.w / 2) + 10);
      });
    } });

    // Heroes of every era, marching in from both sides.
    const heroes = [['didact', 'forerunner'], ['isodidact', 'forerunner'], ['arbiter', 'covenant'], ['master-chief', 'covenant'], ['fred-104', 'created'], ['spartan-iv', 'banished']];
    this.lineup = new Vignette(this, { x: 0, y: 0, w: VIEW.w, h: VIEW.h - 46 }, { players: heroes.map(([id]) => id), theme: null, era: 'covenant' }, { scale: 1.3, frame: false, max: heroes.length });
    this.lineup.heroes.forEach((h, k) => {
      h.home = VIEW.w / 2 + (k - (heroes.length - 1) / 2) * 40;
      h.body.x = k < heroes.length / 2 ? -30 - k * 20 : VIEW.w + 30 + k * 20;
      this.time.delayedCall(1200 + k * 250, () => this.lineup.move(h, h.home, 2600));
    });
    this.lineup.setCard({ title: '', text: '', motifs: ['calm'] });

    const end = this.add.image(VIEW.w / 2, 96, logoText(this, 'logo-end', 'THE END', 24, ['#ffffff', '#9ff4ff', '#3fa9f5', '#9b59d0', '#e0453a'])).setAlpha(0).setScale(1.4);
    this.tweens.add({ targets: end, alpha: 1, scale: 1, duration: 1200, delay: 4200, ease: 'Back.Out' });
    this.time.delayedCall(4300, () => this.cameras.main.flash(400, 255, 255, 255));
    const band = this.add.rectangle(0, VIEW.h - 40, VIEW.w, 40, 0x000000, 0.75).setOrigin(0, 0).setDepth(5).setAlpha(0);
    this.tweens.add({ targets: band, alpha: 1, duration: 1000, delay: 7400 });
    const lines = [
      txt(this, VIEW.w / 2, 118, 'From the Forerunners to Zeta Halo: the whole Archive.', { font: 'read', size: 16, align: 'center' }).setOrigin(0.5),
      txt(this, VIEW.w / 2, 134, 'Thank you for playing Ring Anthology: Prisms.', { font: 'read', size: 16, color: '#9ff4ff', align: 'center' }).setOrigin(0.5),
      txt(this, VIEW.w / 2, VIEW.h - 6, LEGAL_NOTICE, { font: 'read', size: 12, color: '#8899aa', align: 'center', wrap: VIEW.w - 40 }).setOrigin(0.5, 1).setDepth(6),
    ];
    lines.forEach((l, k) => { l.setAlpha(0); this.tweens.add({ targets: l, alpha: 1, duration: 1000, delay: 5600 + k * 900 }); });
    this.full = '';
    this.typed = 0;
    this.ready = this.time.now + 6000;
  }

  update(_t, dms) {
    this.vignette?.update();
    this.lineup?.update();
    if (this.leaving) return;
    if (this.body && this.typed < this.full.length) {
      this.typed = Math.min(this.full.length, this.typed + dms * 0.045);
      this.body.setText(this.full.slice(0, Math.floor(this.typed)));
    }
    const hit = anyDevice(this.controls);
    if (!hit || hit.nav || this.time.now < this.ready) return;
    if (this.body && this.typed < this.full.length) {
      this.typed = this.full.length;
      this.body.setText(this.full);
      return;
    }
    audio.sfx('uiMove');
    const last = this.i >= SAGA[this.which].length - 1;
    if (hit.s.pressed.pause || last) return this.finish();
    this.vignette?.exit('after');
    go(this, 'Saga', { which: this.which, i: this.i + 1, then: this.then });
  }

  finish() {
    if (this.which === 'prologue') session.markSeen('prologue');
    go(this, ...this.then);
  }
}
