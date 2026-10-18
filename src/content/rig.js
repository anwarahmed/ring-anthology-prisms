// Shared rig helpers: animation frame lists, the walk/idle/jump poses, and 2D vector
// helpers. Used by every body file (bodies.js, bodies-covenant.js, vehicles.js).

export const FRAMES = { idle: [0, 1, 2, 3], run: [4, 5, 6, 7, 8, 9, 10, 11], jump: [12], fall: [13], crouch: [14] };
export const HOVER = { idle: [0, 1, 2, 3] };

// Leg angles (radians from straight down; + is forward) and knee bend per frame.
export function pose(f) {
  if (f < 4) {
    const b = [0, 0.35, 0.7, 0.35][f];
    return { lean: 0.04, breathe: b, front: [0.14, 0.12], back: [-0.12, 0.16] };
  }
  if (f < 12) {
    const ph = ((f - 4) / 8) * Math.PI * 2;
    const leg = (p) => [0.78 * Math.sin(p), 0.22 + 1.05 * Math.max(0, Math.cos(p))];
    return { lean: 0.16, breathe: 0, front: leg(ph), back: leg(ph + Math.PI) };
  }
  if (f === 12) return { lean: 0.1, breathe: 0, front: [0.75, 1.3], back: [-0.25, 0.95], air: true };
  if (f === 13) return { lean: 0.02, breathe: 0, front: [0.3, 0.45], back: [-0.3, 0.7], air: true };
  return { lean: 0.22, breathe: 0, front: [1.35, 2.25], back: [0.45, 2.4], crouch: true };
}

export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const dirDown = (ang, len) => [Math.sin(ang) * len, Math.cos(ang) * len];
