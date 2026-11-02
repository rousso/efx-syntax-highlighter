# Progress: EFX highlighter and autocomplete for EFX-2

Single record of the work described in `plan.md`: one row per item with its commit, its numbers and the decisions taken, in Yannis's words where he decided. Updated with every item.

**Last updated:** 2026-11-02, by the implementing thread.
**Current phase:** 1. **Next item:** the phase 1 simplify pass.

Design docs, agreed before coding: phase 0, https://claude.ai/artifact/1WfNkkUYog1UT5iVMsq6aa (endorsed by the design thread; Yannis, 2026-11-02 01:02Z: "ok tell it it can start the work"); P1.1, https://claude.ai/artifact/7pHaXXZPeYoYAuBsMZbu5t (endorsed by the design thread with three remarks, all taken; Yannis, 2026-11-02 09:01Z: "ok go ahead"); P1.2, https://claude.ai/artifact/BoXwjmeNHTCFSSV8Uxrkrk (endorsed by the design thread, whose plan update is applied in the P1.2 commit; Yannis, 2026-11-02 09:33Z: "Agree, write it").

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
| Gate 0 code-review pass | done 2026-11-02 | 87f04a2 | 10 findings, 4 fixed, 6 not taken; `words.js` changes in one comment line only; build and test green | Details below |
| P1.1 Conformance test, baseline | done 2026-11-02 | 37c1942 | 0 of 56 files match; 274,723 of 464,118 tokens (59.2%); 18 of the 105 token kinds in the corpus fully matched. The first difference is at line 1 in every file: in the 52 templates the editor makes a line end after the opening comment line, which the lexer leaves out (`EmptyOrCommentLine`); the 4 rules files start with a stage header or `#include`, which the editor's grammar does not know. 3.8 s for the 56 files | `test/conformance.js` and four classes under `test/conformance/`; `npm test` runs it after the sample test. The design doc's trial gave 304,936 tokens (65.7%) and line 3 as the first difference: it counted only empty parse errors as tokens, and looked for the first difference on the lexer's side only. The test counts every parse error as a token where it starts, as the doc says, so the 30,213 tokens that start where the parser reports an error are not matched; and it reports the first difference on either side. Notes below |
| P1.2 Words from the lexer | done 2026-11-02 | (this commit) | 0 of 56 files; 288,185 of 464,118 tokens (62.1%, from 59.2%); 24 of the 105 kinds fully matched (from 18). Gains: As +3,485, Error +3,483, Assert +3,481, EndBlock +1,605, OtherAssetId +772, Template +153, CloseBracket +147, Has +75, No +75, Star +66, Scope +66, Comparison +49, Is +42, Not +38, VariablePrefix +31, In +18, OpenParenthesis +12, FieldId +2, Warning +2. Losses, all where the parser already reports errors: Comma −74, OpenBracket −34, When −15, With −11, Or −4, FOR −2. `keywords` 90 to 98. The sample still parses; its parse errors go from 106 to 117 (lines 78 and 79 had 7 each and have 13; line 43 has one fewer). Build with the baseline's 10 generator warnings | The three word lists are gone from `grammar/efx.grammar` (67 lines); `wordToken` in `src/efxWords.js` gives each word its kind. Sample highlighting: a fix, `or` at the start of `$orgid` and `$orgname` (line 8) is no longer read as a keyword, a defect of the typed list, which had no word boundary (Yannis, 09:26Z: "this is not a change. this is fixing a bug... correct?"); on the lines that already had parse errors (8, 41 to 43, 78, 79), 9 tokens are no longer shown as keywords and one `$orgname` loses its variable colour, as the design doc listed. The plan's design bullet, gate 1 and allowed-output row updated by the design thread's patch. Notes below |

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

## How the conformance test works (P1.1)

