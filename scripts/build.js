
// Build script to generate parser from grammar (ESM)
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const grammarFile = path.join(__dirname, '../grammar/efx.grammar');
const srcDir = path.join(__dirname, '../src');
const distDir = path.join(__dirname, '../dist');

try {
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);
  execSync(`npx lezer-generator ${grammarFile} -o ${distDir}/efx-parser.js`, { stdio: 'inherit' });
  console.log('Parser generated successfully in dist/.');

  // Copy all relevant JS files from src to dist (except parser)
  // The parser loads efxWords.js, and efxWords.js loads generated/words.js, from dist/. A file
  // missing from src/ fails the build.
  const filesToCopy = ['efxLanguage.js', 'efxTheme.js', 'index.js', 'efxWords.js', 'generated/words.js'];
  for (const file of filesToCopy) {
    const distFile = path.join(distDir, file);
    fs.mkdirSync(path.dirname(distFile), { recursive: true });
    fs.copyFileSync(path.join(srcDir, file), distFile);
  }
  // Copy efxTheme.js for Lezer external propSource
  const themeSrc = path.join(srcDir, 'efxTheme.js');
  const themeDist = path.join(distDir, 'efxTheme.js');
  if (fs.existsSync(themeSrc)) {
    fs.copyFileSync(themeSrc, themeDist);
  }
  console.log('Copied source files to dist/.');
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
