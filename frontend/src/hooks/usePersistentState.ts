// =============================================================
// PIP.EXE — usePersistentState hook
// =============================================================

import { useState, useEffect } from 'react';

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  validate?: (v: unknown) => v is T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      const parsed: unknown = JSON.parse(raw);
      if (validate && !validate(parsed)) return defaultValue;
      return parsed as T;
    } catch {
      return defaultValue;
    }
  });

  // Persist to localStorage whenever state changes.
  // (The ref below was previously updated during render, which
  //  triggered a lint warning. The ref is unused elsewhere, so it
  //  has been removed.)
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch { /* Storage unavailable — silently ignore */ }
  }, [key, state]);

  return [state, setState];
}
