// =============================================================
// PIP.EXE — Backend HTTP Integration Test
// Starts a real HTTP server, makes requests, verifies responses.
// =============================================================

import http from 'node:http';
import { parse } from 'node:url';
import { JsonStorage, hashSessionId } from './jsonStorage';
import {
  handleGetGuestbook,
  handleCreateGuestbook,
  handleRecordVisit,
  handleGetStats,
  handleHealthCheck,
} from './handlers';
import type { GuestbookInput } from './types';

const PORT = 3099;

function sendJson(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const storage = new JsonStorage();

const server = http.createServer(async (req, res) => {
  const url = parse(req.url || '', true);
  const path = url.pathname || '/';
  const method = req.method || 'GET';

  if (method === 'OPTIONS') { sendJson(res, 204, {}); return; }

  try {
    if (path === '/api/health' && method === 'GET') {
      const r = await handleHealthCheck(storage);
      sendJson(res, 200, r);
      return;
    }
    if (path === '/api/guestbook') {
      if (method === 'GET') {
        const limit = url.query.limit ? Number(url.query.limit) : undefined;
        const r = await handleGetGuestbook(storage, limit);
        sendJson(res, 200, r);
        return;
      }
      if (method === 'POST') {
        const raw = await readBody(req);
        let input: unknown;
        try { input = JSON.parse(raw); } catch {
          sendJson(res, 400, { success: false, error: 'Invalid JSON' });
          return;
        }
        const r = await handleCreateGuestbook(storage, input as unknown as GuestbookInput);
        sendJson(res, r.status, { success: r.success, data: r.data, error: r.error });
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
      const r = await handleRecordVisit(storage, input.sessionId, hashSessionId);
      sendJson(res, r.status, { success: r.success, data: r.data, error: r.error });
      return;
    }
    if (path === '/api/stats' && method === 'GET') {
      const r = await handleGetStats(storage);
      sendJson(res, 200, r);
      return;
    }
    sendJson(res, 404, { success: false, error: 'Not found' });
  } catch {
    sendJson(res, 500, { success: false, error: 'Internal error' });
  }
});

function httpRequest(path: string, method: string, body?: unknown): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: 'localhost', port: PORT, path, method,
        headers: body ? { 'Content-Type': 'application/json' } : {} },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try { resolve({ status: res.statusCode ?? 500, data: data ? JSON.parse(data) : {} }); }
          catch { resolve({ status: res.statusCode ?? 500, data: data }); }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  const fs = await import('node:fs/promises');
  try { await fs.unlink('data/data.json'); } catch { /* ignore */ }

  await new Promise<void>((resolve) => server.listen(PORT, () => resolve()));
  console.log(`Server listening on port ${PORT}\n`);

  let pass = 0, fail = 0;
  async function check(name: string, actual: any, expected: any) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (ok) { pass++; console.log(`  ✅ ${name}`); }
    else { fail++; console.log(`  ❌ ${name}\n     expected: ${JSON.stringify(expected)}\n     actual:   ${JSON.stringify(actual)}`); }
  }

  // Health
  const health = await httpRequest('/api/health', 'GET');
  await check('health status 200', health.status, 200);
  await check('health success true', (health.data as any).success, true);
  await check('health checks.storage', (health.data as any).data.checks.storage, true);

  // Stats initial
  const stats0 = await httpRequest('/api/stats', 'GET');
  await check('stats initial 0', (stats0.data as any).data.total_visits, 0);

  // Guestbook empty
  const gb0 = await httpRequest('/api/guestbook', 'GET');
  await check('guestbook empty', (gb0.data as any).data.entries, []);

  // Create entry
  const create = await httpRequest('/api/guestbook', 'POST', {
    nickname: 'Pip', message: 'Hello ⭐',
  });
  await check('create status 201', create.status, 201);
  await check('create success', (create.data as any).success, true);
  await check('create name', (create.data as any).data.nickname, 'Pip');

  // Guestbook after post
  const gb1 = await httpRequest('/api/guestbook', 'GET');
  await check('guestbook has 1 entry', (gb1.data as any).data.entries.length, 1);
  await check('guestbook entry name', (gb1.data as any).data.entries[0].nickname, 'Pip');

  // Validation: empty
  const empty = await httpRequest('/api/guestbook', 'POST', { nickname: '', message: '' });
  await check('validation empty status 400', empty.status, 400);

  // Validation: too long name
  const longName = await httpRequest('/api/guestbook', 'POST', {
    nickname: 'A'.repeat(25), message: 'Hi',
  });
  await check('validation long name status 400', longName.status, 400);

  // Honeypot
  const bot = await httpRequest('/api/guestbook', 'POST', {
    nickname: 'Bot', message: 'Spam', website: 'http://spam.com',
  });
  await check('honeypot status 400', bot.status, 400);

  // Invalid type
  const badType = await httpRequest('/api/guestbook', 'POST', { nickname: 123, message: 'Hi' });
  await check('invalid type status 400', badType.status, 400);

  // Record visit (new session)
  const visit1 = await httpRequest('/api/visits', 'POST', { sessionId: 'test-abc' });
  await check('visit 1 counted', (visit1.data as any).data.counted, true);
  await check('visit 1 total', (visit1.data as any).data.total, 1);

  // Duplicate visit (idempotent)
  const visit2 = await httpRequest('/api/visits', 'POST', { sessionId: 'test-abc' });
  await check('visit 2 not counted', (visit2.data as any).data.counted, false);
  await check('visit 2 total same', (visit2.data as any).data.total, 1);

  // New visit
  const visit3 = await httpRequest('/api/visits', 'POST', { sessionId: 'test-xyz' });
  await check('visit 3 counted', (visit3.data as any).data.counted, true);
  await check('visit 3 total', (visit3.data as any).data.total, 2);

  // Stats after visits
  const stats2 = await httpRequest('/api/stats', 'GET');
  await check('stats after 2 visits', (stats2.data as any).data.total_visits, 2);

  // HTML content stored as plain text (within 24-char nickname limit)
  const htmlPost = await httpRequest('/api/guestbook', 'POST', {
    nickname: '<b>Hi</b>',
    message: '<b>bold</b> & <i>italic</i>',
  });
  await check('html entry accepted', (htmlPost.data as any).success, true);
  const gb3 = await httpRequest('/api/guestbook', 'GET');
  const entries = (gb3.data as any).data.entries;
  const htmlEntry = entries.find((e: any) => e.nickname === '<b>Hi</b>');
  await check('html stored as text', !!htmlEntry, true);

  // 404
  const notFound = await httpRequest('/api/unknown', 'GET');
  await check('404 for unknown route', notFound.status, 404);

  server.close(() => {
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail > 0 ? 1 : 0);
  });
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
