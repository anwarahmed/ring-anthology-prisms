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

// Hue-shifted 8-tone ramp in the style of late-era SNES art: deep shadows lean toward
// purple, highlights warm toward yellow, with small steps between tones.
// [outline, deepest shadow, shadow, mid-shadow, base, light, highlight, glint]
export function ramp(hex, contrast = 1) {
  const [h, s, l] = rgbHsl(hexRgb(hex));
  const toward = (target, amt) => { const d = ((target - h + 540) % 360) - 180; return h + d * amt; };
  const sat = Math.min(1, s * 1.15 + 0.04);
  const tone = (t) => {
    if (t <= 0.5) {
      const k = 0.5 - t;
      return hslRgb([toward(255, k * 0.5 * contrast), Math.min(1, sat * (1 + k * 0.3)), l * (1 - k * 1.05 * contrast)]);
    }
    const k = (t - 0.5) * 2;
    return hslRgb([toward(50, k * 0.16 * contrast), sat * (1 - k * 0.35), l + (1 - l) * Math.pow(k, 1.1) * 0.62 * contrast]);
  };
  return [
    hslRgb([toward(265, 0.35), Math.min(1, sat * 0.9 + 0.15), l * 0.18]),
    tone(0.02), tone(0.17), tone(0.33), tone(0.5), tone(0.67), tone(0.85),
    hslRgb([toward(55, 0.2), sat * 0.4, Math.min(0.97, l + (1 - l) * 0.85)]),
  ];
}

// opts: contrast, emissive (glows, unshaded), spec (glints), texture (0..1 surface grain).
export function material(hex, opts = {}) {
  return { ramp: ramp(hex, opts.contrast ?? 1), emissive: !!opts.emissive, spec: !!opts.spec, texture: opts.texture ?? 0, color: hexRgb(hex) };
}

function grain(x, y) {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (((n ^ (n >>> 16)) >>> 0) / 4294967296) - 0.5;
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
function scaleShape(sh, k) {
  const pt = ([x, y]) => [x * k, y * k];
  if (sh.t === 'cap') return { ...sh, a: pt(sh.a), b: pt(sh.b), r1: sh.r1 * k, r2: sh.r2 * k };
  if (sh.t === 'ell') return { ...sh, c: pt(sh.c), rx: sh.rx * k, ry: sh.ry * k };
  return { ...sh, pts: sh.pts.map(pt), bevel: (sh.bevel ?? 1.6) * k };
}

function sampleRamp(r, s) {
  const v = 1 + Math.max(0, Math.min(1, s)) * 5;
  const i = Math.min(5, Math.floor(v));
  const t = v - i;
  return [0, 1, 2].map((c) => r[i][c] + (r[i + 1][c] - r[i][c]) * t);
}

// Options: outline (cartoon outlines), light, scale (render at higher pixel density;
// w and h are already scaled), smooth (continuous shading, no outlines or dithering:
// the "realistic" look).
export function render(shapes, w, h, mats, { outline = true, light = L, scale = 1, smooth = false } = {}) {
  if (scale !== 1) shapes = shapes.map((sh) => scaleShape(sh, scale));
  if (smooth) return renderSmooth(shapes, w, h, mats, light, scale);
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
  // Soft ambient occlusion: how close (in pixels) a part drawn in front of this one is.
  const frontNear = (x, y, k, z) => {
    let best = 9;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const q = id[yy * w + xx];
        if (q > k && (order[q].z ?? 0) > z && !order[q].noSep) best = Math.min(best, Math.max(Math.abs(dx), Math.abs(dy)));
      }
    }
    return best;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const k = id[p];
      if (k < 0) continue;
      const sh = order[k];
      const m = mats[sh.m];
      if (!m) throw new Error(`unknown material '${sh.m}'`);
      if (m.emissive) { put(p, sh.hot ? m.ramp[6] : m.ramp[5]); continue; }
      const d = nrm[p * 3] * light[0] + nrm[p * 3 + 1] * light[1] + nrm[p * 3 + 2] * light[2];
      let s = Math.max(0, Math.min(1, d * 0.82 + 0.26 + grain(x, y) * m.texture * 0.35));
      let tone = Math.floor(1 + s * 5.6 + (BAYER[(y & 3) * 4 + (x & 3)] - 0.5) * 0.4);
      const near = frontNear(x, y, k, sh.z ?? 0);
      if (near <= 1) tone -= 2;
      else if (near === 2) tone -= 1;
      tone = Math.max(1, Math.min(6, tone));
      put(p, m.ramp[tone]);
      if (m.spec && s > 0.95 && near > 2) put(p, m.ramp[7]);
    }
  }
  if (outline) {
    // Selective outline: softer on the lit (upper-left) side, darkest in shadow.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p = y * w + x;
        if (id[p] >= 0) continue;
        let nb = -1, lit = false;
        if (x < w - 1 && id[p + 1] >= 0) { nb = id[p + 1]; lit = true; }
        else if (y < h - 1 && id[p + w] >= 0) { nb = id[p + w]; lit = true; }
        else if (x > 0 && id[p - 1] >= 0) nb = id[p - 1];
        else if (y > 0 && id[p - w] >= 0) nb = id[p - w];
        if (nb < 0) continue;
        const m = mats[order[nb].m];
        if (m.emissive) { put(p, m.ramp[2]); continue; }
        const c = lit ? m.ramp[1] : m.ramp[0];
        put(p, lit ? c : [c[0] * 0.75, c[1] * 0.75, c[2] * 0.75]);
      }
    }
  }
  return out;
}

