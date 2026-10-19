// 6c · Composer. Spec: docs/CAMPAIGN.md (6c).
// Canon checked against Halo 4 and Halopedia: Ivanoff Research Station, Composer
// (2026-10-18). The fights are staging; the Composer held at Ivanoff Station near
// Installation 03, the Didact using it on the station's people (told gently) and
// leaving for Earth are canon.

const kn = 'knight-enemy';
const cr = 'crawler';
const wa = 'watcher';

export default {
  id: '6c',
  title: "Composer",
  era: 'created',
  theme: 'ivanoff-station',
  music: 'requiem',
  players: ['master-chief', 'spartan-iv'],

  archive: {
    before: [
      {
        title: 'Ivanoff Station', when: '2557', where: 'Ivanoff Station',
        text: 'Humans had found the Composer and taken it to Ivanoff Station, a research station near the ring Installation 03.',
        source: 'Halopedia: Ivanoff Research Station; Composer',
        scene: 'bg space; ring 0.74 0.3; S=ship:unsc-big@0.3,0.56; beam 0.3 #ff9a3a',
      },
      {
        title: 'The Didact Comes',
        text: 'The Didact wanted the Composer back. Master Chief raced to the station to stop him.',
        source: 'Halo 4',
        scene: 'bg space; ring 0.74 0.3; S=ship:unsc-big@0.3,0.6; D=ship:forerunner-big@1.25,0.24<; D>0.68,0.28; B=ship:unsc@-0.2,0.3; B>0.3,0.36',
      },
    ],
    after: [
      {
        title: 'Composed', when: '2557', where: 'Ivanoff Station',
        text: 'The Didact used the Composer on the station\'s people, turning them into data. Master Chief could not stop it in time.',
        source: 'Halo 4; Halopedia: Composer',
        scene: 'A=marine@0.46 & B=marine@0.58 & C=marine@0.7; A unarm & B unarm & C unarm; beam 0.58 #ff9a3a; A data & B data & C data; M=master-chief@0.14; M>0.34',
      },
      {
        title: 'To Earth',
        text: 'Then the Didact set off for Earth, with the Composer aboard his ship.',
        source: 'Halo 4',
        scene: 'bg space; planet 0.8 0.56 0.15 #3a7ac8; D=ship:forerunner-big@0.08,0.34; D>0.62,0.42',
      },
    ],
  },

  legend: {},

  map: [
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#......................................................................................................................................................................................................#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::======::=======:::::::::::::::::::::::::::::::::::::::::::::::::::=====::::::::::::::::::::::::::::::::::::::::::::::======:::::::::::::::::::::::::============::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::========::::::::::::======:::::::::::::::::::::::====:::::::::::::::::::::::::::::::=====:::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::==:====:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::====:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::=========:=::::::::::::::::::##:#::::::::::::::::========:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::##::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::##.#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::P::::::::::::::::::::A:::##::::::::::::::::::B::::::::::##:::::::::G:::C:::::::::::::::##D#::::::::::::::E::::::::::::::###:::::M:::F::::::::::::::::::::::H::::::::::####::::::::L:::I::J::::::X:::#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Reach the Composer' }] },
    { on: 'A', do: [{ spawn: [{ unit: cr, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Prometheans in the station' },
        { intensity: 1 },
        { wave: [{ unit: cr, n: 4, from: 'right', gap: 0.2 }, { unit: wa, n: 1, from: 'sky' }] },
        { wave: [{ unit: kn, n: 1, from: 'G' }, { unit: cr, n: 3, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: wa, n: 2, from: 'sky' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the lab' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: cr, n: 4, from: 'right', gap: 0.2 }],
          [{ unit: kn, n: 1, from: 'M' }, { unit: wa, n: 2, from: 'sky' }],
          [{ unit: kn, n: 1, from: 'right' }, { unit: cr, n: 3, from: 'left' }],
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
        { objective: 'Stop the Didact!' },
        { wave: [{ unit: kn, n: 2, from: 'right' }, { unit: wa, n: 2, from: 'L' }] },
        { wave: [{ unit: kn, n: 3, from: 'right' }, { unit: cr, n: 4, from: 'sky', gap: 0.2 }] },
        { call: 'composed' },
        { end: { result: 'history' } },
      ],
    },
  ],

  hooks: {
    async composed(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xffb84a, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("A blinding light filled the station. The Didact had used the Composer.", null, null, 3.5);
    },
  },
};
