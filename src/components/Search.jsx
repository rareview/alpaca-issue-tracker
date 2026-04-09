const { useState, useEffect, useRef, useMemo, createPortal } = wp.element;
const { SearchControl } = wp.components;
const { __ } = wp.i18n;
const { applyFilters } = wp.hooks;
import PropTypes from 'prop-types';

import {
  getCommentAgentTypeFromComment,
  normalizeCommentAgentTypes,
} from '../utils/commentAgentFilters';

const MIN_QUERY_LENGTH = 3;
const SEARCH_API_PAGE_SIZE = 100;
const SEARCH_INCLUDE_THRESHOLD = 100;

/**
 * Split an array into fixed-size chunks.
 *
 * @param {Array}  values Values to chunk.
 * @param {number} size   Chunk size.
 * @return {Array<Array>}        Chunked arrays.
 */
function chunkArray(values, size) {
  const source = Array.isArray(values) ? values : [];
  const chunkSize = Number.isInteger(size) && size > 0 ? size : 1;
  const chunks = [];

  for (let index = 0; index < source.length; index += chunkSize) {
    chunks.push(source.slice(index, index + chunkSize));
  }

  return chunks;
}

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
 * Search control container mounted via portal.
 *
 * @param {Object}   root0                     Component props.
 * @param {Array}    root0.visibleIssueIds     Visible issue IDs on the board.
 * @param {Function} root0.onSetSearchFilter   Set search filter callback.
 * @param {Function} root0.onClearSearchFilter Clear search filter callback.
 * @return {JSX.Element} Search control element.
 */
