// The highlighting the editor gives a text, as a list of runs: each run of text with the same
// highlight tags, one per line, as `line:column`, the tags and the text, separated by tabs. Text
// with no tag is left out.

import { highlightTree } from '@lezer/highlight';
import { parser } from '../../dist/efx-parser.js';

// Names a run by its tags, as Lezer writes them (`function(keyword)`).
const TAG_NAMES = { style: (tags) => tags.map(String).join(' ') };

export class StyleDump {
  /** The runs of a text read from a top. */
  static of(text, top) {
    const tree = parser.configure({ top }).parse(text);
    const lineStarts = StyleDump.#lineStarts(text);
    const runs = [];
    highlightTree(tree, TAG_NAMES, (from, to, tags) => {
      const line = lineStarts.findLastIndex((start) => start <= from);
      runs.push(`${line + 1}:${from - lineStarts[line] + 1}\t${tags}\t${JSON.stringify(text.slice(from, to))}`);
    });
    return runs;
  }

  static #lineStarts(text) {
    return [0, ...Array.from(text.matchAll(/\n/g), (match) => match.index + 1)];
  }
}
