// The demo page: an editor holding one kind of EFX text, with the EFX colours, the editor's look and
// the completions. The field and node ids it offers are those the text uses, found by the shapes of
// the grammar's FieldId and NodeId. Served by `npm run demo` after `npm run build`; not part of the
// package.

import { autocompletion } from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { efx, efxSymbols, efxTheme } from '/dist/index.js';

// The file the editor shows for each kind of EFX text.
const FILES = {
  template: '/test/sample.efx',
  rules: '/test/corpus/validation/stage-4m.efx',
  expression: '/demo/expression.efx',
};

const FIELD_ID = /\b(?:BT|OPP|OPT|OPA)-\d+(?:\((?:BT-\d+|[a-z])\))?(?:-[a-zA-Z_][a-zA-Z_0-9]*)+/g;
const NODE_ID = /\bND-[a-zA-Z0-9]+/g;

const view = new EditorView({ parent: document.getElementById('editor') });
const choice = document.getElementById('kind');

/** The ids of a shape that a text uses, each once. */
function idsIn(text, shape) {
  return [...new Set(text.match(shape))];
}

/** Shows the text of a kind in the editor, with the extensions of that kind. */
async function show(kind) {
  const text = await (await fetch(FILES[kind])).text();
  view.setState(EditorState.create({
    doc: text,
    extensions: [
      efx(kind),
      efxTheme,
      efxSymbols.of({ fields: idsIn(text, FIELD_ID), nodes: idsIn(text, NODE_ID) }),
      autocompletion(),
      EditorView.lineWrapping,
    ],
  }));
}

choice.addEventListener('change', () => show(choice.value));
show(choice.value);
