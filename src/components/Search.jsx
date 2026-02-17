const { useState, useEffect, useRef } = wp.element;
const { SearchControl, Popover } = wp.components;
const { decodeEntities } = wp.htmlEntities;

// Dynamic search control: queries issues and issue comments (comment_type=issuecomment)
// when the query is at least 3 characters. Results shown in a Popover as a
// simple list of up to 10 unique Issues. Clicking a result updates the URL
// `issue` query param so the board can respond (no wiring to open modal here).

function SearchContainer() {
  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [enableTestLogs, setEnableTestLogs] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    wp.apiFetch({ path: '/wp/v2/settings' }).then((settings) => {
      setEnableTestLogs(settings.alpaca_enable_test_logs === '1');
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
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value || value.length < 3) {
      setResults([]);
      setIsSearching(false);
      return undefined;
    }

    debounceRef.current = setTimeout(() => {
      setIsSearching(true);
      const q = value.trim();

      const issuesPromise = wp
        .apiFetch({
          path: `/wp/v2/alpaca_issue?search=${encodeURIComponent(q)}&per_page=10`,
        })
        .catch(() => []);

      const commentsPromise = wp
        .apiFetch({
          // request a larger page and match other comment-listing calls used elsewhere
          path: `/wp/v2/comments?search=${encodeURIComponent(q)}&per_page=100&comment_type=issuecomment&type=issuecomment&context=edit&_embed=author&show_hidden_comments=1`,
        })
        .catch(() => []);

      Promise.all([issuesPromise, commentsPromise])
        .then(async ([issues, comments]) => {
          // Debug: log raw responses when test logs are enabled
          if (enableTestLogs) {
            // eslint-disable-next-line no-console
            console.log('Alpaca search raw responses', {
              query: q,
              issues,
              comments,
            });
          }
          const seen = new Map();
          const normalized = [];

          // Normalize issue posts from /wp/v2/alpaca_issue
          const issuesArray = issues || [];
          const stripHtml = (s) =>
            s
              ? String(s)
                  .replace(/<[^>]*>/g, '')
                  .trim()
              : '';

          const getTitle = (post) => {
            if (!post) return '';

            // Prefer WP REST `title.rendered` when present
            if (post.title) {
              if (typeof post.title === 'string' && post.title.trim())
                return post.title;
              if (post.title.rendered && post.title.rendered.trim())
                return decodeEntities(stripHtml(post.title.rendered));
            }

            // Fallback: use content.rendered stripped of HTML (many responses include content)
            if (post.content && post.content.rendered) {
              const fromContent = stripHtml(post.content.rendered);
              if (fromContent) return decodeEntities(fromContent);
            }

            return post.post_title || post.slug || post.post_name || '';
          };

          issuesArray.forEach((post) => {
            const id = String(post.id);
            if (seen.has(id)) return;
            seen.set(id, true);
            const title = getTitle(post) || id;
            const slug = post.slug || post.post_name || post.name || null;
            normalized.push({ id, title, slug });
          });

          // If any normalized entries lack a proper human title (e.g. equal to slug or id),
          // attempt to fetch authoritative issue data from the Alpaca endpoint.
          const missingTitleIds = normalized
            .filter((n) => !n.title || n.title === n.slug || n.title === n.id)
            .map((n) => n.id)
            .slice(0, 10);

          if (missingTitleIds.length > 0) {
            const fetches = missingTitleIds.map((id) =>
              wp.apiFetch({ path: `/alpaca/v1/get/${id}` }).catch(() => null),
            );
            const fetched = await Promise.all(fetches);
            // Debug: log Alpaca endpoint responses for missing titles
            if (enableTestLogs) {
              // eslint-disable-next-line no-console
              console.log('Alpaca /alpaca/v1/get responses (missing titles)', {
                missingTitleIds,
                fetched,
              });
            }

            const extractTitleFromResp = (r) => {
              if (!r) return null;
              if (r.issue && r.issue.title) return r.issue.title;
              if (r.title) return r.title;
              if (r.post_data && r.post_data.post_title)
                return r.post_data.post_title;
              if (
                r.post_data &&
                r.post_data.post_title &&
                typeof r.post_data.post_title === 'string'
              )
                return r.post_data.post_title;
              return null;
            };

            const extractSlugFromResp = (r) => {
              if (!r) return null;
              if (r.issue && r.issue.slug) return r.issue.slug;
              if (r.slug) return r.slug;
              if (r.post_data && r.post_data.post_name)
                return r.post_data.post_name;
              return null;
            };

            fetched.forEach((resp) => {
              if (!resp) return;
              const postId =
                resp.post_id ||
                (resp.issue && resp.issue.id) ||
                (resp.post_data && (resp.post_data.ID || resp.post_data.id)) ||
                null;
              if (!postId) return;
              const id = String(postId);
              const idx = normalized.findIndex((n) => n.id === id);
              if (idx !== -1) {
                const titleFromResp = extractTitleFromResp(resp);
                if (titleFromResp) {
                  const slugFromResp = extractSlugFromResp(resp);
                  normalized[idx] = {
                    ...normalized[idx],
                    title: titleFromResp,
                    slug: normalized[idx].slug || slugFromResp,
                  };
                }
              }
            });
          }

          // For comments, collect parent post IDs and fetch missing issues
          const commentPostIds = Array.from(
            new Set(
              (comments || [])
                .map(
                  (c) =>
                    c &&
                    (c.post || c.comment_post_ID || c.comment_post_ID === 0
                      ? c.post || c.comment_post_ID
                      : null),
                )
                .filter(Boolean),
            ),
          ).filter(Boolean);
          const missingIds = commentPostIds
            .filter((id) => !seen.has(String(id)))
            .slice(0, 10);

          if (missingIds.length > 0) {
            // Fetch authoritative Alpaca issue data for comment parents
            const fetches = missingIds.map((id) =>
              wp.apiFetch({ path: `/alpaca/v1/get/${id}` }).catch(() => null),
            );
            const fetched = await Promise.all(fetches);
            // Debug: log Alpaca endpoint responses for comment parents
            if (enableTestLogs) {
              // eslint-disable-next-line no-console
              console.log('Alpaca /alpaca/v1/get responses (comment parents)', {
                missingIds,
                fetched,
              });
            }
            const extractTitleFromResp = (r) => {
              if (!r) return null;
              if (r.issue && r.issue.title) return r.issue.title;
              if (r.title) return r.title;
              if (r.post_data && r.post_data.post_title)
                return r.post_data.post_title;
              return null;
            };

            const extractSlugFromResp = (r) => {
              if (!r) return null;
              if (r.issue && r.issue.slug) return r.issue.slug;
              if (r.slug) return r.slug;
              if (r.post_data && r.post_data.post_name)
                return r.post_data.post_name;
              return null;
            };

            fetched.forEach((resp) => {
              if (!resp) return;
              const postId =
                resp.post_id ||
                (resp.issue && resp.issue.id) ||
                (resp.post_data && (resp.post_data.ID || resp.post_data.id)) ||
                null;
              if (!postId) return;
              const id = String(postId);
              if (seen.has(id)) return;
              seen.set(id, true);
              const titleFromResp = extractTitleFromResp(resp);
              const slugFromResp = extractSlugFromResp(resp);
              const title = titleFromResp || id;
              const slug = slugFromResp || null;
              normalized.push({ id, title, slug });
            });
          }

          // Limit to max 10 results
          setResults(normalized.slice(0, 10));
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Search error', err);
          setResults([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, enableTestLogs]);

  const handleResultClick = (e, item) => {
    e.preventDefault();
    try {
      const url = new URL(window.location.href);
      const valueToSet = item.slug || item.id;
      url.searchParams.set('issue', valueToSet);
      window.history.pushState({}, '', url.toString());
    } catch (err) {
      const params = new URLSearchParams(window.location.search);
      params.set('issue', item.slug || item.id);
      const base = window.location.pathname + window.location.hash;
      const search = params.toString();
      window.history.pushState({}, '', base + (search ? `?${search}` : ''));
    }

    // close results
    setResults([]);
    setValue('');
  };

  return (
    <div
      className="alpaca-board-search"
      ref={wrapperRef}
      style={{ position: 'relative', width: 300 }}
    >
      <SearchControl
        label={wp.i18n.__('Search', 'alpaca')}
        value={value}
        onChange={(val) => setValue(val)}
        placeholder={wp.i18n.__('Search')}
        isBusy={isSearching}
      />

      {results && results.length > 0 && (
        <Popover
          position="bottom left"
          className="alpaca-search-popover"
          focusOnMount={false}
        >
          <div style={{ width: 300, maxHeight: 320, overflowY: 'auto' }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: '8px' }}>
              {results.map((r) => {
                const adminUrlBase =
                  typeof window !== 'undefined' &&
                  window.alpacaSettings &&
                  window.alpacaSettings.adminUrl
                    ? window.alpacaSettings.adminUrl
                    : 'admin.php';

                const issueParam = r.slug || r.post_name || r.id;
                const href = `${adminUrlBase}?page=project-board&issue=${encodeURIComponent(
                  issueParam,
                )}`;

                return (
                  <li key={r.id} style={{ padding: '6px 0' }}>
                    <a
                      href={href}
                      target="_self"
                      onClick={(e) => handleResultClick(e, r)}
                    >
                      {r.title}
                    </a>
                  </li>
                );
              })}
            </ul>
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
    render(<SearchContainer />, el);
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
