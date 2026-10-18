// AI behaviors for units (src/content/units.js `ai`). Each is (unit, dt, scene) => void.
// Units on the players' team (allies) use the same behaviors against enemies.

import { melee } from './combat.js';
import { isSolid, isHazard } from './tileset.js';
import { TILE } from './config.js';

export function targetsFor(unit, scene) {
  return scene.actorList().filter((a) => a.alive && a.team !== unit.team && a.team !== 'neutral' && !a.camo && !a.vehicle);
}

export function nearest(unit, scene, maxD = 9999) {
  let best = null;
  let bestD = maxD;
  for (const a of targetsFor(unit, scene)) {
    const d = Math.hypot(a.x - unit.x, a.y - unit.y);
    if (d < bestD) { best = a; bestD = d; }
  }
  return best ? { t: best, d: bestD } : null;
}

export function lineOfSight(scene, x1, y1, x2, y2) {
  const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 8);
  for (let i = 1; i < steps; i++) {
    const t = scene.layer.getTileAtWorldXY(x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps);
    if (t && isSolid(t.index)) return false;
  }
  return true;
}

function aimAt(unit, t) {
  const dx = t.x - unit.x;
  const dy = t.y - 2 - unit.y;
  const l = Math.hypot(dx, dy) || 1;
  unit.aim = { x: dx / l, y: dy / l };
  unit.facing = dx < 0 ? -1 : 1;
}

function wallAhead(unit, scene) {
  const t = scene.layer.getTileAtWorldXY(unit.x + unit.facing * 12, unit.y);
  return !!t && isSolid(t.index);
}

function tryFire(unit, dt, inRange) {
  if (!unit.weapon) return;
  unit.cooldown -= dt;
  if (inRange && unit.cooldown <= 0) {
    unit.state.burst = unit.state.burst ?? 0;
    unit.shoot();
    unit.state.burst++;
    if (unit.state.burst >= (unit.def.burst ?? 3)) {
      unit.state.burst = 0;
      unit.cooldown = unit.weapon.rate * 2.5 + Math.random() * 1.2;
    } else {
      unit.cooldown = unit.weapon.rate;
    }
  }
}

// Allies with nothing to shoot follow the nearest player.
function followPlayer(unit, scene) {
  const p = scene.players.find((pl) => pl.alive);
  if (!p) return unit.setVelocityX(0);
  const dx = p.x - unit.x;
  unit.facing = Math.sign(dx) || unit.facing;
  unit.setVelocityX(Math.abs(dx) > 50 ? Math.sign(dx) * unit.def.speed * 1.3 : 0);
  if (unit.body.blocked.down && wallAhead(unit, scene)) unit.setVelocityY(-360);
}

// Runs after every walking unit's behavior: look at the ground ahead and hop over
// narrow hazards (fire, energy fields), stop short of wide ones, and jump out of one
// if standing in it. Keeps allies from walking into fires.
export function avoidHazards(unit, scene) {
  const b = unit.body;
  if (unit.bodyDef.flying || !b.blocked.down) return;
  const feet = b.bottom - 4;
  const hazardAt = (x) => { const t = scene.layer.getTileAtWorldXY(x, feet); return !!t && isHazard(t.index); };
  const vx = b.velocity.x;
  if (hazardAt(unit.x)) {
    unit.setVelocity((Math.sign(vx) || unit.facing) * 120, -420);
    return;
  }
  if (Math.abs(vx) < 5) return;
  const dir = Math.sign(vx);
  const edge = dir > 0 ? b.right : b.left;
  if (!hazardAt(edge + dir * 6)) return;
  let run = 0;
  while (run < 5 && hazardAt(edge + dir * (6 + run * TILE))) run++;
  if (run <= 3) unit.setVelocity(dir * Math.max(Math.abs(vx), 120), -420);
  else unit.setVelocityX(0);
}

