// Combat rules shared by players, enemies and allies. Pure functions: unit-tested.

// Halo's sandbox: energy weapons strip shields fast, kinetic weapons hurt flesh.
export const TECH_VS = {
  ballistic: { shields: 0.75, health: 1.4 },
  plasma: { shields: 1.6, health: 0.8 },
  hardlight: { shields: 1.2, health: 1.2 },
  explosive: { shields: 1, health: 1 },
  melee: { shields: 1.3, health: 1.3 },
};

// Applies damage to {shields, health}; returns a new state plus what happened.
export function applyDamage(state, amount, tech = 'ballistic') {
  const vs = TECH_VS[tech] ?? TECH_VS.ballistic;
  let shields = state.shields;
  let health = state.health;
  let shieldBroke = false;
  if (shields > 0) {
    const toShield = amount * vs.shields;
    if (toShield >= shields) {
      // The overflow carries into health at the health multiplier.
      const leftover = (toShield - shields) / vs.shields;
      shields = 0;
      shieldBroke = true;
      health -= leftover * vs.health;
    } else {
      shields -= toShield;
    }
  } else {
    health -= amount * vs.health;
  }
  health = Math.max(0, health);
  return { shields, health, shieldBroke, dead: health <= 0 };
}

export function scaleEnemy(def, diff) {
  return {
    health: Math.round(def.health * diff.enemyHealth),
    shields: Math.round((def.shields ?? 0) * diff.enemyHealth),
    damage: diff.enemyDamage,
  };
}

// Picks the 8-way aim direction from stick/keys. Down only aims down in the air.
export function aimFrom(x, y, facing, onGround) {
  const ax = Math.abs(x) > 0.3 ? Math.sign(x) : 0;
  let ay = Math.abs(y) > 0.3 ? Math.sign(y) : 0;
  if (ay > 0 && onGround) ay = 0;
  if (ax === 0 && ay === 0) return { x: facing, y: 0 };
  const len = Math.hypot(ax, ay);
  return { x: ax / len, y: ay / len };
}
