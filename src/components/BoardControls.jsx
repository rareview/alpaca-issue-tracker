const { useEffect, useMemo } = wp.element;
const { applyFilters, doAction } = wp.hooks;

import PropTypes from 'prop-types';

import InboxControl from './InboxControl';
import BoardFilterControl from './BoardFilterControl';
import AddIssueControl from './AddIssueControl';
import SearchPortal from './Search';

/**
 * Board controls orchestrator.
 *
 * Provides default controls and exposes a filter hook for extending
 * or replacing the control list without editing the board component.
 *
 * @param {Object}   props                     Component props.
 * @param {string}   props.selector            Controls mount selector.
 * @param {Array}    props.containers          Board container data.
 * @param {Object}   props.activeFilter        Current active board filter.
 * @param {Object}   props.activeSearchFilter  Current active search filter.
 * @param {Array}    props.searchScopeIssueIds Search-scoped issue IDs.
 * @param {Function} props.onSetFilter         Set filter callback.
 * @param {Function} props.onClearFilter       Clear filter callback.
 * @param {Function} props.onSetSearchFilter   Set search filter callback.
 * @param {Function} props.onClearSearchFilter Clear search filter callback.
 * @param {Function} props.onAddIssue          Create issue callback.
 * @param {boolean}  props.showFilters         Whether to include filter controls.
 * @param {boolean}  props.showAddIssue        Whether to include the add issue control.
 * @param {boolean}  props.showInbox           Whether to include the inbox control.
 * @param {boolean}  props.showSearch          Whether to include search controls.
 * @return {JSX.Element} Rendered board controls.
 */
function BoardControls({
  selector,
  containers,
  activeFilter,
  activeSearchFilter,
  searchScopeIssueIds,
  onSetFilter,
  onClearFilter,
  onSetSearchFilter,
  onClearSearchFilter,
  onAddIssue,
  showFilters,
  showAddIssue,
  showInbox,
  showSearch,
}) {
  const defaultControls = useMemo(
    () => [
      ...(showAddIssue
        ? [
            {
              key: 'add-issue',
              component: AddIssueControl,
              props: { selector, onAddIssue },
            },
          ]
        : []),
      ...(showInbox
        ? [
            {
              key: 'inbox',
              component: InboxControl,
              props: { selector },
            },
          ]
        : []),
      ...(showFilters
        ? [
            {
              key: 'filter',
              component: BoardFilterControl,
              props: {
                selector,
                containers,
                activeFilter,
                onSetFilter,
                onClearFilter,
              },
            },
          ]
        : []),
      ...(showSearch
        ? [
            {
              key: 'search',
              component: SearchPortal,
              props: {
                selector,
                activeSearchFilter,
                searchScopeIssueIds,
                onSetSearchFilter,
                onClearSearchFilter,
              },
            },
          ]
        : []),
    ],
    [
      selector,
      containers,
      activeFilter,
      activeSearchFilter,
      searchScopeIssueIds,
      onSetFilter,
      onClearFilter,
      onSetSearchFilter,
      onClearSearchFilter,
      onAddIssue,
      showFilters,
      showAddIssue,
      showInbox,
      showSearch,
    ],
  );

  const controls = applyFilters('alpaca.board.controls', defaultControls, {
    selector,
    containers,
    activeFilter,
    activeSearchFilter,
    searchScopeIssueIds,
    onSetFilter,
    onClearFilter,
    onSetSearchFilter,
    onClearSearchFilter,
  });

  useEffect(() => {
    // Backwards-compatible action hook for controls mounted outside React.
    doAction('alpaca_board_controls', selector);
  }, [selector]);

  if (!Array.isArray(controls) || controls.length < 1) {
    return null;
  }

  return (
    <>
      {controls.map((entry, index) => {
        if (!entry || typeof entry.component !== 'function') {
          return null;
        }

        const ControlComponent = entry.component;
        const key = entry.key || `control-${index}`;

        return <ControlComponent key={key} {...(entry.props || {})} />;
      })}
    </>
  );
}

BoardControls.propTypes = {
  selector: PropTypes.string,
  containers: PropTypes.array,
  activeFilter: PropTypes.shape({
    label: PropTypes.shape({
      type: PropTypes.string,
      termId: PropTypes.string,
      slug: PropTypes.string,
      name: PropTypes.string,
      color: PropTypes.string,
    }),
    assignee: PropTypes.shape({
      type: PropTypes.string,
      id: PropTypes.string,
      displayName: PropTypes.string,
      avatar: PropTypes.string,
    }),
  }),
  activeSearchFilter: PropTypes.shape({
    type: PropTypes.string,
    query: PropTypes.string,
    issueIds: PropTypes.arrayOf(PropTypes.string),
  }),
  searchScopeIssueIds: PropTypes.arrayOf(PropTypes.string),
  onSetFilter: PropTypes.func,
  onClearFilter: PropTypes.func,
  onSetSearchFilter: PropTypes.func,
  onClearSearchFilter: PropTypes.func,
  onAddIssue: PropTypes.func,
  showFilters: PropTypes.bool,
  showAddIssue: PropTypes.bool,
  showInbox: PropTypes.bool,
  showSearch: PropTypes.bool,
};

BoardControls.defaultProps = {
  selector: '#project-board-controls-mount',
  containers: [],
  activeFilter: null,
  activeSearchFilter: null,
  searchScopeIssueIds: [],
  onSetFilter: () => {},
  onClearFilter: () => {},
  onSetSearchFilter: () => {},
  onClearSearchFilter: () => {},
  onAddIssue: () => {},
  showFilters: true,
  showAddIssue: false,
  showInbox: true,
  showSearch: true,
};

export default BoardControls;
