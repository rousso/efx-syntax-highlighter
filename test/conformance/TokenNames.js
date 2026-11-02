// The table of token names: for each kind of token the EFX-2 lexer makes in the corpus, the node the
// editor's grammar uses for it, or null where the grammar has no node for it yet. It follows the
// grammar as it is today; as the grammar takes the lexer's token names, each row becomes the same name
// on both sides.

const KEYWORD = 'Keyword';
const FUNCTION = 'BuiltInFunction';
const LITERAL = 'Literal';
const OPERATOR = 'Operator';
const TYPE = 'Type';

const TABLE = new Map(Object.entries({
  // The same name on both sides.
  FieldId: 'FieldId',
  NodeId: 'NodeId',
  Identifier: 'Identifier',
  Colon: 'Colon',
  Pipe: 'Pipe',
  FreeText: 'FreeText',

  // Identifiers.
  BtId: 'FieldId',
  OtherAssetId: 'Identifier',
  RuleIdentifier: 'Identifier',
  StageIdentifier: 'Identifier',

  // Punctuation.
  Comma: 'Coma',
  EndBlock: 'RB',
  OpenParenthesis: 'Parenthesis',
  CloseParenthesis: 'Parenthesis',
  OpenBracket: 'Bracket',
  CloseBracket: 'Bracket',
  VariablePrefix: 'DOLLAR',
  HashPrefix: 'SHARP',
  AtPrefix: 'AT',
  ShorthandFieldValueReferenceFromContextField: 'DollarValue',
  ShorthandIndirectLabelReferenceFromContextField: 'SharpValue',

  // Template lines.
  OutlineNumber: 'NumericLiteral',
  Let: 'LET',
  With: 'WITH',
  When: 'WHEN',
  Display: 'DISPLAY',
  Otherwise: 'OTHERWISE',
  Invoke: 'INVOKE',
  Index: 'INDEX',
  By: 'BY',
  CRLF: 'EOL',

  // Labels.
  AssetType: 'LabelKeyword',
  LabelType: 'LabelKeyword',

  // Literals.
  IntegerLiteral: LITERAL,
  DecimalLiteral: LITERAL,
  StringLiteral: LITERAL,
  True: LITERAL,
  False: LITERAL,
  DayTimeDurationLiteral: LITERAL,
  YearMonthDurationLiteral: LITERAL,

  // Operators.
  Assignment: OPERATOR,
  Comparison: OPERATOR,
  Plus: OPERATOR,
  Minus: OPERATOR,
  Star: OPERATOR,
  Slash: OPERATOR,
  Percent: OPERATOR,

  // Keywords.
  And: KEYWORD,
  Or: KEYWORD,
  Not: KEYWORD,
  Is: KEYWORD,
  In: KEYWORD,
  IN: KEYWORD,
  Like: KEYWORD,
  Present: KEYWORD,
  Unique: KEYWORD,
  Has: KEYWORD,
  No: KEYWORD,
  Duplicates: KEYWORD,
  Every: KEYWORD,
  Some: KEYWORD,
  Satisfies: KEYWORD,
  If: KEYWORD,
  Then: KEYWORD,
  Else: KEYWORD,
  For: KEYWORD,
  FOR: KEYWORD,
  Return: KEYWORD,
  At: KEYWORD,
  Template: KEYWORD,
  Assert: KEYWORD,
  As: KEYWORD,
  Error: KEYWORD,
  Warning: KEYWORD,
  Scope: KEYWORD,
  Post: KEYWORD,

  // Type words.
  Text: TYPE,
  Number: TYPE,
  Indicator: TYPE,
  Date: TYPE,
  Time: TYPE,

  // Functions.
  ConcatFunction: FUNCTION,
  CountFunction: FUNCTION,
  DistinctValuesFunction: FUNCTION,
  FormatNumberFunction: FUNCTION,
  IntersectFunction: FUNCTION,
  PreferredLanguageText: FUNCTION,
  StartsWithFunction: FUNCTION,
  StringLengthFunction: FUNCTION,
  SumFunction: FUNCTION,
  UnionFunction: FUNCTION,

  // No node in the editor's grammar yet.
  StartExpressionBlock: null,
  StartLabelBlock: null,
  Semicolon: null,
  FunctionPrefix: null,
  Tabs: null,
  Whitespace: null,
  IsMasked: null,
  RawValue: null,
  IncludeDirective: null,
  IncludePath: null,
  StageHeaderStart: null,
  StageHeaderEnd: null,
  SummarySectionHeader: null,
  NavigationSectionHeader: null,
}));

export class TokenNames {
  /** Whether the table has a row for a kind of token. */
  static has(oracleName) {
    return TABLE.has(oracleName);
  }

  /** The editor's node for a kind of token: null when it has none, undefined when the table has no row. */
  static editorNameOf(oracleName) {
    return TABLE.get(oracleName);
  }
}
