// 3e · Balaho. Spec: docs/CAMPAIGN.md (3e).
// Canon checked against Halopedia: Unggoy Rebellion, Yanme'e, Kig-Yar, Unggoy,
// Arbiter (2026-10-18). The fights are staging; the cause, the setting in High
// Charity's lower districts, Heki 'Gibadee turning the fleet on Balaho, the surrender
// and the Unggoy's better training afterwards are canon.

const jk = 'jackal';
const el = 'elite';
const em = 'elite-major';

export default {
  id: '3e',
  title: 'Balaho',
  era: 'covenant',
  theme: 'high-charity',
  music: 'covenant-hunt',
  players: ['unggoy', 'unggoy'],

  archive: {
    before: [
      {
        title: 'New Members', when: '1112',
        text: "Over the centuries the Covenant grew. The Yanme'e, insect-like builders, joined by treaty.",
        source: "Halopedia: Yanme'e",
        scene: 'S=sanshyuum@0.3; S unarm; ship covenant 1.2>0.7 0.2; S talk',
      },
      {
        title: 'Mercenaries', when: '1342',
        text: 'After a war, the Kig-Yar joined the Covenant as mercenaries.',
        source: 'Halopedia: Kig-Yar',
        scene: 'E=elite@0.25; J=jackal@0.78< & K=jackal@0.88<; J>0.56 & K>0.66; E talk; J talk',
      },
      {
        title: 'Laborers', when: '2142',
        text: 'The Unggoy were brought into the Covenant to work as laborers.',
        source: 'Halopedia: Unggoy',
        scene: 'E=elite@0.18; G=grunt@0.62 & H=grunt@0.72 & I=grunt@0.82; G>0.36 & H>0.46 & I>0.56',
      },
      {
        title: 'A Mark of Shame', when: 'c. 2152',
        text: "Arbiter Fal 'Chavamee turned away from the Covenant's faith. After that, the Prophets made the title of Arbiter a mark of shame, given to disgraced warriors for the most dangerous missions.",
        source: 'Halopedia: Arbiter',
        scene: 'A=elite-major@0.5; S=sanshyuum@0.8<; S unarm; S talk; A kneel',
      },
      {
        title: 'The Rebellion', when: '2462', where: 'High Charity',
        text: "Some Kig-Yar secretly harmed Unggoy families, and the Covenant barely punished them. In the lower districts of High Charity, the Unggoy rose up.",
        source: 'Halopedia: Unggoy Rebellion',
        scene: 'J=jackal@0.76<; G=grunt@0.18 & H=unggoy@0.3 & I=grunt@0.42; G>0.5 & H>0.6 & I>0.42; G fire J & H fire J',
      },
    ],
    after: [
      {
        title: 'Balaho', when: '2463',
        text: "Arbiter Heki 'Gibadee turned the Covenant fleet against Balaho, the Unggoy homeworld. To save their home, the Unggoy surrendered.",
        source: 'Halopedia: Unggoy Rebellion',
        scene: 'bg space #3a3a42; planet 0.24 0.3 0.12 #8a9aa0; fleet covenant 4; G=grunt@0.6 & H=grunt@0.7 & I=grunt@0.8; G kneel & H kneel & I kneel',
      },
      {
        title: 'Afterwards',
        text: 'The Unggoy were given better training and weapons. From then on, they fought beside the Sangheili.',
        source: 'Halopedia: Unggoy Rebellion',
        scene: 'E=elite@0.2 & G=grunt@0.32 & H=grunt@0.42; E>0.6 & G>0.72 & H>0.82',
      },
      {
        title: 'The Price',
        text: 'The Unggoy had risked everything for their families.',
        source: 'Halopedia: Unggoy Rebellion',
        scene: 'G=unggoy@0.4 & H=grunt@0.5 & I=grunt@0.6; G talk',
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
    '#:::::::::::::::::::::::::::=====:::::::::::::::::============::::::::::::::::::::::::::::::=====::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::=====::::::::::::::::::::::::::::::::::::::::::::::::::::::::::=====::::::::===========::::::::::::::=======:::::::::::::::::::::::::::#',
    '#:::::::::::::::========:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::=====::::::::::::::::::::::::::::::::::::========:::::::::::::::::::::::::::::::#',
    '#:::::::========::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::##:#=:::::::::::::::::::::=====::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::##::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::##.#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::###:::::::::::::::::::::::::::::#',
    '#::P::::::::::::::::::::A:::##::::::^^^:::::::::B::::::::::##:::::::::G:::C:::::::::::::::##D#::^^^:::::::::E:::::::::::###::::::::M:::F::::::::::^^^:::::::::H::::::::###:::::::::::L:::I::J::::::X:::#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Rise up!' }, { allies: [{ unit: 'grunt', n: 3, from: 'left' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: jk, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Drive the Kig-Yar out of the district' },
        { intensity: 1 },
        { wave: [{ unit: jk, n: 4, from: 'right' }] },
        { wave: [{ unit: jk, n: 3, from: 'G' }, { unit: jk, n: 3, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
        { allies: [{ unit: 'grunt', n: 3, from: 'left' }, { unit: 'grunt-major', n: 1, from: 'left' }] },
        { objective: 'Spread the rebellion' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: jk, n: 3, from: 'right' }, { unit: el, n: 1, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the methane works' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: jk, n: 3, from: 'right' }],
          [{ unit: el, n: 2, from: 'M' }],
          [{ unit: jk, n: 2, from: 'left' }, { unit: el, n: 1, from: 'right' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
        { allies: [{ unit: 'grunt', n: 4, from: 'left' }] },
      ],
    },
    {
      on: 'H',
      do: [
        { lock: ['H', 'I'] },
        { objective: 'The Sangheili are coming' },
        { intensity: 2 },
        { wave: [{ unit: el, n: 2, from: 'right' }, { unit: jk, n: 3, from: 'L' }] },
        { wave: [{ unit: em, n: 2, from: 'right' }, { unit: el, n: 2, from: 'L' }] },
        { call: 'fleet' },
        { end: { result: 'history' } },
      ],
    },
  ],

  hooks: {
    // As history records: the fleet turns toward Balaho, and the Unggoy lay down
    // their weapons to save their home. Told only as narration.
    async fleet(api) {
      const { scene, fx, hud, audio } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      audio.setIntensity(0);
      hud.letterbox(true);
      fx.flash(0x5ad8ff, 600);
      fx.slowmo(0.5, 2000);
      await new Promise((r) => scene.time.delayedCall(500, r));
      await hud.say('The Covenant fleet turned toward Balaho, the Unggoy homeworld.', null, null, 3.5);
      await hud.say('To save their home, the Unggoy surrendered.', null, null, 3);
    },
  },
};
