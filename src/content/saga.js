// The prologue (before the first level) and the epilogue (after the last). Canon only,
// told plainly, each beat with its source; the facts are the same ones the levels'
// Archive cards state. A beat is played full screen by SagaScene: the theme's backdrop,
// and a scene script that acts it out (src/engine/stage.js). The epilogue ends on the finale.

export const SAGA = {
  prologue: [
    {
      title: 'The Precursors', era: 'forerunner', theme: 'charum-hakkor', players: [], motifs: ['calm', 'fleet'],
      text: 'Long ago, an ancient people called the Precursors shaped life across the galaxy.',
      source: 'Halopedia: Precursor',
      scene: 'bg space; planet 0.24 0.4 0.08 #8a6ab0 & planet 0.7 0.26 0.05 #c8a060 & planet 0.86 0.6 0.06 #6ac8a0; beam 0.24 #e8d8ff & beam 0.7 #e8d8ff & beam 0.86 #e8d8ff',
    },
    {
      title: 'The Forerunners', era: 'forerunner', theme: 'greater-ark', players: ['didact', 'forerunner-warrior'], motifs: ['fleet'],
      text: 'The Forerunners believed they had inherited the Precursors\' duty to protect all life. They called it the Mantle.',
      source: 'Halopedia: Forerunner; Mantle',
      scene: 'D=didact@0.24 & W=forerunner-warrior@0.12; fleet forerunner 4; ring 0.74 0.28; D glow #7ae8ff',
    },
    {
      title: 'Humanity', era: 'forerunner', theme: 'charum-hakkor', players: ['forthencho', 'ancient-human-soldier'], motifs: ['fleet'],
      text: 'Ancient humans built an empire among the stars, and went to war with the Forerunners.',
      source: 'Halopedia: Ancient humanity; Battle of Charum Hakkor',
      scene: 'bg space; planet 0.2 0.5 0.1 #3a7ac8; H=ship:unsc-big@0.1,0.3; F=ship:forerunner-big@1.2,0.42<; H>0.42,0.3 & F>0.68,0.4; H fire F & F fire H; boom 0.55 0.36 big',
    },
    {
      title: 'The Flood', era: 'forerunner', theme: 'forerunner-ship', players: ['forerunner-warrior'], motifs: ['flood'],
      text: 'Then the Flood came: a parasite that could take over any living thing.',
      source: 'Halopedia: Flood; Forerunner-Flood war',
      scene: 'W=forerunner-warrior@0.16; F=flood-warrior@0.74< & I=flood-infection@0.84< & J=flood-infection@0.64<; flood 0.74 & flood 0.5; W fire J; J down; F>0.5; W kneel',
    },
    {
      title: 'The Rings', era: 'forerunner', theme: 'greater-ark', players: ['isodidact'], motifs: ['ring'],
      text: 'To stop it, the Forerunners built the Halo rings.',
      source: 'Halopedia: Halo Array',
      scene: 'bg space; I=isodidact@0.14; ring 0.38 0.32 & ring 0.72 0.5; ring 0.84 0.2; I glow #7ae8ff',
    },
    {
      title: 'The Archive', era: 'covenant', theme: 'installation-04', players: ['master-chief', 'arbiter'], motifs: ['calm'],
      text: 'This Archive holds their story, and the stories of everyone who came after, era by era.',
      source: 'Ring Anthology: Prisms',
      scene: 'M=master-chief@-0.1 & T=arbiter@-0.2; M>0.42 & T>0.3; ring 0.72 0.22; M face > & T face >',
    },
  ],
  epilogue: [
    {
      title: 'The Forerunners', era: 'forerunner', theme: 'ark-ancient', players: ['isodidact', 'forerunner-warrior'], motifs: ['ringFire'],
      text: 'The Forerunners fired the Halos to stop the Flood. Then they left the galaxy.',
      source: 'Halopedia: Halo Array; Forerunner',
      scene: 'bg space; I=isodidact@0.16 & W=forerunner-warrior@0.06; ring 0.66 0.32; ringfire; quiet; S=ship:forerunner-big@0.4,0.18; S>1.3,0.1',
    },
    {
      title: 'The Covenant War', era: 'covenant', theme: 'installation-08', players: ['master-chief', 'arbiter'], motifs: ['fleet', 'battle'],
      text: 'Humanity fought the Covenant for nearly thirty years. The war ended in 2553.',
      source: 'Halopedia: Human-Covenant War',
      scene: 'M=master-chief@0.14 & T=arbiter@0.26; C=ship:covenant-big@0.7,0.16<; E=elite@0.72< & B=jiralhanae-minor@0.84<; M fire E & T fire B; E down & B down; C>1.3,0.1',
    },
    {
      title: 'The Created', era: 'created', theme: 'meridian', players: ['master-chief', 'fred-104'], motifs: ['battle'],
      text: 'Cortana led the Created, who used the Guardians to try to rule the galaxy.',
      source: 'Halo 5: Guardians; Halopedia: Created',
      scene: 'M=master-chief@0.18 & F=fred-104@0.08; G=ship:forerunner-big@0.66,0.24; beam 0.66 #7ad8ff; G glow #7ad8ff; M face >',
    },
    {
      title: 'Zeta Halo', era: 'banished', theme: 'zeta-halo', players: ['master-chief', 'spartan-iv'], motifs: ['battle'],
      text: 'On Zeta Halo, Master Chief stood against the Banished and stopped the Harbinger.',
      source: 'Halo Infinite; Halopedia: Harbinger',
      scene: 'M=master-chief@0.2 & S=spartan-iv@0.1; B=banished-brute@0.66< & H=harbinger@0.84<; M fire B; B down; S fire H & M fire H; flash #9ff4ff; H down',
    },
    { finale: true },
  ],
};
