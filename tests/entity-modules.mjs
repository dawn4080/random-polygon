import test from 'node:test';
import assert from 'node:assert/strict';

const elements = new Map();
function makeElement(id) {
  const element = {
    id,
    style: {},
    className: '',
    textContent: '',
    innerHTML: '',
    disabled: false,
    dataset: {},
    firstElementChild: { textContent: '' },
    classList: { add() {}, remove() {}, contains() { return false; } },
    addEventListener() {},
    contains() { return false; },
    closest() { return null; },
    getBoundingClientRect() { return { width: 820, height: 620 }; },
  };
  if (id === 'c') {
    element.getContext = () => new Proxy({}, {
      get(target, key) {
        if (!(key in target)) target[key] = () => {};
        return target[key];
      },
      set(target, key, value) { target[key] = value; return true; },
    });
  }
  return element;
}

globalThis.document = {
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, makeElement(id));
    return elements.get(id);
  },
  addEventListener() {},
};

const enemyModule = await import('../src/game/enemies/index.js');
const { Tower } = await import('../src/game/towers/tower.js');
const { Bullet } = await import('../src/game/projectiles/bullet.js');
const { ChainParticle } = await import('../src/game/effects/chain-particle.js');

const { NormalEnemy, BossEnemy, Enemy, createEnemy } = enemyModule;

function close(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: expected ${expected}, got ${actual}`);
}

test('split entity modules are importable', () => {
  assert.equal(typeof NormalEnemy, 'function');
  assert.equal(typeof BossEnemy, 'function');
  assert.equal(typeof Tower, 'function');
  assert.equal(typeof Bullet, 'function');
  assert.equal(typeof ChainParticle, 'function');
});

test('normal enemy keeps first-balance formulas', () => {
  const wave = 7;
  const multiplier = 1.15;
  const enemy = new NormalEnemy(wave, multiplier);
  close(enemy.sz, 10 + Math.min(wave * 0.35, 7), 'normal size');
  close(enemy.maxHp, (40 + wave * 25 + Math.pow(wave, 1.7) * 4.5) * multiplier, 'normal hp');
  close(enemy.spd, 1.45 + wave * 0.05, 'normal speed');
  assert.equal(enemy.reward, Math.floor((6 + wave * 1.2) * multiplier));
  assert.equal(enemy.isBoss, false);
});

test('boss enemy keeps first-balance formulas', () => {
  const wave = 10;
  const multiplier = 1.15;
  const enemy = new BossEnemy(wave, multiplier);
  assert.equal(enemy.sz, 28);
  close(enemy.maxHp, (1300 + wave * 420 + Math.pow(wave, 1.8) * 45) * multiplier, 'boss hp');
  close(enemy.spd, 0.65 + wave * 0.02, 'boss speed');
  assert.equal(enemy.reward, Math.floor((150 + wave * 18) * multiplier));
  assert.equal(enemy.isBoss, true);
});

test('enemy factory selects the correct split class', () => {
  assert.ok(createEnemy(1, false, 1) instanceof NormalEnemy);
  assert.ok(createEnemy(5, true, 1) instanceof BossEnemy);
  assert.ok(new Enemy(1, false, 1) instanceof NormalEnemy);
  assert.ok(new Enemy(5, true, 1) instanceof BossEnemy);
});
