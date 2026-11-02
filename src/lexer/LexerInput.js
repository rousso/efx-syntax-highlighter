// The text at the tokenizer's position, read as EfxLexer.g4 reads it: blanks, line ends, comments
// and the shapes of its tokens. Offsets count from the position; a negative one looks back.

const TAB = 9;
const LF = 10;
const FF = 12;
const CR = 13;
const SPACE = 32;
const HYPHEN = 45;
const DOT = 46;
const SLASH = 47;
const SEMICOLON = 59;
const BACKSLASH = 92;

// The characters FreeText cannot hold: ~[\r\n\f\t #$@&;\\]
const NOT_FREE_TEXT = new Set(Array.from('\r\n\f\t #$@&;\\', (c) => c.charCodeAt(0)));

export class LexerInput {
  #input;

  constructor(input) {
    this.#input = input;
  }

  /** The text of a length at an offset. */
  text(offset, length) {
    const from = this.#input.pos + offset;
    return this.#input.read(from, from + length);
  }

  /** Ends the token: the given one, of a length from the position. */
  accept(token, length) {
    this.#input.acceptToken(token, length);
  }

  /** Ends the token if its length is not 0; whether it did. */
  take(token, length) {
    if (length > 0) {
      this.accept(token, length);
    }
    return length > 0;
  }

  /** TAB | SPACE */
  isBlank(offset) {
    const c = this.#input.peek(offset);
    return c === TAB || c === SPACE;
  }

  /** EOL: '\r'? '\n' | '\r' | '\f' */
  isLineEnd(offset) {
    const c = this.#input.peek(offset);
    return c === LF || c === CR || c === FF;
  }

  isSemicolon(offset) {
    return this.#input.peek(offset) === SEMICOLON;
  }

  isBackslash(offset) {
    return this.#input.peek(offset) === BACKSLASH;
  }

  /** COMMENT: '//' ~[\r\n\f]* */
  isComment(offset) {
    return this.#input.peek(offset) === SLASH && this.#input.peek(offset + 1) === SLASH;
  }

  /** The number of blanks at an offset. */
  blanks(offset) {
    return this.#count(offset, (o) => this.isBlank(o));
  }

  /** The number of line-end characters at an offset. */
  lineEnds(offset) {
    return this.#count(offset, (o) => this.isLineEnd(o));
  }

  /** The number of blanks and line-end characters at an offset. */
  whitespace(offset) {
    return this.#count(offset, (o) => this.isBlank(o) || this.isLineEnd(o));
  }

  /** The length of the comment at an offset, up to the line end. */
  commentLength(offset) {
    return this.isComment(offset) ? this.#count(offset, (o) => this.#input.peek(o) >= 0 && !this.isLineEnd(o)) : 0;
  }

  /** The length of the Identifier at an offset: LETTER ('-'? (LETTER | DIGIT)+)* */
  identifierLength(offset) {
    if (!LexerInput.#isLetter(this.#input.peek(offset))) {
      return 0;
    }
    let length = 1;
    for (;;) {
      const hyphen = this.#input.peek(offset + length) === HYPHEN ? 1 : 0;
      const part = this.#count(offset + length + hyphen, (o) => LexerInput.#isLetterOrDigit(this.#input.peek(o)));
      if (part === 0) {
        return length;
      }
      length += hyphen + part;
    }
  }

  /** The length of the OtherAssetId at the position: [a-z]+ ([-.] [a-z0-9]+)* */
  assetIdLength() {
    const isPart = (o) => LexerInput.#isLower(this.#input.peek(o)) || LexerInput.#isDigit(this.#input.peek(o));
    let length = this.#count(0, (o) => LexerInput.#isLower(this.#input.peek(o)));
    while (length > 0) {
      const separator = this.#input.peek(length);
      const part = separator === HYPHEN || separator === DOT ? this.#count(length + 1, isPart) : 0;
      if (part === 0) {
        return length;
      }
      length += 1 + part;
    }
    return length;
  }

  /** The length of the FreeText at the position. */
  freeTextLength() {
    return this.#count(0, (o) => this.#input.peek(o) >= 0 && !NOT_FREE_TEXT.has(this.#input.peek(o)));
  }

  #count(offset, test) {
    let end = offset;
    while (test(end)) {
      end += 1;
    }
    return end - offset;
  }

  /** LETTER: [a-zA-Z_] */
  static #isLetter(c) {
    return (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95;
  }

  static #isLower(c) {
    return c >= 97 && c <= 122;
  }

  /** DIGIT: [0-9] */
  static #isDigit(c) {
    return c >= 48 && c <= 57;
  }

  static #isLetterOrDigit(c) {
    return LexerInput.#isLetter(c) || LexerInput.#isDigit(c);
  }
}
