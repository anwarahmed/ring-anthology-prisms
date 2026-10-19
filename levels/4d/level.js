// 4d · The Rookie. Spec: docs/CAMPAIGN.md (4d).
// Canon checked against Halo 3: ODST and Halopedia: The Rookie, Superintendent
// (2026-10-18). The fights are staging; the drop into New Mombasa, the slipspace
// shockwave that scattered the squad, the Rookie waking at night, the Superintendent
// guiding him, finding his squad and escaping the city are canon. ODST has no boss.

const gr = 'grunt';
const jk = 'jackal';
const br = 'jiralhanae-minor';
const bc = 'jiralhanae-captain';

export default {
  id: '4d',
  title: "The Rookie",
  era: 'covenant',
  theme: 'new-mombasa-night',
  music: 'mombasa-rain',
  players: ['rookie', 'odst'],

  archive: {
    before: [
      {
        title: 'The Drop', when: 'October 20, 2552', where: 'New Mombasa',
        text: 'Orbital Drop Shock Troopers, or ODSTs, dropped from space into New Mombasa in drop pods. Then the Covenant ship above the city jumped into slipspace, and the shockwave scattered the squad.',
        source: 'Halo 3: ODST; Halopedia: Battle of Mombasa',
        scene: 'C=ship:covenant-big@0.62,0.14; pods 0.24 0.9 4; flash & shake & C hide',
      },
      {
        title: 'Alone', when: 'October 20, 2552', where: 'New Mombasa',
        text: 'The newest member of the squad, the Rookie, woke up hours later. It was night, and he was alone.',
        source: 'Halopedia: The Rookie',
        scene: 'dark; R=rookie@0.42; R kneel; wait 0.8; R stand',
      },
      {
        title: 'The Superintendent',
        text: 'New Mombasa\'s city AI, the Superintendent, helped guide him through the dark streets.',
        source: 'Halopedia: Superintendent',
        scene: 'dark; R=rookie@0.28; beam 0.72 #f0a03a; R>0.6',
      },
    ],
    after: [
      {
        title: 'Together Again', when: 'October 21, 2552', where: 'New Mombasa',
        text: 'The Rookie followed the clues his squad had left behind, found them, and together they escaped the city.',
        source: 'Halo 3: ODST; Halopedia: The Rookie',
        scene: 'R=rookie@0.18; O=odst-squadmate@0.62< & P=odst-squadmate@0.72<; R>0.48; R talk; O face > & P face >',
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
    '#.......========.=====..=======............................====............................======........................=======.............========..................................................#',
    '#.......::::::::.:::::..:::::::............................::::............................::::::........................:::::::===....................................................................#',
    '#.......::::::::.:::::..:::::::.......................=====::::............................::::::..............=======...::::::::::.........========...............==============......................#',
    '#.......::::::::.:::::..:::::::............................::::..====.....................##.::::=.............:::::::...::::::::::..............................=====::::.............................#',
    '#.......::::::::.:::::..::::####...........................::::...........................##.::::..............:::::::...::::::::::................................:::::::.............................#',
    '#..P....::::::::.:::::..A:::####....^^^.........B.......####:::.......G...C...............##D:::^^^.........E..:::::##...::::::::::M...F..........^^^.........H....:::::::...##......L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Find your squad. ABILITY turns on VISR' }] },
    { on: 'A', do: [{ spawn: [{ unit: gr, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Brutes on patrol' },
        { intensity: 1 },
        { wave: [{ unit: gr, n: 3, from: 'right' }, { unit: br, n: 1, from: 'right' }] },
        { wave: [{ unit: br, n: 2, from: 'G' }, { unit: jk, n: 2, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Follow the Superintendent' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: br, n: 2, from: 'right' }, { unit: gr, n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'A clue! Hold the plaza' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: gr, n: 3, from: 'right' }, { unit: jk, n: 1, from: 'left' }],
          [{ unit: br, n: 2, from: 'M' }],
          [{ unit: bc, n: 1, from: 'right' }, { unit: gr, n: 2, from: 'left' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    {
      on: 'H',
      do: [
        { lock: ['H', 'I'] },
        { intensity: 2 },
        { objective: 'Your squad is close!' },
        { allies: [{ unit: 'odst-squadmate', n: 2, from: 'right' }] },
        { wave: [{ unit: br, n: 2, from: 'right' }, { unit: bc, n: 1, from: 'L' }] },
        { wave: [{ unit: bc, n: 2, from: 'right' }, { unit: gr, n: 3, from: 'sky' }] },
        { call: 'found' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    async found(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xffb84a, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("The Rookie had found his squad. Together, they made their way out of the city.", null, null, 3.5);
    },
  },
};
