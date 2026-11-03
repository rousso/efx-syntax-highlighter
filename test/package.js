// The package test: the package's entry point (dist/index.js), as an application loads it. It checks
// what the entry point offers; that efx(kind) reads each kind of EFX text from its own top, with no
// error, and offers its completions; that the EFX colours are the editor's default colours and give
// way to an application's own; and that an unknown kind is refused. It reads the build in dist/, so
// it runs after `npm run build`. What the completions offer is checked by completions.js.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EditorState } from '@codemirror/state';
import { HighlightStyle, ensureSyntaxTree, highlightingFor, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import * as entryPoint from '../dist/index.js';

const { efx, efxHighlightStyle } = entryPoint;

// A text of each kind, and the top that must read it.
const KINDS = [
  { kind: 'template', top: 'TemplateFile', text: fs.readFileSync(new URL('sample.efx', import.meta.url), 'utf8') },
  { kind: 'rules', top: 'RulesFile', text: fs.readFileSync(new URL('corpus/validation/stage-4m.efx', import.meta.url), 'utf8') },
  { kind: 'expression', top: 'SingleExpression', text: 'WITH ND-Root COMPUTE BT-01-notice is present' },
];

// Colours an application might give the editor.
const OWN_COLOURS = HighlightStyle.define([{ tag: tags.keyword, color: 'red' }]);

/** The tree of an editor's whole text. */
function treeOf(state) {
  return ensureSyntaxTree(state, state.doc.length, 10_000);
}

/** The number of parse errors in a tree. */
function errorsIn(tree) {
  let errors = 0;
  tree.iterate({ enter: (node) => { errors += node.type.isError ? 1 : 0; } });
  return errors;
}

const CHECKS = {
  'the entry point offers efx, efxSymbols, efxHighlightStyle and efxTheme': () => {
    assert.deepEqual(Object.keys(entryPoint).sort(), ['efx', 'efxHighlightStyle', 'efxSymbols', 'efxTheme']);
  },
  ...Object.fromEntries(KINDS.map(({ kind, top, text }) => [`efx('${kind}') reads its text from ${top}`, () => {
    const tree = treeOf(EditorState.create({ doc: text, extensions: [efx(kind)] }));
    assert.equal(tree.type.name, top);
    assert.equal(errorsIn(tree), 0);
  }])),
  ...Object.fromEntries(KINDS.map(({ kind }) => [`efx('${kind}') offers its completions`, () => {
    const state = EditorState.create({ extensions: [efx(kind)] });
    assert.equal(state.languageDataAt('autocomplete', 0).length, 1);
  }])),
  'the EFX colours are the default': () => {
    const state = EditorState.create({ extensions: [efx('template')] });
    assert.equal(highlightingFor(state, [tags.keyword]), efxHighlightStyle.style([tags.keyword]));
  },
  "an application's colours replace them": () => {
    const state = EditorState.create({ extensions: [efx('template'), syntaxHighlighting(OWN_COLOURS)] });
    assert.equal(highlightingFor(state, [tags.keyword]), OWN_COLOURS.style([tags.keyword]));
  },
  'an unknown kind is refused': () => {
    assert.throws(() => efx(), RangeError);
    assert.throws(() => efx('rule'), RangeError);
  },
};

const failures = Object.entries(CHECKS).flatMap(([name, check]) => {
  try {
    check();
    return [];
  } catch (error) {
    return [`  ${name}: ${error.message}`];
  }
});
console.log(`Package: ${Object.keys(CHECKS).length - failures.length} of ${Object.keys(CHECKS).length} checks pass.`);
if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
