// 5g · Spirit of Fire. Spec: docs/CAMPAIGN.md (5g). Echo partner: 3j.
// Canon checked against Halo Wars 2 and Halopedia: Spirit of Fire, Red Team, Decimus
// (2026-10-18). The fights are staging; the war's end in 2553, the Chief and Cortana
// drifting in the Dawn, the Spirit of Fire waking after 28 years at the Ark, the
// Banished holding it and Red Team defeating Decimus are canon.

const bb = 'banished-brute';
const bg = 'banished-grunt';
const jk = 'jackal';

export default {
  id: '5g',
  title: "Spirit of Fire",
  era: 'banished',
  theme: 'ark',
  music: 'banished-rise',
  players: ['red-team-spartan', 'red-team-spartan'],

  archive: {
    before: [
      {
        title: 'The War Ends', when: '2553',
        text: 'With the Covenant broken, the war with humanity ended in 2553. Master Chief and Cortana drifted through space in the back half of the Forward Unto Dawn.',
        source: 'Halopedia: Human-Covenant war; Forward Unto Dawn',
      },
      {
        title: 'Awake', when: '2559', where: 'The Ark',
        text: 'Far away, the Spirit of Fire had drifted for 28 years with its crew asleep. In 2559 they woke up, and found they had drifted to the Ark.',
        source: 'Halo Wars 2; Halopedia: Spirit of Fire',
      },
      {
        title: 'The Banished',
        text: 'The Ark was held by Atriox and his Banished. Red Team, the ship\'s Spartans, went down to the surface.',
        source: 'Halo Wars 2; Halopedia: Red Team',
      },
    ],
    after: [
      {
        title: 'Decimus', when: '2559', where: 'The Ark',
        text: 'Red Team defeated Decimus, one of the strongest Banished chieftains.',
        source: 'Halo Wars 2; Halopedia: Decimus',
      },
      {
        title: 'A Long Fight',
        text: 'The Spirit of Fire\'s crew would keep fighting the Banished on the Ark.',
        source: 'Halo Wars 2',
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
    '#..................====...................................................................................................===========...............................==========.........................#',
    '#..................::::..............................========.======.........................................................................========...................=======........................#',
    '#..................::::=.====.................................::::::............................=====.........========.......................::::::::...................:::::::........................#',
    '#..................::::.....=======...........................::::::......................##.#..::====........::::::::.......................========...................:::::::........................#',
    '#..................::::.....####:::.....................###...::::::......................##.#..:::::.........::::::::..###..................::::::::...................:::::::........................#',
    '#..P...............::::.A...####:::.............B.......###...::::::..G...C...............##D#..:::::.......E.::::::::..###........M...F.....::::::::.........H.........::::##:......L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Find out who holds the Ark' }, { allies: [{ unit: 'marine-ally', n: 2, from: 'left' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: bg, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'The Banished!' },
        { intensity: 1 },
        { wave: [{ unit: bb, n: 2, from: 'right' }, { unit: bg, n: 3, from: 'sky' }] },
        { wave: [{ unit: jk, n: 2, from: 'G' }, { unit: bb, n: 2, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: bb, n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the outpost' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: bb, n: 2, from: 'right' }, { unit: bg, n: 2, from: 'sky' }],
          [{ unit: bb, n: 2, from: 'M' }],
          [{ unit: jk, n: 2, from: 'right' }, { unit: bb, n: 1, from: 'left' }],
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
        { objective: 'Decimus!' },
        { boss: { unit: 'decimus', from: 'L', title: 'Decimus', subtitle: 'Chieftain of the Banished' } },
        { call: 'done' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    async done(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xe0453a, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("Decimus had fallen. The fight for the Ark had begun.", null, null, 3.5);
    },
  },
};
