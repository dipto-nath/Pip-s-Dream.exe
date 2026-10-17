// =============================================================
// PIP.EXE — Visit Counter Tests
// =============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { getVisitCount, recordVisit, formatCount } from '../lib/visitCounter';

const COUNTER_KEY = 'pip-exe-visits';
const SESSION_KEY = 'pip-exe-session';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('getVisitCount', () => {
  it('returns 1 as initial count when storage is empty', () => {
    expect(getVisitCount()).toBe(1);
  });

  it('returns saved count from localStorage', () => {
    localStorage.setItem(COUNTER_KEY, '42');
    expect(getVisitCount()).toBe(42);
  });

  it('recovers safely from invalid stored values', () => {
    localStorage.setItem(COUNTER_KEY, 'not-a-number');
    expect(getVisitCount()).toBe(1);
  });

  it('recovers safely from negative values', () => {
    localStorage.setItem(COUNTER_KEY, '-5');
    expect(getVisitCount()).toBe(1);
  });
});

describe('recordVisit', () => {
  it('increments count on a new session', () => {
    localStorage.setItem(COUNTER_KEY, '10');
    const result = recordVisit();
    expect(result).toBe(11);
    expect(localStorage.getItem(COUNTER_KEY)).toBe('11');
  });

  it('does not increment if already counted in this session', () => {
    localStorage.setItem(COUNTER_KEY, '10');
    sessionStorage.setItem(SESSION_KEY, '1');
    const result = recordVisit();
    expect(result).toBe(10);
    expect(localStorage.getItem(COUNTER_KEY)).toBe('10');
  });

  it('sets the session key on first increment', () => {
    recordVisit();
    expect(sessionStorage.getItem(SESSION_KEY)).toBe('1');
  });

  it('does not double-increment when called twice in same session', () => {
    const first = recordVisit();
    const second = recordVisit();
    expect(first).toBe(second);
  });

  it('initializes from 1 when storage is empty', () => {
    const result = recordVisit();
    expect(result).toBe(2); // 1 (initial) + 1 (increment)
  });
});

describe('formatCount', () => {
  it('pads numbers correctly', () => {
    expect(formatCount(5, 7)).toBe('0000005');
    expect(formatCount(1234, 7)).toBe('0001234');
  });

  it('handles large numbers without padding', () => {
    expect(formatCount(12345678, 7)).toBe('12345678');
  });

  it('handles zero', () => {
    expect(formatCount(0, 7)).toBe('0000000');
  });
});
