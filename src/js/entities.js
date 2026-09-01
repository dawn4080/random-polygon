// Temporary compatibility layer during the safe file-structure refactor.
// Existing imports keep working while each entity now lives in its own module.
export { Enemy, NormalEnemy, BossEnemy, createEnemy } from '../game/enemies/index.js';
export { Tower } from '../game/towers/tower.js';
export { Bullet } from '../game/projectiles/bullet.js';
export { ChainParticle } from '../game/effects/chain-particle.js';
