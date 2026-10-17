// =============================================================
// PIP.EXE — Backend Input Validation
// Shared between local server and Supabase Edge Functions
// =============================================================

import type { GuestbookInput } from './types';

export const MAX_NICKNAME_LENGTH = 24;
export const MAX_MESSAGE_LENGTH = 180;
export const MAX_ENTRIES = 30; // entries fetched per page
export const REQUEST_MAX_BYTES = 64 * 1024; // 64 KB

export interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: 'empty' | 'too_long' | 'invalid_type' | 'honeypot' | 'too_many_requests';
}

/**
 * Validates a guestbook submission.
 * Checks fields are strings, non-empty after trimming, within length bounds,
 * and the honeypot field is untouched.
 */
export function validateGuestbookInput(input: unknown): ValidationResult {
  if (typeof input !== 'object' || input === null) {
    return { valid: false, error: 'Request body must be a JSON object.', code: 'invalid_type' };
  }

  const obj = input as Record<string, unknown>;

  // --- Honeypot check ---
  // A real visitor won't fill the hidden "website" field. If a bot fills it,
  // silently reject.
  const honeypot = obj.website;
  if (honeypot !== undefined && honeypot !== null && honeypot !== '') {
    return { valid: false, error: 'Spam detected.', code: 'honeypot' };
  }

  // --- Type checks ---
  if (typeof obj.nickname !== 'string') {
    return { valid: false, error: 'Nickname must be a string.', code: 'invalid_type' };
  }
  if (typeof obj.message !== 'string') {
    return { valid: false, error: 'Message must be a string.', code: 'invalid_type' };
  }

  const nickname = obj.nickname.trim();
  const message = obj.message.trim();

  // --- Empty checks ---
  if (nickname.length === 0) {
    return { valid: false, error: 'Name is required.', code: 'empty' };
  }
  if (message.length === 0) {
    return { valid: false, error: 'Message is required.', code: 'empty' };
  }

  // --- Length checks ---
  if (nickname.length > MAX_NICKNAME_LENGTH) {
    return {
      valid: false,
      error: `Name must be ${MAX_NICKNAME_LENGTH} characters or fewer.`,
      code: 'too_long',
    };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
      code: 'too_long',
    };
  }

  return { valid: true };
}

/**
 * Normalises a validated guestbook input into a clean form.
 */
export function sanitizeGuestbookInput(input: GuestbookInput): { nickname: string; message: string } {
  return {
    nickname: input.nickname.trim().slice(0, MAX_NICKNAME_LENGTH),
    message: input.message.trim().slice(0, MAX_MESSAGE_LENGTH),
  };
}

/**
 * Validates a session ID for visit recording.
 * Accepts any non-empty string up to 256 characters.
 */
export function validateSessionId(sessionId: unknown): ValidationResult {
  if (typeof sessionId !== 'string') {
    return { valid: false, error: 'Session ID must be a string.', code: 'invalid_type' };
  }
  const trimmed = sessionId.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Session ID is required.', code: 'empty' };
  }
  if (trimmed.length > 256) {
    return { valid: false, error: 'Session ID too long.', code: 'too_long' };
  }
  return { valid: true };
}
