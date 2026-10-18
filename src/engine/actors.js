// Actors: everything that fights. Player (human-controlled) and Unit (AI: enemies and
// allies) share damage, shields, the held gun, and the light-puff defeat.

import Phaser from 'phaser';
import { BODIES } from '../content/bodies.js';
import { WEAPONS } from '../content/weapons.js';
import { applyDamage, aimFrom } from './rules.js';
import { bodyTexture, armTexture, hexNum, META } from './textures.js';
import { aimFrame } from './sprites.js';
import { fireWeapon, throwGrenade, melee } from './combat.js';
import { makeKit } from './kits.js';
import { BEHAVIORS, avoidHazards, keepApart } from './ai.js';
import { audio } from './audio.js';
import { HD } from './config.js';
import { dropShadow } from './fx.js';

const GRENADE_COOLDOWN = 0.8;

class Actor extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, id, def, team) {
    const key = bodyTexture(scene, id, def);
    super(scene, x, y, key, 0);
    this.key = key;
    this.def = def;
    this.bodyDef = BODIES[def.body];
    this.team = team;
    this.alive = true;
    this.facing = 1;
    this.aim = { x: 1, y: 0 };
    this.lastHit = -99999;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.actorGroup.add(this);
    this.id = id;
    this.meta = META.get(key);
    this.setScale((def.scale ?? 1) / HD);
    const [hw, hh] = this.bodyDef.hit;
    const B = this.bodyDef;
    this.body.setSize(hw * HD, hh * HD).setOffset(((B.w - hw) / 2) * HD, (B.flying ? (B.h - hh) / 2 : B.h - hh - 1) * HD);
    if (this.bodyDef.flying) this.body.setAllowGravity(false);
    this.setDepth(team === 'players' ? 20 : 18);
    this.play(`${key}-idle`);
    this.gun = null;
    this.shadow = dropShadow(scene, this, this.bodyDef.hit[0] * 1.6 * (def.scale ?? 1));
  }

  equip(weaponId) {
    this.weapon = WEAPONS[weaponId];
    if (this.gun) this.gun.destroy();
    this.gun = null;
    // Armless bodies (drones, Flood forms) have no overlay; unarmed characters still
    // get their arm drawn, just without a weapon.
    if (this.bodyDef.flying || !this.bodyDef.reach) return;
    const key = armTexture(this.scene, this.id, this.def, weaponId ?? 'none', this.weapon ?? null);
    this.armMeta = META.get(key);
    this.gun = this.scene.add.sprite(this.x, this.y, key, 4).setDepth(this.depth + 1).setScale(this.scaleX);
  }

  // Where the arm attaches (or the eye, for armless bodies) in world space.
  shoulder() {
    const sh = this.meta.shoulders[this.frame.name] ?? this.meta.shoulders[0];
    const k = this.scaleX;
    return { x: this.x + (sh[0] - this.meta.w / 2) * this.facing * k, y: this.y + (sh[1] - this.meta.h / 2) * k };
  }

  aimPose() {
    return aimFrame(Math.abs(this.aim.x) < 0.01 ? this.facing * 0.02 : this.aim.x, this.aim.y);
  }

  muzzlePoint() {
    const s = this.shoulder();
    if (!this.gun) return s;
    const { i, flip } = this.aimPose();
    const [mx, my] = this.armMeta.muzzles[i];
    return { x: s.x + mx * (flip ? -1 : 1) * this.scaleX, y: s.y + my * this.scaleX };
  }

  syncGun() {
    this.shadow?.();
    if (!this.gun) return;
    const s = this.shoulder();
    const { i, flip } = this.aimPose();
    this.gun.setPosition(s.x, s.y).setFrame(i).setFlipX(flip);
    this.gun.setVisible(this.visible).setAlpha(this.alpha);
  }

  // Plays an animation, falling back to idle for bodies that don't have it.
  playAnim(name) {
    this.play(`${this.key}-${this.bodyDef.anims[name] ? name : 'idle'}`, true);
  }

  get maxShields() { return this.stats.shields; }
  get maxHealth() { return this.stats.health; }

  hurt(amount, tech, from) {
    if (!this.alive || this.invulnUntil > this.scene.time.now) return;
    if (this.crouching && this.coverBonus) amount *= this.coverBonus;
    const had = this.shields > 0;
    const r = applyDamage({ shields: this.shields, health: this.health }, amount, tech);
    this.shields = r.shields;
    this.health = r.health;
    this.lastHit = this.scene.time.now;
    this.regenPlayed = false;
    if (had) {
      this.scene.fx.glow(this.x, this.y, this.shieldColor ?? 0x9fe8ff, 0.8, 140);
      if (this.team === 'players') audio.sfx('shieldHit');
    } else {
      this.setTintFill(0xffffff);
      this.scene.time.delayedCall(50, () => this.alive && this.clearTint());
    }
    if (r.shieldBroke) {
      this.scene.fx.sparks(this.x, this.y, this.shieldColor ?? 0x9fe8ff, 14);
      audio.sfx('shieldBreak');
    }
    if (r.dead) this.die(from);
  }

  die() {
    this.alive = false;
    this.scene.fx.puff(this.x, this.y, this.def.puff ?? this.puffColor ?? '#ffffff', (this.def.scale ?? 1) > 1 || !!this.def.boss);
    if (this.gun) this.gun.setVisible(false);
    this.disableBody(true, true);
    this.shadow?.();
  }

  destroy(fromScene) {
    if (this.gun) this.gun.destroy();
    this.shadow?.destroy();
    super.destroy(fromScene);
  }
}

