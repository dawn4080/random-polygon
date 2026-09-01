import { NormalEnemy } from './normal-enemy.js';
import { BossEnemy } from './boss-enemy.js';

export function createEnemy(wave,isBoss,difficultyMultiplier){
  return isBoss
    ? new BossEnemy(wave,difficultyMultiplier)
    : new NormalEnemy(wave,difficultyMultiplier);
}

export { NormalEnemy, BossEnemy };
