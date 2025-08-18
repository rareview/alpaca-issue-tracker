/**
 * Generates HTML for an assignee span to be used in comments.
 * @param {object} user The user object for the assignee.
 * @returns {string} HTML string.
 */
const generateAssigneeSpan = (user) => {
  if (!user) return "";
  const avatarAttr = user.avatar ? ` data-avatar="${user.avatar}"` : "";
  return `<span class="alpaca-status-assignee" data-userid="${user.id}"${avatarAttr}>${user.name}</span>`;
};

/**
 * Generates HTML for a status change comment.
 * @param {string} fromStatus The title of the original status.
 * @param {string} toStatus The title of the new status.
 * @returns {string} HTML string.
 */
const generateStatusChangeComment = (fromStatus, toStatus) => {
  return `Item moved from status <span class="alpaca-status-comment">${fromStatus}</span> to <span class="alpaca-status-comment">${toStatus}</span>`;
};

export { generateAssigneeSpan, generateStatusChangeComment };