// --- AI units ----------------------------------------------------------------

export class Unit extends Actor {
  // team: 'enemies' (default), 'players' (allies), or 'neutral' (bystanders nobody targets).
  constructor(scene, x, y, id, def, { ally = false, team = null } = {}) {
    super(scene, x, y, id, def, team ?? (ally ? 'players' : 'enemies'));
    this.id = id;
    this.ally = ally;
    const k = ally ? { enemyHealth: 1 } : scene.diff;
    this.stats = { health: Math.round(def.health * k.enemyHealth), shields: Math.round((def.shields ?? 0) * k.enemyHealth) };
    this.health = this.stats.health;
    this.shields = this.stats.shields;
    this.shieldColor = hexNum(def.pal.glow ?? '#9fe8ff');
    this.dmgScale = ally ? 0.8 : scene.diff.enemyDamage;
    this.cooldown = 0.6 + Math.random();
    this.brain = BEHAVIORS[def.ai] ?? BEHAVIORS.shooter;
    this.state = {};
    if (def.weapon) this.equip(def.weapon);
  }

  tick(dt) {
    if (!this.alive) return;
    this.brain(this, dt, this.scene);
    keepApart(this, this.scene);
    avoidHazards(this, this.scene);
    this.setFlipX(this.facing < 0);
    if (!this.bodyDef.flying) {
      const moving = Math.abs(this.body.velocity.x) > 10;
      const anim = !this.body.blocked.down ? (this.body.velocity.y < 0 ? 'jump' : 'fall') : moving ? 'run' : 'idle';
      this.playAnim(anim);
    }
    // Shields recharge for AI too.
    if (this.shields < this.stats.shields && this.scene.time.now - this.lastHit > 4000) {
      this.shields = Math.min(this.stats.shields, this.shields + this.stats.shields * 0.4 * dt);
    }
    this.syncGun();
  }

  shoot() {
    if (!this.weapon) return;
    const m = this.muzzlePoint();
    fireWeapon(this.scene, this, this.weapon, m.x, m.y, this.aim, this.dmgScale, this.ally ? 0 : this.scene.diff.enemyHealth < 1 ? 0.08 : 0);
  }

  die(from) {
    super.die(from);
    this.scene.onUnitDefeated(this, from);
  }
}

// --- Players -----------------------------------------------------------------

export class Player extends Actor {
  constructor(scene, x, y, index, charId, def, device, era) {
    super(scene, x, y, charId, def, 'players');
    this.index = index;
    this.charId = charId;
    this.device = device;
    this.stats = { health: def.health, shields: def.shields };
    this.health = def.health;
    this.shields = def.shields;
    this.shieldColor = hexNum(era.css);
    this.puffColor = era.css;
    this.weapons = def.weapons.map((id) => ({ id, def: WEAPONS[id] }));
    this.cur = 0;
    this.grenadeCooldown = 0;
    this.cooldown = 0;
    this.lastGround = -9999;
    this.jumpBuffer = -9999;
    this.kit = makeKit(def.kit ?? era.kit, this, def.extra);
    this.equip(this.weapons[0]?.id);
    this.setDepth(22 + index);
  }

  get current() { return this.weapons[this.cur]; }

