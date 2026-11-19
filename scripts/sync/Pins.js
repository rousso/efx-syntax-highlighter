// The two commits the generated files come from, recorded in package.json as config.sdk and
// config.toolkit.

import fs from 'node:fs';
import { GitHubCommit } from './GitHubCommit.js';

const PACKAGE = new URL('../../package.json', import.meta.url);

export class Pins {
  constructor(sdk, toolkit) {
    this.sdk = sdk;
    this.toolkit = toolkit;
  }

  /** The pins given on the command line: `npm run sync -- <sdk> <toolkit>`. */
  static of([sdk, toolkit, ...rest]) {
    if (!sdk || !toolkit || rest.length > 0) {
      throw new Error('Usage: npm run sync [-- <owner/eForms-SDK@commit> <owner/efx-toolkit-java@commit>]');
    }
    return new Pins(GitHubCommit.parse(sdk), GitHubCommit.parse(toolkit));
  }

  /** The pins recorded in package.json. */
  static recorded() {
    const { config } = Pins.#package();
    return new Pins(GitHubCommit.parse(config.sdk), GitHubCommit.parse(config.toolkit));
  }

  /** The same pins, each commit named by its full hash. */
  async resolved() {
    const [sdk, toolkit] = await Promise.all([this.sdk.resolved(), this.toolkit.resolved()]);
    return new Pins(sdk, toolkit);
  }

  record() {
    const manifest = Pins.#package();
    manifest.config = { ...manifest.config, sdk: String(this.sdk), toolkit: String(this.toolkit) };
    fs.writeFileSync(PACKAGE, JSON.stringify(manifest, null, 2) + '\n');
  }

  static #package() {
    return JSON.parse(fs.readFileSync(PACKAGE, 'utf8'));
  }
}
