// What the editor offers at the cursor, a completion source of @codemirror/autocomplete for the
// language of one kind of EFX text: the words the lexer reads there as tokens the parser can take
// (ExpectedTokens), as the toolkit's completion list describes them (CompletionItems); the field and
// node ids the application gives (efxSymbols) where the parser takes one; and the variables of the
// text (Variables) where it takes a `$`. The options replace the word before the cursor: a name, a
// field id with its part in parentheses (BT-26(m)-Lot) or a variable with its `$`. Nothing is offered
// inside a comment or a string. Template text takes any word, so where it can go the options are
// offered only when asked for, not while typing.

import { syntaxTree } from '@codemirror/language';
import * as terms from '../efx-parser.terms.js';
import { efxSymbols } from '../efxSymbols.js';
import { completionItems } from '../generated/completions.js';
import { CompletionItems } from './CompletionItems.js';
import { ExpectedTokens } from './ExpectedTokens.js';
import { Variables } from './Variables.js';

const WORD = /\$?(?:(?:BT|OPP|OPT|OPA)-\d+\((?:BT-\d*|[a-z])?\)?)?[\w-]*/;
const WHOLE_WORD = new RegExp(`^${WORD.source}$`);

// The tokens that decide the options besides the words: an expression can start, a field id, a
// node id, a variable, template text.
const ASKED = [terms.OpenParenthesis, terms.FieldId, terms.NodeId, terms.VariablePrefix, terms.FreeText];

// The nodes inside which nothing is offered.
const QUIET = new Set(['Comment', 'StringLiteral']);

const ITEMS = new CompletionItems(completionItems);

export class EfxCompletions {
  #parser;

  /** The completions of the language a parser reads. */
  constructor(parser) {
    this.#parser = parser;
  }

  /** The options for the word before the cursor of a CompletionContext, or null when there are none to offer. */
  complete(context) {
    const word = context.matchBefore(WORD);
    if ((word.from === word.to && !context.explicit) || EfxCompletions.#isQuiet(context.state, word.from)) {
      return null;
    }
    const expected = new ExpectedTokens(this.#parser, context.state, word.from, ASKED);
    if (expected.has(terms.FreeText) && !context.explicit) {
      return null;
    }
    const options = [
      ...EfxCompletions.#wordOptions(expected),
      ...EfxCompletions.#symbolOptions(expected, context.state),
      ...EfxCompletions.#variableOptions(expected, context.state, word.from),
    ];
    return { from: word.from, options, validFor: WHOLE_WORD };
  }

  static #isQuiet(state, pos) {
    const node = syntaxTree(state).resolveInner(pos, -1);
    return QUIET.has(node.name) && node.from < pos;
  }

  /** The words, but a phrase (OTHERWISE DISPLAY) only in the spellings whose two words agree in case. */
  static #wordOptions(expected) {
    const agrees = (word) => {
      const [first, second = first] = word.split(' ');
      return (first === first.toUpperCase()) === (second === second.toUpperCase());
    };
    const expressionStarts = expected.has(terms.OpenParenthesis);
    return expected.words().filter(agrees).map((word) => ITEMS.optionFor(word, expressionStarts));
  }

  static #symbolOptions(expected, state) {
    const { fields, nodes } = state.facet(efxSymbols);
    const options = (ids, type, detail) => ids.map((id) => ({ label: id, type, detail }));
    return [
      ...(expected.has(terms.FieldId) ? options(fields, 'constant', 'field') : []),
      ...(expected.has(terms.NodeId) ? options(nodes, 'namespace', 'node') : []),
    ];
  }

  static #variableOptions(expected, state, pos) {
    if (!expected.has(terms.VariablePrefix)) {
      return [];
    }
    return new Variables(state).usableAt(pos).map((name) => ({ label: name, type: 'variable' }));
  }
}
