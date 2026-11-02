// The part of the repository the sync writes. Folders it owns are replaced whole, so that a file
// removed from the source is removed here too.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

export class GeneratedFiles {
  write(file, content) {
    const target = path.join(ROOT, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }

  /** Replaces a folder with the given files, a map from their path inside it to their content. */
  replaceFolder(folder, files) {
    fs.rmSync(path.join(ROOT, folder), { recursive: true, force: true });
    for (const [file, content] of files) {
      this.write(path.join(folder, file), content);
    }
  }
}
