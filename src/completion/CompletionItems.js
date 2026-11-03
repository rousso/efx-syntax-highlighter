// The toolkit's completion list (src/generated/completions.js) by word: the option for a word the
// editor offers. A function is offered as a call where an expression can start, which is where the
// parser can take `(`: its word, then the required parameters of its first signature as fields to
// fill in, with all its signatures as information. Elsewhere its word is offered bare, as `not` and
// `empty` after `is`. The list writes a property with its colon; its word is offered after the
// colon. A word the list does not have is offered as a keyword.

import { snippetCompletion } from '@codemirror/autocomplete';

// The type of option of each kind of item, which picks its icon.
const TYPES = { FUNCTION: 'function', KEYWORD: 'keyword', PROPERTY: 'property' };

export class CompletionItems {
  #byWord = new Map();

  constructor(items) {
    for (const item of items) {
      const word = item.label.replace(/^:/, '');
      this.#byWord.set(word, [...(this.#byWord.get(word) ?? []), item]);
    }
  }

  /** The option for a word, as a call when an expression can start where it goes. */
  optionFor(word, expressionStarts) {
    const items = this.#byWord.get(word) ?? [];
    const functions = items.filter(({ kind }) => kind === 'FUNCTION');
    if (expressionStarts && functions.length > 0) {
      return CompletionItems.#call(word, functions);
    }
    const item = items.find(({ kind }) => kind !== 'FUNCTION');
    return { label: word, type: TYPES[item?.kind ?? 'KEYWORD'], detail: item?.dataType };
  }

  static #call(word, functions) {
    const [first] = functions;
    const fields = first.parameters.filter(({ optional }) => !optional).map(({ name }) => `\${${name}}`);
    return snippetCompletion(`${word}(${fields.join(', ')})`, {
      label: word,
      type: TYPES.FUNCTION,
      detail: first.dataType,
      info: functions.map((item) => CompletionItems.#signature(item)).join('\n'),
    });
  }

  /** A signature as the toolkit's list writes it: `label(name TYPE, name TYPE?, name TYPE...) -> TYPE`. */
  static #signature({ label, parameters, dataType }) {
    const mark = ({ optional, variadic }) => (optional ? '?' : variadic ? '...' : '');
    const written = parameters.map((parameter) => `${parameter.name} ${parameter.dataType}${mark(parameter)}`);
    return `${label}(${written.join(', ')}) -> ${dataType}`;
  }
}
