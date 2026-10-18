// AI units: enemies, and allies when a script spawns them with `ally: true`.
// ai: behavior in src/engine/ai.js (walker | shooter | charger | flyer | turret | boss).
// entrance: how a unit appears when spawned (teleport | drop | fly | walk).
// puff: the color of the light puff a unit vanishes in when defeated.
// boss.attacks: pattern names from src/engine/ai.js, cycled in order.

export const UNITS = {
  'warrior-servant': {
    name: 'Forerunner Warrior-Servant', faction: 'forerunners', body: 'forerunner',
    pal: { armor: '#d6e2ee', trim: '#3a7fd0', dark: '#1c3352', glow: '#45e6ff' },
    health: 60, shields: 50, speed: 55, ai: 'shooter', weapon: 'hardlight-lance',
    range: 230, entrance: 'teleport', puff: '#7fd8ff', score: 100,
  },
  'warrior-servant-vanguard': {
    name: 'Warrior-Servant Vanguard', faction: 'forerunners', body: 'forerunner',
    pal: { armor: '#eef3f8', trim: '#f2b632', dark: '#1a2c4a', glow: '#7ff4ff' },
    health: 110, shields: 120, speed: 85, ai: 'charger', weapon: 'hardlight-scatter',
    range: 120, melee: 30, entrance: 'teleport', puff: '#bdf0ff', score: 250, scale: 1.15,
  },
  sentinel: {
    name: 'Sentinel', faction: 'forerunners', body: 'sentinel',
    pal: { armor: '#aeb8c4', trim: '#e2e8ee', dark: '#323c4c', glow: '#ffaa1e' },
    health: 35, shields: 0, speed: 70, ai: 'flyer', weapon: 'sentinel-beam',
    range: 200, entrance: 'fly', puff: '#ffc861', score: 60,
  },
  'ancient-human-defender': {
    name: 'Ancient Human Soldier', faction: 'ancient-humans', body: 'humanoid', style: 'soldier',
    pal: { armor: '#4f6234', helmet: '#5c6e3a', trim: '#d8b040', visor: '#4ff6ff', dark: '#2a2616' },
    health: 80, shields: 40, speed: 60, ai: 'shooter', weapon: 'ancient-rifle',
    range: 240, entrance: 'walk', puff: '#e8c46a', score: 0,
  },
  'ancient-human-heavy': {
    name: 'Ancient Human Heavy', faction: 'ancient-humans', body: 'humanoid', style: 'soldier',
    pal: { armor: '#5a4a34', helmet: '#6a583c', trim: '#d8b040', visor: '#ff8a3a', dark: '#2a2016' },
    health: 120, shields: 60, speed: 45, ai: 'shooter', weapon: 'ancient-cannon',
    range: 260, entrance: 'walk', puff: '#e8c46a', score: 150, burst: 1,
  },
  'sentinel-enforcer': {
    name: 'Sentinel Enforcer', faction: 'forerunners', body: 'sentinel', scale: 1.7,
    pal: { armor: '#8a96a8', trim: '#ffd27a', dark: '#262c3a', glow: '#ff7a1e' },
    health: 170, shields: 60, speed: 45, ai: 'flyer', weapon: 'enforcer-mortar',
    range: 260, entrance: 'fly', puff: '#ffaa1e', score: 300, burst: 1,
  },
  'flood-infection': {
    name: 'Flood Infection Form', faction: 'flood', body: 'infection',
    pal: { armor: '#d8d070', trim: '#fff4b0', dark: '#8a7a3a' },
    health: 6, shields: 0, speed: 95, ai: 'swarm', melee: 6,
    entrance: 'walk', puff: '#b8e04a', score: 10,
  },
  'flood-warrior': {
    name: 'Flood-Taken Warrior-Servant', faction: 'flood', body: 'forerunner', style: 'infected',
    pal: { armor: '#8a9a7a', trim: '#5a6a4a', dark: '#2a3a24', glow: '#c8f04a', cape: '#c8c060' },
    health: 70, shields: 0, speed: 70, ai: 'charger', melee: 22,
    entrance: 'walk', puff: '#b8e04a', score: 80,
  },
  'didact-npc': {
    name: 'The Didact', faction: 'forerunners', body: 'forerunner', scale: 1.15,
    pal: { armor: '#4a5060', trim: '#ff8a2a', dark: '#1c1e26', glow: '#ffa03a' },
    health: 999, shields: 0, speed: 0, ai: 'idle', entrance: 'teleport', puff: '#ffa03a', score: 0,
  },
  'forthencho-npc': {
    name: 'Forthencho', faction: 'ancient-humans', body: 'humanoid', style: 'ancient-lord',
    pal: { armor: '#a8742c', helmet: '#c88e34', trim: '#ffcc33', visor: '#35f0ff', dark: '#3a2214', cape: '#d4263c' },
    health: 999, shields: 0, speed: 0, ai: 'idle', entrance: 'walk', puff: '#ffcc33', score: 0,
  },
  // Covenant
  grunt: {
    name: 'Grunt', faction: 'covenant', body: 'grunt',
    pal: { armor: '#e08a2a', trim: '#c8b080', dark: '#3a3028', skin: '#7a8a8a', glow: '#5ad8ff' },
    health: 30, shields: 0, speed: 72, ai: 'shooter', weapon: 'plasma-pistol',
    range: 200, entrance: 'drop', puff: '#5ad8ff', score: 30,
  },
  'grunt-major': {
    name: 'Grunt Major', faction: 'covenant', body: 'grunt',
    pal: { armor: '#d03a3a', trim: '#c8b080', dark: '#3a3028', skin: '#7a8a8a', glow: '#5ad8ff' },
    health: 45, shields: 0, speed: 72, ai: 'shooter', weapon: 'needler',
    range: 210, entrance: 'drop', puff: '#5ad8ff', score: 45,
  },
  jackal: {
    name: 'Jackal', faction: 'covenant', body: 'jackal',
    pal: { armor: '#6a5a8a', trim: '#c8a070', dark: '#3a2a3a', skin: '#c8a878', glow: '#5ab8ff' },
    health: 40, shields: 0, speed: 65, ai: 'shooter', weapon: 'plasma-pistol',
    range: 230, entrance: 'drop', puff: '#5ab8ff', score: 50,
  },
  elite: {
    name: 'Elite Minor', faction: 'covenant', body: 'elite',
    pal: { armor: '#3a6ad8', trim: '#8ab0f0', dark: '#2a2a3a', skin: '#5a5048', glow: '#ff8a3a' },
    health: 70, shields: 80, speed: 90, ai: 'shooter', weapon: 'plasma-rifle',
    range: 240, entrance: 'drop', puff: '#5ab8ff', score: 120, burst: 4,
  },
  'elite-major': {
    name: 'Elite Major', faction: 'covenant', body: 'elite',
    pal: { armor: '#c83a3a', trim: '#f0a0a0', dark: '#2a2a3a', skin: '#5a5048', glow: '#ff8a3a' },
    health: 85, shields: 110, speed: 95, ai: 'shooter', weapon: 'plasma-rifle',
    range: 250, entrance: 'drop', puff: '#ff6a5a', score: 180, burst: 5,
  },
  'elite-specops': {
    name: 'Spec Ops Elite', faction: 'covenant', body: 'elite',
    pal: { armor: '#2e2e3a', trim: '#6a6a8a', dark: '#2a2a3a', skin: '#5a5048', glow: '#ff8a3a' },
    health: 85, shields: 120, speed: 100, ai: 'shooter', weapon: 'needler',
    range: 240, entrance: 'drop', puff: '#9a9ab8', score: 200, burst: 6,
  },
  'elite-zealot': {
    name: 'Elite Zealot', faction: 'covenant', body: 'elite',
    pal: { armor: '#e8b83a', trim: '#fff0a0', dark: '#2a2a3a', skin: '#5a5048', glow: '#ff8a3a' },
    health: 120, shields: 160, speed: 105, ai: 'charger', weapon: 'plasma-rifle',
    range: 220, melee: 40, entrance: 'drop', puff: '#ffd27a', score: 300,
  },
  hunter: {
    name: 'Hunter', faction: 'covenant', body: 'hunter',
    pal: { armor: '#34548a', trim: '#9ab0c8', dark: '#262c3a', skin: '#ff8a2a', glow: '#7aff5a' },
    health: 420, shields: 0, speed: 38, ai: 'charger', weapon: 'fuel-rod',
    range: 300, melee: 45, entrance: 'walk', puff: '#ff8a2a', score: 400,
  },
  'ghost-enemy': {
    name: 'Ghost', faction: 'covenant', body: 'ghost',
    pal: { armor: '#8a5ac8', trim: '#c8a8f0', dark: '#3a2a5a', glow: '#7ad8ff' },
    health: 160, shields: 0, speed: 150, ai: 'charger', weapon: 'ghost-plasma',
    range: 260, melee: 30, entrance: 'drop', puff: '#c8a8f0', score: 200,
  },
  'banshee-enemy': {
    name: 'Banshee', faction: 'covenant', body: 'banshee',
    pal: { armor: '#8a5ac8', trim: '#c8a8f0', dark: '#3a2a5a', glow: '#7aff5a' },
    health: 140, shields: 0, speed: 120, ai: 'flyer', weapon: 'banshee-plasma',
    range: 260, entrance: 'fly', puff: '#c8a8f0', score: 220,
  },
  // UNSC allies
  'marine-ally': {
    name: 'Marine', faction: 'unsc', body: 'humanoid', style: 'soldier',
    pal: { armor: '#5a6838', helmet: '#62703c', trim: '#8a8a6a', visor: '#3a3a3a', dark: '#2a2a20' },
    health: 90, shields: 30, speed: 70, ai: 'shooter', weapon: 'assault-rifle',
    range: 240, entrance: 'drop', puff: '#c8d870', score: 0,
  },
  // Flood combat forms (goofy-gross, never scary)
  'flood-marine': {
    name: 'Flood Combat Form', faction: 'flood', body: 'humanoid', style: 'soldier', infected: true,
    pal: { armor: '#6a7a4a', helmet: '#7a8a52', trim: '#5a6a3a', visor: '#c8f04a', dark: '#3a4a2a', cape: '#c8c060' },
    health: 60, shields: 0, speed: 80, ai: 'charger', melee: 18,
    entrance: 'walk', puff: '#b8e04a', score: 60,
  },
  'flood-elite': {
    name: 'Flood Combat Form', faction: 'flood', body: 'elite', infected: true,
    pal: { armor: '#6a7a9a', trim: '#5a6a7a', dark: '#3a4a3a', skin: '#8a8a5a', glow: '#c8f04a', cape: '#c8c060' },
    health: 90, shields: 0, speed: 90, ai: 'charger', melee: 24,
    entrance: 'walk', puff: '#b8e04a', score: 90,
  },
  'guilty-spark': {
    name: '343 Guilty Spark', faction: 'forerunners', body: 'monitor',
    pal: { armor: '#b8c0c8', trim: '#e8ecf0', dark: '#2a3040', glow: '#5ad8ff' },
    health: 999, shields: 0, speed: 0, ai: 'idle', entrance: 'teleport', puff: '#5ad8ff', score: 0,
  },
};
