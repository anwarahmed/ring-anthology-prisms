// 3f · Doisac. Spec: docs/CAMPAIGN.md (3f).
// Canon checked against Halopedia: Jiralhanae, Doisac, Maccabeus (2026-10-18). The
// pack battles are staging; the Great Immolation, the rediscovered radio and rockets,
// the Covenant's arrival, Maccabeus's pack joining quickly and the absorption of the
// packs that resisted are canon.

const pk = 'jiralhanae-pack';

export default {
  id: '3f',
  title: 'Doisac',
  era: 'covenant',
  theme: 'doisac',
  music: 'banished-rise',
  players: ['jiralhanae', 'jiralhanae'],

  archive: {
    before: [
      {
        title: 'The Great Immolation', where: 'Doisac',
        text: 'On Doisac, the Jiralhanae packs once fought a war so terrible that they nearly destroyed themselves. It was called the Great Immolation.',
        source: 'Halopedia: Jiralhanae; Doisac',
        scene: 'bg sky #4a2010 #c85a2a #3a2010; boom 0.3 0.8 big; fire 0.2 & fire 0.5 & fire 0.82; B=jiralhanae@0.38 & C=jiralhanae-pack@0.66<; B fire C & C fire B; boom 0.6 0.7 big',
      },
      {
        title: 'Starting Again', when: '2492', where: 'Doisac',
        text: 'Slowly the Jiralhanae rebuilt. They had only just rediscovered radio and rockets, and the packs still fought each other.',
        source: 'Halopedia: Jiralhanae',
        scene: 'B=jiralhanae@0.22 & C=jiralhanae@0.34; R=jiralhanae-pack@0.8<; B talk; B fire R & R fire C; fire 0.66',
      },
    ],
    after: [
      {
        title: 'The Covenant Arrives', when: '2492', where: 'Doisac',
        text: 'The Covenant came to Doisac. Some packs, like Chieftain Maccabeus\'s, joined quickly. The packs that resisted were defeated and brought into the Covenant.',
        source: 'Halopedia: Jiralhanae; Maccabeus',
        scene: 'ship covenant 1.2>0.62 0.16 big; M=maccabeus@0.3; M kneel; P=jiralhanae-pack@0.78<; E=elite@0.6<; E fire P; P kneel',
      },
    ],
  },

  legend: {},

  map: [
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#....................................................======......................................................===========..........................................========.........................#',
    '#.......====.........................................=======.......................=======.....======.................................................................::::::::.........................#',
    '#...............................=======.........................................................................................................................=====.::::::::.........................#',
    '#.........========..............:::::::......................=====........................##.#.......................======..................========.................::::::::===......................#',
    '#...........................##..:::::::...................................................##.#.......................:::####.................::::::...................::::###::::......................#',
    '#..P....................A...##..::::^^^.........B..........####.......G...C...............##D#..^^^.........E........:::####.......M...F.....:::::^^^.........H.......::::###::::....L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Win the pack war' }] },
    { on: 'A', do: [{ spawn: [{ unit: pk, n: 2, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Break the rival pack' },
        { intensity: 1 },
        { wave: [{ unit: pk, n: 3, from: 'right' }] },
        { wave: [{ unit: pk, n: 2, from: 'G' }, { unit: pk, n: 2, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Take the ruined city' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: pk, n: 3, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the ruins' },
        { hold: { seconds: 40, every: 6, label: 'HOLD', groups: [
          [{ unit: pk, n: 2, from: 'right' }],
          [{ unit: pk, n: 2, from: 'M' }, { unit: pk, n: 1, from: 'left' }],
          [{ unit: pk, n: 3, from: 'right' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    {
      on: 'H',
      do: [
        { lock: ['H', 'I'] },
        { objective: 'The last rival pack' },
        { intensity: 2 },
        { wave: [{ unit: pk, n: 3, from: 'right' }, { unit: pk, n: 2, from: 'L' }] },
        { wave: [{ unit: pk, n: 4, from: 'right' }] },
        { call: 'arrival' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    // Covenant ships appear in the sky over Doisac.
    async arrival(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xd08aff, 700);
      fx.shake(0.012, 1500);
      await new Promise((r) => scene.time.delayedCall(500, r));
      await hud.say('Then the Covenant arrived at Doisac.', null, null, 3);
    },
  },
};
