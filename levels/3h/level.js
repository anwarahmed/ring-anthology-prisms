// 3h · Contact Harvest. Spec: docs/CAMPAIGN.md (3h).
// Canon checked against Halo: Contact Harvest and Halopedia: Battle of Harvest,
// Maccabeus (2026-10-18). The fights are staging; first contact on Harvest in 2525,
// Johnson training the militia, Maccabeus's attack, the Warthog ram at Gladsheim, the
// Oracle and the Luminary, the Prophets' lie and Tartarus replacing the wounded
// Maccabeus (told gently) are canon.

const gr = 'grunt';
const jk = 'jackal';
const br = 'jiralhanae-minor';
const bc = 'jiralhanae-captain';

export default {
  id: '3h',
  title: 'Contact Harvest',
  era: 'covenant',
  theme: 'harvest',
  music: 'covenant-hunt',
  players: ['johnson', 'byrne'],

  archive: {
    before: [
      {
        title: 'Harvest', when: '2525', where: 'Harvest',
        text: 'Harvest was a quiet farming colony, far from Earth.',
        source: 'Halo: Contact Harvest',
        scene: 'bg sky #7ab0e0 #f4e4a8 #9ab048; ship unsc 0.1>0.42 0.3 slow; fire 0.8',
      },
      {
        title: 'The Militia', when: '2525', where: 'Harvest',
        text: "Staff Sergeant Avery Johnson came to Harvest to train its militia. Staff Sergeant Nolan Byrne was with him.",
        source: 'Halo: Contact Harvest',
        scene: 'J=johnson@0.3 & B=byrne@0.4; M=marine@0.64< & N=marine@0.74<; J talk; M face < & N face <',
      },
      {
        title: 'First Contact', when: '2525', where: 'Harvest',
        text: 'Then Covenant ships arrived, led by the Jiralhanae chieftain Maccabeus. It was the first time humanity met the Covenant.',
        source: 'Halo: Contact Harvest; Halopedia: Battle of Harvest',
        scene: 'J=johnson@0.2 & B=byrne@0.3; ship covenant 1.2>0.64 0.16 big; beam 0.76 #c890ff & M=maccabeus@0.76<; J face >',
      },
    ],
    after: [
      {
        title: 'Gladsheim', when: '2525', where: 'Harvest',
        text: 'At Gladsheim, Johnson and Byrne rammed Maccabeus with a Warthog, and he was badly hurt.',
        source: 'Halo: Contact Harvest',
        scene: 'W=veh:warthog@0.1; M=maccabeus@0.82<; W>0.62; boom 0.74 0.8 & M kneel',
      },
      {
        title: 'The Reclaimers',
        text: 'A Forerunner device called the Luminary, and an ancient machine called the Oracle, revealed the truth: humans were the ones the Forerunners called the Reclaimers.',
        source: 'Halo: Contact Harvest',
        scene: 'J=johnson@0.28; beam 0.5 #9ff4ff; O=guilty-spark@0.64,0.4<; O glow #ffb84a; O talk; J face >',
      },
      {
        title: 'The Great Lie',
        text: 'Three Covenant leaders hid this truth to keep their power. They became the Prophets of Truth, Regret and Mercy, and they declared war on humanity.',
        source: 'Halo: Contact Harvest',
        scene: 'P=sanshyuum@0.3 & Q=sanshyuum@0.45 & R=sanshyuum@0.6; P unarm & Q unarm & R unarm; Q talk; fleet covenant 4',
      },
      {
        title: 'Tartarus',
        text: 'Later, the wounded Maccabeus lost his place as chieftain to another Jiralhanae: Tartarus.',
        source: 'Halo: Contact Harvest',
        scene: 'M=maccabeus@0.56<; T=tartarus@1.1<; T>0.74; M kneel; T glow #ff8a3a',
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
    '#...........................................................................................=====......................................................................................................#',
    '#.........====..........................................========............................:::::.................=======..............................................................................#',
    '#.........::::..............................................................................:::::......................=======...............=======...................................................#',
    '#.........::::==========......................................====........................##:::::====.............=====......................:::::::==.................................................#',
    '#.........::::.....:::::....###...............................::::........................##:::::::::................####....................:::::::::.................................................#',
    '#..P......::::.....:::::A...###.................B.............::###...G...C...............##D::::::::.......E........####..........M...F.....:::::::::........H......................L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Defend the colony' }, { allies: [{ unit: 'odst-ally', n: 2, from: 'left' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: gr, n: 3, from: 'sky' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Hold the farm' },
        { intensity: 1 },
        { wave: [{ unit: gr, n: 4, from: 'sky' }, { unit: jk, n: 1, from: 'right' }] },
        { wave: [{ unit: jk, n: 2, from: 'G' }, { unit: br, n: 1, from: 'sky' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Fall back toward Gladsheim' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: br, n: 2, from: 'right' }, { unit: gr, n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Protect the militia' },
        { allies: [{ unit: 'odst-ally', n: 2, from: 'left' }] },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: gr, n: 3, from: 'sky' }, { unit: jk, n: 1, from: 'right' }],
          [{ unit: br, n: 2, from: 'M' }],
          [{ unit: bc, n: 1, from: 'right' }, { unit: gr, n: 2, from: 'sky' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
      ],
    },
    {
      on: 'H',
      do: [
        { lock: ['H', 'I'] },
        { vehicle: { id: 'warthog', at: 'H' } },
        { objective: 'Gladsheim: get in the Warthog (SWAP) and ram Maccabeus!' },
        { intensity: 2 },
        { boss: { unit: 'maccabeus', from: 'L', title: 'Maccabeus', subtitle: 'Jiralhanae Chieftain' } },
        { call: 'wounded' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    // The ram: a Warthog driven fast into Maccabeus hits him hard (a short cooldown).
    update(api) {
      const { scene } = api;
      const boss = scene.units.find((u) => u.alive && u.id === 'maccabeus');
      if (!boss) return;
      for (const v of scene.vehicles ?? []) {
        if (!v.alive || !v.driver || Math.abs(v.body.velocity.x) < 120) continue;
        if (Math.abs(v.x - boss.x) > 40 || Math.abs(v.y - boss.y) > 40) continue;
        if (scene.time.now < (boss.rammedAt ?? 0) + 900) continue;
        boss.rammedAt = scene.time.now;
        boss.hurt(260, 'melee', v.driver);
        boss.setVelocity(Math.sign(v.body.velocity.x) * 260, -260);
        api.fx.shake(0.02, 400);
        api.fx.hitstop?.(120);
      }
    },
    async wounded(api) {
      api.hud.letterbox(true);
      api.fx.slowmo(0.5, 1800);
      await api.hud.say('Maccabeus was badly wounded, and the Covenant fell back.', null, null, 3.5);
    },
  },
};
