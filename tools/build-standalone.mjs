import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPaths = [
  'src/js/config.js',
  'src/js/entities.js',
  'src/js/game-manager.js',
  'src/js/ui.js',
  'src/js/supabase-config.js',
  'src/js/auth.js',
  'src/js/main.js',
];

const stripModules = source => source
  .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][^'"]+['"];?\s*/g, '')
  .replace(/import\s+[^;]+;\s*/g, '')
  .replace(/export\s+function\s+/g, 'function ')
  .replace(/export\s*\{[\s\S]*?\};?\s*/g, '');

const [indexHtml, css, ...scripts] = await Promise.all([
  readFile(path.join(projectRoot, 'index.html'), 'utf8'),
  readFile(path.join(projectRoot, 'src/css/style.css'), 'utf8'),
  ...scriptPaths.map(file => readFile(path.join(projectRoot, file), 'utf8')),
]);

const bundledScript = scripts.map(stripModules).join('\n\n');
const standaloneHtml = indexHtml
  .replace('<link rel="stylesheet" href="src/css/style.css">', `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="src/js/main.js"></script>', `<script>\n${bundledScript}\n</script>`);

const outputPath = path.join(projectRoot, 'RP_게임실행.html');
await writeFile(outputPath, standaloneHtml, 'utf8');
console.log(outputPath);
