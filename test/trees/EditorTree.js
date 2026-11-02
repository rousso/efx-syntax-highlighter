// The editor's side of the tree test: the tree the editor's parser makes of a single expression.

import { parser } from '../../dist/efx-parser.js';
import { Tree } from './Tree.js';

const singleExpression = parser.configure({ top: 'SingleExpression' });

export class EditorTree {
  /** The tree of a text read as a single expression, and the number of parse errors in it. */
  static of(text) {
    let errors = 0;
    const treeOf = (node) => {
      if (node.type.isError) {
        errors += 1;
        return new Tree('⚠');
      }
      const children = [];
      for (let child = node.firstChild; child !== null; child = child.nextSibling) {
        children.push(treeOf(child));
      }
      return new Tree(node.name, children);
    };
    const tree = treeOf(singleExpression.parse(text).topNode);
    return { tree, errors };
  }
}
