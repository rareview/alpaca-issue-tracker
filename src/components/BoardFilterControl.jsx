const { useState, useRef, useMemo, useEffect, createPortal } = wp.element;
const { __ } = wp.i18n;
const { Popover, Tooltip } = wp.components;

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
function getActiveLabelFilter(activeFilter) {
  if (!activeFilter || typeof activeFilter !== 'object') {
    return null;
  }

  if (activeFilter.label && typeof activeFilter.label === 'object') {
    return activeFilter.label;
  }

  if ('label' === activeFilter.type) {
    return activeFilter;
  }

  return null;
}

/**
 * Resolve currently selected assignee filter.
 *
 * @param {Object|null} activeFilter Active filter payload.
 * @return {Object|null} Active assignee filter.
 */
function getActiveAssigneeFilter(activeFilter) {
  if (!activeFilter || typeof activeFilter !== 'object') {
    return null;
  }

  if (activeFilter.assignee && typeof activeFilter.assignee === 'object') {
    return activeFilter.assignee;
  }

  if ('assignee' === activeFilter.type) {
    return activeFilter;
  }

  return null;
}

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
        <span>{__('Label', 'alpaca')}</span>
      </>
    );
  }

  return (
    <span
      className="alpaca-filter-control-current alpaca-label-pill"
      style={{
        backgroundColor: activeLabelFilter.color || '#172b4d',
        color: '#fff',
      }}
    >
      {activeLabelFilter.name || __('Label', 'alpaca')}
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
        <span>{__('Assignee', 'alpaca')}</span>
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
        {activeAssigneeFilter.displayName || __('Assignee', 'alpaca')}
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

  const { labels, assignees } = useMemo(() => {
    const labelsMap = new Map();
    const assigneesMap = new Map();

    containers.forEach((container) => {
      const items = Array.isArray(container.items) ? container.items : [];

      items.forEach((item) => {
        const itemLabels = Array.isArray(item.labels) ? item.labels : [];
        itemLabels.forEach((label) => {
          if (!label || typeof label !== 'object') {
            return;
          }

          const labelName = label.name ? String(label.name) : '';
          const labelSlug = label.slug ? String(label.slug) : '';
          const labelTermId =
            typeof label.term_id !== 'undefined' && label.term_id !== null
              ? String(label.term_id)
              : '';

          const labelKey = labelTermId || labelSlug || labelName.toLowerCase();
          if (!labelKey || labelsMap.has(labelKey)) {
            return;
          }

          labelsMap.set(labelKey, {
            termId: labelTermId,
            slug: labelSlug,
            name: labelName,
            color: label.color || null,
          });
        });

        const itemAssignees = Array.isArray(item.assignees)
          ? item.assignees
          : [];
        itemAssignees.forEach((assignee) => {
          if (
            !assignee ||
            typeof assignee.id === 'undefined' ||
            assignee.id === null
          ) {
            return;
          }

          const assigneeId = String(assignee.id);
          const existingAssignee = assigneesMap.get(assigneeId);

          if (
            existingAssignee &&
            existingAssignee.displayName &&
            existingAssignee.avatar
          ) {
            return;
          }

          assigneesMap.set(assigneeId, {
            id: assigneeId,
            displayName:
              getAssigneeDisplayName(assignee) ||
              existingAssignee?.displayName ||
              '',
            avatar:
              assignee.avatar ||
              (assignee.avatar_urls && assignee.avatar_urls[96]) ||
              existingAssignee?.avatar ||
              null,
          });
        });
      });
    });

    return {
      labels: Array.from(labelsMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      assignees: Array.from(assigneesMap.values()).sort((a, b) =>
        a.displayName.localeCompare(b.displayName),
      ),
    };
  }, [containers]);

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
          assigneeTriggerRef.current.contains(target))
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
  const activeLabelFilter = getActiveLabelFilter(activeFilter);
  const activeAssigneeFilter = getActiveAssigneeFilter(activeFilter);

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
        <Tooltip text={tooltipLabel}>
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
          >
            {renderTrigger(activeValue)}
          </button>
        </Tooltip>

        {activeValue ? (
          <button
            type="button"
            className="alpaca-filter-control-clear"
            onClick={(event) => {
              event.stopPropagation();
              onClearFilter(filterType);
              setOpenPopoverType('');
            }}
            aria-label={__('Clear filter', 'alpaca')}
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
                  {__('No options found on board cards.', 'alpaca')}
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
        tooltipLabel: __('Label', 'alpaca'),
        activeValue: activeLabelFilter,
        hasOptionItems: hasLabelOptions,
        triggerRef: labelTriggerRef,
        renderTrigger: renderLabelTriggerLabel,
        renderPopover: () => (
          <section className="alpaca-filter-control-section">
            <h3 className="alpaca-filter-control-section-title">
              {__('Labels', 'alpaca')}
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
                      backgroundColor: label.color || '#172b4d',
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
        tooltipLabel: __('Assignee', 'alpaca'),
        activeValue: activeAssigneeFilter,
        hasOptionItems: hasAssigneeOptions,
        triggerRef: assigneeTriggerRef,
        renderTrigger: renderAssigneeTriggerLabel,
        renderPopover: () => (
          <section className="alpaca-filter-control-section">
            <h3 className="alpaca-filter-control-section-title">
              {__('Assignees', 'alpaca')}
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
                  <span className="alpaca-user flexalign">
                    {assignee.avatar ? (
                      <span className="alpaca-user-avatar">
                        <img src={assignee.avatar} alt="" aria-hidden="true" />
                      </span>
                    ) : null}
                    <span className="alpaca-user-name">
                      {getAssigneeDisplayName(assignee) ||
                        __('Assignee', 'alpaca')}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ),
      })}
    </>,
    mountNode,
  );
}

BoardFilterControl.propTypes = {
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
