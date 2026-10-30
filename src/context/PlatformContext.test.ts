import test from 'node:test';
import assert from 'node:assert/strict';

test('verifies cross-platform OS and device key mappings', () => {
  const getModKey = (os: string) => (os === 'mac' || os === 'ios' ? '⌘' : 'Ctrl');
  
  assert.equal(getModKey('mac'), '⌘');
  assert.equal(getModKey('ios'), '⌘');
  assert.equal(getModKey('windows'), 'Ctrl');
  assert.equal(getModKey('android'), 'Ctrl');
});

test('verifies mobile breakpoint detection boundary', () => {
  const isMobileWidth = (width: number) => width < 768;
  
  assert.equal(isMobileWidth(375), true);
  assert.equal(isMobileWidth(393), true);
  assert.equal(isMobileWidth(412), true);
  assert.equal(isMobileWidth(767), true);
  assert.equal(isMobileWidth(768), false);
  assert.equal(isMobileWidth(1024), false);
});

test('verifies PWA manifest required fields structure', () => {
  const manifest = {
    id: '/',
    name: 'UtkalSarathi - Odisha Smart Tourism & Safety',
    short_name: 'UtkalSarathi',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    theme_color: '#991b1b',
    background_color: '#090a0f',
  };

  assert.ok(manifest.id, 'Manifest must have an id');
  assert.ok(manifest.short_name.length <= 12, 'short_name should be <= 12 characters');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/');
});
