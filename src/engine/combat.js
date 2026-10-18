// Projectiles, grenades, explosions and melee. Friendly fire is off.

import Phaser from 'phaser';
import { GRENADES } from '../content/weapons.js';
import { audio } from './audio.js';
import { hexNum } from './textures.js';
import { isPlatform } from './tileset.js';

export function setupCombat(scene) {
  scene.projectiles = scene.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 500, allowGravity: false });
  scene.grenades = scene.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: 40 });
  const notPlatform = (_obj, tile) => !isPlatform(tile.index);
  scene.physics.add.collider(scene.projectiles, scene.layer, (p) => impact(scene, p), notPlatform);
  scene.physics.add.overlap(scene.projectiles, scene.actorGroup, (p, a) => {
    if (!p.active || !a.alive || p.team === a.team || a.team === 'neutral') return;
    // Jackal and Hunter shields block shots from the front: flank them or use grenades.
    if (a.bodyDef?.frontShield && p.body.velocity.x * a.facing < 0) {
      scene.fx.sparks(p.x, p.y, 0x9fd8ff, 6);
      audio.sfx('shieldHit');
      p.disableBody(true, true);
      return;
    }
    a.hurt(p.damage * (a.bodyDef?.frontShield ? 1.5 : 1), p.tech, p.owner);
    impact(scene, p, a);
  });
  scene.physics.add.collider(scene.grenades, scene.layer, null, notPlatform);
  scene.physics.add.overlap(scene.grenades, scene.actorGroup, (g, a) => {
    if (g.def.stick && !g.stuckTo && a.alive && a.team !== g.team) {
      g.stuckTo = a;
      g.stuckOff = { x: g.x - a.x, y: g.y - a.y };
      g.body.setAllowGravity(false);
      g.setVelocity(0, 0);
    }
  });
}

export function fireWeapon(scene, shooter, w, ox, oy, dir, dmgScale = 1, extraSpread = 0) {
  const pellets = w.pellets ?? 1;
  let base = Math.atan2(dir.y, dir.x);
  const color = hexNum(w.color);
  for (let i = 0; i < pellets; i++) {
    const p = scene.projectiles.get(ox, oy, `pj-${w.projectile}`);
    if (!p) return;
    p.enableBody(true, ox, oy, true, true);
    p.setTexture(`pj-${w.projectile}`);
    p.body.setAllowGravity(false);
    const spread = (w.spread ?? 0) + extraSpread;
    const a = base + (pellets > 1 ? (i / (pellets - 1) - 0.5) * spread * 2 : (Math.random() - 0.5) * 2 * spread);
    p.setRotation(a).setTint(color).setBlendMode('ADD').setDepth(30);
    p.body.setSize(p.width, Math.max(2, p.height));
    p.setVelocity(Math.cos(a) * w.speed, Math.sin(a) * w.speed);
    p.team = shooter.team;
    p.owner = shooter;
    p.damage = w.damage * dmgScale;
    p.tech = w.tech;
    p.splash = w.splash ?? 0;
    p.color = color;
    p.expires = scene.time.now + 1800;
  }
  scene.fx.muzzle(ox, oy, color);
  audio.sfx(w.sfx);
}

export function impact(scene, p, hitActor = null) {
  if (!p.active) return;
  if (p.splash) explode(scene, p.x, p.y, p.splash, p.damage, p.team, p.owner, hitActor);
  else scene.fx.sparks(p.x, p.y, p.color, 4);
  p.disableBody(true, true);
}

export function updateProjectiles(scene) {
  const now = scene.time.now;
  scene.projectiles.children.each((p) => {
    if (p.active && now > p.expires) p.disableBody(true, true);
  });
  scene.grenades.children.each((g) => {
    if (!g.active) return;
    if (g.stuckTo) {
      if (g.stuckTo.alive) g.setPosition(g.stuckTo.x + g.stuckOff.x, g.stuckTo.y + g.stuckOff.y);
      else g.stuckTo = null, g.body.setAllowGravity(true);
    }
    if (g.body.blocked.down) g.setVelocityX(g.body.velocity.x * 0.9);
    g.blinkAt = g.blinkAt ?? now;
    if (now > g.blinkAt) {
      scene.fx.glow(g.x, g.y, g.color, 0.3, 120);
      g.blinkAt = now + 220;
    }
    if (now > g.expires) {
      explode(scene, g.x, g.y, g.def.radius, g.def.damage, g.team, g.owner);
      g.disableBody(true, true);
    }
  });
}

export function throwGrenade(scene, thrower, type, dir) {
  const def = GRENADES[type];
  const g = scene.grenades.get(thrower.x, thrower.y - 6, 'grenade');
  if (!g) return;
  g.enableBody(true, thrower.x, thrower.y - 6, true, true);
  g.body.setAllowGravity(true);
  g.def = def;
  g.color = hexNum(def.color);
  g.setTint(g.color).setDepth(31);
  g.setBounce(def.bounce);
  g.setVelocity(dir.x * 240 + thrower.body.velocity.x * 0.3, dir.y * 240 - 140);
  g.team = thrower.team;
  g.owner = thrower;
  g.stuckTo = null;
  g.blinkAt = null;
  g.expires = scene.time.now + def.fuse * 1000;
  audio.sfx('grenadeThrow');
}

export function explode(scene, x, y, radius, damage, team, owner, direct = null) {
  scene.fx.explosion(x, y, radius);
  for (const a of scene.actorList()) {
    if (!a.alive || a.team === team || a.team === 'neutral' || a.vehicle) continue;
    const d = Phaser.Math.Distance.Between(x, y, a.x, a.y);
    if (d > radius && a !== direct) continue;
    const fall = a === direct ? 1 : 1 - (d / radius) * 0.6;
    a.hurt(damage * fall, 'explosive', owner);
    const ang = Math.atan2(a.y - y, a.x - x);
    if (a.body && !a.def?.boss) a.body.velocity.x += Math.cos(ang) * 200, a.body.velocity.y -= 160;
  }
}

// Melee: hits the nearest opposing actor in front within reach.
export function melee(scene, attacker, reach = 24, damage = 50) {
  let best = null;
  let bestD = reach;
  for (const a of scene.actorList()) {
    if (!a.alive || a.team === attacker.team || a.team === 'neutral' || a.vehicle) continue;
    const dx = (a.x - attacker.x) * attacker.facing;
    const d = Math.hypot(a.x - attacker.x, a.y - attacker.y);
    if (dx > -4 && d < bestD + (a.width ?? 0) / 2) {
      best = a;
      bestD = d;
    }
  }
  if (!best) return null;
  best.hurt(damage, 'melee', attacker);
  if (best.body && !best.def?.boss) best.body.velocity.x = attacker.facing * 220, best.body.velocity.y = -120;
  scene.fx.sparks(best.x, best.y - 4, 0xffffff, 10);
  scene.fx.shake(0.006, 90);
  scene.fx.hitstop(70);
  audio.sfx('hit');
  return best;
}
