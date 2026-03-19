import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const port = 5179;

const clients = new Set();
let reloadTimer = null;

function sendReload() {
  for (const res of clients) {
    res.write('event: reload\n');
    res.write('data: now\n\n');
  }
}

fs.watch(root, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  const normalized = String(filename).replaceAll('\\', '/');
  if (
    normalized.startsWith('node_modules/') ||
    normalized.startsWith('.git/') ||
    normalized.startsWith('dist/') ||
    normalized.startsWith('sources/legacy/') ||
    normalized.startsWith('sources/backups/')
  ) return;

  if (reloadTimer) clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => sendReload(), 180);
});

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js' || ext === '.mjs') return 'application/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'text/plain; charset=utf-8';
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  let pathname = decodeURIComponent(url.pathname);

  function isForbiddenForServing(relPath) {
    // Repo-internal docs: never expose via preview server.
    return relPath === 'rules.html' || relPath === 'rules.md';
  }

  if (pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (pathname === '/' || pathname === '/preview') {
    pathname = '/preview/index.html';
  }

  const relPath = pathname.replace(/^\/+/, '');
  if (isForbiddenForServing(relPath)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Not found');
    return;
  }

  const filePath = path.resolve(root, relPath);
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  res.writeHead(200, { 'Content-Type': contentType(filePath) });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Preview server running: http://127.0.0.1:${port}/preview`);
});