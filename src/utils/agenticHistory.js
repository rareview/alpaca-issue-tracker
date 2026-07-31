/**
 * Helpers for AI Issue Resolver send history stored on issue meta.
 */

/**
 * Clean one raw history entry into a predictable shape for the UI.
 * PHP stores snake_case keys (target_branch, sent_at); we return camelCase etc.
 * Returns null if the entry is invalid (e.g. missing url).
 *
 * @param {Object} entry Raw send entry.
 * @return {{url: string, status: string, targetBranch: string, sentAt: string}|null} Normalized send entry, or null when invalid.
 */
export function normalizeAgenticSend(entry) {
  if (!entry || 'object' !== typeof entry) {
    return null;
  }

  const url = String(entry.url || '').trim();
  if (!url) {
    return null;
  }

  return {
    url,
    status: String(entry.status || 'sent').trim() || 'sent',
    targetBranch: String(
      entry.targetBranch || entry.target_branch || '',
    ).trim(),
    sentAt: String(entry.sentAt || entry.sent_at || '').trim(),
  };
}

/**
 * Read chronological AI Issue Resolver send history from issue meta (oldest first).
 *
 * @param {Object} meta Issue meta payload.
 * @return {Array<{url: string, status: string, targetBranch: string, sentAt: string}>} Oldest-first send history entries.
 */
export function readAgenticSendHistoryFromMeta(meta) {
  const map = meta && 'object' === typeof meta ? meta : {};
  const stored = map.alpaca_agentic_send_history;

  if (!Array.isArray(stored) || !stored.length) {
    return [];
  }

  return stored.map(normalizeAgenticSend).filter(Boolean);
}

/**
 * Whether the issue has any AI Issue Resolver send history.
 *
 * @param {Object} meta Issue meta payload.
 * @return {boolean} True when send history has at least one valid entry.
 */
export function hasAgenticHistory(meta) {
  return readAgenticSendHistoryFromMeta(meta).length > 0;
}

/**
 * Format a GMT ISO send timestamp with the site date format.
 *
 * @param {string} sentAt GMT ISO-8601 timestamp.
 * @return {string} Localized date, or empty string when unavailable.
 */
export function formatAgenticSentDate(sentAt) {
  if (!sentAt || !wp.date || 'function' !== typeof wp.date.dateI18n) {
    return '';
  }

  try {
    const format = wp.date.getSettings()?.formats?.date || 'Y-m-d';
    return wp.date.dateI18n(format, sentAt, true) || '';
  } catch (err) {
    return '';
  }
}
