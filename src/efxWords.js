// The words of the grammar. The lexer reads each word it reserves as a token of its own; this
// tokenizer does the same wherever the parser can take that token, and otherwise leaves the word to
// the grammar's Identifier. The words come from the lexer, through the sync.
// The module runs from dist/, where the build puts it beside the parser and efx-parser.terms.js.
//
// The tokenizer is contextual: the parser asks it again for each reading it keeps at once. At the
// colon after a field the parser tries two readings (see the grammar), and each must get the token
// its own reading can take.

import { ExternalTokenizer } from '@lezer/lr';
import * as terms from './efx-parser.terms.js';
import { assetTypes, expressionTokens, keywords, labelTypes } from './generated/words.js';

// The kinds of word of the template rules, until P2.2, in the order they are tried. Label words
// come before keywords: in #{auxiliary|text|buyer}, `text` is a label type, not a keyword.
const TEMPLATE_KINDS = [
  { words: assetTypes, token: terms.LabelKeyword },
  { words: labelTypes, token: terms.LabelKeyword },
  { words: keywords, token: terms.Keyword },
];

const HYPHEN = 45;

const isLetter = (code) => (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95;
const isLetterOrDigit = (code) => isLetter(code) || (code >= 48 && code <= 57);

/**
 * The length of the word at the input's position, read as the lexer reads an Identifier: a letter,
 * then letters and digits, with single hyphens between them. Zero when no word starts there.
 */
function wordLength(input) {
  if (!isLetter(input.next)) {
    return 0;
  }
  let length = 1;
  for (;;) {
    const hyphen = input.peek(length) === HYPHEN ? 1 : 0;
    if (!isLetterOrDigit(input.peek(length + hyphen))) {
      return length;
    }
    length += hyphen;
    while (isLetterOrDigit(input.peek(length))) {
      length++;
    }
  }
}

/** The token of a word where the parser stands, or undefined to leave the word an Identifier. */
function tokenOf(word, stack) {
  const expressionToken = terms[expressionTokens.get(word)];
  if (expressionToken !== undefined && stack.canShift(expressionToken)) {
    return expressionToken;
  }
  return TEMPLATE_KINDS.find(({ words, token }) => words.has(word) && stack.canShift(token))?.token;
}

export const words = new ExternalTokenizer((input, stack) => {
  const length = wordLength(input);
  if (length > 0) {
    const word = String.fromCharCode(...Array.from({ length }, (_, index) => input.peek(index)));
    const token = tokenOf(word, stack);
    if (token !== undefined) {
      input.acceptToken(token, length);
    }
  }
}, { contextual: true });
