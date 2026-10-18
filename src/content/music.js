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
  // 1b, 1d: Forerunner might. Original.
  'forerunner-march': {
    bpm: 112,
    layers: {
      bass: { wave: 'square', vol: 0.06, level: 0, notes: 'F2:2 F2:2 C3:2 F2:2 F2:2 F2:2 C3:2 F2:2 G2:2 G2:2 D3:2 G2:2 G2:2 G2:2 D3:2 G2:2 A2:2 A2:2 E3:2 A2:2 A2:2 A2:2 E3:2 A2:2 C3:2 C3:2 G3:2 C3:2 E2:2 E2:2 B2:2 E2:2' },
      pad: { wave: 'triangle', vol: 0.09, level: 0, notes: 'F3+A3+C4:16 G3+B3+D4:16 A3+C4+E4:16 C3+E3+G3:8 E3+G3+B3:8' },
      drums: { wave: 'noise', vol: 0.2, level: 1, notes: 'k:4 h:2 h:2 s:4 h:2 k:2 k:4 h:2 h:2 s:4 s:2 s:2' },
      lead: { wave: 'triangle', vol: 0.11, level: 1, notes: 'C5:4 A4:2 C5:2 D5:6 C5:2 B4:4 G4:4 E5:4 D5:2 C5:2 A4:8 G4:4 E4:4 G4:4 A4:4 B4:8' },
      arp: { wave: 'square', vol: 0.025, level: 2, notes: 'F4:1 A4:1 C5:1 A4:1 F4:1 A4:1 C5:1 A4:1 F4:1 A4:1 C5:1 A4:1 F4:1 A4:1 C5:1 A4:1 G4:1 B4:1 D5:1 B4:1 G4:1 B4:1 D5:1 B4:1 G4:1 B4:1 D5:1 B4:1 G4:1 B4:1 D5:1 B4:1 A4:1 C5:1 E5:1 C5:1 A4:1 C5:1 E5:1 C5:1 A4:1 C5:1 E5:1 C5:1 A4:1 C5:1 E5:1 C5:1 C5:1 E5:1 G5:1 E5:1 C5:1 E5:1 G5:1 E5:1 C5:1 E5:1 G5:1 E5:1 C5:1 E5:1 G5:1 E5:1' },
    },
  },
  // 1c: the Flood. Original.
  'flood-dread': {
    bpm: 84,
    layers: {
      drone: { wave: 'sawtooth', vol: 0.03, level: 0, notes: 'E2+B2:32 F2+C3:32' },
      heart: { wave: 'noise', vol: 0.25, level: 0, notes: 'k:3 k:5 -:8' },
      pad: { wave: 'sine', vol: 0.09, level: 0, notes: 'E4:8 -:8 F4:8 -:8 E4:8 D#4:8 E4:16' },
      stabs: { wave: 'square', vol: 0.045, level: 1, notes: '-:12 A#3+E4:4 -:12 B3+F4:4 -:12 A#3+E4:4 -:8 B3:2 C4:2 C#4:2 D4:2' },
      drums: { wave: 'noise', vol: 0.18, level: 1, notes: 'k:2 h:2 s:2 h:2 k:2 k:2 s:4' },
      arp: { wave: 'square', vol: 0.025, level: 2, notes: 'E5:1 B4:1 G4:1 B4:1 E5:1 B4:1 G4:1 B4:1 E5:1 B4:1 G4:1 B4:1 E5:1 B4:1 G4:1 B4:1 F5:1 C5:1 A4:1 C5:1 F5:1 C5:1 A4:1 C5:1 F5:1 C5:1 A4:1 C5:1 F5:1 C5:1 A4:1 C5:1' },
    },
  },
  // 1e: the race against the ring. Original.
  'janjur-escape': {
    bpm: 144,
    layers: {
      bass: { wave: 'square', vol: 0.06, level: 0, notes: 'A2:1 A2:1 A3:1 A2:1 A2:1 A2:1 A3:1 A2:1 A2:1 A2:1 A3:1 A2:1 A2:1 A2:1 A3:1 A2:1 F2:1 F2:1 F3:1 F2:1 F2:1 F2:1 F3:1 F2:1 F2:1 F2:1 F3:1 F2:1 F2:1 F2:1 F3:1 F2:1 G2:1 G2:1 G3:1 G2:1 G2:1 G2:1 G3:1 G2:1 G2:1 G2:1 G3:1 G2:1 G2:1 G2:1 G3:1 G2:1 E2:1 E2:1 E3:1 E2:1 E2:1 E2:1 E3:1 E2:1 E2:1 E2:1 E3:1 E2:1 E2:1 E2:1 E3:1 E2:1' },
      drums: { wave: 'noise', vol: 0.2, level: 0, notes: 'k:2 h:1 h:1 s:2 h:1 h:1 k:1 k:1 h:2 s:2 h:2' },
      lead: { wave: 'square', vol: 0.05, level: 1, notes: 'A4:2 C5:2 E5:4 D5:2 C5:2 B4:4 C5:2 A4:2 F4:4 G4:4 A4:4 B4:2 D5:2 G5:4 F5:2 E5:2 D5:4 E5:4 B4:4 G#4:4 E4:4' },
      pad: { wave: 'sawtooth', vol: 0.028, level: 1, notes: 'A3+C4+E4:16 F3+A3+C4:16 G3+B3+D4:16 E3+G#3+B3:16' },
      arp: { wave: 'square', vol: 0.025, level: 2, notes: 'A5:1 E5:1 C5:1 E5:1 A5:1 E5:1 C5:1 E5:1 A5:1 E5:1 C5:1 E5:1 A5:1 E5:1 C5:1 E5:1 F5:1 C5:1 A4:1 C5:1 F5:1 C5:1 A4:1 C5:1 F5:1 C5:1 A4:1 C5:1 F5:1 C5:1 A4:1 C5:1 G5:1 D5:1 B4:1 D5:1 G5:1 D5:1 B4:1 D5:1 G5:1 D5:1 B4:1 D5:1 G5:1 D5:1 B4:1 D5:1 G#5:1 E5:1 B4:1 E5:1 G#5:1 E5:1 B4:1 E5:1 G#5:1 E5:1 B4:1 E5:1 G#5:1 E5:1 B4:1 E5:1' },
    },
  },
  // 1f: ancient Earth. Original.
  'erde-tyrene': {
    bpm: 100,
    layers: {
      bass: { wave: 'triangle', vol: 0.13, level: 0, notes: 'D2:4 A2:4 D3:4 A2:4 G2:4 D3:4 G3:4 D3:4 B1:4 F#2:4 B2:4 F#2:4 A1:4 E2:4 A2:4 E2:4' },
      flute: { wave: 'triangle', vol: 0.08, level: 0, vibrato: 5, notes: 'F#5:4 E5:2 D5:2 E5:4 A4:4 B4:4 D5:2 E5:2 F#5:8 E5:4 D5:2 B4:2 A4:4 B4:4 D5:6 E5:2 D5:8' },
      shaker: { wave: 'noise', vol: 0.12, level: 0, notes: 'k:4 h:2 h:2 s:4 h:2 h:2' },
      pad: { wave: 'sine', vol: 0.07, level: 1, notes: 'D4+F#4+A4:16 G4+B4+D5:16 B3+D4+F#4:16 A3+C#4+E4:16' },
      arp: { wave: 'square', vol: 0.022, level: 2, notes: 'D5:1 F#5:1 A5:1 F#5:1 D5:1 F#5:1 A5:1 F#5:1 D5:1 F#5:1 A5:1 F#5:1 D5:1 F#5:1 A5:1 F#5:1 G5:1 B5:1 D5:1 B5:1 G5:1 B5:1 D5:1 B5:1 G5:1 B5:1 D5:1 B5:1 G5:1 B5:1 D5:1 B5:1 B4:1 D5:1 F#5:1 D5:1 B4:1 D5:1 F#5:1 D5:1 B4:1 D5:1 F#5:1 D5:1 B4:1 D5:1 F#5:1 D5:1 A4:1 C#5:1 E5:1 C#5:1 A4:1 C#5:1 E5:1 C#5:1 A4:1 C#5:1 E5:1 C#5:1 A4:1 C#5:1 E5:1 C#5:1' },
    },
  },
  // 2a, 2f: alarms aboard a starship. Original.
  'autumn-alarm': {
    bpm: 132,
    layers: {
      bass: { wave: 'square', vol: 0.06, level: 0, notes: 'C2:2 C2:2 C3:2 C2:2 C2:2 C2:2 C3:2 C2:2 C2:2 C2:2 C3:2 C2:2 C2:2 C2:2 C3:2 C2:2 A#1:2 A#1:2 A#2:2 A#1:2 A#1:2 A#1:2 A#2:2 A#1:2 A#1:2 A#1:2 A#2:2 A#1:2 A#1:2 A#1:2 A#2:2 A#1:2' },
      alarm: { wave: 'square', vol: 0.03, level: 0, notes: 'G5:4 C5:4 -:24 G5:4 C5:4 -:24' },
      drums: { wave: 'noise', vol: 0.2, level: 1, notes: 'k:2 h:2 s:2 h:2 k:2 k:2 s:2 h:2' },
      lead: { wave: 'triangle', vol: 0.1, level: 1, notes: 'C5:4 D#5:4 G5:6 F5:2 D#5:4 D5:4 C5:8 A#4:4 C5:4 D5:4 F5:4 D#5:8 D5:8' },
      arp: { wave: 'square', vol: 0.025, level: 2, notes: 'C5:1 D#5:1 G5:1 D#5:1 C5:1 D#5:1 G5:1 D#5:1 C5:1 D#5:1 G5:1 D#5:1 C5:1 D#5:1 G5:1 D#5:1 A#4:1 D5:1 F5:1 D5:1 A#4:1 D5:1 F5:1 D5:1 A#4:1 D5:1 F5:1 D5:1 A#4:1 D5:1 F5:1 D5:1' },
    },
  },
  // 2b, 2c: adventure on the ring. Original.
  'ring-world': {
    bpm: 108,
    layers: {
      bass: { wave: 'triangle', vol: 0.13, level: 0, notes: 'E2:4 B2:4 E3:4 B2:4 C2:4 G2:4 C3:4 G2:4 G2:4 D3:4 G3:4 D3:4 D2:4 A2:4 D3:4 A2:4' },
      pad: { wave: 'sine', vol: 0.08, level: 0, notes: 'E4+G4+B4:16 C4+E4+G4:16 G3+B3+D4:16 D4+F#4+A4:16' },
      drums: { wave: 'noise', vol: 0.18, level: 1, notes: 'k:4 h:2 h:2 s:4 h:2 k:2' },
      lead: { wave: 'triangle', vol: 0.1, level: 1, notes: 'B4:6 A4:2 G4:4 E4:4 G4:6 A4:2 B4:8 D5:6 C5:2 B4:4 G4:4 A4:8 F#4:8' },
      arp: { wave: 'square', vol: 0.025, level: 2, notes: 'E5:1 G5:1 B5:1 G5:1 E5:1 G5:1 B5:1 G5:1 E5:1 G5:1 B5:1 G5:1 E5:1 G5:1 B5:1 G5:1 C5:1 E5:1 G5:1 E5:1 C5:1 E5:1 G5:1 E5:1 C5:1 E5:1 G5:1 E5:1 C5:1 E5:1 G5:1 E5:1 G4:1 B4:1 D5:1 B4:1 G4:1 B4:1 D5:1 B4:1 G4:1 B4:1 D5:1 B4:1 G4:1 B4:1 D5:1 B4:1 D5:1 F#5:1 A5:1 F#5:1 D5:1 F#5:1 A5:1 F#5:1 D5:1 F#5:1 A5:1 F#5:1 D5:1 F#5:1 A5:1 F#5:1' },
    },
  },
  // 2e: the Covenant hunt. Original, a low chant-like line over drums.
  'covenant-hunt': {
    bpm: 96,
    layers: {
      drone: { wave: 'sawtooth', vol: 0.03, level: 0, notes: 'D2+A2:32 C2+G2:32' },
      chant: { wave: 'sine', vol: 0.1, level: 0, vibrato: 4, notes: 'D4:8 F4:8 E4:8 D4:8 C4:8 E4:8 D4:16' },
      drums: { wave: 'noise', vol: 0.22, level: 1, notes: 'k:4 -:2 k:2 s:4 k:2 h:2' },
      lead: { wave: 'square', vol: 0.05, level: 1, notes: 'A4:4 C5:4 D5:8 F5:4 E5:4 D5:8 C5:4 A4:4 G4:8 A4:16' },
      arp: { wave: 'square', vol: 0.025, level: 2, notes: 'D5:1 A4:1 F4:1 A4:1 D5:1 A4:1 F4:1 A4:1 D5:1 A4:1 F4:1 A4:1 D5:1 A4:1 F4:1 A4:1 C5:1 G4:1 E4:1 G4:1 C5:1 G4:1 E4:1 G4:1 C5:1 G4:1 E4:1 G4:1 C5:1 G4:1 E4:1 G4:1' },
    },
  },
};
