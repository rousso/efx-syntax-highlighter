// The oracle's side of the conformance test: the tokens the EFX-2 lexer makes of a text.

import { CharStream, Token } from 'antlr4ng';
import { EfxLexer } from '../oracle/EfxLexer.js';

export class OracleTokens {
  /**
   * The tokens of a text on the lexer's default channel, in order, each with its name, its text
   * and its start. Tokens on another channel (spaces in expressions, skipped spaces, comments and
   * empty lines) are left out. ANTLR counts positions in characters and the editor in UTF-16 units,
   * so the starts are given in UTF-16 units.
   */
  static of(text) {
    const lexer = new EfxLexer(CharStream.fromString(text));
    const offsets = OracleTokens.#utf16Offsets(text);
    return lexer.getAllTokens()
      .filter((token) => token.channel === Token.DEFAULT_CHANNEL)
      .map((token) => ({
        name: EfxLexer.vocabulary.getSymbolicName(token.type),
        text: token.text,
        start: offsets[token.start],
      }));
  }

  /** The names of all the token kinds the lexer can make. */
  static kinds() {
    const { vocabulary } = EfxLexer;
    return Array.from({ length: vocabulary.maxTokenType }, (_, index) => vocabulary.getSymbolicName(index + 1));
  }

  /** For each character of a text, the position of its first UTF-16 unit. */
  static #utf16Offsets(text) {
    const offsets = [];
    let offset = 0;
    for (const character of text) {
      offsets.push(offset);
      offset += character.length;
    }
    offsets.push(offset);
    return offsets;
  }
}
