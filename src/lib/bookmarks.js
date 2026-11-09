const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SLUG_PATTERN = /^mona-[0-9a-zA-Z]{4}$/;

/**
 * @typedef {{ url: string, slug: string }} Bookmark
 */

/**
 * @param {unknown} value
 * @returns {value is Bookmark}
 */
function isBookmark(value) {
  if (
    typeof value !== 'object'
    || value === null
    || Array.isArray(value)
    || !('url' in value)
    || !('slug' in value)
    || typeof value.url !== 'string'
    || typeof value.slug !== 'string'
    || !SLUG_PATTERN.test(value.slug)
  ) {
    return false;
  }

  try {
    const url = new URL(value.url);
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname.length > 0;
  } catch {
    return false;
  }
}

/**
 * Normalizes a web URL, adding HTTPS when the user omits a protocol.
 * @param {string} input
 * @returns {string}
 */
export function normalizeUrl(input) {
  const value = input.trim();
  if (!value) {
    throw new TypeError('Enter a URL.');
  }

  const candidate = /^https?:\/\//i.test(value)
    ? value
    : value.startsWith('//')
      ? `https:${value}`
      : `https://${value}`;

  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new TypeError('Enter a valid web URL.');
  }

  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || !url.hostname) {
    throw new TypeError('Enter a valid web URL.');
  }

  return url.href;
}

/**
 * Parses and validates untrusted persisted data. Invalid entries are discarded.
 * @param {string | null} raw
 * @returns {Bookmark[]}
 */
export function parseBookmarks(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return [];
  }

  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(isBookmark).map(({ url, slug }) => ({ url, slug }));
  } catch {
    return [];
  }
}

/**
 * @param {Bookmark} bookmark
 * @returns {string}
 */
export function formatBookmark(bookmark) {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

/**
 * Generates a four-character base62 suffix.
 * @param {() => number} [random]
 * @returns {string}
 */
export function generateSlug(random = Math.random) {
  let suffix = '';
  for (let index = 0; index < 4; index += 1) {
    suffix += BASE62[Math.floor(random() * BASE62.length)];
  }
  return `mona-${suffix}`;
}

/**
 * @param {Bookmark[]} bookmarks
 * @returns {string}
 */
export function generateUniqueSlug(bookmarks) {
  const usedSlugs = new Set(bookmarks.map(({ slug }) => slug));
  let slug = generateSlug();
  while (usedSlugs.has(slug)) {
    slug = generateSlug();
  }
  return slug;
}
