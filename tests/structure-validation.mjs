import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredModules = [
  'src/game/enemies/base-enemy.js',
  'src/game/enemies/normal-enemy.js',
  'src/game/enemies/boss-enemy.js',
  'src/game/enemies/index.js',
  'src/game/towers/tower.js',
  'src/game/projectiles/bullet.js',
  'src/game/effects/chain-particle.js',
];

test('split game entity modules exist', async () => {
  for (const file of requiredModules) {
    await access(path.join(root, file), constants.F_OK);
  }
});

test('obsolete entities.js stays removed', async () => {
  await assert.rejects(
    access(path.join(root, 'src/js/entities.js'), constants.F_OK)
  );
});

test('source and tests do not import obsolete entities.js', async () => {
  const filesToCheck = [
    'src/js/game-manager.js',
    'src/browser-main.js',
    'tests/entity-modules.mjs',
    'tests/upgrade-continuity.mjs',
  ];

  for (const file of filesToCheck) {
    const content = await readFile(path.join(root, file), 'utf8');

    assert.equal(
      content.includes('entities.js'),
      false,
      `${file} still references obsolete entities.js`
    );
  }
});
