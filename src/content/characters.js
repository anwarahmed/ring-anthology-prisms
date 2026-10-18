// Playable characters. Canon characters or generic canon roles only (docs/CAMPAIGN.md).
// short: the name shown on the HUD when `name` is long.
// kit: overrides the era's ability kit (src/engine/kits.js) when the character's own
// technology differs from the era's; extra: an additional kit power (e.g. 'camo').

export const CHARACTERS = {
  forthencho: {
    name: 'Forthencho', title: 'Lord of Admirals', faction: 'ancient-humans',
    body: 'humanoid', style: 'ancient-lord',
    pal: { armor: '#a8742c', helmet: '#c88e34', trim: '#ffcc33', visor: '#35f0ff', dark: '#3a2214', cape: '#d4263c' },
    shields: 70, health: 100, speed: 115, jump: 385,
    weapons: ['ancient-rifle', 'ancient-cannon'], grenade: 'frag', kit: 'covenant',
  },
  'ancient-human-soldier': {
    name: 'Ancient Human Soldier', short: 'Soldier', title: 'Defender of Charum Hakkor', faction: 'ancient-humans',
    body: 'humanoid', style: 'soldier',
    pal: { armor: '#4f6234', helmet: '#5c6e3a', trim: '#d8b040', visor: '#4ff6ff', dark: '#2a2616' },
    shields: 60, health: 100, speed: 120, jump: 390,
    weapons: ['ancient-rifle', 'ancient-cannon'], grenade: 'frag', kit: 'covenant',
  },
  didact: {
    name: 'The Didact', title: 'Supreme Commander of the Prometheans', faction: 'forerunners',
    body: 'forerunner',
    pal: { armor: '#4a5060', trim: '#ff8a2a', dark: '#1c1e26', glow: '#ffa03a' },
    shields: 130, health: 100, speed: 120, jump: 400,
    weapons: ['suppressor', 'light-rifle'], grenade: 'pulse',
  },
  'forerunner-warrior': {
    name: 'Forerunner Warrior-Servant', short: 'Warrior-Servant', title: 'Promethean', faction: 'forerunners',
    body: 'forerunner',
    pal: { armor: '#d6e2ee', trim: '#3a7fd0', dark: '#1c3352', glow: '#45e6ff' },
    shields: 110, health: 100, speed: 122, jump: 400,
    weapons: ['suppressor', 'light-rifle'], grenade: 'pulse',
  },
  bornstellar: {
    name: 'Bornstellar', title: 'Manipular', faction: 'forerunners',
    body: 'forerunner',
    pal: { armor: '#eef2fa', trim: '#9a7ae8', dark: '#2a2a4a', glow: '#b8a0ff' },
    shields: 100, health: 100, speed: 124, jump: 405,
    weapons: ['suppressor'], grenade: 'pulse',
  },
  chakas: {
    name: 'Chakas', title: 'Human of Erde-Tyrene', faction: 'humans',
    body: 'humanoid', style: 'primitive',
    pal: { armor: '#b07a3a', trim: '#e8c070', dark: '#3a2414', skin: '#a8683c' },
    shields: 40, health: 100, speed: 126, jump: 395,
    weapons: [], grenade: 'frag', kit: 'covenant',
  },
  sanshyuum: {
    name: "San'Shyuum", title: 'Defender of Janjur Qom', faction: 'sanshyuum',
    body: 'humanoid', style: 'sanshyuum',
    pal: { armor: '#7a4a9a', trim: '#f0c040', dark: '#3a2040', cape: '#8a52b0', skin: '#b8a07a' },
    shields: 70, health: 100, speed: 116, jump: 385,
    weapons: ['sanshyuum-rifle'], grenade: 'plasma', kit: 'covenant',
  },
  'master-chief': {
    name: 'Master Chief', title: 'John-117', faction: 'unsc',
    body: 'humanoid', style: 'spartan',
    pal: { armor: '#5c7038', helmet: '#62763c', trim: '#3c4a28', visor: '#ffb83a', dark: '#22261c' },
    shields: 120, health: 100, speed: 125, jump: 400,
    weapons: ['assault-rifle', 'magnum'], grenade: 'frag',
  },
  marine: {
    name: 'UNSC Marine', short: 'Marine', title: 'UNSC Marine Corps', faction: 'unsc',
    body: 'humanoid', style: 'soldier',
    pal: { armor: '#5a6838', helmet: '#62703c', trim: '#8a8a6a', visor: '#3a3a3a', dark: '#2a2a20' },
    shields: 60, health: 100, speed: 120, jump: 390,
    weapons: ['assault-rifle', 'shotgun'], grenade: 'frag',
  },
  zamamee: {
    name: "Zuka 'Zamamee", short: "'Zamamee", title: 'Special Operations Officer', faction: 'covenant',
    body: 'elite',
    pal: { armor: '#2e2e3a', trim: '#6a6a8a', dark: '#1a1a24', skin: '#5a5048', glow: '#ff8a3a' },
    shields: 120, health: 100, speed: 128, jump: 410,
    weapons: ['plasma-rifle', 'needler'], grenade: 'plasma', extra: 'camo',
  },
  yayap: {
    name: 'Yayap', title: 'Unggoy', faction: 'covenant',
    body: 'grunt',
    pal: { armor: '#e08a2a', trim: '#c8b080', dark: '#3a3028', skin: '#7a8a8a', glow: '#5ad8ff' },
    shields: 40, health: 100, speed: 118, jump: 380,
    weapons: ['plasma-pistol', 'needler'], grenade: 'plasma',
  },
};
