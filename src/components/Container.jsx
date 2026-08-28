const { Card, CardHeader, CardBody, DropdownMenu, TextControl } = wp.components;
const { Heading = wp.components.__experimentalHeading } = wp.components;
const { __ } = wp.i18n;

const { useState, useEffect, useRef } = wp.element;

import DraggableItem from './DraggableItem';
import {
  classesFromDescriptor,
  attrsFromDescriptor,
} from '../utils/dragAttributes';
import useFlipListAnimation from '../hooks/useFlipListAnimation';
import {
  getAbsoluteDropIndexForFilteredContainer,
  shouldDisableBulkContainerActions,
} from '../utils/boardFiltering';
import { getBuiltInContainerMenuControls } from './container/menu-controls';
import { buildContainerMenuControlContext } from '../utils/containerMenuControls';
import { getAdminBarOffset } from '../utils/adminBarOffset';

import PropTypes from 'prop-types';

/**
 * Container component (delegates rename to parent via onRename).
 *
 * @param {Object}   root0                    - Props object
 * @param {number}   root0.id                 - Container ID
 * @param {string}   root0.title              - Container title
 * @param {Array}    root0.items              - Array of items in the container
 * @param {Object}   root0.activeFilter       - Current board filter payload
 * @param {Function} root0.itemMatchesFilter  - Callback to determine item visibility under filter
 * @param {Function} root0.onItemClick        - Callback when item is clicked
 * @param {Function} root0.onMoveAllToNext    - Callback to move all items to next container
 * @param {Function} root0.onDeleteAll        - Callback to delete all items
 * @param {boolean}  root0.canDeleteIssues    - Whether current user can delete issues
 * @param {boolean}  root0.isLastContainer    - Whether this is the last container
 * @param {boolean}  root0.isHidden           - Whether container is hidden
 * @param {string}   root0.focusedContainerId - Focused container identifier
 * @param {boolean}  root0.isFocused          - Whether this container is focused
 * @param {Function} root0.onToggleHidden     - Callback to toggle hidden state
 * @param {Function} root0.onToggleFocus      - Callback to toggle focused state
 * @param {Function} root0.onRename           - Callback to rename container
 * @param {Function} root0.onItemDrop         - Callback for drag-and-drop moves
 * @param {Function} root0.onBulkItemReorder  - Callback for bulk item reordering
 * @param {Function} root0.onAddIssue         - Callback to add a new issue in this column
 * @return {JSX.Element} Container component
 */
