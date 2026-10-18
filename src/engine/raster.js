// A tiny 16-bit-style sprite renderer. Sprites are built from shapes (capsules,
// ellipses, polygons); each pixel takes a surface normal from its shape and is shaded
// with one light from the upper left into a 5-tone ramp, with light dithering between
// tones, dark outlines, separation lines between overlapping parts, and specular glints.
// Pure: returns RGBA pixels, so it runs in Node too.
//
// Shapes:
//   { t: 'cap', a: [x, y], b: [x, y], r1, r2, m, z }   limb or tube (radius r1 → r2)
//   { t: 'ell', c: [x, y], rx, ry, rot, m, z }          ellipse
//   { t: 'poly', pts: [[x, y], ...], m, z, bevel }      armor plate (flat face, rounded edges)
// m names a material: { ramp, emissive, spec, flat }. Higher z draws in front.

const L = (() => { const v = [-0.5, -0.72, 0.6]; const l = Math.hypot(...v); return v.map((c) => c / l); })();
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16);

export function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

function rgbHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslRgb([h, s, l]) {
  h = ((h % 360) + 360) % 360 / 360;
  if (!s) return [l, l, l].map((v) => Math.round(v * 255));
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255));
}

// Hue-shifted ramp in the classic pixel-art way: shadows lean cool, highlights warm.
// [outline, shadow, base, light, highlight]
export function ramp(hex, contrast = 1) {
  const [h, s, l] = rgbHsl(hexRgb(hex));
  const toward = (target, amt) => { let d = ((target - h + 540) % 360) - 180; return h + d * amt; };
  // Vivid SNES-style ramp: saturated mid-tones, shadows that shift strongly toward
  // purple, highlights that warm toward yellow.
  const sat = Math.min(1, s * 1.18 + 0.04);
  return [
    hslRgb([toward(265, 0.35), Math.min(1, sat * 0.9 + 0.15), l * 0.2]),
    hslRgb([toward(255, 0.2 * contrast), Math.min(1, sat * 1.1), l * (1 - 0.38 * contrast)]),
    hslRgb([h, sat, l]),
    hslRgb([toward(50, 0.1 * contrast), Math.min(1, sat * 1.05), l + (1 - l) * 0.3 * contrast]),
    hslRgb([toward(50, 0.18 * contrast), sat * 0.75, l + (1 - l) * 0.62 * contrast]),
  ];
}

export function material(hex, opts = {}) {
  return { ramp: ramp(hex, opts.contrast ?? 1), emissive: !!opts.emissive, spec: !!opts.spec, color: hexRgb(hex) };
}

function cover(sh, x, y) {
  if (sh.t === 'cap') {
    const [ax, ay] = sh.a, [bx, by] = sh.b;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy || 1e-6;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
    const cx = ax + dx * t, cy = ay + dy * t;
    const r = sh.r1 + (sh.r2 - sh.r1) * t;
    const ox = x - cx, oy = y - cy;
    const d = Math.hypot(ox, oy);
    if (d > r) return null;
    const k = d / r;
    return [ox / r, oy / r, Math.sqrt(Math.max(0, 1 - k * k))];
  }
  if (sh.t === 'ell') {
    const c = Math.cos(-(sh.rot ?? 0)), s = Math.sin(-(sh.rot ?? 0));
    const px = x - sh.c[0], py = y - sh.c[1];
    const lx = (px * c - py * s) / sh.rx, ly = (px * s + py * c) / sh.ry;
    const q = lx * lx + ly * ly;
    if (q > 1) return null;
    const cb = Math.cos(sh.rot ?? 0), sb = Math.sin(sh.rot ?? 0);
    return [lx * cb - ly * sb, lx * sb + ly * cb, Math.sqrt(1 - q)];
  }
  // poly
  const pts = sh.pts;
  let inside = false;
  let best = Infinity, nx = 0, ny = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    const ex = xi - xj, ey = yi - yj;
    const len2 = ex * ex + ey * ey || 1e-6;
    const t = Math.max(0, Math.min(1, ((x - xj) * ex + (y - yj) * ey) / len2));
    const qx = x - (xj + ex * t), qy = y - (yj + ey * t);
    const d = Math.hypot(qx, qy);
    if (d < best) { best = d; nx = -qx / (d || 1); ny = -qy / (d || 1); }
  }
  if (!inside) return null;
  const bevel = sh.bevel ?? 1.6;
  const tilt = sh.tilt ?? [0, 0];
  if (best < bevel) {
    const k = 1 - best / bevel;
    const n = [nx * k * 0.85 + tilt[0], ny * k * 0.85 + tilt[1], 1 - k * 0.5];
    const l = Math.hypot(...n);
    return n.map((v) => v / l);
  }
  const n = [tilt[0], tilt[1], 1];
  const l = Math.hypot(...n);
  return n.map((v) => v / l);
}

