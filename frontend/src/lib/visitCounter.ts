// =============================================================
// PIP.EXE — Visit Counter (browser-local)
// =============================================================

const COUNTER_KEY = 'pip-exe-visits';
const SESSION_KEY = 'pip-exe-session';
const INITIAL_COUNT = 1;

function safeGetNumber(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) || parsed < 0 ? null : parsed;
  } catch {
    return null;
  }
}

function safeSet(storage: Storage, key: string, value: string): boolean {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function getVisitCount(): number {
  const saved = safeGetNumber(COUNTER_KEY);
  return saved ?? INITIAL_COUNT;
}

/**
 * Increments the counter once per browser session.
 * Returns the new count.
 */
export function recordVisit(): number {
  try {
    // Check if we already counted this session
    const alreadyCounted = sessionStorage.getItem(SESSION_KEY);
    if (alreadyCounted) {
      return getVisitCount();
    }

    const current = getVisitCount();
    const next = current + 1;

    safeSet(localStorage, COUNTER_KEY, String(next));
    safeSet(sessionStorage, SESSION_KEY, '1');

    return next;
  } catch {
    return getVisitCount();
  }
}

export function formatCount(n: number, digits = 7): string {
  return String(Math.max(0, Math.floor(n))).padStart(digits, '0');
}
