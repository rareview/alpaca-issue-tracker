const { useState, useRef, useMemo, useEffect, createPortal } = wp.element;
const { __ } = wp.i18n;
const { Popover } = wp.components;
const {
  ToggleGroupControl: ComponentsToggleGroupControl,
  ToggleGroupControlOption: ComponentsToggleGroupControlOption,
  __experimentalToggleGroupControl,
  __experimentalToggleGroupControlOption,
} = wp.components;

const ToggleGroupControl =
  ComponentsToggleGroupControl || __experimentalToggleGroupControl;
const ToggleGroupControlOption =
  ComponentsToggleGroupControlOption || __experimentalToggleGroupControlOption;

import { getActiveFilter, buildBoardOptions } from '../utils/filters';
import { normalizeLabelColor } from '../utils/labelColor';

import PropTypes from 'prop-types';
import Icon from './icons/Icon';

/**
 * Resolve a readable assignee name from mixed API payload shapes.
 *
 * @param {Object|null} assignee Assignee object.
 * @return {string} Resolved display name.
 */
function getAssigneeDisplayName(assignee) {
  if (!assignee || typeof assignee !== 'object') {
    return '';
  }

  return String(
    assignee.displayName ||
      assignee.display_name ||
      assignee.name ||
      assignee.slug ||
      '',
  );
}

/**
 * Resolve currently selected label filter.
 *
 * @param {Object|null} activeFilter Active filter payload.
 * @return {Object|null} Active label filter.
 */
// use getActiveFilter(activeFilter, 'label'|'assignee'|'deadline') from utils/filters

// deadline resolver moved to src/utils/filters.js:getActiveFilter

/**
 * Render active label trigger content.
 *
 * @param {Object|null} activeLabelFilter Active label filter.
 * @return {JSX.Element} Trigger label content.
 */
function renderLabelTriggerLabel(activeLabelFilter) {
  if (!activeLabelFilter) {
    return (
      <>
        <Icon
          name="tag"
          className="alpaca-filter-control-icon"
          aria-hidden="true"
        />
        <span>{__('Label', 'alpaca-issue-tracker')}</span>
      </>
    );
  }

  return (
    <span
      className="alpaca-filter-control-current alpaca-label-pill"
      style={{
        backgroundColor: normalizeLabelColor(activeLabelFilter.color),
        color: '#fff',
      }}
    >
      {activeLabelFilter.name || __('Label', 'alpaca-issue-tracker')}
    </span>
  );
}

/**
 * Render active assignee trigger content.
 *
 * @param {Object|null} activeAssigneeFilter Active assignee filter.
 * @return {JSX.Element} Trigger label content.
 */
function renderAssigneeTriggerLabel(activeAssigneeFilter) {
  if (!activeAssigneeFilter) {
    return (
      <>
        <Icon
          name="person"
          className="alpaca-filter-control-icon"
          aria-hidden="true"
        />
        <span>{__('Assignee', 'alpaca-issue-tracker')}</span>
      </>
    );
  }

  return (
    <span className="alpaca-filter-control-current alpaca-filter-control-current-assignee">
      {activeAssigneeFilter.avatar ? (
        <img
          className="alpaca-filter-control-avatar"
          src={activeAssigneeFilter.avatar}
          alt=""
          aria-hidden="true"
        />
      ) : (
        <Icon
          name="person"
          className="alpaca-filter-control-icon"
          aria-hidden="true"
        />
      )}
      <span className="alpaca-filter-control-current-text">
        {activeAssigneeFilter.displayName ||
          __('Assignee', 'alpaca-issue-tracker')}
      </span>
    </span>
  );
}

/**
 * Board filter control mounted in board controls row.
 *
 * @param {Object}   root0               Component props.
 * @param {string}   root0.selector      Controls mount selector.
 * @param {Array}    root0.containers    Board container data.
 * @param {Object}   root0.activeFilter  Current active filter.
 * @param {Function} root0.onSetFilter   Set filter callback.
 * @param {Function} root0.onClearFilter Clear filter callback.
 * @return {JSX.Element|null} Filter control portal.
 */
