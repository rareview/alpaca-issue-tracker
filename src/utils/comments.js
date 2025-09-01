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

/**
 * Generates HTML for an assignee change comment.
 * @param {object} user The user object for the assignee.
 * @param {boolean} isAssigned True if the user was assigned, false if unassigned.
 * @returns {string} HTML string.
 */
const generateAssigneeChangeComment = (user, isAssigned) => {
  const assigneeSpan = generateAssigneeSpan(user);
  if (isAssigned) {
    return `${assigneeSpan} has been assigned to this issue.`;
  }
  return `${assigneeSpan} is no longer assigned to this issue.`;
};

/**
 * Generates a comment for a checked checklist item.
 * @param {object} item The checklist item object.
 * @param {object} user The user who checked the item.
 * @returns {string} HTML string.
 */
const generateCheckedItemComment = (item, user) => {
  if (!user) {
    return `Checklist item "${item.label}" has been checked`;
  }
  const userSpan = generateAssigneeSpan(user);
  return `Checklist item "${item.label}" has been checked by ${userSpan}`;
};

export {
  generateAssigneeSpan,
  generateStatusChangeComment,
  generateAssigneeChangeComment,
  generateCheckedItemComment,
};