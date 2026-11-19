// DEFAULT mode, between lines and at their start. Blanks indent a line (the grammar's own Tabs,
// Spaces and MixedIndent) unless a comment, a line end or the end of the text follows them
// (EmptyOrCommentLine). A `;` takes the lexer to SKIP_WHITESPACE, where it skips one run of
// whitespace: the blanks after the `;` are hidden, and so are line ends. The `;` of a line that
// starts with INVOKE takes it back to DEFAULT mode instead (LexerContext.js), so the blanks after
// it indent the next line. A comment is hidden before a line end, or before the end of the text in
// DEFAULT mode (EmptyOrCommentLine) but not in SKIP_WHITESPACE (SkippedComment), and on the line of
// a template's `;`, which takes it (EndTemplate). A word is one of the line words; DISPLAY takes
// the whitespace after it, which must be there. `#include` and the blanks after it are an
// IncludeDirective, which only this mode reads. Where the lexer is still in SKIP_WHITESPACE,
// directly after a `;` or after a template's `;` and the blanks it takes, it reads only the words
// of that mode, and no IncludeDirective.

import * as terms from '../efx-parser.terms.js';
import { lineTokens, skipWhitespaceTokens } from '../generated/words.js';
import { INVOKE_SEMICOLON, isLineStart, TEMPLATE_SEMICOLON } from './LexerContext.js';
import { LexerMode } from './LexerMode.js';
import { ReservedWords } from './ReservedWords.js';

export class LineMode extends LexerMode {
  static #words = new ReservedWords(lineTokens);
  static #skipWhitespaceWords = new ReservedWords(skipWhitespaceTokens);

  /** At the start of a line (LexerContext.js), or where the parser can take a line's indentation. */
  isActive(stack) {
    return isLineStart(stack.context) || stack.canShift(terms.Tabs);
  }

  hide(input, stack) {
    if (input.isComment(0)) {
      const length = input.commentLength(0);
      const lastLine = input.isEnd(length) && !LineMode.#skipsWhitespace(input, stack);
      const afterTemplate = stack.context === TEMPLATE_SEMICOLON && input.followsSemicolon(0);
      return (input.isLineEnd(length) || lastLine || afterTemplate) && input.take(terms.Comment, length);
    }
    const blanks = input.blanks(0);
    const hidden = LineMode.#skipsWhitespace(input, stack) || input.isComment(blanks) || input.isLineEnd(blanks)
      || input.isEnd(blanks);
    if (blanks > 0 && hidden) {
      return input.take(terms.space, blanks);
    }
    return input.take(terms.space, input.lineEnds(0));
  }

  read(input, stack) {
    if (LineMode.#skipsWhitespace(input, stack)) {
      const word = LineMode.#skipWhitespaceWords.wordAt(input, 0);
      if (word !== undefined) {
        input.accept(word.token, word.length);
      }
      return;
    }
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

  words() {
    return LineMode.#words.entries();
  }

  /**
   * Whether the lexer is still in SKIP_WHITESPACE at the position: directly after a `;`, or after a
   * template's `;` and the blanks it takes (EndTemplate), but not after the `;` of a line that starts
   * with INVOKE.
   */
  static #skipsWhitespace(input, stack) {
    if (stack.context === TEMPLATE_SEMICOLON) {
      return input.followsSemicolon(0);
    }
    return stack.context !== INVOKE_SEMICOLON && input.isSemicolon(-1);
  }
}
