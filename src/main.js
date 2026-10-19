import Phaser from 'phaser';
import '@fontsource/press-start-2p/400.css';
import '@fontsource/vt323/400.css';
import { VIEW, GRAVITY, HD } from './engine/config.js';
import { LevelScene } from './scenes/LevelScene.js';
import { HudScene } from './scenes/HudScene.js';
import { ControlsScene } from './scenes/ControlsScene.js';
import { GraphicsScene } from './scenes/GraphicsScene.js';
import { SagaScene } from './scenes/SagaScene.js';
import { BackdropScene } from './scenes/BackdropScene.js';
import { SkullsScene } from './scenes/SkullsScene.js';
import { installCrt } from './engine/crt.js';
import { BootScene, TitleScene, PlayersScene, TimelineScene, ArchiveScene, ResultsScene, PauseScene, FirefightScene } from './scenes/menus.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: VIEW.w * HD,
  height: VIEW.h * HD,
  backgroundColor: '#000000',
  pixelArt: true,
  roundPixels: true,
  physics: { default: 'arcade', arcade: { gravity: { y: GRAVITY }, tileBias: 20 } },
  input: { gamepad: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, TitleScene, PlayersScene, TimelineScene, ArchiveScene, BackdropScene, LevelScene, HudScene, ResultsScene, PauseScene, ControlsScene, GraphicsScene, FirefightScene, SagaScene, SkullsScene],
});

game.events.once('ready', () => installCrt(game));

// Exposed for the smoke test and playtests.
window.__game = game;
