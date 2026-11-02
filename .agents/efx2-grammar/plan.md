# Plan: bring the EFX syntax highlighter and the editor autocomplete up to date with the EFX-2 untyped grammar

Design doc: https://claude.ai/artifact/CmT8jTYRWw5uRPBVfcAeud (the reasoning; this file is the binding copy, kept in the repository as `.agents/efx2-grammar/plan.md` beside `progress.md`).

## Goal

1. **Same language.** The Lezer grammar of `@op-ted/efx-syntax-highlighter` parses the language of `efx-grammar/Efx.g4` and `EfxLexer.g4` as they stand on the untyped-grammar branch: view templates, rules files and single expressions. Keyword and function lists are generated from the lexer, never typed in again.
2. **Same completions.** The CodeMirror editor offers the toolkit's completion list (`EfxAutocomplete.getEfxCompletions`, 161 items: 140 functions, 9 keywords, 12 properties) with parameter placeholders, plus the field and node ids the host application loads.
3. **Proof.** A conformance test tokenizes the SDK's 52 view templates and 4 rules files with the real ANTLR lexer (generated for JavaScript) and with the Lezer parser and compares the token streams. Alignment is measured on every commit.

## Sources, pinned

- Grammar: rousso/eForms-SDK, branch `feature/efx2-untyped-grammar`, commit efc9a21 (`efx-grammar/Efx.g4`, `EfxLexer.g4`, `view-templates/*.efx`, `validation/*.efx`).
- Completions: rousso/efx-toolkit-java, branch `feature/efx2-untyped-grammar`, commit 8675b8a (`src/test/resources/eu/europa/ted/efx/autocomplete/sdk2-completions.txt`; later the JSON resource the toolkit will ship, see decision 2).
- Pins are git commits of the forks until the SDK and toolkit pre-releases are on Maven Central (decision 5); then Maven versions.

## Rules of engagement

1. Work only in rousso/efx-syntax-highlighter on the branch `feature/efx2-grammar`, off `main`. OP-TED/efx-syntax-highlighter is never touched. No pull request, publish or merge without Yannis's word in the implementing thread.
2. One commit per item, pushed history never rewritten. Commits are authored and committed as Ioannis Rousochatzakis (the environment sets the identity), with no model name and no `Co-Authored-By` or `Claude-Session` trailer: Yannis's standing rule since the re-authoring of the untyped-grammar branches.
3. Each item is designed in a short Claude Doc agreed by Yannis before coding; the design thread ("Move EFX-2 type checking into transpiler") reviews each landed commit. Decisions are Yannis's, taken in the implementing thread or relayed from the design thread with his message attached.
4. The highlighter follows the grammar, never the reverse. A gap or accident found in `Efx.g4` or `EfxLexer.g4` is reported to Yannis and listed under "Parked", never papered over in the Lezer grammar.
5. Output is sacred. `test/sample.efx` and the corpus must keep parsing. A divergence from the ANTLR token stream that this plan does not list stops the item and goes to Yannis.
6. Stop and ask (rule 7 of the untyped-grammar work): any change to the package's public surface (exports, the `efx()` signature, the package version), any change in the toolkit or the SDK, any dependency added beyond `@codemirror/autocomplete`, `antlr-ng` and `antlr4ng`.
7. `progress.md` is the record: one row per item with the commit, the numbers, the decisions and their reasons, in Yannis's words where he decided.
8. Every phase ends with a simplify pass and a code-review pass over the phase's commits, then a gate record, then Yannis's pass.

## Design, in short

