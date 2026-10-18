// Visual themes: tile colors and parallax backdrop layers for a place.
// Backdrop layer types (drawn by src/engine/backdrop.js):
//   gradient {top, bottom}           stars {count}
//   planet {x, y, r, color, shade}   halo {x, y, rx, ry, color, tilt}  (only where canon puts a ring)
//   ships {count, color, scroll, beams}   spires {color, glow, scroll, height, density}
//   smoke {color, alpha, scroll, y, height}   embers {color}   haze {color, alpha}
// x/y in backdrop layers are fractions of the screen.

export const THEMES = {
  'charum-hakkor': {
    tiles: { solid: '#5c3f2c', top: '#d29a38', edge: '#ffe38a', platform: '#9a6230', hazard: '#ff5a1f', back: '#3c2a2c', window: '#ffc23a' },
    backdrop: [
      { type: 'gradient', top: '#120838', bottom: '#f0584e' },
      { type: 'stars', count: 120 },
      { type: 'planet', x: 0.78, y: 0.24, r: 40, color: '#e8885c', shade: '#b8584a' },
      { type: 'ships', count: 5, color: '#7a88a8', scroll: 0.05, beams: '#45e6ff' },
      { type: 'spires', color: '#5a2458', glow: '#ffb347', scroll: 0.15, height: 0.62, density: 0.6 },
      { type: 'smoke', color: '#8a3a5a', alpha: 0.5, scroll: 0.2, y: 0.42, height: 0.4 },
      { type: 'haze', color: '#ff6a3d', alpha: 0.12 },
      { type: 'spires', color: '#341238', glow: '#ffc23a', scroll: 0.4, height: 0.45, density: 0.4 },
      { type: 'smoke', color: '#4a1c3a', alpha: 0.65, scroll: 0.55, y: 0.66, height: 0.35 },
      { type: 'embers', color: '#ffc23a' },
    ],
  },
};
