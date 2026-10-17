// =============================================================
// PIP.EXE — Test Setup
// =============================================================

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage and sessionStorage
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });
Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock, writable: true });

// Reset storage between tests
beforeEach(() => {
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Suppress React act() warnings in tests where not critical
vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
  const msg = String(args[0] ?? '');
  if (msg.includes('Warning:') || msg.includes('act(')) return;
  console.warn(...args);
});