function bbox(sh) {
  if (sh.t === 'cap') {
    const r = Math.max(sh.r1, sh.r2);
    return [Math.min(sh.a[0], sh.b[0]) - r, Math.min(sh.a[1], sh.b[1]) - r, Math.max(sh.a[0], sh.b[0]) + r, Math.max(sh.a[1], sh.b[1]) + r];
  }
  if (sh.t === 'ell') {
    const r = Math.max(sh.rx, sh.ry);
    return [sh.c[0] - r, sh.c[1] - r, sh.c[0] + r, sh.c[1] + r];
  }
  const xs = sh.pts.map((p) => p[0]), ys = sh.pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

// Renders shapes into a w×h RGBA buffer.
export function render(shapes, w, h, mats, { outline = true, light = L } = {}) {
  const order = shapes.map((s, i) => ({ s, i })).sort((a, b) => (a.s.z ?? 0) - (b.s.z ?? 0) || a.i - b.i).map((o) => o.s);
  const id = new Int16Array(w * h).fill(-1);
  const nrm = new Float32Array(w * h * 3);
  order.forEach((sh, k) => {
    const [x0, y0, x1, y1] = bbox(sh);
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(h - 1, Math.ceil(y1)); y++) {
      for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(w - 1, Math.ceil(x1)); x++) {
        const n = cover(sh, x + 0.5, y + 0.5);
        if (!n) continue;
        const p = y * w + x;
        id[p] = k;
        nrm[p * 3] = n[0]; nrm[p * 3 + 1] = n[1]; nrm[p * 3 + 2] = n[2];
      }
    }
  });
  const out = new Uint8ClampedArray(w * h * 4);
  const put = (p, c, a = 255) => { out[p * 4] = c[0]; out[p * 4 + 1] = c[1]; out[p * 4 + 2] = c[2]; out[p * 4 + 3] = a; };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const k = id[p];
      if (k < 0) continue;
      const sh = order[k];
      const m = mats[sh.m];
      if (!m) throw new Error(`unknown material '${sh.m}'`);
      if (m.emissive) { put(p, sh.hot ? m.ramp[4] : m.ramp[3]); continue; }
      const d = nrm[p * 3] * light[0] + nrm[p * 3 + 1] * light[1] + nrm[p * 3 + 2] * light[2];
      const s = Math.max(0, Math.min(1, d * 0.8 + 0.28));
      const v = 1 + s * 3.1;
      let tone = Math.floor(v + (BAYER[(y & 3) * 4 + (x & 3)] - 0.5) * 0.55);
      tone = Math.max(1, Math.min(m.spec ? 4 : 3, tone));
      // Separation line where a part in front overlaps this one.
      let behind = false;
      for (const q of [p - 1, p + 1, p - w, p + w]) {
        if (q >= 0 && q < w * h && id[q] > k && (order[id[q]].z ?? 0) > (sh.z ?? 0) && !order[id[q]].noSep) behind = true;
      }
      if (behind) tone = 1;
      put(p, m.ramp[tone]);
      if (m.spec && s > 0.93 && !behind) put(p, [255, 255, 255]);
    }
  }
  if (outline) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p = y * w + x;
        if (id[p] >= 0) continue;
        let nb = -1;
        if (x > 0 && id[p - 1] >= 0) nb = id[p - 1];
        else if (x < w - 1 && id[p + 1] >= 0) nb = id[p + 1];
        else if (y > 0 && id[p - w] >= 0) nb = id[p - w];
        else if (y < h - 1 && id[p + w] >= 0) nb = id[p + w];
        if (nb < 0) continue;
        const m = mats[order[nb].m];
        const c = m.ramp[0];
        put(p, m.emissive ? m.ramp[1] : [c[0] * 0.7, c[1] * 0.7, c[2] * 0.7]);
      }
    }
  }
  return out;
}
