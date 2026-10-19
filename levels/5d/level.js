// 5d · The Covenant. Spec: docs/CAMPAIGN.md (5d).
// Canon checked against Halo 3 and Halopedia: Citadel, Truth (2026-10-18). The fights
// are staging; the two Scarabs, the Hornets, the Flood's arrival, the Arbiter ending
// the Prophet of Truth and the rings not being fired are canon.

const br = 'jiralhanae-minor';
const bc = 'jiralhanae-captain';
const inf = 'flood-infection';
const fe = 'flood-elite';

export default {
  id: '5d',
  title: "The Covenant",
  era: 'covenant',
  theme: 'ark',
  music: 'covenant-war',
  players: ['master-chief', 'arbiter'],

  archive: {
    before: [
      {
        title: 'The Citadel', when: 'December 2552', where: 'The Ark',
        text: 'The Prophet of Truth was in the Citadel, ready to fire every ring. Two Scarabs guarded the way.',
        source: 'Halo 3; Halopedia: Citadel',
        scene: 'K=scarab@0.55< & L=scarab@0.88<; M=master-chief@0.08 & T=arbiter@0.16; M face > & T face >',
      },
      {
        title: 'The Flood',
        text: 'The Flood had followed them to the Ark. Now Master Chief and the Arbiter had two enemies.',
        source: 'Halo 3',
        scene: 'M=master-chief@0.2 & T=arbiter@0.3; B=jiralhanae-minor@0.82<; F=flood-elite@0.62< & I=flood-infection@0.56<; flood 0.6; M fire F & T fire B; I down',
      },
    ],
    after: [
      {
        title: 'Truth', when: 'December 2552', where: 'The Ark',
        text: 'In the Citadel, the Arbiter ended the Prophet of Truth. The rings were not fired.',
        source: 'Halo 3; Halopedia: Truth',
        scene: 'P=sanshyuum@0.72<; P unarm; T=arbiter@0.3; T>0.56; flash #9ff4ff; P down',
      },
      {
        title: 'High Charity',
        text: 'The Flood had taken High Charity, the holy city, and crashed it onto the Ark. Cortana was still inside.',
        source: 'Halo 3; Halopedia: High Charity',
        scene: 'bg space; planet 0.5 1.05 0.4 #8ab0c0; C=ship:keyship-big@0.28,0.12; C>0.55,0.62; boom 0.55 0.72 big & shake; flood 0.55; spark 0.55 0.6',
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
    '#.........................................................======.......................========...................................................................======...............................#',
    '#...................=======............................====:::::.........................................................................................................=======.......................#',
    '#...................:::::::............................:::::::::..................................................................................========...............:::::::.......................#',
    '#...................:::::::....========............====:::::::::.................=====....##.#................==================.......................................=======::.......................#',
    '#...................:::::::.##.........................:::::::::..........................##.#.....................:::::::::::::.........................................::::####......................#',
    '#..P................::::A::.##..................B......:###:::::......G...C...............##D#..............E......::::::###::::...M...F......................H..........::::####....L...I..J......X...#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Reach the Citadel' }, { allies: [{ unit: 'elite-ally', n: 2, from: 'left' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: br, n: 2, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Break the Brute line' },
        { intensity: 1 },
        { wave: [{ unit: br, n: 3, from: 'right' }, { unit: bc, n: 1, from: 'right' }] },
        { wave: [{ unit: br, n: 2, from: 'G' }, { unit: inf, n: 6, from: 'left', gap: 0.12 }] },
        { unlock: true },
        { checkpoint: true },
        { vehicle: { id: 'hornet', at: 'D' } },
        { objective: 'A Hornet! Get in with SWAP' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: inf, n: 6, from: 'right', gap: 0.15 }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold off the Flood' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: inf, n: 6, from: 'right', gap: 0.12 }],
          [{ unit: fe, n: 2, from: 'M' }, { unit: br, n: 1, from: 'right' }],
          [{ unit: fe, n: 2, from: 'right' }, { unit: inf, n: 4, from: 'left', gap: 0.12 }],
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
        { objective: 'Two Scarabs guard the Citadel!' },
        { spawn: [{ unit: 'scarab', n: 1, from: 'H' }] },
        { boss: { unit: 'scarab', from: 'I', title: 'Two Scarabs', subtitle: 'Guardians of the Citadel' } },
        { call: 'bothScarabs' },
        { call: 'truth' },
        { end: { result: 'win' } },
      ],
    },
  ],

  hooks: {
    async bothScarabs(api) {
      await new Promise((res) => {
        const ev = api.scene.time.addEvent({ delay: 200, loop: true, callback: () => {
          if (!api.scene.units.some((u) => u.alive && u.id === 'scarab')) { ev.remove(); res(); }
        } });
      });
    },
    async truth(api) {
      const { scene, fx, hud } = api;
      for (const p of api.players) p.invulnUntil = Infinity;
      hud.letterbox(true);
      fx.flash(0xffffff, 500);
      fx.slowmo(0.5, 1800);
      await new Promise((r) => scene.time.delayedCall(400, r));
      await hud.say("In the Citadel, the Arbiter ended the Prophet of Truth.", null, null, 3.5);
      await hud.say("The rings would not be fired.", null, null, 3.5);
    },
  },
};
