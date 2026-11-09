import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatBookmark,
  generateSlug,
  normalizeUrl,
  parseBookmarks,
} from '../src/lib/bookmarks.js';

test('normalizes URLs with and without https to the same value', () => {
  assert.equal(
    normalizeUrl('www.example.com'),
    normalizeUrl('https://www.example.com'),
  );
  assert.equal(normalizeUrl(' www.example.com '), 'https://www.example.com/');
});

test('recovers gracefully from empty, corrupted, legacy, and non-array storage', () => {
  const malformedValues = [
    null,
    '',
    'not-json',
    JSON.stringify({ url: 'https://www.example.com/', slug: 'mona-7fk2' }),
    JSON.stringify(['https://www.example.com', 'mona-7fk2']),
    JSON.stringify([{ href: 'https://www.example.com/', shortCode: 'mona-7fk2' }]),
  ];

  for (const raw of malformedValues) {
    assert.doesNotThrow(() => parseBookmarks(raw));
    assert.deepEqual(parseBookmarks(raw), []);
  }

  assert.deepEqual(
    parseBookmarks(JSON.stringify([
      { url: 'https://www.example.com/', slug: 'mona-7fk2' },
      { url: 'javascript:alert(1)', slug: 'mona-nope' },
      { url: 'https://bad.example/', slug: 'not-a-slug' },
    ])),
    [{ url: 'https://www.example.com/', slug: 'mona-7fk2' }],
  );
});

test('formats a bookmark with the exact visible separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com/', slug: 'mona-7fk2' }),
    'https://www.example.com/ :: mona-7fk2',
  );
});

test('generates a short base62 slug with the mona prefix', () => {
  const values = [0, 10 / 62, 36 / 62, 61 / 62];
  assert.equal(generateSlug(() => values.shift() ?? 0), 'mona-0aAZ');
});