  tick(dt, s) {
    if (!this.alive) return;
    const now = this.scene.time.now;
    const b = this.body;
    const onGround = b.blocked.down;
    if (onGround) this.lastGround = now;
    if (s.pressed.jump) this.jumpBuffer = now;

    // Crouch (and drop through one-way platforms).
    this.crouching = onGround && s.y > 0.5 && Math.abs(s.x) < 0.5;
    if (this.crouching && s.pressed.jump) {
      this.dropping = now + 250;
      this.jumpBuffer = -Infinity;
    }
    this.coverBonus = this.kit.coverBonus ?? null;

    // Run.
    const speed = this.def.speed * (this.kit.speedMul ?? 1);
    const target = this.crouching ? 0 : s.x * speed;
    const accel = (onGround ? 1500 : 950) * dt;
    if (!this.kit.overrideMove) b.velocity.x += Phaser.Math.Clamp(target - b.velocity.x, -accel, accel);

    // Jump: coyote time, jump buffer, variable height.
    if (now - this.jumpBuffer < 120 && now - this.lastGround < 100 && !this.kit.overrideMove) {
      b.velocity.y = -this.def.jump;
      this.jumpBuffer = -Infinity;
      this.lastGround = -Infinity;
      audio.sfx('jump');
      this.scene.fx.emitter(0xffffff).explode(4, this.x, this.y + this.height / 2);
    }
    if (!s.jump && b.velocity.y < -140) b.velocity.y = -140;

    // Aim and face.
    const a = s.stick ? (() => { const l = Math.hypot(s.aimX, s.aimY); return { x: s.aimX / l, y: s.aimY / l }; })()
      : aimFrom(s.x, s.y, this.facing, onGround);
    this.aim = this.assist(a);
    if (Math.abs(s.x) > 0.3) this.facing = Math.sign(s.x);
    if (s.stick && Math.abs(s.aimX) > 0.2) this.facing = Math.sign(s.aimX);

    // Weapons: unlimited ammo, no reloading. Grenades are unlimited, with a short
    // cooldown so they can't be spammed.
    this.cooldown -= dt;
    this.grenadeCooldown -= dt;
    if (s.pressed.swap && this.weapons.length > 1) {
      this.cur = (this.cur + 1) % this.weapons.length;
      this.equip(this.current?.id);
      this.cooldown = 0.2;
      audio.sfx('reload');
    }
    if (s.fire && this.cooldown <= 0) this.shoot();
    if (s.pressed.grenade && this.grenadeCooldown <= 0) {
      this.grenadeCooldown = GRENADE_COOLDOWN;
      throwGrenade(this.scene, this, this.def.grenade ?? 'frag', { x: this.facing * 0.9 + this.aim.x * 0.1, y: Math.min(0, this.aim.y) });
    }
    if (s.pressed.melee) {
      melee(this.scene, this, 26, 60);
      b.velocity.x += this.facing * 60;
    }

    this.kit.update(s, dt, onGround);

    // Shields: Halo-style recharge after a pause, with the charge-up sound.
    if (now - this.lastHit > this.scene.diff.shieldDelay * 1000) {
      if (this.shields < this.stats.shields) {
        if (!this.regenPlayed) {
          audio.sfx('shieldCharge');
          this.regenPlayed = true;
          this.scene.fx.glow(this.x, this.y, this.shieldColor, 1.2, 600);
        }
        this.shields = Math.min(this.stats.shields, this.shields + this.stats.shields * 0.55 * dt);
      } else if (this.health < this.stats.health) {
        this.health = Math.min(this.stats.health, this.health + 10 * dt);
      }
    }
    if (this.shields <= 0 && this.health < this.stats.health * 0.4 && now > (this.lowBeep ?? 0)) {
      audio.sfx('shieldLow');
      this.lowBeep = now + 900;
    }

    // Animation.
    this.setFlipX(this.facing < 0);
    const anim = this.crouching ? 'crouch' : !onGround ? (b.velocity.y < 0 ? 'jump' : 'fall') : Math.abs(b.velocity.x) > 15 ? 'run' : 'idle';
    this.playAnim(anim);
    this.syncGun();
  }

  // Aim assist bends the shot toward the nearest enemy inside a small cone.
  assist(a) {
    const cone = this.scene.diff.aimAssist;
    if (!cone) return a;
    const ang = Math.atan2(a.y, a.x);
    let best = null;
    let bestD = 260;
    for (const u of this.scene.units) {
      if (!u.alive || u.team === this.team || u.team === 'neutral') continue;
      const d = Phaser.Math.Distance.Between(this.x, this.y, u.x, u.y);
      const ua = Math.atan2(u.y - this.y, u.x - this.x);
      if (d < bestD && Math.abs(Phaser.Math.Angle.Wrap(ua - ang)) < cone) {
        best = ua;
        bestD = d;
      }
    }
    return best === null ? a : { x: Math.cos(best), y: Math.sin(best) };
  }

  // Adds a picked-up weapon and switches to it. Never the same weapon twice.
  addWeapon(id) {
    if (this.weapons.some((w) => w.id === id)) return false;
    this.weapons.push({ id, def: WEAPONS[id] });
    this.cur = this.weapons.length - 1;
    this.equip(id);
    this.cooldown = 0.2;
    return true;
  }

  shoot() {
    const w = this.current;
    if (!w) return;
    const m = this.muzzlePoint();
    fireWeapon(this.scene, this, w.def, m.x, m.y, this.aim, 1);
    this.cooldown = w.def.playerRate ?? w.def.rate;
    if (w.def.splash) this.body.velocity.x -= this.aim.x * 40; // recoil
  }

  die(from) {
    this.alive = false;
    audio.sfx('down');
    this.scene.fx.puff(this.x, this.y, this.puffColor, true);
    this.scene.fx.shake(0.01, 250);
    if (this.gun) this.gun.setVisible(false);
    this.kit.cancel?.();
    this.disableBody(true, true);
    this.shadow?.();
    this.scene.onPlayerDown(this, from);
  }

  respawn(x, y) {
    this.enableBody(true, x, y, true, true);
    this.alive = true;
    this.health = this.stats.health;
    this.shields = this.stats.shields;
    this.invulnUntil = Math.max(this.invulnUntil ?? 0, this.scene.time.now + 2000);
    this.setVelocity(0, 0);
    this.scene.fx.teleportIn(this, this.shieldColor);
    this.equip(this.current?.id);
  }
}
