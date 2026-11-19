// Gathers the demo page and what it loads into site/, the folder the Pages workflow publishes: the page
// in demo/, the build in dist/, the files its options show and the packages its import map names. Each
// is copied to its place in the repository, so that the page's relative paths hold. Run after
// `npm run build`; a file missing from the repository fails the script.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PAGE = path.join(ROOT, 'demo');
const SITE = path.join(ROOT, 'site');
const MODULES = path.join(ROOT, 'node_modules');

/** Copies a file or folder of the repository to the same place in the site. */
function copy(source) {
  fs.cpSync(source, path.join(SITE, path.relative(ROOT, source)), { recursive: true });
}

/** The folder of the package that holds a file under node_modules/. */
function packageOf(file) {
  const [scopeOrName, name] = path.relative(MODULES, file).split(path.sep);
  return path.join(MODULES, scopeOrName.startsWith('@') ? path.join(scopeOrName, name) : scopeOrName);
}

const page = fs.readFileSync(path.join(PAGE, 'index.html'), 'utf8');
const files = [...page.matchAll(/data-file="([^"]+)"/g)].map((match) => path.join(PAGE, match[1]));
const modules = Object.values(JSON.parse(page.match(/<script type="importmap">([^<]*)<\/script>/)[1]).imports);

fs.rmSync(SITE, { recursive: true, force: true });
copy(PAGE);
copy(path.join(ROOT, 'dist'));
for (const file of files) {
  copy(file);
}
for (const module of modules) {
  const file = path.join(PAGE, module);
  if (!fs.existsSync(file)) {
    throw new Error(`The import map names ${module}, which is not in the repository.`);
  }
  copy(packageOf(file));
}
fs.writeFileSync(path.join(SITE, 'index.html'),
  '<!doctype html>\n<meta http-equiv="refresh" content="0; url=demo/">\n<a href="demo/">EFX syntax highlighter demo</a>\n');
console.log('Site written to site/.');
