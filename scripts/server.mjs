import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)), process.argv.includes('--dist') ? 'dist' : '.');
const port = Number(process.env.PORT || process.argv.find((v) => /^\d+$/.test(v)) || 4173);
const mime = {
  '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8',
  '.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp',
  '.wav':'audio/wav','.mp3':'audio/mpeg','.ico':'image/x-icon'
};

const server = http.createServer((request,response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    let file = resolve(join(root, safe));
    if (!file.startsWith(root)) throw new Error('Path traversal');
    if (!existsSync(file) || statSync(file).isDirectory()) {
      if (!extname(pathname) && existsSync(`${file}.html`)) file = `${file}.html`;
      else file = join(root, 'index.html');
    }
    const type = mime[extname(file).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': extname(file) === '.html' || file.endsWith('service-worker.js') ? 'no-cache' : 'public, max-age=3600',
      'X-Content-Type-Options':'nosniff',
      'Referrer-Policy':'same-origin'
    });
    createReadStream(file).pipe(response);
  } catch (error) {
    response.writeHead(400, {'Content-Type':'text/plain; charset=utf-8'});
    response.end(`Bad request: ${error.message}`);
  }
});
server.listen(port, '0.0.0.0', () => console.log(`HALO OF FLESH — http://127.0.0.1:${port}`));
