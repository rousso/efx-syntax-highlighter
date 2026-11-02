# Progress: EFX highlighter and autocomplete for EFX-2

Single record of the work described in `plan.md`: one row per item with its commit, its numbers and the decisions taken, in Yannis's words where he decided. Updated with every item.

**Last updated:** 2026-11-02, by the implementing thread.
**Current phase:** 0. **Next item:** gate 0: the simplify and code-review passes over the phase's commits, then the gate record.

Design docs, agreed before coding: phase 0, https://claude.ai/artifact/1WfNkkUYog1UT5iVMsq6aa (endorsed by the design thread; Yannis, 2026-11-02 01:02Z: "ok tell it it can start the work").

## Pins

| Source | Repository | Branch | Commit |
|---|---|---|---|
| Grammar and corpus | rousso/eForms-SDK | `feature/efx2-untyped-grammar` | efc9a2116e752e2eed79b8a7391749bd69da060b |
| Completion list | rousso/efx-toolkit-java | `feature/efx2-untyped-grammar` | 8675b8af21416f259fc7fa1a93b86f282b2abaa5 |

## Work items

| Item | Status | Commit | Numbers | Notes |
|---|---|---|---|---|
| P0.1 Branch, plan, progress, baseline | done 2026-11-02 | 9afa567 | Build green with 10 generator warnings; test green | `feature/efx2-grammar` from `main` (c77c153, 0.2.1). `plan.md` is the project's copy, unchanged (SHA-256 `d39a156a…`). Baseline below |
| P0.2 Sync, pins, generated files | done 2026-11-02 | (this commit) | Words: 73 function names, 90 keywords, 14 asset types, 7 label types, 5 format options. 161 completion items. 56 corpus files (52 view templates, 4 rules files, 2,909,413 bytes), byte-identical to the SDK. The oracle lexes the corpus into 631,306 tokens with no lexer error. A second sync gives identical files. Build and test green | `npm run sync` (`scripts/sync.js` and seven classes under `scripts/sync/`), pins in `package.json` `config`, the four generated parts, the workflow `check.yml`. `antlr-ng` 1.0.10 and `antlr4ng` 3.0.16 added as exact dev dependencies (the design thread's remark: a minor update must not change the generated files). The 73 function names are the toolkit's 72 completion functions plus `string`, which the lexer reads as `text`. Notes below |

## Decisions

| # | Decision | State |
|---|---|---|
| 1 | Lezer stays the parser; the ANTLR JavaScript lexer is a test oracle only | Proceeding on the recommendation, with Yannis's go-ahead for phase 0 (2026-11-02 01:02Z, "ok tell it it can start the work"); not answered on its own |
| 2 | The toolkit ships `sdk2-completions.json` in its jar | Open; P3.1, after the untyped-grammar merge |
| 3 | Scope: templates, rules files and single expressions | Open |
| 4 | Public surface and version | Open |
| 5 | Pins by git commit until the pre-releases are on Maven Central | Proceeding on the recommendation, as decision 1 |
| 6 | The work runs in a new implementing thread | Taken: Yannis forked the repository (2026-11-02 00:13Z); this thread started 00:15Z |

## How the sync works (P0.2)

- **Sources.** The forks are read from GitHub at full commit hashes: the API lists the two corpus folders and resolves a short hash; the files come from raw.githubusercontent.com. `GITHUB_TOKEN` is sent to the API only, when it is set; the workflow sets it.
- **Generated grammar.** antlr-ng's JavaScript target writes code for the `antlr4` runtime, not for `antlr4ng`. The sync generates TypeScript, which targets `antlr4ng`, and removes the types with Node's `module.stripTypeScriptTypes` (Node 22.13 or later). The stripped lexer is byte-identical on Node 22.14.0 (the workflow's) and 22.23.4. antlr-ng 1.0.10 cannot be imported as a library (its entry exports a type as a value), so the sync runs its command line. The parser is generated in a temporary folder under `node_modules/.cache/` and not kept.
- **Words.** The candidates are the quoted words of `EfxLexer.g4`; each is lexed by the generated lexer in each mode, as the toolkit's `CatalogueCompletenessTest` does. Function names: the spellings of the tokens that can start `builtInFunction` (read from the parser's ATN). Keywords: every other word reserved in `DEFAULT_MODE`, `SKIP_WHITESPACE`, `TEMPLATE` or `EXPRESSION`, that is, lexed as a token other than `Identifier` or `FreeText`. Asset and label types: the words lexed as `AssetType` and `LabelType` in `LABEL`. Format options: the words lexed in `FORMAT`.
- **Proxy.** Node's `fetch` does not read `HTTPS_PROXY`; behind a proxy, run the sync with `NODE_USE_ENV_PROXY=1` (Node 22.21 or later), as was done here.

## Gate results

| Gate | Date | Numbers | Commit |
|---|---|---|---|

## Baseline

Measured 2026-11-02 on c77c153, Node 22.23.4, npm 10.9.9, `@lezer/generator` 1.8.0 (from the lock file).

- `npm run build` succeeds and writes `dist/`. The generator prints 10 warnings: `templateLine` generates too many choices (128); 5 unused tokens (`LP`, `RP`, `Brace`, `Punctuation`, `Delimiter`); 4 precedence entries for unknown tokens (`Punctuation`, `LP`, `RP`, `Delimiter`).
- `npm test` passes: "Parse successful. Root node: templateFile". It parses `test/sample.efx` (100 lines) and checks the root node only.
- The package's entry point does not load. `src/index.js` re-exports `efxHighlightStyle`, which `src/efxTheme.js` does not export (it exports `efxHighlighting`, `efxColors`, `efxTheme`, `extensions`), and its imports have no `.js` suffix, so Node refuses them (`Cannot find module '.../dist/efxLanguage'`). The test loads only `dist/efx-parser.js` and does not see it. Left as it is: a change of the exports is P4.1 and decision 4.

## Open questions and findings

- The baseline entry-point defect above, for P4.1.
