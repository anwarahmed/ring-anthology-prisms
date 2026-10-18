// Weapon drops: an enemy that dies holding a gun drops it. It bobs and glows for
// DROP_LIFE seconds (blinking near the end); a player who walks over it and doesn't
// already carry that weapon picks it up and switches to it. No limit on how many
// different weapons a player carries; never the same one twice.

import { WEAPONS } from '../content/weapons.js';
import { gunTexture } from './textures.js';
import { hexNum } from './textures.js';
import { audio } from './audio.js';
import { HD } from './config.js';

const DROP_LIFE = 12;
const BLINK = 3;

export function dropWeapon(scene, x, y, weaponId) {
  const w = WEAPONS[weaponId];
  if (!w?.gun) return;
  const img = scene.add.image(x, y, gunTexture(scene, weaponId, w)).setDepth(19).setScale(1 / HD);
  const glow = scene.add.image(x, y, 'glow').setTint(hexNum(w.color)).setBlendMode('ADD').setAlpha(0.5).setDepth(18);
  scene.pickups ??= [];
  scene.pickups.push({ weaponId, img, glow, x, y, vy: -120, born: scene.time.now, floor: null });
}

export function updatePickups(scene, dt) {
  if (!scene.pickups?.length) return;
  const now = scene.time.now;
  scene.pickups = scene.pickups.filter((d) => {
    const age = (now - d.born) / 1000;
    if (age > DROP_LIFE) return remove(d);
    // Fall to the ground once, then bob.
    if (d.floor === null) {
      d.vy += 900 * dt;
      d.y += d.vy * dt;
      const t = scene.layer.getTileAtWorldXY(d.x, d.y + 6);
      if (t && t.collides) {
        d.floor = t.getTop() - 6;
        d.y = d.floor;
      }
      if (d.y > scene.worldH) return remove(d);
    } else {
      d.y = d.floor - 2 + Math.sin(now / 250) * 2;
    }
    d.img.setPosition(d.x, d.y);
    d.glow.setPosition(d.x, d.y);
    const visible = age < DROP_LIFE - BLINK || Math.floor(now / 120) % 2 === 0;
    d.img.setVisible(visible);
    d.glow.setVisible(visible);
    for (const p of scene.players) {
      if (!p.alive || p.vehicle || Math.abs(p.x - d.x) > 16 || Math.abs(p.y - d.y) > 30) continue;
      if (p.addWeapon(d.weaponId)) {
        scene.hud.announce(`${WEAPONS[d.weaponId].name.toUpperCase()}`, '#ffffff');
        audio.sfx('checkpoint');
        return remove(d);
      }
    }
    return true;
  });
}

function remove(d) {
  d.img.destroy();
  d.glow.destroy();
  return false;
}
