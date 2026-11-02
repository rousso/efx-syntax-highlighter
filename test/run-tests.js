// Minimal test runner for efx parser (ESM)
import fs from 'fs';
import path from 'path';
import { parser } from '../dist/efx-parser.js';

const sample = fs.readFileSync(path.join(path.dirname(import.meta.url.replace('file://', '')), 'sample.efx'), 'utf8');

try {
  const tree = parser.parse(sample);
  const rootName = tree.type.name;
  if (!tree || tree.length === 0) {
    console.error('Parse failed: tree is empty');
    process.exit(1);
  } else if (rootName !== "TemplateFile") {
    console.error(`Parse failed: unexpected root node '${rootName}' (expected 'TemplateFile')`);
    process.exit(1);
  } else {
    console.log('Parse successful. Root node:', rootName);
    process.exit(0);
  }
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
