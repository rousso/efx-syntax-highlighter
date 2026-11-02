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

- `grammar/efx.grammar` is rewritten as a translation of `Efx.g4`, rule for rule and in the same order, same rule names (capitalised where the editor needs a tree node). `Expression` is one left-recursive rule with `@precedence` markers mirroring the ANTLR alternative order; each labelled alternative is a node of that name. Lexer modes become parser-state tokenizing; whitespace is kept inside `template` with a scoped `@skip {} { ... }`. Words that are keywords only in places use `@extend`. Three `@top` rules: `TemplateFile`, `RulesFile`, `SingleExpression`. Lines stay flat with their indentation token, as in ANTLR; nesting is not in either grammar.
- Generated parts, written by `npm run sync -- <sdk pin> <toolkit pin>` and committed: `src/generated/words.js` (function names, keywords, asset types, label types, format options, as sets; the grammar reads them through `@external extend`), `test/corpus/` (52 templates, 4 rules files), `test/oracle/` (`EfxLexer.g4` generated for JavaScript with `antlr-ng`; dev dependency only), `src/generated/sdk2-completions.json` (161 items: label, kind, dataType, parameters with name, dataType, optional, variadic). Build and test need no network and no Java.
- Autocomplete: `@codemirror/autocomplete` source attached with `efxLanguage.data.of({autocomplete})`, deciding from the tree node under the cursor: expression (functions as snippets, expression keywords, variables in scope from the tree, field and node ids), `:` properties, label block (asset types, label types, asset ids), `|` format options, line start keywords. Field and node ids come through an `efxSymbols.of({fields, nodes})` extension. Type-aware filtering is out of scope.

## Phases and gates

| Phase | Items | Gate |
| --- | --- | --- |
| 0. Set up | P0.1 Branch `feature/efx2-grammar`; this plan and `progress.md` under `.agents/efx2-grammar/`; baseline: the package builds and its test passes at c77c153. P0.2 The sync script, the pins, the four generated files committed. | Gate 0: sync reproducible, test still green, no grammar change yet. |
| 1. Measure | P1.1 The conformance test against the grammar as it is, the baseline number recorded (expected 0 of 56). P1.2 The generated words wired into the existing grammar through `@external extend`, the three typed lists removed. | Gate 1: the sample parses; the baseline is recorded; no word lives in the grammar file. |
| 2. Align | P2.1 Expressions: `Expression`, literals, references, function calls, iterators, lists; top `SingleExpression`; a pinned tree per alternative. P2.2 Templates: template lines, template text with its blocks, labels and format options, declarations, callable templates, includes, navigation and summary sections; top `TemplateFile`. P2.3 Rules files: stages, rule sets, endpoints, dynamic functions; top `RulesFile`. P2.4 Highlight tags mapped onto the new node names, theme unchanged, the sample's highlighting pinned as a style dump. | Gate 2: 56 of 56 corpus files match the ANTLR tokens; every divergence found on hand-written inputs is listed in this plan with its cause; exports unchanged, the two new languages added. |
| 3. Complete | P3.1 Toolkit: `sdk2-completions.json` shipped in the jar, pinned by the existing test (one commit in the toolkit fork, after the untyped-grammar merge and decision 2). P3.2 The completion source, `efxSymbols`, one test per cursor context, whole-list coverage test. P3.3 A demo page in the repository, not published. | Gate 3: every item of the list is offered somewhere; the context tests pass; the demo shows highlighting and completion on the sample. |
| 4. Release | P4.1 README corrected (`efxHighlightStyle` is named there but never exported), CHANGELOG, version bump (decision 4). P4.2 Yannis reviews, merges into the fork, opens the upstream pull request, publishes by tag. | Gate 4: the published package installs and works in a CodeMirror 6 page. |

## Tests

- **Conformance.** For each corpus file, the token stream of the generated ANTLR lexer (type name and text, hidden channel dropped) is compared with the leaves of the Lezer tree through a mapping table from ANTLR token names to Lezer node names kept in the test. A difference prints the file, the line and both tokens.
- **Pinned trees.** One EFX snippet per grammar rule with its expected tree in Lezer's test format, plus the common mistakes (`[1]` without `at`, a missing `;`, an unclosed `${`).
- **Style dump.** The sample file as a pinned list of (text, style tag) pairs.
- **Completions.** One test per cursor context and the whole-list coverage test.
- **Sync drift.** A CI job re-runs the sync at the pins and fails on any difference in the committed files.

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
| P1.2 | `test/sample.efx` still parses; its style dump may change for words newly known (`at`, functions) | the generated words replace the typed lists |
| P2.x | Lezer node names change throughout; the style dump is re-pinned once at P2.4 with Yannis's look at the demo | the grammar is rewritten rule for rule |

Anything else is a stop.

## Parked (no decision taken)

- Lexer accidents found by the conformance test, such as `display whenever` read as `when` + `ever`: the Lezer grammar follows ANTLR; each case listed here for the grammar, after the merge.
- Diagnostics in the editor (the type checker is Java); type-aware completion; folding and indentation services; EFX-1 function names dropped with the generated words (the EFX-1 template line stays, since `Efx.g4` keeps it); which host application adopts the package and how it loads `fields.json`; TextMate grammars for other editors.
