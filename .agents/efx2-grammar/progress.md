# Progress: EFX highlighter and autocomplete for EFX-2

Single record of the work described in `plan.md`: one row per item with its commit, its numbers and the decisions taken, in Yannis's words where he decided. Updated with every item.

**Last updated:** 2026-11-02, by the implementing thread.
**Current phase:** 0. **Next item:** P0.2, the sync.

Design docs, agreed before coding: phase 0, https://claude.ai/artifact/1WfNkkUYog1UT5iVMsq6aa (endorsed by the design thread; Yannis, 2026-11-02 01:02Z: "ok tell it it can start the work").

## Pins

| Source | Repository | Branch | Commit |
|---|---|---|---|
| Grammar and corpus | rousso/eForms-SDK | `feature/efx2-untyped-grammar` | efc9a2116e752e2eed79b8a7391749bd69da060b |
| Completion list | rousso/efx-toolkit-java | `feature/efx2-untyped-grammar` | 8675b8af21416f259fc7fa1a93b86f282b2abaa5 |

## Work items

| Item | Status | Commit | Numbers | Notes |
|---|---|---|---|---|
| P0.1 Branch, plan, progress, baseline | done 2026-11-02 | (this commit) | Build green with 10 generator warnings; test green | `feature/efx2-grammar` from `main` (c77c153, 0.2.1). `plan.md` is the project's copy, unchanged (SHA-256 `d39a156a…`). Baseline below |
| P0.2 Sync, pins, generated files | | | | |

## Decisions

| # | Decision | State |
|---|---|---|
| 1 | Lezer stays the parser; the ANTLR JavaScript lexer is a test oracle only | Proceeding on the recommendation, with Yannis's go-ahead for phase 0 (2026-11-02 01:02Z, "ok tell it it can start the work"); not answered on its own |
| 2 | The toolkit ships `sdk2-completions.json` in its jar | Open; P3.1, after the untyped-grammar merge |
| 3 | Scope: templates, rules files and single expressions | Open |
| 4 | Public surface and version | Open |
| 5 | Pins by git commit until the pre-releases are on Maven Central | Proceeding on the recommendation, as decision 1 |
| 6 | The work runs in a new implementing thread | Taken: Yannis forked the repository (2026-11-02 00:13Z); this thread started 00:15Z |

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
