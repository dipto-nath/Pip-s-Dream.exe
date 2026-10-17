// =============================================================
// PIP.EXE — JSON File Storage (Local Development)
// Implements the Storage interface using a local JSON file
// =============================================================

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import crypto from 'node:crypto';
import type { GuestbookEntry, VisitorStats, VisitRecord } from './types';
import type { GuestbookStorage, VisitStorage } from './storage';

export interface JsonDataFile {
  guestbook_entries: GuestbookEntry[];
  visits: VisitRecord[];
}

const DEFAULT_DATA_DIR = join(process.cwd(), 'data');

function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Hashes a session ID using SHA-256.
 * In production (Edge Functions), this uses the Web Crypto API.
 */
export function hashSessionId(sessionId: string): string {
  return crypto
    .createHash('sha256')
    .update('pip-dream-session:' + sessionId)
    .digest('hex');
}

const fileQueues = new Map<string, Promise<void>>();

export class JsonStorage implements GuestbookStorage, VisitStorage {
  private dataPath: string;
  private dataDir: string;

  constructor(dataDir: string = DEFAULT_DATA_DIR) {
    this.dataDir = dataDir;
    this.dataPath = join(dataDir, 'data.json');
  }

  private async withFileLock<T>(action: () => Promise<T>): Promise<T> {
    const prev = fileQueues.get(this.dataPath) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    fileQueues.set(this.dataPath, current);
    try {
      await prev;
      return await action();
    } finally {
      release();
      if (fileQueues.get(this.dataPath) === current) {
        fileQueues.delete(this.dataPath);
      }
    }
  }

  private async readData(): Promise<JsonDataFile> {
    try {
      const raw = await readFile(this.dataPath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<JsonDataFile>;
      return {
        guestbook_entries: parsed.guestbook_entries ?? [],
        visits: parsed.visits ?? [],
      };
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') {
        return { guestbook_entries: [], visits: [] };
      }
      throw err;
    }
  }

  private async writeData(data: JsonDataFile): Promise<void> {
    try {
      await mkdir(this.dataDir, { recursive: true });
      await writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      // If we can't write, the system is degraded
      console.error('[JsonStorage] Failed to write data:', err);
      throw err;
    }
  }

  // ── Guestbook ──

  async getEntries(limit: number): Promise<GuestbookEntry[]> {
    const data = await this.readData();
    // Entries are stored newest-first already; just slice
    return data.guestbook_entries
      .filter((e) => e.status === 'published')
      .slice(0, limit);
  }

  async createEntry(nickname: string, message: string): Promise<GuestbookEntry> {
    return this.withFileLock(async () => {
      const data = await this.readData();
      const now = new Date();
      const entry: GuestbookEntry = {
        id: generateId(),
        nickname,
        message,
        created_at: now.toISOString(),
        status: 'published',
      };
      // Prepend (newest first)
      data.guestbook_entries.unshift(entry);
      await this.writeData(data);
      return entry;
    });
  }

  async recentEntryCount(source: string, windowMs: number): Promise<number> {
    const data = await this.readData();
    const cutoff = Date.now() - windowMs;
    return data.guestbook_entries.filter((e) => {
      if (source && e.nickname !== source) return false;
      const t = new Date(e.created_at).getTime();
      return t >= cutoff;
    }).length;
  }

  // ── Visits ──

  async getStats(): Promise<VisitorStats> {
    const data = await this.readData();
    return { total_visits: data.visits.length };
  }

  async recordVisit(sessionHash: string): Promise<{ counted: boolean; total: number }> {
    return this.withFileLock(async () => {
      const data = await this.readData();
      // Check if this session already has a visit
      const existing = data.visits.find((v) => v.session_hash === sessionHash);
      if (existing) {
        // Idempotent — don't count again
        return { counted: false, total: data.visits.length };
      }
      // Record new visit
      const visit: VisitRecord = {
        id: generateId(),
        session_hash: sessionHash,
        created_at: new Date().toISOString(),
      };
      data.visits.push(visit);
      await this.writeData(data);
      return { counted: true, total: data.visits.length };
    });
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.readData();
      return true;
    } catch {
      return false;
    }
  }
}

export function createJsonStorage(dataDir?: string): JsonStorage {
  return new JsonStorage(dataDir);
}
