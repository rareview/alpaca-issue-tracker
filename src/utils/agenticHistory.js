/**
 * Helpers for Fix with AI history stored on issue meta.
 */

import { formatWpDateValue } from './date';

/**
 * Normalize a stored draft snapshot from a sent history entry.
 *
 * @param {*} draft Raw draft object.
 * @return {{title: string, body: string, complexity: string, labels: Array<string>}|null} Draft, or null.
 */
function normalizeSentDraft(draft) {
  if (!draft || 'object' !== typeof draft || !String(draft.title || '').trim()) {
    return null;
  }

  return {
    title: String(draft.title || ''),
    body: String(draft.body || ''),
    complexity: String(draft.complexity || 'medium'),
    labels: Array.isArray(draft.labels) ? draft.labels : [],
  };
}

/**
 * Clean one raw history entry into a predictable shape for the UI.
 * PHP stores snake_case keys (target_branch, occurred_at); we return camelCase.
 * Returns null if the entry is invalid.
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

  if ('reverted' === type) {
    return {
      type,
      prUrl: String(entry.pr_url || '').trim(),
      branchReset: !!entry.branch_reset,
      branchResetNote: String(entry.branch_reset_note || '').trim(),
      occurredAt,
    };
  }

  if ('change_requested' === type) {
    const url = String(entry.url || '').trim();
    if (!url) {
      return null;
    }

    return {
      type,
      url,
      notes: String(entry.notes || '').trim(),
      target: String(entry.target || '').trim(),
      prUrl: String(entry.pr_url || '').trim(),
      prNumber: parseInt(entry.pr_number, 10) || 0,
      githubNumber: parseInt(entry.github_number, 10) || 0,
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

  const draft = normalizeSentDraft(entry.draft);
  const notes =
    String(entry.notes || '').trim() || (draft ? String(draft.title || '').trim() : '');

  return {
    type: 'sent',
    url,
    githubNumber: parseInt(entry.github_number, 10) || 0,
    targetBranch: String(entry.target_branch || '').trim(),
    prUrl: String(entry.pr_url || '').trim(),
    prNumber: parseInt(entry.pr_number, 10) || 0,
    prState: String(entry.pr_state || '').trim(),
    notes,
    draft,
    occurredAt,
  };
}

/**
 * Read the chronological Fix with AI history from issue meta (oldest first).
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
 * History entries after the latest start-over, oldest first.
 *
 * @param {Object} meta Issue meta payload.
 * @return {Array<Object>} Current attempt entries.
 */
function currentAttemptEntries(meta) {
  const history = readAgenticHistoryFromMeta(meta);
  let lastRevert = -1;

  for (let index = 0; index < history.length; index++) {
    if ('reverted' === history[index].type) {
      lastRevert = index;
    }
  }

  return history.slice(lastRevert + 1);
}

/**
 * Whether the issue has any Fix with AI history.
 *
 * @param {Object} meta Issue meta payload.
 * @return {boolean} True when the history has at least one valid entry.
 */
export function hasAgenticHistory(meta) {
  return readAgenticHistoryFromMeta(meta).length > 0;
}

/**
 * Whether the current attempt has been sent to GitHub at least once.
 *
 * Sent entries from before the latest Start over are ignored so the UI
 * can return to Fix with AI.
 *
 * @param {Object} meta Issue meta payload.
 * @return {boolean} True when a sent history entry exists for this attempt.
 */
export function hasAgenticSentEntry(meta) {
  return currentAttemptEntries(meta).some((entry) => 'sent' === entry.type);
}

/**
 * Draft snapshots from the current attempt's sent GitHub issues, oldest first.
 *
 * @param {Object} meta Issue meta payload.
 * @return {Array<Object>} Sent drafts for this attempt.
 */
export function currentAttemptSentDrafts(meta) {
  return currentAttemptEntries(meta)
    .filter((entry) => 'sent' === entry.type && entry.draft)
    .map((entry) => entry.draft);
}

/**
 * Format a GMT ISO activity timestamp with the site date and time formats.
 *
 * @param {string} occurredAt GMT ISO-8601 timestamp.
 * @return {string} Localized date and time, or empty string when unavailable.
 */
