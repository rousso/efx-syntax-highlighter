// The words the lexer reserves in one of its modes, each with the token it makes of it: a table of
// src/generated/words.js, its tokens given as the grammar's terms. A word whose token no rule of the
// grammar takes has no term: the lexer's `value` in template text. The table also lists the phrases
// the lexer reads as one token, a word, whitespace and a second word (OTHERWISE DISPLAY), written
// with one blank between the two words.

import * as terms from '../efx-parser.terms.js';

export class ReservedWords {
  #words = new Map();
  // For each word that starts a phrase, the second words of its phrases with their tokens.
  #phrases = new Map();

  constructor(table) {
    for (const [text, token] of table) {
      const [first, second] = text.split(' ');
      if (second === undefined) {
        this.#words.set(first, terms[token]);
      } else {
        const phrases = this.#phrases.get(first) ?? [];
        this.#phrases.set(first, [...phrases, { second, token: terms[token] }]);
      }
    }
  }

  /** Each word and phrase whose token has a term, with that term: [text, token] pairs. */
  entries() {
    const phrases = [...this.#phrases].flatMap(([first, seconds]) =>
      seconds.map(({ second, token }) => [`${first} ${second}`, token]));
    return [...this.#words, ...phrases].filter(([, token]) => token !== undefined);
  }

  /**
   * The token of the reserved word that is the whole Identifier-shaped word at an offset, or of the
   * phrase it starts there, and its length; undefined when that word is not reserved or its token
   * has no term.
   */
  wordAt(input, offset) {
    const word = input.text(offset, input.identifierLength(offset));
    const read = this.#read(input, offset, word);
    return read.token === undefined ? undefined : read;
  }

  /**
   * The longest reserved word the text at an offset starts with, whole word or not, as template text
   * reads it, or the phrase it starts there, with its token (undefined when it has no term) and its
   * length; undefined when there is none.
   */
  prefixAt(input, offset) {
    const starts = [...this.#words.keys()].filter((candidate) => input.text(offset, candidate.length) === candidate);
    const word = ReservedWords.#longest(starts);
    return word === undefined ? undefined : this.#read(input, offset, word);
  }

  /**
   * A reserved word at an offset, and the phrase it starts if one follows: whitespace, then a second
   * word, which the lexer reads as the start of the text there, whole word or not.
   */
  #read(input, offset, word) {
    const gap = input.whitespace(offset + word.length);
    const start = offset + word.length + gap;
    const phrases = gap === 0 ? [] : this.#phrases.get(word) ?? [];
    const seconds = phrases.filter(({ second }) => input.text(start, second.length) === second);
    const phrase = ReservedWords.#longest(seconds, ({ second }) => second);
    return phrase === undefined
      ? { token: this.#words.get(word), length: word.length }
      : { token: phrase.token, length: word.length + gap + phrase.second.length };
  }

  /** The candidate with the longest text, the first of them if several; undefined when there is none. */
  static #longest(candidates, textOf = (candidate) => candidate) {
    const longer = (longest, candidate) => (textOf(candidate).length > textOf(longest).length ? candidate : longest);
    return candidates.length === 0 ? undefined : candidates.reduce(longer);
  }
}
