import { formatWpDateValue } from '../utils/date';
import {
  DEFAULT_RESTORE_PAGE_SIZE,
  buildRestoreIssuesPath,
  getRestorePaginationInfo,
} from '../utils/restorePagination';

const { useState, useCallback, useEffect, useMemo } = wp.element;
const { __, _n, sprintf } = wp.i18n;
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
 * @param {string}  dateValue Date string.
 * @param {boolean} isGmt     Whether the value should be treated as GMT.
 * @return {string} Formatted value.
 */
const formatDate = (dateValue, isGmt = false) => {
  if (!dateValue) {
    return __('-', 'alpaca');
  }

  const formattedValue = formatWpDateValue(
    dateValue,
    wp.date.getSettings().formats.datetime,
    {
      treatMysqlAsUtc: isGmt,
    },
  );

  if (formattedValue) {
    return formattedValue;
  }

  return String(dateValue);
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
  const [error, setError] = useState('');
  const [restoringIds, setRestoringIds] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

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
   * Fetch trashed issues for the current query.
   *
   * @param {string} submittedQuery Search term to apply.
   * @param {number} page           Page number.
   * @return {Promise<void>} Promise.
   */
  const loadIssues = useCallback(
    async (submittedQuery = '', page = 1) => {
      const trimmedQuery = (submittedQuery || '').trim();
      const normalizedPage = Math.max(1, parseInt(page, 10) || 1);
      setError('');
      setIsSearching(true);

      try {
        const response = await wp.apiFetch({
          path: buildRestoreIssuesPath({
            query: trimmedQuery,
            page: normalizedPage,
            perPage: DEFAULT_RESTORE_PAGE_SIZE,
          }),
          parse: false,
        });
        const issues = await response.json();
        const normalizedIssues = Array.isArray(issues) ? issues : [];
        const paginationInfo = getRestorePaginationInfo(
          response,
          DEFAULT_RESTORE_PAGE_SIZE,
        );

        const nextResults = await Promise.all(
          normalizedIssues.map(async (issue) => {
            let lastActionDate = '';
            let lastActionDateIsGmt = false;
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
              lastActionDateIsGmt = true;
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
                  lastActionDateIsGmt = true;
                }
              } catch (countError) {
                lastActionDate = '';
                lastActionDateIsGmt = false;
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
                  if (
                    typeof latestComment.date_gmt === 'string' &&
                    latestComment.date_gmt
                  ) {
                    lastActionDate = latestComment.date_gmt;
                    lastActionDateIsGmt = true;
                  } else {
                    lastActionDate = latestComment.date || '';
                    lastActionDateIsGmt = false;
                  }
                }
              } catch (commentError) {
                lastActionDate = '';
                lastActionDateIsGmt = false;
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
              createdAtIsGmt: Boolean(issue.date_gmt),
              lastActionAt: lastActionDate,
              lastActionAtIsGmt: lastActionDateIsGmt,
            };
          }),
        );

        setResults(nextResults);
        setCurrentPage(normalizedPage);
        setTotalPages(paginationInfo.totalPages);
        setTotalItems(paginationInfo.totalItems);
      } catch (searchError) {
        setResults([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalItems(0);
        setError(__('Search failed. Please try again.', 'alpaca'));
      } finally {
        setIsSearching(false);
      }
    },
    [getIssueLabels],
  );

  useEffect(() => {
    if ((query || '').trim() !== '') {
      return;
    }

    loadIssues('');
  }, [loadIssues, query]);

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

      await loadIssues(query, 1);
    },
    [loadIssues, query],
  );

  /**
   * Load a specific deleted-items page.
   *
   * @param {number} page Page number.
   * @return {Promise<void>} Promise.
   */
  const handlePageChange = useCallback(
    async (page) => {
      await loadIssues(query, page);
    },
    [loadIssues, query],
  );

  /**
   * Restore a trashed issue.
   *
   * @param {string} issueId Issue ID.
   * @return {Promise<void>} Promise.
   */
  const handleRestore = useCallback(
    async (issueId) => {
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
        await loadIssues(
          query,
          results.length <= 1 && currentPage > 1
            ? currentPage - 1
            : currentPage,
        );
      } catch (restoreError) {
        setError(__('Failed to restore issue.', 'alpaca'));
      } finally {
        setRestoringIds((previousIds) =>
          previousIds.filter((id) => id !== String(issueId)),
        );
      }
    },
    [currentPage, loadIssues, query, results.length],
  );

  /* translators: %d: Number of deleted issues. */
  const deletedIssueSummaryLabel = _n(
    '%d deleted issue',
    '%d deleted issues',
    totalItems,
    'alpaca',
  );
  const deletedIssueSummary = sprintf(deletedIssueSummaryLabel, totalItems);

  /* translators: 1: Current page number. 2: Total page count. */
  const paginationSummaryLabel = __('Page %1$d of %2$d', 'alpaca');
  const paginationSummary = sprintf(
    paginationSummaryLabel,
    currentPage,
    totalPages,
  );

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
            __nextHasNoMarginBottom
          />
          <Button type="submit" variant="primary" disabled={isSearching}>
            {__('Search', 'alpaca')}
          </Button>
        </div>
      </form>

      <p className="alpaca-settings-manager-intro alpaca-restore-summary">
        {deletedIssueSummary}
      </p>

      {error && (
        <Notice status="error" isDismissible={false}>
          {error}
        </Notice>
      )}

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
                      {formatDate(result.createdAt, result.createdAtIsGmt)}
                    </td>
                    <td className="alpaca-restore-muted">
                      {formatDate(
                        result.lastActionAt,
                        result.lastActionAtIsGmt,
                      )}
                    </td>
                    <td>
                      <Button
                        className="alpaca-restore-action"
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

      <div className="alpaca-restore-pagination">
        <span className="alpaca-restore-pagination-summary">
          {paginationSummary}
        </span>
        <div className="alpaca-restore-pagination-actions">
          <Button
            variant="secondary"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={isSearching || currentPage <= 1}
          >
            {__('Previous', 'alpaca')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={isSearching || currentPage >= totalPages}
          >
            {__('Next', 'alpaca')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestoreManager;
