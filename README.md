# efx-syntax-highlighter

EFX support for [CodeMirror 6](https://codemirror.net/) editors: syntax highlighting and completions for the EFX language of the eForms SDK 2. It reads the three kinds of EFX text: template files (view templates), rules files (validation rules) and single expressions.

The parser is a [Lezer](https://lezer.codemirror.net/) grammar that follows the SDK's ANTLR grammar (`efx-grammar/Efx.g4` and `EfxLexer.g4`) rule for rule. Its words and the completion list are generated from the SDK and the EFX Toolkit at the commits pinned in `package.json` (`config`), and a test compares its tokens with those of the ANTLR lexer over the SDK's view templates and rules files. What each release changes is in [CHANGELOG.md](CHANGELOG.md).

## Install

```bash
npm install @op-ted/efx-syntax-highlighter
```

The package is an ES module. It needs the CodeMirror packages it lists as dependencies; a bundler, or an import map in the page, resolves them.

## Use

```js
import { autocompletion } from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { efx, efxSymbols, efxTheme } from '@op-ted/efx-syntax-highlighter';

const view = new EditorView({
  parent: document.getElementById('editor'),
  state: EditorState.create({
    doc: text,
    extensions: [
      efx('template'),
      efxSymbols.of({ fields: ['BT-01-notice', 'BT-26(m)-Procedure'], nodes: ['ND-Root', 'ND-Lot'] }),
      autocompletion(),
      efxTheme,
    ],
  }),
});
```

The package offers four things:

- **`efx(kind)`** gives an editor what it needs to read one kind of EFX text: its parser, the EFX colours and the completions. The kind is `'template'` for a template file, `'rules'` for a rules file, or `'expression'` for a single expression with its context, such as `WITH ND-Root COMPUTE BT-01-notice is present`. Any other kind is refused with a `RangeError`. `efx(kind).language` is the CodeMirror language, for an application that needs it on its own.
- **`efxSymbols`** gives the editor the field and node ids it offers: `efxSymbols.of({ fields, nodes })`, each a list of ids, for example those of the SDK's `fields.json`. The ids of several such extensions add up.
- **`efxHighlightStyle`** is the EFX colours. `efx(kind)` already uses them as the editor's default colours; an application that gives its editor its own colours with `syntaxHighlighting(...)` replaces them.
- **`efxTheme`** is a light look for the editor itself (white background, black cursor). Add it if you want it.

### Completions

The application turns completion on, with `autocompletion()` from `@codemirror/autocomplete` (or the `basicSetup` of the `codemirror` package, which includes it). While you type, the editor offers the words the grammar can take at the cursor:

- at the start of an expression, the functions as calls with their required parameters (`contains(haystack, needle)`), with their signatures beside them, and the keywords;
- after a field and a colon, the field's properties (`:rawValue`, `:publicationDate`, ...);
- after `is`, `not`, `empty`, `present` and `unique`;
- in a label block, the asset types and label types; after the pipe of an expression block, the format options;
- at the start of a line, the words of a template line or of a rule;
- the variables the cursor can use, and the field and node ids given through `efxSymbols`, where the grammar takes one.

In template text any word can go, so there the list opens only when asked for (Ctrl-Space). Nothing is offered inside a comment or a string.

Known limits: after the label shorthand `#{name|` no field ids are offered; after a `/` the `@` of an attribute is not offered; after a syntax error nothing is offered until the error is fixed.

## Develop

```bash
npm run build   # generates the parser from grammar/efx.grammar and writes the package to dist/
npm test        # the package, tree, conformance, style and completion tests, on the build
npm run demo    # serves a demo page at http://localhost:8080/demo/ (after npm run build)
npm run sync    # copies the words, the corpus, the ANTLR oracle and the completion list again
```

`npm run sync` reads the SDK and the toolkit from GitHub at the commits pinned in `package.json`, or pins new ones first: `npm run sync -- <owner>/<repository>@<commit> <owner>/<repository>@<commit>` (the SDK, then the toolkit). It needs Node 22.13 or later and network access; behind a proxy, set `NODE_USE_ENV_PROXY=1`. A `GITHUB_TOKEN`, when set, is sent to the GitHub API only. Build and test need neither network nor Java. The Check workflow builds, tests and syncs every push, and fails if a generated file differs from the committed one.

## Publishing

Only `dist/` is published. Pushing a tag that matches the version in `package.json` (for example `0.3.0`) runs the Publish workflow, which builds, tests and publishes the package to npm with provenance.

## License

[EUPL 2.0](LICENSE)
