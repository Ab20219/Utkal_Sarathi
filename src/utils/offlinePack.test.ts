import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOfflinePack, isValidOfflinePack, EMERGENCY_CONTACTS } from './offlinePack.ts';

test('builds valid offline pack with default data', () => {
  const pack = buildOfflinePack('My trip to Puri');
  assert.equal(isValidOfflinePack(pack), true);
  assert.equal(pack.savedTripNotes, 'My trip to Puri');
  assert.equal(pack.contacts.length, EMERGENCY_CONTACTS.length);
  assert.ok(pack.contacts.some(c => c.number === '112'));
  assert.ok(pack.phrases.length >= 5);
});

test('rejects invalid or corrupted pack objects', () => {
  assert.equal(isValidOfflinePack(null), false);
  assert.equal(isValidOfflinePack({}), false);
  assert.equal(isValidOfflinePack({ version: '1.0' }), false);
  assert.equal(isValidOfflinePack({ version: '1.0', contacts: [] }), false);
});
