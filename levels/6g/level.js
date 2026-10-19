// 6g · Guardians. Spec: docs/CAMPAIGN.md (6g).
// Canon checked against Halo 5: Guardians and Halopedia: Genesis, Cortana, Created,
// Warden Eternal (2026-10-18). The fights are staging; Cortana healed through the
// Domain, the Created taking control of the Guardians, Blue Team sealed in a Cryptum
// and freed by Osiris, and the escape from Genesis are canon.

const kn = 'knight-enemy';
const cr = 'crawler';
const wa = 'watcher';

export default {
  id: '6g',
  title: "Guardians",
  era: 'created',
  theme: 'genesis',
  music: 'requiem',
  players: ['locke', 'vale'],

  archive: {
    before: [
      {
        title: 'Genesis', when: 'October 2558', where: 'Genesis',
        text: 'Fireteam Osiris followed Blue Team to Genesis.',
        source: 'Halo 5: Guardians; Halopedia: Genesis',
        scene: 'ship unsc -0.2>0.45 0.25; B=buck@0.2 & L=locke@0.3 & V=vale@0.4; L face >',
      },
      {
        title: 'Cortana Lives',
        text: 'Cortana was alive. She had healed herself using the Domain, a great Forerunner network.',
        source: 'Halopedia: Cortana; Domain',
        scene: 'L=locke@0.24 & V=vale@0.34; beam 0.62 #7ad8ff; V talk; flash #7ad8ff',
      },
    ],
    after: [
      {
        title: 'The Created', when: 'October 2558',
        text: 'Cortana and the Created, the AIs who followed her, took control of the Guardians. They meant to keep the galaxy at peace, by force.',
        source: 'Halopedia: Created',
        scene: 'fleet forerunner 4; beam 0.5 #7ad8ff; W=warden-eternal@0.76<; W glow #ffd27a',
      },
      {
        title: 'The Cryptum',
        text: 'Cortana sealed Blue Team inside a Cryptum. Fireteam Osiris got them out, and together they escaped Genesis.',
        source: 'Halo 5: Guardians',
        scene: 'M=master-chief@0.64 & F=fred-104@0.76; M seal & F seal; L=locke@0.18 & V=vale@0.28; L>0.44; M wake & F wake',
      },
      {
        title: 'The Price',
        text: 'The Created gave up the galaxy\'s freedom for peace.',
        source: 'Halopedia: Created',
        scene: 'bg space; planet 0.5 0.62 0.15 #3a7ac8; G=ship:forerunner-big@0.5,0.24; G glow #7ad8ff',
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
    '#.............======..........................................................................................................=====.........................................====.......................#',
    '#...........................................................................................................................................................................=======....................#',
    '#...............................................................====...........................====...........................................=====.........................::::.......................#',
    '#..........====.=======................................=========::::.................====.##.#.::::..................========...............========........................::::=====..................#',
    '#...............:::::::.....###.................................::::.................::::.##.#.::::..................:::::####...........................................##.::::.......................#',
    '#..P............:::::::.A...###.................B.........##....::::..G...C..........::::.##D#.::::.........E........:::::####.....M...F......................H..........##.::::.....L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Find Blue Team' }] },
    { on: 'A', do: [{ spawn: [{ unit: cr, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Prometheans everywhere' },
        { intensity: 1 },
        { wave: [{ unit: kn, n: 1, from: 'right' }, { unit: cr, n: 4, from: 'right', gap: 0.2 }] },
        { wave: [{ unit: wa, n: 2, from: 'G' }, { unit: kn, n: 1, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: wa, n: 2, from: 'sky' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the bridge' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: cr, n: 5, from: 'right', gap: 0.15 }],
          [{ unit: kn, n: 2, from: 'M' }],
          [{ unit: wa, n: 2, from: 'sky' }, { unit: kn, n: 1, from: 'right' }],
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
        { objective: 'The Warden Eternal stands in the way' },
        { boss: { unit: 'warden-eternal', from: 'L', title: 'Warden Eternal', subtitle: 'Servant of Cortana' } },
        { call: 'escape' },
        { end: { result: 'history' } },
      ],
    },
  ],

  hooks: {
    async escape(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0x7ad8ff, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("Cortana had taken the Guardians. Osiris freed Blue Team, and they escaped Genesis.", null, null, 3.5);
    },
  },
};
