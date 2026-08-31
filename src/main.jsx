import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { canvas } from './js/config.js';
import { GameManager } from './js/game-manager.js';
import { bindUi } from './js/ui.js';
import { applyGameplayEnhancements } from './js/gameplay-enhancements.js';
import { initAuth, openAuth, openRanking } from './js/auth.js';

globalThis.rpGameStarted = false;
const gm = new GameManager();
globalThis.gm = gm;
applyGameplayEnhancements(gm);
bindUi(gm, canvas);

createRoot(document.getElementById('react-app')).render(
  <React.StrictMode>
    <App gm={gm} openAuth={openAuth} openRanking={openRanking} />
  </React.StrictMode>,
);

initAuth();

function loop() {
  gm.update();
  gm.draw();
  requestAnimationFrame(loop);
}

loop();
