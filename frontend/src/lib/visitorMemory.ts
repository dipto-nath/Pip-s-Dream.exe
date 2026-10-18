// =============================================================
// PIP.EXE — Visitor Memory
// Tracks returning visitors and their preferences in localStorage.
// Works alongside visitCounter.ts (which handles session-based
// visit counting) to provide persistent visitor profiles.
// =============================================================

import type { LanternPreset } from './types';
import { getVisitCount, recordVisit } from './visitCounter';

const PROFILE_KEY = 'pip-exe-profile';
const MAX_NAME_LENGTH = 24;

export interface VisitorProfile {
  /** Timestamp of the first visit to this browser. */
  firstVisit: number;
  /** Total number of unique sessions (mirrors visitCounter local count). */
  visitCount: number;
  /** Visitor's chosen name (from guestbook submission). */
  name?: string;
  /** Timestamp of the most recent visit. */
  lastSeen: number;
  /** Last-selected nightlight preset, remembered for return visits. */
  favoritePreset?: LanternPreset;
  /** Whether the first-visit greeting has been shown. */
  greeted: boolean;
}

/**
 * Type guard for validating a parsed localStorage object as a VisitorProfile.
 */
function isValidProfile(obj: unknown): obj is VisitorProfile {
  if (typeof obj !== 'object' || obj === null) return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p.firstVisit === 'number' && isFinite(p.firstVisit) &&
    typeof p.visitCount === 'number' && p.visitCount >= 0 &&
    typeof p.lastSeen === 'number' && isFinite(p.lastSeen) &&
    typeof p.greeted === 'boolean' &&
    (p.name === undefined || (typeof p.name === 'string' && p.name.length > 0)) &&
    (p.favoritePreset === undefined ||
      (typeof p.favoritePreset === 'string' &&
        ['whisper', 'moonbeam', 'stardust'].includes(p.favoritePreset)))
  );
}

/**
 * Load the visitor profile from localStorage.
 * Returns null if no profile exists or the stored data is invalid.
 */
export function loadProfile(): VisitorProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidProfile(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persist the visitor profile to localStorage.
 */
export function saveProfile(profile: VisitorProfile): boolean {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialise or update the visitor profile on mount.
 * Increments the local visit count and refreshes lastSeen.
 */
export function initializeProfile(): VisitorProfile {
  const count = recordVisit(); // idempotent — session-guarded in visitCounter
  const now = Date.now();

  const existing = loadProfile();
  if (existing) {
    existing.visitCount = count;
    existing.lastSeen = now;
    saveProfile(existing);
    return existing;
  }

  const profile: VisitorProfile = {
    firstVisit: now,
    visitCount: count,
    lastSeen: now,
    greeted: false,
  };
  saveProfile(profile);
  return profile;
}

/**
 * Update the visitor's remembered name.
 */
export function updateVisitorName(name: string): VisitorProfile | null {
  const profile = loadProfile();
  if (!profile) return null;
  profile.name = name.trim().slice(0, MAX_NAME_LENGTH);
  saveProfile(profile);
  return profile;
}

/**
 * Persist the visitor's favorite nightlight preset.
 */
export function saveFavoritePreset(preset: LanternPreset): void {
  const profile = loadProfile();
  if (!profile) return;
  profile.favoritePreset = preset;
  saveProfile(profile);
}

/**
 * Mark the visitor profile as greeted (so the intro greeting
 * doesn't re-appear on every navigation).
 */
export function markGreeted(): void {
  const profile = loadProfile();
  if (!profile) return;
  profile.greeted = true;
  saveProfile(profile);
}

/**
 * Returns true if the visitor has an existing profile (returning visitor).
 */
export function isReturningVisitor(): boolean {
  return loadProfile() !== null;
}

/**
 * Time-of-day bucket for contextual greetings.
 */
function getTimeOfDay(): 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  if (hour >= 21 || hour < 3) return 'night';
  return 'dawn'; // 3am–5am
}

/**
 * Generate a personalized greeting based on the visitor's profile
 * and visit history. Pip's voice is sleepy, curious, and warm.
 */
export function getPersonalizedGreeting(): { text: string; isFirst: boolean } {
  const profile = loadProfile();
  const count = getVisitCount();
  const timeOfDay = getTimeOfDay();

  // ── First visit ──
  if (!profile || count <= 1) {
    const openings = {
      morning: 'Good morning, little dreamer!',
      afternoon: 'Hello there, traveler!',
      evening: 'Ah, a visitor at dusk. How lovely.',
      night: 'A midnight guest... Pip was hoping someone would come.',
      dawn: 'Even the stars are fading. Stay for a lullaby?',
    };
    return { text: openings[timeOfDay], isFirst: true };
  }

  // ── Returning visitor with a remembered name ──
  const name = profile.name;
  if (name) {
    if (count >= 10) {
      return {
        text: `Oh, ${name}... you keep coming back. The nursery feels warmer when you do. Have you found the secret star yet?`,
        isFirst: false,
      };
    }
    if (count >= 5) {
      return {
        text: `Welcome back, ${name}! Pip's been busy with the dream deliveries. The lullaby sounds sweeter with you listening.`,
        isFirst: false,
      };
    }
    return {
      text: `Welcome back, ${name}! I've been polishing the lanterns for you.`,
      isFirst: false,
    };
  }

  // ── Returning visitor, no name yet ──
  if (count >= 5) {
    return {
      text: 'You return often, little one. Pip remembers your footsteps. Have you signed the noticeboard yet?',
      isFirst: false,
    };
  }
  const returns = {
    morning: 'Back so early! The lullabies haven\'t even finished warming up.',
    afternoon: 'Hello again! Pip left a small dream between the last lullaby and first light.',
    evening: 'You\'re back! The lanterns are glowing warmer already.',
    night: 'A familiar shadow. Pip wondered when you\'d return.',
    dawn: 'Back at the edge of morning? The stars are fading, but the music box still plays.',
  };
  return { text: returns[timeOfDay], isFirst: false };
}

export { getVisitCount };