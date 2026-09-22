import {
  getCommentAgentTypeFromComment,
  normalizeCommentAgentTypes,
} from '../utils/commentAgentFilters';
import { buildPaginatedSearchPath } from '../utils/searchRequests';

const SEARCH_API_PAGE_SIZE = 100;
const DEFAULT_MIN_QUERY_LENGTH = 3;
const DEFAULT_ISSUE_FIELDS =
  'id,slug,post_parent,parent,post_name,title,content,meta,date,date_gmt';

/**
 * Resolve the top-level issue ID for a post when the post is a child issue.
 *
 * @param {Object} post Issue object from REST.
 * @return {string} Normalized issue ID.
 */
export function getNormalizedIssueResultId(post) {
  if (!post || typeof post.id === 'undefined' || post.id === null) {
    return '';
  }

  const rawParent =
    typeof post.post_parent !== 'undefined' && post.post_parent !== null
      ? post.post_parent
      : post.parent;
  const parentId = parseInt(rawParent, 10);

  if (!Number.isNaN(parentId) && parentId > 0) {
    return String(parentId);
  }

  return String(post.id);
}

/**
 * Build a unique ordered list while preserving first-seen order.
 *
 * @param {Array<string>} values Candidate values.
 * @return {Array<string>} Unique ordered values.
 */
const getOrderedUniqueIds = (values) =>
  Array.from(new Set((values || []).filter(Boolean)));

/**
 * Resolve the issue ID referenced by a comment payload.
 *
 * @param {Object} comment Comment object from REST.
 * @return {string} Normalized issue ID.
 */
export function getCommentIssueId(comment) {
  if (!comment || typeof comment !== 'object') {
    return '';
  }

  if (
    typeof comment.comment_post_ID !== 'undefined' &&
    comment.comment_post_ID !== null
  ) {
    return String(comment.comment_post_ID);
  }

  if (typeof comment.post !== 'undefined' && comment.post !== null) {
    return String(comment.post);
  }

  return '';
}

/**
 * Fetch all paginated results for a REST path.
 *
 * @param {string} basePath REST API path without page.
 * @return {Promise<Array>} Collected results.
 */
const fetchPaginatedResults = async (basePath) => {
  const results = [];
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const response = await wp
      .apiFetch({
        path: buildPaginatedSearchPath(basePath, currentPage),
        parse: false,
      })
      .catch(() => null);

    if (!response) {
      return results;
    }

    const pageResults = await response.json().catch(() => []);

    const nextTotalPages = parseInt(
      response.headers?.get('X-WP-TotalPages') || '1',
      10,
    );

    totalPages = Number.isNaN(nextTotalPages)
      ? currentPage
      : Math.max(1, nextTotalPages);

    if (!Array.isArray(pageResults) || pageResults.length < 1) {
      return results;
    }

    results.push(...pageResults);
    currentPage += 1;
  }

  return results;
};

/**
 * Search issues by title and comment content using the board search behavior.
 *
 * @param {string} query   Search query.
 * @param {Object} options Search options.
 * @return {Promise<Array>} Matching top-level issue posts.
 */
