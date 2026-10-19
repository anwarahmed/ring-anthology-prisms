// 4a · Cairo Station. Spec: docs/CAMPAIGN.md (4a).
// Canon checked against Halo 2 and Halopedia: Battle of Earth, Cairo Station
// (2026-10-18). The fights are staging; the Covenant attack on Earth on October 20,
// 2552, the boarding of Cairo Station and the Chief stopping the bomb are canon.

const gr = 'grunt';
const jk = 'jackal';
const el = 'elite';
const em = 'elite-major';

export default {
  id: '4a',
  title: "Cairo Station",
  era: 'covenant',
  theme: 'cairo-station',
  music: 'last-stand',
  players: ['master-chief', 'marine'],

  archive: {
    before: [
      {
        title: 'Home', when: 'October 20, 2552', where: 'Earth orbit',
        text: 'After Installation 04, Master Chief came home to Earth. The UNSC defended it with huge orbital defense platforms, like Cairo Station.',
        source: 'Halo 2; Halopedia: Cairo Station',
        scene: 'bg space; planet 0.3 1.05 0.42 #3a7ac8; A=ship:unsc-big@0.74,0.28; S=ship:unsc@-0.2,0.52; S>0.46,0.5',
      },
      {
        title: 'The Covenant Arrives', when: 'October 20, 2552',
        text: 'That same day, a Covenant fleet appeared over Earth and attacked. Covenant troops boarded Cairo Station.',
        source: 'Halopedia: Battle of Earth',
        scene: 'bg space; planet 0.3 1.05 0.42 #3a7ac8; A=ship:unsc-big@0.74,0.3; fleet covenant 5; boom 0.7 0.3 & boom 0.78 0.28',
      },
    ],
    after: [
      {
        title: 'The Bomb', when: 'October 20, 2552', where: 'Cairo Station',
        text: 'The Covenant had left a bomb aboard Cairo Station. Master Chief found it and carried it back to the Covenant ship it came from, so the station was saved.',
        source: 'Halo 2; Halopedia: Cairo Station',
        scene: 'C=ship:covenant-big@0.76,0.2; M=master-chief@0.24; M glow #ffb84a; M>>0.6; M^; boom 0.76 0.2 big & C down; M face <',
      },
      {
        title: 'Earth Under Attack',
        text: 'Earth had been found. The Covenant were landing in the city of New Mombasa.',
        source: 'Halopedia: Battle of Earth',
        scene: 'bg sky #f0a060 #f8e0b0 #8a7060; ship covenant 1.2>0.62 0.18 big; beam 0.62 #c890ff & E=elite@0.62<; G=grunt@0.72<',
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
    '#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::====::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::========::::::::::::=======::====::::::::::::::::::::::#',
    '#:::::::::::::::::=======::::::::::::::::::::::::::::::::::=======::::::::::::::========::::::====::::::::::::========::::::::::::::::::::::::::::::::::::::::::::::::::::::=======::::::::::::::::::::#',
    '#:::::::::::::::::::====::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::====::::::::::::::::::::======:::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::========:::::::::::::::::::::::::::::::::::::====:::::::::::::::::::::::::##:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::####::::::::::::::::::::::::::::::::::::::::::::::::::::::::::##:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#::P::::::::::::::::::::A:::####::::::::::::::::B:::::::::##::::::::::G:::C:::::::::::::::##D:::::::::::::::E:::::::::::::###::::::M:::F::::::::::::::::::::::H:::::::##:::::::::::::L:::I::J::::::X:::#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Repel the boarders' }, { allies: [{ unit: 'marine-ally', n: 2, from: 'left' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: gr, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Hold the armory' },
        { intensity: 1 },
        { wave: [{ unit: gr, n: 4, from: 'right' }, { unit: jk, n: 2, from: 'right' }] },
        { wave: [{ unit: el, n: 2, from: 'G' }, { unit: gr, n: 2, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Find the bomb' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: jk, n: 2, from: 'right' }, { unit: el, n: 1, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Clear the station core' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: gr, n: 3, from: 'right' }, { unit: jk, n: 1, from: 'left' }],
          [{ unit: el, n: 2, from: 'M' }],
          [{ unit: em, n: 1, from: 'right' }, { unit: gr, n: 2, from: 'left' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    {
      on: 'H',
      do: [
        { lock: ['H', 'I'] },
        { objective: 'The bomb is here: clear the bay!' },
        { intensity: 2 },
        { call: 'ticking' },
        { wave: [{ unit: em, n: 2, from: 'right' }, { unit: jk, n: 2, from: 'L' }] },
        { wave: [{ unit: 'elite-zealot', n: 1, from: 'right' }, { unit: el, n: 2, from: 'L' }] },
        { call: 'bomb' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    ticking(api) {
      api.hud.timer('BOMB', 90);
      api.scene.time.addEvent({ delay: 2000, loop: true, callback: () => api.fx.shake(0.004, 300) });
    },
    async bomb(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.timer(null);
      hud.letterbox(true);
      fx.slowmo(0.5, 2000);
      await hud.say('Master Chief carried the bomb back to the Covenant ship.', null, null, 3.5);
      scene.cameras.main.flash(1400, 255, 230, 200);
      fx.shake(0.02, 1200);
      await hud.say('Cairo Station was saved.', null, null, 2.5);
    },
  },
};
