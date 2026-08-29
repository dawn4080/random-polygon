import { canvas } from './config.js';
import { GameManager } from './game-manager.js';
import { bindUi } from './ui.js';
import { initAuth } from './auth.js';
import { openAuth, openRanking } from './auth.js';
import { bindStartScreen } from './start-screen.js';

globalThis.rpGameStarted = false;
const gm = new GameManager();
globalThis.gm = gm;
bindUi(gm, canvas);
bindStartScreen(gm, { openAuth, openRanking });
initAuth();

function loop() {
  gm.update();
  gm.draw();
  requestAnimationFrame(loop);
}

loop();
