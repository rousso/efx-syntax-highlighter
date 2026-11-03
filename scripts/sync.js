// Copies into the highlighter what it takes from the EFX-2 grammar and the toolkit, at pinned
// commits, so that build and test need neither network nor Java:
//
//   npm run sync                       reads the commits pinned in package.json again
//   npm run sync -- <sdk> <toolkit>    pins new commits first, each as owner/repository@commit
//
// From the SDK: src/generated/words.js, test/oracle/ (the ANTLR lexer and parser) and test/corpus/ (the view
// templates and rules files). From the toolkit: src/generated/completions.js.

import { AntlrGrammar } from './sync/AntlrGrammar.js';
import { CompletionList } from './sync/CompletionList.js';
import { Corpus } from './sync/Corpus.js';
import { GeneratedFiles } from './sync/GeneratedFiles.js';
import { LexerWords } from './sync/LexerWords.js';
import { Pins } from './sync/Pins.js';

const LEXER_GRAMMAR = 'efx-grammar/EfxLexer.g4';
const PARSER_GRAMMAR = 'efx-grammar/Efx.g4';
const COMPLETIONS = 'src/test/resources/eu/europa/ted/efx/autocomplete/sdk2-completions.txt';

const commandLine = process.argv.slice(2);
const pins = await (commandLine.length > 0 ? Pins.of(commandLine) : Pins.recorded()).resolved();
const { sdk, toolkit } = pins;

const [lexerGrammar, parserGrammar, completionList, corpus] = await Promise.all([
  sdk.read(LEXER_GRAMMAR), sdk.read(PARSER_GRAMMAR), toolkit.read(COMPLETIONS), Corpus.of(sdk)]);
const grammar = await AntlrGrammar.generate(lexerGrammar, parserGrammar);
const words = new LexerWords(grammar);
const completions = CompletionList.parse(completionList.toString('utf8'));

const output = new GeneratedFiles();
output.write('src/generated/words.js', words.toModule(sdk));
output.write('src/generated/completions.js', completions.toModule(`${COMPLETIONS} at ${toolkit}`));
output.replaceFolder('test/oracle', grammar.oracleFiles(sdk));
output.replaceFolder('test/corpus', corpus.files());
pins.record();

console.log(`Synced from ${sdk} and ${toolkit}:
  words: ${words}
  ${completions.size} completion items, ${corpus.size} corpus files`);
