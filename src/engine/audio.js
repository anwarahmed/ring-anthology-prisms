// Chiptune synth, sound effects and music sequencer on the Web Audio API.
// Music swells by intensity: 0 calm, 1 combat, 2 boss (see src/content/music.js).
// Home soundtrack (home play only, never published; docs/LEGAL.md): if a manifest maps
// the current level, era or built-in track to music the user owns, that plays instead.
// The manifest comes from the private soundtrack repo cloned into
// public/home-soundtrack/private/ (`npm run soundtrack`), or a hand-made
// public/home-soundtrack/manifest.json.

import { TRACKS } from '../content/music.js';

const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

export function noteFreq(n) {
  const m = /^([A-G]#?)(-?\d)$/.exec(n);
  if (!m) return null;
  const semis = NOTE[m[1]] + (Number(m[2]) + 1) * 12;
  return 440 * Math.pow(2, (semis - 69) / 12);
}

export function parseNotes(str) {
  return str.trim().split(/\s+/).map((tok) => {
    const [n, len] = tok.split(':');
    return { notes: n === '-' ? [] : n.split('+'), len: Number(len) || 1 };
  });
}

class Audio {
  constructor() {
    this.ctx = null;
    this.track = null;
    this.intensity = 0;
    this.home = undefined; // undefined = not checked yet, null = none
    this.homeEl = null;
    this.muted = false;
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.8;
      const comp = this.ctx.createDynamicsCompressor();
      this.master.connect(comp).connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.9;
      this.musicBus.connect(this.master);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.connect(this.master);
      this.noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    // A home track blocked by the browser's autoplay rule starts on the first input.
    if (this.homeEl?.paused) this.homeEl.play().catch(() => {});
  }

  tone({ wave = 'square', freq = 440, to = null, dur = 0.1, vol = 0.1, at = 0, bus = null, vibrato = 0 }) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + at;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = wave;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
    if (vibrato) {
      const lfo = this.ctx.createOscillator();
      const lg = this.ctx.createGain();
      lfo.frequency.value = vibrato;
      lg.gain.value = freq * 0.01;
      lfo.connect(lg).connect(o.frequency);
      lfo.start(t);
      lfo.stop(t + dur + 0.05);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus ?? this.sfxBus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  noise({ dur = 0.1, vol = 0.2, freq = 1200, q = 1, type = 'bandpass', at = 0, bus = null, sweep = null }) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + at;
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(bus ?? this.sfxBus);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.02);
  }

  sfx(name) {
    if (!this.ctx || this.muted) return;
    const r = 1 + (Math.random() - 0.5) * 0.08;
    switch (name) {
      case 'rifle': this.noise({ dur: 0.07, vol: 0.25, freq: 2400 * r, q: 0.8 }); this.tone({ wave: 'square', freq: 220 * r, to: 80, dur: 0.06, vol: 0.05 }); break;
      case 'cannon': this.noise({ dur: 0.25, vol: 0.18, freq: 450, type: 'lowpass', sweep: 120 }); this.tone({ wave: 'triangle', freq: 160 * r, to: 60, dur: 0.22, vol: 0.07 }); break;
      case 'plasma': this.tone({ wave: 'sawtooth', freq: 900 * r, to: 300, dur: 0.12, vol: 0.06 }); break;
      case 'hardlight': this.tone({ wave: 'sine', freq: 1500 * r, to: 600, dur: 0.18, vol: 0.08 }); this.tone({ wave: 'triangle', freq: 750 * r, to: 300, dur: 0.2, vol: 0.05 }); break;
      case 'beam': this.tone({ wave: 'square', freq: 1200 * r, to: 900, dur: 0.08, vol: 0.03 }); break;
      case 'hit': this.noise({ dur: 0.05, vol: 0.15, freq: 3000 }); break;
      case 'shieldHit': this.tone({ wave: 'sine', freq: 1800 * r, to: 1200, dur: 0.06, vol: 0.05 }); break;
      case 'shieldBreak': this.tone({ wave: 'square', freq: 1400, to: 200, dur: 0.25, vol: 0.08 }); this.noise({ dur: 0.2, vol: 0.2, freq: 5000, sweep: 800 }); break;
      case 'shieldLow': this.tone({ wave: 'square', freq: 880, dur: 0.08, vol: 0.05 }); this.tone({ wave: 'square', freq: 880, dur: 0.08, vol: 0.05, at: 0.14 }); break;
      case 'shieldCharge': this.tone({ wave: 'triangle', freq: 300, to: 1600, dur: 0.7, vol: 0.06 }); break;
      case 'jump': this.tone({ wave: 'square', freq: 260, to: 520, dur: 0.08, vol: 0.035 }); break;
      case 'dash': this.tone({ wave: 'sine', freq: 400, to: 2000, dur: 0.15, vol: 0.08 }); this.noise({ dur: 0.15, vol: 0.1, freq: 4000, sweep: 9000 }); break;
      case 'pound': this.noise({ dur: 0.4, vol: 0.5, freq: 400, type: 'lowpass', sweep: 60 }); break;
      case 'grapple': this.tone({ wave: 'square', freq: 2000, to: 400, dur: 0.12, vol: 0.05 }); break;
      case 'teleport': this.tone({ wave: 'sine', freq: 200, to: 2400, dur: 0.35, vol: 0.06 }); this.tone({ wave: 'sine', freq: 300, to: 3600, dur: 0.35, vol: 0.03, at: 0.05 }); break;
      case 'puff': this.tone({ wave: 'triangle', freq: 1200 * r, to: 2400, dur: 0.15, vol: 0.05 }); this.noise({ dur: 0.2, vol: 0.1, freq: 6000 }); break;
      case 'explode':
        // A rounded, low whump; blasts close together play as one instead of piling up.
        if (this.ctx.currentTime - (this.lastExplode ?? -1) < 0.12) break;
        this.lastExplode = this.ctx.currentTime;
        this.noise({ dur: 0.45, vol: 0.2, freq: 380, type: 'lowpass', sweep: 60 });
        this.tone({ wave: 'sine', freq: 72 * r, to: 34, dur: 0.42, vol: 0.18 });
        break;
      case 'grenadeThrow': this.tone({ wave: 'triangle', freq: 500, to: 300, dur: 0.1, vol: 0.04 }); break;
      case 'reload': this.tone({ wave: 'square', freq: 400, dur: 0.04, vol: 0.04 }); this.tone({ wave: 'square', freq: 600, dur: 0.04, vol: 0.04, at: 0.12 }); break;
      case 'ui': this.tone({ wave: 'square', freq: 660, dur: 0.06, vol: 0.05 }); this.tone({ wave: 'square', freq: 990, dur: 0.08, vol: 0.05, at: 0.06 }); break;
      case 'uiMove': this.tone({ wave: 'square', freq: 440, dur: 0.04, vol: 0.04 }); break;
      case 'boss': this.tone({ wave: 'sawtooth', freq: 55, dur: 1.6, vol: 0.2 }); this.tone({ wave: 'sawtooth', freq: 82.4, dur: 1.6, vol: 0.15 }); this.noise({ dur: 1.5, vol: 0.3, freq: 200, type: 'lowpass' }); break;
      case 'down': this.tone({ wave: 'square', freq: 440, to: 110, dur: 0.6, vol: 0.08 }); break;
      case 'checkpoint': [523, 659, 784].forEach((f, i) => this.tone({ wave: 'square', freq: f, dur: 0.12, vol: 0.05, at: i * 0.08 })); break;
      default: break;
    }
  }

  // --- Music -----------------------------------------------------------------

  async loadHome() {
    if (this.home !== undefined) return this.home;
    this.home = null;
    for (const base of ['home-soundtrack/private/', 'home-soundtrack/']) {
      try {
        const res = await fetch(`${base}manifest.json`, { cache: 'no-store' });
        if (res.ok && (res.headers.get('content-type') ?? '').includes('json')) {
          this.home = { ...(await res.json()), base };
          break;
        }
      } catch {
        // No home soundtrack: the built-in music plays.
      }
    }
    return this.home;
  }

  // ctx: { level, era } used to pick a home file. A manifest entry is a file name, or
  // { calm, combat, boss } files that follow the music's intensity like the built-in
  // tracks do. Looked up by level, then era, then the built-in track's id.
  async playMusic(trackId, intensity = 0, ctx = {}) {
    this.unlock();
    if (!this.ctx) return;
    const home = await this.loadHome();
    const entry = home && (home.levels?.[ctx.level] ?? home.eras?.[ctx.era] ?? home.tracks?.[trackId]);
    if (entry) {
      this.homeEntry = entry;
      this.intensity = intensity;
      return this.playHome(this.homeFile(entry, intensity));
    }
    this.homeEntry = null;
    this.stopHome();
    if (this.track?.id === trackId) return this.setIntensity(intensity);
    this.stopMusic();
    const def = TRACKS[trackId];
    if (!def) return;
    const stepDur = 60 / def.bpm / 4;
    const layers = Object.entries(def.layers).map(([name, l]) => {
      const gain = this.ctx.createGain();
      gain.gain.value = l.level <= intensity ? 1 : 0;
      gain.connect(this.musicBus);
      return { name, ...l, seq: parseNotes(l.notes), gain, i: 0, next: this.ctx.currentTime + 0.1 };
    });
    this.track = { id: trackId, stepDur, layers };
    this.intensity = intensity;
    this.timer = setInterval(() => this.schedule(), 25);
  }

  schedule() {
    const tr = this.track;
    if (!tr) return;
    const horizon = this.ctx.currentTime + 0.15;
    for (const l of tr.layers) {
      while (l.next < horizon) {
        const ev = l.seq[l.i];
        const dur = ev.len * tr.stepDur;
        const at = l.next - this.ctx.currentTime;
        if (l.wave === 'noise') {
          for (const n of ev.notes) {
            if (n === 'k') { this.tone({ wave: 'sine', freq: 150, to: 40, dur: 0.18, vol: l.vol * 1.6, at, bus: l.gain }); }
            if (n === 's') this.noise({ dur: 0.12, vol: l.vol, freq: 1800, q: 0.7, at, bus: l.gain });
            if (n === 'h') this.noise({ dur: 0.03, vol: l.vol * 0.4, freq: 8000, type: 'highpass', at, bus: l.gain });
          }
        } else {
          for (const n of ev.notes) {
            const f = noteFreq(n);
            if (f) this.tone({ wave: l.wave, freq: f, dur: dur * 0.95, vol: l.vol, at, bus: l.gain, vibrato: l.vibrato ?? 0 });
          }
        }
        l.next += dur;
        l.i = (l.i + 1) % l.seq.length;
      }
    }
  }

  setIntensity(level) {
    this.intensity = level;
    if (this.homeEntry) return this.playHome(this.homeFile(this.homeEntry, level));
    if (!this.track) return;
    const t = this.ctx.currentTime;
    for (const l of this.track.layers) {
      l.gain.gain.cancelScheduledValues(t);
      l.gain.gain.setTargetAtTime(l.level <= level ? 1 : 0, t, 0.6);
    }
  }

  stopMusic() {
    clearInterval(this.timer);
    if (this.track) for (const l of this.track.layers) l.gain.disconnect();
    this.track = null;
  }

  homeFile(entry, intensity) {
    if (typeof entry === 'string') return entry;
    const order = [entry.calm, entry.combat, entry.boss];
    for (let i = Math.min(2, intensity); i >= 0; i--) if (order[i]) return order[i];
    return entry.combat ?? entry.boss;
  }

  // Plays a home file on loop, fading out whatever played before.
  playHome(file) {
    if (!file || this.homeEl?.dataset.file === file) return;
    this.stopMusic();
    this.stopHome();
    const el = new window.Audio(`${this.home.base}${file}`);
    el.dataset.file = file;
    el.loop = true;
    el.volume = 0;
    el.play().catch(() => {});
    this.homeEl = el;
    const fade = setInterval(() => {
      el.volume = Math.min(0.6, el.volume + 0.05);
      if (el.volume >= 0.6 || this.homeEl !== el) clearInterval(fade);
    }, 50);
  }

  stopHome() {
    const el = this.homeEl;
    if (!el) return;
    this.homeEl = null;
    const fade = setInterval(() => {
      el.volume = Math.max(0, el.volume - 0.05);
      if (el.volume <= 0) { clearInterval(fade); el.pause(); }
    }, 40);
  }
}

export const audio = new Audio();
