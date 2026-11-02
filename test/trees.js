// The tree test: each entry is read by the EFX-2 parser and by the editor's parser, and both trees
// must be the pinned one. An entry marked with a divergence pins the editor's tree and checks that
// ANTLR's still differs, so that a divergence that goes away is noticed and its mark removed. It
// reads the parser built in dist/, so it runs after `npm run build`.

import { EditorTree } from './trees/EditorTree.js';
import { OracleTree } from './trees/OracleTree.js';
import { ENTRIES } from './trees/entries.js';

/** What is wrong with an entry, or nothing. */
function problemsOf(entry) {
  const text = entry.text ?? `{ND-Root} \${${entry.input}}`;
  const shown = (parsed) => String(entry.text === undefined ? parsed.tree.expression() : parsed.tree);
  const editor = EditorTree.of(text);
  const oracle = OracleTree.of(text);
  const oracleAgrees = oracle.errors === 0 && shown(oracle) === entry.tree;
  const problems = [];
  if (shown(editor) !== entry.tree) {
    problems.push(`editor: ${shown(editor)}`);
  }
  if (entry.divergence === undefined) {
    if (editor.errors > 0) {
      problems.push(`editor: ${editor.errors} parse errors`);
    }
    if (!oracleAgrees) {
      problems.push(`ANTLR (${oracle.errors} syntax errors): ${shown(oracle)}`);
    }
  } else if (oracleAgrees) {
    problems.push(`ANTLR now agrees: the divergence "${entry.divergence}" is gone from this entry`);
  }
  return problems;
}

const failures = ENTRIES.map((entry) => ({ entry, problems: problemsOf(entry) }))
  .filter(({ problems }) => problems.length > 0);

const divergences = ENTRIES.filter((entry) => entry.divergence !== undefined).length;
console.log(`Trees: ${ENTRIES.length - failures.length} of ${ENTRIES.length} entries as pinned `
  + `(${divergences} of them listed divergences).`);
for (const { entry, problems } of failures) {
  console.error(`\n${JSON.stringify(entry.input ?? entry.text)}\n  pinned: ${entry.tree}`);
  problems.forEach((problem) => console.error(`  ${problem}`));
}
if (failures.length > 0) {
  process.exitCode = 1;
}
