// Era ability kits. Same buttons in every era, different powers (docs/LORE.md):
//   forerunner  Hard-light dash (ability) + hover (hold jump while falling)
//   covenant    Sprint (hold ability) + cover (crouch takes half damage); extra 'camo'
//               replaces sprint with active camouflage (the Arbiter)
//   created     Thruster dash (ability) + ground pound (hold down + ability in the air)
//   banished    Grappleshot (ability): pulls you to walls, or to enemies for a melee
// A kit exposes update(state, dt, onGround) and hud() -> { label, ready (0..1), active }.

import { TILE } from './config.js';
import { audio } from './audio.js';
import { explode, melee } from './combat.js';

function solidAt(scene, x, y) {
  const t = scene.layer.getTileAtWorldXY(x, y);
  return !!t && (t.index === 0 || t.index === 1);
}

function forerunner(p) {
  let cd = 0;
  let hover = 1;
  return {
    update(s, dt, onGround) {
      cd -= dt;
      if (onGround) hover = 1;
      if (s.pressed.ability && cd <= 0) {
        const dx = Math.abs(s.x) > 0.3 ? Math.sign(s.x) : p.facing;
        const dy = s.y < -0.5 ? -1 : 0;
        const len = Math.hypot(dx, dy);
        let dist = 0;
        while (dist < 72 && !solidAt(p.scene, p.x + (dx / len) * (dist + 8), p.y + (dy / len) * (dist + 8))) dist += 4;
        for (let i = 0; i < 4; i++) {
          const ghost = p.scene.add.image(p.x + (dx / len) * dist * (i / 4), p.y + (dy / len) * dist * (i / 4), p.texture.key, p.frame.name)
            .setFlipX(p.flipX).setTintFill(p.shieldColor).setAlpha(0.6).setBlendMode('ADD').setDepth(p.depth - 1);
          p.scene.tweens.add({ targets: ghost, alpha: 0, duration: 300 + i * 60, onComplete: () => ghost.destroy() });
        }
        const vx = p.body.velocity.x;
        p.body.reset(p.x + (dx / len) * dist, p.y + (dy / len) * dist);
        p.body.velocity.x = vx;
        p.invulnUntil = p.scene.time.now + 180;
        p.scene.fx.ring(p.x, p.y, p.shieldColor, 0.6, 250);
        audio.sfx('dash');
        cd = 1.1;
      }
      if (!onGround && s.jump && p.body.velocity.y > 0 && hover > 0) {
        p.body.velocity.y = Math.min(p.body.velocity.y, 35);
        hover -= dt;
        if (Math.random() < 0.5) p.scene.fx.emitter(p.shieldColor).explode(1, p.x, p.y + 12);
      }
    },
    hud: () => ({ label: 'Hard-Light Dash', ready: Math.max(0, 1 - Math.max(0, cd) / 1.1), active: false }),
  };
}

function covenant(p, extra) {
  if (extra === 'camo') {
    let cd = 0;
    let on = 0;
    return {
      coverBonus: 0.5,
      update(s, dt) {
        cd -= dt;
        on -= dt;
        if (s.pressed.ability && cd <= 0) {
          on = 6;
          cd = 15;
          audio.sfx('teleport');
        }
        p.camo = on > 0;
        p.setAlpha(p.camo ? 0.25 : 1);
      },
      cancel() { on = 0; p.camo = false; p.setAlpha(1); },
      hud: () => ({ label: 'Active Camo', ready: Math.max(0, 1 - Math.max(0, cd) / 15), active: on > 0 }),
    };
  }
  let stamina = 1;
  const kit = {
    coverBonus: 0.5,
    speedMul: 1,
    update(s, dt, onGround) {
      const sprinting = s.ability && Math.abs(s.x) > 0.3 && stamina > 0 && onGround;
      kit.speedMul = sprinting ? 1.6 : 1;
      stamina = Math.max(0, Math.min(1, stamina + (sprinting ? -dt / 3 : dt / 4)));
      if (sprinting && Math.random() < 0.3) p.scene.fx.emitter(0xcccccc).explode(1, p.x - p.facing * 6, p.y + 11);
    },
    hud: () => ({ label: 'Sprint', ready: stamina, active: kit.speedMul > 1 }),
  };
  return kit;
}

