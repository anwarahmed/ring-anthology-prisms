// Shared constants. Pure data: no Phaser imports, so Node scripts can use it too.

export const TILE = 16;
export const VIEW = { w: 480, h: 270 };
// Art renders at HD× the world resolution: the canvas is VIEW×HD and every camera is
// zoomed HD×, so world units, maps and physics stay the same.
export const HD = 2;
// Art style: 'prerendered' (smooth 3D-shaded art), 'hybrid' (pre-rendered characters,
// pixel-art world) or 'pixel' (outlined, dithered pixel art). Chosen on the SETTINGS
// screen (saved by src/engine/graphics.js); ?style= overrides it.
function savedStyle() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem('ring-anthology-prisms.graphics') ?? 'null')?.style;
  } catch {
    return undefined;
  }
}
export const STYLES = ['prerendered', 'hybrid', 'pixel'];
const askedStyle = (typeof location !== 'undefined' && new URLSearchParams(location.search).get('style')) || savedStyle();
export const STYLE = STYLES.includes(askedStyle) ? askedStyle : 'prerendered';
export const GRAVITY = 900;

export const ERAS = {
  forerunner: { name: 'Forerunner Era', color: 0x3fa9f5, css: '#3fa9f5', kit: 'forerunner' },
  covenant: { name: 'Covenant War', color: 0x9b59d0, css: '#9b59d0', kit: 'covenant' },
  created: { name: 'The Created', color: 0xf39c33, css: '#f39c33', kit: 'created' },
  banished: { name: 'The Banished', color: 0xe0453a, css: '#e0453a', kit: 'banished' },
};

// enemyDamage/enemyHealth scale enemies; shieldDelay is seconds before shields recharge;
// aimAssist is the cone (radians) in which shots bend toward the nearest enemy;
// respawn is seconds before a downed co-op player drops back in.
export const DIFFICULTY = {
  easy: { label: 'Easy', enemyDamage: 0.5, enemyHealth: 0.75, shieldDelay: 2, aimAssist: 0.35, respawn: 2 },
  normal: { label: 'Normal', enemyDamage: 1, enemyHealth: 1, shieldDelay: 3, aimAssist: 0.15, respawn: 3 },
  heroic: { label: 'Heroic', enemyDamage: 1.5, enemyHealth: 1.3, shieldDelay: 4, aimAssist: 0, respawn: 4 },
  legendary: { label: 'Legendary', enemyDamage: 2.5, enemyHealth: 1.6, shieldDelay: 5, aimAssist: 0, respawn: 5 },
};

export const TEAMS = { players: 'players', enemies: 'enemies' };

export const LEGAL_NOTICE =
  'Halo © Microsoft Corporation. Ring Anthology: Prisms was created under Microsoft\'s ' +
  '"Game Content Usage Rules" using assets from Halo, and it is not endorsed by or ' +
  'affiliated with Microsoft.';
export const LEGAL_URL = 'https://www.xbox.com/en-US/developers/rules';
