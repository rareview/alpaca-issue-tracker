/**
 * Helpers for AI Issue Resolver history stored on issue meta.
 */

/**
 * Clean one raw history entry into a predictable shape for the UI.
 * PHP stores snake_case keys (target_branch, occurred_at); we return camelCase.
 * Returns null if the entry is invalid (e.g. a "sent" entry missing its url).
 *
 * @param {Object} entry Raw history entry.
 * @return {Object|null} Normalized history entry, or null when invalid.
 */
export function normalizeAgenticHistoryEntry(entry) {
  if (!entry || 'object' !== typeof entry) {
    return null;
  }

  const type = String(entry.type || '').trim();
  const occurredAt = String(entry.occurred_at || '').trim();

  if ('deleted' === type) {
    return { type, occurredAt };
  }

  if ('applied' === type) {
    return {
      type,
      stagingPrUrl: String(entry.staging_pr_url || '').trim(),
      targetBranch: String(entry.target_branch || '').trim(),
      occurredAt,
    };
  }

  if ('sent' !== type) {
    return null;
  }

  const url = String(entry.url || '').trim();
  if (!url) {
    return null;
  }

  return {
    type: 'sent',
    url,
    targetBranch: String(entry.target_branch || '').trim(),
    occurredAt,
  };
}

/**
 * Read the chronological AI Issue Resolver history from issue meta (oldest first).
 *
 * @param {Object} meta Issue meta payload.
 * @return {Array<Object>} Oldest-first normalized history entries.
 */
export function readAgenticHistoryFromMeta(meta) {
  const map = meta && 'object' === typeof meta ? meta : {};
  const stored = map.alpaca_agentic_history;

  if (!Array.isArray(stored) || !stored.length) {
    return [];
  }

  return stored.map(normalizeAgenticHistoryEntry).filter(Boolean);
}

/**
 * Whether the issue has any AI Issue Resolver history.
 *
 * @param {Object} meta Issue meta payload.
 * @return {boolean} True when the history has at least one valid entry.
 */
export function hasAgenticHistory(meta) {
  return readAgenticHistoryFromMeta(meta).length > 0;
}

/**
 * Get the history entries since the most recent restart (a "deleted" entry), if any.
 *
 * Older entries stay visible in the AI Log tab forever, but "is this branch
 * already handled" checks must only look at the current cycle so a restart
 * really resets eligibility instead of it lingering from a previous attempt.
 *
 * @param {Object} meta Issue meta payload.
 * @return {Array<Object>} Oldest-first entries for the current cycle.
 */
export function getCurrentCycleHistory(meta) {
  const history = readAgenticHistoryFromMeta(meta);
  let lastDeletedIndex = -1;

  history.forEach((entry, index) => {
    if ('deleted' === entry.type) {
      lastDeletedIndex = index;
    }
  });

  return history.slice(lastDeletedIndex + 1);
}

/**
 * Branches actually sent (AI-created GitHub issue) in the current cycle.
 *
 * Used to confirm staging has a real AI-created GitHub issue before offering
 * "Apply fix to Production".
 *
 * @param {Object} meta Issue meta payload.
 * @return {Array<string>} Branch names sent in the current cycle.
 */
export function getSentBranchesInCurrentCycle(meta) {
  return getCurrentCycleHistory(meta)
    .filter((entry) => 'sent' === entry.type && entry.targetBranch)
    .map((entry) => entry.targetBranch);
}

/**
 * Branches already handled (sent OR a proven fix applied) in the current cycle.
 *
 * Used to decide which branches "Fix with AI" may still target and whether
 * production remains eligible for "Apply fix to Production". Once a branch is
 * handled either way, it drops out instead of offering a redundant AI run.
 *
 * @param {Object} meta Issue meta payload.
 * @return {Array<string>} Branch names handled in the current cycle.
 */
export function getHandledBranchesInCurrentCycle(meta) {
  return getCurrentCycleHistory(meta)
    .filter(
      (entry) =>
        ('sent' === entry.type || 'applied' === entry.type) &&
        entry.targetBranch,
    )
    .map((entry) => entry.targetBranch);
}

/**
 * Read the current saved AI draft (title/body/complexity/labels) from issue meta.
 *
 * @param {Object} meta Issue meta payload.
 * @return {{title: string, body: string, complexity: string, labels: Array<string>, updatedAt: string}|null} Normalized draft, or null when no draft is saved.
 */
export function readAgenticDraftFromMeta(meta) {
  const map = meta && 'object' === typeof meta ? meta : {};
  const draft = map.alpaca_agentic_draft;

  if (
    !draft ||
    'object' !== typeof draft ||
    !String(draft.title || '').trim()
  ) {
    return null;
  }

  return {
    title: String(draft.title || ''),
    body: String(draft.body || ''),
    complexity: String(draft.complexity || 'medium'),
    labels: Array.isArray(draft.labels) ? draft.labels : [],
    updatedAt: String(draft.updated_at || ''),
  };
}

/**
 * Format a GMT ISO activity timestamp with the site date format.
 *
 * @param {string} occurredAt GMT ISO-8601 timestamp.
 * @return {string} Localized date, or empty string when unavailable.
 */
export function formatAgenticActivityDate(occurredAt) {
  if (!occurredAt || !wp.date || 'function' !== typeof wp.date.dateI18n) {
    return '';
  }

  try {
    const format = wp.date.getSettings()?.formats?.date || 'Y-m-d';
    return wp.date.dateI18n(format, occurredAt, true) || '';
  } catch (err) {
    return '';
  }
}
