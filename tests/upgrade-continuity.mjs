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
    classList: {
      add() {},
      remove() {},
      contains() { return false; },
    },
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
      set(target, key, value) {
        target[key] = value;
        return true;
      },
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

const [{ GameManager }, { Enemy }] = await Promise.all([
  import('../src/js/game-manager.js'),
  import('../src/game/enemies/index.js'),
]);

const gm = new GameManager();
globalThis.gm = gm;
gm.storyOpen = false;
gm.waveActive = true;
gm.spawnDone = true;
gm.spawnDoneCD = 9999;
gm.enemies.push(new Enemy(1, false, 1));

gm.update();
gm.update();
const before = { x: gm.enemies[0].x, y: gm.enemies[0].y };

gm.openUpgrade();
for (let i = 0; i < 20; i += 1) gm.update();

const after = { x: gm.enemies[0].x, y: gm.enemies[0].y };
const moved = before.x !== after.x || before.y !== after.y;

if (!gm.upgradeOpen) throw new Error('연구소가 열린 상태가 아닙니다.');
if (!moved) throw new Error('연구소를 연 뒤 적이 이동하지 않았습니다.');

console.log(JSON.stringify({ passed: true, before, after }));