- `grammar/efx.grammar` is rewritten as a translation of `Efx.g4`, rule for rule and in the same order, same rule names (capitalised where the editor needs a tree node). `Expression` is one left-recursive rule with `@precedence` markers mirroring the ANTLR alternative order; each labelled alternative is a node of that name. Lexer modes become parse state: one external tokenizer finds the lexer's mode from the tokens the parser can take there, and hides whitespace and comments, and reads words, as that mode does. Where those tokens do not tell the mode, a context tracker (`@context`, since P2.3) keeps it from the tokens just read: the start of a line after a `;`, a line end, a stage header, a section header or an include, where the lexer has left EXPRESSION mode although the parser could take more of a rule; and the end of a template, where the lexer is still in TEMPLATE mode. An include directive is read only at the start of a line, as the lexer reads it only in DEFAULT mode. The grammar has one skip set (`space`, `Comment`), and the tokenizer makes those two tokens only where the mode hides them, so whitespace stays significant in template text; a scoped `@skip` cannot follow the lexer, since a template line changes mode inside one rule and Lezer allows one skip set per parse state. Label blocks skip nothing (`@skip {}`), as LABEL mode does. The tokenizer (`src/lexer/`, one class per mode) gives a reserved word the lexer's token only where the parser can take it (`stack.canShift`), so no word is read two ways (P1.2 used an external specializer on `Identifier`; P2.1 replaced it, since a specializer's answer is shared by the two readings the parser keeps at the colon after a field). Three `@top` rules: `TemplateFile`, `RulesFile`, `SingleExpression`. Lines stay flat with their indentation token, as in ANTLR; nesting is not in either grammar.
- Generated parts, written by `npm run sync -- <sdk pin> <toolkit pin>` and committed: `src/generated/words.js` (keywords, asset types and label types, as sets, and the token of each word the lexer reserves at a line start, in template text, in format options and in an expression, as tables, with the two-word phrases it reads as one token (`OTHERWISE DISPLAY`, `OTHERWISE ASSERT`) found by lexing them; the grammar reads them through `src/lexer/`), `test/corpus/` (52 templates, 4 rules files), `test/oracle/` (`EfxLexer.g4` and `Efx.g4`, and the lexer and parser `antlr-ng` generates from them; dev dependency only), `src/generated/sdk2-completions.json` (161 items: label, kind, dataType, parameters with name, dataType, optional, variadic). Build and test need no network and no Java.
- Autocomplete: `@codemirror/autocomplete` source attached with `efxLanguage.data.of({autocomplete})`, deciding from the tree node under the cursor: expression (functions as snippets, expression keywords, variables in scope from the tree, field and node ids), `:` properties, label block (asset types, label types, asset ids), `|` format options, line start keywords. Field and node ids come through an `efxSymbols.of({fields, nodes})` extension. Type-aware filtering is out of scope.

## Phases and gates

| Phase | Items | Gate |
| --- | --- | --- |
| 0. Set up | P0.1 Branch `feature/efx2-grammar`; this plan and `progress.md` under `.agents/efx2-grammar/`; baseline: the package builds and its test passes at c77c153. P0.2 The sync script, the pins, the four generated files committed. | Gate 0: sync reproducible, test still green, no grammar change yet. |
| 1. Measure | P1.1 The conformance test against the grammar as it is, the baseline number recorded (expected 0 of 56). P1.2 The generated words wired into the existing grammar through an external specializer on `Identifier` (`stack.canShift` decides where a word is a keyword; a contextual tokenizer since P2.1), the three typed lists removed. | Gate 1: the sample parses; the baseline is recorded; no word list lives in the grammar file (the words inside today's compound tokens, the line words, the boolean words, the `type:` words and `value`, go with the rule-for-rule port of phase 2). |
| 2. Align | P2.1 Expressions: `Expression`, literals, references, function calls, iterators, lists; top `SingleExpression`; a pinned tree per alternative. P2.2 Templates: template lines, template text with its blocks, labels and format options, declarations, callable templates, includes, navigation and summary sections; top `TemplateFile`. P2.3 Rules files: stages, rule sets, endpoints, dynamic functions; top `RulesFile`. P2.4 Highlight tags mapped onto the new node names, theme unchanged, the sample's highlighting pinned as a style dump. | Gate 2: 56 of 56 corpus files match the ANTLR tokens; every divergence found on hand-written inputs is listed in this plan with its cause; exports unchanged, the two new languages added. |
| 3. Complete | P3.1 Toolkit: `sdk2-completions.json` shipped in the jar, pinned by the existing test (one commit in the toolkit fork, after the untyped-grammar merge and decision 2). P3.2 The completion source, `efxSymbols`, one test per cursor context, whole-list coverage test. P3.3 A demo page in the repository, not published. | Gate 3: every item of the list is offered somewhere; the context tests pass; the demo shows highlighting and completion on the sample. |
| 4. Release | P4.1 README corrected (`efxHighlightStyle` is named there but never exported), CHANGELOG, version bump (decision 4). P4.2 Yannis reviews, merges into the fork, opens the upstream pull request, publishes by tag. | Gate 4: the published package installs and works in a CodeMirror 6 page. |

## Tests

- **Conformance.** For each corpus file, the token stream of the generated ANTLR lexer (type name and text, hidden channel dropped) is compared with the leaves of the Lezer tree, read with the top of the file's kind (`TemplateFile`, `RulesFile`), through a mapping table from ANTLR token names to Lezer node names kept in the test. A difference prints the file, the line and both tokens.
- **Pinned trees.** One EFX snippet per grammar rule and per labelled alternative with its expected tree, written `Node(Child Child)`; a snippet is an expression, a single expression, a whole template file or a whole rules file, read with its top; plus the common mistakes (`[1]` without `at`, a missing `;`, an unclosed `${`). An entry marked as a mistake is wrong EFX: it pins the editor's tree and checks that both parsers report an error (their recovery trees differ, so ANTLR's is not compared). The test (`test/trees.js`) checks each tree against the editor's parser and against the ANTLR parser in `test/oracle/`, whose nodes it names by the editor's rule; an entry marked with a divergence below pins the editor's tree and checks that ANTLR's still differs.
- **Style dump.** The sample file as a pinned list of (text, style tag) pairs.
- **Completions.** One test per cursor context and the whole-list coverage test.
- **Sync drift.** A CI job re-runs the sync at the pins and fails on any difference in the committed files.

## Divergences

Where the editor's tree or tokens differ from ANTLR's on hand-written inputs, with the cause and the item that closes each. The tree test pins one entry per case. None occurs in the corpus.

- **Whitespace the lexer requires** (P2.2; stays until the grammar decides, see Parked). The editor accepts `{ND-Root}a` and `WITH ND-Root DISPLAY${1};`, which ANTLR rejects: after a context or `DISPLAY` the lexer wants a blank before the template, and the block openers `${`, `#{` and `@{` are Lezer's own tokens, read without the mode. A lexer accident too: SKIP_WHITESPACE mode says it watches for the start of an expression when no blank follows, but watches only for `{`, `LET` and `WITH`.
- **Whitespace the lexer rejects** (P2.2; stays until the grammar decides). The editor accepts whitespace ANTLR rejects where the parse state does not tell the lexer's mode from a place that skips all whitespace: every run of whitespace after an outline number (`1 ⏎ {ND-Root} a`; the lexer skips one), a line end or a comment inside format options, a line end after a single expression (blanks before one fail in both parsers since P2.3), and a line end right after `OTHERWISE DISPLAY` in a line with `WHEN`.
- **`$value` in a label block** (P2.2; stays until the grammar decides). `Efx.g4` allows `$value` wherever an expression block is, but the lexer reads it only in template text, so `#{$value}` fails in ANTLR and parses in the editor, where `$value` is a token of the grammar. A grammar accident too.
- **Rule ids and scope annotations in expressions** (P2.3; stays until the grammar decides). The editor accepts `R-AAA-001 == 1` and `BT-1-Lot/@PRE == 1`, which ANTLR rejects: the lexer reads a rule id, `@PRE` and `@POST` as their tokens anywhere in EXPRESSION mode, where only a rule's `AS` and `SCOPE` clauses take them, while the editor reads them as those tokens only there and elsewhere as a field name and an attribute. A lexer accident too.

Closed:

- **The slash** (P2.1, closed by P2.3). `2 * 3 / 4` grouped as `2 * (3 / 4)`, where ANTLR groups `(2 * 3) / 4`: the editor decided at the `/` with one token of lookahead, and `/` may start an attribute (`/@name`). The tokenizer now reads a `/` that `@` follows, with only whitespace and comments between, as a token of its own named `Slash`, so `2 * 3 / 4` gives ANTLR's tree; same tokens and colours. It waited for P2.3 because, until the rules files parsed, Lezer wrote a broken node into the tree of `rules.efx` with it.
- **Reserved words as field names** (P2.1, closed by P2.2). Where `Efx.g4` lets a bare `Identifier` name a field (after `::`, after `in` in a context iterator), the editor read a reserved word as a field name while the lexer reads the word's own token. With the modes as parse state a reserved word becomes its token wherever the parser could take that token or a name, as the lexer reads it: `$x::count`, `ND-Lot::text` and `for context:$c in count return 1` fail in both parsers, pinned as mistakes.
- **Line ends and comments in expressions** (P2.1, closed by P2.2). In an expression the lexer hides a line end or a `//` comment (EXPRESSION mode); the editor's old template rules read line ends as the end of a line. The tokenizer now hides them as the lexer does: `1 +⏎2` and `1 // one⏎` give ANTLR's tree.

## Decisions (Yannis; one at a time; state as of 2026-11-02 00:15Z)

1. Lezer stays the parser; the ANTLR JavaScript lexer is a test oracle only. Recommended yes. PUT TO YANNIS 00:11Z, awaiting his answer.
2. The toolkit ships `sdk2-completions.json` in its jar. Recommended yes, after the untyped-grammar merge. Open.
3. Scope: templates, rules files and single expressions. Recommended all three. Open.
4. Public surface and version: `efx()` and `efxLanguage` unchanged; `efxRules()`, `efxExpression()`, `efxSymbols` added; `efxHighlightStyle` as an alias of `efxColors`; version 0.3.0. Open.
5. Pins by git commit until the pre-releases are on Maven Central. Recommended yes. Open.
6. The work runs in a new implementing thread while the untyped-grammar pull requests are under review; P3.1 waits for the merge. Yannis forked the repository 2026-11-02 00:13Z.

Until a decision is taken, the implementer proceeds on the recommendation where an item cannot wait (P0.2 needs 1 and 5) and records that in `progress.md`; a reversal is a new item.

## Allowed output changes

| Item | What changes | Why |
| --- | --- | --- |
| P1.2 | `test/sample.efx` still parses; its style dump may change for words newly known (`at`, functions); on the lines that already have parse errors (8, 41-43, 78, 79) tokens may stop being keywords and the error count may change; `or` at the start of a longer word (`$orgid`, `$orgname`) stops being a keyword | the generated words replace the typed lists; a keyword is recognised only where the parser can take one; the typed lists had no word boundary (a defect of the old grammar) |
| P2.x | Lezer node names change throughout; the style dump is re-pinned once at P2.4 with Yannis's look at the demo | the grammar is rewritten rule for rule |
| P2.1 | Expressions lose their colours until P2.4 maps the new node names (692 of the sample's 11,343 characters change); the conformance pins are kept per corpus folder, and the rules files' number falls until P2.3 | the expression rules are ported before the theme follows them (Yannis, 2026-11-02 13:01Z, "Start P2.1" on the design as written) |
| P2.2 | `test/sample.efx` parses with no error (10 at P2.1, 117 at phase 1); template lines lose their colours until P2.4 maps the new node names (2,198 of the sample's 11,343 characters change against phase 1; 692 at P2.1); the conformance pins rise to 52 of 52 view templates and 348,107 of 348,107 tokens, and the rules files' to 43,842 until P2.3; the tree test adds whole template files and the mistake entries; `@lezer/lr` goes from 1.4.2 to 1.4.12 in the lock file only | the template rules are ported before the theme follows them; with 1.4.2 Lezer writes broken nodes into the tree of `rules.efx`, which does not parse until P2.3, and the conformance test crashes (progress, findings) |
| P2.3 | Rules files parse with the top `RulesFile`; the conformance test reads each corpus folder with its top, and the rules files' pins rise to 3 of 4 files and 116,006 of 116,011 tokens (the 5 left are inside the errors at the two later includes of `rules.efx`, which ANTLR has too); the tree test adds whole rules files; `2 * 3 / 4` groups as in ANTLR; blanks before a single expression become an error, as in ANTLR; the sample, its colours and the trees of the view templates do not change | the rules-file rules are ported, and the slash divergence closes (Yannis, 2026-11-02 20:22Z, "Start P2.3" on the design as written) |

Anything else is a stop.

## Parked (no decision taken)

- Lexer and grammar accidents, where the editor follows the grammar and both parsers reject the text, or (the open divergences above) the editor is the lenient one; each case listed here for the grammar, after the merge:
  - `display whenever`: after a blank in template text a word starting with `when`, `otherwise` or `invoke` is read as that keyword (`when` + `ever`);
  - the word `value` alone in template text (`a value b`) is a token no rule takes;
  - the label type shorthand `#name`: the lexer reads it in template text, no rule takes it;
  - a template file whose last line has no line end fails (the EFX-1 line requires one);
  - a blank inside a label block (`#{ field|name|BT-1-Lot}`) fails: LABEL mode hides nothing;
  - `let` inside a label block: the rules allow an expression block written with `let`, the lexer never reads it there;
  - the optional `DISPLAY` of `otherwiseDisplayTemplate` is never used: the lexer reads `OTHERWISE DISPLAY` as one token;
  - an include after a rule set that does not end with `;` fails: the lexer is still in EXPRESSION mode, where `#` is a `HashPrefix` (`rules.efx` has two, at lines 15778 and 17176; the toolkit replaces includes before it parses);
  - a rules-file line indented after a `;` fails: the lexer reads the indentation as `Tabs` or `Spaces`, which no rule of a rules file takes;
  - a comment between `OTHERWISE` and `ASSERT` or `REPORT` fails: the lexer reads the two words as one token only with whitespace between, and otherwise reads `OTHERWISE` as a template's and the rest as template text;
  - a rule id with more than three characters after its second hyphen (`R-AAA-0011`) fails: the lexer reads it as a name (`Identifier`), which `AS` does not take;
  - whitespace the lexer requires or rejects, `$value` in a label block, and rule ids and scope annotations in expressions (Divergences).
- Diagnostics in the editor (the type checker is Java); type-aware completion; folding and indentation services; EFX-1 function names dropped with the generated words (the EFX-1 template line stays, since `Efx.g4` keeps it); which host application adopts the package and how it loads `fields.json`; TextMate grammars for other editors.
