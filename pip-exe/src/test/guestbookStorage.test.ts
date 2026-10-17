// =============================================================
// PIP.EXE — Guestbook Storage Tests
// =============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadEntries,
  saveEntries,
  createEntry,
  addEntry,
  GUESTBOOK_LIMITS,
} from '../lib/guestbookStorage';

const STORAGE_KEY = 'pip-exe-guestbook';

beforeEach(() => {
  localStorage.clear();
});

describe('loadEntries', () => {
  it('returns empty array when storage is empty', () => {
    expect(loadEntries()).toEqual([]);
  });

  it('loads valid entries from storage', () => {
    const entry = {
      id: 'abc123',
      name: 'Pip',
      message: 'Hello world',
      timestamp: Date.now(),
      dateDisplay: '17 Oct 2026',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry]));
    const result = loadEntries();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Pip');
  });

  it('returns empty array for malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{ broken json !!');
    expect(loadEntries()).toEqual([]);
  });

  it('returns empty array when stored value is not an array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ bad: 'object' }));
    expect(loadEntries()).toEqual([]);
  });

  it('filters out invalid entries from the stored array', () => {
    const valid = {
      id: 'ok1',
      name: 'Valid',
      message: 'Valid message',
      timestamp: Date.now(),
      dateDisplay: '17 Oct 2026',
    };
    const invalid = { bad: 'data' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([valid, invalid]));
    const result = loadEntries();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Valid');
  });
});

describe('createEntry', () => {
  it('creates a valid entry from name and message', () => {
    const entry = createEntry('Pip', 'A wonderful dream');
    expect(entry).not.toBeNull();
    expect(entry!.name).toBe('Pip');
    expect(entry!.message).toBe('A wonderful dream');
    expect(entry!.id).toBeTruthy();
    expect(entry!.timestamp).toBeGreaterThan(0);
  });

  it('returns null for empty name', () => {
    expect(createEntry('', 'message')).toBeNull();
    expect(createEntry('   ', 'message')).toBeNull();
  });

  it('returns null for empty message', () => {
    expect(createEntry('Pip', '')).toBeNull();
    expect(createEntry('Pip', '   ')).toBeNull();
  });

  it('trims whitespace from name and message', () => {
    const entry = createEntry('  Pip  ', '  Dream  ');
    expect(entry!.name).toBe('Pip');
    expect(entry!.message).toBe('Dream');
  });

  it('enforces max name length', () => {
    const longName = 'A'.repeat(GUESTBOOK_LIMITS.maxNameLength + 10);
    const entry = createEntry(longName, 'message');
    expect(entry!.name.length).toBeLessThanOrEqual(GUESTBOOK_LIMITS.maxNameLength);
  });

  it('enforces max message length', () => {
    const longMsg = 'B'.repeat(GUESTBOOK_LIMITS.maxMessageLength + 10);
    const entry = createEntry('Pip', longMsg);
    expect(entry!.message.length).toBeLessThanOrEqual(GUESTBOOK_LIMITS.maxMessageLength);
  });
});

describe('addEntry', () => {
  it('adds a new entry to an empty list', () => {
    const { entries, success } = addEntry([], 'Pip', 'Hello dream');
    expect(success).toBe(true);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('Pip');
  });

  it('prepends new entries (newest first)', () => {
    const { entries: first } = addEntry([], 'Alice', 'First');
    const { entries: second } = addEntry(first, 'Bob', 'Second');
    expect(second[0].name).toBe('Bob');
    expect(second[1].name).toBe('Alice');
  });

  it('does not add invalid entries', () => {
    const { entries, success } = addEntry([], '', '');
    expect(success).toBe(false);
    expect(entries).toHaveLength(0);
  });

  it('persists entries to localStorage', () => {
    addEntry([], 'Pip', 'Dream message');
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].name).toBe('Pip');
  });

  it('bounds the list to MAX_ENTRIES', () => {
    let entries = loadEntries();
    for (let i = 0; i < GUESTBOOK_LIMITS.maxEntries + 5; i++) {
      const result = addEntry(entries, `User${i}`, `Message ${i}`);
      entries = result.entries;
    }
    expect(entries.length).toBeLessThanOrEqual(GUESTBOOK_LIMITS.maxEntries);
  });
});

describe('saveEntries', () => {
  it('saves and retrieves entries correctly', () => {
    const entry = {
      id: 'test1',
      name: 'Pip',
      message: 'Stars',
      timestamp: 1000,
      dateDisplay: '17 Oct 2026',
    };
    saveEntries([entry]);
    const loaded = loadEntries();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('test1');
  });
});
