/**
 * Normalize a single comment agent value.
 *
 * @param {string|null|undefined} agentType Raw comment agent value.
 * @return {string|null} Normalized non-empty agent value or null.
 */
export const normalizeCommentAgentType = (agentType) => {
  if (typeof agentType !== 'string') {
    return null;
  }

  const normalizedAgentType = agentType.trim().toLowerCase();
  return normalizedAgentType || null;
};

/**
 * Normalize one or many comment agent values.
 *
 * @param {string|Array|null|undefined} agentTypeFilter Raw filter value.
 * @return {Array<string>} List of normalized, unique agent values.
 */
export const normalizeCommentAgentTypes = (agentTypeFilter) => {
  if (Array.isArray(agentTypeFilter)) {
    return Array.from(
      new Set(
        agentTypeFilter
          .map((agentType) => normalizeCommentAgentType(agentType))
          .filter(Boolean),
      ),
    );
  }

  const normalizedAgentType = normalizeCommentAgentType(agentTypeFilter);
  return normalizedAgentType ? [normalizedAgentType] : [];
};

/**
 * Resolve a normalized comment agent value from a comment-like object.
 *
 * @param {Object} comment Comment-like object from REST or local state.
 * @return {string|null} Normalized comment agent value or null.
 */
export const getCommentAgentTypeFromComment = (comment) =>
  normalizeCommentAgentType(
    comment?.author_user_agent || comment?.comment_agent,
  );
