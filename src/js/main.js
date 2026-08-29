import { canvas } from './config.js';
import { GameManager } from './game-manager.js';
import { bindUi } from './ui.js';
import { initAuth } from './auth.js';

const gm = new GameManager();
globalThis.gm = gm;
bindUi(gm, canvas);
initAuth();

function loop() {
  gm.update();
  gm.draw();
  requestAnimationFrame(loop);
}

loop();
