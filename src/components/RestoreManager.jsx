const { useState, useCallback, useEffect, useMemo } = wp.element;
const { __ } = wp.i18n;
const { decodeEntities } = wp.htmlEntities;
const { SearchControl, Button, Notice, Spinner } = wp.components;
const { doAction } = wp.hooks;

const DEFAULT_LABEL_COLOR = '#172b4d';

/**
 * Remove HTML tags from a value.
 *
 * @param {string} maybeHtml Input string.
 * @return {string} Plain text.
 */
const stripHtml = (maybeHtml) => {
  if (!maybeHtml) {
    return '';
  }

  return String(maybeHtml)
    .replace(/<[^>]*>/g, '')
    .trim();
};

/**
 * Extract a readable title from an issue REST object.
 *
 * @param {Object} issue Issue REST payload.
 * @return {string} Issue title.
 */
const getIssueTitle = (issue) => {
  if (!issue || typeof issue !== 'object') {
    return '';
  }

  if (
    issue.title &&
    typeof issue.title === 'object' &&
    typeof issue.title.raw === 'string' &&
    issue.title.raw.trim() !== ''
  ) {
    return decodeEntities(stripHtml(issue.title.raw));
  }

  if (
    issue.title &&
    typeof issue.title === 'object' &&
    typeof issue.title.rendered === 'string' &&
    issue.title.rendered.trim() !== ''
  ) {
    return decodeEntities(stripHtml(issue.title.rendered));
  }

  if (typeof issue.post_title === 'string' && issue.post_title.trim() !== '') {
    return decodeEntities(issue.post_title.trim());
  }

  if (typeof issue.title === 'string' && issue.title.trim() !== '') {
    return decodeEntities(issue.title.trim());
  }

  if (issue.content && typeof issue.content === 'object') {
    if (
      typeof issue.content.raw === 'string' &&
      issue.content.raw.trim() !== ''
    ) {
      return decodeEntities(stripHtml(issue.content.raw));
    }

    if (
      typeof issue.content.rendered === 'string' &&
      issue.content.rendered.trim() !== ''
    ) {
      return decodeEntities(stripHtml(issue.content.rendered));
    }
  }

  if (
    typeof issue.post_content === 'string' &&
    issue.post_content.trim() !== ''
  ) {
    return decodeEntities(stripHtml(issue.post_content));
  }

  return '';
};

/**
 * Format a date value for display.
 *
 * @param {string} dateValue Date string.
 * @return {string} Formatted value.
 */
const formatDate = (dateValue) => {
  if (!dateValue) {
    return __('-', 'alpaca');
  }

  try {
    return new Date(dateValue).toLocaleString();
  } catch (error) {
    return String(dateValue);
  }
};

/**
 * Restore manager for deleted issues.
 *
 * @return {JSX.Element} Restore manager UI.
 */
