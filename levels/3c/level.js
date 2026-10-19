// 3c · Writ of Union. Spec: docs/CAMPAIGN.md (3c).
// Canon checked against Halopedia: War of Beginnings, Covenant, Writ of Union
// (2026-10-18). Where the last battle was fought is not recorded, so the place is
// generic; the battles are staging. The unarmed delegation, the truce agreed by
// Breaking Shadow and Pelahsar the Strident, the Writ of Union and the roles it gave
// the San'Shyuum, the Sangheili and the Arbiter are canon.

const rf = 'sanshyuum-reformist';
const sn = 'sentinel';
const al = 'elite-ancient';

export default {
  id: '3c',
  title: 'Writ of Union',
  era: 'covenant',
  theme: 'writ-battlefield',
  music: 'covenant-war',
  players: ['sangheili-warrior', 'sangheili-warrior'],

  archive: {
    before: [
      {
        title: 'The Last Battle', when: '852 BCE',
        text: "After 86 years of war, the Sangheili and the San'Shyuum met in battle once more. Nobody knows exactly where.",
        source: 'Halopedia: War of Beginnings',
        scene: 'E=elite-ancient@0.12 & F=elite-ancient@0.24 & G=sangheili-warrior@0.36; R=sanshyuum-reformist@0.78< & T=sentinel@0.64,0.4<; E fire T & T fire F & R fire G; boom 0.5 0.8 & boom 0.42 0.84',
      },
    ],
    after: [
      {
        title: 'The Writ of Union', when: '852 BCE',
        text: "The San'Shyuum sent a delegation with no weapons. Two leaders, Breaking Shadow and Pelahsar the Strident, agreed to a truce. The Writ of Union founded the Covenant.",
        source: 'Halopedia: Writ of Union; Covenant',
        scene: 'B=sangheili-warrior@0.22; S=sanshyuum@0.82<; S unarm; S>0.58; S talk; B talk; B unarm; beam 0.4 #ffd27a',
      },
      {
        title: 'Prophets and Protectors',
        text: "The San'Shyuum became the Covenant's religious leaders, and the Sangheili became its protectors. The Hierarchs made the Arbiter a position of power in the military.",
        source: 'Halopedia: Covenant; Arbiter',
        scene: 'E=sangheili-warrior@0.3 & S=sanshyuum@0.5 & F=elite-ancient@0.7<; S unarm; S glow #ffd27a; E face > & F face <',
      },
      {
        title: 'The Price',
        text: 'The Sangheili gave up their independence for a shared faith.',
        source: 'Halopedia: Writ of Union',
        scene: 'E=sangheili-warrior@0.45; E kneel; ship covenant 1.2>0.6 0.15 slow',
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
    '#......................========..............................=====..........................................................................=======............................=======.................#',
    '#...............=======...=====..............................:::::.....................=====................................................:::::::................========....:::::::.................#',
    '#...............:::::::...:::::..............................:::::............................................======........................========....................=======:::::::.................#',
    '#...............:::::::...:::::..............................:::::====....................##.#.=======.................=========............:::::::.....................::::::::::::::.................#',
    '#...............:::::::...::####.............................:::::........................##.#........................####..................:::::::....................##:::::::::::::.................#',
    '#..P............:::::::.A.::####................B............::###....G...C...............##D#..............E.........####.........M...F....:::::::...........H........##::::::::::::L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Win the final battle' }, { allies: [{ unit: al, n: 2, from: 'left' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: rf, n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Break the first line' },
        { intensity: 1 },
        { wave: [{ unit: rf, n: 4, from: 'right' }, { unit: sn, n: 2, from: 'sky' }] },
        { wave: [{ unit: rf, n: 3, from: 'G' }, { unit: sn, n: 2, from: 'sky' }] },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: sn, n: 3, from: 'sky' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the ridge' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: rf, n: 3, from: 'right' }],
          [{ unit: sn, n: 3, from: 'sky' }],
          [{ unit: rf, n: 3, from: 'M' }, { unit: sn, n: 1, from: 'sky' }],
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
        { objective: 'The last stand of the war' },
        { intensity: 2 },
        { wave: [{ unit: rf, n: 4, from: 'right' }, { unit: sn, n: 3, from: 'sky' }] },
        { spawn: [{ unit: rf, n: 3, from: 'L' }, { unit: sn, n: 2, from: 'sky' }] },
        { wait: 6 },
        { call: 'truce' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    // An unarmed San'Shyuum delegation walks onto the battlefield and the fighting
    // stops: everyone still standing lowers their weapons.
    async truce(api) {
      const { scene, fx, hud, audio } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      for (const u of api.units) {
        if (!u.alive) continue;
        u.team = 'neutral';
        u.brain = () => u.setVelocityX(0);
      }
      audio.setIntensity(0);
      hud.letterbox(true);
      fx.flash(0xffffff, 500);
      const m = api.marker('L');
      for (let i = 0; i < 3; i++) {
        const u = scene.spawnUnit('sanshyuum-reformist', (m.x - 1 - i * 2) * api.tile, (m.y + 1) * api.tile, { team: 'neutral' });
        if (u) { u.brain = () => u.setVelocityX(0); u.equip(null); }
      }
      await hud.say("A San'Shyuum delegation came without weapons, and the fighting stopped.", null, null, 3.5);
      await hud.say('The Writ of Union founded the Covenant.', null, null, 3);
    },
  },
};
