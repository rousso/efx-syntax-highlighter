// Serves the repository for the demo page, demo/index.html, which loads the build in dist/, the
// samples in test/ and CodeMirror from node_modules/: `npm run build`, then `npm run demo`, then open
// the address it prints. Only files inside the repository are served.

import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PORT = Number(process.env.PORT ?? 8080);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.efx': 'text/plain; charset=utf-8' };

/** The file of the repository that a request asks for, or null when it asks for none. */
function fileOf(request) {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.join(ROOT, pathname.endsWith('/') ? `${pathname}index.html` : pathname);
    return file.startsWith(ROOT) ? file : null;
  } catch {
    return null;
  }
}

http.createServer(async (request, response) => {
  const file = fileOf(request);
  if (file === null) {
    response.writeHead(404).end();
    return;
  }
  try {
    const body = await fs.readFile(file);
    response.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    response.writeHead(404).end();
  }
}).listen(PORT, () => console.log(`Demo: http://localhost:${PORT}/demo/`));