export function formatAgenticActivityDate(occurredAt) {
  if (!occurredAt || !wp.date || 'function' !== typeof wp.date.dateI18n) {
    return '';
  }

  try {
    const formats = wp.date.getSettings()?.formats || {};
    const format =
      formats.datetime ||
      [formats.date, formats.time].filter(Boolean).join(' ') ||
      'Y-m-d H:i';
    return (
      formatWpDateValue(occurredAt, format, { treatMysqlAsUtc: true }) || ''
    );
  } catch (err) {
    return '';
  }
}

/**
 * Split chronological history into fixing sessions.
 *
 * A session is one Fix with AI plus any Request a change sends or comments.
 * Start over closes that session and the next send begins a new one. Newest
 * session first.
 *
 * @param {Array<Object>} history Oldest-first normalized history entries.
 * @return {Array<Object>} Sessions, newest first.
 */
export function groupAgenticHistoryIntoSessions(history) {
  const groups = [];
  let sends = [];

  const closeSession = (reverted) => {
    if (!sends.length && !reverted) {
      return;
    }
    groups.push({
      sends,
      reverted: reverted || null,
    });
    sends = [];
  };

  (Array.isArray(history) ? history : []).forEach((entry) => {
    if ('reverted' === entry.type) {
      closeSession(entry);
      return;
    }
    if ('sent' === entry.type || 'change_requested' === entry.type) {
      sends.push(entry);
    }
  });
  closeSession(null);

  const total = groups.length;
  return groups
    .map((group, index) => ({
      sends: group.sends,
      reverted: group.reverted,
      number: index + 1,
      isCurrent: index === total - 1 && !group.reverted,
    }))
    .reverse();
}

/**
 * Overlay live GitHub pull request data onto a sent history entry.
 *
 * @param {Object}        entry            Normalized sent entry.
 * @param {Array<Object>} livePullRequests Pull request summaries from GitHub.
 * @return {Object} Entry with live PR fields when a match is found.
 */
export function mergeLivePullRequestIntoSentEntry(entry, livePullRequests) {
  if (!entry || !Array.isArray(livePullRequests) || !livePullRequests.length) {
    return entry;
  }

  const live = livePullRequests.find((pr) => {
    const issueNumber = parseInt(pr.github_issue_number, 10) || 0;
    const prNumber = parseInt(pr.number, 10) || 0;
    return (
      (entry.githubNumber && issueNumber === entry.githubNumber) ||
      (entry.prNumber && prNumber === entry.prNumber)
    );
  });

  if (!live) {
    return entry;
  }

  return {
    ...entry,
    prUrl: String(live.url || entry.prUrl || '').trim(),
    prNumber: parseInt(live.number, 10) || entry.prNumber,
    prState: live.merged
      ? 'merged'
      : String(live.state || entry.prState || '').trim(),
  };
}

const livePullRequestsByIssue = {};
let pendingSessionFocusIssueId = null;

/**
 * Remember that the AI Log should highlight the current fix attempt.
 *
 * Used when the tab is not mounted yet and the focus hook may fire too early.
 *
 * @param {number} issueId Alpaca issue post ID.
 */
export function rememberAgenticSessionFocus(issueId) {
  pendingSessionFocusIssueId = issueId;
}

/**
 * Take a pending current-session focus request for this issue.
 *
 * @param {number} issueId Alpaca issue post ID.
 * @return {boolean} True when a focus pulse should run.
 */
export function takeAgenticSessionFocus(issueId) {
  if (pendingSessionFocusIssueId === issueId) {
    pendingSessionFocusIssueId = null;
    return true;
  }
  return false;
}

/**
 * Remember live GitHub pull requests so the AI Log can read them on mount.
 *
 * The log tab is only mounted when selected, so it can miss the status hook.
 *
 * @param {number}        issueId      Alpaca issue post ID.
 * @param {Array<Object>} pullRequests Pull request summaries.
 */
export function rememberLivePullRequests(issueId, pullRequests) {
  livePullRequestsByIssue[issueId] = Array.isArray(pullRequests)
    ? pullRequests
    : [];
}

/**
 * Live GitHub pull requests last fetched for this issue.
 *
 * @param {number} issueId Alpaca issue post ID.
 * @return {Array<Object>} Pull request summaries.
 */
export function readLivePullRequests(issueId) {
  return livePullRequestsByIssue[issueId] || [];
}
