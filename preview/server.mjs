import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 5179);

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

const clients = new Set();
let reloadTimer = null;

function sendReload() {
  for (const res of clients) {
    res.write('event: reload\n');
    res.write('data: now\n\n');
  }
}

function readTopics() {
  const topicsPath = path.join(root, 'meta', 'topics.json');
  return JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
}

function createToc() {
  const meta = readTopics();
  const topics = (meta.topics || []).map(topic => {
    const pages = topic.pages || [];
    const count = topic.count ?? pages.length;
    return {
      name: topic.name,
      count,
      pages: pages.map((page, index) => ({
        ...page,
        topicName: topic.name,
        topicIndex: index + 1,
        topicTotal: count
      }))
    };
  });

  const flat = topics
    .flatMap(topic => topic.pages)
    .sort((a, b) => Number(a.number || 0) - Number(b.number || 0));

  return {
    generatedAt: meta.generatedAt || new Date().toISOString(),
    siteUrl: meta.siteUrl || '',
    totalPages: meta.totalPages ?? flat.length,
    topics,
    flat
  };
}

function sendJson(res, payload) {
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload, null, 2));
}

function watchForReloads() {
  try {
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
  } catch (err) {
    console.warn(`Preview live reload disabled: ${err?.message || err}`);
  }
}

watchForReloads();

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
  const address = server.address();
  const actualPort = typeof address === 'object' && address ? address.port : port;
  const url = new URL(req.url, `http://${host}:${actualPort}`);
  let pathname = decodeURIComponent(url.pathname);

  function isForbiddenForServing(relPath) {
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

  if (pathname === '/api/toc') {
    try {
      sendJson(res, createToc());
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`TOC error: ${err?.message || err}`);
    }
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

server.listen(port, host, () => {
  const address = server.address();
  const actualPort = typeof address === 'object' && address ? address.port : port;
  console.log(`Preview server running: http://${host}:${actualPort}/preview`);
});
