// A GitHub repository at one commit: the source the sync reads its files from. The API resolves
// the commit and lists its files; the bytes come from raw.githubusercontent.com, which does not
// count against the API's hourly limit (60 calls without a token).

const PIN = /^(?<repository>[\w.-]+\/[\w.-]+)@(?<commit>[0-9a-f]{7,40})$/;

export class GitHubCommit {
  #repository;
  #commit;
  #files;

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
    if (this.#commit.length === 40) {
      return this;
    }
    const { sha } = await this.#api(`commits/${this.#commit}`);
    return new GitHubCommit(this.#repository, sha);
  }

  /** The paths of the files under a folder, at any depth. */
  async filesUnder(folder) {
    return (await this.#allFiles()).filter((file) => file.startsWith(`${folder}/`));
  }

  /** The bytes of a file, read without the API, which limits the number of calls. */
  async read(path) {
    const encoded = path.split('/').map(encodeURIComponent).join('/');
    const response = await GitHubCommit.#fetch(
      `https://raw.githubusercontent.com/${this.#repository}/${this.#commit}/${encoded}`, {});
    return Buffer.from(await response.arrayBuffer());
  }

  toString() {
    return `${this.#repository}@${this.#commit}`;
  }

  /** The paths of all the files of the commit, listed once. */
  #allFiles() {
    this.#files ??= this.#api(`git/trees/${this.#commit}?recursive=1`).then(({ tree, truncated }) => {
      if (truncated) {
        throw new Error(`GitHub truncated the file list of ${this}`);
      }
      return tree.filter((entry) => entry.type === 'blob').map((entry) => entry.path);
    });
    return this.#files;
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
