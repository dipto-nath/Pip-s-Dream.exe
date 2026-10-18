// =============================================================
// PIP.EXE — Guestbook Service Tests
// Run with: npx vitest run src/test/guestbookService.test.ts
// =============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchGuestbookEntries,
  submitGuestbookEntry,
  checkBackendHealth,
  _resetBackendCache,
} from '../lib/guestbookService';
import { API_BASE } from '../lib/api';

// Helper: create a mock fetch Response
function mockResponse(status: number, body: unknown) {
  const headers = { 'content-type': 'application/json' };
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: '',
    headers: { get: (h: string) => (h.toLowerCase() === 'content-type' ? headers['content-type'] : null) },
    json: async () => body,
  };
}

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(status, body)));
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  _resetBackendCache();
});

describe('fetchGuestbookEntries — online', () => {
  it('fetches entries from the API', async () => {
    mockFetch(200, {
      success: true,
      data: {
        entries: [
          { id: '1', nickname: 'Pip', message: 'Hello!', created_at: '2026-10-17T12:00:00Z', status: 'published' },
          { id: '2', nickname: 'Sam', message: 'Hi there', created_at: '2026-10-16T10:00:00Z', status: 'published' },
        ],
      },
    });

    const result = await fetchGuestbookEntries();

    expect(result.isOnline).toBe(true);
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].name).toBe('Pip');
    expect(result.entries[0].message).toBe('Hello!');
    expect(result.entries[0].dateDisplay).toBeTruthy();

    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/guestbook`, expect.objectContaining({
      method: 'GET',
    }));
  });

  it('maps API entries to frontend format', async () => {
    mockFetch(200, {
      success: true,
      data: {
        entries: [{
          id: 'x-1',
          nickname: 'TestUser',
          message: 'A dream message',
          created_at: '2026-10-17T12:00:00Z',
          status: 'published',
        }],
      },
    });

    const result = await fetchGuestbookEntries();
    const entry = result.entries[0];

    expect(entry.id).toBe('x-1');
    expect(entry.name).toBe('TestUser');
    expect(entry.message).toBe('A dream message');
    expect(entry.timestamp).toBe(new Date('2026-10-17T12:00:00Z').getTime());
    expect(typeof entry.dateDisplay).toBe('string');
  });
});

describe('fetchGuestbookEntries — offline', () => {
  it('falls back to localStorage when API fails', async () => {
    mockFetch(0, {});

    localStorage.setItem('pip-exe-guestbook', JSON.stringify([{
      id: 'local-1',
      name: 'LocalPip',
      message: 'Local only',
      timestamp: Date.now(),
      dateDisplay: '17 Oct 2026',
    }]));

    const result = await fetchGuestbookEntries();

    expect(result.isOnline).toBe(false);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].name).toBe('LocalPip');
    expect(result.error).toContain('locally');
  });
});

describe('submitGuestbookEntry — online', () => {
  it('submits a valid entry and returns it', async () => {
    mockFetch(201, {
      success: true,
      data: {
        id: 'new-1',
        nickname: 'Pip',
        message: 'Dream big!',
        created_at: '2026-10-17T12:00:00Z',
        status: 'published',
      },
    });

    const result = await submitGuestbookEntry('Pip', 'Dream big!');

    expect(result.success).toBe(true);
    expect(result.entry).toBeDefined();
    expect(result.entry?.name).toBe('Pip');
    expect(result.entry?.message).toBe('Dream big!');
    expect(result.isLocalFallback).toBeUndefined();

    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/guestbook`, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ nickname: 'Pip', message: 'Dream big!' }),
    }));
  });

  it('rejects empty name', async () => {
    const result = await submitGuestbookEntry('', 'Hello');
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('validation');
  });

  it('rejects empty message', async () => {
    const result = await submitGuestbookEntry('Pip', '');
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('validation');
  });

  it('rejects name exceeding max length', async () => {
    const result = await submitGuestbookEntry('A'.repeat(25), 'Hello');
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('validation');
  });

  it('shows rate limit error when API returns 429', async () => {
    mockFetch(429, {
      success: false,
      error: 'Slow down a little.',
    });

    const result = await submitGuestbookEntry('Pip', 'Hello');
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('rate_limit');
  });
});

describe('submitGuestbookEntry — offline fallback', () => {
  it('saves to localStorage when API is unreachable', async () => {
    mockFetch(0, {});

    const result = await submitGuestbookEntry('Pip', 'Saved locally');

    expect(result.success).toBe(true);
    expect(result.isLocalFallback).toBe(true);
    expect(result.entry?.name).toBe('Pip');

    const stored = JSON.parse(localStorage.getItem('pip-exe-guestbook') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Pip');
  });

  it('returns retry error when API returns 500', async () => {
    mockFetch(500, {
      success: false,
      error: 'Server error',
    });

    const result = await submitGuestbookEntry('Pip', 'Hello');

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('retry');
    expect(result.isLocalFallback).toBeUndefined();
    expect(localStorage.getItem('pip-exe-guestbook')).toBeNull();
  });

  it('returns retry error when request times out with 408', async () => {
    mockFetch(408, {
      success: false,
      error: 'Request timed out.',
    });

    const result = await submitGuestbookEntry('Pip', 'Hello');

    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('retry');
    expect(result.isLocalFallback).toBeUndefined();
    expect(localStorage.getItem('pip-exe-guestbook')).toBeNull();
  });
});

describe('checkBackendHealth', () => {
  it('returns true when API responds ok', async () => {
    mockFetch(200, {
      success: true,
      data: { status: 'ok', timestamp: '...', checks: { storage: true } },
    });

    expect(await checkBackendHealth()).toBe(true);
  });

  it('returns false when API fails', async () => {
    mockFetch(500, { success: false, error: 'Server error' });

    expect(await checkBackendHealth()).toBe(false);
  });
});
