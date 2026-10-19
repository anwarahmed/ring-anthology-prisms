// The prologue (before the first level) and the epilogue (after the last). Canon only,
// told plainly, each beat with its source; the facts are the same ones the levels'
// Archive cards state. A beat is played full screen by SagaScene: the theme's backdrop,
// the players (character ids) walking in, and the motifs (see src/engine/vignette.js;
// left out, they're picked from the text). The epilogue ends on the finale.

export const SAGA = {
  prologue: [
    {
      title: 'The Precursors', era: 'forerunner', theme: 'charum-hakkor', players: [], motifs: ['calm', 'fleet'],
      text: 'Long ago, an ancient people called the Precursors shaped life across the galaxy.',
      source: 'Halopedia: Precursor',
    },
    {
      title: 'The Forerunners', era: 'forerunner', theme: 'greater-ark', players: ['didact', 'forerunner-warrior'], motifs: ['fleet'],
      text: 'The Forerunners believed they had inherited the Precursors\' duty to protect all life. They called it the Mantle.',
      source: 'Halopedia: Forerunner; Mantle',
    },
    {
      title: 'Humanity', era: 'forerunner', theme: 'charum-hakkor', players: ['forthencho', 'ancient-human-soldier'], motifs: ['fleet'],
      text: 'Ancient humans built an empire among the stars, and went to war with the Forerunners.',
      source: 'Halopedia: Ancient humanity; Battle of Charum Hakkor',
    },
    {
      title: 'The Flood', era: 'forerunner', theme: 'forerunner-ship', players: ['forerunner-warrior'], motifs: ['flood'],
      text: 'Then the Flood came: a parasite that could take over any living thing.',
      source: 'Halopedia: Flood; Forerunner-Flood war',
    },
    {
      title: 'The Rings', era: 'forerunner', theme: 'greater-ark', players: ['isodidact'], motifs: ['ring'],
      text: 'To stop it, the Forerunners built the Halo rings.',
      source: 'Halopedia: Halo Array',
    },
    {
      title: 'The Archive', era: 'covenant', theme: 'installation-04', players: ['master-chief', 'arbiter'], motifs: ['calm'],
      text: 'This Archive holds their story, and the stories of everyone who came after, era by era.',
      source: 'Ring Anthology: Prisms',
    },
  ],
  epilogue: [
    {
      title: 'The Forerunners', era: 'forerunner', theme: 'ark-ancient', players: ['isodidact', 'forerunner-warrior'], motifs: ['ringFire'],
      text: 'The Forerunners fired the Halos to stop the Flood. Then they left the galaxy.',
      source: 'Halopedia: Halo Array; Forerunner',
    },
    {
      title: 'The Covenant War', era: 'covenant', theme: 'installation-08', players: ['master-chief', 'arbiter'], motifs: ['fleet', 'battle'],
      text: 'Humanity fought the Covenant for nearly thirty years. The war ended in 2553.',
      source: 'Halopedia: Human-Covenant War',
    },
    {
      title: 'The Created', era: 'created', theme: 'meridian', players: ['master-chief', 'fred-104'], motifs: ['battle'],
      text: 'Cortana led the Created, who used the Guardians to try to rule the galaxy.',
      source: 'Halo 5: Guardians; Halopedia: Created',
    },
    {
      title: 'Zeta Halo', era: 'banished', theme: 'zeta-halo', players: ['master-chief', 'spartan-iv'], motifs: ['battle'],
      text: 'On Zeta Halo, Master Chief stood against the Banished and stopped the Harbinger.',
      source: 'Halo Infinite; Halopedia: Harbinger',
    },
    { finale: true },
  ],
};
