// STAGE_HEADER mode, in a rules file's stage header: the stage's name and the end of the header
// are the grammar's own StageIdentifier and StageHeaderEnd. Nothing is hidden.

import * as terms from '../efx-parser.terms.js';
import { LexerMode } from './LexerMode.js';

export class StageHeaderMode extends LexerMode {
  /** Where the parser can take a stage's name or the end of its header. */
  isActive(stack) {
    return stack.canShift(terms.StageIdentifier) || stack.canShift(terms.StageHeaderEnd);
  }
}