function created(p) {
  let cd = 0;
  let airDash = true;
  let pounding = false;
  let thrust = 0;
  const kit = {
    overrideMove: false,
    update(s, dt, onGround) {
      cd -= dt;
      thrust -= dt;
      kit.overrideMove = thrust > 0;
      if (onGround) airDash = true;
      if (pounding && onGround) {
        pounding = false;
        explode(p.scene, p.x, p.y + 10, 52, 45, p.team, p);
        p.scene.fx.shake(0.02, 300);
        audio.sfx('pound');
      }
      if (s.pressed.ability && !onGround && s.y > 0.5 && !pounding) {
        pounding = true;
        p.body.velocity.x = 0;
        p.body.velocity.y = 720;
        p.scene.fx.ring(p.x, p.y, p.shieldColor, 0.5);
        return;
      }
      if (s.pressed.ability && cd <= 0 && (onGround || airDash)) {
        const dx = Math.abs(s.x) > 0.3 ? Math.sign(s.x) : p.facing;
        p.body.velocity.x = dx * 420;
        p.body.velocity.y = Math.min(p.body.velocity.y, -40);
        thrust = 0.18;
        airDash = onGround;
        cd = 0.9;
        p.scene.fx.emitter(p.shieldColor).explode(10, p.x - dx * 6, p.y);
        audio.sfx('dash');
      }
    },
    hud: () => ({ label: 'Thruster', ready: Math.max(0, 1 - Math.max(0, cd) / 0.9), active: pounding }),
  };
  return kit;
}

function banished(p) {
  let cd = 0;
  let hook = null;
  const rope = p.scene.add.graphics().setDepth(19);
  const kit = {
    overrideMove: false,
    update(s, dt) {
      cd -= dt;
      rope.clear();
      if (s.pressed.ability && cd <= 0 && !hook) {
        hook = { x: p.x, y: p.y - 4, vx: p.aim.x * 640, vy: p.aim.y * 640 - (p.aim.y === 0 ? 90 : 0), dist: 0, state: 'fly', t: 0 };
        cd = 1.4;
        audio.sfx('grapple');
      }
      if (!hook) { kit.overrideMove = false; return; }
      hook.t += dt;
      if (hook.state === 'fly') {
        hook.x += hook.vx * dt;
        hook.y += hook.vy * dt;
        hook.dist += 640 * dt;
        const enemy = p.scene.units.find((u) => u.alive && u.team !== p.team && Math.abs(u.x - hook.x) < 10 && Math.abs(u.y - hook.y) < 14);
        if (enemy) { hook.state = 'enemy'; hook.target = enemy; hook.t = 0; }
        else if (solidAt(p.scene, hook.x, hook.y)) { hook.state = 'wall'; hook.t = 0; p.scene.fx.sparks(hook.x, hook.y, 0xffffff, 6); }
        else if (hook.dist > TILE * 11) hook = null;
      } else {
        const tx = hook.state === 'enemy' ? hook.target.x : hook.x;
        const ty = hook.state === 'enemy' ? hook.target.y : hook.y;
        const d = Math.hypot(tx - p.x, ty - p.y);
        kit.overrideMove = true;
        p.body.velocity.x = ((tx - p.x) / d) * 380;
        p.body.velocity.y = ((ty - p.y) / d) * 380;
        if (hook.state === 'enemy' && (d < 20 || !hook.target.alive)) {
          if (hook.target.alive) melee(p.scene, p, 30, 70);
          hook = null;
        } else if (d < 14 || hook.t > 0.7 || s.pressed.jump) {
          if (s.pressed.jump) p.body.velocity.y = -p.def.jump * 0.9;
          hook = null;
        }
      }
      if (hook) {
        rope.lineStyle(1, 0xdddddd, 1).lineBetween(p.x, p.y - 4, hook.state === 'enemy' ? hook.target.x : hook.x, hook.state === 'enemy' ? hook.target.y : hook.y);
      } else {
        kit.overrideMove = false;
      }
    },
    cancel() { hook = null; rope.clear(); },
    hud: () => ({ label: 'Grappleshot', ready: Math.max(0, 1 - Math.max(0, cd) / 1.4), active: !!hook }),
  };
  return kit;
}

const KITS = { forerunner, covenant, created, banished };

export function makeKit(name, player, extra) {
  return (KITS[name] ?? covenant)(player, extra);
}
