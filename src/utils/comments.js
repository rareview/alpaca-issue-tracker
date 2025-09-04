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

export {
  generateAssigneeSpan,
};