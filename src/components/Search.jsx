const { useState, useEffect, useRef, useMemo, createPortal } = wp.element;
const { SearchControl } = wp.components;
const { __ } = wp.i18n;
const { applyFilters } = wp.hooks;
import PropTypes from 'prop-types';

import {
  getCommentAgentTypeFromComment,
  normalizeCommentAgentTypes,
} from '../utils/commentAgentFilters';
import {
  buildPaginatedSearchPath,
  getIssueIdsKey,
} from '../utils/searchRequests';

const MIN_QUERY_LENGTH = 3;
const SEARCH_API_PAGE_SIZE = 100;
const SEARCH_REFRESH_ACTIONS = [
  'alpaca.issueUpdated',
  'alpaca.issueInserted',
  'alpaca.issueDeleted',
  'alpaca.commentPosted',
  'alpaca.commentUpdated',
  'alpaca.commentDeleted',
  'alpaca.subissueCreated',
  'alpaca.subissueDeleted',
  'alpaca.subissuePromoted',
  'alpaca.subissueTitleChanged',
];

/**
 * Resolve the top-level issue ID for a post when the post is a child issue.
 *
 * @param {Object} post Issue object from REST.
 * @return {string} Normalized issue ID.
 */
function getNormalizedIssueResultId(post) {
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
function getOrderedUniqueIds(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

/**
 * Resolve the issue ID referenced by a comment payload.
 *
 * @param {Object} comment Comment object from REST.
 * @return {string} Normalized issue ID.
 */
function getCommentIssueId(comment) {
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
 * Search control container mounted via portal.
 *
 * @param {Object}   root0                     Component props.
 * @param {Array}    root0.searchScopeIssueIds Search-scoped issue IDs.
 * @param {Function} root0.onSetSearchFilter   Set search filter callback.
 * @param {Function} root0.onClearSearchFilter Clear search filter callback.
 * @return {JSX.Element} Search control element.
 */
function SearchContainer({
  searchScopeIssueIds,
  onSetSearchFilter,
  onClearSearchFilter,
}) {
  const [value, setValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [enableTestLogs, setEnableTestLogs] = useState(false);
  const [searchRefreshToken, setSearchRefreshToken] = useState(0);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const searchScopeIssueIdsSet = useMemo(
    () =>
      new Set(Array.isArray(searchScopeIssueIds) ? searchScopeIssueIds : []),
    [searchScopeIssueIds],
  );
  const searchScopeIssueIdsKey = useMemo(
    () => getIssueIdsKey(searchScopeIssueIds),
    [searchScopeIssueIds],
  );

  const searchScopeIssueIdsRef = useRef(searchScopeIssueIds);
  const searchScopeIssueIdsSetRef = useRef(searchScopeIssueIdsSet);
  searchScopeIssueIdsRef.current = searchScopeIssueIds;
  searchScopeIssueIdsSetRef.current = searchScopeIssueIdsSet;

  useEffect(() => {
    wp.apiFetch({ path: '/wp/v2/settings' })
      .then((settings) => {
        setEnableTestLogs(settings.alpaca_enable_test_logs === '1');
      })
      .catch(() => {
        setEnableTestLogs(false);
      });

    const handleTestLogSettingChange = (newVal) => {
      setEnableTestLogs(newVal);
    };

    wp.hooks.addAction(
      'alpaca.enableTestLogsChanged',
      'alpaca/search',
      handleTestLogSettingChange,
    );

    return () => {
      wp.hooks.removeAction('alpaca.enableTestLogsChanged', 'alpaca/search');
    };
  }, []);

  useEffect(
    () => () => {
      onClearSearchFilter();
    },
    [onClearSearchFilter],
  );

  useEffect(() => {
    const handleSearchDataChanged = () => {
      setSearchRefreshToken((previous) => previous + 1);
    };

    SEARCH_REFRESH_ACTIONS.forEach((actionName) => {
      wp.hooks.addAction(
        actionName,
        'alpaca/search-refresh',
        handleSearchDataChanged,
      );
    });

    return () => {
      SEARCH_REFRESH_ACTIONS.forEach((actionName) => {
        wp.hooks.removeAction(
          actionName,
          'alpaca/search-refresh',
          handleSearchDataChanged,
        );
      });
    };
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Invalidate any in-flight request as soon as the query changes.
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const query = value ? value.trim() : '';
    if (!query || query.length < MIN_QUERY_LENGTH) {
      setIsSearching(false);
      onClearSearchFilter();
      return undefined;
    }

    debounceRef.current = setTimeout(() => {
      setIsSearching(true);
      const q = query;
      const issueFields =
        'id,slug,post_parent,parent,post_name,title,content,meta,date,date_gmt';
      const currentSearchScopeIds = searchScopeIssueIdsRef.current;
      const currentSearchScopeIdsSet = searchScopeIssueIdsSetRef.current;

      if (
        !Array.isArray(currentSearchScopeIds) ||
        currentSearchScopeIds.length < 1
      ) {
        onSetSearchFilter({
          type: 'search',
          query: q,
          issueIds: [],
        });
        setIsSearching(false);
        return;
      }

      const runSearch = async () => {
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

            if (requestId !== requestIdRef.current) {
              return null;
            }

            if (!response) {
              return results;
            }

            const pageResults = await response.json().catch(() => []);

            if (requestId !== requestIdRef.current) {
              return null;
            }

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

        try {
          const commentSearchPath = `/wp/v2/comments?search=${encodeURIComponent(q)}&per_page=${SEARCH_API_PAGE_SIZE}&comment_type=issuecomment&type=issuecomment&context=edit&alpaca_include_hidden_comments=1&_fields=post,comment_post_ID,author_user_agent`;
          const directIssueSearchPath = `/wp/v2/alpaca_issue?search=${encodeURIComponent(q)}&per_page=${SEARCH_API_PAGE_SIZE}&_fields=${issueFields}`;
          const [comments, directIssues] = await Promise.all([
            fetchPaginatedResults(commentSearchPath),
            fetchPaginatedResults(directIssueSearchPath),
          ]);

          if (requestId !== requestIdRef.current) {
            return;
          }

          if (enableTestLogs) {
            // eslint-disable-next-line no-console
            console.log('Alpaca search raw responses', {
              query: q,
              comments,
              directIssues,
            });
          }

          const requestedAgentTypes = normalizeCommentAgentTypes(
            applyFilters('alpaca.search.commentAgentTypes', null, {
              query: q,
              comments,
            }),
          );

          const filteredComments =
            requestedAgentTypes.length < 1
              ? comments || []
              : (comments || []).filter((comment) => {
                  const commentAgent = getCommentAgentTypeFromComment(comment);

                  return (
                    commentAgent && requestedAgentTypes.includes(commentAgent)
                  );
                });

          const scopedComments = filteredComments.filter((comment) => {
            const commentIssueId = getCommentIssueId(comment);

            if (!commentIssueId) {
              return false;
            }

            return currentSearchScopeIdsSet.has(commentIssueId);
          });

          const commentPostIds = Array.from(
            new Set(
              scopedComments
                .map((comment) => getCommentIssueId(comment))
                .filter(Boolean),
            ),
          );

          const issuesById = new Map();
          (directIssues || [])
            .filter((post) => {
              const normalizedIssueId = getNormalizedIssueResultId(post);
              return (
                normalizedIssueId &&
                currentSearchScopeIdsSet.has(normalizedIssueId)
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
                commentIssueIdsToLoad.slice(
                  index,
                  index + SEARCH_API_PAGE_SIZE,
                ),
              );
            }

            // Load included issue IDs in batches to stay within REST per_page limits.
            for (const issueIdChunk of issueIdChunks) {
              // eslint-disable-next-line no-await-in-loop
              const issues = await wp
                .apiFetch({
                  path: `/wp/v2/alpaca_issue?include=${encodeURIComponent(
                    issueIdChunk.join(','),
                  )}&per_page=${issueIdChunk.length}&_fields=${issueFields}`,
                })
                .catch(() => []);

              if (requestId !== requestIdRef.current) {
                return;
              }

              (issues || []).forEach((post) => {
                if (
                  !post ||
                  typeof post.id === 'undefined' ||
                  post.id === null
                ) {
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
                    typeof post.post_parent !== 'undefined' &&
                    post.post_parent !== null
                      ? post.post_parent
                      : post.parent;
                  const parentId = parseInt(rawParent, 10);

                  if (Number.isNaN(parentId) || parentId <= 0) {
                    return 0;
                  }

                  return parentId;
                })
                .filter(
                  (parentId) =>
                    parentId > 0 && !issuesById.has(String(parentId)),
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

            // Load parent IDs in batches to avoid truncation when many matches exist.
            for (const parentIdChunk of parentIdChunks) {
              // eslint-disable-next-line no-await-in-loop
              const parentIssues = await wp
                .apiFetch({
                  path: `/wp/v2/alpaca_issue?include=${encodeURIComponent(
                    parentIdChunk.join(','),
                  )}&per_page=${parentIdChunk.length}&_fields=${issueFields}`,
                })
                .catch(() => []);

              if (requestId !== requestIdRef.current) {
                return;
              }

              (parentIssues || []).forEach((post) => {
                if (
                  !post ||
                  typeof post.id === 'undefined' ||
                  post.id === null
                ) {
                  return;
                }

                issuesById.set(String(post.id), post);
              });
            }
          }

          const seen = new Set();
          const normalizedIssueIds = [];
          const orderedSourceIds = getOrderedUniqueIds([
            ...(directIssues || []).map((post) => String(post.id)),
            ...commentPostIds,
          ]);

          orderedSourceIds.forEach((issueId) => {
            const sourcePost = issuesById.get(String(issueId));
            if (!sourcePost) {
              return;
            }

            const resultId = getNormalizedIssueResultId(sourcePost);
            if (!resultId || seen.has(resultId)) {
              return;
            }

            const resultPost = issuesById.get(resultId);
            if (!resultPost) {
              return;
            }

            seen.add(resultId);
            normalizedIssueIds.push(resultId);
          });

          onSetSearchFilter({
            type: 'search',
            query: q,
            issueIds: normalizedIssueIds,
          });
        } catch (err) {
          if (requestId !== requestIdRef.current) {
            return;
          }

          if (enableTestLogs) {
            // eslint-disable-next-line no-console
            console.error('Search error', err);
          }

          onSetSearchFilter({
            type: 'search',
            query: q,
            issueIds: [],
          });
        } finally {
          if (requestId === requestIdRef.current) {
            setIsSearching(false);
          }
        }
      };

      runSearch();
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    value,
    enableTestLogs,
    searchRefreshToken,
    searchScopeIssueIdsKey,
    onSetSearchFilter,
    onClearSearchFilter,
  ]);

  return (
    <div className="alpaca-board-search alpaca-board-control">
      <SearchControl
        label={__('Search', 'alpaca-issue-tracker')}
        value={value}
        onChange={(val) => setValue(val)}
        placeholder={__('Search', 'alpaca-issue-tracker')}
        isBusy={isSearching}
        __nextHasNoMarginBottom
      />
    </div>
  );
}

SearchContainer.propTypes = {
  searchScopeIssueIds: PropTypes.arrayOf(PropTypes.string),
  onSetSearchFilter: PropTypes.func,
  onClearSearchFilter: PropTypes.func,
};

SearchContainer.defaultProps = {
  searchScopeIssueIds: [],
  onSetSearchFilter: () => {},
  onClearSearchFilter: () => {},
};

/**
 * Search portal mounted in board controls.
 *
 * @param {Object}   root0                     Component props.
 * @param {string}   root0.selector            Mount selector.
 * @param {Array}    root0.searchScopeIssueIds Search-scoped issue IDs.
 * @param {Object}   root0.activeSearchFilter  Current search filter payload.
 * @param {Function} root0.onSetSearchFilter   Set search filter callback.
 * @param {Function} root0.onClearSearchFilter Clear search filter callback.
 * @return {JSX.Element|null} Portal element.
 */
function SearchPortal({
  selector,
  searchScopeIssueIds,
  activeSearchFilter: _activeSearchFilter,
  onSetSearchFilter,
  onClearSearchFilter,
}) {
  if (typeof document === 'undefined' || typeof createPortal !== 'function') {
    return null;
  }

  const mountNode = document.querySelector(selector);
  if (!mountNode) {
    return null;
  }

  return createPortal(
    <SearchContainer
      searchScopeIssueIds={searchScopeIssueIds}
      onSetSearchFilter={onSetSearchFilter}
      onClearSearchFilter={onClearSearchFilter}
    />,
    mountNode,
  );
}

SearchPortal.propTypes = {
  selector: PropTypes.string,
  searchScopeIssueIds: PropTypes.arrayOf(PropTypes.string),
  activeSearchFilter: PropTypes.shape({
    type: PropTypes.string,
    query: PropTypes.string,
    issueIds: PropTypes.arrayOf(PropTypes.string),
  }),
  onSetSearchFilter: PropTypes.func,
  onClearSearchFilter: PropTypes.func,
};

SearchPortal.defaultProps = {
  selector: '#project-board-controls-mount',
  searchScopeIssueIds: [],
  activeSearchFilter: null,
  onSetSearchFilter: () => {},
  onClearSearchFilter: () => {},
};

wp.hooks.addFilter(
  'alpaca.search.commentAgentTypes',
  'alpaca/search/comment-agent-types',
  () => ['human', 'create'],
);

export default SearchPortal;
