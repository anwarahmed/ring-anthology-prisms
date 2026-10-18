// Playable characters. Canon characters or generic canon roles only (docs/CAMPAIGN.md).
// kit: overrides the era's ability kit (src/engine/kits.js) when the character's own
// technology differs from the era's; extra: an additional kit power (e.g. 'camo').

export const CHARACTERS = {
  forthencho: {
    name: 'Forthencho', title: 'Lord of Admirals', faction: 'ancient-humans',
    body: 'humanoid', style: 'ancient-lord',
    pal: { armor: '#8a6d3b', helmet: '#a07f45', trim: '#e8c46a', visor: '#7fe0ff', dark: '#2a2018', cape: '#8c2433' },
    shields: 70, health: 100, speed: 115, jump: 385,
    weapons: ['ancient-rifle', 'ancient-cannon'], grenade: 'frag', kit: 'covenant',
  },
  'ancient-human-soldier': {
    name: 'Ancient Human Soldier', title: 'Defender of Charum Hakkor', faction: 'ancient-humans',
    body: 'humanoid', style: 'soldier',
    pal: { armor: '#6f6a4a', helmet: '#7d7752', trim: '#c9b26a', visor: '#9fefff', dark: '#26241a' },
    shields: 60, health: 100, speed: 120, jump: 390,
    weapons: ['ancient-rifle', 'ancient-cannon'], grenade: 'frag', kit: 'covenant',
  },
};
