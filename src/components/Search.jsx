const { useState, useEffect, useRef, useMemo } = wp.element;
const { SearchControl, Popover } = wp.components;
const { decodeEntities } = wp.htmlEntities;
const { __ } = wp.i18n;
const { doAction } = wp.hooks;
import Item from './Item';
import { WatchlistProvider } from '../context/WatchlistContext';

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

  return String(maybeHtml).replace(/<[^>]*>/g, '').trim();
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
      const meta = issue.meta && typeof issue.meta === 'object' ? issue.meta : {};
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
      fromBoard && Array.isArray(fromBoard.assignees) ? fromBoard.assignees : [],
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
  const boardIssueIndex = useMemo(
    () =>
      buildBoardIssueIndex(
        typeof window !== 'undefined' ? window.alpacaBoardData : [],
      ),
    [],
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
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const query = value ? value.trim() : '';
    if (!query || query.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsSearching(false);
      return undefined;
    }

    debounceRef.current = setTimeout(() => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setIsSearching(true);
      const q = query;

      const issuesPromise = wp
        .apiFetch({
          path: `/wp/v2/alpaca_issue?search=${encodeURIComponent(q)}&per_page=${MAX_RESULTS}&_fields=id,title,content,slug,post_name,post_title,post_content`,
        })
        .catch(() => []);

      const commentsPromise = wp
        .apiFetch({
          path: `/wp/v2/comments?search=${encodeURIComponent(q)}&per_page=100&comment_type=issuecomment&type=issuecomment&context=edit&show_hidden_comments=1&_fields=post,comment_post_ID`,
        })
        .catch(() => []);

      Promise.all([issuesPromise, commentsPromise])
        .then(([issues, comments]) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          if (enableTestLogs) {
            // eslint-disable-next-line no-console
            console.log('Alpaca search raw responses', {
              query: q,
              issues,
              comments,
            });
          }

          const seen = new Set();
          const normalized = [];

          (issues || []).forEach((post) => {
            const id = String(post.id);
            if (seen.has(id)) {
              return;
            }
            seen.add(id);
            normalized.push(buildResultItem(post, boardIssueIndex));
          });

          const commentPostIds = Array.from(
            new Set(
              (comments || [])
                .map(
                  (c) =>
                    c && (c.post || c.comment_post_ID)
                      ? String(c.post || c.comment_post_ID)
                      : null,
                )
                .filter(Boolean),
            ),
          );

          const missingIds = commentPostIds
            .filter((id) => !seen.has(id))
            .slice(0, MAX_RESULTS);

          if (missingIds.length === 0) {
            setResults(normalized.slice(0, MAX_RESULTS));
            return;
          }

          const includePath = `/wp/v2/alpaca_issue?include=${encodeURIComponent(
            missingIds.join(','),
          )}&per_page=${MAX_RESULTS}&_fields=id,title,content,slug,post_name,post_title,post_content`;

          wp.apiFetch({ path: includePath })
            .then((extraIssues) => {
              if (requestId !== requestIdRef.current) {
                return;
              }

              (extraIssues || []).forEach((post) => {
                const id = String(post.id);
                if (seen.has(id)) {
                  return;
                }
                seen.add(id);
                normalized.push(buildResultItem(post, boardIssueIndex));
              });

              setResults(normalized.slice(0, MAX_RESULTS));
            })
            .catch(() => {
              if (requestId !== requestIdRef.current) {
                return;
              }
              setResults(normalized.slice(0, MAX_RESULTS));
            });
        })
        .catch((err) => {
          if (requestId !== requestIdRef.current) {
            return;
          }
          if (enableTestLogs) {
            // eslint-disable-next-line no-console
            console.error('Search error', err);
          }
          setResults([]);
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            setIsSearching(false);
          }
        });
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
      document.removeEventListener('mousedown', handleDocumentPointerDown, true);
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
                        <span className="alpaca-search-status-pill">{r.status}</span>
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

function mountSearch(selector) {
  try {
    const el = document.querySelector(selector);
    if (!el) return;
    const { render } = wp.element;
    render(
      <WatchlistProvider>
        <SearchContainer />
      </WatchlistProvider>,
      el,
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error mounting Alpaca search control:', e);
  }
}

// Register with the board controls hook so the control is added when the
// board calls `doAction('alpaca_board_controls', selector)`.
if (typeof wp !== 'undefined' && wp.hooks && wp.hooks.addAction) {
  wp.hooks.addAction('alpaca_board_controls', 'alpaca/search', mountSearch);
}

export default SearchContainer;
