// Chiptune tracks for the built-in synth (src/engine/audio.js). All original music,
// except arrangements of Halo 3 music, which Microsoft's rules allow (docs/LEGAL.md).
// Do not add melodies from any other Halo game.
//
// Notation: space-separated tokens "NOTE:steps". A step is a 16th note.
//   D4:4     D in octave 4 for 4 steps     D3+F3+A3:16   a chord
//   -:4      rest                          k s h         kick, snare, hat (noise layer)
// Each layer has a level: 0 plays always (calm), 1 joins in combat, 2 joins for bosses
// and climaxes, which gives the music its swell.

export const TRACKS = {
  title: {
    bpm: 72,
    layers: {
      pad: { wave: 'triangle', vol: 0.16, level: 0, notes: 'D3+A3+D4:32 A#2+F3+D4:32 C3+G3+E4:32 A2+E3+C#4:32' },
      choir: { wave: 'sine', vol: 0.12, level: 0, vibrato: 5, notes: 'A4:8 D5:8 C5:8 A4:8 G4:8 A4:8 F4:16 E4:8 G4:8 A4:8 C5:8 A4:24 -:8' },
      bass: { wave: 'triangle', vol: 0.18, level: 0, notes: 'D2:32 A#1:32 C2:32 A1:32' },
    },
  },
  'last-stand': {
    bpm: 124,
    layers: {
      bass: {
        wave: 'square', vol: 0.07, level: 0,
        notes: 'D2:2 D2:2 D3:2 D2:2 D2:2 D2:2 D3:2 D2:2 A#1:2 A#1:2 A#2:2 A#1:2 A#1:2 A#1:2 A#2:2 A#1:2 ' +
          'C2:2 C2:2 C3:2 C2:2 C2:2 C2:2 C3:2 C2:2 A1:2 A1:2 A2:2 A1:2 A1:2 A1:2 A2:2 A1:2',
      },
      pad: { wave: 'sawtooth', vol: 0.035, level: 0, notes: 'D3+F3+A3:16 A#2+D3+F3:16 C3+E3+G3:16 A2+C#3+E3:16' },
      drums: { wave: 'noise', vol: 0.22, level: 1, notes: 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2 k:2 h:2 s:2 h:2 k:2 k:2 s:2 s:1 s:1' },
      lead: {
        wave: 'square', vol: 0.06, level: 1,
        notes: 'D4:4 F4:2 E4:2 D4:4 A4:4 A#4:6 A4:2 G4:4 F4:4 G4:4 E4:2 F4:2 G4:4 C5:4 A4:12 -:4',
      },
      arp: {
        wave: 'square', vol: 0.03, level: 2,
        notes: 'D5:1 A4:1 F4:1 A4:1 D5:1 A4:1 F4:1 A4:1 D5:1 A4:1 F4:1 A4:1 D5:1 A4:1 F4:1 A4:1 ' +
          'D5:1 A#4:1 F4:1 A#4:1 D5:1 A#4:1 F4:1 A#4:1 D5:1 A#4:1 F4:1 A#4:1 D5:1 A#4:1 F4:1 A#4:1 ' +
          'E5:1 C5:1 G4:1 C5:1 E5:1 C5:1 G4:1 C5:1 E5:1 C5:1 G4:1 C5:1 E5:1 C5:1 G4:1 C5:1 ' +
          'E5:1 C#5:1 A4:1 C#5:1 E5:1 C#5:1 A4:1 C#5:1 E5:1 C#5:1 A4:1 C#5:1 E5:1 C#5:1 A4:1 C#5:1',
      },
    },
  },
  'archive': {
    bpm: 60,
    layers: {
      pad: { wave: 'sine', vol: 0.12, level: 0, notes: 'D3+A3:16 F3+C4:16 A#2+F3:16 C3+G3:16' },
      bell: { wave: 'triangle', vol: 0.05, level: 0, notes: 'A4:4 -:4 D5:4 -:4 C5:4 -:4 A4:8 F4:4 -:4 G4:4 -:4 E4:8 -:8' },
    },
  },
};
