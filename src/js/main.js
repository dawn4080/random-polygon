import { canvas } from './config.js';
import { GameManager } from './game-manager.js';
import { bindUi } from './ui.js';

const gm = new GameManager();
globalThis.gm = gm;
bindUi(gm, canvas);

function loop() {
  gm.update();
  gm.draw();
  requestAnimationFrame(loop);
}

loop();
