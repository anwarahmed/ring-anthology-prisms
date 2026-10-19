// 1c · First Contagion. Spec: docs/CAMPAIGN.md (1c).
// Canon checked against Halopedia: Forerunner-Flood war (2026-10-18). The ship and its
// layout are staging; the events (fleets lost, total extermination, the Flood's
// retreat) are canon.

const inf = 'flood-infection';
const fw = 'flood-warrior';

export default {
  id: '1c',
  title: 'First Contagion',
  era: 'forerunner',
  theme: 'forerunner-ship',
  music: 'flood-dread',
  players: ['forerunner-warrior', 'forerunner-warrior'],

  archive: {
    before: [
      {
        title: 'A New Enemy', when: 'c. 107,500 BCE', where: 'Human space',
        text: 'While they fought humanity, the Forerunners met the Flood for themselves. It spread through their ships faster than anyone expected.',
        source: 'Halopedia: Forerunner-Flood war',
        scene: 'bg space #1a2238; ship forerunner -0.2>0.4 0.24 big; ship flood 1.2>0.7 0.14; W=forerunner-warrior@0.16; G=flood-warrior@0.86< & I=flood-infection@0.76<; G>0.56 & I>0.46; W fire G',
      },
      {
        title: 'A Hard Choice',
        text: 'Hundreds of Forerunner fleets were taken by the Flood. The warrior-servants made a hard rule: anything the Flood touched had to be destroyed, even their own ships.',
        source: 'Halopedia: Forerunner-Flood war',
        scene: 'bg space; ship flood -0.2>0.48 0.3 big; ship forerunner 1.2>0.8 0.14; wait 0.3; boom 0.48 0.3 big & flash',
      },
    ],
    after: [
      {
        title: 'Silence',
        text: 'Then the Flood seemed to vanish. Many believed humanity had found a cure. But the retreat was part of the Flood\'s own plan.',
        source: 'Halopedia: Forerunner-Flood war',
        scene: 'W=forerunner-warrior@0.14 & V=forerunner-warrior@0.24; G=flood-warrior@0.72< & I=flood-infection@0.84<; G hide & I hide; W talk',
      },
      {
        title: 'Nine Thousand Years',
        text: 'The Flood stayed hidden for more than nine thousand years. When it returned, the great Forerunner-Flood war began.',
        source: 'Halopedia: Forerunner-Flood war',
        scene: 'dark; wait 1; G=flood-warrior@0.62< & H=flood-warrior@0.8< & I=flood-infection@0.7<; light & flood 0.7; W=forerunner-warrior@0.08; W>0.26; W fire G',
      },
    ],
  },

  legend: {},

  map: [
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '#:::::::::::::::::::::::::#######################::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::###############:::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::#######################::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::###############:::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::......::::::::::::#######################:::::::::::......::::::::::::::::::::::::::::::::::::::::::......:::::::::::::::::::###############::::::::::::......:::::::::::::::::::......::::::::#',
    '#:::::::......::::::::::::#######################:::::::::::......::::::::::::::::::::::::::::::::::::::::::......:::::::::::::::::::###############::::::::::::......:::::::::::::::::::......::::::::#',
    '#:::::::......::::::::::::#######################:::::::::::......::::::::::::::::::::::::::::::::::::::::::......::::::::::::::::::::::::::::::::::::::::::::::...M..:::::::::::::::::::......::::::::#',
    '#:::::::......::::::::::::::::......::::::::::::::::::::::::......=======:::::::::::::::::::::::::::::::::::......:::::::======:::::::::::::::::::::::::::::::::=======::::::::::::::::::......::::::::#',
    '#:::::::......::::::::::::::::......::::::::::::::::::::::::......::::::::::::::::::::::::::::::::::::::=====.....::::::::::::::::::::::::::::::::::::::::::::::......:::::::::::::::::::......::::::::#',
    '#:::::::::======:::::::::::::::::::::::::::::::::::::::======:::::::::::::::::::::::===============:::::::::::::::::::::::::::::::::::::::::::::::::::::=====:::::::::::::======:::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::=====:::::::::::::::::::::::::::::::::=======:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::======:::::#',
    '#:::::::::::::::::::::::::::::::::###::::::::::::::::::::::::::#::::::::::::::::::::::::::::::::::::::::::::::#:::::::::::::#::::::::::::::::::::::::::::::::::::::#:::::::::::::::::::::::::::::::::::#',
    '#::P::::::::::::::::::::::::A:::::###:::::::::::::::B::::::::::#::::::::::::G::C::::D:^^^:::::^^::::::E:::::::#:::::::::::::#:H::F:::I::::::^^::::::::J::::::::::::#::::::::::L::K::::^^::::::::::::X::#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Board the lost ship' }, { spawn: [{ unit: inf, n: 3, from: 'right', gap: 0.6 }] }] },
    { on: 'A', do: [{ objective: 'Find the crew' }, { spawn: [{ unit: inf, n: 6, from: 'right', gap: 0.3 }, { unit: fw, n: 1, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Clear the cargo bay' },
        { intensity: 1 },
        { wave: [{ unit: inf, n: 8, from: 'sky', gap: 0.25 }] },
        { wave: [{ unit: fw, n: 2, from: 'G' }, { unit: inf, n: 4, from: 'right' }] },
        { wave: [{ unit: fw, n: 3, from: 'G' }, { unit: inf, n: 6, from: 'sky' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'There is no crew left. Reach the engine room' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: fw, n: 2, from: 'right' }, { unit: inf, n: 6, from: 'right', gap: 0.3 }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the engine room' },
        { hold: { seconds: 45, every: 5, label: 'HOLD', groups: [
          [{ unit: inf, n: 6, from: 'sky', gap: 0.2 }],
          [{ unit: fw, n: 2, from: 'H' }],
          [{ unit: fw, n: 1, from: 'H' }, { unit: inf, n: 5, from: 'right' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Reach the bridge' },
      ],
    },
    { on: 'I', do: [{ spawn: [{ unit: inf, n: 8, from: 'right', gap: 0.2 }] }] },
    {
      on: 'J',
      do: [
        { lock: ['J', 'K'] },
        { objective: 'Take the bridge' },
        { intensity: 2 },
        { wave: [{ unit: fw, n: 3, from: 'L' }, { unit: inf, n: 6, from: 'M' }] },
        { wave: [{ unit: fw, n: 4, from: 'L' }, { unit: inf, n: 8, from: 'sky' }] },
        { call: 'purge' },
        { unlock: true },
        { objective: 'The ship is lost. Get to the escape pods!' },
      ],
    },
  ],

  hooks: {
    // The rule: the infested ship must be destroyed. Alarms, a countdown, and explosions
    // chasing the players to the pod bay (the X exit ends the level).
    async purge(api) {
      const { scene, fx, hud, audio } = api;
      fx.slowmo(0.4, 1200);
      fx.flash(0xff3030, 400);
      await hud.say('The warrior-servants set the ship to destroy itself.', null, null, 3);
      hud.timer('PURGE', 40);
      scene.time.addEvent({
        delay: 700, loop: true,
        callback: () => {
          const p = api.players.find((pl) => pl.alive);
          if (!p) return;
          const x = p.x - 120 + Math.random() * 60;
          fx.explosion(x, (11 + Math.random() * 2) * api.tile, 30);
          fx.flash(0xff2020, 80);
          audio.sfx('shieldLow');
        },
      });
    },
  },
};
