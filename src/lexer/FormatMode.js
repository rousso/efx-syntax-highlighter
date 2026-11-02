// FORMAT mode, the format options after the pipe of an expression block: blanks are hidden
// (FormatWhitespace), and a word is one of the format words.

import * as terms from '../efx-parser.terms.js';
import { formatTokens } from '../generated/words.js';
import { LexerMode } from './LexerMode.js';
import { ReservedWords } from './ReservedWords.js';

export class FormatMode extends LexerMode {
  static #words = new ReservedWords(formatTokens);

  /** Where the parser can take a number of decimals or `no-unit`. */
  isActive(stack) {
    return stack.canShift(terms.FormatDecimals) || stack.canShift(terms.FormatNoUnit);
  }

  hide(input) {
    return input.take(terms.space, input.blanks(0));
  }

  read(input) {
    const word = FormatMode.#words.wordAt(input, 0);
    if (word !== undefined) {
      input.accept(word.token, word.length);
    }
  }
}
