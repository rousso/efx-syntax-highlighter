// The conformance test: each corpus file is read by the EFX-2 lexer and by the editor's parser, and
// the tokens they agree on are counted (FileComparison says when a token matches). It reads the
// parser built in dist/, so it runs after `npm run build`.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FileComparison } from './conformance/FileComparison.js';
import { OracleTokens } from './conformance/OracleTokens.js';
import { TokenNames } from './conformance/TokenNames.js';

// The numbers as measured by the last commit that changed them, by corpus folder: the view
// templates and the rules files. The test fails when they change, in either direction, until that
// commit updates them here.
const PINNED = {
  validation: { files: 0, tokens: 17722 },
  'view-templates': { files: 0, tokens: 256053 },
};

const CORPUS = fileURLToPath(new URL('./corpus/', import.meta.url));

const files = fs.readdirSync(CORPUS, { recursive: true }).filter((file) => file.endsWith('.efx')).sort();
const comparisons = files.map((file) => new FileComparison(file, fs.readFileSync(path.join(CORPUS, file), 'utf8')));
const folderOf = (file) => file.split(path.sep)[0];

/** The counts of a group of files, kept by kind of token. */
function countsOf(group) {
  const counts = new Map();
  group.forEach((comparison) => comparison.addCountsTo(counts));
  return counts;
}

const sum = (counts, key) => [...counts.values()].reduce((total, count) => total + count[key], 0);
const number = (value) => value.toLocaleString('en-US');

console.log(`Conformance of the editor's parser with the EFX-2 lexer, over ${files.length} corpus files:`);
const folders = [...new Set(files.map(folderOf))];
const measured = {};
for (const folder of folders) {
  const group = comparisons.filter((_, index) => folderOf(files[index]) === folder);
  const groupCounts = countsOf(group);
  const total = sum(groupCounts, 'total');
  measured[folder] = {
    files: group.filter((comparison) => comparison.matches).length,
    tokens: sum(groupCounts, 'matched'),
  };
  const pinned = PINNED[folder] ?? { files: 0, tokens: 0 };
  console.log(`  ${folder}: ${measured[folder].files} of ${group.length} files match (pinned: ${pinned.files}), `
    + `${number(measured[folder].tokens)} of ${number(total)} tokens, `
    + `${(100 * measured[folder].tokens / total).toFixed(1)}% (pinned: ${number(pinned.tokens)})`);
}
const counts = countsOf(comparisons);
const kinds = [...counts.entries()];

console.log('\nFirst difference in each file:');
comparisons.map((comparison) => comparison.firstDifference())
  .filter((difference) => difference !== undefined)
  .forEach((difference) => console.log(`  ${difference}`));

console.log('\nToken kinds not fully matched, unmatched of total:');
kinds.filter(([, count]) => count.matched < count.total)
  .sort(([, a], [, b]) => (b.total - b.matched) - (a.total - a.matched))
  .forEach(([kind, count]) => console.log(`  ${kind} ${number(count.total - count.matched)} of ${number(count.total)}`));

const lexerKinds = OracleTokens.kinds();
const absent = lexerKinds.filter((kind) => !counts.has(kind));
console.log(`\n${absent.length} of the lexer's ${lexerKinds.length} token kinds do not occur in the corpus: ${absent.join(', ')}`);

const missing = kinds.map(([kind]) => kind).filter((kind) => !TokenNames.has(kind));
if (missing.length > 0) {
  console.error(`\nToken kinds missing from test/conformance/TokenNames.js: ${missing.join(', ')}`);
  process.exitCode = 1;
}
const isPinned = (folder) => PINNED[folder]?.files === measured[folder].files
  && PINNED[folder]?.tokens === measured[folder].tokens;
if (folders.length !== Object.keys(PINNED).length || !folders.every(isPinned)) {
  console.error('\nThe numbers differ from the pins. If the change is intended, set the pins at the top of '
    + `test/conformance.js to:\nconst PINNED = ${JSON.stringify(measured, null, 2)};`);
  process.exitCode = 1;
}
