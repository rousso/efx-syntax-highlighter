// The toolkit's completion items for SDK 2, read from the text form it pins in its tests
// (sdk2-completions.txt): one item per line, `KIND label(name TYPE, ...) -> TYPE`, where a
// parameter is marked ? when it is optional and ... when it repeats.

const ITEM = /^(?<kind>FUNCTION|KEYWORD|PROPERTY) (?<label>[^\s(]+)(?:\((?<parameters>.*)\))? -> (?<dataType>\w+)$/;
const PARAMETER = /^(?<name>\w+) (?<dataType>\w+)(?<mark>\?|\.\.\.)?$/;

export class CompletionList {
  #items;

  constructor(items) {
    this.#items = items;
  }

  /** Reads the text form; comment lines start with #. */
  static parse(text) {
    const lines = text.split(/\r?\n/).filter((line) => line !== '' && !line.startsWith('#'));
    return new CompletionList(lines.map((line) => CompletionList.#itemOf(line)));
  }

  get size() {
    return this.#items.length;
  }

  /** The text of src/generated/sdk2-completions.json. */
  toFile(source) {
    return JSON.stringify({ source, items: this.#items }, null, 2) + '\n';
  }

  static #itemOf(line) {
    const match = ITEM.exec(line);
    if (!match || (match.groups.kind === 'FUNCTION') !== (match.groups.parameters !== undefined)) {
      throw new Error(`Not a completion item: ${line}`);
    }
    const { kind, label, dataType, parameters } = match.groups;
    const item = { label, kind, dataType };
    return parameters === undefined ? item : { ...item, parameters: CompletionList.#parametersOf(parameters, line) };
  }

  static #parametersOf(text, line) {
    return text === '' ? [] : text.split(', ').map((parameter) => CompletionList.#parameterOf(parameter, line));
  }

  static #parameterOf(text, line) {
    const match = PARAMETER.exec(text);
    if (!match) {
      throw new Error(`Not a parameter: ${text} in ${line}`);
    }
    const { name, dataType, mark } = match.groups;
    return { name, dataType, optional: mark === '?', variadic: mark === '...' };
  }
}
