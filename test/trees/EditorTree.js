// The editor's side of the tree test: the tree the editor's parser makes of a text read from one of
// its tops, SingleExpression or TemplateFile. Comments are left out, as the lexer hides them.

import { parser } from '../../dist/efx-parser.js';
import { Tree } from './Tree.js';

export class EditorTree {
  /** The tree of a text read from a top, and the number of parse errors in it. */
  static of(text, top) {
    let errors = 0;
    const treeOf = (node) => {
      if (node.type.isError) {
        errors += 1;
        return new Tree('⚠');
      }
      const children = [];
      for (let child = node.firstChild; child !== null; child = child.nextSibling) {
        if (!EditorTree.#isHidden(child)) {
          children.push(treeOf(child));
        }
      }
      return new Tree(node.name, children);
    };
    const tree = treeOf(parser.configure({ top }).parse(text).topNode);
    return { tree, errors };
  }

  /** Whether a node is text the lexer hides, a comment: skipped, and not a parse error (Lezer skips those too). */
  static #isHidden(node) {
    return node.type.isSkipped && !node.type.isError;
  }
}
