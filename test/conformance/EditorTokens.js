// The editor's side of the conformance test: the tokens the editor's parser makes of a text.

import { parser } from '../../dist/efx-parser.js';

// The nodes that hold comments, left out as the lexer leaves its comments out.
const COMMENTS = new Set(['Comment']);

const BLANK = /^\s*$/;

export class EditorTokens {
  #text;
  // The top rule of the grammar the text is read with.
  #top;
  #tokens = [];
  #end = 0;

  constructor(text, top) {
    this.#text = text;
    this.#top = top;
  }

  /**
   * The tokens of a text read with a top, in order, each with its name, its text and its start: the
   * leaves of the parse tree, without comments. Text between two leaves that is not blank has no
   * node of its own and is a token with no name. A parse error is a token named ⚠ where the error
   * starts.
   */
  static of(text, top) {
    return new EditorTokens(text, top).#read();
  }

  #read() {
    const cursor = parser.configure({ top: this.#top }).parse(this.#text).cursor();
    do {
      const isLeaf = !EditorTokens.#hasChildren(cursor);
      if (cursor.type.isError || (isLeaf && cursor.from < cursor.to)) {
        this.#token(cursor.name, cursor.from, cursor.to);
        // The text of a leaf is read; a parse error that holds leaves is read through them.
        if (isLeaf) {
          this.#end = cursor.to;
        }
      }
    } while (cursor.next());
    this.#textUntil(this.#text.length);
    return this.#tokens;
  }

  /**
   * A token where a node starts: a leaf of the tree, or a parse error, which comes before the leaves
   * it may hold. Comments are left out.
   */
  #token(name, from, to) {
    this.#textUntil(from);
    if (!COMMENTS.has(name)) {
      this.#tokens.push({ name, text: this.#text.slice(from, to), start: from });
    }
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
