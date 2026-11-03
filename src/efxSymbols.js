// The field and node ids an application gives the editor, which it offers where the grammar takes
// one: an extension, `efxSymbols.of({ fields, nodes })`, each a list of ids, for example those of
// the SDK's fields.json. The ids of several such extensions add up.

import { Facet } from '@codemirror/state';

export const efxSymbols = Facet.define({
  combine: (symbols) => ({
    fields: symbols.flatMap(({ fields = [] }) => fields),
    nodes: symbols.flatMap(({ nodes = [] }) => nodes),
  }),
});
