// The kind of each word for the grammar. The grammar reads every word as an Identifier, and asks
// wordToken, its external specializer for Identifier, whether the word is a label word, a keyword
// or a built-in function where it stands. The words come from the lexer, through the sync.
// The module runs from dist/, where the build puts it beside the parser and efx-parser.terms.js.

import { BuiltInFunction, Keyword, LabelKeyword } from './efx-parser.terms.js';
import { assetTypes, functionNames, keywords, labelTypes } from './generated/words.js';

// The kinds, in the order they are tried. Label words come before keywords: in
// #{auxiliary|text|buyer}, `text` is a label type, not a keyword. Keywords come before function
// names: in `is not present`, `not` is a keyword; a word that is only a function name is not among
// the keywords, so it stays a function.
const KINDS = [
  { words: assetTypes, token: LabelKeyword },
  { words: labelTypes, token: LabelKeyword },
  { words: keywords, token: Keyword },
  { words: functionNames, token: BuiltInFunction },
];

/** The token of a word where the parser can take it, or -1 to leave the word an Identifier. */
export function wordToken(word, stack) {
  const kind = KINDS.find(({ words, token }) => words.has(word) && stack.canShift(token));
  return kind === undefined ? -1 : kind.token;
}
