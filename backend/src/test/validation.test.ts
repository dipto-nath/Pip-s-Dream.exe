// =============================================================
// PIP.EXE — Backend Validation Tests
// Run with: npx vitest run src/test/validation.test.ts
// =============================================================

import { describe, it, expect } from 'vitest';
import {
  validateGuestbookInput,
  sanitizeGuestbookInput,
  validateSessionId,
  MAX_NICKNAME_LENGTH,
  MAX_MESSAGE_LENGTH,
} from '../validation';

describe('validateGuestbookInput', () => {
  it('accepts valid input', () => {
    const result = validateGuestbookInput({ nickname: 'Pip', message: 'Hello!' });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects null', () => {
    expect(validateGuestbookInput(null).valid).toBe(false);
  });

  it('rejects arrays', () => {
    expect(validateGuestbookInput(['Pip', 'Hi']).valid).toBe(false);
  });

  it('rejects missing nickname', () => {
    const result = validateGuestbookInput({ message: 'Hello' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Nickname');
  });

  it('rejects non-string nickname', () => {
    const result = validateGuestbookInput({ nickname: 123, message: 'Hello' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be a string');
  });

  it('rejects empty nickname after trim', () => {
    const result = validateGuestbookInput({ nickname: '   ', message: 'Hello' });
    expect(result.valid).toBe(false);
    expect(result.code).toBe('empty');
  });

  it('rejects missing message', () => {
    const result = validateGuestbookInput({ nickname: 'Pip' });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Message');
  });

  it('rejects empty message after trim', () => {
    const result = validateGuestbookInput({ nickname: 'Pip', message: '' });
    expect(result.valid).toBe(false);
    expect(result.code).toBe('empty');
  });

  it('rejects nickname exceeding max length', () => {
    const result = validateGuestbookInput({
      nickname: 'A'.repeat(MAX_NICKNAME_LENGTH + 1),
      message: 'Hello',
    });
    expect(result.valid).toBe(false);
    expect(result.code).toBe('too_long');
  });

  it('rejects message exceeding max length', () => {
    const result = validateGuestbookInput({
      nickname: 'Pip',
      message: 'B'.repeat(MAX_MESSAGE_LENGTH + 1),
    });
    expect(result.valid).toBe(false);
    expect(result.code).toBe('too_long');
  });

  it('rejects honeypot-filled submissions', () => {
    const result = validateGuestbookInput({
      nickname: 'Bot',
      message: 'Spam',
      website: 'http://spam.com',
    });
    expect(result.valid).toBe(false);
    expect(result.code).toBe('honeypot');
  });

  it('allows empty honeypot (legitimate submission)', () => {
    const result = validateGuestbookInput({
      nickname: 'Pip',
      message: 'Hello',
      website: '',
    });
    expect(result.valid).toBe(true);
  });
});

describe('sanitizeGuestbookInput', () => {
  it('trims nickname and message', () => {
    const result = sanitizeGuestbookInput({
      nickname: '  Pip  ',
      message: '  Hello  ',
    });
    expect(result).toEqual({ nickname: 'Pip', message: 'Hello' });
  });

  it('truncates nickname to max length', () => {
    const result = sanitizeGuestbookInput({
      nickname: 'A'.repeat(100),
      message: 'Hello',
    });
    expect(result.nickname.length).toBe(MAX_NICKNAME_LENGTH);
  });

  it('truncates message to max length', () => {
    const result = sanitizeGuestbookInput({
      nickname: 'Pip',
      message: 'B'.repeat(500),
    });
    expect(result.message.length).toBe(MAX_MESSAGE_LENGTH);
  });

  it('preserves HTML as plain text (no escaping)', () => {
    const result = sanitizeGuestbookInput({
      nickname: '<b>Hi</b>',
      message: '<script>x</script>',
    });
    expect(result.nickname).toBe('<b>Hi</b>');
    expect(result.message).toBe('<script>x</script>');
  });
});

describe('validateSessionId', () => {
  it('accepts valid UUID', () => {
    expect(validateSessionId('550e8400-e29b-41d4-a716-446655440000').valid).toBe(true);
  });

  it('accepts any non-empty string', () => {
    expect(validateSessionId('simple-id-123').valid).toBe(true);
  });

  it('rejects empty string', () => {
    const result = validateSessionId('');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('empty');
  });

  it('rejects whitespace-only string', () => {
    const result = validateSessionId('   ');
    expect(result.valid).toBe(false);
    expect(result.code).toBe('empty');
  });

  it('rejects non-string', () => {
    const result = validateSessionId(123);
    expect(result.valid).toBe(false);
    expect(result.code).toBe('invalid_type');
  });

  it('rejects null', () => {
    expect(validateSessionId(null).valid).toBe(false);
  });

  it('rejects overly long IDs', () => {
    const result = validateSessionId('x'.repeat(257));
    expect(result.valid).toBe(false);
    expect(result.code).toBe('too_long');
  });

  it('trims whitespace before validation', () => {
    expect(validateSessionId('  abc123  ').valid).toBe(true);
  });
});
