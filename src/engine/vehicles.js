// Drivable vehicles. A player presses SWAP next to a vehicle to get in (driver first,
// then gunner if it has one) and SWAP again to get out. The driver steers with the
// move controls and fires forward; a gunner aims freely and fires instead. Empty
// vehicles are neutral (nobody shoots them); occupied ones take the hits for their crew.

import Phaser from 'phaser';
import { VEHICLES } from '../content/vehicles.js';
import { BODIES } from '../content/bodies.js';
import { WEAPONS } from '../content/weapons.js';
import { bodyTexture, hexNum, META } from './textures.js';
import { fireWeapon, explode } from './combat.js';
import { aimFrom } from './rules.js';
import { audio } from './audio.js';
import { HD } from './config.js';
import { dropShadow } from './fx.js';

export class Vehicle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, id) {
    const def = VEHICLES[id];
    const key = bodyTexture(scene, `veh-${id}`, def);
    super(scene, x, y, key, 0);
    this.key = key;
    this.id = id;
    this.def = def;
    this.bodyDef = BODIES[def.body];
    this.meta = META.get(key);
    this.team = 'neutral';
    this.alive = true;
    this.isVehicle = true;
    this.health = def.health;
    this.stats = { health: def.health, shields: 0 };
    this.shields = 0;
    this.facing = 1;
    this.aim = { x: 1, y: 0 };
    this.cooldown = 0;
    this.driver = null;
    this.gunner = null;
    this.weapon = WEAPONS[def.weapon];
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.actorGroup.add(this);
    this.setScale(1 / HD);
    const [hw, hh] = this.bodyDef.hit;
    this.body.setSize(hw * HD, hh * HD).setOffset(((this.bodyDef.w - hw) / 2) * HD, (this.bodyDef.h - hh - 1) * HD);
    if (def.kind === 'air') this.body.setAllowGravity(false);
    this.body.setDragX(def.kind === 'air' ? 300 : 200);
    this.setDepth(21);
    this.play(`${key}-idle`);
    this.shadow = dropShadow(scene, this, this.bodyDef.hit[0] * 1.3);
  }

  get riders() {
    return [this.driver, this.gunner].filter(Boolean);
  }

  seatFor() {
    if (!this.driver) return 'driver';
    if (!this.gunner && this.def.seats.includes('gunner')) return 'gunner';
    return null;
  }

  enter(p) {
    const seat = this.seatFor();
    if (!seat || !this.alive) return false;
    this[seat] = p;
    p.vehicle = this;
    p.seat = seat;
    p.setVisible(false);
    p.body.enable = false;
    if (p.gun) p.gun.setVisible(false);
    this.team = 'players';
    audio.sfx('reload');
    return true;
  }

  leave(p) {
    if (this[p.seat] === p) this[p.seat] = null;
    p.vehicle = null;
    p.setDepth(20);
    p.setCrop();
    p.body.enable = true;
    p.body.reset(this.x - this.facing * 30, this.y - 12);
    p.setVisible(true);
    p.invulnUntil = Math.max(p.invulnUntil ?? 0, this.scene.time.now + 600);
    if (!this.riders.length) this.team = 'neutral';
  }

  // Called each frame by the level with each rider's controls.
  drive(dt, s, p) {
    const d = this.def;
    const b = this.body;
    if (p === this.driver) {
      const accel = d.accel * dt;
      b.velocity.x += Phaser.Math.Clamp(s.x * d.speed - b.velocity.x, -accel, accel);
      if (Math.abs(s.x) > 0.3) this.facing = Math.sign(s.x);
      if (d.kind === 'air') {
        b.velocity.y += Phaser.Math.Clamp(s.y * d.speed * 0.8 - b.velocity.y, -accel, accel);
      } else if (s.pressed.jump && b.blocked.down) {
        b.velocity.y = -d.jump;
        audio.sfx('jump');
      }
      if (!this.gunner) this.aim = { x: this.facing, y: d.kind === 'air' ? 0 : Math.min(0, Math.sign(s.y)) * 0.5 };
    }
    if (p === this.gunner || (p === this.driver && !this.gunner)) {
      if (p === this.gunner) {
        const a = s.stick ? { x: s.aimX, y: s.aimY } : aimFrom(s.x, s.y, this.facing, false);
        const l = Math.hypot(a.x, a.y) || 1;
        this.aim = { x: a.x / l, y: a.y / l };
      }
      if (s.fire && this.cooldown <= 0 && this.weapon) {
        const m = this.muzzle();
        fireWeapon(this.scene, p, this.weapon, m.x, m.y, this.aim, 1);
        this.cooldown = this.weapon.rate;
      }
    }
  }

  muzzle() {
    const sh = this.meta.shoulders[this.frame.name] ?? this.meta.shoulders[0];
    return { x: this.x + ((sh[0] - this.meta.w / 2) * this.facing) / HD, y: this.y + (sh[1] - this.meta.h / 2) / HD };
  }

  tick(dt) {
    this.shadow();
    if (!this.alive) return;
    this.cooldown -= dt;
    this.setFlipX(this.facing < 0);
    // Riders: shown in their seats (behind the vehicle's sides, so only the head and
    // shoulders show), or hidden inside closed vehicles.
    for (const r of this.riders) {
      const seat = this.def.seatAt?.[r.seat];
      if (!seat) {
        r.x = this.x;
        r.y = this.y - 6;
        r.setVisible(false);
        continue;
      }
      r.setPosition(this.x + (seat[0] - this.bodyDef.w / 2) * this.facing, this.y + (seat[1] - this.bodyDef.h / 2));
      r.setFlipX(this.facing < 0).setDepth(this.depth - 0.5).setVisible(true);
      r.playAnim(r.seat === 'gunner' && this.def.gunnerStands ? 'idle' : 'crouch');
      // Only the head and shoulders: thin hulls would otherwise show dangling legs.
      r.setCrop(0, 0, r.frame.width, r.frame.height * (seat[2] ?? 0.9));
    }
    if (this.y > this.scene.worldH + 60) this.hurt(9999, 'explosive');
    for (const u of this.scene.units) {
      if (Math.abs(u.x - this.x) < this.body.width / 2 + 6 && Math.abs(u.y - this.y) < this.body.height / 2 + 14) this.splatter(u);
    }
  }

  hurt(amount) {
    if (!this.alive || this.team === 'neutral') return;
    if (this.riders.some((r) => r.invulnUntil > this.scene.time.now)) return;
    this.health -= amount;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(50, () => this.alive && this.clearTint());
    if (this.health <= 0) this.wreck();
  }

  wreck() {
    this.alive = false;
    explode(this.scene, this.x, this.y, 50, 40, 'players', null);
    this.scene.fx.explosion(this.x, this.y, 60, 0xff8a2a);
    for (const r of this.riders) {
      this.leave(r);
      r.hurt(30, 'explosive');
    }
    this.disableBody(true, true);
    this.shadow();
  }

  // Run over enemies when moving fast.
  splatter(u) {
    if (!this.driver || u.team !== 'enemies' || !u.alive || !this.def.splatter) return;
    const v = Math.abs(this.body.velocity.x);
    if (v < 120 || this.scene.time.now < (u.splatAt ?? 0)) return;
    u.splatAt = this.scene.time.now + 400;
    u.hurt(this.def.splatter, 'melee', this.driver);
    if (u.body && !u.def?.boss) u.body.velocity.x = Math.sign(this.body.velocity.x) * 260, u.body.velocity.y = -200;
    this.scene.fx.shake(0.006, 120);
  }
}

export function vehicleColor(def) {
  return hexNum(def.pal.glow);
}