- **Match.** A token of the lexer is matched when the editor has a token of the name `TokenNames` gives, starting at the same position, and the next token starts at the same position on both sides. A file matches when every token of the lexer is matched and the editor has no other token.
- **Lexer side.** Every token on the default channel. Tokens on another channel are left out: in the corpus, `WS`, `Whitespace` (from `SkippedWhitespace`), `SkippedComment`, `EmptyOrCommentLine`, `EndOfLineComment` and `ExpressionComment`, 167,188 tokens. This is the only rule that leaves tokens of the lexer out.
- **Editor side.** The leaves of the tree without comments; the text between two leaves, when not blank, as a token with no name; each parse error as a token named ⚠ where it starts. Comments are left out on both sides, since the lexer keeps some inside another token (the comment after a template line's `;` is part of its `Semicolon`).
- **Positions.** In UTF-16 units on both sides: the lexer counts characters, so its positions are converted. The corpus is ASCII at the pin.
- **Table.** `test/conformance/TokenNames.js` has a row for each of the 105 kinds of token the lexer makes in the corpus: 6 with the same name, 85 with the editor's node of the same meaning, 14 with no node yet. A kind missing from the table fails the test.
- **Pins.** Files and tokens matched, at the top of `test/conformance.js`. A change in either direction fails the test, and the message gives the line to paste.

## P1.1 baseline by token kind

Fully matched (18): BtId, OutlineNumber, Let, Invoke, DayTimeDurationLiteral, Plus, Minus, IN, Like, Unique, Every, If, Then, Else, FOR, DistinctValuesFunction, StringLengthFunction, UnionFunction.

Not fully matched (87), unmatched of total: StartLabelBlock 18,508 of 18,508, Identifier 16,350 of 16,365, Semicolon 13,857 of 13,857, Tabs 13,208 of 13,208, Whitespace 13,070 of 13,070, FreeText 11,095 of 12,373, FieldId 10,207 of 49,096, CloseBracket 7,990 of 8,293, OpenBracket 7,548 of 8,293, VariablePrefix 7,272 of 7,819, EndBlock 7,238 of 25,272, StartExpressionBlock 6,764 of 6,764, Colon 6,297 of 6,297, Comma 4,215 of 31,006, Assert 3,485 of 3,485, As 3,485 of 3,485, RuleIdentifier 3,485 of 3,485, Error 3,483 of 3,483, StringLiteral 3,225 of 5,182, Text 2,539 of 2,539, Star 2,371 of 3,159, In 2,205 of 4,135, OpenParenthesis 2,197 of 13,978, PreferredLanguageText 1,871 of 1,871, Present 1,788 of 10,844, IntegerLiteral 1,561 of 22,402, CloseParenthesis 1,396 of 13,978, Otherwise 1,349 of 1,349, With 1,248 of 14,734, IsMasked 1,229 of 1,229, OtherAssetId 966 of 4,874, FunctionPrefix 858 of 858, Assignment 844 of 1,230, HashPrefix 694 of 694, When 610 of 2,316, NodeId 517 of 5,962, Slash 482 of 587, AtPrefix 482 of 483, RawValue 439 of 439, Comparison 318 of 5,144, CountFunction 265 of 1,008, Display 186 of 13,296, Template 153 of 153, For 145 of 360, Number 113 of 113, Or 107 of 6,754, Indicator 104 of 104, Pipe 104 of 19,210, Index 102 of 102, By 102 of 102, ShorthandFieldValueReferenceFromContextField 96 of 2,508, Return 89 of 360, Is 87 of 10,867, Not 83 of 1,928, CRLF 80 of 100, Has 75 of 75, No 75 of 75, Duplicates 75 of 75, Scope 66 of 66, Post 64 of 64, At 59 of 59, AssetType 52 of 9,485, LabelType 52 of 15,884, IntersectFunction 51 of 70, NavigationSectionHeader 51 of 51, SummarySectionHeader 51 of 51, ShorthandIndirectLabelReferenceFromContextField 43 of 821, True 24 of 986, Date 18 of 18, StageHeaderStart 8 of 8, StageIdentifier 8 of 8, StageHeaderEnd 8 of 8, YearMonthDurationLiteral 8 of 20, Time 8 of 8, SumFunction 8 of 43, Satisfies 5 of 291, And 5 of 786, Some 4 of 60, DecimalLiteral 4 of 26, StartsWithFunction 2 of 53, Warning 2 of 2, Percent 2 of 2, IncludeDirective 1 of 1, IncludePath 1 of 1, False 1 of 247, FormatNumberFunction 1 of 909, ConcatFunction 1 of 663.

Never in the corpus: 136 of the lexer's 241 token kinds, which the conformance test cannot prove anything about and the pinned trees of phase 2 have to cover: EmptyOrCommentLine, MixedIndent, Spaces, Endpoint, SkippedComment, LineJoining, NewLine, CharacterReference, ValueKeyword, StartSelectorBlock, StartHyperlinkBlock, EndOfLineComment, OtherEscapeSequence, FormatWhitespace, FormatDecimals, FormatShort, FormatMedium, FormatLong, FormatNoUnit, FormatNoFormatting, ASSET_TYPE_BT, ASSET_TYPE_FIELD, ASSET_TYPE_NODE, ASSET_TYPE_DISPLAY_GROUP, ASSET_TYPE_VIEW_TEMPLATE, ASSET_TYPE_NOTICE, ASSET_TYPE_AUXILIARY, ASSET_TYPE_RULE, ASSET_TYPE_EXPRESSION, ASSET_TYPE_INTERVAL, ASSET_TYPE_PATTERN, LABEL_TYPE_NAME, LABEL_TYPE_WHEN_TRUE, LABEL_TYPE_WHEN_FALSE, LABEL_TYPE_DESCRIPTION, LABEL_TYPE_TOOLTIP, LABEL_TYPE_TEMPLATE, ColonColon, OtherwiseAssert, OtherwiseReport, Empty, Distinct, Any, Always, Never, Info, Pre, Codelist, Code, Dynamic, Duration, Report, Compute, Select, ContextType, SubstringFunction, SubstringBeforeFunction, SubstringAfterFunction, ContainsFunction, EndsWithFunction, IndexOfSubstringFunction, MinFunction, MaxFunction, AverageFunction, AbsoluteFunction, RoundFunction, RoundDownFunction, RoundUpFunction, YearFunction, MonthFunction, DayFunction, HoursFunction, MinutesFunction, SecondsFunction, YearsFunction, MonthsFunction, DaysFunction, FormatShortFunction, FormatMediumFunction, FormatLongFunction, UpperCaseFunction, LowerCaseFunction, NormalizeSpaceFunction, TrimFunction, TrimLeftFunction, TrimRightFunction, PadLeftFunction, PadRightFunction, RepeatFunction, SplitFunction, ReplaceFunction, ReplaceRegexFunction, UrlEncodeFunction, CapitalizeFirstFunction, StringJoinFunction, CurrentDateFunction, CurrentTimeFunction, DayTimeDurationFunction, YearMonthDurationFunction, AddDuration, SubtractDuration, CountDuplicatesFunction, GetDuplicatesFunction, ExceptFunction, SequenceEqualFunction, SortFunction, ReverseFunction, SubsequenceFunction, IndexOfFunction, PreferredLanguageFunction, PreferredLanguageTextFunction, PublicationDate, JustificationCode, JustificationDescription, PrivacyCode, WasWithheld, IsWithheld, IsWithholdable, IsDisclosed, PreferredLanguage, Call, Api, On, Warn, Reject, FieldIdentifier, NodeIdentifier, UuidV4Literal, DateLiteral, TimeLiteral, Ellipsis, DotDot, Dot, ExpressionComment, WS, StringFunction.

## How the words reach the grammar (P1.2)

- **Specializer.** The grammar reads every word as `Identifier` and declares `wordToken` (`src/efxWords.js`) as Lezer's external specializer for it: `@external specialize`, not the plan's first wording `@external extend`, because `wordToken` gives a kind only where the parser can take it (`stack.canShift`), so no word is read two ways.
- **Order.** Label words (asset types, label types), then keywords, then function names; the first kind that has the word and that the parser can take. Label words before keywords as the old token precedence had them (in `#{auxiliary|text|buyer}`, `text` is a label type); keywords before function names so that `is not present` reads `not` as a keyword.
- **Keywords.** Every word the lexer reserves at the start of a line, in template text or in expressions, except the words the parser reads only as the name of a built-in function. The sync asks the generated parser which tokens it reads other than as the first token of `builtInFunction` (`AntlrGrammar.tokensReadBeyondStartOf`): of the function tokens, `Not`, `Empty`, `Text`, `Number`, `Indicator`, `Date` and `Time`. So `not`, `empty`, `text`, `string` (which the lexer reads as `Text`), `number`, `indicator`, `date` and `time` are in both `keywords` and `functionNames`.
- **Package contents.** The build copies `efxWords.js` and `generated/words.js` into `dist/`, where the parser loads them; the published package gains these two files. They are package contents, not exports: `efx()`, the exports and the version are unchanged, so decision 4 is untouched.
- **What stays until phase 2.** The words inside today's compound tokens: the line words (`LET`, `WITH`, `WHEN`, `OTHERWISE`, `DISPLAY`, `INVOKE`, `INDEX`, `BY`), the boolean words in the literal token, the type words in `text:` and `value` in `$value` and `#value`. Gate 1 reads "no word list lives in the grammar file" (plan, as updated).

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
| 0. Set up | 2026-11-02 | Sync reproducible: at 87f04a2 two syncs in a row leave every generated file as committed, as the Check workflow verifies on each push. Test still green; build green with the baseline's 10 generator warnings. No grammar change: `grammar/efx.grammar` and the rest of `src/` as at c77c153, only `src/generated/` added. Design thread accepted P0.1, P0.2 and the simplify pass. Passed by Yannis 2026-11-02 02:45Z ("Pass gate 0") | ba37bb3 |

## Baseline

Measured 2026-11-02 on c77c153, Node 22.23.4, npm 10.9.9, `@lezer/generator` 1.8.0 (from the lock file).

- `npm run build` succeeds and writes `dist/`. The generator prints 10 warnings: `templateLine` generates too many choices (128); 5 unused tokens (`LP`, `RP`, `Brace`, `Punctuation`, `Delimiter`); 4 precedence entries for unknown tokens (`Punctuation`, `LP`, `RP`, `Delimiter`).
- `npm test` passes: "Parse successful. Root node: templateFile". It parses `test/sample.efx` (100 lines) and checks the root node only.
- The package's entry point does not load. `src/index.js` re-exports `efxHighlightStyle`, which `src/efxTheme.js` does not export (it exports `efxHighlighting`, `efxColors`, `efxTheme`, `extensions`), and its imports have no `.js` suffix, so Node refuses them (`Cannot find module '.../dist/efxLanguage'`). The test loads only `dist/efx-parser.js` and does not see it. Left as it is: a change of the exports is P4.1 and decision 4.

## Open questions and findings

- The baseline entry-point defect above, for P4.1.
- For the phase 1 simplify pass (design thread, review of 37c1942): `EditorTokens.#error` does not move past an error node that has no children, so its text is counted again as a token with no name. The pins are not affected.
- For the phase 1 simplify pass: the repository tracks 100 files under `node_modules/`, from before this work (also on OP-TED `main`), although `.gitignore` ignores the folder. To be untracked in a commit of their own (Yannis, 2026-11-02 09:22Z, to the design thread's suggestion that they are removed from tracking: "i agree").
