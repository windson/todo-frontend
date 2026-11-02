// Minimal Node HTTP static server for the todo-frontend SPA.
//
// This file is the AWS Lambda Web Function entrypoint. Lambda Web Functions run
// a standard Node.js HTTP server process that listens on a port; this server
// serves the built Vite output in dist/ and is intentionally dependency-free
// (Node built-ins only: http, fs, path, url).
//
// Behaviour:
//   - serves files from dist/ with correct Content-Type (incl. PWA assets
//     sw.js and manifest.webmanifest),
//   - returns index.html for unknown, non-asset routes (SPA client-side
//     routing fallback),
//   - listens on process.env.PORT (default 8080).
//
// It does NOT touch any React app/business logic; it only serves the static
// build artifacts produced by `vite build`.

import { createServer } from 'node:http'
import { createReadStream, promises as fs } from 'node:fs'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST_DIR = resolve(__dirname, 'dist')
const PORT = Number.parseInt(process.env.PORT ?? '8080', 10)
const INDEX_HTML = join(DIST_DIR, 'index.html')

// Content types keyed by file extension. PWA assets (sw.js, .webmanifest) are
// covered so browsers register the service worker and manifest correctly.
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

function contentTypeFor(filePath) {
  return CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
}

// Resolve a request path to a file inside DIST_DIR, guarding against path
// traversal: the resolved path must stay within DIST_DIR.
function resolveWithinDist(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0])
  const safe = normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '')
  const candidate = resolve(DIST_DIR, '.' + (safe.startsWith('/') ? safe : '/' + safe))
  if (candidate !== DIST_DIR && !candidate.startsWith(DIST_DIR + sep)) {
    return null
  }
  return candidate
}

async function statFile(filePath) {
  try {
    const stat = await fs.stat(filePath)
    return stat.isFile() ? stat : null
  } catch {
    return null
  }
}

function sendFile(res, filePath, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': contentTypeFor(filePath) })
  const stream = createReadStream(filePath)
  stream.on('error', () => {
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Internal Server Error')
  })
  stream.pipe(res)
}

const server = createServer(async (req, res) => {
  // Only GET/HEAD are served; this is a read-only static host.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Method Not Allowed')
    return
  }

  // Lightweight health endpoint for the platform/load balancer.
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('ok')
    return
  }

  const requestPath = req.url === '/' ? '/index.html' : req.url
  const target = resolveWithinDist(requestPath)

  if (target) {
    const stat = await statFile(target)
    if (stat) {
      sendFile(res, target)
      return
    }
  }

  // SPA fallback: unknown, non-asset routes return index.html so the client
  // router can take over. A path that looks like a file (has an extension)
  // but is missing returns 404 instead of the HTML shell.
  if (extname(requestPath.split('?')[0]) === '') {
    const indexStat = await statFile(INDEX_HTML)
    if (indexStat) {
      sendFile(res, INDEX_HTML, 200)
      return
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('Not Found')
})

server.listen(PORT, () => {
  // Single, non-sensitive startup line. Never dump process.env here.
  console.log(`todo-frontend static server listening on port ${PORT}`)
})
