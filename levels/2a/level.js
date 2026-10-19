// 2a · The Pillar of Autumn. Spec: docs/CAMPAIGN.md (2a).
// Canon checked against Halo: Combat Evolved; Halopedia: 343 Guilty Spark, Pillar of Autumn (2026-10-18). Layouts and enemy placement are staging.

export default {
  id: '2a',
  title: 'The Pillar of Autumn',
  era: 'covenant',
  theme: 'pillar-of-autumn',
  music: 'autumn-alarm',
  players: ['master-chief', 'marine'],

  archive: {
    before: [
      {
        title: '343 Guilty Spark', when: '97,445 BCE', where: 'Installation 04',
        text: 'When the Halos were made ready, the essence of Chakas, the human boy, became the Monitor of Installation 04: 343 Guilty Spark. He guarded the ring for a hundred thousand years.',
        source: 'Forerunner Saga; Halopedia: 343 Guilty Spark',
        scene: 'bg space; ring 0.76 0.3; C=chakas@0.38; wait 0.4; C data; S=guilty-spark@0.38,0.55; S glow #7ae8ff',
      },
      {
        title: 'A Ring in Space', when: 'September 2552', where: 'Installation 04',
        text: 'After the fall of Reach, the UNSC Pillar of Autumn jumped blindly through slipspace and found a giant ring: Installation 04. The Covenant followed.',
        source: 'Halo: Combat Evolved',
        scene: 'bg space; ring 0.78 0.3; portal 0.14 0.5; ship unsc 0.14>0.5 0.5 big; portal close & ship covenant -0.2>0.3 0.2 & ship covenant -0.3>0.18 0.12',
      },
      {
        title: 'Wake Up, Chief', where: 'Pillar of Autumn',
        text: 'Master Chief was woken from cryo sleep as the Covenant boarded the ship. Captain Keyes gave him Cortana, the ship\'s AI, to keep her safe.',
        source: 'Halo: Combat Evolved',
        scene: 'M=master-chief@0.36; M seal; wait 0.4; M wake; M glow #7ad8ff; E=elite@1.1< & G=grunt@1.2<; E>0.76 & G>0.88; M fire E',
      },
    ],
    after: [
      {
        title: 'Lifeboats', where: 'Installation 04',
        text: 'The Chief and Cortana escaped in a lifeboat and crash-landed on the ring. Captain Keyes brought the Pillar of Autumn down onto the ring.',
        source: 'Halo: Combat Evolved',
        scene: 'bg sky #4a7ad0 #cfe0f0 #4a7a3a; ring 0.72 0.16; ship unsc -0.2>0.42 0.5; boom 0.42 0.82 big; M=master-chief@0.42; M glow #7ad8ff; ship unsc 1.25>0.74 0.3 big slow',
      },
    ],
  },

  legend: {},

  map: [
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '#:::::::::::::::::::::::::#####################::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#############:::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::#####################::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#############:::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::......::::::::::#####################:::::::::::::::::::::::::::::::::::::::::::......:::::::::::::::::::::::::::::::::::::#############::::::::::::::::::::::::::::::::::......:::::::::::::#',
    '#:::::::::......::::::::::#####################:::::::::::::::::::::::::::::::::::::::::::......:::::::::::::::::::::::::::::::::::::#############::::::::::::::::::::::::::::::::::......:::::::::::::#',
    '#:::::::::......::::::::::::::::::::::::......::::::::::::::::::::::::::::::::::::::::::::......::::::::::::::::::::::::::::::::::::::::::::......:::::::::::::::::::M::::::::::::::......:::::::::::::#',
    '#:::::::::......::::::::::::::::::::::::......::::::::::::::::::=======:::::::::::::::::::......::::::::::::::::::=======:::::::::::::::::::......::::::::::::::::=======:::::::::::......:::::::::::::#',
    '#:::::::::......::::::::::::::::::::::::......::::::::::::::::::::::::::::::::::::::::::::......::::::::::::::::::::::::::::::::::::::::::::......::::::::::::::::::::::::::::::::::......:::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::======::::::::::::======::::::::::::::::::::::::::======::::::::::::======::::::::::::::::::::::::======::::::::::::======::::::::::::::::::::::#',
    '#::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#',
    '#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::#:::::::::::::::::::::::::::::::::::::::::::::::::#:::::::::::::::::::::::::::::::::::::::::::::::#::::::::::::::::::::::::::::::::::#',
    '#::P::::::::::::::::::::::::A:::::::::::::::::::::::B:::::::::::::#:::::::::G::C::::D^^:::::::::::::::E:::::::::::::#:::::::::H::F::::::::::::::::::::J:::::::::::::#:::::::::L::K::::::::::::::::X::::#',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
    '########################################################################################################################################################################################################',
  ],

  script: [
    { on: 'start', do: [{ objective: 'Get to the bridge' }, { allies: [{ unit: 'marine-ally', n: 1, from: 'sky' }] }] },
    { on: 'A', do: [{ spawn: [{ unit: 'grunt', n: 3, from: 'right' }] }] },
    {
      on: 'B',
      do: [
        { lock: ['B', 'C'] },
        { objective: 'Repel the boarders' },
        { intensity: 1 },
        { wave: [{ unit: 'grunt', n: 3, from: 'G' }, { unit: 'jackal', n: 1, from: 'G' }] },
        { wave: [{ unit: 'elite', n: 1, from: 'G' }, { unit: 'grunt', n: 3, from: 'right' }] },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Captain Keyes says: get to the lifeboats' },
      ],
    },
    { on: 'D', do: [{ spawn: [{ unit: 'jackal', n: 2, from: 'right' }, { unit: 'grunt', n: 2, from: 'right' }] }] },
    {
      on: 'E',
      do: [
        { lock: ['E', 'F'] },
        { objective: 'Hold the corridor' },
        { hold: { seconds: 45, every: 6, label: 'HOLD', groups: [
          [{ unit: 'grunt', n: 3, from: 'H' }],
          [{ unit: 'jackal', n: 2, from: 'H' }],
          [{ unit: 'elite', n: 1, from: 'H' }, { unit: 'grunt', n: 2, from: 'right' }],
        ] } },
        { unlock: true },
        { checkpoint: true },
        { objective: 'Reach the lifeboat bay' },
      ],
    },
    {
      on: 'J',
      do: [
        { lock: ['J', 'K'] },
        { objective: 'Clear the lifeboat bay' },
        { intensity: 2 },
        { wave: [{ unit: 'elite-major', n: 1, from: 'L' }, { unit: 'grunt', n: 3, from: 'M' }] },
        { wave: [{ unit: 'elite', n: 2, from: 'L' }, { unit: 'jackal', n: 2, from: 'right' }] },
        { unlock: true },
        { objective: 'Into the lifeboat!' },
      ],
    },
  ],
};
