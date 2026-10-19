// 6a · The Composer. Spec: docs/CAMPAIGN.md (6a). Echo partner: 6b (the same map).
// Canon checked against the Forerunner Saga and Halopedia: Ur-Didact, Composer,
// Librarian, Requiem (2026-10-18). The fights are staging; the Didact's war on the
// Flood, his use of the Composer on humans to make Promethean Knights, and the
// Librarian sealing him in a Cryptum on Requiem are canon.

const inf = 'flood-infection';
const fw = 'flood-warrior';

export default {
  id: '6a',
  title: "The Composer",
  era: 'forerunner',
  theme: 'requiem',
  music: 'requiem',
  players: ['didact', 'promethean-knight'],

  archive: {
    before: [
      {
        title: 'The Didact\'s War', when: 'Forerunner-Flood war',
        text: 'The Didact led the Forerunners\' warriors against the Flood. The war was going badly.',
        source: 'Halopedia: Ur-Didact; Forerunner-Flood war',
        scene: 'D=didact@0.2 & W=forerunner-warrior@0.3; F=flood-warrior@0.74< & I=flood-infection@0.84<; D fire F & W fire I; G=flood-warrior@1.1<; G>0.64; W kneel',
      },
      {
        title: 'The Composer',
        text: 'To win, the Didact used a terrible device called the Composer. It turned living humans into hard-light data, and he made them into Promethean Knights.',
        source: 'Halopedia: Composer; Promethean Knight',
        scene: 'D=didact@0.18; A=ancient-human-soldier@0.56 & B=ancient-human-soldier@0.7; A unarm & B unarm; beam 0.62 #ff9a3a; A data & B data; K=promethean-knight@0.56< & L=promethean-knight@0.7<',
      },
    ],
    after: [
      {
        title: 'The Cryptum',
        text: 'The Librarian, the Didact\'s wife, stopped him. She sealed him away in a Cryptum, deep inside the shield world Requiem.',
        source: 'Halopedia: Librarian; Requiem',
        scene: 'D=didact@0.5; beam 0.5 #bff4ff; D seal',
      },
      {
        title: 'The Price',
        text: 'The Didact gave up his conscience to win.',
        source: 'Halopedia: Ur-Didact',
        scene: 'D=didact@0.45; D glow #ff6a3a; dark',
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
    '#......................................................=====....................................====...............=======..........................................=====..............................#',
    '#............=======......................................................................=======..................:::::::====....................====..............:::::..............................#',
    '#................=======.==.....................................======....................:::::::...............===:::::::::::..................=======.............:::::..............................#',
    '#......................::::...............................=====...........................##.::::..................:::::::::::....................::::..............:::::======........................#',
    '#......................::::.###...........................:::::...........................##.::::..................::::::##:::....................::::..............:::::..............................#',
    '#..P...................:A::.###.....^^^.........B.........:::::####...G...C...............##D:::^^^.........E......::::::##:::.....M...F..........^^^:........H.....:::::...###......L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Fight the Flood' }] },
    { on: 'A', do: [{ spawn: [{ unit: inf, n: 4, from: 'right', gap: 0.2 }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'The Flood are everywhere' },
        { intensity: 1 },
        { wave: [{ unit: inf, n: 6, from: 'right', gap: 0.15 }, { unit: fw, n: 2, from: 'right' }] },
        { wave: [{ unit: fw, n: 3, from: 'G' }, { unit: inf, n: 4, from: 'left', gap: 0.15 }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: fw, n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the line' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: inf, n: 6, from: 'right', gap: 0.12 }],
          [{ unit: fw, n: 2, from: 'M' }, { unit: inf, n: 4, from: 'left', gap: 0.12 }],
          [{ unit: fw, n: 3, from: 'right' }],
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
        { objective: 'Break through to the Composer' },
        { wave: [{ unit: fw, n: 3, from: 'right' }, { unit: inf, n: 6, from: 'L', gap: 0.1 }] },
        { wave: [{ unit: fw, n: 4, from: 'right' }] },
        { call: 'cryptum' },
        { end: { result: 'history' } },
      ],
    },
  ],

  hooks: {
    async cryptum(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xff8a3a, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("The Librarian sealed the Didact away in a Cryptum on Requiem.", null, null, 3.5);
    },
  },
};
