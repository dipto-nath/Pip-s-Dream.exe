// =============================================================
// PIP.EXE — Visit Service
// Frontend-facing service that talks to the backend API for the
// global visitor counter. Falls back to local session tracking
// when the backend is unavailable.
// =============================================================

import { apiRequest } from './api';
import { formatCount, getVisitCount } from './visitCounter';

const SESSION_KEY = 'pip-exe-session-id';
const LEGACY_SESSION_KEY = 'pip-exe-session';

/** Generate or retrieve a session ID for this browser session. */
function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const legacy = sessionStorage.getItem(LEGACY_SESSION_KEY);
    if (legacy) {
      sessionStorage.setItem(SESSION_KEY, legacy);
      return legacy;
    }
    const newId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, newId);
    return newId;
  } catch {
    return crypto.randomUUID();
  }
}

export { formatCount, getSessionId };

export interface VisitorStats {
  total_visits: number;
}

export interface VisitState {
  count: number;
  loading: boolean;
  error: boolean;
  isOnline: boolean;
  sessionId: string;
}

/** Fetch the authoritative visitor count from the backend. */
export async function fetchVisitorStats(): Promise<{
  stats: VisitorStats;
  isOnline: boolean;
}> {
  const result = await apiRequest<{ total_visits: number }>('/stats');

  if (result.success && result.data) {
    return {
      stats: { total_visits: result.data.total_visits },
      isOnline: true,
    };
  }

  // Backend unavailable — do NOT pretend the local number is the global count
  return {
    stats: { total_visits: getVisitCount() },
    isOnline: false,
  };
}

/**
 * Record a visit for the current session.
 * Idempotent: the backend won't double-count the same session.
 */
export async function recordVisit(sessionId: string): Promise<{
  counted: boolean;
  total: number;
  isOnline: boolean;
}> {
  const result = await apiRequest<{ counted: boolean; total: number }>('/visits', {
    method: 'POST',
    body: { sessionId },
  });

  if (result.success && result.data) {
    return {
      counted: result.data.counted,
      total: result.data.total,
      isOnline: true,
    };
  }

  // Backend unavailable — don't increment local counter as "global"
  return {
    counted: false,
    total: getVisitCount(),
    isOnline: false,
  };
}
