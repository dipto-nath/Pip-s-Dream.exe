import http from 'node:http';
import { parse } from 'node:url';
import { JsonStorage } from './jsonStorage';
import {
  handleGetGuestbook,
  handleCreateGuestbook,
  handleRecordVisit,
  handleGetStats,
  handleHealthCheck,
} from './handlers';
import type { GuestbookInput } from './types';

const PORT = Number(process.env.PORT) || 3001;
const storage = new JsonStorage();

function sendJson(res: http.ServerResponse, status: number, body: unknown) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(json);
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = parse(req.url || '', true);
  const path = url.pathname || '/';
  const method = req.method || 'GET';

  if (method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  try {
    if (path === '/api/health' && method === 'GET') {
      const result = await handleHealthCheck(storage);
      sendJson(res, 200, result);
      return;
    }

    if (path === '/api/guestbook') {
      if (method === 'GET') {
        const limit = url.query.limit ? Number(url.query.limit) : undefined;
        const result = await handleGetGuestbook(storage, limit);
        sendJson(res, 200, result);
        return;
      }
      if (method === 'POST') {
        const raw = await readBody(req);
        let input: unknown;
        try { input = JSON.parse(raw); } catch {
          sendJson(res, 400, { success: false, error: 'Invalid JSON' });
          return;
        }
        const result = await handleCreateGuestbook(storage, input as unknown as GuestbookInput);
        sendJson(res, result.status, { success: result.success, data: result.data, error: result.error });
        return;
      }
      sendJson(res, 405, { success: false, error: 'Method not allowed' });
      return;
    }

    if (path === '/api/visits' && method === 'POST') {
      const raw = await readBody(req);
      let input: { sessionId?: string };
      try { input = JSON.parse(raw); } catch {
        sendJson(res, 400, { success: false, error: 'Invalid JSON' });
        return;
      }
      if (!input.sessionId || typeof input.sessionId !== 'string') {
        sendJson(res, 400, { success: false, error: 'sessionId required' });
        return;
      }
      const result = await handleRecordVisit(storage, input.sessionId);
      sendJson(res, result.status, { success: result.success, data: result.data, error: result.error });
      return;
    }

    if (path === '/api/stats' && method === 'GET') {
      const result = await handleGetStats(storage);
      sendJson(res, 200, result);
      return;
    }

    if (path === '/api/scores') {
      if (method === 'GET') {
        const limit = url.query.limit ? Number(url.query.limit) : 10;
        const result = await storage.getScores(limit);
        sendJson(res, 200, { success: true, data: result });
        return;
      }
      if (method === 'POST') {
        const raw = await readBody(req);
        let input: { score?: number; nickname?: string; laps?: number };
        try { input = JSON.parse(raw); } catch {
          sendJson(res, 400, { success: false, error: 'Invalid JSON' });
          return;
        }
        if (typeof input.score !== 'number' || !isFinite(input.score) || input.score < 0) {
          sendJson(res, 400, { success: false, error: 'Valid positive score required' });
          return;
        }
        const result = await storage.saveScore(input.score, input.nickname, input.laps);
        sendJson(res, 200, { success: true, data: result });
        return;
      }
      sendJson(res, 405, { success: false, error: 'Method not allowed' });
      return;
    }

    sendJson(res, 404, { success: false, error: 'Not found' });
  } catch {
    sendJson(res, 500, { success: false, error: 'Internal error' });
  }
});

import { fileURLToPath } from 'node:url';

// Only start if run directly (not imported)
const isDirectRun = process.argv[1] && (
  fileURLToPath(import.meta.url) === process.argv[1] ||
  process.argv[1].endsWith('server.ts')
);

if (isDirectRun) {
  server.listen(PORT, () => {
    console.log(`[pip-dream-backend] Listening on http://localhost:${PORT}`);
  });
}

export { server, storage, sendJson };
