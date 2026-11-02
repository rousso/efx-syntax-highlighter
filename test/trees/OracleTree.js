// The oracle's side of the tree test: the tree the EFX-2 parser makes of a single expression, with
// its nodes named as the editor's grammar names them:
//
// - a rule is its context's name: the rule's name, or the label of its alternative when the
//   alternatives are labelled, with a capital first letter;
// - a built-in function's alternative is left out, its children kept: the function's token names
//   the call;
// - a rule named like a token is left out, its children kept: the token stands for it;
// - a token is its name in the lexer.

import { BaseErrorListener, CharStream, CommonTokenStream, ErrorNode, TerminalNode, Token } from 'antlr4ng';
import { OracleTokens } from '../conformance/OracleTokens.js';
import { EfxLexer } from '../oracle/EfxLexer.js';
import { EfxParser } from '../oracle/EfxParser.js';
import { Tree } from './Tree.js';

// The rules of the built-in functions' alternatives, as builtInFunction in Efx.g4 lists them.
const FUNCTION_RULES = new Set(['booleanFunction', 'numericFunction', 'stringFunction', 'dateFunction',
  'timeFunction', 'durationFunction', 'sequenceFunction']);

const TOKEN_NAMES = new Set(OracleTokens.kinds());

class ErrorCount extends BaseErrorListener {
  count = 0;

  syntaxError() {
    this.count += 1;
  }
}

export class OracleTree {
  /** The tree of a text read as a single expression, and the number of syntax errors in it. */
  static of(text) {
    const errors = new ErrorCount();
    const lexer = new EfxLexer(CharStream.fromString(text));
    const parser = new EfxParser(new CommonTokenStream(lexer));
    for (const recognizer of [lexer, parser]) {
      recognizer.removeErrorListeners();
      recognizer.addErrorListener(errors);
    }
    const [tree] = OracleTree.#treesOf(parser.singleExpression());
    return { tree, errors: errors.count };
  }

  /** The trees a node of ANTLR's parse tree gives: itself, nothing for the end of the text, or its children. */
  static #treesOf(node) {
    if (node instanceof ErrorNode) {
      return [new Tree('⚠')];
    }
    if (node instanceof TerminalNode) {
      return node.symbol.type === Token.EOF ? [] : [new Tree(EfxParser.vocabulary.getSymbolicName(node.symbol.type))];
    }
    const children = (node.children ?? []).flatMap((child) => OracleTree.#treesOf(child));
    return OracleTree.#isLeftOut(EfxParser.ruleNames[node.ruleIndex])
      ? children
      : [new Tree(node.constructor.name.replace(/Context$/, ''), children)];
  }

  static #isLeftOut(rule) {
    return FUNCTION_RULES.has(rule) || TOKEN_NAMES.has(rule[0].toUpperCase() + rule.slice(1));
  }
}
