// What the parser can take at a position of an editor's text: the tokens it is asked about and the
// words the lexer reads there as tokens it can take. The text before the position is parsed as the
// editor parses it, reusing the editor's tree, with the tokenizer of the lexer's modes wrapped:
// where a parse stack stands at the position, the wrapper asks it which tokens it can take
// (Stack.canShift) and finds the lexer's mode there, as the tokenizer does. The parse is strict, so
// every stack asked is one of the parser's own readings of the text and never one of its recoveries
// from an error: after an error the parser takes nothing.
//
// The parser calls the wrapper only where it can take a token of the lexer's modes or a skip token.
// In a label block, where nothing is skipped, it can stand where it takes only the grammar's own
// tokens: after the label type of `#{name|`, where it takes a field id, it takes nothing asked.

import { syntaxTree } from '@codemirror/language';
import { TreeFragment } from '@lezer/common';
import { ExternalTokenizer } from '@lezer/lr';
import { lexerModeAt, lexerModes, readToken } from '../lexer/LexerModes.js';

export class ExpectedTokens {
  // One for each time a parse stack at the position is tokenized: the words its lexer mode reads
  // as tokens it can take, and the tokens asked about that it can take.
  #readings = [];

  /** What a language's parser can take at a position of an editor state, asked about some tokens. */
  constructor(parser, state, pos, tokens) {
    const probe = new ExternalTokenizer((input, stack) => {
      if (input.pos === pos) {
        this.#readings.push(ExpectedTokens.#reading(stack, tokens));
      }
      readToken(input, stack);
    }, { contextual: true });
    const parse = parser.configure({ strict: true, tokenizers: [{ from: lexerModes, to: probe }] })
      .startParse(state.doc.sliceString(0, pos), ExpectedTokens.#fragments(state, pos));
    try {
      while (parse.advance() === null) {
        // On to the end of the text, or to the first error.
      }
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error;
      }
    }
  }

  /** Whether the parser can take the token there. */
  has(token) {
    return this.#readings.some(({ tokens }) => tokens.has(token));
  }

  /** The words the lexer reads there as tokens the parser can take, each once. */
  words() {
    return [...new Set(this.#readings.flatMap(({ words }) => words))];
  }

  static #reading(stack, tokens) {
    const words = lexerModeAt(stack).words().filter(([, token]) => stack.canShift(token)).map(([word]) => word);
    return { words, tokens: new Set(tokens.filter((token) => stack.canShift(token))) };
  }

  /** The editor's tree before the position, for the parse to reuse. */
  static #fragments(state, pos) {
    const cut = { fromA: pos, toA: state.doc.length, fromB: pos, toB: pos };
    return TreeFragment.applyChanges(TreeFragment.addTree(syntaxTree(state)), [cut]);
  }
}
