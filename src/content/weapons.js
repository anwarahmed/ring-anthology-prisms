// Weapon catalog. tech sets damage vs shields/health (src/engine/rules.js).
// rate: seconds between shots (ammo is unlimited and there is no reloading);
// playerRate: a faster rate when a player picks it up (enemy weapons fire slowly on
// purpose, so players can dodge them).
// projectile: bullet | bolt | beam | orb; splash: explosion radius in px; life: how
// long a shot lasts in ms (default 1800; short for swords and hammers).
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
    name: 'Hard-Light Lance', tech: 'hardlight', rate: 1.1, playerRate: 0.3, damage: 12, speed: 320, spread: 0.05,
    projectile: 'beam', color: '#7fd8ff', sfx: 'hardlight',
    gun: { kind: 'lance', len: 17, body: '#c3ccd6', dark: '#56687a', accent: '#7fd8ff' },
  },
  'hardlight-scatter': {
    name: 'Hard-Light Scatter', tech: 'hardlight', rate: 1.6, playerRate: 0.6, damage: 7, speed: 300, spread: 0.3,
    pellets: 5, projectile: 'bolt', color: '#a8e6ff', sfx: 'hardlight',
    gun: { kind: 'scatter', len: 13, body: '#d0d8e0', dark: '#3d6f96', accent: '#bdf0ff' },
  },
  // Forerunner weapons for players (Promethean designs; staging in the Forerunner era).
  suppressor: {
    name: 'Suppressor', tech: 'hardlight', rate: 0.11, damage: 8, speed: 540, spread: 0.05,
    projectile: 'bolt', color: '#ffa03a', sfx: 'hardlight',
    gun: { kind: 'scatter', len: 13, body: '#c8ccd8', dark: '#3a3f4a', accent: '#ffa03a' },
  },
  'light-rifle': {
    name: 'Light Rifle', tech: 'hardlight', rate: 0.42, damage: 28, speed: 720, spread: 0.01,
    projectile: 'beam', color: '#ff8a2a', sfx: 'hardlight',
    gun: { kind: 'lance', len: 18, body: '#d8dce8', dark: '#3a4050', accent: '#ff8a2a' },
  },
  'sanshyuum-rifle': {
    name: "San'Shyuum Rifle", tech: 'plasma', rate: 0.16, damage: 9, speed: 500, spread: 0.04,
    projectile: 'bolt', color: '#d08aff', sfx: 'plasma',
    gun: { kind: 'rifle', len: 15, body: '#d8a840', dark: '#5a3a2a', accent: '#d08aff' },
  },
  'enforcer-mortar': {
    name: 'Enforcer Mortar', tech: 'hardlight', rate: 2.2, damage: 22, speed: 240, spread: 0.08,
    projectile: 'orb', splash: 30, color: '#ff9a2a', sfx: 'cannon', gun: null,
  },
  // UNSC
  'assault-rifle': {
    name: 'Assault Rifle', tech: 'ballistic', rate: 0.09, damage: 6, speed: 640, spread: 0.06,
    projectile: 'bullet', color: '#ffe08a', sfx: 'rifle',
    gun: { kind: 'rifle', len: 17, body: '#4e5c3c', dark: '#22281c', accent: '#9aff6a' },
  },
  magnum: {
    name: 'Magnum', tech: 'ballistic', rate: 0.32, damage: 22, speed: 720, spread: 0.01,
    projectile: 'bullet', color: '#fff0b0', sfx: 'rifle',
    gun: { kind: 'pistol', len: 9, body: '#8a8e96', dark: '#3a3c42', accent: '#c8d0dc' },
  },
  shotgun: {
    name: 'Shotgun', tech: 'ballistic', rate: 0.8, damage: 10, speed: 560, spread: 0.22,
    pellets: 6, projectile: 'bullet', color: '#ffd27a', sfx: 'cannon',
    gun: { kind: 'rifle', len: 15, body: '#3e3e42', dark: '#1e1e22', accent: '#ff8a3a' },
  },
  'rocket-launcher': {
    name: 'Rocket Launcher', tech: 'explosive', rate: 1.2, damage: 60, speed: 340, spread: 0,
    projectile: 'orb', splash: 42, color: '#ffb04a', sfx: 'cannon',
    gun: { kind: 'cannon', len: 20, body: '#5a6a44', dark: '#2a3020', accent: '#ffb04a' },
  },
  // Covenant
  'plasma-pistol': {
    name: 'Plasma Pistol', tech: 'plasma', rate: 0.45, playerRate: 0.2, damage: 9, speed: 420, spread: 0.06,
    projectile: 'bolt', color: '#7aff5a', sfx: 'plasma',
    gun: { kind: 'pistol', len: 9, body: '#a8b8d0', dark: '#4a5a78', accent: '#7aff5a' },
  },
  'plasma-rifle': {
    name: 'Plasma Rifle', tech: 'plasma', rate: 0.14, playerRate: 0.1, damage: 7, speed: 470, spread: 0.07,
    projectile: 'bolt', color: '#5ab8ff', sfx: 'plasma',
    gun: { kind: 'plasma', len: 15, body: '#b8a8e0', dark: '#4a3a78', accent: '#5ab8ff' },
  },
  needler: {
    name: 'Needler', tech: 'plasma', rate: 0.12, playerRate: 0.09, damage: 5, speed: 420, spread: 0.1,
    projectile: 'bolt', color: '#ff5ad0', sfx: 'beam',
    gun: { kind: 'needler', len: 14, body: '#8a5ab0', dark: '#3a2a50', accent: '#ff7ae0' },
  },
  'fuel-rod': {
    name: 'Assault Cannon', tech: 'explosive', rate: 2.4, damage: 30, speed: 260, spread: 0.04,
    projectile: 'orb', splash: 36, color: '#7aff5a', sfx: 'cannon', gun: null,
  },
  carbine: {
    name: 'Covenant Carbine', tech: 'plasma', rate: 0.32, damage: 18, speed: 760, spread: 0.01,
    projectile: 'beam', color: '#7aff5a', sfx: 'beam',
    gun: { kind: 'rifle', len: 19, body: '#7a7a5a', dark: '#3a3a2a', accent: '#7aff5a' },
  },
  'energy-sword': {
    name: 'Energy Sword', tech: 'melee', rate: 0.5, playerRate: 0.35, damage: 45, speed: 420, spread: 0, life: 130,
    projectile: 'beam', color: '#7ad8ff', sfx: 'hardlight',
    gun: { kind: 'sword', len: 15, body: '#4a4a5a', dark: '#2a2a3a', accent: '#7ad8ff' },
  },
  // Jiralhanae
  spiker: {
    name: 'Spiker', tech: 'ballistic', rate: 0.13, playerRate: 0.1, damage: 7, speed: 520, spread: 0.07,
    projectile: 'bullet', color: '#ff9a3a', sfx: 'rifle',
    gun: { kind: 'spiker', len: 14, body: '#5a5a62', dark: '#2a2a2e', accent: '#c8c8d0' },
  },
  'brute-shot': {
    name: 'Brute Shot', tech: 'explosive', rate: 1.0, playerRate: 0.7, damage: 32, speed: 330, spread: 0.02,
    projectile: 'orb', splash: 30, color: '#ff8a3a', sfx: 'cannon',
    gun: { kind: 'spiker', len: 18, body: '#6a5a4a', dark: '#2e2622', accent: '#d8d0c8' },
  },
  'gravity-hammer': {
    name: 'Gravity Hammer', tech: 'melee', rate: 0.9, playerRate: 0.6, damage: 70, speed: 380, spread: 0, life: 150,
    projectile: 'orb', splash: 26, color: '#7ab8ff', sfx: 'cannon',
    gun: { kind: 'hammer', len: 18, body: '#4a4a52', dark: '#26262c', accent: '#7ab8ff' },
  },
  // Jiralhanae packs before the Covenant: their own slug-throwing rifles.
  'pack-rifle': {
    name: 'Jiralhanae Pack Rifle', tech: 'ballistic', rate: 0.5, playerRate: 0.25, damage: 14, speed: 560, spread: 0.04,
    projectile: 'bullet', color: '#ffd27a', sfx: 'rifle',
    gun: { kind: 'rifle', len: 18, body: '#6a4a32', dark: '#2a1e16', accent: '#c8a070' },
  },
  // UNSC, 2552
  dmr: {
    name: 'DMR', tech: 'ballistic', rate: 0.36, damage: 24, speed: 820, spread: 0.008,
    projectile: 'bullet', color: '#fff0b0', sfx: 'rifle',
    gun: { kind: 'rifle', len: 19, body: '#4a4e52', dark: '#22242a', accent: '#9ad8ff' },
  },
  'battle-rifle': {
    name: 'Battle Rifle', tech: 'ballistic', rate: 0.42, damage: 9, speed: 800, spread: 0.02,
    pellets: 3, projectile: 'bullet', color: '#fff0b0', sfx: 'rifle',
    gun: { kind: 'rifle', len: 18, body: '#4a4e46', dark: '#22241e', accent: '#ffd27a' },
  },
  'silenced-smg': {
    name: 'Silenced SMG', tech: 'ballistic', rate: 0.07, damage: 4, speed: 600, spread: 0.08,
    projectile: 'bullet', color: '#d8e0ff', sfx: 'rifle',
    gun: { kind: 'pistol', len: 13, body: '#3a3e46', dark: '#1a1c22', accent: '#9ab8ff' },
  },
  'scarab-cannon': {
    name: 'Scarab Cannon', tech: 'plasma', rate: 0.5, damage: 18, speed: 520, spread: 0.06,
    projectile: 'beam', splash: 22, color: '#7aff5a', sfx: 'beam', gun: null,
  },
  'flood-spores': {
    name: 'Flood Spores', tech: 'plasma', rate: 0.9, damage: 14, speed: 260, spread: 0.2,
    pellets: 3, projectile: 'orb', splash: 18, color: '#b8e04a', sfx: 'cannon', gun: null,
  },
  // Training rounds (Spartan training on Reach): light, harmless-looking paint bolts.
  'training-rifle': {
    name: 'Training Rifle', tech: 'ballistic', rate: 0.12, damage: 8, speed: 600, spread: 0.04,
    projectile: 'bullet', color: '#7aff9a', sfx: 'rifle',
    gun: { kind: 'rifle', len: 16, body: '#5a5e66', dark: '#2a2c32', accent: '#7aff9a' },
  },
  // Vehicle guns
  'warthog-chaingun': {
    name: 'Chaingun', tech: 'ballistic', rate: 0.06, damage: 6, speed: 700, spread: 0.05,
    projectile: 'bullet', color: '#ffe08a', sfx: 'rifle', gun: null,
  },
  'ghost-plasma': {
    name: 'Ghost Cannons', tech: 'plasma', rate: 0.13, damage: 8, speed: 520, spread: 0.04,
    projectile: 'bolt', color: '#5ab8ff', sfx: 'plasma', gun: null,
  },
  'banshee-plasma': {
    name: 'Banshee Cannons', tech: 'plasma', rate: 0.12, damage: 8, speed: 540, spread: 0.04,
    projectile: 'bolt', color: '#7aff5a', sfx: 'plasma', gun: null,
  },
  'chopper-cannons': {
    name: 'Chopper Cannons', tech: 'ballistic', rate: 0.11, damage: 9, speed: 600, spread: 0.05,
    projectile: 'bullet', color: '#ffb04a', sfx: 'rifle', gun: null,
  },
  'scorpion-cannon': {
    name: 'Scorpion Cannon', tech: 'explosive', rate: 1.1, damage: 60, speed: 420, spread: 0,
    projectile: 'orb', splash: 44, color: '#ffd27a', sfx: 'cannon', gun: null,
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
