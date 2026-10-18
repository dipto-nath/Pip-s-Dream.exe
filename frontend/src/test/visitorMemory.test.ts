// =============================================================
// PIP.EXE — Visitor Memory Tests
// Run with: npx vitest run src/test/visitorMemory.test.ts
// =============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadProfile,
  saveProfile,
  initializeProfile,
  updateVisitorName,
  saveFavoritePreset,
  markGreeted,
  isReturningVisitor,
  getPersonalizedGreeting,
  type VisitorProfile,
} from '../lib/visitorMemory';

const PROFILE_KEY = 'pip-exe-profile';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('loadProfile', () => {
  it('returns null when no profile is stored', () => {
    expect(loadProfile()).toBeNull();
  });

  it('returns a valid profile from localStorage', () => {
    const profile: VisitorProfile = {
      firstVisit: 1000,
      visitCount: 3,
      lastSeen: 2000,
      greeted: false,
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    expect(loadProfile()).toEqual(profile);
  });

  it('returns null for malformed JSON', () => {
    localStorage.setItem(PROFILE_KEY, '{ broken json !');
    expect(loadProfile()).toBeNull();
  });

  it('returns null for missing required fields', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: 'Test' }));
    expect(loadProfile()).toBeNull();
  });

  it('returns null for invalid field types', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      firstVisit: 'not-a-number',
      visitCount: 3,
      lastSeen: 2000,
      greeted: false,
    }));
    expect(loadProfile()).toBeNull();
  });

  it('returns null for invalid favoritePreset value', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      firstVisit: 1000,
      visitCount: 3,
      lastSeen: 2000,
      greeted: false,
      favoritePreset: 'rainbow',
    }));
    expect(loadProfile()).toBeNull();
  });

  it('accepts a valid profile with name and favoritePreset', () => {
    const profile: VisitorProfile = {
      firstVisit: 1000,
      visitCount: 3,
      lastSeen: 2000,
      greeted: false,
      name: 'Pip',
      favoritePreset: 'moonbeam',
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    const result = loadProfile();
    expect(result?.name).toBe('Pip');
    expect(result?.favoritePreset).toBe('moonbeam');
  });

  it('rejects empty-string name', () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      firstVisit: 1000,
      visitCount: 3,
      lastSeen: 2000,
      greeted: false,
      name: '',
    }));
    expect(loadProfile()).toBeNull();
  });
});

describe('saveProfile and initializeProfile', () => {
  it('saves and loads profile', () => {
    const profile: VisitorProfile = {
      firstVisit: 1000,
      visitCount: 1,
      lastSeen: 1000,
      greeted: false,
    };
    expect(saveProfile(profile)).toBe(true);
    expect(loadProfile()).toEqual(profile);
  });

  it('initializes a new profile if none exists', () => {
    const profile = initializeProfile();
    expect(profile.visitCount).toBeGreaterThanOrEqual(1);
    expect(profile.greeted).toBe(false);
  });

  it('updates an existing profile on re-initialization', () => {
    const initial = initializeProfile();
    const updated = initializeProfile();
    expect(updated.firstVisit).toBe(initial.firstVisit);
  });
});

describe('profile mutation helpers', () => {
  it('updates visitor name', () => {
    initializeProfile();
    const updated = updateVisitorName('Luna');
    expect(updated?.name).toBe('Luna');
  });

  it('saves favorite preset', () => {
    initializeProfile();
    saveFavoritePreset('stardust');
    const profile = loadProfile();
    expect(profile?.favoritePreset).toBe('stardust');
  });

  it('marks profile greeted', () => {
    initializeProfile();
    markGreeted();
    const profile = loadProfile();
    expect(profile?.greeted).toBe(true);
  });

  it('checks if visitor is returning', () => {
    expect(isReturningVisitor()).toBe(false);
    initializeProfile();
    expect(isReturningVisitor()).toBe(true);
  });

  it('generates a first-visit greeting with isFirst=true when no profile exists', () => {
    const greeting = getPersonalizedGreeting();
    expect(greeting.isFirst).toBe(true);
    expect(greeting.text.length).toBeGreaterThan(0);
  });

  it('returns a returning greeting with isFirst=false after profile exists', () => {
    initializeProfile();
    const profile = loadProfile();
    if (profile) {
      profile.visitCount = 3;
      saveProfile(profile);
    }
    const greeting = getPersonalizedGreeting();
    expect(greeting.isFirst).toBe(false);
    expect(greeting.text.length).toBeGreaterThan(0);
  });

  it('includes the visitor name in the greeting', () => {
    initializeProfile();
    updateVisitorName('Starlight');
    const profile = loadProfile();
    if (profile) {
      profile.visitCount = 3;
      saveProfile(profile);
    }
    const greeting = getPersonalizedGreeting();
    expect(greeting.text).toContain('Starlight');
  });

  it('gives a special greeting for frequent visitors (10+ visits)', () => {
    initializeProfile();
    updateVisitorName('Starlight');
    localStorage.setItem('pip-exe-visits', '12');
    const greeting = getPersonalizedGreeting();
    expect(greeting.text.toLowerCase()).toContain('keep coming back');
  });

  it('gives a regular-visitor greeting for 5+ visits', () => {
    initializeProfile();
    updateVisitorName('Starlight');
    localStorage.setItem('pip-exe-visits', '7');
    const greeting = getPersonalizedGreeting();
    expect(greeting.isFirst).toBe(false);
    expect(greeting.text.toLowerCase()).toContain('welcome back');
  });
});