// CRT emulation and the FPS counter. The CRT effect is a second WebGL canvas laid over
// the game: after Phaser draws each frame, the whole frame (every scene stacked: level,
// HUD, pause) is copied in and drawn through a CRT shader at the screen's real pixel
// size, so phosphor masks line up with the display's pixels. It never touches Phaser's
// own GL state. Effects read the live settings in src/engine/graphics.js:
//   scanlines (one per game pixel row), phosphor mask (aperture grille, slot mask or
//   shadow mask), bloom and halation, pixel softening, curvature, vignette, colour
//   convergence, phosphor persistence (afterglow trails) and noise.

import { graphics } from './graphics.js';
import { VIEW } from './config.js';

const vert = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// Pass 1: phosphor persistence. The new frame, or the fading previous one if brighter.
const persistFrag = `
precision mediump float;
uniform sampler2D uSrc, uPrev;
uniform float uPersist;
varying vec2 vUv;
void main() {
  vec3 src = texture2D(uSrc, vec2(vUv.x, 1.0 - vUv.y)).rgb;
  vec3 prev = texture2D(uPrev, vUv).rgb;
  gl_FragColor = vec4(max(src, prev * uPersist * 0.8), 1.0);
}
`;

// Pass 2: the CRT itself, at screen resolution.
const crtFrag = `
precision mediump float;
uniform sampler2D uSrc;
uniform vec2 uSrcRes, uOutRes;
uniform float uTime, uLines;
uniform float uScan, uMask, uMaskType, uBloom, uSoften, uCurve, uVig, uConv, uNoise;
varying vec2 vUv;

vec3 tap(vec2 uv) { return texture2D(uSrc, uv).rgb; }

void main() {
  vec2 c = vUv * 2.0 - 1.0;
  c *= 1.0 + uCurve * 0.1 * vec2(c.y * c.y, c.x * c.x);
  vec2 uv = c * 0.5 + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  vec2 px = 1.0 / uSrcRes;
  // Convergence: red and blue beams land slightly off the green.
  float cv = uConv * 2.0;
  vec3 col = vec3(tap(uv + vec2(px.x * cv, 0.0)).r, tap(uv).g, tap(uv - vec2(px.x * cv, 0.0)).b);
  // Softening: neighbouring pixels blend, like a composite video signal.
  vec3 soft = (tap(uv - vec2(px.x * 1.5, 0.0)) + tap(uv + vec2(px.x * 1.5, 0.0)) + col * 2.0) * 0.25;
  col = mix(col, soft, uSoften);
  // Bloom and halation: bright areas glow outward with a warm halo.
  if (uBloom > 0.0) {
    vec3 glow = vec3(0.0);
    for (int i = -2; i <= 2; i++) {
      for (int j = -2; j <= 2; j++) {
        glow += max(tap(uv + vec2(float(i), float(j)) * px * 3.5) - 0.5, 0.0);
      }
    }
    col += glow / 25.0 * uBloom * 2.5 * vec3(1.15, 1.0, 0.85);
  }
  // Scanlines: a dark gap between each game pixel row; bright rows bloom wider.
  float y = fract(uv.y * uLines);
  float beam = exp(-pow((y - 0.5) / (0.28 + 0.2 * dot(col, vec3(0.3, 0.5, 0.2))), 2.0));
  col *= mix(1.0, beam * 1.25, uScan);
  // Phosphor mask, in real screen pixels.
  vec2 sp = gl_FragCoord.xy;
  vec3 m;
  if (uMaskType < 0.5) {
    float k = mod(sp.x, 3.0);
    m = k < 1.0 ? vec3(1.0, 0.3, 0.3) : k < 2.0 ? vec3(0.3, 1.0, 0.3) : vec3(0.3, 0.3, 1.0);
  } else if (uMaskType < 1.5) {
    float k = mod(sp.x, 3.0);
    m = k < 1.0 ? vec3(1.0, 0.35, 0.35) : k < 2.0 ? vec3(0.35, 1.0, 0.35) : vec3(0.35, 0.35, 1.0);
    if (mod(sp.y + step(3.0, mod(sp.x, 6.0)) * 2.0, 4.0) < 1.0) m *= 0.4;
  } else {
    float k = mod(sp.x + mod(floor(sp.y), 2.0) * 1.5, 3.0);
    m = k < 1.0 ? vec3(1.0, 0.3, 0.3) : k < 2.0 ? vec3(0.3, 1.0, 0.3) : vec3(0.3, 0.3, 1.0);
  }
  col *= mix(vec3(1.0), m * 1.6, uMask);
  // Vignette and noise.
  vec2 d = uv - 0.5;
  col *= clamp(1.0 - uVig * dot(d, d) * 2.2, 0.0, 1.0);
  float n = fract(sin(dot(sp + uTime, vec2(12.9898, 78.233))) * 43758.5453);
  col += (n - 0.5) * uNoise * 0.3;
  gl_FragColor = vec4(col, 1.0);
}
`;

