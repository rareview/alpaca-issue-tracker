const { useState, useRef, useMemo, createPortal } = wp.element;
const { __ } = wp.i18n;
const { Popover, Tooltip } = wp.components;

import PropTypes from 'prop-types';

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
 * Render active filter label for the trigger button.
 *
 * @param {Object|null} activeFilter Current filter object.
 * @return {JSX.Element} Trigger label content.
 */
function renderTriggerLabel(activeFilter) {
  if (!activeFilter) {
    return <span>{__('Filter', 'alpaca')}</span>;
  }

  if ('assignee' === activeFilter.type) {
    return (
      <span className="alpaca-filter-control-current alpaca-filter-control-current-assignee">
        {activeFilter.avatar ? (
          <img
            className="alpaca-filter-control-avatar"
            src={activeFilter.avatar}
            alt=""
            aria-hidden="true"
          />
        ) : null}
        <span className="alpaca-filter-control-current-text">
          {activeFilter.displayName || __('Assignee', 'alpaca')}
        </span>
      </span>
    );
  }

  return (
    <span
      className="alpaca-filter-control-current alpaca-label-pill"
      style={{
        backgroundColor: activeFilter.color || '#172b4d',
        color: '#fff',
      }}
    >
      {activeFilter.name || __('Label', 'alpaca')}
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
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

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

  if (typeof document === 'undefined' || typeof createPortal !== 'function') {
    return null;
  }

  const mountNode = document.querySelector(selector);
  if (!mountNode) {
    return null;
  }

  const hasOptions = labels.length > 0 || assignees.length > 0;

  return createPortal(
    <div
      className={`alpaca-board-filter-control ${activeFilter ? 'is-active-filter alpaca-board-control' : ''}`}
    >
      <Tooltip text={__('Filter', 'alpaca')}>
        <button
          type="button"
          className={`alpaca-filter-control-trigger ${isOpen ? 'is-open' : ''}`}
          onClick={() => setIsOpen((previous) => !previous)}
          ref={triggerRef}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          {activeFilter ? (
            renderTriggerLabel(activeFilter)
          ) : (
            <>
              <span className="dashicons dashicons-filter" aria-hidden="true" />
              <span className="screen-reader-text">
                {__('Filter', 'alpaca')}
              </span>
            </>
          )}
        </button>
      </Tooltip>

      {activeFilter ? (
        <button
          type="button"
          className="alpaca-filter-control-clear"
          onClick={(event) => {
            event.stopPropagation();
            onClearFilter();
            setIsOpen(false);
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
          onClose={() => setIsOpen(false)}
          onFocusOutside={() => setIsOpen(false)}
          onEscape={() => setIsOpen(false)}
          focusOnMount={false}
          animate={false}
        >
          <div className="alpaca-filter-control-popover-content">
            {!hasOptions ? (
              <p className="alpaca-filter-control-empty">
                {__('No labels or assignees found on board cards.', 'alpaca')}
              </p>
            ) : null}

            {labels.length > 0 ? (
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
                          type: 'label',
                          termId: label.termId,
                          slug: label.slug,
                          name: label.name,
                          color: label.color,
                        });
                        setIsOpen(false);
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
            ) : null}

            {assignees.length > 0 ? (
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
                          type: 'assignee',
                          id: assignee.id,
                          displayName: getAssigneeDisplayName(assignee),
                          avatar: assignee.avatar,
                        });
                        setIsOpen(false);
                      }}
                    >
                      <span className="alpaca-user flexalign">
                        {assignee.avatar ? (
                          <span className="alpaca-user-avatar">
                            <img
                              src={assignee.avatar}
                              alt=""
                              aria-hidden="true"
                            />
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
            ) : null}
          </div>
        </Popover>
      ) : null}
    </div>,
    mountNode,
  );
}

BoardFilterControl.propTypes = {
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

BoardFilterControl.defaultProps = {
  selector: '#project-board-controls-mount',
  containers: [],
  activeFilter: null,
  onSetFilter: () => {},
  onClearFilter: () => {},
};

export default BoardFilterControl;
