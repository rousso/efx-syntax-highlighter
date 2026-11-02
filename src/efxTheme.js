import { styleTags, tags as t } from "@lezer/highlight";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";

export const efxHighlighting = styleTags({
    LET: t.keyword,
    WITH: t.keyword,
    WHEN: t.keyword,
    OTHERWISE: t.keyword,
    DISPLAY: t.keyword,
    INVOKE: t.keyword,
    INDEX: t.keyword,
    BY: t.keyword,
    SHARPVALUE: t.variableName,
    XB: t.bracket,
    TB: t.bracket,
    HB: t.bracket,
    LB: t.bracket,
    RB: t.bracket,
    LP: t.bracket,
    RP: t.bracket,
    Keyword: t.className,
    BuiltInFunction: t.function(t.keyword),
    "fragment/Identifier": t.function(t.name),
    "LabelKeyword": t.className,  
    "FormattedExpressionBlock/DOLLAR": t.variableName,
    "LabelBlock/SHARP": t.variableName,
    "LabelBlock/Identifier": t.special(t.name),
    "LabelBlock/Keyword": t.special(t.name),
    "AssetId/Keyword": t.special(t.name),
    "AssetId/LabelKeyword": t.special(t.name),
    "AssetId/Identifier": t.special(t.name),
    "TextBlock/Identifier": t.special(t.string),
    "TextBlock/Keyword": t.special(t.string),
    "TextBlock/LabelKeyword": t.special(t.string),
    "TextBlock/Operator": t.special(t.string),
    "TextBlock/SHARPVALUE": t.variableName,
    "TextBlock/DOLLARVALUE": t.variableName,
    Type: t.typeName,
    String: t.literal,
    Number: t.literal,
    Boolean: t.literal,
    DurationLiteral: t.literal,
    FieldId: t.propertyName,
    NodeId: t.propertyName,
    Variable: t.variableName,
    Identifier: t.name,
    Operator: t.operator,
    Delimiter: t.punctuation,
    Bracket: t.punctuation,
    Brace: t.punctuation,
    Parenthesis: t.punctuation,
    Pipe: t.punctuation,
    Punctuation: t.punctuation,
    Comment: t.lineComment,
    FreeText: t.special(t.string)
});

export const efxColors = syntaxHighlighting(
  HighlightStyle.define([
    { tag: t.keyword, color: "#7058be", fontWeight: "bold" },
    { tag: t.typeName, color: "#7058be" },
    { tag: t.literal, color: "#e14775" },
    { tag: t.propertyName, color: "#269d69", fontWeight: "bold" },
    { tag: t.variableName, color: "#cc7a0a", fontWeight: "bold" },
    { tag: t.function(t.name), color: "#cc7a0a", fontWeight: "bold" },
    { tag: t.function(t.keyword), color: "#7058be",  fontWeight: "bold" },
    { tag: t.name, color: "#24292e" },
    { tag: t.className, color: "#7058be" },
    { tag: t.operator, color: "#6d6d6d", fontWeight: "bold" },
    { tag: t.punctuation, color: "#cc7a0a" },
    { tag: t.bracket, color: "#cc7a0a" },
    { tag: t.lineComment, color: "#999999", fontStyle: "italic" },
    { tag: t.special(t.name), color:  "#e14775" },
    { tag: t.special(t.string), color: "black" },
  ])
);

export const efxTheme = EditorView.theme({
  "&": {
    backgroundColor: "#ffffff",
    color: "#000000"
  },
  ".cm-content": {
    backgroundColor: "#ffffff",
    caretColor: "#000000"
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "#000000 !important",
    borderLeftWidth: "2px !important",
    borderLeftStyle: "solid !important"
  },
  ".cm-selectionMatch": {
    backgroundColor: "#add6ff !important"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#000000 !important"
  }
});

export let extensions = [
  efxTheme,
  efxColors,
];
