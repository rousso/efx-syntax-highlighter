# EFX Syntax Highlighter 0.3.0 Release Notes

_The EFX Syntax Highlighter gives [CodeMirror 6](https://codemirror.net/) editors syntax highlighting and completions for [EFX](https://docs.ted.europa.eu/eforms/latest/efx), the expression and template language of the eForms SDK._

---

## In this release

This release brings the highlighter to EFX-2, the language of the eForms SDK 2, and adds completions. It changes how an application sets up its editor: see "Changes for applications" below.

### EFX-2 language support

- The grammar is rewritten as a translation of the SDK's ANTLR grammar (`efx-grammar/Efx.g4` and `EfxLexer.g4`), rule for rule, at the SDK commit pinned in `package.json`.
- It reads the three kinds of EFX text, each from a top of its own: template files, rules files and single expressions.
- The words the lexer reserves are generated from the SDK's lexer by `npm run sync`, no longer typed into the grammar.
- A conformance test compares the editor's tokens with those of the ANTLR lexer, generated for JavaScript, over the SDK's view templates and rules files. They are equal in 52 of 52 view templates and 3 of 4 rules files. The fourth, `rules.efx`, has two `#include` lines that the ANTLR grammar rejects too.

### Completions

- The editor offers, at the cursor, the words the grammar can take there, described by the EFX Toolkit's completion list (161 items): the functions as calls with their required parameters and their signatures, the keywords, the field properties after a colon, the asset and label types in a label block, the format options, and the words of template lines and rules.
- It offers the variables the cursor can use, and the field and node ids an application gives through the new export `efxSymbols`, where the grammar takes one.
- In template text the list opens only when asked for (Ctrl-Space). Nothing is offered inside a comment or a string.

### Changes for applications

These changes break the setup of 0.2.1:

- `efx(kind)` takes the kind of text its editor holds: `'template'`, `'rules'` or `'expression'`. `efx()` without a kind, or with any other, is refused with a `RangeError`.
- `efxLanguage` is no longer exported. `efx(kind).language` is the language of a kind.
- `efx(kind)` gives the editor the EFX colours as its default colours, so `efxHighlightStyle` no longer needs to be added; an application's own `syntaxHighlighting(...)` replaces them. `efxHighlightStyle`, which the README of 0.2.1 named, now exists: it is the EFX colours.
- `efxTheme`, a light look for the editor, is exported for applications that want it.
- `@codemirror/autocomplete` is a new dependency. The application turns completion on with its `autocompletion()`.

### Colours

The colours follow the new grammar's nodes; the palette is unchanged. Against 0.2.1:

- string literals show in the literal colour, as the theme intended;
- the `$` and `#` of `${` and `#{` are no longer bold;
- `$value` and `#value` show as variables, and `name` in `#{name}` as a label type.

### Fixes

- The package's entry point loads. 0.2.1 re-exported an `efxHighlightStyle` that did not exist and imported its modules without their `.js` suffix.
- `efx()` works in an editor. 0.2.1 gave CodeMirror the highlight tags as an extension, which CodeMirror refused.

### Known limits

- After the label shorthand `#{name|` no field ids are offered.
- After a `/` the `@` of an attribute is not offered.
- After a syntax error nothing is offered until the error is fixed.
