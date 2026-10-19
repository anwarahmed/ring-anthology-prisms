// The level's backdrop (sky, ring, mountains, distant ships), drawn in its own scene
// under the level. The level camera is zoomed in (WORLD_ZOOM) so the world reads big;
// the backdrop keeps the unzoomed camera, so its art stays sharp and framed as painted.
// It follows the level camera's scroll every frame. Launched and stopped by LevelScene.

import Phaser from 'phaser';
import { VIEW } from '../engine/config.js';
import { hdCamera } from '../engine/ui.js';
import { baseTextures } from '../engine/textures.js';
import { buildBackdrop } from '../engine/backdrop.js';
import { gradeCamera } from '../engine/fx.js';

export class BackdropScene extends Phaser.Scene {
  constructor() { super('Backdrop'); }

  init(data) {
    this.level = data.level;
  }

  create() {
    hdCamera(this);
    baseTextures(this);
    const L = this.level;
    buildBackdrop(this, L.theme, L.worldW);
    gradeCamera(this.cameras.main, this, L.theme.grade);
    // Level hooks light up the backdrop's ring halos (1d, 1e).
    L.halos = this.halos;
    this.sync();
  }

  // Centered on the same world point as the level camera: parallax layers line up
  // with the world, and the sky keeps its framing.
  sync() {
    const lc = this.level.cameras?.main;
    if (!lc) return;
    const v = lc.worldView;
    this.cameras.main.setScroll(v.centerX - VIEW.w / 2, Math.max(0, v.bottom - VIEW.h));
  }

  update() {
    this.sync();
  }
}
