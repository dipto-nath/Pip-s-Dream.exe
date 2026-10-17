// =============================================================
// PIP.EXE — Visit Service Tests
// Run with: npx vitest run src/test/visitService.test.ts
// =============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { fetchVisitorStats, recordVisit, getSessionId } from '../lib/visitService';

function mockResponse(status: number, body: unknown) {
  const headers = { 'content-type': 'application/json' };
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (h: string) => (h === 'content-type' ? headers['content-type'] : null) },
    json: async () => body,
  };
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('getSessionId', () => {
  it('generates a new session ID when none exists', () => {
    const id1 = getSessionId();
    expect(id1).toBeTruthy();
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
  });

  it('returns the same session ID on subsequent calls', () => {
    const id1 = getSessionId();
    const id2 = getSessionId();
    expect(id1).toBe(id2);
  });

  it('persists session ID in sessionStorage', () => {
    const id = getSessionId();
    expect(sessionStorage.getItem('pip-exe-session')).toBe(id);
  });

  it('handles sessionStorage unavailable gracefully', () => {
    vi.spyOn(globalThis.Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    // Should not throw, should return a fresh UUID
    expect(() => getSessionId()).not.toThrow();
  });
});

describe('fetchVisitorStats — online', () => {
  it('fetches stats from the API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      mockResponse(200, { success: true, data: { total_visits: 1234 } })
    ));

    const result = await fetchVisitorStats();

    expect(result.isOnline).toBe(true);
    expect(result.stats.total_visits).toBe(1234);

    expect(fetch).toHaveBeenCalledWith('/api/stats', expect.objectContaining({
      method: 'GET',
    }));
  });
});

describe('fetchVisitorStats — offline', () => {
  it('falls back to localStorage count when API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(0, {})));
    localStorage.setItem('pip-exe-visits', '99');

    const result = await fetchVisitorStats();

    expect(result.isOnline).toBe(false);
    expect(result.stats.total_visits).toBe(99);
  });

  it('defaults to 1 when no local data exists', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(0, {})));

    const result = await fetchVisitorStats();

    expect(result.isOnline).toBe(false);
    expect(result.stats.total_visits).toBe(1);
  });
});

describe('recordVisit — online', () => {
  it('records a new visit via API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      mockResponse(200, { success: true, data: { counted: true, total: 42 } })
    ));

    const result = await recordVisit('session-abc');

    expect(result.counted).toBe(true);
    expect(result.total).toBe(42);
    expect(result.isOnline).toBe(true);

    expect(fetch).toHaveBeenCalledWith('/api/visits', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ sessionId: 'session-abc' }),
    }));
  });

  it('does not count duplicate sessions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      mockResponse(200, { success: true, data: { counted: false, total: 42 } })
    ));

    const result = await recordVisit('session-abc');

    expect(result.counted).toBe(false);
    expect(result.total).toBe(42);
    expect(result.isOnline).toBe(true);
  });
});

describe('recordVisit — offline', () => {
  it('falls back to local count without incrementing fake global', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(0, {})));
    localStorage.setItem('pip-exe-visits', '10');

    const result = await recordVisit('session-xyz');

    expect(result.isOnline).toBe(false);
    expect(result.counted).toBe(false);
    // Does NOT claim to have counted — prevents misleading global total
    expect(result.total).toBe(10);
  });
});
