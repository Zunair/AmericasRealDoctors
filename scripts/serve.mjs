import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const host = process.env.HOST ?? '127.0.0.1';
const port = Number.parseInt(process.env.PORT ?? '4173', 10);
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8']
]);

function sendError(response, statusCode, message) {
  response.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(message);
}

function resolveRequestPath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, `http://${host}`).pathname);
  const requestedPath = resolve(root, `.${pathname}`);

  if (requestedPath !== root && !requestedPath.startsWith(`${root}${sep}`)) {
    return null;
  }

  try {
    return statSync(requestedPath).isDirectory()
      ? resolve(requestedPath, 'index.html')
      : requestedPath;
  } catch {
    return requestedPath;
  }
}

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  let filePath;
  try {
    filePath = resolveRequestPath(request.url ?? '/');
  } catch {
    sendError(response, 400, 'Bad request');
    return;
  }

  if (!filePath) {
    sendError(response, 403, 'Forbidden');
    return;
  }

  let fileStats;
  try {
    fileStats = statSync(filePath);
  } catch {
    sendError(response, 404, 'Not found');
    return;
  }

  if (!fileStats.isFile()) {
    sendError(response, 404, 'Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Length': fileStats.size,
    'Content-Type': contentTypes.get(extname(filePath).toLowerCase()) ?? 'application/octet-stream'
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`America's Real Doctors is available at http://${host}:${port}`);
});