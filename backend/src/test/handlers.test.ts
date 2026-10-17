// =============================================================
// PIP.EXE — Backend Handler Tests
// Run with: npx vitest run src/test/handlers.test.ts
// =============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { GuestbookEntry, VisitorStats, VisitRecord } from '../types';
import type { Storage } from '../storage';
import {
  handleGetGuestbook,
  handleCreateGuestbook,
  handleRecordVisit,
  handleGetStats,
  handleHealthCheck,
} from '../handlers';

// ── In-memory storage mock ──────────────────────────────

class MemoryStorage implements Storage {
  public entries: GuestbookEntry[] = [];
  public visits: VisitRecord[] = [];
  private _healthy = true;

  async getEntries(limit: number): Promise<GuestbookEntry[]> {
    return this.entries
      .filter((e) => e.status === 'published')
      .slice(0, limit);
  }

  async createEntry(nickname: string, message: string): Promise<GuestbookEntry> {
    const entry: GuestbookEntry = {
      id: `test-${this.entries.length + 1}`,
      nickname,
      message,
      created_at: new Date().toISOString(),
      status: 'published',
    };
    this.entries.unshift(entry);
    return entry;
  }

  async recentEntryCount(source: string, windowMs: number): Promise<number> {
    const cutoff = Date.now() - windowMs;
    return this.entries.filter((e) => {
      if (source && e.nickname !== source) return false;
      return new Date(e.created_at).getTime() >= cutoff;
    }).length;
  }

  async getStats(): Promise<VisitorStats> {
    return { total_visits: this.visits.length };
  }

  async recordVisit(sessionHash: string): Promise<{ counted: boolean; total: number }> {
    const existing = this.visits.find((v) => v.session_hash === sessionHash);
    if (existing) {
      return { counted: false, total: this.visits.length };
    }
    this.visits.push({
      id: `visit-${this.visits.length + 1}`,
      session_hash: sessionHash,
      created_at: new Date().toISOString(),
    });
    return { counted: true, total: this.visits.length };
  }

  async isHealthy(): Promise<boolean> {
    return this._healthy;
  }

  setHealthy(value: boolean) {
    this._healthy = value;
  }
}

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
});

describe('handleHealthCheck', () => {
  it('returns ok status when storage is healthy', async () => {
    storage.setHealthy(true);
    const result = await handleHealthCheck(storage);
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('ok');
    expect(result.data?.checks.storage).toBe(true);
  });

  it('returns degraded status when storage is unhealthy', async () => {
    storage.setHealthy(false);
    const result = await handleHealthCheck(storage);
    expect(result.success).toBe(false);
    expect(result.data?.status).toBe('degraded');
    expect(result.data?.checks.storage).toBe(false);
  });
});

describe('handleGetGuestbook', () => {
  it('returns empty list when no entries exist', async () => {
    const result = await handleGetGuestbook(storage);
    expect(result.success).toBe(true);
    expect(result.data?.entries).toEqual([]);
  });

  it('returns entries newest-first', async () => {
    storage.entries = [
      { id: '1', nickname: 'A', message: 'msg', created_at: '2024-01-01T00:00:00Z', status: 'published' },
      { id: '2', nickname: 'B', message: 'msg', created_at: '2024-01-02T00:00:00Z', status: 'published' },
    ];
    const result = await handleGetGuestbook(storage);
    expect(result.data?.entries).toHaveLength(2);
  });

  it('respects the limit parameter', async () => {
    for (let i = 0; i < 10; i++) {
      storage.entries.push({
        id: `${i}`, nickname: 'X', message: 'msg',
        created_at: '2024-01-01T00:00:00Z', status: 'published',
      });
    }
    const result = await handleGetGuestbook(storage, 5);
    expect(result.data?.entries).toHaveLength(5);
  });

  it('filters out hidden entries', async () => {
    storage.entries = [
      { id: '1', nickname: 'A', message: 'msg', created_at: '2024-01-01T00:00:00Z', status: 'published' },
      { id: '2', nickname: 'B', message: 'msg', created_at: '2024-01-02T00:00:00Z', status: 'hidden' },
    ];
    const result = await handleGetGuestbook(storage);
    expect(result.data?.entries).toHaveLength(1);
    expect(result.data?.entries[0].nickname).toBe('A');
  });
});

