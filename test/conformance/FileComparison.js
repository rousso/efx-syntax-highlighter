// One corpus file in the conformance test: the lexer's tokens against the editor's.

import { EditorTokens } from './EditorTokens.js';
import { OracleTokens } from './OracleTokens.js';
import { TokenNames } from './TokenNames.js';

// The longest token text a difference shows.
const SHOWN_LENGTH = 40;

export class FileComparison {
  #file;
  #text;
  #oracle;
  #editor;
  // For each matched token of the lexer, by its index, the index of the editor's token it matches.
  #matches = new Map();

  constructor(file, text, top) {
    this.#file = file;
    this.#text = text;
    this.#oracle = OracleTokens.of(text);
    this.#editor = EditorTokens.of(text, top);
    this.#compare();
  }

  /** Whether every token of the lexer is matched and the editor has no other token. */
  get matches() {
    return this.#matches.size === this.#oracle.length && this.#editor.length === this.#oracle.length;
  }

  /**
   * Adds to the counts, kept by kind of token, how many tokens of each kind the lexer makes in the
   * file and how many of them are matched.
   */
  addCountsTo(counts) {
    this.#oracle.forEach((token, index) => {
      const count = counts.get(token.name) ?? { total: 0, matched: 0 };
      count.total += 1;
      count.matched += this.#matches.has(index) ? 1 : 0;
      counts.set(token.name, count);
    });
  }

  /** The first place where the two sides differ, with its line and both tokens; undefined if none. */
  firstDifference() {
    const matched = new Set(this.#matches.values());
    const oracle = this.#oracle.find((_, index) => !this.#matches.has(index));
    const editor = this.#editor.find((_, index) => !matched.has(index));
    const position = Math.min(oracle?.start ?? Infinity, editor?.start ?? Infinity);
    if (position === Infinity) {
      return undefined;
    }
    const line = this.#text.slice(0, position).split('\n').length;
    return `${this.#file}:${line}: ANTLR ${FileComparison.#describe(this.#oracle, position)}, `
      + `editor ${FileComparison.#describe(this.#editor, position)}`;
  }

  /**
   * A token of the lexer is matched when the editor has a token of the name the table gives, starting
   * at the same position, and the next token starts at the same position on both sides.
   */
  #compare() {
    const editorAt = new Map();
    this.#editor.forEach((token, index) => {
      if (!editorAt.has(token.start)) {
        editorAt.set(token.start, index);
      }
    });
    this.#oracle.forEach((token, index) => {
      const match = editorAt.get(token.start);
      const name = TokenNames.editorNameOf(token.name);
      if (match !== undefined && name && this.#editor[match].name === name
        && this.#nextStart(this.#editor, match) === this.#nextStart(this.#oracle, index)) {
        this.#matches.set(index, match);
      }
    });
  }

  #nextStart(tokens, index) {
    return index + 1 < tokens.length ? tokens[index + 1].start : this.#text.length;
  }

  static #describe(tokens, position) {
    const token = tokens.find((candidate) => candidate.start === position);
    if (token === undefined) {
      return 'nothing starts here';
    }
    const text = token.text.length > SHOWN_LENGTH ? `${token.text.slice(0, SHOWN_LENGTH)}…` : token.text;
    return `${token.name || '(no node)'} ${JSON.stringify(text)}`;
  }
}