export async function searchIssues(query, options = {}) {
  const normalizedQuery = typeof query === 'string' ? query.trim() : '';
  const {
    enableTestLogs = false,
    issueFields = DEFAULT_ISSUE_FIELDS,
    minQueryLength = DEFAULT_MIN_QUERY_LENGTH,
    scopeIssueIds = [],
    commentAgentTypes = null,
  } = options;

  if (!normalizedQuery || normalizedQuery.length < minQueryLength) {
    return [];
  }

  const scopedIds = Array.isArray(scopeIssueIds)
    ? scopeIssueIds.map((value) => String(value)).filter(Boolean)
    : [];
  const hasScope = scopedIds.length > 0;
  const scopedIdSet = new Set(scopedIds);

  const commentSearchPath = `/wp/v2/comments?search=${encodeURIComponent(
    normalizedQuery,
  )}&per_page=${SEARCH_API_PAGE_SIZE}&comment_type=issuecomment&type=issuecomment&context=edit&alpaca_include_hidden_comments=1&_fields=post,comment_post_ID,author_user_agent`;
  const directIssueSearchPath = `/wp/v2/alpaca_issue?search=${encodeURIComponent(
    normalizedQuery,
  )}&per_page=${SEARCH_API_PAGE_SIZE}&_fields=${issueFields}`;
  const [comments, directIssues] = await Promise.all([
    fetchPaginatedResults(commentSearchPath),
    fetchPaginatedResults(directIssueSearchPath),
  ]);

  if (enableTestLogs) {
    // eslint-disable-next-line no-console
    console.log('Alpaca Issue Tracker search raw responses', {
      query: normalizedQuery,
      comments,
      directIssues,
    });
  }

  const requestedAgentTypes = normalizeCommentAgentTypes(commentAgentTypes);
  const filteredComments =
    requestedAgentTypes.length < 1
      ? comments || []
      : (comments || []).filter((comment) => {
          const commentAgent = getCommentAgentTypeFromComment(comment);

          return commentAgent && requestedAgentTypes.includes(commentAgent);
        });

  const scopedComments = filteredComments.filter((comment) => {
    const commentIssueId = getCommentIssueId(comment);

    if (!commentIssueId) {
      return false;
    }

    return !hasScope || scopedIdSet.has(commentIssueId);
  });

  const commentPostIds = Array.from(
    new Set(scopedComments.map((comment) => getCommentIssueId(comment))),
  ).filter(Boolean);

  const issuesById = new Map();
  (directIssues || [])
    .filter((post) => {
      const normalizedIssueId = getNormalizedIssueResultId(post);

      return (
        normalizedIssueId && (!hasScope || scopedIdSet.has(normalizedIssueId))
      );
    })
    .forEach((post) => {
      if (!post || typeof post.id === 'undefined' || post.id === null) {
        return;
      }

      issuesById.set(String(post.id), post);
    });

  const commentIssueIdsToLoad = commentPostIds.filter(
    (issueId) => !issuesById.has(String(issueId)),
  );

  if (commentIssueIdsToLoad.length > 0) {
    const issueIdChunks = [];

    for (
      let index = 0;
      index < commentIssueIdsToLoad.length;
      index += SEARCH_API_PAGE_SIZE
    ) {
      issueIdChunks.push(
        commentIssueIdsToLoad.slice(index, index + SEARCH_API_PAGE_SIZE),
      );
    }

    for (const issueIdChunk of issueIdChunks) {
      // eslint-disable-next-line no-await-in-loop
      const issues = await wp
        .apiFetch({
          path: `/wp/v2/alpaca_issue?include=${encodeURIComponent(
            issueIdChunk.join(','),
          )}&per_page=${issueIdChunk.length}&_fields=${issueFields}`,
        })
        .catch(() => []);

      (issues || []).forEach((post) => {
        if (!post || typeof post.id === 'undefined' || post.id === null) {
          return;
        }

        issuesById.set(String(post.id), post);
      });
    }
  }

  const parentIdsToLoad = Array.from(
    new Set(
      Array.from(issuesById.values())
        .map((post) => {
          if (!post) {
            return 0;
          }

          const rawParent =
            typeof post.post_parent !== 'undefined' && post.post_parent !== null
              ? post.post_parent
              : post.parent;
          const parentId = parseInt(rawParent, 10);

          if (Number.isNaN(parentId) || parentId <= 0) {
            return 0;
          }

          return parentId;
        })
        .filter(
          (parentId) => parentId > 0 && !issuesById.has(String(parentId)),
        ),
    ),
  );

  if (parentIdsToLoad.length > 0) {
    const parentIdChunks = [];

    for (
      let index = 0;
      index < parentIdsToLoad.length;
      index += SEARCH_API_PAGE_SIZE
    ) {
      parentIdChunks.push(
        parentIdsToLoad.slice(index, index + SEARCH_API_PAGE_SIZE),
      );
    }

    for (const parentIdChunk of parentIdChunks) {
      // eslint-disable-next-line no-await-in-loop
      const parentIssues = await wp
        .apiFetch({
          path: `/wp/v2/alpaca_issue?include=${encodeURIComponent(
            parentIdChunk.join(','),
          )}&per_page=${parentIdChunk.length}&_fields=${issueFields}`,
        })
        .catch(() => []);

      (parentIssues || []).forEach((post) => {
        if (!post || typeof post.id === 'undefined' || post.id === null) {
          return;
        }

        issuesById.set(String(post.id), post);
      });
    }
  }

  const seen = new Set();
  const orderedSourceIds = getOrderedUniqueIds([
    ...(directIssues || []).map((post) => String(post.id)),
    ...commentPostIds,
  ]);

  return orderedSourceIds.reduce((results, issueId) => {
    const sourcePost = issuesById.get(String(issueId));
    if (!sourcePost) {
      return results;
    }

    const resultId = getNormalizedIssueResultId(sourcePost);
    if (!resultId || seen.has(resultId)) {
      return results;
    }

    const resultPost = issuesById.get(resultId);
    if (!resultPost) {
      return results;
    }

    seen.add(resultId);
    results.push(resultPost);

    return results;
  }, []);
}

/**
 * Resolve a single issue by slug.
 *
 * @param {string} slug Issue slug.
 * @return {Promise<Object|null>} Matching issue or null.
 */
export async function fetchIssueBySlug(slug) {
  const normalizedSlug = typeof slug === 'string' ? slug.trim() : '';

  if (!normalizedSlug) {
    return null;
  }

  const response = await wp
    .apiFetch({
      path: `/wp/v2/alpaca_issue?slug=${encodeURIComponent(
        normalizedSlug,
      )}&per_page=1&_fields=${DEFAULT_ISSUE_FIELDS}`,
    })
    .catch(() => []);

  return Array.isArray(response) && response.length > 0 ? response[0] : null;
}
