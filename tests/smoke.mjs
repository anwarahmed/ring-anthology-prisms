// Smoke test: boots the game in headless Chromium, plays a level with the autopilot
// bot, and fails on any page error. Screenshots go to --shots (default: test-results/).
//
//   node tests/smoke.mjs                       title screen + every built level, 20 s each
//   node tests/smoke.mjs --level 1a --finish   play 1a with the bot until it ends
//   options: --seconds N  --shots DIR  --difficulty easy  --solo

import { createServer } from 'vite';
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? dflt : args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
};
const shots = opt('shots', 'test-results');
const seconds = Number(opt('seconds', 20));
const finish = !!opt('finish', false);
const difficulty = opt('difficulty', 'normal');
const levels = opt('level', null) ? [opt('level')] : readdirSync('levels', { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && existsSync(join('levels', d.name, 'level.js'))).map((d) => d.name);
mkdirSync(shots, { recursive: true });

const server = await createServer({ server: { port: 0 }, logLevel: 'error' });
await server.listen();
const base = server.resolvedUrls.local[0];
const executablePath = process.env.CHROMIUM_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--autoplay-policy=no-user-gesture-required', '--use-gl=angle', '--use-angle=swiftshader'] });
let failed = false;

async function run(name, url, check) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
  // Hide real controllers plugged into this machine; tests use their own fake ones.
  await page.addInitScript(() => { navigator.getGamepads = () => []; });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text()); });
  // A missing home-soundtrack manifest is normal; any other missing file is a failure.
  page.on('response', (r) => {
    if (r.status() >= 400 && !/home-soundtrack\/|favicon/.test(r.url())) errors.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(base + url);
  try {
    await check(page);
  } catch (e) {
    errors.push(e.message);
  }
  await page.screenshot({ path: join(shots, `${name}.png`) });
  if (errors.length) {
    failed = true;
    console.error(`FAIL ${name}\n  ${[...new Set(errors)].join('\n  ')}`);
  } else {
    console.log(`ok   ${name}`);
  }
  await page.close();
}

const active = (page, key) => page.evaluate((k) => window.__game?.scene.isActive(k), key);

await run('title', '', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Title'), null, { timeout: 15000 });
  await page.waitForTimeout(1500);
});

// The way the kids start: title → join → timeline → Archive cards → first level.
await run('menus', '', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Title'), null, { timeout: 15000 });
  const press = async (key, scene) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(120);
    await page.keyboard.up(key);
    await page.waitForTimeout(500);
    if (scene) await page.waitForFunction((k) => window.__game.scene.isActive(k), scene, { timeout: 12000 });
  };
  await press('f', 'Players');
  await page.waitForTimeout(400);
  await press('g', 'Timeline');
  await press('Escape', 'Archive'); // Start (keys 1) plays from the level select
  await page.screenshot({ path: join(shots, 'archive.png') });
  for (let i = 0; i < 12 && !(await active(page, 'Level')); i++) await press('g');
  if (!(await active(page, 'Level'))) throw new Error('menus did not reach the first level');
});

// Controls: open from the title menu, rebind kb1 JUMP to J, check it is saved and works.
await run('controls', '', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Title'), null, { timeout: 15000 });
  const tap = async (key, wait = 300) => { await page.keyboard.down(key); await page.waitForTimeout(100); await page.keyboard.up(key); await page.waitForTimeout(wait); };
  await tap('s');
  await tap('f');
  await page.waitForFunction(() => window.__game.scene.isActive('Controls'), null, { timeout: 5000 });
  for (let i = 0; i < 5; i++) await tap('ArrowDown', 150); // device row → UP, DOWN, LEFT, RIGHT, JUMP
  await tap('Enter', 400);
  await tap('j', 500);
  await page.screenshot({ path: join(shots, 'controls.png') });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ring-anthology-prisms.controls') ?? '{}'));
  if (saved.kb1?.jump?.[0] !== 74) throw new Error(`jump not rebound to J: ${JSON.stringify(saved)}`);
  await page.evaluate(() => localStorage.removeItem('ring-anthology-prisms.controls'));
});

