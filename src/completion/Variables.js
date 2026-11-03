// The variables declared in an editor's text, read from its tree, and those a position can use. The
// variable of an iterator is used in the expression that iterates, and a parameter in the
// declaration that lists it, after their own declaration. Any other variable, declared with LET, in
// a context or as a dictionary, is taken as usable everywhere: the editor does not follow how far
// each of those reaches.

import { syntaxTree } from '@codemirror/language';

const ITERATIONS = ['QuantifiedExpression', 'SequenceFromIteration'];
const WITH_PARAMETERS = ['FunctionDeclaration', 'DynamicFunctionDeclaration', 'TemplateDeclaration', 'SingleExpression'];

// The nodes that declare a variable, each with the nodes where its variable is used; none: everywhere.
const DECLARATIONS = new Map([
  ['TypedVariableInitializer', []],
  ['DynamicVariableInitializer', []],
  ['ContextVariableInitializer', []],
  ['DictionaryDeclaration', []],
  ['ValueIterator', ITERATIONS],
  ['ContextIterator', ITERATIONS],
  ['ParameterDeclaration', WITH_PARAMETERS],
]);

export class Variables {
  // Each declared variable: its name with its `$`, and the part of the text that can use it.
  #variables = [];

  constructor(state) {
    syntaxTree(state).iterate({
      enter: ({ name, node }) => {
        if (DECLARATIONS.has(name)) {
          this.#declare(node, DECLARATIONS.get(name), state.doc);
        }
      },
    });
  }

  /** The names of the variables usable at a position, each once, with their `$`. */
  usableAt(pos) {
    const usable = ({ from, to }) => from <= pos && pos <= to;
    return [...new Set(this.#variables.filter(usable).map(({ name }) => name))];
  }

  #declare(declaration, users, doc) {
    const name = declaration.getChild('VariablePrefix')?.nextSibling;
    const usedIn = users.length === 0 ? { from: 0, to: doc.length } : Variables.#usedIn(declaration, users);
    if (name?.name === 'Identifier' && usedIn !== null) {
      this.#variables.push({ name: `$${doc.sliceString(name.from, name.to)}`, ...usedIn });
    }
  }

  /** From the end of a declaration to the end of the nearest node above it of the given names; null when none is. */
  static #usedIn(declaration, users) {
    for (let node = declaration.parent; node !== null; node = node.parent) {
      if (users.includes(node.name)) {
        return { from: declaration.to, to: node.to };
      }
    }
    return null;
  }
}
