// EXPRESSION mode, and every place the other modes do not claim. All whitespace, line ends and
// comments are hidden (WS, ExpressionComment). A reserved word is its token wherever the parser can
// take that token or a name, as the lexer reads it; any other word is the grammar's own Identifier.
// A `/` before an `@`, with only hidden text between, is the lexer's AttributeSlash.

import * as terms from '../efx-parser.terms.js';
import { expressionTokens } from '../generated/words.js';
import { LexerMode } from './LexerMode.js';
import { ReservedWords } from './ReservedWords.js';

export class ExpressionMode extends LexerMode {
  static #words = new ReservedWords(expressionTokens);

  /** Everywhere: the modes before it in LexerModes claim their places first. */
  isActive() {
    return true;
  }

  hide(input) {
    if (input.isComment(0)) {
      return input.take(terms.Comment, input.commentLength(0));
    }
    return input.take(terms.space, input.whitespace(0));
  }

  read(input, stack) {
    if (input.isSlash(0) && input.isAt(1 + input.hiddenLength(1))) {
      input.accept(terms.AttributeSlash, 1);
      return;
    }
    if (input.isSemicolon(0)) {
      input.accept(terms.Semicolon, 1);
      return;
    }
    const word = ExpressionMode.#words.wordAt(input, 0);
    if (word !== undefined && (stack.canShift(word.token) || stack.canShift(terms.Identifier))) {
      input.accept(word.token, word.length);
    }
  }
}
