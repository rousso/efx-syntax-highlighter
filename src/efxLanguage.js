// CodeMirror 6 language support for EFX. The grammar reads three kinds of EFX text, each from a top
// of its own; an editor holds one kind, so there is one language per kind. The parser carries the
// highlight tags (efxHighlighting.js); the EFX colours are the editor's default colours. The
// language offers its completions (completion/EfxCompletions.js) to the editor's autocompletion,
// which the application turns on.
import { LRLanguage, LanguageSupport, syntaxHighlighting } from "@codemirror/language";
import { EfxCompletions } from "./completion/EfxCompletions.js";
import { parser } from "./efx-parser.js";
import { efxHighlightStyle } from "./efxTheme.js";

// The top of the grammar that reads each kind of EFX text.
const TOPS = { template: "TemplateFile", rules: "RulesFile", expression: "SingleExpression" };

const LANGUAGES = new Map(Object.entries(TOPS).map(([kind, top]) =>
  [kind, LRLanguage.define({ name: "efx", parser: parser.configure({ top }) })]));

// The EFX colours, used where the application gives the editor no colours of its own.
const DEFAULT_COLOURS = syntaxHighlighting(efxHighlightStyle, { fallback: true });

/** EFX support for an editor that holds one kind of EFX text: "template", "rules" or "expression". */
export function efx(kind) {
  const language = LANGUAGES.get(kind);
  if (language === undefined) {
    throw new RangeError(`Unknown kind of EFX text: ${kind}. The kinds are ${[...LANGUAGES.keys()].join(", ")}.`);
  }
  const completions = new EfxCompletions(language.parser);
  const autocomplete = language.data.of({ autocomplete: (context) => completions.complete(context) });
  return new LanguageSupport(language, [DEFAULT_COLOURS, autocomplete]);
}
