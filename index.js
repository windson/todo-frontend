// Minimal Node HTTP static server for the todo-frontend SPA.
//
// This file is the AWS Lambda Web Function entrypoint. The Web Function Node.js
// runtime loads `index.js` at the ROOT of the deployment package by default
// (or the file named by the AWS_LAMBDA_NODEJS_ENTRYPOINT env var). It does NOT
// run a package.json `start`/`serve` script. It also provides the listen
// address via the env var AWS_LAMBDA_HTTP_ENDPOINT, formatted as "host:port"
// (e.g. "0.0.0.0:8080") - NOT as `PORT`. See (official AWS docs):
//   - https://docs.aws.amazon.com/lambda/latest/dg/web-functions-runtimes.html
//   - https://docs.aws.amazon.com/lambda/latest/dg/web-functions-create.html
//   - https://aws.amazon.com/blogs/compute/exploring-aws-lambda-web-functions-for-building-web-applications/
//
// This server serves the built Vite output in dist/ and is intentionally
// dependency-free (Node built-ins only: http, fs, path, url). This file is ESM
// because package.json declares "type": "module".
//
// Behaviour:
//   - serves files from dist/ with correct Content-Type (incl. PWA assets
//     sw.js and manifest.webmanifest),
//   - returns index.html for unknown, non-asset routes (SPA client-side
//     routing fallback),
//   - listens on the host:port from AWS_LAMBDA_HTTP_ENDPOINT (fallback
//     '0.0.0.0:8080'); process.env.PORT is a secondary fallback for local dev.
//
// It does NOT touch any React app/business logic; it only serves the static
// build artifacts produced by `vite build`.

import { createServer } from 'node:http'
import { createReadStream, promises as fs } from 'node:fs'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST_DIR = resolve(__dirname, 'dist')
const INDEX_HTML = join(DIST_DIR, 'index.html')

// Determine the listen address. The Web Function runtime sets
// AWS_LAMBDA_HTTP_ENDPOINT as "host:port" (e.g. "0.0.0.0:8080"); it takes
// precedence because it is what the runtime actually provides. For local dev
// where it is absent, fall back to PORT (host 0.0.0.0), then to 8080. IPv6
// hosts can contain ':' (e.g. "[::1]:8080"), so split on the LAST ':'.
function resolveListenAddress() {
  const endpoint = process.env.AWS_LAMBDA_HTTP_ENDPOINT
  if (endpoint) {
    const lastColon = endpoint.lastIndexOf(':')
    if (lastColon === -1) {
      return { host: endpoint, port: 8080 }
    }
    return {
      host: endpoint.slice(0, lastColon),
      port: Number.parseInt(endpoint.slice(lastColon + 1), 10) || 8080,
    }
  }
  return { host: '0.0.0.0', port: Number.parseInt(process.env.PORT ?? '8080', 10) }
}

const { host: HOST, port: PORT } = resolveListenAddress()

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

server.listen(PORT, HOST, () => {
  // Single, non-sensitive startup line. Never dump process.env here.
  console.log(`todo-frontend static server listening on ${HOST}:${PORT}`)
})