// Realistic shading: continuous light, soft occlusion, broad specular highlights, fine
// surface grain, and a soft darkened rim on the shadow side instead of an outline.
function renderSmooth(shapes, w, h, mats, light, scale) {
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
  const R = Math.max(2, Math.round(2.5 * scale));
  // Distance (pixels, up to RIM) to the outside of the silhouette, for the rim light.
  const RIM = Math.max(2, Math.round(1.6 * scale));
  const outsideNear = (x, y) => {
    for (let r = 1; r <= RIM; r++) {
      for (const [dx, dy] of [[r, 0], [0, -r], [r, -r], [-r, 0], [0, r]]) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h || id[yy * w + xx] < 0) return { r, dx, dy };
      }
    }
    return null;
  };
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const k = id[p];
      if (k < 0) continue;
      const sh = order[k];
      const m = mats[sh.m];
      let c;
      if (m.emissive) {
        c = sh.hot ? m.ramp[6] : m.ramp[5];
      } else {
        const d = nrm[p * 3] * light[0] + nrm[p * 3 + 1] * light[1] + nrm[p * 3 + 2] * light[2];
        const s = Math.max(0, Math.min(1, d * 0.85 + 0.22 + grain(x, y) * (m.texture * 0.25 + 0.03)));
        c = sampleRamp(m.ramp, s);
        // Soft occlusion where a part in front overlaps this one.
        let near = 99;
        for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const q = id[yy * w + xx];
          if (q > k && (order[q].z ?? 0) > (sh.z ?? 0) && !order[q].noSep) near = Math.min(near, Math.hypot(dx, dy));
        }
        if (near < 99) { const a = (1 - near / (R + 1)) * 0.55; c = c.map((v, i) => v + (m.ramp[1][i] - v) * a); }
        // Two specular lobes: a tight glint and a broad sheen (painted metal).
        if (m.spec) { const g = Math.pow(Math.max(0, d), 18) * 0.85 + Math.pow(Math.max(0, d), 5) * 0.18; c = c.map((v, i) => v + (m.ramp[7][i] - v) * Math.min(1, g)); }
        else { const g = Math.pow(Math.max(0, d), 8) * 0.12; c = c.map((v, i) => v + (m.ramp[6][i] - v) * g); }
        // Rim light: a cool back light catching the silhouette on the side away from the
        // key light (right and top-right edges).
        const o = outsideNear(x, y);
        if (o && (o.dx > 0 || o.dy < 0) && !(o.dx < 0)) {
          const rim = (1 - (o.r - 1) / RIM) * (o.dx > 0 ? 0.42 : 0.22);
          c = c.map((v, i) => v + ([200, 228, 255][i] - v) * rim);
        }
        // A crisp edge all round, darkest on the shadow side.
        const edge = (xx, yy) => xx < 0 || yy < 0 || xx >= w || yy >= h || id[yy * w + xx] < 0;
        if (edge(x + 1, y) || edge(x, y + 1)) c = c.map((v, i) => v + (m.ramp[1][i] - v) * 0.55);
        else if (edge(x - 1, y) || edge(x, y - 1)) c = c.map((v, i) => v + (m.ramp[2][i] - v) * 0.3);
      }
      out[p * 4] = c[0]; out[p * 4 + 1] = c[1]; out[p * 4 + 2] = c[2]; out[p * 4 + 3] = 255;
    }
  }
  return out;
}