export const BEHAVIORS = {
  // Small hoppers (Flood infection forms): bound toward a target, pop on contact.
  swarm(unit, dt, scene) {
    const n = nearest(unit, scene, 520);
    if (!n) return unit.setVelocityX(0);
    unit.facing = n.t.x < unit.x ? -1 : 1;
    unit.setVelocityX(unit.facing * unit.def.speed);
    if (unit.body.blocked.down && (wallAhead(unit, scene) || Math.random() < dt * 2.5)) unit.setVelocityY(-230 - Math.random() * 140);
    if (n.d < 16) {
      n.t.hurt((unit.def.melee ?? 8) * unit.dmgScale, 'melee', unit);
      unit.hurt(9999, 'melee');
    }
  },

  // Bystanders and story characters: stand still, face the nearest player.
  idle(unit, dt, scene) {
    unit.setVelocityX(0);
    const p = scene.players.find((pl) => pl.alive);
    if (p) unit.facing = p.x < unit.x ? -1 : 1;
  },

  // Keeps its distance, strafes, fires bursts.
  shooter(unit, dt, scene) {
    const n = nearest(unit, scene, unit.def.range * 1.6);
    if (!n) {
      if (unit.ally) return followPlayer(unit, scene);
      return unit.setVelocityX(0);
    }
    aimAt(unit, n.t);
    const want = unit.def.range * 0.6;
    let vx = 0;
    if (n.d > want + 30) vx = unit.facing * unit.def.speed;
    else if (n.d < want - 50) vx = -unit.facing * unit.def.speed * 0.7;
    unit.state.strafe = (unit.state.strafe ?? 0) - dt;
    if (unit.state.strafe <= 0) {
      unit.state.strafe = 1 + Math.random() * 2;
      unit.state.dir = Math.random() < 0.5 ? -1 : 1;
    }
    if (vx === 0) vx = unit.state.dir * unit.def.speed * 0.4;
    unit.setVelocityX(vx);
    if (unit.body.blocked.down && (wallAhead(unit, scene) || Math.random() < dt * 0.15)) unit.setVelocityY(-360);
    tryFire(unit, dt, n.d < unit.def.range && lineOfSight(scene, unit.x, unit.y, n.t.x, n.t.y));
  },

  // Rushes in and strikes; fires on the way.
  charger(unit, dt, scene) {
    const n = nearest(unit, scene, 500);
    if (!n) return unit.setVelocityX(0);
    aimAt(unit, n.t);
    unit.state.wind = (unit.state.wind ?? 0) - dt;
    if (n.d < 26 && unit.state.wind <= -0.8) {
      unit.state.wind = 0.35;
      unit.setTintFill(0xffffff);
      scene.time.delayedCall(120, () => unit.alive && unit.clearTint());
    }
    if (unit.state.wind > 0 && unit.state.wind - dt <= 0) {
      melee(scene, unit, 30, (unit.def.melee ?? 25) * unit.dmgScale);
    }
    unit.setVelocityX(unit.state.wind > 0 ? 0 : unit.facing * unit.def.speed * (n.d > 60 ? 1.2 : 0.8));
    if (unit.body.blocked.down && wallAhead(unit, scene)) unit.setVelocityY(-380);
    tryFire(unit, dt, n.d > 50 && n.d < unit.def.range && lineOfSight(scene, unit.x, unit.y, n.t.x, n.t.y));
  },

  // Hovers above and to the side of its target.
  flyer(unit, dt, scene) {
    const n = nearest(unit, scene, unit.def.range * 2);
    unit.state.t = (unit.state.t ?? Math.random() * 6) + dt;
    if (!n) return unit.setVelocity(0, Math.sin(unit.state.t * 2) * 15);
    aimAt(unit, n.t);
    const side = unit.state.side ?? (unit.state.side = Math.random() < 0.5 ? -1 : 1);
    const tx = n.t.x + side * 70 + Math.sin(unit.state.t) * 30;
    const ty = n.t.y - 60 + Math.sin(unit.state.t * 1.7) * 14;
    unit.setVelocity((tx - unit.x) * 1.4, (ty - unit.y) * 1.4);
    tryFire(unit, dt, n.d < unit.def.range && lineOfSight(scene, unit.x, unit.y, n.t.x, n.t.y));
  },

  // Patrols back and forth, fires when someone comes close.
  walker(unit, dt, scene) {
    const n = nearest(unit, scene, unit.def.range);
    if (n) aimAt(unit, n.t);
    if (wallAhead(unit, scene) || !unit.state.dir) unit.state.dir = -(unit.state.dir ?? 1), unit.facing = unit.state.dir;
    unit.setVelocityX(n ? 0 : unit.state.dir * unit.def.speed * 0.5);
    tryFire(unit, dt, !!n && lineOfSight(scene, unit.x, unit.y, n.t.x, n.t.y));
  },

  turret(unit, dt, scene) {
    unit.setVelocityX(0);
    const n = nearest(unit, scene, unit.def.range);
    if (!n) return;
    aimAt(unit, n.t);
    tryFire(unit, dt, lineOfSight(scene, unit.x, unit.y, n.t.x, n.t.y));
  },

  // Bosses cycle through def.boss.attacks: 'barrage' | 'charge' | 'summon' | 'leap'.
  boss(unit, dt, scene) {
    const n = nearest(unit, scene, 900);
    const st = unit.state;
    if (!n) return unit.setVelocityX(0);
    aimAt(unit, n.t);
    st.timer = (st.timer ?? 2) - dt;
    st.i = st.i ?? 0;
    const attacks = unit.def.boss.attacks;
    if (st.timer <= 0) {
      st.attack = attacks[st.i % attacks.length];
      st.i++;
      st.timer = 3 + Math.random();
      st.phaseT = 0;
      if (st.attack === 'summon') scene.summonFor(unit);
      if (st.attack === 'leap' && unit.body.blocked.down) unit.setVelocity(unit.facing * 200, -420);
    }
    st.phaseT = (st.phaseT ?? 0) + dt;
    if (st.attack === 'barrage') {
      unit.setVelocityX(0);
      if (Math.floor(st.phaseT * 6) !== Math.floor((st.phaseT - dt) * 6) && st.phaseT < 1.5) {
        const base = Math.atan2(unit.aim.y, unit.aim.x);
        for (let k = -2; k <= 2; k++) {
          unit.aim = { x: Math.cos(base + k * 0.18), y: Math.sin(base + k * 0.18) };
          unit.shoot();
        }
        aimAt(unit, n.t);
      }
    } else if (st.attack === 'charge') {
      unit.setVelocityX(st.phaseT < 1.2 ? unit.facing * unit.def.speed * 2.6 : 0);
      if (n.d < 34 && !st.hit) {
        st.hit = true;
        melee(scene, unit, 40, (unit.def.melee ?? 35) * unit.dmgScale);
      }
      if (st.phaseT > 1.2) st.hit = false;
    } else {
      unit.setVelocityX(unit.facing * unit.def.speed * 0.5);
      tryFire(unit, dt, lineOfSight(scene, unit.x, unit.y, n.t.x, n.t.y));
    }
  },
};
