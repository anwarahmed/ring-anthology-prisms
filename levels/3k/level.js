// 3k · Rise of Atriox. Spec: docs/CAMPAIGN.md (3k). Echo partner: 5h.
// Canon checked against Halo Wars 2 and Halopedia: Atriox, Itho 'Hesiikee, Decimus,
// Banished (2026-10-18). The battles are staging; the suicide missions Atriox
// survived, Itho 'Hesiikee sent to Algolis to execute him in 2549 (told gently),
// Atriox catching the energy sword, Decimus joining him and the birth of the Banished
// are canon.

const el = 'elite';
const em = 'elite-major';
const ez = 'elite-zealot';

export default {
  id: '3k',
  title: 'Rise of Atriox',
  era: 'banished',
  theme: 'algolis',
  music: 'banished-rise',
  players: ['atriox', 'jiralhanae-warrior'],

  archive: {
    before: [
      {
        title: 'The Survivor',
        text: "The Covenant sent Atriox's packs on the most dangerous missions, again and again. Atriox survived every one, and he became a legend among the Jiralhanae.",
        source: 'Halopedia: Atriox',
      },
      {
        title: 'Algolis', when: '2549', where: 'Algolis',
        text: "The Covenant had had enough of Atriox. On Algolis, the Sangheili officer Itho 'Hesiikee was sent to put an end to him.",
        source: "Halopedia: Atriox; Itho 'Hesiikee",
      },
    ],
    after: [
      {
        title: 'The Sword', when: '2549', where: 'Algolis',
        text: "Atriox caught Itho 'Hesiikee's energy sword in his hand and defeated him.",
        source: 'Halopedia: Atriox',
      },
      {
        title: 'The Banished', when: '2549',
        text: 'Decimus and the other Jiralhanae joined Atriox. Together they turned away from the Covenant and became the Banished.',
        source: 'Halopedia: Banished; Decimus',
      },
      {
        title: 'The Price',
        text: "The Banished gave up the Covenant's protection to be free.",
        source: 'Halopedia: Banished',
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
    '#................................................................======...........=====...................................======............====.....=====...................=======...................#',
    '#.............========......=======.............................======........................=======.......................................::::.......................................................#',
    '#...........................:::::::...........................................................................................=====.........::::........................=====..........................#',
    '#........................===:::::::.......................=======.........................##.#...................========.....:::::.........::::........................:::::..====....................#',
    '#........................:::...::::......................###..............................##.#...................::::::::.....:::::.........::::........................:::::..........................#',
    '#..P....................A:::...::::.............B........###..........G...C...............##D#..^^^.........E....:::##:::.....:::::M...F....::::..^^^.........H.........:::###.......L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Survive the mission' }, { vehicle: { id: 'chopper', at: 'A' } }, { allies: [{ unit: 'banished-ally', n: 2, from: 'left' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: el, n: 2, from: 'right' }, { unit: 'grunt', n: 2, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'The Covenant has turned on you' },
        { intensity: 1 },
        { wave: [{ unit: el, n: 3, from: 'sky' }] },
        { wave: [{ unit: em, n: 1, from: 'G' }, { unit: el, n: 2, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Find the rest of the pack' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: el, n: 3, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { allies: [{ unit: 'decimus-ally', n: 1, from: 'left' }] },
        { objective: 'Decimus is here. Hold together!' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: el, n: 2, from: 'sky' }],
          [{ unit: em, n: 1, from: 'M' }, { unit: el, n: 1, from: 'right' }],
          [{ unit: ez, n: 1, from: 'right' }, { unit: el, n: 2, from: 'sky' }],
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
        { objective: 'Face the executioner' },
        { boss: { unit: 'itho-hesiikee', from: 'L', title: "Itho 'Hesiikee", subtitle: 'Sent by the Covenant' } },
        { call: 'banished' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    async banished(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.slowmo(0.4, 2200);
      fx.flash(0xe0453a, 600);
      fx.shake(0.015, 900);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say('The Jiralhanae rallied to Atriox. The Banished were born.', null, null, 3.5);
    },
  },
};
