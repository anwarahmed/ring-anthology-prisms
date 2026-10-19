// 5h · Awakening the Nightmare. Spec: docs/CAMPAIGN.md (5h). Echo partners: 5g, 3k.
// Canon checked against Halo Wars 2: Awakening the Nightmare and Halopedia: Voridus,
// Pavium (2026-10-18). The fights are staging; the salvage of High Charity's remains,
// Voridus breaking the quarantine, the outbreak, the UNSC forces, the Proto-Gravemind
// and Atriox's arrival are canon.

const inf = 'flood-infection';
const fm = 'flood-marine';
const fe = 'flood-elite';
const um = 'unsc-marine';

export default {
  id: '5h',
  title: "Awakening the Nightmare",
  era: 'banished',
  theme: 'ark',
  music: 'flood-dread',
  players: ['pavium', 'voridus'],

  archive: {
    before: [
      {
        title: 'Salvage', when: 'June 2559', where: 'The Ark',
        text: 'Atriox sent two Jiralhanae brothers, Pavium and Voridus, to salvage what was left of High Charity on the Ark.',
        source: 'Halopedia: Awakening the Nightmare; Voridus',
        scene: 'C=ship:keyship-big@0.72,0.62; P=pavium@0.2 & V=voridus@0.3; P>0.46 & V>0.54',
      },
      {
        title: 'The Quarantine', when: 'June 2559',
        text: 'Voridus ignored the warnings. He switched off the Ark\'s Sentinel defenses and broke open the quarantine shield, and the Flood broke loose.',
        source: 'Halopedia: Voridus',
        scene: 'P=pavium@0.28 & V=voridus@0.4; T=sentinel@0.7,0.4<; V fire T; T down; flash #9ff4ff; flood 0.76; F=flood-elite@0.82<',
      },
    ],
    after: [
      {
        title: 'The Proto-Gravemind', when: 'June 2559', where: 'The Ark',
        text: 'The brothers destroyed the Proto-Gravemind that had grown outside High Charity, just before Atriox arrived.',
        source: 'Halopedia: Awakening the Nightmare',
        scene: 'P=pavium@0.2 & V=voridus@0.3; G=proto-gravemind@0.76<; P fire G & V fire G; boom 0.76 0.6 big; G down; A=atriox@1.1<; A>0.86',
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
    '#........................................................................................===========............................................========...............................................#',
    '#........=============..............................=============........................:::::::::::............................................::::::::..........========.............................#',
    '#........:::::...======.............................:::::................................:::::::::::..................========..................::::::::.......................======..................#',
    '#........:::::......................................:::::................................:##.#::::::.............======:::::....................::::::::.......................::::....................#',
    '#........:::::......................................:::::................................:##.#::::::...................:::::....................::::::::.......................::::....................#',
    '#..P.....:::::..........A.......................B...:::::..###........G...C..............:##D#::^^^:........E..........###::.......M...F........::^^^:::......H.........##.....::::..L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Salvage High Charity' }, { vehicle: { id: 'chopper', at: 'A' } }, { allies: [{ unit: 'banished-ally', n: 2, from: 'left' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: um, n: 2, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'UNSC soldiers!' },
        { intensity: 1 },
        { wave: [{ unit: um, n: 3, from: 'right' }] },
        { wave: [{ unit: um, n: 2, from: 'G' }, { unit: um, n: 2, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
        { call: 'breach' },
        { objective: 'The Flood is loose!' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: inf, n: 6, from: 'right', gap: 0.15 }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold back the outbreak' },
        { hold: { seconds: 45, every: 5, label: 'HOLD', groups: [
          [{ unit: inf, n: 8, from: 'right', gap: 0.1 }],
          [{ unit: fe, n: 2, from: 'M' }, { unit: fm, n: 2, from: 'right' }],
          [{ unit: fm, n: 3, from: 'left' }, { unit: inf, n: 6, from: 'right', gap: 0.1 }],
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
        { objective: 'The Proto-Gravemind!' },
        { boss: { unit: 'proto-gravemind', from: 'L', title: 'Proto-Gravemind', subtitle: 'The heart of the outbreak' } },
        { call: 'done' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    breach(api) {
      api.fx.shake(0.02, 1200);
      api.fx.flash(0xb8e04a, 500);
    },
    async done(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xb8e04a, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("The Proto-Gravemind was destroyed, just before Atriox arrived.", null, null, 3.5);
    },
  },
};
