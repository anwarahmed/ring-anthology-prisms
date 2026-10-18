// Weapon catalog. tech sets damage vs shields/health (src/engine/rules.js).
// rate: seconds between shots (ammo is unlimited and there is no reloading);
// projectile: bullet | bolt | beam | orb; splash: explosion radius in px.
// gun: how the held weapon is drawn: kind (src/content/guns.js), length in px, colors.

export const WEAPONS = {
  'ancient-rifle': {
    name: 'Ancient Rifle', tech: 'ballistic', rate: 0.14, damage: 9, speed: 560, spread: 0.035,
    projectile: 'bullet', color: '#ffd27a', sfx: 'rifle',
    gun: { kind: 'rifle', len: 16, body: '#7a6a4a', dark: '#3a3226', accent: '#ffd27a' },
  },
  'ancient-cannon': {
    name: 'Ancient Cannon', tech: 'explosive', rate: 0.85, damage: 40, speed: 360, spread: 0,
    projectile: 'orb', splash: 28, color: '#ff9a3d', sfx: 'cannon',
    gun: { kind: 'cannon', len: 17, body: '#8a6d3b', dark: '#3a2c1c', accent: '#ff9a3d' },
  },
  'hardlight-lance': {
    name: 'Hard-Light Lance', tech: 'hardlight', rate: 1.1, damage: 12, speed: 320, spread: 0.05,
    projectile: 'beam', color: '#7fd8ff', sfx: 'hardlight',
    gun: { kind: 'lance', len: 17, body: '#c3ccd6', dark: '#56687a', accent: '#7fd8ff' },
  },
  'hardlight-scatter': {
    name: 'Hard-Light Scatter', tech: 'hardlight', rate: 1.6, damage: 7, speed: 300, spread: 0.3,
    pellets: 5, projectile: 'bolt', color: '#a8e6ff', sfx: 'hardlight',
    gun: { kind: 'scatter', len: 13, body: '#d0d8e0', dark: '#3d6f96', accent: '#bdf0ff' },
  },
  'sentinel-beam': {
    name: 'Sentinel Beam', tech: 'hardlight', rate: 0.5, damage: 6, speed: 380, spread: 0.06,
    projectile: 'beam', color: '#ffc861', sfx: 'beam',
    gun: null,
  },
};

// Grenade types, picked by character. fuse: seconds; stick: sticks to targets.
export const GRENADES = {
  frag: { name: 'Frag', damage: 55, radius: 40, fuse: 1.6, bounce: 0.5, stick: false, color: '#9acd32' },
  plasma: { name: 'Plasma', damage: 70, radius: 36, fuse: 1.4, bounce: 0, stick: true, color: '#5fd3ff' },
  pulse: { name: 'Pulse', damage: 45, radius: 48, fuse: 1.2, bounce: 0.2, stick: false, color: '#7fd8ff' },
};
