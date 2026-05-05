import { formatWpDateValue } from '../utils/date';
import {
  DEFAULT_RESTORE_PAGE_SIZE,
  buildRestoreIssuesPath,
  getRestorePaginationInfo,
} from '../utils/restorePagination';

const { useState, useCallback, useEffect } = wp.element;
const { __, _n, sprintf } = wp.i18n;
const { SearchControl, Button, Notice, Spinner } = wp.components;
const { doAction } = wp.hooks;

/**
 * Normalize a deleted issue response item for UI use.
 *
 * @param {Object} issue Deleted issue payload.
 * @return {Object} Normalized deleted issue.
 */
const normalizeDeletedIssue = (issue) => {
  const labels = Array.isArray(issue?.labels)
    ? issue.labels
        .map((label) => ({
          name:
            typeof label?.name === 'string' && label.name.trim() !== ''
              ? label.name.trim()
              : '',
          color:
            typeof label?.color === 'string' && label.color.trim() !== ''
              ? label.color
              : '#172b4d',
        }))
        .filter((label) => label.name)
    : [];

  return {
    id: String(issue?.id || ''),
    parentId:
      Number.isInteger(Number(issue?.parentId)) && Number(issue.parentId) > 0
        ? String(issue.parentId)
        : '',
    parentTitle:
      typeof issue?.parentTitle === 'string' ? issue.parentTitle.trim() : '',
    title:
      typeof issue?.title === 'string' && issue.title.trim() !== ''
        ? issue.title.trim()
        : __('(Untitled issue)', 'alpaca'),
    labels,
    isCompleted: Boolean(issue?.isCompleted),
    createdAt: typeof issue?.createdAt === 'string' ? issue.createdAt : '',
    createdAtIsGmt: Boolean(issue?.createdAtIsGmt),
    lastActionAt:
      typeof issue?.lastActionAt === 'string' ? issue.lastActionAt : '',
    lastActionAtIsGmt: Boolean(issue?.lastActionAtIsGmt),
  };
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  /**
   * Fetch trashed issues for the current query.
   *
   * @param {string} submittedQuery Search term to apply.
   * @param {number} page           Page number.
   * @return {Promise<void>} Promise.
   */
  const loadIssues = useCallback(async (submittedQuery = '', page = 1) => {
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
      });
      const normalizedIssues = Array.isArray(response?.items)
        ? response.items.map((issue) => normalizeDeletedIssue(issue))
        : [];
      const paginationInfo = getRestorePaginationInfo(
        response,
        DEFAULT_RESTORE_PAGE_SIZE,
      );

      setResults(normalizedIssues);
      setCurrentPage(response?.pagination?.page || normalizedPage);
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
  }, []);

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
        const response = await wp.apiFetch({
          path: `/alpaca/v1/restore/${encodeURIComponent(issueId)}`,
          method: 'POST',
        });

        const restoredIssue = response?.restored_issue;

        if (
          restoredIssue &&
          Number.isInteger(Number(restoredIssue.parent_id)) &&
          Number(restoredIssue.parent_id) > 0
        ) {
          doAction(
            'alpaca.subissueRestoredAudit',
            String(restoredIssue.parent_id),
            {
              id: String(restoredIssue.id || issueId),
              title: restoredIssue.title || '',
            },
          );
        } else {
          doAction('alpaca.issueRestoredAudit', String(issueId));
        }

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
              <th scope="col">{__('Type', 'alpaca')}</th>
              <th scope="col">{__('Labels', 'alpaca')}</th>
              <th scope="col">{__('Created', 'alpaca')}</th>
              <th scope="col">{__('Last action', 'alpaca')}</th>
              <th scope="col">{__('Actions', 'alpaca')}</th>
            </tr>
          </thead>
          <tbody>
            {results.length < 1 ? (
              <tr>
                <td colSpan={6} className="alpaca-restore-empty-cell">
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
                const isChecklistItem = Boolean(result.parentId);
                const itemTypeLabel = isChecklistItem
                  ? __('Checklist item', 'alpaca')
                  : __('Issue', 'alpaca');
                let parentIssueSummary = '';

                if (isChecklistItem && result.parentTitle) {
                  const parentIssueLabel =
                    /* translators: %s: Parent issue title. */
                    __('Issue: %s', 'alpaca');

                  parentIssueSummary = sprintf(
                    parentIssueLabel,
                    result.parentTitle,
                  );
                }

                return (
                  <tr key={result.id}>
                    <td>
                      <div className="alpaca-restore-title-cell">
                        <div
                          className={[
                            'alpaca-restore-title-text',
                            result.isCompleted
                              ? 'alpaca-restore-title-text--completed'
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {result.title}
                        </div>
                        {parentIssueSummary && (
                          <div className="alpaca-restore-parent-issue">
                            {parentIssueSummary}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="alpaca-restore-type-cell">
                      <span className="alpaca-restore-item-type">
                        {itemTypeLabel}
                      </span>
                    </td>
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
