import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));
const root = resolve(projectRoot, process.argv.includes('--dist') ? 'dist' : '.');
const port = Number(process.env.PORT || process.argv.find((value) => /^\d+$/.test(value)) || 4173);
const mime = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8', '.webmanifest':'application/manifest+json; charset=utf-8',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp',
  '.wav':'audio/wav', '.mp3':'audio/mpeg', '.ico':'image/x-icon', '.txt':'text/plain; charset=utf-8'
};
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');

function securityHeaders(file, status) {
  const extension = extname(file).toLowerCase();
  const htmlLike = extension === '.html';
  const noCache = htmlLike || file.endsWith('service-worker.js') || status >= 400;
  return {
    'Cache-Control': noCache ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600',
    'Content-Security-Policy': CSP,
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    ...(file.endsWith('service-worker.js') ? {'Service-Worker-Allowed':'/'} : {})
  };
}
function insideRoot(file) {
  const rel = relative(root, file);
  return rel === '' || (!rel.startsWith('..') && !rel.includes(`..${process.platform === 'win32' ? '\\' : '/'}`) && !resolve(file).startsWith(`${resolve(root)}..`));
}
function resolveRequest(pathname) {
  const clean = pathname.replaceAll('\\','/').replace(/^\/+/, '');
  let file = resolve(root, clean || 'index.html');
  if (!insideRoot(file)) throw new Error('Path traversal');
  if (existsSync(file) && statSync(file).isFile()) return { file, status: 200 };
  if (!extname(clean)) {
    const html = `${file}.html`;
    if (insideRoot(html) && existsSync(html) && statSync(html).isFile()) return { file: html, status: 200 };
  }
  return { file: resolve(root, '404.html'), status: 404 };
}
function sendText(response, status, text, extra = {}) {
  const body = Buffer.from(text);
  response.writeHead(status, {
    'Content-Type':'text/plain; charset=utf-8',
    'Content-Length':body.length,
    'X-Content-Type-Options':'nosniff',
    ...extra
  });
  response.end(body);
}

const server = http.createServer((request,response) => {
  try {
    const method = request.method || 'GET';
    if (!['GET','HEAD'].includes(method)) {
      sendText(response, 405, 'Method Not Allowed', {'Allow':'GET, HEAD'});
      return;
    }
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.includes('\0')) throw new Error('Invalid path');
    const pathname = decodeURIComponent(url.pathname);
    const { file, status } = resolveRequest(pathname.endsWith('/') && pathname !== '/' ? `${pathname}index.html` : pathname);
    const fileStat = statSync(file);
    const headers = {
      'Content-Type': mime[extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': fileStat.size,
      ...securityHeaders(file, status)
    };
    response.writeHead(status, headers);
    if (method === 'HEAD') { response.end(); return; }
    const stream = createReadStream(file);
    stream.on('error',()=>{ if (!response.headersSent) sendText(response,500,'Internal Server Error'); else response.destroy(); });
    stream.pipe(response);
  } catch (error) {
    sendText(response, 400, `Bad request: ${error.message}`, {
      'Content-Security-Policy':CSP,
      'Referrer-Policy':'same-origin'
    });
  }
});

server.listen(port, '0.0.0.0', () => console.log(`HALO OF FLESH — http://127.0.0.1:${port}`));
