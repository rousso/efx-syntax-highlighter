// The completion test: what the editor offers at the cursor, marked ‸ in each text, one check for
// each kind of place; that every item of the toolkit's completion list is offered somewhere; and
// that every word of two template files and a rules file is offered where it stands. It reads the
// build in dist/, so it runs after `npm run build`.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CompletionContext } from '@codemirror/autocomplete';
import { ensureSyntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { completionItems } from '../dist/generated/completions.js';
import * as words from '../dist/generated/words.js';
import { efx, efxSymbols } from '../dist/index.js';

// The ids an application might give the editor.
const SYMBOLS = efxSymbols.of({ fields: ['BT-01-notice', 'BT-26(m)-Procedure'], nodes: ['ND-Root', 'ND-Lot'] });

const PROPERTIES = completionItems.filter(({ kind }) => kind === 'PROPERTY').map(({ label }) => label.slice(1));
const FUNCTIONS = [...new Set(completionItems.filter(({ kind }) => kind === 'FUNCTION').map(({ label }) => label))];

// The names of the tokens the lexer reads from the words of its tables (src/generated/words.js).
const WORD_TOKENS = new Set(['AssetType', 'LabelType',
  ...Object.values(words).filter((table) => table instanceof Map).flatMap((table) => [...table.values()])]);

/** An editor's state, with its cursor at a position. */
class Editor {
  constructor(state, pos) {
    this.state = state.update({ selection: { anchor: pos } }).state;
    this.pos = pos;
  }

  /** An editor holding a text of a kind, with its cursor where ‸ marks it. */
  static at(kind, marked) {
    return new Editor(Editor.holding(kind, marked.replace('‸', '')), marked.indexOf('‸'));
  }

  /** The state of an editor holding a text of a kind. */
  static holding(kind, text) {
    return EditorState.create({ doc: text, extensions: [efx(kind), SYMBOLS] });
  }

  /** What the editor offers at the cursor while typing, or when asked for (explicit); null when nothing. */
  offered(explicit = false) {
    const [source] = this.state.languageDataAt('autocomplete', this.pos);
    return source(new CompletionContext(this.state, this.pos, explicit));
  }

  /** The labels offered when asked for. */
  labels() {
    return this.offered(true).options.map(({ label }) => label);
  }

  /** The option of a label offered when asked for. */
  option(label) {
    return this.offered(true).options.find((option) => option.label === label);
  }

  /** The text after the option of a label is picked. */
  picked(label) {
    const result = this.offered(true);
    const option = result.options.find((candidate) => candidate.label === label);
    const editor = { state: this.state, dispatch(transaction) { this.state = transaction.state; } };
    option.apply(editor, option, result.from, this.pos);
    return editor.state.doc.toString();
  }
}

const expression = (text) => Editor.at('expression', `WITH ND-Root COMPUTE ${text}`);
const template = (text) => Editor.at('template', text);
const rules = (text) => Editor.at('rules', `---- STAGE 1a ----\nWITH ND-Root ASSERT ${text}`);

// The places where the list's items are offered: the functions as calls, TRUE, FALSE, ALWAYS and
// NEVER at the start of an expression, the type words in a declaration, the properties after a colon.
const LIST_PLACES = [expression('‸'), template('let ‸'), expression('BT-01-notice:‸')];

/**
 * The words of a file of a kind that the lexer reads from its tables, each with an editor whose
 * cursor is after its first letter. A word may take the whitespace before or after it, and a phrase
 * is written with one blank between its words.
 */
function wordsIn(kind, file) {
  const text = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
  const state = Editor.holding(kind, text);
  const found = [];
  ensureSyntaxTree(state, text.length, 10_000).iterate({
    enter: ({ name, from, to }) => {
      if (WORD_TOKENS.has(name)) {
        const start = from + text.slice(from, to).search(/\S/);
        found.push({ word: text.slice(from, to).trim().replace(/\s+/g, ' '), editor: new Editor(state, start + 1) });
      }
    },
  });
  return found;
}

const CHECKS = {
  'the start of an expression offers the functions as calls, the keywords and the ids': () => {
    const labels = expression('‸').labels();
    for (const label of ['count', 'not', 'TRUE', 'ALWAYS', 'every', 'BT-01-notice', 'ND-Root']) {
      assert.ok(labels.includes(label), label);
    }
    assert.equal(expression('‸').option('count').type, 'function');
    assert.equal(expression('‸').option('format-short').info,
      'format-short(value TIME) -> TEXT\nformat-short(value DATE, time TIME?) -> TEXT');
  },
  'a call fills in its required parameters': () => {
    assert.equal(expression('con‸').picked('contains'), 'WITH ND-Root COMPUTE contains(haystack, needle)');
    assert.equal(expression('sub‸').picked('substring'), 'WITH ND-Root COMPUTE substring(value, start)');
    assert.equal(expression('cur‸').picked('current-date'), 'WITH ND-Root COMPUTE current-date()');
  },
  'after `is`, not and empty are words': () => {
    assert.deepEqual(expression('BT-01-notice is ‸').labels().sort(), ['empty', 'not', 'present', 'unique']);
    assert.equal(expression('BT-01-notice is ‸').option('not').type, 'keyword');
  },
  'after a colon, the properties': () => {
    assert.deepEqual(expression('BT-01-notice:‸').labels().sort(), [...PROPERTIES].sort());
    assert.equal(expression('BT-01-notice:raw‸').option('rawValue').type, 'property');
  },
  'a label block offers asset types, label types and field ids': () => {
    const labels = template('1 {ND-Root} #{‸').labels();
    for (const label of ['field', 'auxiliary', 'name', 'when-true', 'BT-01-notice']) {
      assert.ok(labels.includes(label), label);
    }
    assert.ok(!labels.includes('ND-Root'));
    assert.deepEqual(template('1 {ND-Root} #{field|‸').labels().sort(),
      ['description', 'hint', 'name', 'template', 'text', 'when-false', 'when-true']);
  },
  'after the pipe of an expression block, the format options': () => {
    assert.deepEqual(template('1 {ND-Root} ${BT-01-notice | ‸').labels().sort(), ['long', 'medium', 'no-formatting', 'no-unit', 'short']);
  },
  'a template line starts with its words': () => {
    assert.deepEqual(template('‸').labels().sort(),
      ['DISPLAY', 'INVOKE', 'LET', 'WHEN', 'WITH', 'display', 'invoke', 'let', 'when', 'with']);
  },
  'after a template, the words that go on, a phrase in one case': () => {
    assert.deepEqual(template('1 WHEN BT-01-notice is present DISPLAY abc ‸').labels().sort(),
      ['OTHERWISE', 'OTHERWISE DISPLAY', 'WHEN', 'otherwise', 'otherwise display', 'when']);
  },
  'a rule offers its clauses': () => {
    assert.deepEqual(rules('BT-01-notice is present AS ‸').labels().sort(), ['ERROR', 'INFO', 'WARNING']);
    assert.ok(rules('BT-01-notice is present ‸').labels().includes('AS'));
  },
  'a declaration offers the types': () => {
    const labels = template('let ‸').labels();
    for (const label of ['text', 'number', 'indicator', 'date', 'time', 'duration']) {
      assert.ok(labels.includes(label), label);
    }
    assert.deepEqual(template('let ‸').option('text'), { label: 'text', type: 'keyword', detail: 'TEXT' });
  },
  'the variables a place can use': () => {
    const variables = (editor) => editor.labels().filter((label) => label.startsWith('$'));
    assert.deepEqual(variables(template('1 {ND-Root} ${for text:$x in BT-01-notice return $‸')), ['$x']);
    assert.deepEqual(variables(template('1 {ND-Root} ${for text:$x in BT-01-notice return 1} ${$‸')), []);
    assert.deepEqual(variables(template('let text:$t = 1;\n1 {ND-Root} ${$‸')), ['$t']);
    assert.deepEqual(variables(Editor.at('expression', '{ND-Root, text:$p} ${$‸')), ['$p']);
  },
  'after WITH, the node ids and the field ids': () => {
    assert.deepEqual(Editor.at('expression', 'WITH ‸').labels().sort(), ['BT-01-notice', 'BT-26(m)-Procedure', 'ND-Lot', 'ND-Root']);
  },
  'a field id with its part in parentheses is one word': () => {
    assert.equal(template('1 {ND-Root} ${BT-26(m‸').offered().from, '1 {ND-Root} ${'.length);
  },
  'template text offers its words only when asked for': () => {
    assert.equal(template('1 WHEN BT-01-notice is present DISPLAY abc W‸').offered(), null);
    assert.ok(template('1 WHEN BT-01-notice is present DISPLAY abc W‸').labels().includes('WHEN'));
  },
  'nothing is offered in a comment or a string, or after an error': () => {
    assert.equal(template('// a co‸').offered(true), null);
    assert.equal(template("1 {ND-Root} ${'co‸'}").offered(true), null);
    assert.deepEqual(rules('BT-01-notice is is ‸').labels(), []);
  },
  'every item of the completion list is offered somewhere': () => {
    const offered = new Set(LIST_PLACES.flatMap((editor) => editor.offered(true).options.map(({ label, type }) => `${type} ${label}`)));
    const TYPES = { FUNCTION: 'function', KEYWORD: 'keyword', PROPERTY: 'property' };
    const missing = completionItems.map(({ kind, label }) => `${TYPES[kind]} ${label.replace(/^:/, '')}`).filter((item) => !offered.has(item));
    assert.deepEqual(missing, []);
    assert.equal(completionItems.length, 161);
    assert.equal(FUNCTIONS.length, 72);
  },
  'every word of two templates files and a rules file is offered where it stands': () => {
    const found = [...wordsIn('template', 'sample.efx'), ...wordsIn('template', 'corpus/view-templates/1.efx'),
      ...wordsIn('rules', 'corpus/validation/stage-4m.efx')];
    const missing = found.filter(({ word, editor }) => !editor.labels().includes(word)).map(({ word, editor }) => `${word} at ${editor.pos - 1}`);
    assert.deepEqual(missing, []);
    assert.equal(found.length, 831);
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
console.log(`Completions: ${Object.keys(CHECKS).length - failures.length} of ${Object.keys(CHECKS).length} checks pass.`);
if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
