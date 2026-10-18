// A simple autopilot for smoke tests and playtests (?bot=1): it pushes right, shoots the
// nearest enemy, jumps over walls and uses its ability now and then. It proves a level
// can be finished; it is not meant to play well.

import { nearest } from './ai.js';
import { isSolid } from './tileset.js';

export function makeBot(scene, player) {
  let jumpHeld = 0;
  let stuck = 0;
  let lastX = player.x;
  // Vehicles the bot got stuck in (a ledge too tall to drive up): it leaves them behind.
  const abandoned = new Set();
  // Progress check: where the bot was once a second for the last few seconds.
  const trail = [];
  let frame = 0;
  return () => {
    const s = { x: 1, y: 0, aimX: 0, aimY: 0, stick: false, jump: false, fire: false, ability: false, grenade: false, swap: false, melee: false, pause: false };
    if (!player.alive) return s;
    // Vehicles: climb into a nearby empty seat; once inside, drive right and shoot.
    const v = scene.vehicles?.find((vh) => vh.alive && vh.seatFor() && !abandoned.has(vh) && Math.abs(vh.x - player.x) < 160);
    if (!player.vehicle && v) {
      s.x = Math.sign(v.x - player.x);
      s.swap = Math.abs(v.x - player.x) < 30 && Math.random() < 0.5;
    }
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
    // In a locked arena with nobody in range, go after the nearest enemy anywhere in it.
    if (!n && scene.arena) {
      const far = nearest(player, scene, 900);
      if (far) s.x = Math.sign(far.t.x - player.x) || 1;
      else if (player.x > scene.arena.x1 - 40) s.x = -1;
    }
    const here = (player.vehicle ?? player).x;
    stuck = Math.abs(here - lastX) < 0.5 ? stuck + 1 : 0;
    lastX = here;
    if (++frame % 60 === 0) {
      trail.push(here);
      if (trail.length > 5) trail.shift();
    }
    const going = trail.length < 5 || Math.max(...trail) - Math.min(...trail) > 12;
    if (player.vehicle && (stuck > 150 || !going)) {
      trail.length = 0;
      abandoned.add(player.vehicle);
      s.swap = true;
      stuck = 0;
      return s;
    }
    const t = scene.layer.getTileAtWorldXY(player.x + Math.sign(s.x || 1) * 12, player.y);
    // Jump in bursts: hold up to 18 frames, then release for 6 so the next press counts.
    if (jumpHeld <= -6 && ((t && isSolid(t.index)) || stuck > 20 || Math.random() < 0.01)) jumpHeld = 18;
    if (jumpHeld > 0) s.jump = true;
    jumpHeld--;
    s.ability = Math.random() < 0.01;
    return s;
  };
}
