// =============================================================
// PIP.EXE — Storage Interface
// Abstracts persistence so handlers work with JSON or PostgreSQL
// =============================================================

import type { GuestbookEntry, VisitorStats } from './types';

/**
 * Guestbook storage contract.
 * Implemented by jsonStorage (local dev) and Supabase adapter (production).
 */
export interface GuestbookStorage {
  /** Fetch the latest N entries, newest first. */
  getEntries(limit: number): Promise<GuestbookEntry[]>;
  /** Insert a new entry. Returns the created entry with server-generated fields. */
  createEntry(nickname: string, message: string): Promise<GuestbookEntry>;
  /** Check if a recent entry from the same source exists (for rate limiting). */
  recentEntryCount(source: string, windowMs: number): Promise<number>;
}

/**
 * Visit storage contract.
 */
export interface VisitStorage {
  /** Get current total visit count. */
  getStats(): Promise<VisitorStats>;
  /** Record a visit idempotently. Returns whether a new visit was counted. */
  recordVisit(sessionHash: string): Promise<{ counted: boolean; total: number }>;
  /** Atomic visitor counter increment (zero personal data stored). */
  incrementVisits?(): Promise<number>;
  /** Check overall database health. */
  isHealthy(): Promise<boolean>;
}

/** Combined storage interface. */
export interface Storage extends GuestbookStorage, VisitStorage {}