function BoardFilterControl({
  selector,
  containers,
  activeFilter,
  onSetFilter,
  onClearFilter,
}) {
  const [openPopoverType, setOpenPopoverType] = useState('');
  const labelTriggerRef = useRef(null);
  const assigneeTriggerRef = useRef(null);
  const deadlineTriggerRef = useRef(null);

  const { labels, assignees } = useMemo(
    () => buildBoardOptions(containers),
    [containers],
  );

  useEffect(() => {
    if (!openPopoverType || typeof document === 'undefined') {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const target = event.target;

      if (!target) {
        return;
      }

      if (
        (labelTriggerRef.current && labelTriggerRef.current.contains(target)) ||
        (assigneeTriggerRef.current &&
          assigneeTriggerRef.current.contains(target)) ||
        (deadlineTriggerRef.current &&
          deadlineTriggerRef.current.contains(target))
      ) {
        return;
      }

      const popoverNodes = Array.from(
        document.querySelectorAll('.alpaca-filter-control-popover'),
      );
      const clickedInsidePopover = popoverNodes.some(
        (popoverNode) => popoverNode && popoverNode.contains(target),
      );

      if (clickedInsidePopover) {
        return;
      }

      setOpenPopoverType('');
    };

    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('touchstart', handlePointerDown, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('touchstart', handlePointerDown, true);
    };
  }, [openPopoverType]);

  if (typeof document === 'undefined' || typeof createPortal !== 'function') {
    return null;
  }

  const mountNode = document.querySelector(selector);
  if (!mountNode) {
    return null;
  }

  const hasLabelOptions = labels.length > 0;
  const hasAssigneeOptions = assignees.length > 0;
  const activeLabelFilter = getActiveFilter(activeFilter, 'label');
  const activeAssigneeFilter = getActiveFilter(activeFilter, 'assignee');
  const activeDeadlineFilter = getActiveFilter(activeFilter, 'deadline');

  const hasDeadlineControl =
    typeof ToggleGroupControl !== 'undefined' &&
    typeof ToggleGroupControlOption !== 'undefined';
  const isDeadlineOpen = openPopoverType === 'deadline';
  const isDeadlineActive = !!activeDeadlineFilter;
  const showActiveDeadlineChrome = isDeadlineActive && !isDeadlineOpen;
  const currentDeadlineLabel = activeDeadlineFilter?.state
    ? activeDeadlineFilter.state.charAt(0).toUpperCase() +
      activeDeadlineFilter.state.slice(1)
    : __('Due Date', 'alpaca-issue-tracker');

  /**
   * Render a filter control with trigger, clear, and popover content.
   *
   * @param {Object}   config                Control config.
   * @param {string}   config.filterType     Filter type.
   * @param {string}   config.tooltipLabel   Tooltip label.
   * @param {Object}   config.activeValue    Active filter value.
   * @param {boolean}  config.hasOptionItems Whether popover has options.
   * @param {Object}   config.triggerRef     Trigger ref.
   * @param {Function} config.renderTrigger  Trigger content renderer.
   * @param {Function} config.renderPopover  Popover content renderer.
   * @return {JSX.Element}                    Control markup.
   */
  const renderFilterControl = ({
    filterType,
    tooltipLabel,
    activeValue,
    hasOptionItems,
    triggerRef,
    renderTrigger,
    renderPopover,
  }) => {
    const isOpen = openPopoverType === filterType;

    return (
      <div
        className={`alpaca-board-filter-control ${activeValue ? 'is-active-filter alpaca-board-control' : ''}`}
      >
        <span
          className="alpaca-board-tooltip"
          data-tooltip={tooltipLabel}
        >
          <button
            type="button"
            className={`alpaca-filter-control-trigger alpaca-board-control ${isOpen ? 'is-open' : ''}`}
            onClick={() =>
              setOpenPopoverType((previousType) =>
                previousType === filterType ? '' : filterType,
              )
            }
            ref={triggerRef}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            title={tooltipLabel}
          >
            {renderTrigger(activeValue)}
          </button>
        </span>

        {activeValue ? (
          <button
            type="button"
            className="alpaca-filter-control-clear"
            onClick={(event) => {
              event.stopPropagation();
              onClearFilter(filterType);
              setOpenPopoverType('');
            }}
            aria-label={__('Clear filter', 'alpaca-issue-tracker')}
          >
            <span className="dashicons dashicons-no-alt" aria-hidden="true" />
          </button>
        ) : null}

        {isOpen && triggerRef.current ? (
          <Popover
            anchor={triggerRef.current}
            position="bottom left"
            className="alpaca-filter-control-popover"
            onClose={() => setOpenPopoverType('')}
            onFocusOutside={() => setOpenPopoverType('')}
            onEscape={() => setOpenPopoverType('')}
            focusOnMount={false}
            animate={false}
          >
            <div className="alpaca-filter-control-popover-content">
              {!hasOptionItems ? (
                <p className="alpaca-filter-control-empty">
                  {__(
                    'No options found on board cards.',
                    'alpaca-issue-tracker',
                  )}
                </p>
              ) : null}
              {hasOptionItems ? renderPopover() : null}
            </div>
          </Popover>
        ) : null}
      </div>
    );
  };

  return createPortal(
    <>
      {renderFilterControl({
        filterType: 'label',
        tooltipLabel: __('Label', 'alpaca-issue-tracker'),
        activeValue: activeLabelFilter,
        hasOptionItems: hasLabelOptions,
        triggerRef: labelTriggerRef,
        renderTrigger: renderLabelTriggerLabel,
        renderPopover: () => (
          <section className="alpaca-filter-control-section">
            <h3 className="alpaca-filter-control-section-title">
              {__('Labels', 'alpaca-issue-tracker')}
            </h3>
            <div className="alpaca-filter-control-inline-list">
              {labels.map((label) => (
                <button
                  type="button"
                  key={
                    [label.termId, label.slug, label.name]
                      .filter(Boolean)
                      .join('-') || label.name
                  }
                  className="alpaca-filter-control-option"
                  onClick={() => {
                    onSetFilter({
                      filterType: 'label',
                      termId: label.termId,
                      slug: label.slug,
                      name: label.name,
                      color: label.color,
                    });
                    setOpenPopoverType('');
                  }}
                >
                  <span
                    className="alpaca-label-pill"
                    style={{
                      backgroundColor: normalizeLabelColor(label.color),
                      color: '#fff',
                    }}
                  >
                    {label.name || label.slug || label.termId}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ),
      })}

      {renderFilterControl({
        filterType: 'assignee',
        tooltipLabel: __('Assignee', 'alpaca-issue-tracker'),
        activeValue: activeAssigneeFilter,
        hasOptionItems: hasAssigneeOptions,
        triggerRef: assigneeTriggerRef,
        renderTrigger: renderAssigneeTriggerLabel,
        renderPopover: () => (
          <section className="alpaca-filter-control-section">
            <h3 className="alpaca-filter-control-section-title">
              {__('Assignees', 'alpaca-issue-tracker')}
            </h3>
            <div className="alpaca-filter-control-inline-list">
              {assignees.map((assignee) => (
                <button
                  type="button"
                  key={assignee.id}
                  className="alpaca-filter-control-option alpaca-filter-control-assignee-option"
                  onClick={() => {
                    onSetFilter({
                      filterType: 'assignee',
                      id: assignee.id,
                      displayName: getAssigneeDisplayName(assignee),
                      avatar: assignee.avatar,
                    });
                    setOpenPopoverType('');
                  }}
                >
                  <span className="alpaca-user alpaca-flex-align">
                    {assignee.avatar ? (
                      <span className="alpaca-user-avatar">
                        <img src={assignee.avatar} alt="" aria-hidden="true" />
                      </span>
                    ) : null}
                    <span className="alpaca-user-name">
                      {getAssigneeDisplayName(assignee) ||
                        __('Assignee', 'alpaca-issue-tracker')}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ),
      })}

      {hasDeadlineControl ? (
        <div
          className={`alpaca-board-filter-control alpaca-deadline-filter-control ${showActiveDeadlineChrome ? 'is-active-filter alpaca-board-control' : ''}`}
        >
          <span
            className="alpaca-board-tooltip"
            data-tooltip={__('Due Date', 'alpaca-issue-tracker')}
          >
            <button
              type="button"
              className={`alpaca-filter-control-trigger alpaca-board-control ${isDeadlineOpen ? 'is-open' : ''}`}
              onClick={() =>
                setOpenPopoverType((previousType) =>
                  previousType === 'deadline' ? '' : 'deadline',
                )
              }
              ref={deadlineTriggerRef}
              aria-expanded={isDeadlineOpen}
              aria-haspopup="dialog"
              title={__('Due Date', 'alpaca-issue-tracker')}
            >
              {showActiveDeadlineChrome ? (
                <span className="alpaca-filter-control-current alpaca-filter-control-current-text">
                  {currentDeadlineLabel}
                </span>
              ) : (
                <span className="alpaca-filter-control-trigger-content">
                  <span
                    className="dashicons dashicons-calendar-alt alpaca-filter-control-icon"
                    aria-hidden="true"
                  />
                  <span>{__('Due Date', 'alpaca-issue-tracker')}</span>
                </span>
              )}
            </button>
          </span>

          {showActiveDeadlineChrome ? (
            <button
              type="button"
              className="alpaca-filter-control-clear"
              onClick={(event) => {
                event.stopPropagation();
                onClearFilter('deadline');
                setOpenPopoverType('');
              }}
              aria-label={__('Reset deadline filter', 'alpaca-issue-tracker')}
            >
              <span className="dashicons dashicons-no-alt" aria-hidden="true" />
            </button>
          ) : null}

          {isDeadlineOpen && deadlineTriggerRef.current ? (
            <Popover
              anchor={deadlineTriggerRef.current}
              position="bottom left"
              className="alpaca-filter-control-popover alpaca-deadline-filter-popover"
              onClose={() => setOpenPopoverType('')}
              onFocusOutside={() => setOpenPopoverType('')}
              onEscape={() => setOpenPopoverType('')}
              focusOnMount={false}
              animate={false}
            >
              <div className="alpaca-filter-control-popover-content">
                <section className="alpaca-filter-control-section">
                  <h3 className="alpaca-filter-control-section-title">
                    {__('Deadline state', 'alpaca-issue-tracker')}
                  </h3>
                  <ToggleGroupControl
                    label={__('Show cards that are', 'alpaca-issue-tracker')}
                    value={
                      activeDeadlineFilter ? activeDeadlineFilter.state : ''
                    }
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                    onChange={(value) => {
                      onSetFilter({
                        filterType: 'deadline',
                        state: value || '',
                      });
                      setOpenPopoverType('');
                    }}
                    isBlock
                    hideLabelFromVision
                  >
                    <ToggleGroupControlOption
                      value="soon"
                      label={__('Soon', 'alpaca-issue-tracker')}
                    />
                    <ToggleGroupControlOption
                      value="today"
                      label={__('Today', 'alpaca-issue-tracker')}
                    />
                    <ToggleGroupControlOption
                      value="late"
                      label={__('Late', 'alpaca-issue-tracker')}
                    />
                  </ToggleGroupControl>
                </section>
              </div>
            </Popover>
          ) : null}
        </div>
      ) : null}
    </>,
    mountNode,
  );
}

BoardFilterControl.propTypes = {
  selector: PropTypes.string,
  containers: PropTypes.array,
  activeFilter: PropTypes.shape({
    type: PropTypes.string,
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
    deadline: PropTypes.shape({
      type: PropTypes.string,
      state: PropTypes.string,
    }),
  }),
  onSetFilter: PropTypes.func,
  onClearFilter: PropTypes.func,
};

BoardFilterControl.defaultProps = {
  selector: '#project-board-controls-mount',
  containers: [],
  activeFilter: null,
  onSetFilter: () => {},
  onClearFilter: () => {},
};

export default BoardFilterControl;