function SearchContainer({
  visibleIssueIds,
  onSetSearchFilter,
  onClearSearchFilter,
}) {
  const [value, setValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [enableTestLogs, setEnableTestLogs] = useState(false);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const visibleIssueIdsSet = useMemo(
    () => new Set(Array.isArray(visibleIssueIds) ? visibleIssueIds : []),
    [visibleIssueIds],
  );

  // Refs keep the latest values available inside the search effect without
  // making them deps (which would restart the debounce on every container
  // update such as a comment count change).
  const visibleIssueIdsRef = useRef(visibleIssueIds);
  const visibleIssueIdsSetRef = useRef(visibleIssueIdsSet);
  visibleIssueIdsRef.current = visibleIssueIds;
  visibleIssueIdsSetRef.current = visibleIssueIdsSet;

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
      const currentVisibleIds = visibleIssueIdsRef.current;
      const currentVisibleIdsSet = visibleIssueIdsSetRef.current;
      const includeThreshold = parseInt(
        applyFilters(
          'alpaca.search.includeThreshold',
          SEARCH_INCLUDE_THRESHOLD,
          {
            query: q,
            visibleIssueIds: currentVisibleIds,
          },
        ),
        10,
      );
      const shouldUseVisibleIssueInclude =
        Array.isArray(currentVisibleIds) &&
        currentVisibleIds.length > 0 &&
        !Number.isNaN(includeThreshold) &&
        includeThreshold > 0 &&
        currentVisibleIds.length <= includeThreshold;
      const limitedIssuePageSize = shouldUseVisibleIssueInclude
        ? Math.min(SEARCH_API_PAGE_SIZE, currentVisibleIds.length)
        : SEARCH_API_PAGE_SIZE;
      const directIssueSearchPath = shouldUseVisibleIssueInclude
        ? `/wp/v2/alpaca_issue?search=${encodeURIComponent(q)}&include=${encodeURIComponent(
            currentVisibleIds.join(','),
          )}&per_page=${limitedIssuePageSize}&_fields=${issueFields}`
        : `/wp/v2/alpaca_issue?search=${encodeURIComponent(q)}&per_page=${limitedIssuePageSize}&_fields=${issueFields}`;

      const runSearch = async () => {
        try {
          const commentSearchPath = `/wp/v2/comments?search=${encodeURIComponent(q)}&per_page=100&comment_type=issuecomment&type=issuecomment&context=edit&show_hidden_comments=1&_fields=post,comment_post_ID,author_user_agent`;
          const [comments, directIssues] = await Promise.all([
            wp
              .apiFetch({
                path: commentSearchPath,
              })
              .catch(() => []),
            wp
              .apiFetch({
                path: directIssueSearchPath,
              })
              .catch(() => []),
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

          const scopedComments = shouldUseVisibleIssueInclude
            ? filteredComments.filter((comment) => {
                let commentIssueId = '';

                if (
                  comment &&
                  typeof comment.comment_post_ID !== 'undefined' &&
                  comment.comment_post_ID !== null
                ) {
                  commentIssueId = String(comment.comment_post_ID);
                } else if (
                  comment &&
                  typeof comment.post !== 'undefined' &&
                  comment.post !== null
                ) {
                  commentIssueId = String(comment.post);
                }

                if (!commentIssueId) {
                  return false;
                }

                return currentVisibleIdsSet.has(commentIssueId);
              })
            : filteredComments;

          const commentPostIds = Array.from(
            new Set(
              scopedComments
                .map((comment) => {
                  if (!comment) {
                    return null;
                  }

                  if (comment.comment_post_ID) {
                    return String(comment.comment_post_ID);
                  }

                  if (comment.post) {
                    return String(comment.post);
                  }

                  return null;
                })
                .filter(Boolean),
            ),
          );

          const issuesById = new Map();
          (directIssues || []).forEach((post) => {
            if (!post || typeof post.id === 'undefined' || post.id === null) {
              return;
            }

            issuesById.set(String(post.id), post);
          });

          const commentIssueIdsToLoad = commentPostIds.filter(
            (issueId) => !issuesById.has(String(issueId)),
          );

          if (commentIssueIdsToLoad.length > 0) {
            const issueIdChunks = chunkArray(
              commentIssueIdsToLoad,
              SEARCH_API_PAGE_SIZE,
            );

            // Load included issue IDs in batches to stay within REST per_page limits.
            for (const issueIdChunk of issueIdChunks) {
              if (!Array.isArray(issueIdChunk) || issueIdChunk.length < 1) {
                continue;
              }

              const issuesPath = `/wp/v2/alpaca_issue?include=${encodeURIComponent(
                issueIdChunk.join(','),
              )}&per_page=${issueIdChunk.length}&_fields=${issueFields}`;

              // eslint-disable-next-line no-await-in-loop
              const issues = await wp
                .apiFetch({ path: issuesPath })
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
            const parentIdChunks = chunkArray(
              parentIdsToLoad,
              SEARCH_API_PAGE_SIZE,
            );

            // Load parent IDs in batches to avoid truncation when many matches exist.
            for (const parentIdChunk of parentIdChunks) {
              if (!Array.isArray(parentIdChunk) || parentIdChunk.length < 1) {
                continue;
              }

              const parentPath = `/wp/v2/alpaca_issue?include=${encodeURIComponent(
                parentIdChunk.join(','),
              )}&per_page=${parentIdChunk.length}&_fields=${issueFields}`;

              // eslint-disable-next-line no-await-in-loop
              const parentIssues = await wp
                .apiFetch({ path: parentPath })
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
  }, [value, enableTestLogs, onSetSearchFilter, onClearSearchFilter]);

  return (
    <div className="alpaca-board-search" style={{ width: 300 }}>
      <SearchControl
        label={__('Search', 'alpaca')}
        value={value}
        onChange={(val) => setValue(val)}
        placeholder={__('Search', 'alpaca')}
        isBusy={isSearching}
      />
    </div>
  );
}

SearchContainer.propTypes = {
  visibleIssueIds: PropTypes.arrayOf(PropTypes.string),
  onSetSearchFilter: PropTypes.func,
  onClearSearchFilter: PropTypes.func,
};

SearchContainer.defaultProps = {
  visibleIssueIds: [],
  onSetSearchFilter: () => {},
  onClearSearchFilter: () => {},
};

/**
 * Search portal mounted in board controls.
 *
 * @param {Object}   root0                     Component props.
 * @param {string}   root0.selector            Mount selector.
 * @param {Array}    root0.containers          Board containers with loaded issues.
 * @param {Object}   root0.activeSearchFilter  Current search filter payload.
 * @param {Function} root0.onSetSearchFilter   Set search filter callback.
 * @param {Function} root0.onClearSearchFilter Clear search filter callback.
 * @return {JSX.Element|null} Portal element.
 */
function SearchPortal({
  selector,
  containers,
  activeSearchFilter: _activeSearchFilter,
  onSetSearchFilter,
  onClearSearchFilter,
}) {
  const visibleIssueIds = useMemo(
    () =>
      Array.from(
        new Set(
          (Array.isArray(containers) ? containers : [])
            .flatMap((container) =>
              container && Array.isArray(container.items)
                ? container.items
                : [],
            )
            .map((item) =>
              item && typeof item.id !== 'undefined' && item.id !== null
                ? String(item.id)
                : '',
            )
            .filter(Boolean),
        ),
      ),
    [containers],
  );

  if (typeof document === 'undefined' || typeof createPortal !== 'function') {
    return null;
  }

  const mountNode = document.querySelector(selector);
  if (!mountNode) {
    return null;
  }

  return createPortal(
    <SearchContainer
      visibleIssueIds={visibleIssueIds}
      onSetSearchFilter={onSetSearchFilter}
      onClearSearchFilter={onClearSearchFilter}
    />,
    mountNode,
  );
}

SearchPortal.propTypes = {
  selector: PropTypes.string,
  containers: PropTypes.array,
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
  containers: [],
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