const RestoreManager = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [restoringIds, setRestoringIds] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);

  useEffect(() => {
    wp.apiFetch({ path: '/alpaca/v1/labels' })
      .then((response) => {
        if (!Array.isArray(response)) {
          setAvailableLabels([]);
          return;
        }

        setAvailableLabels(response);
      })
      .catch(() => {
        setAvailableLabels([]);
      });
  }, []);

  const labelLookups = useMemo(() => {
    const byName = new Map();
    const byId = new Map();

    availableLabels.forEach((label) => {
      if (!label || typeof label !== 'object') {
        return;
      }

      const color =
        typeof label.color === 'string' && label.color.trim() !== ''
          ? label.color
          : DEFAULT_LABEL_COLOR;
      const name = typeof label.name === 'string' ? label.name.trim() : '';

      if (name) {
        byName.set(name.toLowerCase(), {
          name,
          color,
        });
      }

      if (
        (typeof label.term_id === 'number' ||
          typeof label.term_id === 'string') &&
        String(label.term_id).trim() !== ''
      ) {
        byId.set(String(label.term_id), {
          name: name || String(label.term_id),
          color,
        });
      }
    });

    return {
      byName,
      byId,
    };
  }, [availableLabels]);

  /**
   * Build label objects with display name and color.
   *
   * @param {Object} issue Issue REST payload.
   * @return {Array<Object>} Labels for UI.
   */
  const getIssueLabels = useCallback(
    (issue) => {
      const metaLabels = issue?.meta?.labels;
      const taxonomyLabelIds = Array.isArray(issue?.alpaca_label)
        ? issue.alpaca_label
        : [];

      let labelsFromMeta = [];
      if (Array.isArray(metaLabels)) {
        labelsFromMeta = metaLabels
          .map((labelValue) => {
            if (!labelValue) {
              return '';
            }

            if (typeof labelValue === 'string') {
              return labelValue.trim();
            }

            if (
              typeof labelValue === 'object' &&
              typeof labelValue.name === 'string'
            ) {
              return labelValue.name.trim();
            }

            return String(labelValue).trim();
          })
          .filter(Boolean);
      } else if (typeof metaLabels === 'string' && metaLabels.trim() !== '') {
        labelsFromMeta = [metaLabels.trim()];
      }

      if (labelsFromMeta.length > 0) {
        return labelsFromMeta.map((name) => {
          const matched = labelLookups.byName.get(name.toLowerCase());

          return {
            name,
            color: matched?.color || DEFAULT_LABEL_COLOR,
          };
        });
      }

      if (taxonomyLabelIds.length > 0) {
        return taxonomyLabelIds.map((id) => {
          const matched = labelLookups.byId.get(String(id));

          return {
            name: matched?.name || String(id),
            color: matched?.color || DEFAULT_LABEL_COLOR,
          };
        });
      }

      return [];
    },
    [labelLookups],
  );

  /**
   * Handle submitted trash search.
   *
   * @param {Event} event Submit event.
   * @return {Promise<void>} Promise.
   */
  const handleSearch = useCallback(
    async (event) => {
      if (event && event.preventDefault) {
        event.preventDefault();
      }

      const submittedQuery = (query || '').trim();
      setHasSearched(true);
      setError('');
      setIsSearching(true);

      try {
        if (!submittedQuery) {
          setResults([]);
          return;
        }

        const fields =
          'id,title,content,post_title,post_content,date,date_gmt,meta,alpaca_label';
        const issuesPath = `/wp/v2/alpaca_issue?status=trash&context=edit&search=${encodeURIComponent(
          submittedQuery,
        )}&per_page=20&_fields=${fields}`;

        const issues = await wp.apiFetch({ path: issuesPath });
        const normalizedIssues = Array.isArray(issues) ? issues : [];

        const nextResults = await Promise.all(
          normalizedIssues.map(async (issue) => {
            let lastActionDate = '';
            let detailTitle = '';
            let detailLastActivity = '';

            try {
              const detailResponse = await wp.apiFetch({
                path: `/alpaca/v1/get/${encodeURIComponent(issue.id)}`,
              });

              if (
                detailResponse &&
                detailResponse.success &&
                detailResponse.post_data &&
                typeof detailResponse.post_data.post_title === 'string' &&
                detailResponse.post_data.post_title.trim() !== ''
              ) {
                detailTitle = detailResponse.post_data.post_title.trim();
              }

              if (
                detailResponse &&
                detailResponse.success &&
                detailResponse.meta &&
                typeof detailResponse.meta.alpaca_lastActivity === 'string' &&
                detailResponse.meta.alpaca_lastActivity.trim() !== ''
              ) {
                detailLastActivity = detailResponse.meta.alpaca_lastActivity;
              }
            } catch (detailError) {
              detailTitle = '';
              detailLastActivity = '';
            }

            if (detailLastActivity) {
              lastActionDate = detailLastActivity;
            }

            if (!lastActionDate) {
              try {
                const countResponse = await wp.apiFetch({
                  path: `/alpaca/v1/comment-count/${encodeURIComponent(
                    issue.id,
                  )}`,
                });

                if (
                  countResponse &&
                  countResponse.success &&
                  typeof countResponse.last_activity === 'string' &&
                  countResponse.last_activity.trim() !== ''
                ) {
                  lastActionDate = countResponse.last_activity;
                }
              } catch (countError) {
                lastActionDate = '';
              }
            }

            if (!lastActionDate) {
              try {
                const commentsPath = `/wp/v2/comments?post=${encodeURIComponent(
                  issue.id,
                )}&per_page=1&orderby=date_gmt&order=desc&comment_type=issuecomment&type=issuecomment&status=all&context=edit&show_hidden_comments=1&_fields=date,date_gmt`;
                const comments = await wp.apiFetch({ path: commentsPath });
                const latestComment = Array.isArray(comments)
                  ? comments[0]
                  : null;

                if (latestComment) {
                  lastActionDate =
                    latestComment.date_gmt || latestComment.date || '';
                }
              } catch (commentError) {
                lastActionDate = '';
              }
            }

            return {
              id: String(issue.id),
              title:
                detailTitle ||
                getIssueTitle(issue) ||
                __('(Untitled issue)', 'alpaca'),
              labels: getIssueLabels(issue),
              createdAt: issue.date_gmt || issue.date || '',
              lastActionAt: lastActionDate,
            };
          }),
        );

        setResults(nextResults);
      } catch (searchError) {
        setResults([]);
        setError(__('Search failed. Please try again.', 'alpaca'));
      } finally {
        setIsSearching(false);
      }
    },
    [query, getIssueLabels],
  );

  /**
   * Restore a trashed issue.
   *
   * @param {string} issueId Issue ID.
   * @return {Promise<void>} Promise.
   */
  const handleRestore = useCallback(async (issueId) => {
    if (!issueId) {
      return;
    }

    setError('');
    setRestoringIds((previousIds) => [...previousIds, String(issueId)]);

    try {
      await wp.apiFetch({
        path: `/wp/v2/alpaca_issue/${encodeURIComponent(issueId)}`,
        method: 'POST',
        data: {
          status: 'publish',
        },
      });

      doAction('alpaca.issueRestoredAudit', String(issueId));

      setResults((previousResults) =>
        previousResults.filter((result) => result.id !== String(issueId)),
      );
    } catch (restoreError) {
      setError(__('Failed to restore issue.', 'alpaca'));
    } finally {
      setRestoringIds((previousIds) =>
        previousIds.filter((id) => id !== String(issueId)),
      );
    }
  }, []);

  return (
    <div className="alpaca-restore-manager">
      <p className="alpaca-settings-manager-intro">
        {__(
          'Use this screen to find and restore deleted issues from trash.',
          'alpaca',
        )}
      </p>

      <form className="alpaca-restore-search" onSubmit={handleSearch}>
        <div className="alpaca-restore-search-controls">
          <SearchControl
            label={__('Search deleted issues', 'alpaca')}
            value={query}
            onChange={setQuery}
            placeholder={__('Search deleted issues', 'alpaca')}
            isBusy={isSearching}
          />
          <Button type="submit" variant="primary" disabled={isSearching}>
            {__('Search', 'alpaca')}
          </Button>
        </div>
      </form>

      {error && (
        <Notice status="error" isDismissible={false}>
          {error}
        </Notice>
      )}

      {!hasSearched ? (
        <div className="alpaca-restore-placeholder" />
      ) : (
        <div className="alpaca-restore-table-wrap">
          <table className="widefat striped alpaca-restore-table">
            <thead>
              <tr>
                <th scope="col">{__('Title', 'alpaca')}</th>
                <th scope="col">{__('Labels', 'alpaca')}</th>
                <th scope="col">{__('Created', 'alpaca')}</th>
                <th scope="col">{__('Last action', 'alpaca')}</th>
                <th scope="col">{__('Actions', 'alpaca')}</th>
              </tr>
            </thead>
            <tbody>
              {results.length < 1 ? (
                <tr>
                  <td colSpan={5} className="alpaca-restore-empty-cell">
                    {isSearching ? (
                      <Spinner />
                    ) : (
                      __('No deleted issues found.', 'alpaca')
                    )}
                  </td>
                </tr>
              ) : (
                results.map((result) => {
                  const isRestoring = restoringIds.includes(result.id);

                  return (
                    <tr key={result.id}>
                      <td>{result.title}</td>
                      <td>
                        <div className="alpaca-restore-labels">
                          {result.labels.length > 0 ? (
                            result.labels.map((label, index) => (
                              <span
                                key={`${result.id}-label-${index}`}
                                className="alpaca-item-label alpaca-label-pill"
                                style={{
                                  backgroundColor: label.color,
                                  color: '#fff',
                                }}
                              >
                                {label.name}
                              </span>
                            ))
                          ) : (
                            <span className="alpaca-restore-muted">
                              {__('-', 'alpaca')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="alpaca-restore-muted">
                        {formatDate(result.createdAt)}
                      </td>
                      <td className="alpaca-restore-muted">
                        {formatDate(result.lastActionAt)}
                      </td>
                      <td>
                        <Button
                          variant="secondary"
                          onClick={() => handleRestore(result.id)}
                          disabled={isRestoring}
                        >
                          {isRestoring
                            ? __('Restoring…', 'alpaca')
                            : __('Restore', 'alpaca')}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RestoreManager;
