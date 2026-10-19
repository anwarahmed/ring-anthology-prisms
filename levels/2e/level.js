// 2e · The Hunt. Spec: docs/CAMPAIGN.md (2e).
// Canon checked against Halopedia: Zuka 'Zamamee; Halo: The Flood (2026-10-18). Layouts and enemy placement are staging.

export default {
  id: '2e',
  title: 'The Hunt',
  era: 'covenant',
  theme: 'installation-04-dusk',
  music: 'covenant-hunt',
  players: ['zamamee', 'yayap'],

  archive: {
    before: [
      {
        title: 'The Demon', when: 'September 2552', where: 'Pillar of Autumn',
        text: "Zuka 'Zamamee, a Special Operations Elite, was wounded by the human the Covenant called the Demon while boarding the Pillar of Autumn. Yayap's Grunts carried him to safety.",
        source: "Halo: The Flood; Halopedia: Zuka 'Zamamee",
        scene: 'M=master-chief@0.18; Z=zamamee@0.62<; M fire Z; Z kneel; Y=yayap@0.95< & G=unggoy@1.05<; Y>0.72 & G>0.8; Z>1.2 & Y>1.25 & G>1.3',
      },
      {
        title: 'The Hunt', where: 'Installation 04',
        text: "After the Demon freed the human captain from the Truth and Reconciliation, the Covenant leaders let 'Zamamee hunt him. Yayap went with him.",
        source: "Halopedia: Zuka 'Zamamee",
        scene: 'Z=zamamee@0.22 & Y=yayap@0.12; ship covenant 1.2>0.64 0.12 big; Z talk; Z>>0.62 & Y>0.52',
      },
    ],
    after: [
      {
        title: 'Escape', where: 'Installation 04',
        text: "The trap at the Silent Cartographer failed, and the attack on the humans' Alpha Base found the Demon already gone. Yayap talked 'Zamamee into escaping in a Banshee.",
        source: "Halopedia: Zuka 'Zamamee",
        scene: 'fire 0.82; Z=zamamee@0.4 & Y=yayap@0.3; Y talk; B=veh:banshee@0.58,0.55; Z hide & Y hide; B>1.3',
      },
      {
        title: 'The Last Hunt', where: 'Pillar of Autumn',
        text: "'Zamamee hunted the Demon one last time, aboard the Pillar of Autumn. He was still aboard when the ship exploded and Installation 04 was destroyed.",
        source: "Halopedia: Zuka 'Zamamee",
        scene: 'bg space; A=ship:unsc-big@-0.2,0.45; A>0.5; boom 0.5 0.45 big & flash #ffe8c0; A down & boom 0.58 0.4 big',
      },
    ],
  },

  legend: {
    b: { vehicle: 'banshee' },
  },

  map: [
    '#..........................................................................................................................................................................................................................#',
    '#..........................................................................................................................................................................................................................#',
    '#..........................................................................................................................................................................................................................#',
    '#..........................................................................................................................................................................................................................#',
    '#..........................................................................................................................................................................................................................#',
    '#..........................................................................................................................................................................................................................#',
    '#..........................................................................................................................................................................................................................#',
    '#.......................................................................=======.....................................................=======.................................................=======........................#',
    '#...................................#########..............................................................................................................................................................................#',
    '#...................................#########..................======............======....................................======............======.............###########........======............======................#',
    '#...................###############.#########.......................................................#############...............................................###########................................................#',
    '#...................###############.#########.............................#.........................#############.....................#.........................###########...................#............................#',
    '#..P................###############.#########.A.^^^.........B.............#.........G..C....D.......#############.......E.............#.........H..F............###########.....J.............#.........L..K........b...X..#',
    '############################################################################################################################################################################################################################',
    '############################################################################################################################################################################################################################',
    '############################################################################################################################################################################################################################',
    '############################################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Hunt the Demon' }, { allies: [{ unit: 'grunt', n: 2, from: 'sky' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: 'marine-ally', n: 2, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Break through the human patrol' },
        { intensity: 1 },
        { wave: [{ unit: 'marine-ally', n: 3, from: 'G' }] },
        { wave: [{ unit: 'marine-ally', n: 2, from: 'G' }, { unit: 'flood-infection', n: 4, from: 'right' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Attack Alpha Base' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: 'flood-marine', n: 2, from: 'right' }, { unit: 'flood-infection', n: 5, from: 'right', gap: 0.3 }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Storm the base' },
        { hold: { seconds: 40, every: 6, label: 'ASSAULT', groups: [
          [{ unit: 'marine-ally', n: 3, from: 'H' }],
          [{ unit: 'flood-marine', n: 2, from: 'right' }],
          [{ unit: 'marine-ally', n: 2, from: 'H' }, { unit: 'flood-infection', n: 4, from: 'sky' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
        { objective: 'The Demon is gone. Fight to the Banshee pads' },
      ],
    },
    {
      on: 'J',
      do: [
        { lock: ['J', 'K'] },
        { intensity: 2 },
        { wave: [{ unit: 'flood-elite', n: 2, from: 'L' }, { unit: 'flood-marine', n: 2, from: 'right' }] },
        { wave: [{ unit: 'marine-ally', n: 3, from: 'L' }, { unit: 'flood-infection', n: 6, from: 'sky' }] },
        { unlock: true },
        { objective: 'Escape in the Banshee: press SWAP next to it' },
      ],
    },
  ],

  hooks: {
    // The level ends when someone takes off in the Banshee.
    update(api) {
      if (api.scene.ended) return;
      if (api.players.some((p) => p.vehicle?.id === 'banshee')) api.scene.endLevel({ result: 'win' });
    },
  },
};
