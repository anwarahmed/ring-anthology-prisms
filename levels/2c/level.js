// 2c · The Silent Cartographer. Spec: docs/CAMPAIGN.md (2c).
// Canon checked against Halo: Combat Evolved (2026-10-18). Layouts and enemy placement are staging.

export default {
  id: '2c',
  title: 'The Silent Cartographer',
  era: 'covenant',
  theme: 'installation-04-beach',
  music: 'ring-world',
  players: ['master-chief', 'marine'],

  archive: {
    before: [
      {
        title: 'The Map Room', when: 'September 2552', where: 'Installation 04',
        text: 'Cortana learned that the ring held a map room, the Silent Cartographer, which could lead them to Halo\'s Control Room.',
        source: 'Halo: Combat Evolved',
        scene: 'M=master-chief@0.3; M glow #7ad8ff; M talk; beam 0.74 #9ff4ff',
      },
      {
        title: 'Beach Landing', where: 'An island on Installation 04',
        text: 'The Chief and a team of Marines landed on the island\'s beach by Pelican, straight into the Covenant\'s defenses.',
        source: 'Halo: Combat Evolved',
        scene: 'ship unsc -0.2>0.34 0.3; M=master-chief@0.34 & K=marine@0.22 & L=marine@0.44; G=grunt@0.72< & J=jackal@0.82< & H=hunter@0.93<; M fire H & K fire G & L fire J; G down & J down',
      },
    ],
    after: [
      {
        title: 'The Way Forward', where: 'Installation 04',
        text: 'The Silent Cartographer showed the way to the Control Room. Captain Keyes, meanwhile, had gone looking for a Covenant weapons cache.',
        source: 'Halo: Combat Evolved',
        scene: 'beam 0.62 #9ff4ff; M=master-chief@0.3; M face >; M>>0.82',
      },
    ],
  },

  legend: {
    w: { vehicle: 'warthog' },
  },

  map: [
    '#...................................................................................................########################################################################################################################',
    '#...................................................................................................########################################################################################################################',
    '#...................................................................................................::::::::::::###################::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#...................................................................................................::::::::::::###################::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#...................................................................................................::::::::::::###################::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#...................................................................................................::::::::::::###################::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#...................................................................................................::::::::::::###################:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::M::::::::::::::::::::::#',
    '#.......................................................................=======.....................::::::::::::::::::::::::::::::::::::::::::::::::=======:::::::::::::::::::::::::::::::::::::::=======::::::::::::::::::#',
    '#...................................................................................................:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#..............................................................======............======.............:::::::::::::::::::::::::::::::::::::::======::::::::::::======::::::::::::::::::::::======::::::::::::======::::::::::#',
    '#...................................................................................................:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#.......................................#########.........................#.........................::::::::::::::::::::::::::::::::::::::::::::::::::#:::::::::::::::::::::::::::::::::::::::::::::#::::::::::::::::::::::#',
    '#..P..........................A.........#########...........B.............#.........G..C....w.......::::D:::::::::::::::::::::::::::::::E:::::::::::::#:::::::::H::F::^^^:::::::::::::J:::::::::::::#:::::::::L::K:::::::::#',
    '############################################################################################################################################################################################################################',
    '############################################################################################################################################################################################################################',
    '############################################################################################################################################################################################################################',
    '############################################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ call: 'dropIn' }, { objective: 'Take the beach' }, { allies: [{ unit: 'marine-ally', n: 2, from: 'sky' }] }, { spawn: [{ unit: 'grunt', n: 3, from: 'right' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: 'jackal', n: 2, from: 'right' }, { unit: 'grunt', n: 2, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Clear the beach' },
        { intensity: 1 },
        { wave: [{ unit: 'grunt', n: 4, from: 'G' }, { unit: 'jackal', n: 2, from: 'G' }] },
        { wave: [{ unit: 'elite', n: 2, from: 'G' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Drive to the facility' },
      ],
    },
    { on: 'D', do: [{ objective: 'Find the Silent Cartographer' }, { spawn: [{ unit: 'elite', n: 1, from: 'right' }, { unit: 'grunt', n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Push deeper' },
        { wave: [{ unit: 'elite-specops', n: 1, from: 'H' }, { unit: 'jackal', n: 2, from: 'H' }] },
        { wave: [{ unit: 'elite', n: 2, from: 'H' }, { unit: 'grunt', n: 3, from: 'right' }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    {
      on: 'J',
      do: [
        { lock: ['J', 'K'] },
        { intensity: 2 },
        { objective: 'Flank the Hunters: their shields only cover the front' },
        { spawn: [{ unit: 'hunter', n: 1, from: 'M' }] },
        { boss: { unit: 'hunter', from: 'L', title: 'Hunters', subtitle: 'Mgalekgolo' } },
        { call: 'clearHunters' },
        { call: 'cartographer' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    // A Pelican drop: the players fall in from above the beach.
    dropIn(api) {
      for (const p of api.players) {
        p.body.reset(p.x, -40);
        api.fx.ring(p.x, 40, 0xffffff, 1);
      }
      api.fx.shake(0.008, 300);
    },
    // Hunters come in pairs: the boss fight ends when both are down.
    async clearHunters(api) {
      await new Promise((res) => {
        const ev = api.scene.time.addEvent({ delay: 200, loop: true, callback: () => {
          if (!api.scene.units.some((u) => u.alive && u.id === 'hunter')) { ev.remove(); res(); }
        } });
      });
    },
    async cartographer(api) {
      api.hud.letterbox(true);
      api.fx.flash(0x7ad8ff, 500);
      api.fx.slowmo(0.5, 1500);
      await api.hud.say('The Silent Cartographer revealed the way to the Control Room.', null, null, 3.5);
    },
  },
};
