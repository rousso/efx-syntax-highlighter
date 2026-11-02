// DEFAULT mode, between lines and at their start. Blanks indent a line (the grammar's own Tabs,
// Spaces and MixedIndent) unless a comment or a line end follows them (EmptyOrCommentLine), or they
// follow a `;`, after which the lexer skips one run of whitespace (SKIP_WHITESPACE): those blanks
// are hidden, and so are comments and line ends. A word is one of the line words; DISPLAY takes the
// whitespace after it, which must be there. `#include` and the blanks after it are an
// IncludeDirective, which only this mode reads.

import * as terms from '../efx-parser.terms.js';
import { lineTokens } from '../generated/words.js';
import { LINE_START } from './LexerContext.js';
import { LexerMode } from './LexerMode.js';
import { ReservedWords } from './ReservedWords.js';

export class LineMode extends LexerMode {
  static #words = new ReservedWords(lineTokens);

  /** At the start of a line (LexerContext.js), or where the parser can take a line's indentation. */
  isActive(stack) {
    return stack.context === LINE_START || stack.canShift(terms.Tabs);
  }

  hide(input) {
    if (input.isComment(0)) {
      return input.take(terms.Comment, input.commentLength(0));
    }
    const blanks = input.blanks(0);
    if (blanks > 0 && (input.isSemicolon(-1) || input.isComment(blanks) || input.isLineEnd(blanks))) {
      return input.take(terms.space, blanks);
    }
    return input.take(terms.space, input.lineEnds(0));
  }

  read(input) {
    if (input.take(terms.IncludeDirective, input.includeDirectiveLength())) {
      return;
    }
    const word = LineMode.#words.wordAt(input, 0);
    if (word === undefined) {
      return;
    }
    if (word.token !== terms.Display) {
      input.accept(word.token, word.length);
      return;
    }
    const whitespace = input.whitespace(word.length);
    if (whitespace > 0) {
      input.accept(word.token, word.length + whitespace);
    }
  }
}
