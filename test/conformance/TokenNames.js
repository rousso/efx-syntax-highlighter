// The table of token names: for each kind of token the EFX-2 lexer makes in the corpus, the node the
// editor's grammar uses for it, or null where the grammar has no node for it yet. It follows the
// grammar as it is today; as the grammar takes the lexer's token names, each row becomes the same name
// on both sides.

const KEYWORD = 'Keyword';
const OPERATOR = 'Operator';

// The kinds named the same on both sides.
const SAME_NAMES = [
  // Identifiers.
  'FieldId', 'NodeId', 'BtId', 'Identifier',
  // Punctuation and prefixes.
  'Colon', 'Pipe', 'Comma', 'OpenParenthesis', 'CloseParenthesis', 'OpenBracket', 'CloseBracket',
  'VariablePrefix', 'HashPrefix', 'AtPrefix', 'FunctionPrefix',
  // Template lines.
  'OutlineNumber', 'FreeText',
  // Literals.
  'IntegerLiteral', 'DecimalLiteral', 'StringLiteral', 'True', 'False', 'DayTimeDurationLiteral',
  'YearMonthDurationLiteral',
  // Operators.
  'Comparison', 'Plus', 'Minus', 'Star', 'Slash', 'Percent',
  // Words of expressions.
  'And', 'Or', 'Not', 'Is', 'In', 'Like', 'Present', 'Unique', 'Has', 'No', 'Duplicates', 'Every', 'Some',
  'Satisfies', 'If', 'Then', 'Else', 'For', 'Return', 'At', 'Text', 'Number', 'Indicator', 'Date', 'Time',
  'IsMasked', 'RawValue', 'PreferredLanguageText',
  // Functions.
  'ConcatFunction', 'CountFunction', 'DistinctValuesFunction', 'FormatNumberFunction', 'IntersectFunction',
  'StartsWithFunction', 'StringLengthFunction', 'SumFunction', 'UnionFunction',
];

const TABLE = new Map([...SAME_NAMES.map((name) => [name, name]), ...Object.entries({
  // Identifiers.
  OtherAssetId: 'Identifier',
  RuleIdentifier: 'Identifier',
  StageIdentifier: 'Identifier',

  // Punctuation.
  EndBlock: 'RB',
  ShorthandFieldValueReferenceFromContextField: 'DollarValue',
  ShorthandIndirectLabelReferenceFromContextField: 'SharpValue',

  // Template lines.
  Let: 'LET',
  With: 'WITH',
  When: 'WHEN',
  Display: 'DISPLAY',
  Otherwise: 'OTHERWISE',
  Invoke: 'INVOKE',
  Index: 'INDEX',
  By: 'BY',
  CRLF: 'EOL',
  Assignment: OPERATOR,

  // Labels.
  AssetType: 'LabelKeyword',
  LabelType: 'LabelKeyword',

  // Words of template lines and rules files.
  IN: KEYWORD,
  FOR: KEYWORD,
  Template: KEYWORD,
  Assert: KEYWORD,
  As: KEYWORD,
  Error: KEYWORD,
  Warning: KEYWORD,
  Scope: KEYWORD,
  Post: KEYWORD,

  // No node in the editor's grammar yet.
  StartExpressionBlock: null,
  StartLabelBlock: null,
  Semicolon: null,
  Tabs: null,
  Whitespace: null,
  IncludeDirective: null,
  IncludePath: null,
  StageHeaderStart: null,
  StageHeaderEnd: null,
  SummarySectionHeader: null,
  NavigationSectionHeader: null,
})]);

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
