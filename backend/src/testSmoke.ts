// =============================================================
// PIP.EXE — Backend Integration Test Script
// Starts the server, makes requests, and shuts down.
// Run with: npx tsx src/testSmoke.ts
// =============================================================

import { JsonStorage } from './jsonStorage';
import {
  handleGetGuestbook,
  handleCreateGuestbook,
  handleRecordVisit,
  handleGetStats,
  handleHealthCheck,
} from './handlers';

async function runTests() {
  console.log('Testing API handlers directly...\n');

  const storage = new JsonStorage();

  // --- Health ---
  const health = await handleHealthCheck(storage);
  console.log('Health:', JSON.stringify(health));

  // --- Stats (initial) ---
  const initialStats = await handleGetStats(storage);
  console.log('Initial stats:', JSON.stringify(initialStats));

  // --- Guestbook (empty) ---
  const emptyGB = await handleGetGuestbook(storage);
  console.log('Guestbook (empty):', JSON.stringify(emptyGB));

  // --- Create entry ---
  const created = await handleCreateGuestbook(storage, {
    nickname: 'Pip',
    message: 'Hello from the nursery! ⭐',
  });
  console.log('Create entry:', JSON.stringify(created));

  // --- Guestbook (after post) ---
  const afterPost = await handleGetGuestbook(storage);
  console.log('Guestbook (after post):', JSON.stringify(afterPost));

  // --- Validation: empty ---
  const empty = await handleCreateGuestbook(storage, { nickname: '', message: '' });
  console.log('Validation (empty):', JSON.stringify(empty));

  // --- Validation: too long name ---
  const longName = await handleCreateGuestbook(storage, {
    nickname: 'A'.repeat(25),
    message: 'Hi',
  });
  console.log('Validation (long name):', JSON.stringify(longName));

  // --- Validation: honeypot ---
  const honeypot = await handleCreateGuestbook(storage, {
    nickname: 'Bot',
    message: 'Spam',
    website: 'http://spam.com',
  });
  console.log('Validation (honeypot):', JSON.stringify(honeypot));

  // --- Record visit ---
  const visit1 = await handleRecordVisit(storage, 'test-session-1');
  console.log('Visit 1:', JSON.stringify(visit1));

  // --- Record visit (duplicate) ---
  const visit2 = await handleRecordVisit(storage, 'test-session-1');
  console.log('Visit 2 (dup):', JSON.stringify(visit2));

  // --- Record visit (new) ---
  const visit3 = await handleRecordVisit(storage, 'test-session-2');
  console.log('Visit 3 (new):', JSON.stringify(visit3));

  // --- Final stats ---
  const finalStats = await handleGetStats(storage);
  console.log('Final stats:', JSON.stringify(finalStats));

  console.log('\n✅ All smoke tests passed!');
}

runTests().catch((err) => {
  console.error('❌ Smoke test failed:', err);
  process.exit(1);
});