function Container({
  id,
  title,
  items,
  activeFilter,
  itemMatchesFilter,
  onItemClick,
  onMoveAllToNext,
  onDeleteAll,
  canDeleteIssues,
  isLastContainer,
  isHidden,
  focusedContainerId,
  isFocused,
  onToggleHidden,
  onToggleFocus,
  onRename,
  onItemDrop,
  onBulkItemReorder,
  onAddIssue,
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [controlsElement, setControlsElement] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [, forceUpdate] = useState(0);
  const hasItems = items.length > 0;
  const isFiltering = !!activeFilter && typeof itemMatchesFilter === 'function';
  const areBulkActionsDisabled = shouldDisableBulkContainerActions({
    hasItems,
    isFiltering,
  });

  const visibleItemEntries = items.reduce((accumulator, item, actualIndex) => {
    if (!isFiltering || itemMatchesFilter(item, activeFilter)) {
      accumulator.push({ item, actualIndex });
    }
    return accumulator;
  }, []);

  const {
    itemRefs,
    startAnimation,
    stopAnimation,
    waitForTransitions,
    isAnimatingRef,
  } = useFlipListAnimation(items, 300, 'ease-out');

  // keep local input in sync if parent updates title
  useEffect(() => {
    setNewTitle(title);
  }, [title]);

  // auto-select when input appears
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const toggleHidden = () => {
    onToggleHidden(id);
  };

  const handleRename = () => {
    setIsRenaming(false);

    if (newTitle.trim() !== '' && newTitle !== title) {
      onRename(id, newTitle);
    } else {
      setNewTitle(title);
    }
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setNewTitle(title);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleRename();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancelRename();
    }
  };

  const menuControls = [
    {
      icon: 'plus',
      title: __('Add Issue In This Column', 'alpaca-issue-tracker'),
      onClick: () => {
        if (onAddIssue) {
          onAddIssue(id);
        }
      },
    },
    {
      icon: isHidden ? 'visibility' : 'hidden',
      title: isHidden
        ? __('Expand Column', 'alpaca-issue-tracker')
        : __('Collapse Column', 'alpaca-issue-tracker'),
      onClick: toggleHidden,
    },
    ...getBuiltInContainerMenuControls({
      containerId: id,
      isFocused,
      onToggleFocus,
    }),
    {
      icon: 'arrow-up-alt',
      title: __('Lift Priority Items', 'alpaca-issue-tracker'),
      isDisabled: areBulkActionsDisabled,
      onClick: () => {
        if (!onBulkItemReorder) {
          return;
        }

        if (isAnimatingRef.current) {
          return;
        }

        // Separate items into priority and non-priority groups.
        const priorityItems = items.filter(
          (item) =>
            item.meta &&
            (item.meta.alpaca_high_priority === '1' ||
              item.meta.alpaca_high_priority === 1 ||
              item.meta.alpaca_high_priority === true),
        );
        const otherItems = items.filter(
          (item) =>
            !(
              item.meta &&
              (item.meta.alpaca_high_priority === '1' ||
                item.meta.alpaca_high_priority === 1 ||
                item.meta.alpaca_high_priority === true)
            ),
        );

        const newItems = [...priorityItems, ...otherItems];
        const movedItemIds = newItems
          .filter((item, index) => items[index] && items[index].id !== item.id)
          .map((item) => item.id);

        if (movedItemIds.length < 1) {
          return;
        }

        startAnimation();

        const runLiftPriorityAnimation = async () => {
          try {
            onBulkItemReorder(
              id,
              newItems.map((item) => item.id),
            );

            await waitForTransitions(movedItemIds);
          } finally {
            stopAnimation();
          }
        };

        runLiftPriorityAnimation();
      },
    },
  ];

  if (!isLastContainer) {
    menuControls.push({
      icon: (
        <span
          className="dashicon dashicons dashicons-arrow-right-alt alpaca-rtl-mirror"
          aria-hidden="true"
        ></span>
      ),
      title: __('Move All To Next Column', 'alpaca-issue-tracker'),
      onClick: () => onMoveAllToNext(id),
      isDisabled: areBulkActionsDisabled,
    });
  }

  if (isLastContainer && canDeleteIssues) {
    menuControls.push({
      icon: 'trash',
      title: __('Delete All', 'alpaca-issue-tracker'),
      isDisabled: areBulkActionsDisabled,
      onClick: () => onDeleteAll(id),
    });
  }

  // Allow third-party code to customize container menu controls.
  const filteredMenuControls = wp.hooks.applyFilters(
    'alpaca.container.menuControls',
    menuControls,
    buildContainerMenuControlContext({
      id,
      title,
      items,
      activeFilter,
      hasItems,
      isLastContainer,
      isHidden,
      focusedContainerId,
      isFocused,
      isFiltering,
      visibleItemEntries,
      itemMatchesFilter,
      areBulkActionsDisabled,
      onMoveAllToNext,
      onDeleteAll,
      onToggleHidden,
      onToggleFocus,
      onRename,
      onBulkItemReorder,
      startAnimation,
      stopAnimation,
      waitForTransitions,
      isAnimatingRef,
    }),
  );

  const containerMenuControls = Array.isArray(filteredMenuControls)
    ? filteredMenuControls
    : menuControls;

  const boardElement = controlsElement
    ? controlsElement.closest('.alpaca-project-board')
    : null;
  const appearance = boardElement
    ? boardElement.getAttribute('data-alpaca-appearance')
    : '';
  const adminBarOffset = getAdminBarOffset(boardElement);
  const menuPopoverClassName = appearance
    ? `alpaca-frontend-column-menu--${appearance}`
    : '';

  /**
   * Check whether an item is marked as high priority.
   *
   * @param {Object} item Item payload.
   * @return {boolean} True when high priority is enabled.
   */
  const isHighPriorityItem = (item) => {
    return Boolean(
      item &&
        item.meta &&
        (item.meta.alpaca_high_priority === '1' ||
          item.meta.alpaca_high_priority === 1 ||
          item.meta.alpaca_high_priority === true),
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);

    // throttle expensive work to avoid jank on large lists
    if (!handleDragOver._last || Date.now() - handleDragOver._last > 50) {
      handleDragOver._last = Date.now();
    } else {
      return;
    }

    // try to read drag payload so we can show a live preview.
    // Prefer dataTransfer, fall back to global state (window.__alpacaDragState).
    let parsed = null;
    try {
      const raw =
        e.dataTransfer.getData('application/json') ||
        e.dataTransfer.getData('text/plain');
      if (raw) parsed = JSON.parse(raw);
    } catch (err) {
      parsed = null;
    }

    if (!parsed && typeof window !== 'undefined') {
      try {
        parsed = window.__alpacaDragState || null;
      } catch (err) {
        parsed = null;
      }
    }

    if (parsed && parsed.itemId) {
      const destIndex = getDropIndex(e);
      setDragOverIndex(destIndex);
      setDragOverItem(parsed);
    } else {
      setDragOverIndex(null);
      setDragOverItem(null);
    }
  };

  const handleDragLeave = (e) => {
    // Only clear when leaving the container element
    if (
      containerRef.current &&
      !containerRef.current.contains(e.relatedTarget)
    ) {
      setIsDragOver(false);
      setDragOverIndex(null);
      setDragOverItem(null);
    }
  };

  // Global dragend listener to catch drops outside any valid container
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      // Force reset of local drag state
      setIsDragOver(false);
      setDragOverIndex(null);
      setDragOverItem(null);
      stopAnimation();

      // Also ensure global state is cleared if not already
      try {
        if (typeof window !== 'undefined' && window.__alpacaDragState) {
          delete window.__alpacaDragState;
        }
      } catch (err) {
        // ignore
      }
      forceUpdate((n) => n + 1);
    };

    window.addEventListener('dragend', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, [stopAnimation]);

  const getDropIndex = (e) => {
    const el = containerRef.current;
    if (!el) {
      return items.length;
    }

    const computedStyle = window.getComputedStyle(el);
    const isFlexContainer =
      computedStyle.display === 'flex' ||
      computedStyle.display === 'inline-flex';
    const isHorizontalLayout =
      isFlexContainer && computedStyle.flexDirection === 'row';

    const children = Array.from(
      el.querySelectorAll(
        '.alpaca-item:not(.empty):not(.placeholder):not(.is-source-hidden)',
      ),
    );

    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();

      if (isHorizontalLayout) {
        if (e.clientX < rect.left + rect.width / 2) {
          return i;
        }
      } else if (e.clientY < rect.top + rect.height / 2) {
        return i;
      }
    }

    return children.length;
  };

  /**
   * Convert a drop index in filtered visible rows to an absolute index
   * in the full container list so hidden rows keep their relative order.
   *
   * @param {number} visibleDropIndex Drop index among visible rows.
   * @return {number} Absolute insertion index in the full list.
   */
  const getAbsoluteDropIndex = (visibleDropIndex) => {
    return getAbsoluteDropIndexForFilteredContainer({
      visibleDropIndex,
      visibleItemEntries,
      itemsLength: items.length,
      isFiltering,
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    // Don't clear global drag state yet; consume it below after calling onItemDrop

    // Read payload from dataTransfer if available, otherwise nothing - caller may rely on payload
    const raw =
      e.dataTransfer.getData('application/json') ||
      e.dataTransfer.getData('text/plain');
    let parsed = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        parsed = null;
      }
    }

    const { itemId, sourceContainerId, sourceIndex } = parsed || {};
    const destIndex = getAbsoluteDropIndex(getDropIndex(e));

    // Clear preview state immediately to avoid temporary hiding of the dropped element
    setDragOverIndex(null);
    setDragOverItem(null);

    if (onItemDrop) {
      onItemDrop({
        itemId,
        sourceContainerId,
        sourceIndex,
        destinationContainerId: id,
        destinationIndex: destIndex,
        destinationVisibleIndex: getDropIndex(e),
      });
    }
    // Now that we've consumed the payload, clear the global drag state so
    // subsequent renders won't treat the source item as hidden and remove any
    // leftover clones from the DOM.
    try {
      if (typeof window !== 'undefined') {
        if (window.__alpacaDragState) delete window.__alpacaDragState;
        // eslint-disable-next-line global-require
        const { removeDragClone } = require('../utils/dragClone');
        try {
          removeDragClone();
        } catch (removeErr) {
          // ignore
        }
      }
    } catch (err) {
      // ignore
    }
  };

  return (
    <Card
      className={`alpaca-container ${
        isHidden ? 'is-collapsed' : ''
      } ${isFocused ? 'alpaca-is-focused-column' : ''}`}
      data-id={id}
    >
      <CardHeader
        className="alpaca-container-header"
        size="xSmall"
        isBorderless
      >
        {isRenaming ? (
          <>
            <TextControl
              className="alpaca-container-title-input"
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              value={newTitle}
              onChange={setNewTitle}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              ref={inputRef}
            />
            <span className="alpaca-item-count">
              {isFiltering
                ? `${visibleItemEntries.length}/${items.length}`
                : items.length}
            </span>
          </>
        ) : (
          <>
            <Heading level={2}>
              <span className="alpaca-container-title">{title}</span>
            </Heading>
            <span className="alpaca-item-count">
              {isFiltering
                ? `${visibleItemEntries.length}/${items.length}`
                : items.length}
            </span>
          </>
        )}

        <div className="alpaca-container-controls" ref={setControlsElement}>
          <span
            className="alpaca-board-tooltip alpaca-column-menu-tooltip"
            data-tooltip={__('Options', 'alpaca-issue-tracker')}
          >
            <DropdownMenu
              icon="menu"
              label={__('Options', 'alpaca-issue-tracker')}
              controls={containerMenuControls}
              toggleProps={{ showTooltip: false }}
              popoverProps={{
                offset: adminBarOffset,
                className: menuPopoverClassName,
              }}
            />
          </span>
        </div>
      </CardHeader>

      <CardBody className="alpaca-container-body" size="xSmall">
        <div
          ref={containerRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`alpaca-items ${isDragOver ? 'dragging-over' : ''}`}
        >
          {(() => {
            const renderList = [];

            // Identify if the dragged item originated from this container
            const draggingId = dragOverItem ? dragOverItem.itemId : null;
            const isSourceContainer =
              dragOverItem &&
              dragOverItem.sourceContainerId &&
              dragOverItem.sourceContainerId.toString() === id.toString();

            let insertAt = items.length;
            let filteredInsertAt = visibleItemEntries.length;
            if (dragOverItem) {
              let idx = dragOverIndex === null ? items.length : dragOverIndex;
              if (isSourceContainer) {
                const sourceIndex = items.findIndex(
                  (i) => i.id.toString() === draggingId?.toString(),
                );
                if (sourceIndex !== -1 && idx >= sourceIndex) {
                  idx += 1;
                }
              }
              insertAt = Math.max(0, Math.min(items.length, idx));

              if (isFiltering) {
                let visibleIdx =
                  dragOverIndex === null
                    ? visibleItemEntries.length
                    : dragOverIndex;

                if (isSourceContainer) {
                  const sourceVisibleIndex = visibleItemEntries.findIndex(
                    ({ item }) => item.id.toString() === draggingId?.toString(),
                  );

                  if (
                    sourceVisibleIndex !== -1 &&
                    visibleIdx >= sourceVisibleIndex
                  ) {
                    visibleIdx += 1;
                  }
                }

                filteredInsertAt = Math.max(
                  0,
                  Math.min(visibleItemEntries.length, visibleIdx),
                );
              }
            }

            const renderPreview = () => {
              const previewIsHighPriority = isHighPriorityItem(dragOverItem);
              const descriptor = dragOverItem && dragOverItem.elementDescriptor;
              const previewClasses = classesFromDescriptor(descriptor, [
                'alpaca-item',
                'placeholder',
                previewIsHighPriority ? 'is-high-priority' : '',
              ]);
              const innerClasses = classesFromDescriptor(descriptor, [
                'alpaca-item-inner',
                previewIsHighPriority ? 'is-high-priority' : '',
              ]);
              const extraAttrs = attrsFromDescriptor(descriptor);

              return (
                <div
                  className={previewClasses}
                  key={`preview-${dragOverItem.itemId}`}
                  {...extraAttrs}
                >
                  {dragOverItem.content ? (
                    <DraggableItem
                      id={-1}
                      index={-1}
                      containerId={id}
                      content={dragOverItem.content}
                      assignees={dragOverItem.assignees}
                      labels={dragOverItem.labels}
                      commentCount={dragOverItem.commentCount}
                      commentCountByAgent={dragOverItem.commentCountByAgent}
                      postDate={dragOverItem.postDate}
                      meta={dragOverItem.meta}
                      className={innerClasses}
                      isDragDisabled={true}
                    />
                  ) : (
                    <div className={innerClasses} {...extraAttrs}>
                      {__('Moving…', 'alpaca-issue-tracker')}
                    </div>
                  )}
                </div>
              );
            };

            if (!dragOverItem) {
              const listHasItems = visibleItemEntries.length > 0;
              if (!listHasItems) {
                if (isFiltering) {
                  return (
                    <div className="alpaca-item empty">
                      {__(
                        'No cards match the active filter.',
                        'alpaca-issue-tracker',
                      )}
                    </div>
                  );
                }

                return (
                  <div className="alpaca-item empty">
                    {__('Drop items here', 'alpaca-issue-tracker')}
                  </div>
                );
              }

              const globalDrag =
                typeof window !== 'undefined' ? window.__alpacaDragState : null;

              return visibleItemEntries.map(({ item, actualIndex }) => {
                const isGlobalSourceHidden =
                  globalDrag &&
                  globalDrag.itemId &&
                  globalDrag.sourceContainerId &&
                  globalDrag.itemId.toString() === item.id.toString() &&
                  globalDrag.sourceContainerId.toString() === id.toString();

                return (
                  <DraggableItem
                    ref={itemRefs.current[item.id]}
                    className={`alpaca-item ${
                      isHighPriorityItem(item) ? 'is-high-priority' : ''
                    } ${isGlobalSourceHidden ? 'is-source-hidden' : ''}`}
                    key={item.id}
                    id={item.id}
                    index={actualIndex}
                    containerId={id}
                    content={item.content}
                    postDate={item.postDate}
                    assignees={item.assignees}
                    labels={item.labels}
                    commentCount={item.commentCount}
                    commentCountByAgent={item.commentCountByAgent}
                    meta={item.meta}
                    onClick={onItemClick}
                  />
                );
              });
            }

            if (isFiltering) {
              for (let i = 0; i <= visibleItemEntries.length; i++) {
                if (i === filteredInsertAt) {
                  renderList.push(renderPreview());
                }

                if (i < visibleItemEntries.length) {
                  const { item, actualIndex } = visibleItemEntries[i];
                  const isSource =
                    isSourceContainer &&
                    item.id.toString() === draggingId?.toString();

                  renderList.push(
                    <DraggableItem
                      ref={itemRefs.current[item.id]}
                      className={`alpaca-item ${
                        isHighPriorityItem(item) ? 'is-high-priority' : ''
                      } ${isSource ? 'is-source-hidden' : ''}`}
                      key={item.id}
                      id={item.id}
                      index={actualIndex}
                      containerId={id}
                      content={item.content}
                      postDate={item.postDate}
                      assignees={item.assignees}
                      labels={item.labels}
                      commentCount={item.commentCount}
                      commentCountByAgent={item.commentCountByAgent}
                      meta={item.meta}
                      onClick={onItemClick}
                    />,
                  );
                }
              }

              return renderList;
            }

            // Dragging IS Active Over This Container (Loop and insert)
            for (let i = 0; i <= items.length; i++) {
              if (i === insertAt) {
                renderList.push(renderPreview());
              }

              if (i < items.length) {
                const item = items[i];
                const isSource =
                  isSourceContainer &&
                  item.id.toString() === draggingId?.toString();

                renderList.push(
                  <DraggableItem
                    ref={itemRefs.current[item.id]}
                    className={`alpaca-item ${
                      isHighPriorityItem(item) ? 'is-high-priority' : ''
                    } ${isSource ? 'is-source-hidden' : ''}`}
                    key={item.id}
                    id={item.id}
                    index={i}
                    containerId={id}
                    content={item.content}
                    postDate={item.postDate}
                    assignees={item.assignees}
                    labels={item.labels}
                    commentCount={item.commentCount}
                    commentCountByAgent={item.commentCountByAgent}
                    meta={item.meta}
                    onClick={onItemClick}
                  />,
                );
              }
            }

            return renderList;
          })()}
        </div>
      </CardBody>
    </Card>
  );
}

Container.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      content: PropTypes.string,
      postDate: PropTypes.string,
      assignees: PropTypes.array,
      labels: PropTypes.array,
      commentCount: PropTypes.number,
      commentCountByAgent: PropTypes.object,
      meta: PropTypes.object,
    }),
  ).isRequired,
  activeFilter: PropTypes.object,
  itemMatchesFilter: PropTypes.func,
  onItemClick: PropTypes.func.isRequired,
  onMoveAllToNext: PropTypes.func.isRequired,
  onDeleteAll: PropTypes.func.isRequired,
  canDeleteIssues: PropTypes.bool,
  isLastContainer: PropTypes.bool.isRequired,
  isHidden: PropTypes.bool.isRequired,
  focusedContainerId: PropTypes.string,
  isFocused: PropTypes.bool,
  onToggleHidden: PropTypes.func.isRequired,
  onToggleFocus: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onItemDrop: PropTypes.func,
  onBulkItemReorder: PropTypes.func,
  onAddIssue: PropTypes.func,
};

Container.defaultProps = {
  canDeleteIssues: false,
};

export default Container;
