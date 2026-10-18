// 3b · Ulgethon. Spec: docs/CAMPAIGN.md (3b).
// Canon checked against Halopedia: War of Beginnings, Arbiter (2026-10-18). The
// battles are staging; the Reformists' landing, Vema 'Togad's judgment, the nearly
// indestructible Dreadnought, the Sangheili strength on the ground, the Sentinels
// fighting for the San'Shyuum later in the war and its 86 years are canon.

const rf = 'sanshyuum-reformist';
const sn = 'sentinel';
const al = 'elite-ancient';

export default {
  id: '3b',
  title: 'Ulgethon',
  era: 'covenant',
  theme: 'ulgethon',
  music: 'covenant-war',
  players: ['sangheili-warrior', 'sangheili-warrior'],

  archive: {
    before: [
      {
        title: 'Strangers from the Sky', when: '938 BCE', where: 'Ulgethon',
        text: "The Reformist San'Shyuum arrived at Ulgethon in their Dreadnought. They thought the world was empty, but the Sangheili lived there.",
        source: 'Halopedia: War of Beginnings',
      },
      {
        title: 'The Arbiter', when: '938 BCE', where: 'Ulgethon',
        text: "The San'Shyuum announced that they would dig up the Forerunner relics on the planet. Vema 'Togad, the Arbiter, a ruler and judge of the Sangheili clans, refused. The meeting ended in violence, and a war began.",
        source: 'Halopedia: War of Beginnings; Arbiter',
      },
    ],
    after: [
      {
        title: 'The War of Beginnings',
        text: 'The Dreadnought was almost impossible to damage, but on the ground the Sangheili were stronger. Neither side could win.',
        source: 'Halopedia: War of Beginnings',
      },
      {
        title: 'Eighty-Six Years',
        text: "The war went on for 86 years. Later in the war, Forerunner Sentinels fought on the San'Shyuum's side.",
        source: 'Halopedia: War of Beginnings',
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
    '#.........====.............=====........................................................=======........................................................................................................#',
    '#.........::::..............................................................................................................=======..........========..................................................#',
    '#.........::::.................=====...................===========...........................======.........................::=====.=........::::::::................===========.......................#',
    '#.........::::.................:::::................========..............................##.............................===:::::::..........::::::::===......................=======..................#',
    '#.........::::..............##.:::::...................::::.....####......................##.............................::###:::::..........:::::::::::......................###......................#',
    '#..P......::::..........A...##.:::::^^^.........B......::::.....####..G...C...............##D...^^^.........E............::###:::::M...F.....:::::^^^:::......H...............###....L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Defend Ulgethon' }, { allies: [{ unit: al, n: 2, from: 'left' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: rf, n: 3, from: 'sky' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: "Drive back the San'Shyuum landing" },
        { intensity: 1 },
        { wave: [{ unit: rf, n: 4, from: 'sky' }] },
        { wave: [{ unit: rf, n: 3, from: 'G' }, { unit: rf, n: 2, from: 'sky' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Push to the dig site' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: rf, n: 3, from: 'right' }, { unit: sn, n: 2, from: 'sky' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the dig site' },
        { hold: { seconds: 40, every: 6, label: 'HOLD', groups: [
          [{ unit: rf, n: 3, from: 'sky' }],
          [{ unit: sn, n: 3, from: 'sky' }],
          [{ unit: rf, n: 2, from: 'M' }, { unit: sn, n: 2, from: 'sky' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
        { allies: [{ unit: al, n: 2, from: 'left' }] },
      ],
    },
    {
      on: 'H',
      do: [
        { lock: ['H', 'I'] },
        { objective: 'Break the last landing' },
        { intensity: 2 },
        { fx: 'shake' },
        { wave: [{ unit: sn, n: 4, from: 'sky' }, { unit: rf, n: 3, from: 'L' }] },
        { wave: [{ unit: rf, n: 4, from: 'sky' }, { unit: sn, n: 3, from: 'sky' }] },
        { unlock: true },
      ],
    },
    { on: 'J', do: [{ call: 'standoff' }, { end: { result: 'win' } }] },
  ],

  hooks: {
    // The landing is broken, but the Dreadnought above cannot be touched.
    async standoff(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.slowmo(0.5, 2000);
      fx.shake(0.01, 1200);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say('The landing was beaten back. The war would last 86 years.', null, null, 3.5);
    },
  },
};
