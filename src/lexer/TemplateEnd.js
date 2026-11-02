// Whether the parser has just closed a template: true from the moment it closes a rule that ends
// with one, to the next token. The lexer is still in TEMPLATE mode there, and reads a line end as
// the CRLF that ends an EFX-1 line (TemplateMode.js).

import { ContextTracker } from '@lezer/lr';
import * as terms from '../efx-parser.terms.js';

// The rules that end with a template. The template's own nodes are its fragments, which the
// grammar defines inside templateFragment, so they have no term of their own to look for.
const ENDS_WITH_TEMPLATE = new Set([terms.DisplayTemplate, terms.OtherwiseDisplayTemplate]);

export const templateEnd = new ContextTracker({
  start: false,
  shift: () => false,
  reduce: (closed, term) => closed || ENDS_WITH_TEMPLATE.has(term),
  hash: (closed) => (closed ? 1 : 0),
});
