// The table of token names: for each kind of token the EFX-2 lexer makes in the corpus, the node the
// editor's grammar uses for it, or null where the grammar has no node for it. Since P2.3 every kind,
// in template and rules files alike, is named as in the lexer. A kind missing from the table fails
// the test, so a new kind of token in the lexer is noticed.

// The kinds named the same on both sides.
const SAME_NAMES = [
  // Identifiers.
  'FieldId', 'NodeId', 'BtId', 'Identifier',
  // Punctuation and prefixes.
  'Colon', 'Pipe', 'Comma', 'Semicolon', 'Assignment', 'OpenParenthesis', 'CloseParenthesis', 'OpenBracket',
  'CloseBracket', 'StartExpressionBlock', 'EndBlock', 'VariablePrefix', 'HashPrefix', 'AtPrefix', 'FunctionPrefix',
  // Template files: lines, sections and includes.
  'Tabs', 'OutlineNumber', 'CRLF', 'Let', 'With', 'When', 'Display', 'Otherwise', 'Invoke', 'Index', 'By',
  'Template', 'SummarySectionHeader', 'NavigationSectionHeader', 'IncludeDirective', 'IncludePath',
  // Rules files.
  'StageHeaderStart', 'StageIdentifier', 'StageHeaderEnd', 'RuleIdentifier', 'Assert', 'As', 'Error', 'Warning',
  'FOR', 'IN', 'Scope', 'Post',
  // Template text and labels.
  'FreeText', 'Whitespace', 'ShorthandFieldValueReferenceFromContextField',
  'ShorthandIndirectLabelReferenceFromContextField', 'StartLabelBlock', 'AssetType', 'LabelType', 'OtherAssetId',
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

const TABLE = new Map(SAME_NAMES.map((name) => [name, name]));

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
