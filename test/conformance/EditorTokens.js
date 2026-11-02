// The editor's side of the conformance test: the tokens the editor's parser makes of a text.

import { parser } from '../../dist/efx-parser.js';

// The nodes that hold comments, left out as the lexer leaves its comments out.
const COMMENTS = new Set(['Comment']);

const BLANK = /^\s*$/;

export class EditorTokens {
  #text;
  #tokens = [];
  #end = 0;

  constructor(text) {
    this.#text = text;
  }

  /**
   * The tokens of a text, in order, each with its name, its text and its start: the leaves of the
   * parse tree, without comments. Text between two leaves that is not blank has no node of its own
   * and is a token with no name. A parse error is a token named ⚠ where the error starts.
   */
  static of(text) {
    return new EditorTokens(text).#read();
  }

  #read() {
    const cursor = parser.parse(this.#text).cursor();
    do {
      if (cursor.type.isError) {
        this.#error(cursor.name, cursor.from, cursor.to);
      } else if (cursor.from < cursor.to && !EditorTokens.#hasChildren(cursor)) {
        this.#leaf(cursor.name, cursor.from, cursor.to);
      }
    } while (cursor.next());
    this.#textUntil(this.#text.length);
    return this.#tokens;
  }

  /** A leaf of the tree: a token, or a comment, which is left out. */
  #leaf(name, from, to) {
    this.#textUntil(from);
    if (!COMMENTS.has(name)) {
      this.#tokens.push({ name, text: this.#text.slice(from, to), start: from });
    }
    this.#end = to;
  }

  /** A parse error: a token where it starts, before the leaves it may hold. */
  #error(name, from, to) {
    this.#textUntil(from);
    this.#tokens.push({ name, text: this.#text.slice(from, to), start: from });
  }

  /** The text since the previous leaf, up to a position, as a token with no name unless it is blank. */
  #textUntil(position) {
    const text = this.#text.slice(this.#end, position);
    if (!BLANK.test(text)) {
      this.#tokens.push({ name: '', text, start: this.#end });
    }
    this.#end = Math.max(this.#end, position);
  }

  static #hasChildren(cursor) {
    if (!cursor.firstChild()) {
      return false;
    }
    cursor.parent();
    return true;
  }
}
