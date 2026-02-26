const { __ } = wp.i18n;

/**
 * Dispatch the shared status-change hook used by issue comment listeners.
 *
 * @param {Object} issue          Issue object or payload with ID/post data.
 * @param {string} fromStatusName Previous status label.
 * @param {string} toStatusName   Next status label.
 */
export const dispatchStatusChangedAction = (
  issue,
  fromStatusName,
  toStatusName,
) => {
  wp.hooks.doAction('alpaca.statusChanged', issue, fromStatusName, toStatusName);
};

/**
 * Build a normalized issue payload for status-change actions.
 *
 * @param {string|number} issueId      Issue ID.
 * @param {Object}        issueDetails Issue details payload.
 * @param {Object}        issueLookup  Issue lookup map keyed by ID.
 * @return {Object|null} Status action issue payload, or null when invalid.
 */
export const buildStatusIssuePayload = (issueId, issueDetails, issueLookup) => {
  const normalizedIssueId = Number(issueId);
  if (normalizedIssueId <= 0) {
    return null;
  }

  let fallbackTitle = '';
  if (
    issueLookup &&
    issueLookup[normalizedIssueId] &&
    issueLookup[normalizedIssueId].title
  ) {
    fallbackTitle = issueLookup[normalizedIssueId].title;
  }

  let issueTitle = '';
  if (issueDetails && issueDetails.post_data) {
    if (issueDetails.post_data.post_title) {
      issueTitle = issueDetails.post_data.post_title;
    } else if (issueDetails.post_data.post_content) {
      issueTitle = issueDetails.post_data.post_content;
    }
  }

  if (!issueTitle) {
    issueTitle = fallbackTitle;
  }

  let issueSlug = '';
  if (
    issueDetails &&
    issueDetails.post_data &&
    issueDetails.post_data.post_name
  ) {
    issueSlug = issueDetails.post_data.post_name;
  }

  return {
    id: String(normalizedIssueId),
    'post_id': normalizedIssueId,
    slug: issueSlug,
    content: issueTitle,
  };
};

/**
 * Resolve a readable status name with WordPress localization fallback.
 *
 * @param {Object} statusTerm Status term object.
 * @return {string} Status name.
 */
export const getStatusName = (statusTerm) => {
  if (statusTerm && statusTerm.name) {
    return statusTerm.name;
  }

  return __('Unknown', 'alpaca');
};