describe('handleCreateGuestbook', () => {
  it('creates an entry with valid input', async () => {
    const result = await handleCreateGuestbook(storage, {
      nickname: 'Pip',
      message: 'Hello dream!',
    });
    expect(result.success).toBe(true);
    expect(result.status).toBe(201);
    expect(result.data?.nickname).toBe('Pip');
    expect(result.data?.message).toBe('Hello dream!');
  });

  it('rejects empty name', async () => {
    const result = await handleCreateGuestbook(storage, { nickname: '', message: 'Hi' });
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.error).toContain('Name');
  });

  it('rejects empty message', async () => {
    const result = await handleCreateGuestbook(storage, { nickname: 'Pip', message: '' });
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  it('rejects nickname exceeding max length', async () => {
    const result = await handleCreateGuestbook(storage, {
      nickname: 'A'.repeat(25),
      message: 'Hi',
    });
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.error).toContain('characters');
  });

  it('rejects spam via honeypot', async () => {
    const result = await handleCreateGuestbook(storage, {
      nickname: 'Bot',
      message: 'Spam',
      website: 'http://spam.com',
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Spam detected.');
  });

  it('rate-limits duplicate submissions from same source', async () => {
    vi.useFakeTimers();

    const result1 = await handleCreateGuestbook(storage, {
      nickname: 'Pip',
      message: 'First!',
    });
    expect(result1.success).toBe(true);

    const result2 = await handleCreateGuestbook(storage, {
      nickname: 'Pip',
      message: 'Second!',
    });
    expect(result2.success).toBe(false);
    expect(result2.status).toBe(429);

    vi.advanceTimersByTime(6000);

    const result3 = await handleCreateGuestbook(storage, {
      nickname: 'Pip',
      message: 'Third!',
    });
    expect(result3.success).toBe(true);

    vi.useRealTimers();
  });
});

describe('handleRecordVisit', () => {
  it('counts a new visit', async () => {
    const result = await handleRecordVisit(storage, 'session-1', (id) => `hash:${id}`);
    expect(result.success).toBe(true);
    expect(result.data?.counted).toBe(true);
    expect(result.data?.total).toBe(1);
  });

  it('is idempotent — does not recount same session', async () => {
    await handleRecordVisit(storage, 'session-1', (id) => `hash:${id}`);
    const result = await handleRecordVisit(storage, 'session-1', (id) => `hash:${id}`);
    expect(result.data?.counted).toBe(false);
    expect(result.data?.total).toBe(1);
  });

  it('counts a new session even if others exist', async () => {
    await handleRecordVisit(storage, 'session-1', (id) => `hash:${id}`);
    const result = await handleRecordVisit(storage, 'session-2', (id) => `hash:${id}`);
    expect(result.data?.counted).toBe(true);
    expect(result.data?.total).toBe(2);
  });

  it('rejects an empty session ID', async () => {
    const result = await handleRecordVisit(storage, '');
    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
  });

  it('hashes the session ID before storage', async () => {
    await handleRecordVisit(storage, 'my-session', (id) => `sha:${id}`);
    expect(storage.visits).toHaveLength(1);
    expect(storage.visits[0].session_hash).toBe('sha:my-session');
  });
});

describe('handleGetStats', () => {
  it('returns correct initial stats', async () => {
    const result = await handleGetStats(storage);
    expect(result.success).toBe(true);
    expect(result.data?.total_visits).toBe(0);
  });

  it('reflects visits after recording', async () => {
    await handleRecordVisit(storage, 's1', () => 'hash1');
    await handleRecordVisit(storage, 's2', () => 'hash2');
    const result = await handleGetStats(storage);
    expect(result.data?.total_visits).toBe(2);
  });
});