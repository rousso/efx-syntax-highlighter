// What the parse state cannot tell about the lexer's mode, kept as the parser goes: where the last
// token leaves the lexer, in the places where the tokens the parser can take do not say it.
// - LINE_START: after a `;`, a line end, a header or an include, the lexer is at the start of a line
//   (DEFAULT or SKIP_WHITESPACE). After a rule of a rules file the parser can take the same tokens,
//   but the lexer is still in EXPRESSION mode, until a `;`.
// - TEMPLATE_END: after a template is closed, the lexer is still in TEMPLATE mode, and reads a line
//   end as the CRLF that ends an EFX-1 line (TemplateMode.js).
// - TEMPLATE_SEMICOLON: after the `;` that ends a template, the lexer is at the start of a line, as
//   at LINE_START, but the `;` takes the blanks and the comment after it on its line (EndTemplate),
//   so that comment needs no line end (LineMode.js).
// - BEFORE_FIRST_WORD: after the indentation or the outline number of a line, before its first word.
// - INVOKE_LINE: in a line that starts with INVOKE. At the start of a line the lexer reads INVOKE in
//   DEFAULT mode, which pushes EXPRESSION mode only (Invoke), so the line's `;` takes the lexer back
//   to DEFAULT mode, where any other `;` takes it to SKIP_WHITESPACE.
// - INVOKE_SEMICOLON: after that `;`, the lexer is at the start of a line in DEFAULT mode
//   (LineMode.js).
// The skip tokens leave it as it is, and the tokens of a line that starts with INVOKE keep
// INVOKE_LINE until its `;` or line end; any other token sets none of these values.

import { ContextTracker } from '@lezer/lr';
import * as terms from '../efx-parser.terms.js';

export const LINE_START = 1;
export const TEMPLATE_END = 2;
export const TEMPLATE_SEMICOLON = 3;
export const BEFORE_FIRST_WORD = 4;
export const INVOKE_LINE = 5;
export const INVOKE_SEMICOLON = 6;

// The tokens after which the lexer is at the start of a line.
const LINE_ENDS = new Set([terms.Semicolon, terms.CRLF, terms.IncludePath, terms.StageHeaderEnd,
  terms.SummarySectionHeader, terms.NavigationSectionHeader]);

// The rules that end with a template. The template's own nodes are its fragments, which the
// grammar defines inside templateFragment, so they have no term of their own to look for.
const ENDS_WITH_TEMPLATE = new Set([terms.DisplayTemplate, terms.OtherwiseDisplayTemplate]);

// The tokens that can come before the first word of a line: its indentation and outline number.
const LINE_PREFIXES = new Set([terms.Tabs, terms.Spaces, terms.MixedIndent, terms.OutlineNumber]);

const SKIPPED = new Set([terms.space, terms.Comment]);

/** Whether the lexer is at the start of a line. */
export function isLineStart(context) {
  return context === LINE_START || context === TEMPLATE_SEMICOLON || context === INVOKE_SEMICOLON;
}

function shift(context, term) {
  if (SKIPPED.has(term)) {
    return context;
  }
  const lineStart = isLineStart(context) || context === BEFORE_FIRST_WORD;
  if (lineStart && LINE_PREFIXES.has(term)) {
    return BEFORE_FIRST_WORD;
  }
  if (lineStart && term === terms.Invoke) {
    return INVOKE_LINE;
  }
  if (term === terms.Semicolon && context === TEMPLATE_END) {
    return TEMPLATE_SEMICOLON;
  }
  if (term === terms.Semicolon && context === INVOKE_LINE) {
    return INVOKE_SEMICOLON;
  }
  if (LINE_ENDS.has(term)) {
    return LINE_START;
  }
  return context === INVOKE_LINE ? INVOKE_LINE : 0;
}

export const lexerContext = new ContextTracker({
  start: LINE_START,
  shift,
  reduce: (context, term) => (ENDS_WITH_TEMPLATE.has(term) ? TEMPLATE_END : context),
  hash: (context) => context,
});
