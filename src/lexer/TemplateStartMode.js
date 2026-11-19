// SKIP_WHITESPACE before a template: after DISPLAY, OTHERWISE or the context of an EFX-1 line, the
// lexer skips one run of whitespace, blanks or a comment with the line ends after them
// (SkippedWhitespace, SkippedComment), then reads the template in TEMPLATE mode.

import * as terms from '../efx-parser.terms.js';
import { TemplateMode } from './TemplateMode.js';

export class TemplateStartMode extends TemplateMode {
  /** Where the parser can start a template's text. TemplateMode is tried first: the text can also end it there. */
  isActive(stack) {
    return stack.canShift(terms.FreeText);
  }

  hide(input) {
    if (input.isBlank(-1) || input.isLineEnd(-1)) {
      // The run is behind: what follows is template text.
      return super.hide(input);
    }
    if (input.isComment(0)) {
      return input.take(terms.Comment, input.commentLength(0));
    }
    const blanks = input.blanks(0);
    return input.take(terms.space, blanks + input.lineEnds(blanks));
  }
}
