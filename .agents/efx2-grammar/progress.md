# Progress: EFX highlighter and autocomplete for EFX-2

Single record of the work described in `plan.md`: one row per item with its commit, its numbers and the decisions taken, in Yannis's words where he decided. Updated with every item.

**Last updated:** 2026-11-02, by the implementing thread.
**Current phase:** 0. **Next item:** the gate 0 record, then Yannis's pass.

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
| P0.2 Sync, pins, generated files | done 2026-11-02 | 84c812d | Words: 73 function names, 90 keywords, 14 asset types, 7 label types, 5 format options. 161 completion items. 56 corpus files (52 view templates, 4 rules files, 2,909,413 bytes), byte-identical to the SDK. The oracle lexes the corpus into 631,306 tokens with no lexer error. A second sync gives identical files. Build and test green. First Check run on the fork green on Node 22.14.0 (run 41374373061: sync 4 s, generated files match) | `npm run sync` (`scripts/sync.js` and seven classes under `scripts/sync/`), pins in `package.json` `config`, the four generated parts, the workflow `check.yml`. `antlr-ng` 1.0.10 and `antlr4ng` 3.0.16 added as exact dev dependencies (the design thread's remark: a minor update must not change the generated files). The 73 function names are the toolkit's 72 completion functions plus `string`, which the lexer reads as `text`. Notes below |
| Gate 0 simplify pass | done 2026-11-02 | ccb321d | Generated files unchanged (sync at the recorded pins and at the short pins); sync 5.3 s to 3.7 s; build and test green | Four review angles (reuse, simplification, efficiency, altitude) over the hand-written code, with the design thread's three remarks. Details below |
| Gate 0 code-review pass | done 2026-11-02 | (this commit) | 10 findings, 4 fixed, 6 not taken; `words.js` changes in one comment line only; build and test green | Details below |

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

- **Sources.** The forks are read from GitHub at full commit hashes: the API resolves a short hash and lists the commit's files once (`git/trees`, recursive), so files in a subfolder of the corpus folders are not missed; the files come from raw.githubusercontent.com. `GITHUB_TOKEN` is sent to the API only, when it is set; the workflow sets it.
- **Generated grammar.** antlr-ng's JavaScript target writes code for the `antlr4` runtime, not for `antlr4ng`. The sync generates TypeScript, which targets `antlr4ng`, and removes the types with Node's `module.stripTypeScriptTypes` (Node 22.13 or later). The stripped lexer is byte-identical on Node 22.14.0 (the workflow's) and 22.23.4. antlr-ng 1.0.10 cannot be imported as a library (its entry exports a type as a value), so the sync runs its command line. The parser is generated in a temporary folder under `node_modules/.cache/` and not kept.
- **Words.** The candidates are the quoted words of `EfxLexer.g4`; each is lexed by the generated lexer in each mode, as the toolkit's `CatalogueCompletenessTest` finds a word's token by lexing it. Function names: the spellings of the tokens that can start `builtInFunction` (read from the parser's ATN). Keywords: every other word reserved in `DEFAULT_MODE`, `SKIP_WHITESPACE`, `TEMPLATE` or `EXPRESSION`, that is, lexed as a token other than `Identifier` or `FreeText`. Asset and label types: the words lexed as `AssetType` and `LabelType` in `LABEL`. Format options: the words lexed in `FORMAT`.
- **Proxy.** Node's `fetch` does not read `HTTPS_PROXY`; behind a proxy, run the sync with `NODE_USE_ENV_PROXY=1` (Node 22.21 or later), as was done here.

## Gate 0 simplify pass

Fixed:

- The four downloads (two grammars, the completion list, the corpus) run at once, and the two pins resolve at once; a pin already written as a full hash needs no call. Sync 5.3 s to 3.7 s here.
- The corpus lists the files under its folders at any depth, through one recursive listing of the commit (the design thread's remark 3), instead of the files directly in them; the same 56 files at the pin.
- `LexerWords` computes each set once (it had computed the function names four times) and lists the five sets in one place, used by `words.js` and by the sync's report. It takes the candidates from `AntlrGrammar.quotedWords()`, so the words always come from the grammar that was generated.
- `AntlrGrammar.oracleFiles(source)` gives `test/oracle/` as a map, as `Corpus.files()` gives `test/corpus/`; the oracle's header is no longer written in `sync.js`, and the lexer text is private.
- Comments: the work folder is under the repository so that the generated modules resolve `antlr4ng`, and in `node_modules/.cache` because git ignores it (remark 1); `LexerWords` no longer says it reads words the same way as the toolkit's test, only that it finds a word's token by lexing it.
- `CompletionList.toJSON` renamed `toFile`: JavaScript calls a method named `toJSON` from `JSON.stringify`. Its item is built in one place.
- `check.yml` caches the npm download.

Not taken: running antlr-ng without blocking (0.4 s, at the cost of a two-stage start); reading the pins through npm's `npm_package_config_*` (the sync would then need npm to run); the parser's ATN read through its `_ATN` static instead of a parser instance (an underscored member; the instance is the public way); `check.yml` on pushes to `main` only (the work branch has no pull request, and every commit is to be checked); `publish.yml` calling `check.yml` (publishing is phase 4).

For P1.2's design (from the altitude angle; each would change `words.js`, so none is taken here): a word's token by lexer mode, as a table, would let the Lezer grammar name the ANTLR keyword tokens (`If`, `Then`, `Else`) without typing their words, and make the conformance mapping the identity for them; the sets could overlap, with a set of type words from `primitiveType` (`text`, `date`, `duration`, ...), instead of `keywords` leaving out the function names; the hand-kept mode and plain-token lists in `LexerWords` could come from the lexer.

## Gate 0 code-review pass

Fixed:

- A lexer mode or parser rule the grammar does not have (a renamed `LABEL` mode, a renamed `builtInFunction`) now stops the sync with "The grammar has no lexer mode named ..." instead of writing empty sets or failing deep inside antlr4ng.
- The raw file URL encodes each path segment, so a path with `#`, `?` or `%` cannot be cut short.
- The `keywords` comment in `words.js` says what the rule does: words the lexer reads as a token of its own. `STAGE`, `SUMMARY`, `NAVIGATION` and `#include` are not there, being parts of longer tokens (`---- STAGE 1a ----`), which P2 ports as tokens.
- `GitHubCommit` says why it uses two routes: the API for the commit and its file list, the raw host for the bytes, which does not count against the API's limit (the design thread's suggestion).

Not taken: an `engines` field for the sync's Node 22.13 (it would bind the package's users, whom the sync does not concern; the requirement is above); a retry or a limit on the 56 parallel downloads (none failed here or in CI; to be added if CI shows one); `replaceFolder` emptying `test/oracle/` and `test/corpus/` (the sync owns both: P1.1's test goes elsewhere in `test/`); `not` and the other function names left out of `keywords` (the P1.2 design note above); `check.yml` running twice on a pull request branch (as in the simplify pass); one shared repository root for the three files that find theirs from `import.meta.url` (each is local to its concern).

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
