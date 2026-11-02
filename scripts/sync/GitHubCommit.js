// A GitHub repository at one commit: the source the sync reads its files from.

const PIN = /^(?<repository>[\w.-]+\/[\w.-]+)@(?<commit>[0-9a-f]{7,40})$/;

export class GitHubCommit {
  #repository;
  #commit;

  constructor(repository, commit) {
    this.#repository = repository;
    this.#commit = commit;
  }

  /** Reads a pin written as owner/repository@commit. */
  static parse(pin) {
    const match = PIN.exec(pin);
    if (!match) {
      throw new Error(`A pin is written owner/repository@commit, not "${pin}"`);
    }
    return new GitHubCommit(match.groups.repository, match.groups.commit);
  }

  /** The same commit named by its full hash, so that the pin cannot become ambiguous. */
  async resolved() {
    const { sha } = await this.#api(`commits/${this.#commit}`);
    return new GitHubCommit(this.#repository, sha);
  }

  /** The paths of the files directly inside a folder. */
  async filesIn(folder) {
    const entries = await this.#api(`contents/${folder}?ref=${this.#commit}`);
    return entries.filter((entry) => entry.type === 'file').map((entry) => entry.path);
  }

  /** The bytes of a file, read without the API, which limits the number of calls. */
  async read(path) {
    const response = await GitHubCommit.#fetch(
      `https://raw.githubusercontent.com/${this.#repository}/${this.#commit}/${path}`, {});
    return Buffer.from(await response.arrayBuffer());
  }

  toString() {
    return `${this.#repository}@${this.#commit}`;
  }

  /** A call to the GitHub API, with GITHUB_TOKEN when it is set, for its higher limit. */
  async #api(route) {
    const headers = process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
    const response = await GitHubCommit.#fetch(`https://api.github.com/repos/${this.#repository}/${route}`, headers);
    return response.json();
  }

  static async #fetch(url, headers) {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`${url} answered ${response.status} ${response.statusText}`);
    }
    return response;
  }
}
