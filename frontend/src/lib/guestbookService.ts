// =============================================================
// PIP.EXE — Guestbook Service
// Frontend-facing service that talks to the backend API.
// Falls back to localStorage when the backend is unavailable,
// clearly marking fallback data as local-only.
// =============================================================

import { apiRequest } from './api';
import { loadEntries, saveEntries, createEntry as createLocalEntry, GUESTBOOK_LIMITS, type GuestbookEntry } from './guestbookStorage';

export { GUESTBOOK_LIMITS, type GuestbookEntry };

export interface GuestbookError {
  type: 'network' | 'validation' | 'server' | 'rate_limit';
  message: string;
}

export interface GuestbookResult {
  entries: GuestbookEntry[];
  isOnline: boolean;
  error?: string;
}

export interface SubmitResult {
  success: boolean;
  entry?: GuestbookEntry;
  error?: GuestbookError;
  isLocalFallback?: boolean;
}

/** Whether the backend API is reachable. Cached briefly. */
let backendOnline: boolean | null = null;
let lastOnlineCheck = 0;
const ONLINE_CACHE_MS = 30000;

export async function checkBackendHealth(): Promise<boolean> {
  const now = Date.now();
  if (backendOnline !== null && now - lastOnlineCheck < ONLINE_CACHE_MS) {
    return backendOnline;
  }

  const result = await apiRequest<{ status: 'ok' | 'degraded'; checks: Record<string, boolean> }>('/health');
  backendOnline = result.success && result.status === 200;
  lastOnlineCheck = now;
  return backendOnline;
}

/** Fetch the latest guestbook entries from the backend API. */
export async function fetchGuestbookEntries(): Promise<GuestbookResult> {
  const result = await apiRequest<{ entries: ApiEntry[] }>('/guestbook');

  if (result.success) {
    const entries = (result.data?.entries ?? []).map(mapApiEntryToFrontend);
    backendOnline = true;
    lastOnlineCheck = Date.now();
    return { entries, isOnline: true };
  }

  // Fall back to localStorage
  backendOnline = false;
  lastOnlineCheck = Date.now();
  const local = loadEntries();
  return {
    entries: local,
    isOnline: false,
    error: 'Messages are currently stored locally only — not shared with other visitors.',
  };
}

/**
 * Submit a new guestbook entry.
 * Validates locally first, then sends to the backend.
 * Falls back to localStorage if the backend is unavailable.
 */
export async function submitGuestbookEntry(
  nickname: string,
  message: string,
): Promise<SubmitResult> {
  // Local validation (mirrors backend rules)
  const trimName = nickname.trim();
  const trimMsg = message.trim();

  if (!trimName || !trimMsg) {
    return {
      success: false,
      error: { type: 'validation', message: 'Please enter both your name and a dream message.' },
    };
  }
  if (trimName.length > GUESTBOOK_LIMITS.maxNameLength) {
    return {
      success: false,
      error: {
        type: 'validation',
        message: `Name must be ${GUESTBOOK_LIMITS.maxNameLength} characters or fewer.`,
      },
    };
  }
  if (trimMsg.length > GUESTBOOK_LIMITS.maxMessageLength) {
    return {
      success: false,
      error: {
        type: 'validation',
        message: `Message must be ${GUESTBOOK_LIMITS.maxMessageLength} characters or fewer.`,
      },
    };
  }

  // Attempt backend submission
  const result = await apiRequest<ApiEntry>('/guestbook', {
    method: 'POST',
    body: { nickname: trimName, message: trimMsg },
  });

  if (result.success && result.data) {
    const entry = mapApiEntryToFrontend(result.data);
    backendOnline = true;
    lastOnlineCheck = Date.now();
    return { success: true, entry };
  }

  // Rate limited
  if (result.status === 429) {
    return {
      success: false,
      error: { type: 'rate_limit', message: result.error ?? 'Slow down a little.' },
    };
  }

  // Validation error from backend
  if (result.status === 400) {
    return {
      success: false,
      error: { type: 'validation', message: result.error ?? 'Invalid input.' },
    };
  }

  // Network/server error — fall back to localStorage
  backendOnline = false;
  lastOnlineCheck = Date.now();
  const localEntry = createLocalEntry(trimName, trimMsg);
  if (localEntry) {
    // Save to localStorage as a fallback
    const existing = loadEntries();
    const next = [localEntry, ...existing].slice(0, GUESTBOOK_LIMITS.maxEntries);
    const saved = saveEntries(next);
    if (!saved) {
      return {
        success: false,
        error: { type: 'server', message: 'Could not save your message right now.' },
      };
    }
    return {
      success: true,
      entry: localEntry,
      isLocalFallback: true,
    };
  }

  return {
    success: false,
    error: { type: 'server', message: 'Could not save your message. Please try again.' },
  };
}

/** Map an API guestbook entry to the frontend's GuestbookEntry type. */
function mapApiEntryToFrontend(entry: ApiEntry): GuestbookEntry {
  const date = new Date(entry.created_at);
  return {
    id: entry.id,
    name: entry.nickname,
    message: entry.message,
    timestamp: date.getTime(),
    dateDisplay: date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };
}

interface ApiEntry {
  id: string;
  nickname: string;
  message: string;
  created_at: string;
  status: 'published' | 'hidden';
}
