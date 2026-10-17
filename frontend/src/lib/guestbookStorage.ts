// =============================================================
// PIP.EXE — Guestbook Storage
// =============================================================

import type { GuestbookEntry } from './types';
export type { GuestbookEntry };

const STORAGE_KEY = 'pip-exe-guestbook';
const MAX_ENTRIES = 50;
const MAX_NAME_LENGTH = 24;
const MAX_MESSAGE_LENGTH = 180;

function isValidEntry(obj: unknown): obj is GuestbookEntry {
  if (typeof obj !== 'object' || obj === null) return false;
  const e = obj as Record<string, unknown>;
  return (
    typeof e.id === 'string' && e.id.length > 0 &&
    typeof e.name === 'string' && e.name.trim().length > 0 &&
    typeof e.message === 'string' && e.message.trim().length > 0 &&
    typeof e.timestamp === 'number' && isFinite(e.timestamp) &&
    typeof e.dateDisplay === 'string'
  );
}

export function loadEntries(): GuestbookEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

export function saveEntries(entries: GuestbookEntry[]): boolean {
  try {
    const current = loadEntries();
    const map = new Map<string, GuestbookEntry>();
    for (const e of entries) {
      map.set(e.id, e);
    }
    for (const e of current) {
      if (!map.has(e.id)) {
        map.set(e.id, e);
      }
    }
    const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
    const bounded = merged.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bounded));
    return true;
  } catch {
    return false;
  }
}

export function createEntry(name: string, message: string): GuestbookEntry | null {
  const trimName = name.trim().slice(0, MAX_NAME_LENGTH);
  const trimMsg = message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!trimName || !trimMsg) return null;

  const now = Date.now();
  return {
    id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
    name: trimName,
    message: trimMsg,
    timestamp: now,
    dateDisplay: new Date(now).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };
}

export function addEntry(
  existing: GuestbookEntry[],
  name: string,
  message: string,
): { entries: GuestbookEntry[]; success: boolean } {
  const entry = createEntry(name, message);
  if (!entry) return { entries: existing, success: false };

  const latest = loadEntries();
  const next = [entry, ...latest].slice(0, MAX_ENTRIES);
  const saved = saveEntries(next);
  return { entries: saved ? loadEntries() : next, success: saved };
}

export const GUESTBOOK_LIMITS = {
  maxNameLength: MAX_NAME_LENGTH,
  maxMessageLength: MAX_MESSAGE_LENGTH,
  maxEntries: MAX_ENTRIES,
};
