import { NormalEnemy } from './normal-enemy.js';
import { BossEnemy } from './boss-enemy.js';

export function createEnemy(wave,isBoss,difficultyMultiplier){
  return isBoss
    ? new BossEnemy(wave,difficultyMultiplier)
    : new NormalEnemy(wave,difficultyMultiplier);
}

// Compatibility constructor for existing `new Enemy(wave, isBoss, multiplier)` calls.
// Keeping this adapter lets us refactor file boundaries without changing gameplay callers yet.
export function Enemy(wave,isBoss,difficultyMultiplier){
  return createEnemy(wave,isBoss,difficultyMultiplier);
}

export { NormalEnemy, BossEnemy };
