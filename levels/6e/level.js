// 6e · Osiris. Spec: docs/CAMPAIGN.md (6e). Echo partner: 3b.
// Canon checked against Halo 5: Guardians and Halopedia: Battle of Sunaion, Swords of
// Sanghelios, Warden Eternal (2026-10-18). The fights are staging; Fireteam Osiris
// helping the Arbiter's Swords of Sanghelios against the Covenant remnant, the Warden
// Eternal and the Arbiter's title becoming one of honor are canon.

const re = 'remnant-elite';
const gr = 'grunt';
const jk = 'jackal';
const kn = 'knight-enemy';

export default {
  id: '6e',
  title: "Osiris",
  era: 'created',
  theme: 'sanghelios',
  music: 'covenant-war',
  players: ['locke', 'buck'],

  archive: {
    before: [
      {
        title: 'Sanghelios', when: 'October 2558', where: 'Sanghelios',
        text: 'On the Sangheili homeworld, the Arbiter\'s Swords of Sanghelios were fighting the last of the Covenant, the Covenant remnant.',
        source: 'Halopedia: Swords of Sanghelios; Battle of Sunaion',
        scene: 'A=arbiter@0.25 & E=elite-ally@0.14; R=remnant-elite@0.76< & G=grunt@0.86<; A fire R & E fire G & R fire A',
      },
      {
        title: 'Fireteam Osiris',
        text: 'Fireteam Osiris, led by Spartan Jameson Locke, came to help the Arbiter, and to find a way to Blue Team.',
        source: 'Halo 5: Guardians; Halopedia: Fireteam Osiris',
        scene: 'ship unsc -0.2>0.42 0.2; L=locke@0.4 & B=buck@0.5; A=arbiter@0.76<; L talk; A talk',
      },
    ],
    after: [
      {
        title: 'Sunaion', when: 'October 2558', where: 'Sanghelios',
        text: 'Together they won the battle for Sunaion, and the Covenant remnant was finished.',
        source: 'Halopedia: Battle of Sunaion',
        scene: 'L=locke@0.2 & B=buck@0.3 & A=arbiter@0.4; R=remnant-elite@0.8< & J=jackal@0.9<; L fire R & A fire J & B fire R; R down & J down',
      },
      {
        title: 'An Honor',
        text: 'The title of Arbiter had once been a mark of shame. Now it was a title of honor.',
        source: 'Halopedia: Arbiter',
        scene: 'E=elite-ally@0.3 & A=arbiter@0.45 & F=elite-ally@0.6<; A glow #ffd27a; E face > & F face <',
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
    '#.........................................................======.......................................................................................................................................#',
    '#.........................................................::::::..............................................========.......................==========.............=====..............................#',
    '#................=======..........................=====...::::::.................===========.==............................========.............................====:::::..............................#',
    '#.................======.==.......................:::::...::::::===..............:::::::::##.#:............................::::::::.=...............................:::::======........................#',
    '#...........................##....................:::::...:::::::::..............:::::::::##.#:.........................##.::::::::::...............................:::::...####.......................#',
    '#..P....................A...##..................B.:::::...::::###::...G...C......:::::::::##D#:.............E...........##.::::::::M:..F......................H.....:::::...####.....L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Help the Arbiter take Sunaion' }, { allies: [{ unit: 'elite-ally', n: 2, from: 'left' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: gr, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Covenant remnant!' },
        { intensity: 1 },
        { wave: [{ unit: re, n: 2, from: 'right' }, { unit: gr, n: 3, from: 'sky' }] },
        { wave: [{ unit: jk, n: 2, from: 'G' }, { unit: re, n: 2, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: re, n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the bridge' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: re, n: 2, from: 'right' }, { unit: gr, n: 2, from: 'sky' }],
          [{ unit: kn, n: 1, from: 'M' }, { unit: jk, n: 2, from: 'right' }],
          [{ unit: re, n: 3, from: 'left' }],
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
        { objective: 'The Warden Eternal!' },
        { boss: { unit: 'warden-eternal', from: 'L', title: 'Warden Eternal', subtitle: 'Guardian of the Domain' } },
        { call: 'sunaion' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    async sunaion(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xffd27a, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("The battle for Sunaion was won.", null, null, 3.5);
    },
  },
};
