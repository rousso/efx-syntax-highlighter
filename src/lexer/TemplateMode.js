// TEMPLATE mode: template text, where whitespace is text. Hidden: a comment with the blanks before
// it (EndOfLineComment), and a backslash with the line end after it, which joins two lines
// (LineJoining). A template ends with `;`, which takes the blanks before it (EndTemplate), with a
// line end (CRLF, one of the grammar's own tokens), or with WHEN, OTHERWISE or INVOKE, which take
// the whitespace and line ends before them.

import * as terms from '../efx-parser.terms.js';
import { templateTokens } from '../generated/words.js';
import { TEMPLATE_END } from './LexerContext.js';
import { LexerMode } from './LexerMode.js';
import { ReservedWords } from './ReservedWords.js';

// The tokens that can end a template.
const TEMPLATE_ENDS = [terms.Semicolon, terms.CRLF, terms.When, terms.Otherwise];

export class TemplateMode extends LexerMode {
  static #words = new ReservedWords(templateTokens);

  /**
   * Where the parser can take text and a token that ends a template, or the line end of an EFX-1
   * line, or has just closed a template, after which the lexer is still in TEMPLATE mode
   * (LexerContext.js).
   */
  isActive(stack) {
    return stack.context === TEMPLATE_END || stack.canShift(terms.CRLF)
      || (stack.canShift(terms.FreeText) && TEMPLATE_ENDS.some((token) => stack.canShift(token)));
  }

  hide(input) {
    if (input.isComment(0)) {
      return input.take(terms.Comment, input.commentLength(0));
    }
    const blanks = input.blanks(0);
    if (blanks > 0 && input.isComment(blanks)) {
      return input.take(terms.space, blanks);
    }
    return input.isBackslash(0) && input.take(terms.space, TemplateMode.#lineJoiningLength(input));
  }

  read(input) {
    const blanks = input.blanks(0);
    if (input.isSemicolon(blanks)) {
      input.accept(terms.Semicolon, blanks + 1);
      return;
    }
    const whitespace = input.whitespace(0);
    const word = TemplateMode.#words.prefixAt(input, whitespace);
    if (whitespace > 0) {
      // Only the words that end a template take the whitespace before them; any other whitespace
      // is the grammar's own Whitespace, NewLine or the start of a link.
      if (word?.token !== undefined) {
        input.accept(word.token, whitespace + word.length);
      }
      return;
    }
    const text = input.freeTextLength();
    if (word === undefined || word.length < text) {
      input.take(terms.FreeText, text);
    } else if (word.token !== undefined) {
      // A reserved word as long as the text around it: the lexer lists its rule before FreeText.
      input.accept(word.token, word.length);
    }
    // Otherwise the lexer's `value`, which no rule takes: nothing is read, and the parser reports
    // the error ANTLR reports.
  }

  words() {
    return TemplateMode.#words.entries();
  }

  /** LineJoining: '\\' (TAB | SPACE)* EOL+ (TAB | SPACE)*, or 0 when no line end follows. */
  static #lineJoiningLength(input) {
    const beforeEnd = 1 + input.blanks(1);
    const lineEnds = input.lineEnds(beforeEnd);
    return lineEnds === 0 ? 0 : beforeEnd + lineEnds + input.blanks(beforeEnd + lineEnds);
  }
}
