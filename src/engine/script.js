// Runs a level's script: a list of triggers, each with a list of actions run in order.
//
//   script: [
//     { on: 'start', do: [ { objective: 'Hold the outer gate' } ] },
//     { on: 'A', do: [ { lock: ['A', 'B'] }, { wave: [{ unit: 'sentinel', n: 3, from: 'right' }] }, { unlock: true } ] },
//   ]
//
// Triggers: 'start', or a map marker letter (fires when any player reaches its column).
// Actions are documented in docs/ENGINE.md. Blocking actions (wave, hold, boss, wait,
// say) finish before the next action starts.

import { audio } from './audio.js';
import { TILE } from './config.js';

export class ScriptRunner {
  constructor(scene, level, map, startAt = 0) {
    this.scene = scene;
    this.level = level;
    this.map = map;
    this.triggers = (level.script ?? []).map((t, i) => ({ ...t, i, fired: i < startAt }));
    this.startAt = startAt;
  }

  start() {
    // On a checkpoint restart, replay only the scene-setting actions of skipped triggers.
    for (const t of this.triggers) {
      if (t.i < this.startAt) {
        for (const a of t.do) if (a.music || a.objective) this.run([a], t.i);
      }
    }
    for (const t of this.triggers) if (t.on === 'start' && !t.fired) this.fire(t);
  }

  update() {
    const xs = this.scene.players.filter((p) => p.alive).map((p) => p.x);
    if (!xs.length) return;
    const maxX = Math.max(...xs);
    for (const t of this.triggers) {
      if (t.fired || t.on === 'start') continue;
      const m = this.map.markers[t.on];
      if (m && maxX >= m.x * TILE) this.fire(t);
    }
  }

  fire(t) {
    t.fired = true;
    this.run(t.do, t.i);
  }

  async run(actions, index) {
    for (const a of actions) {
      if (!this.scene.sys.isActive()) return;
      await this.act(a, index);
    }
  }

  wait(ms) {
    return new Promise((res) => this.scene.time.delayedCall(ms, res));
  }

  until(fn) {
    return new Promise((res) => {
      const ev = this.scene.time.addEvent({ delay: 100, loop: true, callback: () => { if (fn()) { ev.remove(); res(); } } });
    });
  }

  async act(a, index) {
    const s = this.scene;
    if (a.say) return s.hud.say(a.say, a.who, a.source, a.time);
    if (a.objective) return s.hud.objective(a.objective);
    if (a.music) return audio.playMusic(a.music, a.intensity ?? 0, { level: this.level.id, era: this.level.era });
    if (a.intensity !== undefined) return audio.setIntensity(a.intensity);
    if (a.wait) return this.wait(a.wait * 1000);
    if (a.lock) return s.lockArena(this.map.markers[a.lock[0]].x, this.map.markers[a.lock[1]].x);
    if (a.unlock) return s.unlockArena();
    if (a.checkpoint) return s.checkpoint(index + 1);
    if (a.fx) return s.scriptFx(a.fx);
    if (a.spawn) return s.spawnGroup(a.spawn);
    if (a.allies) return s.spawnGroup(a.allies, true);
    if (a.wave) {
      const units = await s.spawnGroup(a.wave);
      return this.until(() => units.every((u) => !u.alive));
    }
    if (a.hold) return this.hold(a.hold);
    if (a.boss) {
      const boss = await s.spawnBoss(a.boss);
      return this.until(() => !boss.alive);
    }
    if (a.call) return this.level.hooks?.[a.call]?.(s.api());
    if (a.end) return s.endLevel(a.end);
    console.warn('Unknown script action', a);
  }

  // Defense: keep spawning groups for a number of seconds, then wait for the last ones.
  async hold({ seconds, every = 6, groups, label }) {
    const s = this.scene;
    const until = s.time.now + seconds * 1000;
    s.hud.timer(label ?? 'HOLD', seconds);
    const all = [];
    let i = 0;
    while (s.sys.isActive() && s.time.now < until) {
      const alive = all.filter((u) => u.alive).length;
      if (alive < 10) all.push(...(await s.spawnGroup(groups[i % groups.length])));
      i++;
      await this.wait(every * 1000);
    }
    s.hud.timer(null);
    await this.until(() => all.every((u) => !u.alive));
  }
}
