// The words the lexer reserves in one of its modes, each with the token it makes of it: a table of
// src/generated/words.js, its tokens given as the grammar's terms. A word whose token no rule of the
// grammar takes has no term: the lexer's `value` in template text, and until P2.3 the words of
// rules files.

import * as terms from '../efx-parser.terms.js';
import { lineTokens } from '../generated/words.js';

export class ReservedWords {
  #tokens;

  constructor(table) {
    this.#tokens = table;
  }

  /**
   * The token of the reserved word that is the whole Identifier-shaped word at an offset, and its
   * length; undefined when that word is not reserved or its token has no term.
   */
  wordAt(input, offset) {
    const length = input.identifierLength(offset);
    const token = terms[this.#tokens.get(input.text(offset, length))];
    return token === undefined ? undefined : { token, length: length + ReservedWords.#displayAfter(input, token, offset + length) };
  }

  /**
   * The longest reserved word the text at an offset starts with, whole word or not, as template text
   * reads it, with its token (undefined when it has no term) and its length; undefined when there
   * is none.
   */
  prefixAt(input, offset) {
    const words = [...this.#tokens.keys()].filter((word) => input.text(offset, word.length) === word);
    if (words.length === 0) {
      return undefined;
    }
    const word = words.reduce((longest, candidate) => (candidate.length > longest.length ? candidate : longest));
    const token = terms[this.#tokens.get(word)];
    return { token, length: word.length + ReservedWords.#displayAfter(input, token, offset + word.length) };
  }

  /**
   * The length of the DISPLAY that the lexer reads with OTHERWISE in each of its modes, after the
   * word at an offset, or 0: OTHERWISE ((TAB | SPACE | EOL)+ DISPLAY)?
   */
  static #displayAfter(input, token, offset) {
    if (token !== terms.Otherwise) {
      return 0;
    }
    const gap = input.whitespace(offset);
    const length = input.identifierLength(offset + gap);
    return gap > 0 && lineTokens.get(input.text(offset + gap, length)) === 'Display' ? gap + length : 0;
  }
}
