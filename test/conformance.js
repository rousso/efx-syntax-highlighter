// The conformance test: each corpus file is read by the EFX-2 lexer and by the editor's parser, and
// the tokens they agree on are counted (FileComparison says when a token matches). It reads the
// parser built in dist/, so it runs after `npm run build`.

import fs from 'node:fs';
import { FileComparison } from './conformance/FileComparison.js';
import { OracleTokens } from './conformance/OracleTokens.js';
import { TokenNames } from './conformance/TokenNames.js';

// The numbers as measured by the last commit that changed them. The test fails when they change,
// in either direction, until that commit updates them here.
const PINNED = { files: 0, tokens: 288185 };

const CORPUS = new URL('./corpus/', import.meta.url);

const files = fs.readdirSync(CORPUS, { recursive: true }).filter((file) => file.endsWith('.efx')).sort();
const comparisons = files.map((file) => new FileComparison(file, fs.readFileSync(new URL(file, CORPUS), 'utf8')));

const counts = new Map();
comparisons.forEach((comparison) => comparison.addCountsTo(counts));
const kinds = [...counts.entries()];
const measured = {
  files: comparisons.filter((comparison) => comparison.matches).length,
  tokens: kinds.reduce((sum, [, count]) => sum + count.matched, 0),
};
const totalTokens = kinds.reduce((sum, [, count]) => sum + count.total, 0);
const number = (value) => value.toLocaleString('en-US');

console.log(`Conformance of the editor's parser with the EFX-2 lexer, over ${files.length} corpus files:`);
console.log(`  ${measured.files} of ${files.length} files match (pinned: ${PINNED.files})`);
console.log(`  ${number(measured.tokens)} of ${number(totalTokens)} tokens match, `
  + `${(100 * measured.tokens / totalTokens).toFixed(1)}% (pinned: ${number(PINNED.tokens)})`);

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
if (measured.files !== PINNED.files || measured.tokens !== PINNED.tokens) {
  console.error('\nThe numbers differ from the pins. If the change is intended, set the pins at the top of '
    + `test/conformance.js to:\nconst PINNED = { files: ${measured.files}, tokens: ${measured.tokens} };`);
  process.exitCode = 1;
}
