// A mode of EfxLexer.g4 as the editor finds it. The tokens the parser can take tell whether the
// lexer would be in the mode there; the mode then hides what the lexer hides in it, as the grammar's
// skip tokens `space` and `Comment`, and reads the tokens whose reading depends on it. The tokens
// that read the same in every mode are the grammar's own. Each subclass is named after its mode.

export class LexerMode {
  /** Whether the lexer would be in this mode where the parser stands. */
  isActive(stack) {
    throw new Error(`${this.constructor.name} does not say where the lexer is in it`);
  }

  /** Hides the text the mode hides at the position, if any; whether there was some. */
  hide(input) {
    return false;
  }

  /** Reads the token the mode reads at the position, if it reads one there. */
  read(input, stack) {}
}