// A controller the browser doesn't recognize (like the 8BitDo M30, "6B controller"):
// any button confirms, and joining runs the one-time guided button setup.
await run('unknown-pad', '', async (page) => {
  await page.evaluate(() => {
    const pad = { id: '6B controller', index: 0, mapping: '', connected: true, timestamp: 0,
      buttons: Array.from({ length: 14 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0] };
    window.__pad = pad;
    navigator.getGamepads = () => [pad, null, null, null];
    window.dispatchEvent(Object.assign(new Event('gamepadconnected'), { gamepad: pad }));
  });
  await page.waitForFunction(() => window.__game?.scene.isActive('Title'), null, { timeout: 15000 });
  const press = async (i, wait = 350) => {
    await page.evaluate((b) => { window.__pad.buttons[b] = { pressed: true, value: 1 }; window.__pad.timestamp = performance.now(); }, i);
    await page.waitForTimeout(150);
    await page.evaluate((b) => { window.__pad.buttons[b] = { pressed: false, value: 0 }; window.__pad.timestamp = performance.now(); }, i);
    await page.waitForTimeout(wait);
  };
  await press(11); // a non-standard Start
  await page.waitForFunction(() => window.__game.scene.isActive('Controls'), null, { timeout: 5000 });
  await page.waitForTimeout(900);
  for (let i = 0; i < 11; i++) await press(i, 650);
  await page.screenshot({ path: join(shots, 'wizard.png') });
  await page.waitForFunction(() => window.__game.scene.isActive('Players'), null, { timeout: 6000 });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ring-anthology-prisms.controls') ?? '{}')['pad:6B controller']);
  if (saved?.jump?.[0]?.b !== 4 || saved?.pause?.[0]?.b !== 10) throw new Error(`wizard bindings wrong: ${JSON.stringify(saved)}`);
  await page.waitForTimeout(500);
  await press(10); // the new Start
  await page.waitForFunction(() => window.__game.scene.isActive('Timeline'), null, { timeout: 5000 });
  await page.waitForTimeout(400);
  await press(4); // Jump no longer starts a level from the level select
  if (!(await active(page, 'Timeline'))) throw new Error('jump started a level from the level select');
  await press(10); // Start does
  await page.waitForFunction(() => window.__game.scene.isActive('Archive'), null, { timeout: 5000 });
  await page.evaluate(() => localStorage.removeItem('ring-anthology-prisms.controls'));
});

// Pause: a long press of Start pauses and the menu stays open; Start again resumes.
await run('pause', '?level=1a', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.keyboard.down('Escape');
  await page.waitForFunction(() => window.__game.scene.isActive('Pause'), null, { timeout: 5000 });
  await page.waitForTimeout(400);
  await page.keyboard.up('Escape');
  await page.waitForTimeout(800);
  if (!(await active(page, 'Pause'))) throw new Error('pause menu closed by the same Start press');
  await page.keyboard.down('Escape');
  await page.waitForTimeout(400);
  await page.keyboard.up('Escape');
  await page.waitForTimeout(800);
  if (await active(page, 'Pause')) throw new Error('Start did not resume');
  if (!(await page.evaluate(() => window.__game.scene.isActive('Level')))) throw new Error('level not running after resume');
});

// Weapon drops: an enemy's gun drops when it dies; walking over it adds it once.
await run('pickup', '?level=1a&god=1', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 15000 });
  await page.waitForTimeout(1500);
  const killNear = () => page.evaluate(() => {
    const L = window.__game.scene.getScene('Level');
    const p = L.players[0];
    const u = L.spawnUnit('warrior-servant', p.x + 4, p.y + p.meta.h / 2, { entrance: 'none' });
    u.hurt(9999, 'melee', p);
  });
  await killNear();
  await page.waitForTimeout(1500);
  const one = await page.evaluate(() => { const p = window.__game.scene.getScene('Level').players[0]; return { ids: p.weapons.map((w) => w.id), cur: p.current.id }; });
  if (!one.ids.includes('hardlight-lance') || one.cur !== 'hardlight-lance') throw new Error(`gun not picked up: ${JSON.stringify(one)}`);
  await killNear();
  await page.waitForTimeout(1500);
  const two = await page.evaluate(() => window.__game.scene.getScene('Level').players[0].weapons.filter((w) => w.id === 'hardlight-lance').length);
  if (two !== 1) throw new Error(`same gun carried ${two} times`);
});

// Allies hop over fire instead of walking into it (1a has a fire at columns 89-90).
await run('ally-fire', '?level=1a&god=1', async (page) => {
  await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const L = window.__game.scene.getScene('Level');
    // Quiet the level script so no waves or arenas interfere.
    L.runner.triggers.forEach((t) => { t.fired = true; });
    L.arena = null;
    const p = L.players[0];
    p.body.reset(97 * 16, 13 * 16 - p.meta.h / 2 - 1);
    L.focus = { x: 90 * 16, y: p.y };
    L.updateCamera(0, true);
    window.__ally = L.spawnUnit('ancient-human-defender', 82 * 16, 13 * 16, { ally: true, entrance: 'none' });
  });
  await page.waitForTimeout(6000);
  const r = await page.evaluate(() => ({ x: Math.round(window.__ally.x / 16), alive: window.__ally.alive, hp: window.__ally.health, shields: Math.round(window.__ally.shields) }));
  if (!r.alive || r.x < 91) throw new Error(`ally did not get past the fire unhurt: ${JSON.stringify(r)}`);
  if (r.hp < 80) throw new Error(`ally was burned: ${JSON.stringify(r)}`);
});

for (const id of levels) {
  const p2 = opt('solo', false) ? '' : '&p2=kb2';
  await run(`level-${id}`, `?level=${id}&bot=1&god=1${p2}&difficulty=${difficulty}`, async (page) => {
    await page.waitForFunction(() => window.__game?.scene.isActive('Level'), null, { timeout: 15000 });
    if (finish) {
      const deadline = Date.now() + 15 * 60 * 1000;
      let n = 0;
      while (Date.now() < deadline && !(await active(page, 'Results'))) {
        await page.waitForTimeout(10000);
        await page.screenshot({ path: join(shots, `level-${id}-${String(++n).padStart(2, '0')}.png`) });
      }
      if (!(await active(page, 'Results'))) throw new Error('level did not finish in 15 minutes');
      console.log(`     ${id} finished`);
    } else {
      await page.waitForTimeout(seconds * 1000);
      if (!(await active(page, 'Level'))) throw new Error('Level scene stopped unexpectedly');
    }
  });
}

await browser.close();
await server.close();
process.exit(failed ? 1 : 0);
