// The tokens whose reading depends on the mode of EfxLexer.g4. The mode is found from the parse
// state, and the input is read as the lexer reads it in that mode: first the text the mode hides,
// then the token the mode reads there, if any; where it reads none, the grammar's own tokens are
// read.
//
// The modes are tried in this order, and the first the parser is in is the one:
// - where a template can go on, the lexer is in TEMPLATE mode whatever else the parser can take
//   (the tokens that end a template are read in that mode too), so template text comes first, then
//   the start of a template, which takes text but nothing that ends it;
// - label blocks, the name after a prefix and format options are each found by tokens that no
//   other mode takes;
// - the start of a line takes words that an expression also has, so DEFAULT comes before
//   EXPRESSION, which is the rest.

import { ExternalTokenizer } from '@lezer/lr';
import { ExpressionMode } from './ExpressionMode.js';
import { FormatMode } from './FormatMode.js';
import { IdentifierMode } from './IdentifierMode.js';
import { LabelMode } from './LabelMode.js';
import { LexerInput } from './LexerInput.js';
import { LineMode } from './LineMode.js';
import { TemplateMode } from './TemplateMode.js';
import { TemplateStartMode } from './TemplateStartMode.js';

const MODES = [new TemplateMode(), new TemplateStartMode(), new LabelMode(), new IdentifierMode(), new FormatMode(),
  new LineMode(), new ExpressionMode()];

export const lexerModes = new ExternalTokenizer((input, stack) => {
  const text = new LexerInput(input);
  const mode = MODES.find((candidate) => candidate.isActive(stack));
  if (!mode.hide(text)) {
    mode.read(text, stack);
  }
}, { contextual: true });
