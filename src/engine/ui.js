// Text and small UI helpers. Two bundled OFL fonts: 'Press Start 2P' for titles and
// labels, 'VT323' for reading text (Archive cards, subtitles).

import { HD } from './config.js';

// Every scene calls this first: zoom the camera so world units map to HD× pixels.
// The origin is the top-left corner, so scrollX/scrollY are the visible area's top-left
// in world units. Phaser computes worldView as if zooming about the centre, which
// puts it half a screen off with this origin (tile layers culled the left half of the
// screen). The patched preRender corrects it every frame.
export function hdCamera(scene) {
  const cam = scene.cameras.main.setZoom(HD).setOrigin(0, 0);
  const preRender = cam.preRender;
  cam.preRender = function () {
    preRender.call(this);
    this.worldView.setTo(this.scrollX, this.scrollY, this.width / this.zoomX, this.height / this.zoomY);
  };
}

export const FONT = { pixel: '"Press Start 2P"', read: 'VT323' };

export function txt(scene, x, y, str, { size = 8, color = '#ffffff', font = 'pixel', align = 'left', wrap = 0, stroke = true } = {}) {
  const t = scene.add.text(x, y, str, {
    fontFamily: FONT[font],
    fontSize: `${size}px`,
    color,
    align,
    wordWrap: wrap ? { width: wrap } : undefined,
    stroke: stroke ? '#000000' : undefined,
    strokeThickness: stroke ? (font === 'pixel' ? 2 : 3) : 0,
    lineSpacing: font === 'read' ? -2 : 3,
  });
  t.setResolution(HD);
  return t;
}

export function bar(g, x, y, w, h, frac, color, back = 0x000000) {
  g.fillStyle(back, 0.6).fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle(color, 1).fillRect(x, y, Math.max(0, Math.round(w * Math.min(1, frac))), h);
  const fw = Math.max(0, Math.round(w * Math.min(1, frac)));
  g.fillStyle(0xffffff, 0.45).fillRect(x, y, fw, 1);
  if (h > 2) g.fillStyle(0x000000, 0.3).fillRect(x, y + h - 1, fw, 1);
}

// Fades out, then switches scene. Every menu screen fades in on create, so moving
// between screens never cuts abruptly.
export function go(scene, key, data) {
  if (scene.leaving) return;
  scene.leaving = true;
  scene.cameras.main.fadeOut(220, 0, 0, 0);
  scene.cameras.main.once('camerafadeoutcomplete', () => scene.scene.start(key, data));
}
