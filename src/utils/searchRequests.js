/**
 * Normalize issue IDs into a unique ordered list of strings.
 *
 * @param {Array} issueIds Candidate issue IDs.
 * @return {Array<string>} Normalized issue IDs.
 */
function normalizeIssueIds(issueIds) {
  if (!Array.isArray(issueIds)) {
    return [];
  }

  return Array.from(
    new Set(
      issueIds
        .map((issueId) =>
          typeof issueId !== 'undefined' && issueId !== null
            ? String(issueId)
            : '',
        )
        .filter(Boolean),
    ),
  );
}

/**
 * Build a stable cache/dependency key for a list of issue IDs.
 *
 * @param {Array} issueIds Candidate issue IDs.
 * @return {string} Stable key.
 */
function getIssueIdsKey(issueIds) {
  return normalizeIssueIds(issueIds).join(',');
}

/**
 * Append or replace the page query arg on a REST path.
 *
 * @param {string} path REST path.
 * @param {number} page Page number.
 * @return {string} Path with page applied.
 */
function buildPaginatedSearchPath(path, page) {
  const normalizedPath = typeof path === 'string' ? path : '';
  const normalizedPage = Math.max(1, parseInt(page, 10) || 1);
  const pagePattern = /([?&])page=\d+/;

  if (pagePattern.test(normalizedPath)) {
    return normalizedPath.replace(pagePattern, `$1page=${normalizedPage}`);
  }

  const separator = normalizedPath.includes('?') ? '&' : '?';
  return `${normalizedPath}${separator}page=${normalizedPage}`;
}

module.exports = {
  buildPaginatedSearchPath,
  getIssueIdsKey,
};
