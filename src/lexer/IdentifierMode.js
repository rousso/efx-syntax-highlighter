// IDENTIFIER mode, after `$`, `@`, `#`, `?` or `...`: the name that follows, never a reserved word,
// is the grammar's own UnquotedIdentifier. Nothing is hidden.

import * as terms from '../efx-parser.terms.js';
import { LexerMode } from './LexerMode.js';

export class IdentifierMode extends LexerMode {
  /** Where the parser can take the name after a prefix. */
  isActive(stack) {
    return stack.canShift(terms.UnquotedIdentifier);
  }
}
