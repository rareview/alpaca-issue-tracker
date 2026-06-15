const { useState, useEffect, useRef, useMemo, createPortal } = wp.element;
const { SearchControl } = wp.components;
const { __ } = wp.i18n;
const { applyFilters } = wp.hooks;
import PropTypes from 'prop-types';

import { isTestLoggingEnabled } from '../utils/testLogSetting.js';
import { getIssueIdsKey } from '../utils/searchRequests';
import {
  getNormalizedIssueResultId,
  searchIssues,
} from '../services/issueSearch';

const MIN_QUERY_LENGTH = 3;
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
  const [enableTestLogs, setEnableTestLogs] = useState(isTestLoggingEnabled);
  const [searchRefreshToken, setSearchRefreshToken] = useState(0);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const searchScopeIssueIdsKey = useMemo(
    () => getIssueIdsKey(searchScopeIssueIds),
    [searchScopeIssueIds],
  );
  const searchScopeIssueIdsRef = useRef(searchScopeIssueIds);
  searchScopeIssueIdsRef.current = searchScopeIssueIds;

  useEffect(() => {
    const handleTestLogSettingChange = (newVal) => {
      setEnableTestLogs(Boolean(newVal));
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
      const currentSearchScopeIds = searchScopeIssueIdsRef.current;

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
        try {
          const scopedIssues = await searchIssues(q, {
            enableTestLogs,
            scopeIssueIds: currentSearchScopeIds,
            commentAgentTypes: applyFilters(
              'alpaca.search.commentAgentTypes',
              null,
              {
                query: q,
                comments: [],
              },
            ),
          });

          if (requestId !== requestIdRef.current) {
            return;
          }

          onSetSearchFilter({
            type: 'search',
            query: q,
            issueIds: scopedIssues.map((post) =>
              getNormalizedIssueResultId(post),
            ),
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
