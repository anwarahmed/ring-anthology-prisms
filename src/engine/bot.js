// A simple autopilot for smoke tests and playtests (?bot=1): it pushes right, shoots the
// nearest enemy, jumps over walls and uses its ability now and then. It proves a level
// can be finished; it is not meant to play well.

import { nearest } from './ai.js';

export function makeBot(scene, player) {
  let jumpHeld = 0;
  let stuck = 0;
  let lastX = player.x;
  return () => {
    const s = { x: 1, y: 0, aimX: 0, aimY: 0, stick: false, jump: false, fire: false, ability: false, grenade: false, swap: false, melee: false, pause: false };
    if (!player.alive) return s;
    const n = nearest(player, scene, 320);
    if (n) {
      s.stick = true;
      s.aimX = n.t.x - player.x;
      s.aimY = n.t.y - player.y;
      s.fire = true;
      s.x = n.d < 90 ? -Math.sign(s.aimX) * 0.6 : Math.sign(s.aimX);
      s.grenade = Math.random() < 0.004;
      s.melee = n.d < 24;
    }
    if (scene.arena && player.x > scene.arena.x1 - 40) s.x = n ? s.x : -1;
    stuck = Math.abs(player.x - lastX) < 0.5 ? stuck + 1 : 0;
    lastX = player.x;
    const t = scene.layer.getTileAtWorldXY(player.x + Math.sign(s.x || 1) * 12, player.y);
    if ((t && t.index <= 1) || stuck > 20 || Math.random() < 0.01) jumpHeld = 18;
    if (jumpHeld > 0) { s.jump = true; jumpHeld--; }
    s.ability = Math.random() < 0.01;
    return s;
  };
}
