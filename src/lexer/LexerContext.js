// What the parse state cannot tell about the lexer's mode, kept as the parser goes: where the last
// token leaves the lexer, in the two places where the tokens the parser can take do not say it.
// - LINE_START: after a `;`, a line end, a header or an include, the lexer is at the start of a line
//   (DEFAULT or SKIP_WHITESPACE). After a rule of a rules file the parser can take the same tokens,
//   but the lexer is still in EXPRESSION mode, until a `;`.
// - TEMPLATE_END: after a template is closed, the lexer is still in TEMPLATE mode, and reads a line
//   end as the CRLF that ends an EFX-1 line (TemplateMode.js).
// The skip tokens leave it as it is; any other token sets neither.

import { ContextTracker } from '@lezer/lr';
import * as terms from '../efx-parser.terms.js';

export const LINE_START = 1;
export const TEMPLATE_END = 2;

// The tokens after which the lexer is at the start of a line.
const LINE_ENDS = new Set([terms.Semicolon, terms.CRLF, terms.IncludePath, terms.StageHeaderEnd,
  terms.SummarySectionHeader, terms.NavigationSectionHeader]);

// The rules that end with a template. The template's own nodes are its fragments, which the
// grammar defines inside templateFragment, so they have no term of their own to look for.
const ENDS_WITH_TEMPLATE = new Set([terms.DisplayTemplate, terms.OtherwiseDisplayTemplate]);

const SKIPPED = new Set([terms.space, terms.Comment]);

export const lexerContext = new ContextTracker({
  start: LINE_START,
  shift: (context, term) => (SKIPPED.has(term) ? context : LINE_ENDS.has(term) ? LINE_START : 0),
  reduce: (context, term) => (ENDS_WITH_TEMPLATE.has(term) ? TEMPLATE_END : context),
  hash: (context) => context,
});
