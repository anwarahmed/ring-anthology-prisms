// 2d · 343 Guilty Spark. Spec: docs/CAMPAIGN.md (2d).
// Canon checked against Halo: Combat Evolved; Halopedia: The Flood, 343 Guilty Spark (2026-10-18). Layouts and enemy placement are staging.

export default {
  id: '2d',
  title: '343 Guilty Spark',
  era: 'covenant',
  theme: 'installation-04-swamp',
  music: 'flood-dread',
  players: ['master-chief', 'marine'],

  archive: {
    before: [
      {
        title: 'The Swamp', when: 'September 2552', where: 'Installation 04',
        text: 'Captain Keyes and his team went into a swamp looking for Covenant weapons. They did not come back. The Chief went after them.',
        source: 'Halo: Combat Evolved',
        scene: 'dark; K=marine@0.4 & L=marine@0.5; K>1.1 & L>1.2; M=master-chief@-0.1; M>0.4',
      },
    ],
    after: [
      {
        title: 'The Flood', where: 'Installation 04',
        text: 'Keyes had found something worse than the Covenant: the Flood, which the ring had kept locked away for a hundred thousand years.',
        source: 'Halo: Combat Evolved',
        scene: 'F=flood-marine@0.72< & I=flood-infection@0.6< & J=flood-infection@0.84<; flood 0.72; M=master-chief@0.2; M fire I; I down; M fire F',
      },
      {
        title: 'The Index', where: 'Installation 04',
        text: '343 Guilty Spark took the Chief to fetch the Index, the key to firing Halo, so the Flood could be stopped.',
        source: 'Halo: Combat Evolved',
        scene: 'S=guilty-spark@0.56,0.34<; M=master-chief@0.28; S talk; beam 0.82 #9ff4ff; M>0.7; M glow #9ff4ff',
      },
      {
        title: 'Two Betrayals', where: 'Installation 04',
        text: 'Then Cortana learned the truth. Firing Halo would end all life big enough to feed the Flood, across the galaxy. The Chief refused to fire it.',
        source: 'Halo: Combat Evolved',
        scene: 'S=guilty-spark@0.72,0.34<; M=master-chief@0.3; M glow #7ad8ff; M talk; S talk; M face <; S glow #ff6a6a',
      },
    ],
  },

  legend: {},

  map: [
    '#................................................................................................................................................................................................................#',
    '#................................................................................................................................................................................................................#',
    '#................................................................................................................................................................................................................#',
    '#...........................................................:::::::::::::::::::::::::::...............................::::::::::::::::::::::::::::..............................::::::::::::::::::::::::::::.....#',
    '#...........................................................:::::::::::::::::::::::::::...............................::::::::::::::::::::::::::::..............................::::::::::::::::::::::::::::.....#',
    '#...........................................................:::::::::::::::::::::::::::...............................::::::::::::::::::::::::::::..............................::::::::::::::::::::::::::::.....#',
    '#...........................................................:::::::::::::::::::::::::::...............................::::::::::::::::::::::::::::..............................::::::::::::::M:::::::::::::.....#',
    '#...........................................................::::::::::::=======::::::::...............................::::::::::::=======:::::::::..............................::::::::::::=======:::::::::.....#',
    '#...........................................................:::::::::::::::::::::::::::...............................::::::::::::::::::::::::::::..............................::::::::::::::::::::::::::::.....#',
    '#...........................................................:::======::::::::::::======...............................:::======::::::::::::======:..............................:::======::::::::::::======:.....#',
    '#...........................................................:::::::::::::::::::::::::::...............................::::::::::::::::::::::::::::..............................::::::::::::::::::::::::::::.....#',
    '#...........................................................::::::::::::::#::::::::::::...............................::::::::::::::#:::::::::::::..............................::::::::::::::#:::::::::::::.....#',
    '#..P....................^^^^..A...................^^^^......B:::::::::::::#:::::::::G::C....^^^^D.....................E:::::::::::::#:::::::::H::F....^^^^......................J:::::::::::::#:::::::::L::K.....#',
    '##################################################################################################################################################################################################################',
    '##################################################################################################################################################################################################################',
    '##################################################################################################################################################################################################################',
    '##################################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: "Find Captain Keyes's team" }, { allies: [{ unit: 'marine-ally', n: 1, from: 'sky' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: 'flood-infection', n: 5, from: 'right', gap: 0.3 }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Something is coming' },
        { intensity: 1 },
        { wave: [{ unit: 'flood-infection', n: 8, from: 'sky', gap: 0.2 }] },
        { wave: [{ unit: 'flood-marine', n: 3, from: 'G' }, { unit: 'flood-infection', n: 4, from: 'right' }] },
        { wave: [{ unit: 'flood-elite', n: 2, from: 'G' }, { unit: 'flood-marine', n: 2, from: 'right' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Get out of the swamp' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: 'flood-marine', n: 2, from: 'right' }, { unit: 'flood-infection', n: 6, from: 'right', gap: 0.25 }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold out' },
        { hold: { seconds: 45, every: 5, label: 'HOLD', groups: [
          [{ unit: 'flood-infection', n: 6, from: 'sky', gap: 0.2 }],
          [{ unit: 'flood-marine', n: 2, from: 'H' }],
          [{ unit: 'flood-elite', n: 1, from: 'H' }, { unit: 'flood-infection', n: 4, from: 'right' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    {
      on: 'J',
      do: [
        { lock: ['J', 'K'] },
        { objective: 'Survive' },
        { intensity: 2 },
        { wave: [{ unit: 'flood-elite', n: 2, from: 'L' }, { unit: 'flood-marine', n: 3, from: 'M' }] },
        { wave: [{ unit: 'flood-elite', n: 3, from: 'L' }, { unit: 'flood-infection', n: 8, from: 'sky' }] },
        { call: 'spark' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    // The Monitor of Installation 04 appears.
    async spark(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      const p = api.players.find((pl) => pl.alive) ?? api.players[0];
      scene.spawnUnit('guilty-spark', p.x + 60, p.y - 40, { team: 'neutral' });
      fx.slowmo(0.5, 1500);
      await hud.say('A Monitor appeared: 343 Guilty Spark. He took the Chief away in a flash of light.', null, null, 4);
      fx.flash(0x9ff4ff, 800);
    },
  },
};
