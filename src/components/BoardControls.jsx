const { useEffect, useMemo } = wp.element;
const { applyFilters, doAction } = wp.hooks;

import PropTypes from 'prop-types';

import InboxControl from './InboxControl';
import BoardFilterControl from './BoardFilterControl';
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
 * @param {Function} props.onSetFilter         Set filter callback.
 * @param {Function} props.onClearFilter       Clear filter callback.
 * @param {Function} props.onSetSearchFilter   Set search filter callback.
 * @param {Function} props.onClearSearchFilter Clear search filter callback.
 * @return {JSX.Element} Rendered board controls.
 */
function BoardControls({
  selector,
  containers,
  activeFilter,
  activeSearchFilter,
  onSetFilter,
  onClearFilter,
  onSetSearchFilter,
  onClearSearchFilter,
}) {
  const defaultControls = useMemo(
    () => [
      {
        key: 'inbox',
        component: InboxControl,
        props: { selector },
      },
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
      {
        key: 'search',
        component: SearchPortal,
        props: {
          selector,
          containers,
          activeSearchFilter,
          onSetSearchFilter,
          onClearSearchFilter,
        },
      },
    ],
    [
      selector,
      containers,
      activeFilter,
      activeSearchFilter,
      onSetFilter,
      onClearFilter,
      onSetSearchFilter,
      onClearSearchFilter,
    ],
  );

  const controls = applyFilters('alpaca.board.controls', defaultControls, {
    selector,
    containers,
    activeFilter,
    activeSearchFilter,
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
    type: PropTypes.string,
    id: PropTypes.string,
    displayName: PropTypes.string,
    avatar: PropTypes.string,
    termId: PropTypes.string,
    slug: PropTypes.string,
    name: PropTypes.string,
    color: PropTypes.string,
  }),
  activeSearchFilter: PropTypes.shape({
    type: PropTypes.string,
    query: PropTypes.string,
    issueIds: PropTypes.arrayOf(PropTypes.string),
  }),
  onSetFilter: PropTypes.func,
  onClearFilter: PropTypes.func,
  onSetSearchFilter: PropTypes.func,
  onClearSearchFilter: PropTypes.func,
};

BoardControls.defaultProps = {
  selector: '#project-board-controls-mount',
  containers: [],
  activeFilter: null,
  activeSearchFilter: null,
  onSetFilter: () => {},
  onClearFilter: () => {},
  onSetSearchFilter: () => {},
  onClearSearchFilter: () => {},
};

export default BoardControls;
