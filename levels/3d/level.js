// 3d · Rentus. Spec: docs/CAMPAIGN.md (3d).
// Canon checked against Halopedia: Arbiter, Covenant, Lekgolo, The Rending, High
// Charity (2026-10-18). The battles are staging; the Covenant's war with the Lekgolo,
// Jeht 'Lcmutee's proposal and the Hierarchs' reluctant agreement are canon.

const lk = 'lekgolo';
const al = 'elite';

export default {
  id: '3d',
  title: 'Rentus',
  era: 'covenant',
  theme: 'rentus',
  music: 'covenant-war',
  players: ['jeht-lcmutee', 'sangheili-warrior'],

  archive: {
    before: [
      {
        title: 'The Rending', when: '851 BCE',
        text: "Not every Sangheili accepted the Writ of Union. A rebellion led by Ussa 'Xellus, called the Rending, tried to break the Covenant apart. It failed.",
        source: 'Halopedia: The Rending',
      },
      {
        title: 'High Charity', when: '851–791 BCE',
        text: 'The Covenant built its holy city, High Charity, around the Forerunner Dreadnought.',
        source: 'Halopedia: High Charity',
      },
      {
        title: 'The Lekgolo', when: '784 BCE', where: 'Rentus',
        text: 'The Covenant met the Lekgolo: colonies of small worm-like creatures that join together into one body. The two sides went to war.',
        source: 'Halopedia: Lekgolo; Arbiter',
      },
    ],
    after: [
      {
        title: "The Arbiter's Idea", when: '784 BCE', where: 'Rentus',
        text: "Arbiter Jeht 'Lcmutee studied the Lekgolo and saw how strong they were. He proposed bringing them into the Covenant instead of fighting them.",
        source: 'Halopedia: Arbiter',
      },
      {
        title: 'Hunters',
        text: "The Hierarchs reluctantly agreed. Lekgolo colonies in heavy armor became the Covenant's Hunters.",
        source: 'Halopedia: Lekgolo; Mgalekgolo',
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
    '#...........==========....................................=======..............................................======............................======................................................#',
    '#...........:::::::...........................................======...........................................::::::.......=======.............======..............=============......................#',
    '#...........:::::::......=======..............................:=======.............=====........=====..........::::::.......:::::::.............::::::..............::::::....=====....................#',
    '#...........:::::::...........................................:::::::::............:::::..##....:::::..........::::::......=:::::::.............::::::..............::::::....:::::....................#',
    '#...........:::::::.........##..............................####:::::::............:::::..##....:::::..........::::::...####:::::::.............::::::..............::::::....:::::....................#',
    '#..P........:::::::.....A...##......^^^.........B...........####::::::G...C........:::::..##D...^^^::.......E..::::::...####:::::::M...F........::^^^:........H.....:::####...:::::..L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Cross the Lekgolo fields' }, { allies: [{ unit: al, n: 2, from: 'left' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: lk, n: 4, from: 'right', gap: 0.5 }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'The ground is moving' },
        { intensity: 1 },
        { fx: 'shake' },
        { wave: [{ unit: lk, n: 5, from: 'right' }] },
        { wave: [{ unit: lk, n: 4, from: 'G' }, { unit: lk, n: 3, from: 'left' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: "Reach the Arbiter's camp" },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: lk, n: 5, from: 'right', gap: 0.4 }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold while the Arbiter studies them' },
        { hold: { seconds: 40, every: 5, label: 'STUDY', groups: [
          [{ unit: lk, n: 4, from: 'right' }],
          [{ unit: lk, n: 3, from: 'M' }, { unit: lk, n: 2, from: 'left' }],
          [{ unit: lk, n: 5, from: 'right' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
        { allies: [{ unit: al, n: 2, from: 'left' }] },
      ],
    },
    {
      on: 'H',
      do: [
        { lock: ['H', 'I'] },
        { intensity: 2 },
        { objective: 'Flank them: their shields only cover the front' },
        { spawn: [{ unit: 'hunter-rentus', n: 1, from: 'I' }] },
        { boss: { unit: 'hunter-rentus', from: 'L', title: 'Mgalekgolo', subtitle: 'A bonded pair' } },
        { call: 'clearPair' },
        { call: 'proposal' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    // Hunters come in pairs: the fight ends when both are down.
    async clearPair(api) {
      await new Promise((res) => {
        const ev = api.scene.time.addEvent({ delay: 200, loop: true, callback: () => {
          if (!api.scene.units.some((u) => u.alive && u.id === 'hunter-rentus')) { ev.remove(); res(); }
        } });
      });
    },
    async proposal(api) {
      api.hud.letterbox(true);
      api.fx.slowmo(0.5, 1500);
      await api.hud.say("Arbiter Jeht 'Lcmutee proposed that the Lekgolo join the Covenant.", null, null, 3.5);
    },
  },
};
