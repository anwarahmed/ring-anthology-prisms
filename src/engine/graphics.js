// Graphics settings: art style, CRT emulation and the FPS counter, saved in this browser.
// The CRT shader (src/engine/crt.js) reads these values every frame, so changes show
// immediately; the art style needs a reload (art is generated when the game starts).

// config.js reads the saved style from the same key.
const KEY = 'ring-anthology-prisms.graphics';

export const CRT_PRESETS = {
  off: { scanlines: 0, mask: 0, maskType: 'aperture', bloom: 0, soften: 0, curvature: 0, vignette: 0, convergence: 0, persistence: 0, noise: 0 },
  subtle: { scanlines: 0.25, mask: 0.15, maskType: 'aperture', bloom: 0.2, soften: 0.2, curvature: 0.15, vignette: 0.25, convergence: 0.1, persistence: 0, noise: 0.02 },
  arcade: { scanlines: 0.5, mask: 0.3, maskType: 'slot', bloom: 0.45, soften: 0.3, curvature: 0.35, vignette: 0.4, convergence: 0.2, persistence: 0.2, noise: 0.03 },
  tv: { scanlines: 0.4, mask: 0.4, maskType: 'shadow', bloom: 0.6, soften: 0.55, curvature: 0.5, vignette: 0.55, convergence: 0.45, persistence: 0.35, noise: 0.08 },
};

export const PRESET_NAMES = { off: 'Off', subtle: 'Subtle', arcade: 'Arcade', tv: 'Consumer TV', custom: 'Custom' };

const DEFAULTS = { style: 'prerendered', preset: 'off', ...CRT_PRESETS.off, fps: false };

function load() {
  try {
    return { ...DEFAULTS, ...(JSON.parse(window.localStorage.getItem(KEY)) ?? {}) };
  } catch {
    return { ...DEFAULTS };
  }
}

export const graphics = {
  ...load(),
  save() {
    const { save, setPreset, ...data } = this;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // Storage unavailable: settings last for this session only.
    }
  },
  setPreset(name) {
    this.preset = name;
    if (CRT_PRESETS[name]) Object.assign(this, CRT_PRESETS[name]);
    this.save();
  },
};
