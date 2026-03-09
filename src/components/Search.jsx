const { useState, useEffect, useRef, createPortal } = wp.element;
const { SearchControl, Popover } = wp.components;
const { decodeEntities } = wp.htmlEntities;
const { __ } = wp.i18n;
const { doAction } = wp.hooks;
import PropTypes from 'prop-types';
import Item from './Item';

const MIN_QUERY_LENGTH = 3;
const MAX_RESULTS = 10;

/**
 * Strip all HTML tags from a string.
 *
 * @param {string} maybeHtml Potentially HTML content.
 * @return {string} Clean plain text.
 */
function stripHtml(maybeHtml) {
  if (!maybeHtml) {
    return '';
  }

  return String(maybeHtml)
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Resolve the best available issue title from REST payloads.
 *
 * @param {Object} post Issue object from REST.
 * @return {string} A readable issue title.
 */
function getIssueTitle(post) {
  if (!post) {
    return '';
  }

  if (post.post_title && String(post.post_title).trim()) {
    return decodeEntities(String(post.post_title).trim());
  }

  if (post.title) {
    if (typeof post.title === 'string' && post.title.trim()) {
      return post.title.trim();
    }
    if (post.title.rendered && post.title.rendered.trim()) {
      return decodeEntities(stripHtml(post.title.rendered));
    }
  }

  if (post.content && post.content.rendered) {
    const fromContent = decodeEntities(stripHtml(post.content.rendered));
    if (fromContent) {
      return fromContent;
    }
  }

  return post.post_content || post.slug || post.post_name || '';
}

/**
 * Build a lookup table from preloaded board data.
 *
 * @param {Array} boardData Board data from PHP.
 * @return {Map} Map keyed by issue ID.
 */
function buildBoardIssueIndex(boardData) {
  const index = new Map();

  if (!Array.isArray(boardData)) {
    return index;
  }

  boardData.forEach((column) => {
    const status = column && column.title ? decodeEntities(column.title) : '';
    const issues = column && Array.isArray(column.issues) ? column.issues : [];

    issues.forEach((issue) => {
      if (!issue || typeof issue.id === 'undefined' || issue.id === null) {
        return;
      }

      const id = String(issue.id);
      const meta =
        issue.meta && typeof issue.meta === 'object' ? issue.meta : {};
      const labels = Array.isArray(meta.labels)
        ? meta.labels.filter((label) => typeof label === 'string')
        : [];
      let commentCount = 0;
      if (typeof issue.comment_count === 'number') {
        commentCount = issue.comment_count;
      } else if (typeof issue.commentCount === 'number') {
        commentCount = issue.commentCount;
      }

      index.set(id, {
        title:
          typeof issue.title === 'string' ? decodeEntities(issue.title) : '',
        status,
        commentCount,
        labels,
        assignees: Array.isArray(issue.assignees) ? issue.assignees : [],
        meta,
        postDate: issue.post_date || issue.postDate || '',
      });
    });
  });

  return index;
}

function buildResultItem(post, boardIssueIndex) {
  const id = String(post.id);
  const fromBoard = boardIssueIndex.get(id);
  let title = '';
  if (fromBoard && fromBoard.title) {
    title = fromBoard.title;
  } else {
    title = getIssueTitle(post);
  }

  return {
    id,
    title: title || id,
    slug: post.slug || post.post_name || post.name || null,
    status: fromBoard && fromBoard.status ? fromBoard.status : '',
    commentCount:
      fromBoard && typeof fromBoard.commentCount === 'number'
        ? fromBoard.commentCount
        : 0,
    labels:
      fromBoard && Array.isArray(fromBoard.labels) ? fromBoard.labels : [],
    assignees:
      fromBoard && Array.isArray(fromBoard.assignees)
        ? fromBoard.assignees
        : [],
    meta: fromBoard && fromBoard.meta ? fromBoard.meta : {},
    postDate: fromBoard && fromBoard.postDate ? fromBoard.postDate : '',
  };
}

function SearchContainer() {
  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [enableTestLogs, setEnableTestLogs] = useState(false);
  const [popoverWidth, setPopoverWidth] = useState(300);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const [boardIssueIndex, setBoardIssueIndex] = useState(() =>
    buildBoardIssueIndex(
      typeof window !== 'undefined' ? window.alpacaBoardData : [],
    ),
  );

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

  useEffect(() => {
    /**
     * Update search status metadata when an issue moves between statuses.
     *
     * @param {Object} issue      Issue payload from status change action.
     * @param {string} fromStatus Previous status label.
     * @param {string} toStatus   Next status label.
     */
    const handleStatusChanged = (issue, fromStatus, toStatus) => {
      const issueId =
        issue && typeof issue.id !== 'undefined' && issue.id !== null
          ? String(issue.id)
          : '';
      if (!issueId) {
        return;
      }

      setBoardIssueIndex((prevIndex) => {
        const nextIndex = new Map(prevIndex);
        const existing = nextIndex.get(issueId) || {};

        nextIndex.set(issueId, {
          ...existing,
          status: toStatus || existing.status || '',
        });

        return nextIndex;
      });
    };

    wp.hooks.addAction(
      'alpaca.statusChanged',
      'alpaca/search',
      handleStatusChanged,
    );

    return () => {
      wp.hooks.removeAction('alpaca.statusChanged', 'alpaca/search');
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
      setResults([]);
      setIsSearching(false);
      return undefined;
    }

    debounceRef.current = setTimeout(() => {
      setIsSearching(true);
      const q = query;
      const issueFields =
        'id,title,content,slug,post_name,post_title,post_content,post_parent,parent';

      const runSearch = async () => {
        try {
          const comments = await wp
            .apiFetch({
              path: `/wp/v2/comments?search=${encodeURIComponent(q)}&per_page=100&comment_type=issuecomment&type=issuecomment&context=edit&show_hidden_comments=1&_fields=post,comment_post_ID`,
            })
            .catch(() => []);

          if (requestId !== requestIdRef.current) {
            return;
          }

          if (enableTestLogs) {
            // eslint-disable-next-line no-console
            console.log('Alpaca search raw responses', {
              query: q,
              comments,
            });
          }

          const commentPostIds = Array.from(
            new Set(
              (comments || [])
                .map((c) => {
                  if (!c) {
                    return null;
                  }

                  if (c.comment_post_ID) {
                    return String(c.comment_post_ID);
                  }

                  if (c.post) {
                    return String(c.post);
                  }

                  return null;
                })
                .filter(Boolean),
            ),
          ).slice(0, MAX_RESULTS);

          if (commentPostIds.length === 0) {
            setResults([]);
            return;
          }

          const issuesPath = `/wp/v2/alpaca_issue?include=${encodeURIComponent(
            commentPostIds.join(','),
          )}&per_page=${commentPostIds.length}&_fields=${issueFields}`;

          const issues = await wp
            .apiFetch({ path: issuesPath })
            .catch(() => []);
          if (requestId !== requestIdRef.current) {
            return;
          }

          const issuesById = new Map();
          (issues || []).forEach((post) => {
            if (!post || typeof post.id === 'undefined' || post.id === null) {
              return;
            }
            issuesById.set(String(post.id), post);
          });

          const parentIdsToLoad = Array.from(
            new Set(
              (issues || [])
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
            const parentPath = `/wp/v2/alpaca_issue?include=${encodeURIComponent(
              parentIdsToLoad.join(','),
            )}&per_page=${parentIdsToLoad.length}&_fields=${issueFields}`;

            const parentIssues = await wp
              .apiFetch({ path: parentPath })
              .catch(() => []);
            if (requestId !== requestIdRef.current) {
              return;
            }

            (parentIssues || []).forEach((post) => {
              if (!post || typeof post.id === 'undefined' || post.id === null) {
                return;
              }
              issuesById.set(String(post.id), post);
            });
          }

          const seen = new Set();
          const normalized = [];

          commentPostIds.forEach((issueId) => {
            const sourcePost = issuesById.get(String(issueId));
            if (!sourcePost) {
              return;
            }

            const rawParent =
              typeof sourcePost.post_parent !== 'undefined' &&
              sourcePost.post_parent !== null
                ? sourcePost.post_parent
                : sourcePost.parent;
            const parentId = parseInt(rawParent, 10);
            const resultId =
              !Number.isNaN(parentId) && parentId > 0
                ? String(parentId)
                : String(sourcePost.id);

            if (seen.has(resultId)) {
              return;
            }

            const resultPost = issuesById.get(resultId);
            if (!resultPost) {
              return;
            }

            seen.add(resultId);
            normalized.push(buildResultItem(resultPost, boardIssueIndex));
          });

          setResults(normalized.slice(0, MAX_RESULTS));
        } catch (err) {
          if (requestId !== requestIdRef.current) {
            return;
          }
          if (enableTestLogs) {
            // eslint-disable-next-line no-console
            console.error('Search error', err);
          }
          setResults([]);
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
  }, [value, enableTestLogs, boardIssueIndex]);

  const handleResultClick = (e, item) => {
    e.preventDefault();
    doAction('alpaca.openIssue', {
      id: item.id,
      slug: item.slug,
    });

    setResults([]);
    setValue('');
  };

  /**
   * Close the search results popover.
   */
  const closePopover = () => {
    setResults([]);
  };

  useEffect(() => {
    if (!results || results.length === 0) {
      return undefined;
    }

    const handleDocumentPointerDown = (event) => {
      const target = event.target;
      if (!target) {
        return;
      }

      const wrapperEl = wrapperRef.current;
      if (wrapperEl && wrapperEl.contains(target)) {
        return;
      }

      const popoverEl = document.querySelector('.alpaca-search-popover');
      if (popoverEl && popoverEl.contains(target)) {
        return;
      }

      closePopover();
    };

    document.addEventListener('mousedown', handleDocumentPointerDown, true);
    document.addEventListener('touchstart', handleDocumentPointerDown, true);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleDocumentPointerDown,
        true,
      );
      document.removeEventListener(
        'touchstart',
        handleDocumentPointerDown,
        true,
      );
    };
  }, [results]);

  useEffect(() => {
    if (typeof document === 'undefined' || !document.body) {
      return undefined;
    }

    if (results && results.length > 0) {
      document.body.classList.add('alpaca-search-active');
    } else {
      document.body.classList.remove('alpaca-search-active');
    }

    return () => {
      document.body.classList.remove('alpaca-search-active');
    };
  }, [results]);

  useEffect(() => {
    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) {
      return undefined;
    }

    const updateWidth = () => {
      const rect = wrapperEl.getBoundingClientRect();
      if (rect.width > 0) {
        setPopoverWidth(Math.round(rect.width));
      }
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => {
        window.removeEventListener('resize', updateWidth);
      };
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(wrapperEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`alpaca-board-search ${
        results && results.length > 0 ? 'is-search-open' : ''
      }`}
      ref={wrapperRef}
      style={{ position: 'relative', width: 300 }}
    >
      <SearchControl
        label={__('Search', 'alpaca')}
        value={value}
        onChange={(val) => setValue(val)}
        placeholder={__('Search', 'alpaca')}
        isBusy={isSearching}
      />

      {results && results.length > 0 && (
        <Popover
          position="bottom left"
          className="alpaca-search-popover"
          style={{
            '--alpaca-search-popover-width': `${popoverWidth}px`,
          }}
          animate={false}
          focusOnMount={false}
          onClose={closePopover}
          onFocusOutside={closePopover}
          onEscape={closePopover}
          anchor={wrapperRef.current}
        >
          <div className="alpaca-search-results-wrap">
            <div className="alpaca-items alpaca-search-items">
              {results.map((r) => {
                const titleContent = (
                  <span className="alpaca-search-title-wrap">
                    <span className="alpaca-search-title-text">{r.title}</span>
                    {r.status ? (
                      <>
                        {'\u00A0\u00A0'}
                        <span className="alpaca-search-status-pill">
                          {r.status}
                        </span>
                      </>
                    ) : null}
                  </span>
                );

                return (
                  <div key={r.id} className="alpaca-item">
                    <Item
                      id={parseInt(r.id, 10)}
                      content={titleContent}
                      assignees={r.assignees}
                      commentCount={r.commentCount}
                      meta={r.meta}
                      postDate={r.postDate}
                      className="alpaca-item-inner"
                      onClick={(e) => handleResultClick(e, r)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </Popover>
      )}
    </div>
  );
}

function SearchPortal({ selector }) {
  if (typeof document === 'undefined' || typeof createPortal !== 'function') {
    return null;
  }

  const mountNode = document.querySelector(selector);
  if (!mountNode) {
    return null;
  }

  return createPortal(<SearchContainer />, mountNode);
}

SearchPortal.propTypes = {
  selector: PropTypes.string,
};

SearchPortal.defaultProps = {
  selector: '#project-board-controls-mount',
};

export default SearchPortal;
