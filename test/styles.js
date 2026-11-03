// The style test: the highlight tags the editor gives the sample and a rules file of the corpus are
// pinned as lists of runs (StyleDump), in test/styles/. It also checks that every node the style
// table of src/efxHighlighting.js names is a node of the grammar: a name that is not one styles
// nothing, silently. `node test/styles.js --write` writes the pinned lists anew, so that the commit
// that changes the highlighting shows each change. It reads the build in dist/, so it runs after
// `npm run build`.

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parser } from '../dist/efx-parser.js';
import { EFX_STYLES } from '../dist/efxHighlighting.js';
import { StyleDump } from './styles/StyleDump.js';

const PINNED = [
  { text: 'sample.efx', top: 'TemplateFile', runs: 'styles/sample.txt' },
  { text: 'corpus/validation/stage-4m.efx', top: 'RulesFile', runs: 'styles/stage-4m.txt' },
];

// The most differences shown for one file.
const SHOWN = 10;

const pathOf = (file) => fileURLToPath(new URL(file, import.meta.url));
const write = process.argv.includes('--write');

const nodeNames = new Set(parser.nodeSet.types.map((type) => type.name));
const unknown = Object.keys(EFX_STYLES).flatMap((selector) => selector.split(' '))
  .flatMap((path) => path.split('/')).filter((name) => !nodeNames.has(name));
if (unknown.length > 0) {
  console.error(`The style table names nodes the grammar does not have: ${unknown.join(', ')}`);
  process.exitCode = 1;
}

for (const { text, top, runs } of PINNED) {
  const actual = StyleDump.of(fs.readFileSync(pathOf(text), 'utf8'), top);
  if (write) {
    fs.writeFileSync(pathOf(runs), `${actual.join('\n')}\n`);
    console.log(`Styles: ${text}, ${actual.length} runs written to test/${runs}.`);
    continue;
  }
  const pinned = fs.readFileSync(pathOf(runs), 'utf8').split('\n').slice(0, -1);
  const differences = [...Array(Math.max(actual.length, pinned.length)).keys()]
    .filter((index) => actual[index] !== pinned[index]);
  console.log(`Styles: ${text}, ${actual.length - differences.length} of ${pinned.length} pinned runs as pinned.`);
  for (const index of differences.slice(0, SHOWN)) {
    console.error(`  pinned: ${pinned[index] ?? '(none)'}\n  editor: ${actual[index] ?? '(none)'}`);
  }
  if (differences.length > 0) {
    process.exitCode = 1;
  }
}
