// =============================================================
// PIP.EXE — Backend API Types
// Shared between local server and Supabase Edge Functions
// =============================================================

/** A single guestbook entry as returned by the API. */
export interface GuestbookEntry {
  id: string;
  nickname: string;
  message: string;
  created_at: string;
  status: 'published' | 'hidden';
}

/** Input for creating a guestbook entry. */
export interface GuestbookInput {
  nickname: string;
  message: string;
  /** Honeypot field — should be empty. Bots that fill it out are rejected. */
  website?: string;
}

/** A single visit record. */
export interface VisitRecord {
  id: string;
  session_hash: string;
  created_at: string;
}

/** Public visitor statistics. */
export interface VisitorStats {
  total_visits: number;
}

/** Health check response. */
export interface HealthCheck {
  status: 'ok' | 'degraded';
  timestamp: string;
  checks: Record<string, boolean>;
}

/** Standardised API response wrapper. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Pagination metadata for entries list. */
export interface EntriesPage {
  entries: GuestbookEntry[];
}
