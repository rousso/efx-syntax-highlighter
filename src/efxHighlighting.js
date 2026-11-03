// The highlight tags of the grammar: which tag each kind of node carries, read by the parser
// (grammar/efx.grammar, @external propSource). The colours of the tags are in efxTheme.js.
import { styleTags, tags as t } from "@lezer/highlight";

// The highlight tag of each kind of node of the grammar (grammar/efx.grammar), named by the node or by
// the node and its parent (Parent/Node). A node that is not listed is plain text.
export const EFX_STYLES = {
  // The words that start a line, a part of a line or a clause of a rule, and the headers.
  "Let With When Otherwise Display Invoke Index By Compute Select": t.keyword,
  "Endpoint ApiEndpointDeclaration/At Call Api On OnErrorClause/Error": t.keyword,
  "Assert Report OtherwiseAssert OtherwiseReport As FOR IN Scope": t.keyword,
  "IncludeDirective SummarySectionHeader NavigationSectionHeader StageHeaderStart StageHeaderEnd": t.keyword,

  // The words of expressions.
  "And Or Not Is In Like Present Empty Unique Has No Duplicates Every Some Satisfies If Then Else For Return": t.className,
  "Distinct At": t.className,
  // The words chosen from a fixed list: asset and label types, format options, field properties,
  // severities, what a failed call does, any notice type and the scope annotations.
  "AssetType LabelType FormatDecimals FormatShort FormatMedium FormatLong FormatNoUnit FormatNoFormatting": t.className,
  "PublicationDate JustificationCode JustificationDescription WasWithheld IsWithheld IsWithholdable IsDisclosed": t.className,
  "IsMasked PrivacyCode RawValue PreferredLanguage PreferredLanguageText": t.className,
  "Error Warning Info Warn Reject Any AnyNoticeTypes/Star Pre Post": t.className,

  // Types, with the colon after them in a declaration.
  "Text Number Indicator Date Time Duration ContextType Template Dynamic TypeDeclaration/Star": t.typeName,
  "TypedVariableInitializer/Colon DynamicVariableInitializer/Colon ContextVariableInitializer/Colon": t.typeName,
  "ParameterDeclaration/Colon ValueIterator/Colon ContextIterator/Colon": t.typeName,
  "FunctionDeclaration/Colon DynamicFunctionDeclaration/Colon TemplateDefinition/Colon": t.typeName,

  // The built-in functions.
  "BuiltInFunction/Not BuiltInFunction/Indicator BuiltInFunction/Empty BuiltInFunction/Number": t.function(t.keyword),
  "BuiltInFunction/Text BuiltInFunction/Date BuiltInFunction/Time": t.function(t.keyword),
  "CountFunction SubstringFunction SubstringBeforeFunction SubstringAfterFunction ContainsFunction": t.function(t.keyword),
  "StartsWithFunction EndsWithFunction StringLengthFunction IndexOfSubstringFunction SumFunction": t.function(t.keyword),
  "MinFunction MaxFunction AverageFunction AbsoluteFunction RoundFunction RoundDownFunction": t.function(t.keyword),
  "RoundUpFunction YearFunction MonthFunction DayFunction HoursFunction MinutesFunction SecondsFunction": t.function(t.keyword),
  "YearsFunction MonthsFunction DaysFunction FormatNumberFunction FormatShortFunction FormatMediumFunction": t.function(t.keyword),
  "FormatLongFunction UpperCaseFunction LowerCaseFunction NormalizeSpaceFunction TrimFunction": t.function(t.keyword),
  "TrimLeftFunction TrimRightFunction PadLeftFunction PadRightFunction RepeatFunction ReplaceFunction": t.function(t.keyword),
  "ReplaceRegexFunction UrlEncodeFunction CapitalizeFirstFunction ConcatFunction StringJoinFunction": t.function(t.keyword),
  "CurrentDateFunction CurrentTimeFunction DayTimeDurationFunction YearMonthDurationFunction": t.function(t.keyword),
  "AddDuration SubtractDuration DistinctValuesFunction CountDuplicatesFunction GetDuplicatesFunction": t.function(t.keyword),
  "UnionFunction IntersectFunction ExceptFunction SequenceEqualFunction SortFunction ReverseFunction": t.function(t.keyword),
  "SubsequenceFunction IndexOfFunction PreferredLanguageFunction PreferredLanguageTextFunction": t.function(t.keyword),
  "SplitFunction": t.function(t.keyword),

  // Literals, and the notice types of a rule and the path of an include.
  "StringLiteral UuidV4Literal IntegerLiteral DecimalLiteral True False Always Never DateLiteral TimeLiteral": t.literal,
  "DayTimeDurationLiteral YearMonthDurationLiteral NumericLiteral/Minus NoticeType/Identifier NoticeTypeRange/Minus": t.literal,
  IncludePath: t.literal,

  // The data of a notice: fields, nodes and attributes.
  "FieldId NodeId BtId SimpleFieldReference/Identifier FieldMention/Identifier SingleExpression/Identifier": t.propertyName,
  "AttributeReference/AtPrefix AttributeReference/Identifier": t.propertyName,
  "AttributeExpression/AtPrefix AttributeExpression/Identifier": t.propertyName,

  // Variables, and the field value and label of the context in a template.
  "VariablePrefix VariableReference/Identifier TypedVariableInitializer/Identifier": t.variableName,
  "DynamicVariableInitializer/Identifier ContextVariableInitializer/Identifier ParameterDeclaration/Identifier": t.variableName,
  "ValueIterator/Identifier ContextIterator/Identifier DictionaryDeclaration/Identifier": t.variableName,
  "ShorthandFieldValueReferenceFromContextField ShorthandIndirectLabelReferenceFromContextField": t.variableName,

  // Functions and templates that a file declares.
  "FunctionPrefix FunctionInvocation/Identifier FunctionDeclaration/Identifier": t.function(t.name),
  "DynamicFunctionDeclaration/Identifier TemplateDefinition/Identifier InvokeTemplate/Identifier": t.function(t.name),

  // Names of assets: asset ids in a label, codelists, flags, rules and stages.
  "OtherAssetId AssetId/AssetType AssetId/LabelType RuleIdentifier StageIdentifier": t.special(t.name),
  "CodelistReference/HashPrefix CodelistReference/Identifier Flag/HashPrefix Flag/Identifier": t.special(t.name),

  // Template text.
  "FreeText OtherEscapeSequence CharacterReference NewLine": t.special(t.string),

  "Assignment Comparison Plus Minus Star Slash Percent ColonColon": t.operator,
  "OpenParenthesis CloseParenthesis OpenBracket CloseBracket Pipe Colon Dot DotDot Ellipsis": t.punctuation,
  "AttributeReference/Slash AttributeExpression/Slash": t.punctuation,
  "StartExpressionBlock StartLabelBlock StartHyperlinkBlock StartSelectorBlock EndBlock": t.bracket,
  Comment: t.lineComment,
  Identifier: t.name,
};

export const efxHighlighting = styleTags(EFX_STYLES);
