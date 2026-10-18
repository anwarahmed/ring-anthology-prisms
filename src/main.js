import Phaser from 'phaser';
import '@fontsource/press-start-2p/400.css';
import '@fontsource/vt323/400.css';
import { VIEW, GRAVITY } from './engine/config.js';
import { LevelScene } from './scenes/LevelScene.js';
import { HudScene } from './scenes/HudScene.js';
import { ControlsScene } from './scenes/ControlsScene.js';
import { BootScene, TitleScene, PlayersScene, TimelineScene, ArchiveScene, ResultsScene, PauseScene } from './scenes/menus.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: VIEW.w,
  height: VIEW.h,
  backgroundColor: '#000000',
  pixelArt: true,
  roundPixels: true,
  physics: { default: 'arcade', arcade: { gravity: { y: GRAVITY }, tileBias: 20 } },
  input: { gamepad: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, TitleScene, PlayersScene, TimelineScene, ArchiveScene, LevelScene, HudScene, ResultsScene, PauseScene, ControlsScene],
});

// Exposed for the smoke test and playtests.
window.__game = game;
