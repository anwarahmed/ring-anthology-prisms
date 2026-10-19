// 1d · The Master Builder. Spec: docs/CAMPAIGN.md (1d).
// Canon checked against Halopedia: Halo Array, Forerunner-Flood war (2026-10-17). The
// scaffold course and the Sentinel patrols are staging.

const sn = 'sentinel';
const en = 'sentinel-enforcer';

export default {
  id: '1d',
  title: 'The Master Builder',
  era: 'forerunner',
  theme: 'greater-ark',
  music: 'forerunner-march',
  players: ['forerunner-warrior', 'forerunner-warrior'],

  archive: {
    before: [
      {
        title: 'The Master Builder', when: 'c. 98,445 BCE', where: 'The Greater Ark',
        text: 'Master Builder Faber had a new weapon built against the Flood: twelve giant rings, each about 30,000 kilometers across. They were called the Halos.',
        source: 'Halopedia: Halo Array',
        scene: 'bg space; ring 0.28 0.32 & ring 0.72 0.58; S=sentinel@0.08,0.5; S>0.5; ship forerunner -0.2>1.2 0.12 slow',
      },
      {
        title: 'Two Plans',
        text: 'The Didact and his Prometheans wanted Shield Worlds instead: fortresses to shelter life. They lost the argument and went into exile.',
        source: 'Halopedia: Halo Array; Forerunner-Flood war',
        scene: 'D=didact@0.26 & P=promethean-knight@0.14; W=forerunner-warrior@0.72<; D talk; W talk; D face <; D>-0.2 & P>-0.2',
      },
    ],
    after: [
      {
        title: "The Librarian's Plan",
        text: 'The Librarian convinced the Council that the rings should also keep life safe. Species would be saved, then returned once the Flood was gone. This was her Conservation Measure.',
        source: 'Halopedia: Halo Array',
        scene: 'C=chakas@0.36 & S=sanshyuum@0.48 & G=unggoy@0.6; beam 0.48 & C beamout & S beamout & G beamout; ring 0.74 0.26',
      },
      {
        title: 'The Weapon',
        text: 'If they were ever fired, the Halos would make every living thing in the galaxy go quiet, leaving the Flood nothing to feed on.',
        source: 'Halopedia: Halo Array',
        scene: 'bg space; planet 0.14 0.62 0.05 #4a8ac8 & planet 0.86 0.3 0.04 #c8a060; ring 0.5 0.34; ringfire; quiet',
      },
    ],
  },

  legend: {},

  map: [
    '#....................................................................................................................................................................................................................#',
    '#....................................................................................................................................................................................................................#',
    '#.......................................................................................................................................................................................::::::::::::::::::::::::::::.#',
    '#.......................................................................................................................................................................................::::::::::::::::::::::::::::.#',
    '#.......................................................................................................................................................................................::::::::::::::::::::::::::::.#',
    '#....................................................................................................................................................................................................................#',
    '#...:::::::::...................................======..............................................................................========..........................................................M..............#',
    '#...:::::::::.....................................::.....................=======...................................................................................................................=======...........#',
    '#...:::::::::...........................======....::......................................................................................................................======.....................................#',
    '#...:::::::::...........................::........::...======...======......................................................=====.............======......................................======.....................#',
    '#...:::::::::...................======..::........::...............................======.===============================.......................................=====...........=====.......................======...#',
    '#...:::::::::...........................::........::........................#.....................::..........::.......................##............................................................................#',
    '#..P:::::::::.................A.........::........::..........B.............#.........G..C....D...::..........::..........E............##.........H..F..I...............................J.......................L..K.#',
    '######################^^^^#######^^^^^^^^^^^^^^^^^^^^^^^^^^#################################^^^^^^^^^^^^^^^^^^^^^^^^^^^#####################################^^^#######^^^#############################################',
    '######################################################################################################################################################################################################################',
    '######################################################################################################################################################################################################################',
    '######################################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Cross the construction decks' }, { say: 'Hold JUMP while falling to hover. Use ABILITY to dash across gaps.', time: 4 }] },
    { on: 'A', do: [{ spawn: [{ unit: sn, n: 3, from: 'sky' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Secure the assembly deck' },
        { intensity: 1 },
        { wave: [{ unit: sn, n: 4, from: 'sky' }] },
        { wave: [{ unit: sn, n: 5, from: 'sky' }, { unit: sn, n: 2, from: 'G' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Cross the bridge to the ring segment' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: sn, n: 4, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the ring segment' },
        { hold: { seconds: 40, every: 6, label: 'HOLD', groups: [
          [{ unit: sn, n: 3, from: 'sky' }],
          [{ unit: sn, n: 2, from: 'H' }, { unit: sn, n: 2, from: 'sky' }],
          [{ unit: en, n: 1, from: 'H' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Climb to the overlook' },
      ],
    },
    { on: 'I', do: [{ spawn: [{ unit: sn, n: 3, from: 'sky' }] }] },
    {
      on: 'J',
      do: [
        { lock: ['J', 'K'] },
        { objective: 'Clear the overlook' },
        { intensity: 2 },
        { wave: [{ unit: sn, n: 5, from: 'sky' }, { unit: en, n: 1, from: 'L' }] },
        { wave: [{ unit: en, n: 2, from: 'M' }, { unit: sn, n: 4, from: 'sky' }] },
        { call: 'ignite' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    // The first ring lights up across the sky.
    async ignite(api) {
      const { scene, fx, hud, audio } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.slowmo(0.5, 2500);
      audio.sfx('teleport');
      for (const g of scene.halos ?? []) scene.tweens.add({ targets: g, alpha: 0.9, duration: 1800, yoyo: true, hold: 600 });
      fx.flash(0x9ff4ff, 900);
      await hud.say('At the Greater Ark, the first Halo came to life.', null, null, 4);
    },
  },
};