function program(gl, fs) {
  const p = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vert], [gl.FRAGMENT_SHADER, fs]]) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    gl.attachShader(p, s);
  }
  gl.bindAttribLocation(p, 0, 'aPos');
  gl.linkProgram(p);
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const name = gl.getActiveUniform(p, i).name;
    u[name] = gl.getUniformLocation(p, name);
  }
  return { p, u };
}

function texture(gl, filter) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

function anyEffect(g) {
  return ['scanlines', 'mask', 'bloom', 'soften', 'curvature', 'vignette', 'convergence', 'persistence', 'noise'].some((k) => g[k] > 0);
}

export function installCrt(game) {
  const src = game.canvas;
  const out = document.createElement('canvas');
  out.id = 'crt';
  Object.assign(out.style, { position: 'absolute', pointerEvents: 'none', display: 'none' });
  src.parentNode.appendChild(out);
  const fps = document.createElement('div');
  Object.assign(fps.style, { position: 'absolute', font: '14px monospace', color: '#9ff4ff', textShadow: '1px 1px 0 #000', pointerEvents: 'none', display: 'none', zIndex: 2 });
  src.parentNode.appendChild(fps);

  const gl = out.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) return;
  const persist = program(gl, persistFrag);
  const crt = program(gl, crtFrag);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const frame = texture(gl, gl.NEAREST);
  // Two persistence buffers, swapped every frame.
  const acc = [0, 1].map(() => {
    const t = texture(gl, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, src.width, src.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t, fb };
  });
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  let flip = 0;
  let fpsAt = 0;

  game.events.on('postrender', () => {
    const g = graphics;
    if (g.fps && game.loop.time - fpsAt > 500) {
      fpsAt = game.loop.time;
      fps.textContent = `${Math.round(game.loop.actualFps)} FPS`;
    }
    fps.style.display = g.fps ? 'block' : 'none';
    const r = src.getBoundingClientRect();
    const host = src.parentNode.getBoundingClientRect();
    fps.style.right = `${host.right - r.right + 8}px`;
    fps.style.bottom = `${host.bottom - r.bottom + 6}px`;
    const on = anyEffect(g);
    out.style.display = on ? 'block' : 'none';
    if (!on) return;

    // Match the game canvas on screen, at the display's real pixel size.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (out.width !== w || out.height !== h) {
      out.width = w;
      out.height = h;
    }
    Object.assign(out.style, { left: `${r.left - host.left}px`, top: `${r.top - host.top}px`, width: `${r.width}px`, height: `${r.height}px` });

    // The game canvas's drawing buffer is still valid inside this event.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, frame);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);

    const a = acc[flip], b = acc[1 - flip];
    flip = 1 - flip;
    gl.bindFramebuffer(gl.FRAMEBUFFER, a.fb);
    gl.viewport(0, 0, src.width, src.height);
    gl.useProgram(persist.p);
    gl.uniform1i(persist.u.uSrc, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, b.t);
    gl.uniform1i(persist.u.uPrev, 1);
    gl.uniform1f(persist.u.uPersist, g.persistence);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    gl.useProgram(crt.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, a.t);
    const U = crt.u;
    gl.uniform1i(U.uSrc, 0);
    gl.uniform2f(U.uSrcRes, src.width, src.height);
    gl.uniform2f(U.uOutRes, w, h);
    gl.uniform1f(U.uTime, (game.loop.time % 10000) / 1000);
    gl.uniform1f(U.uLines, VIEW.h);
    gl.uniform1f(U.uScan, g.scanlines);
    gl.uniform1f(U.uMask, g.mask);
    gl.uniform1f(U.uMaskType, { aperture: 0, slot: 1, shadow: 2 }[g.maskType] ?? 0);
    gl.uniform1f(U.uBloom, g.bloom);
    gl.uniform1f(U.uSoften, g.soften);
    gl.uniform1f(U.uCurve, g.curvature);
    gl.uniform1f(U.uVig, g.vignette);
    gl.uniform1f(U.uConv, g.convergence);
    gl.uniform1f(U.uNoise, g.noise);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  });
}
