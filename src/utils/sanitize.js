import DOMPurify from 'dompurify';

/**
 * Sanitize HTML using DOMPurify.
 *
 * Preserves data-avatar and data-userid attributes needed by
 * injectAvatarStyles in TimelineEntry.jsx.
 *
 * @param {string} html Raw HTML string.
 * @return {string} Sanitized HTML string.
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['data-avatar', 'data-userid'],
  });
};

/**
 * Escape a string for safe use as HTML text content.
 *
 * @param {string} str Raw string.
 * @return {string} Escaped string.
 */
export const escapeHtml = (str) => {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
};

/**
 * Escape a string for safe use inside an HTML attribute.
 *
 * @param {string} str Raw string.
 * @return {string} Escaped string safe for attribute values.
 */
export const escapeAttr = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Check whether a string is a valid HTTP or HTTPS URL.
 *
 * @param {string} str Candidate URL string.
 * @return {boolean} True when the string is a valid http/https URL.
 */
export const isValidHttpUrl = (str) => {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};
