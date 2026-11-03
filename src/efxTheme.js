// The look of EFX in an editor: the colour of each highlight tag (efxHighlightStyle), which efx()
// gives the editor as its default colours, and a look for the editor itself (efxTheme), which an
// application adds if it wants it.
import { tags as t } from "@lezer/highlight";
import { HighlightStyle } from "@codemirror/language";
import { EditorView } from "@codemirror/view";

export const efxHighlightStyle = HighlightStyle.define([
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
]);

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
