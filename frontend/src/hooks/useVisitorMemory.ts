// =============================================================
// PIP.EXE — useVisitorMemory Hook
// Lazy-initialises and persists the visitor profile on mount.
// Mirrors the usePersistentState pattern but works with a
// complex object and the visitCounter session logic.
// =============================================================

import { useState, useCallback } from 'react';
import type { LanternPreset } from '../lib/types';
import {
  loadProfile,
  initializeProfile,
  updateVisitorName,
  saveFavoritePreset as persistPreset,
  markGreeted,
  getPersonalizedGreeting,
  type VisitorProfile,
} from '../lib/visitorMemory';

export interface UseVisitorMemoryResult {
  profile: VisitorProfile | null;
  isFirstVisit: boolean;
  isReturning: boolean;
  greeting: { text: string; isFirst: boolean };
  /** Save the visitor's name (e.g. after a guestbook submission). */
  saveName: (name: string) => void;
  /** Save the visitor's favorite nightlight preset. */
  savePreset: (preset: LanternPreset) => void;
  /** Mark that the intro greeting has been shown. */
  markGreeted: () => void;
  /** Reload the profile from localStorage (for testing). */
  refresh: () => void;
}

export function useVisitorMemory(): UseVisitorMemoryResult {
  // Lazy-init from localStorage / initializeProfile — matches usePersistentState pattern
  const [profile, setProfile] = useState<VisitorProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    return initializeProfile();
  });

  const saveName = useCallback((name: string): void => {
    const updated = updateVisitorName(name);
    if (updated) {
      setProfile(updated);
    }
  }, []);

  const savePreset = useCallback((preset: LanternPreset): void => {
    persistPreset(preset);
    setProfile((prev) => (prev ? { ...prev, favoritePreset: preset } : prev));
  }, []);

  const markGreetedCallback = useCallback(() => {
    markGreeted();
    setProfile((prev) => (prev ? { ...prev, greeted: true } : prev));
  }, []);

  const refresh = useCallback(() => {
    setProfile(loadProfile());
  }, []);

  const isFirstVisit = (profile?.visitCount ?? 0) <= 1;
  const isReturning = profile !== null && (profile?.visitCount ?? 0) > 1;

  // getPersonalizedGreeting reads from localStorage directly (single source
  // of truth), so it reflects the latest saved name immediately.
  const greeting = getPersonalizedGreeting();

  return {
    profile,
    isFirstVisit,
    isReturning,
    greeting,
    saveName,
    savePreset,
    markGreeted: markGreetedCallback,
    refresh,
  };
}
