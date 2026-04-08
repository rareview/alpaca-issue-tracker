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
 * @param {Object}   root0               Component props.
 * @param {string}   root0.selector      Controls mount selector.
 * @param {Array}    root0.containers    Board container data.
 * @param {Object}   root0.activeFilter  Current active board filter.
 * @param {Function} root0.onSetFilter   Set filter callback.
 * @param {Function} root0.onClearFilter Clear filter callback.
 * @return {JSX.Element} Rendered board controls.
 */
function BoardControls({
  selector,
  containers,
  activeFilter,
  onSetFilter,
  onClearFilter,
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
        props: { selector },
      },
    ],
    [selector, containers, activeFilter, onSetFilter, onClearFilter],
  );

  const controls = applyFilters('alpaca.board.controls', defaultControls, {
    selector,
    containers,
    activeFilter,
    onSetFilter,
    onClearFilter,
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
  onSetFilter: PropTypes.func,
  onClearFilter: PropTypes.func,
};

BoardControls.defaultProps = {
  selector: '#project-board-controls-mount',
  containers: [],
  activeFilter: null,
  onSetFilter: () => {},
  onClearFilter: () => {},
};

export default BoardControls;
