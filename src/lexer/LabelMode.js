// LABEL mode, in a label block: nothing is hidden. A word is an asset type, a label type or another
// asset id, OtherAssetId: [a-z]+ ([-.] [a-z0-9]+)*, the longest match, which the lexer lists after
// the two types.

import * as terms from '../efx-parser.terms.js';
import { assetTypes, labelTypes } from '../generated/words.js';
import { LexerMode } from './LexerMode.js';

const LABEL_TOKENS = [terms.AssetType, terms.LabelType, terms.OtherAssetId];

export class LabelMode extends LexerMode {
  /** Where the parser can take an asset type, a label type or an asset id. */
  isActive(stack) {
    return LABEL_TOKENS.some((token) => stack.canShift(token));
  }

  read(input) {
    const length = input.assetIdLength();
    const word = input.text(0, length);
    const token = assetTypes.has(word) ? terms.AssetType : labelTypes.has(word) ? terms.LabelType : terms.OtherAssetId;
    input.take(token, length);
  }
}
