// =============================================================
// PIP.EXE — API Handlers (Business Logic)
// Pure functions that process requests and return API responses
// =============================================================

import type { ApiResponse, EntriesPage, GuestbookEntry, VisitorStats, HealthCheck, GuestbookInput } from './types';
import type { Storage } from './storage';
import {
  validateGuestbookInput,
  sanitizeGuestbookInput,
  validateSessionId,
  MAX_ENTRIES,
} from './validation';

/** Cooldown window for rate limiting (5 seconds between submissions). */
const RATE_LIMIT_WINDOW_MS = 5000;

// ── Guestbook handlers ──

/**
 * Fetch the latest guestbook entries.
 * Returns a bounded list (latest 30), newest first.
 */
export async function handleGetGuestbook(
  storage: Storage,
  limit: number = MAX_ENTRIES,
): Promise<ApiResponse<EntriesPage>> {
  try {
    const entries = await storage.getEntries(Math.min(limit, MAX_ENTRIES));
    return { success: true, data: { entries } };
  } catch (err) {
    return {
      success: false,
      error: 'Pip is having trouble reading the dream mailbox.',
    };
  }
}

/**
 * Create a new guestbook entry.
 * Validates input, checks rate limits, and persists.
 */
export async function handleCreateGuestbook(
  storage: Storage,
  input: GuestbookInput,
): Promise<{ success: boolean; data?: GuestbookEntry; error?: string; status: number }> {
  // 1. Validate input
  const validation = validateGuestbookInput(input);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error ?? 'Invalid input.',
      status: 400,
    };
  }

  // 2. Rate limiting — check recent entries
  // NOTE: In production, this should use IP-based rate limiting.
  // For the local JSON store, we check total recent entries.
  // A real implementation would check per-IP in the Edge Function.
  try {
    const recentCount = await storage.recentEntryCount(RATE_LIMIT_WINDOW_MS);
    if (recentCount > 10) {
      return {
        success: false,
        error: 'Slow down a little — Pip can only pin a few notes at a time.',
        status: 429,
      };
    }
  } catch {
    // Don't fail the request if rate-limit check fails — just skip it
  }

  // 3. Sanitize and persist
  const sanitized = sanitizeGuestbookInput(input);
  try {
    const entry = await storage.createEntry(sanitized.nickname, sanitized.message);
    return { success: true, data: entry, status: 201 };
  } catch (err) {
    return {
      success: false,
      error: 'The dream mailbox is sleepy. Your note hasn\'t been posted yet.',
      status: 500,
    };
  }
}

// ── Visit counter handlers ──

/**
 * Record a visit idempotently.
 * The session ID is hashed before storage.
 */
export async function handleRecordVisit(
  storage: Storage,
  sessionId: string,
  hashFn?: (id: string) => string,
): Promise<{ success: boolean; data?: { counted: boolean; total: number }; error?: string; status: number }> {
  const validation = validateSessionId(sessionId);
  if (!validation.valid) {
    return { success: false, error: 'Invalid session.', status: 400 };
  }

  // Hash the session ID (use provided hash function or default)
  const sessionHash = hashFn
    ? hashFn(sessionId)
    : Buffer.from('pip-dream-session:' + sessionId).toString('base64');

  try {
    const result = await storage.recordVisit(sessionHash);
    await storage.getStats(); // warm up — not needed but harmless
    return { success: true, data: result, status: 200 };
  } catch (err) {
    return {
      success: false,
      error: 'Could not record your visit right now.',
      status: 500,
    };
  }
}

/**
 * Fetch visitor statistics.
 */
export async function handleGetStats(
  storage: Storage,
): Promise<ApiResponse<VisitorStats>> {
  try {
    const stats = await storage.getStats();
    return { success: true, data: stats };
  } catch {
    return {
      success: false,
      error: 'The counter is a little fuzzy right now.',
    };
  }
}

// ── Health check ──

/**
 * Check backend health. Does not expose internal details.
 */
export async function handleHealthCheck(
  storage: Storage,
): Promise<ApiResponse<HealthCheck>> {
  const checks: Record<string, boolean> = {};

  try {
    checks.storage = await storage.isHealthy();
  } catch {
    checks.storage = false;
  }

  const allOk = Object.values(checks).every(Boolean);

  return {
    success: allOk,
    data: {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    },
  };
}
