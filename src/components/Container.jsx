const { Card, CardHeader, CardBody, DropdownMenu, TextControl } = wp.components;
const { Heading = wp.components.__experimentalHeading } = wp.components;
const { __ } = wp.i18n;

const { useState, useEffect, useRef } = wp.element;

import DraggableItem from './DraggableItem';
import Item from './Item';
import PropTypes from 'prop-types';

/**
 * Container component (delegates rename to parent via onRename).
 *
 * @param {Object}   root0                 - Props object
 * @param {number}   root0.id              - Container ID
 * @param {string}   root0.title           - Container title
 * @param {Array}    root0.items           - Array of items in the container
 * @param {Function} root0.onItemClick     - Callback when item is clicked
 * @param {Function} root0.onMoveAllToNext - Callback to move all items to next container
 * @param {Function} root0.onDeleteAll     - Callback to delete all items
 * @param {boolean}  root0.isLastContainer - Whether this is the last container
 * @param {boolean}  root0.isHidden        - Whether container is hidden
 * @param {Function} root0.onToggleHidden  - Callback to toggle hidden state
 * @param {Function} root0.onRename        - Callback to rename container
 * @param {Function} root0.onItemDrop
 * @return {JSX.Element} Container component
 */
function Container({
  id,
  title,
  items,
  onItemClick,
  onMoveAllToNext,
  onDeleteAll,
  isLastContainer,
  isHidden,
  onToggleHidden,
  onRename,
  onItemDrop,
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const hasItems = items.length > 0;

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
      icon: 'edit',
      title: __('Rename', 'alpaca'),
      onClick: () => {
        setNewTitle(title);
        setIsRenaming(true);
      },
    },
    {
      icon: isHidden ? 'visibility' : 'hidden',
      title: isHidden ? 'Expand Column' : 'Collapse Column',
      onClick: toggleHidden,
    },
    {
      icon: 'arrow-up-alt',
      title: __('Lift Priority Items', 'alpaca'),
      onClick: () => {
        if (!onItemDrop) {
          return;
        }

        // Separate items into priority and non-priority groups, preserving original order.
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

        // This is the desired final state of the items array.
        const newItems = [...priorityItems, ...otherItems];

        // A local copy of the items array to simulate the moves and find the correct source index for each step.
        const currentItemsState = [...items];

        // Iterate through the desired final list and move items into place one by one.
        for (let i = 0; i < newItems.length; i++) {
          const desiredItem = newItems[i];
          const currentIndex = currentItemsState.findIndex(
            (item) => item.id === desiredItem.id,
          );

          // If the item is not in its correct final position, move it.
          if (currentIndex !== i) {
            onItemDrop({
              itemId: desiredItem.id,
              sourceContainerId: id,
              sourceIndex: currentIndex,
              destinationContainerId: id,
              destinationIndex: i,
            });

            // Update our local state representation to reflect the move for the next iteration.
            const [movedItem] = currentItemsState.splice(currentIndex, 1);
            currentItemsState.splice(i, 0, movedItem);
          }
        }
      },
    },
  ];

  if (!isLastContainer) {
    menuControls.push({
      icon: 'arrow-right-alt',
      title: __('Move All To Next Column', 'alpaca'),
      onClick: () => onMoveAllToNext(id),
      disabled: !hasItems,
    });
  }

  if (isLastContainer) {
    menuControls.push({
      icon: 'trash',
      title: __('Delete All', 'alpaca'),
      onClick: () => onDeleteAll(id),
    });
  }

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

  const getDropIndex = (e) => {
    const el = containerRef.current;
    if (!el) return items.length;
    const children = Array.from(
      el.querySelectorAll('.alpaca-item:not(.empty)'),
    );
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) return i;
    }
    return children.length;
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
    const destIndex = getDropIndex(e);

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
      className={`alpaca-container ${isHidden ? 'hidden' : ''}`}
      data-id={id}
    >
      <CardHeader
        className="alpaca-container-header"
        size="xSmall"
        isBorderless
      >
        {isRenaming ? (
          <TextControl
            className="alpaca-container-title-input"
            value={newTitle}
            onChange={setNewTitle}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
        ) : (
          <Heading level={2}>
            {title} <span className="alpaca-item-count">{items.length}</span>
          </Heading>
        )}

        <div className="alpaca-container-controls">
          <DropdownMenu
            icon="menu"
            label={__('Options', 'alpaca')}
            controls={menuControls}
          />
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
            // If there's an active drag preview, render the previewed list (remove source item if same container)
            if (dragOverItem) {
              const itemIdStr = dragOverItem.itemId?.toString();
              let previewItems = items;
              if (
                dragOverItem.sourceContainerId &&
                dragOverItem.sourceContainerId.toString() === id.toString()
              ) {
                previewItems = items.filter((it) => it.id !== itemIdStr);
              }

              const insertAt = Math.max(
                0,
                Math.min(
                  previewItems.length,
                  dragOverIndex === null ? previewItems.length : dragOverIndex,
                ),
              );

              return (
                <>
                  {previewItems.slice(0, insertAt).map((item, index) => (
                    <DraggableItem
                      className="alpaca-item"
                      key={item.id}
                      id={item.id}
                      index={index}
                      containerId={id}
                      content={item.content}
                      postDate={item.postDate}
                      assignees={item.assignees}
                      commentCount={item.commentCount}
                      meta={item.meta}
                      onClick={onItemClick}
                    />
                  ))}

                  <div
                    className="alpaca-item placeholder"
                    key={`placeholder-${dragOverItem.itemId}`}
                  >
                    {dragOverItem.content ? (
                      <Item
                        content={dragOverItem.content}
                        assignees={dragOverItem.assignees}
                        commentCount={dragOverItem.commentCount}
                        postDate={dragOverItem.postDate}
                        meta={dragOverItem.meta}
                        className="alpaca-item-inner"
                      />
                    ) : (
                      <div className="alpaca-item-inner">
                        {__('Moving…', 'alpaca')}
                      </div>
                    )}
                  </div>

                  {previewItems.slice(insertAt).map((item, index) => (
                    <DraggableItem
                      className="alpaca-item"
                      key={item.id}
                      id={item.id}
                      index={insertAt + index}
                      containerId={id}
                      content={item.content}
                      postDate={item.postDate}
                      assignees={item.assignees}
                      commentCount={item.commentCount}
                      meta={item.meta}
                      onClick={onItemClick}
                    />
                  ))}
                </>
              );
            }

            return hasItems ? (
              (() => {
                const globalDrag =
                  typeof window !== 'undefined'
                    ? window.__alpacaDragState
                    : null;
                return items.map((item, index) => {
                  const isSourceHidden =
                    globalDrag &&
                    globalDrag.itemId &&
                    globalDrag.sourceContainerId &&
                    globalDrag.itemId.toString() === item.id.toString() &&
                    globalDrag.sourceContainerId.toString() === id.toString();

                  if (isSourceHidden) {
                    return (
                      <div className="alpaca-item" key={item.id}>
                        <Item
                          id={item.id}
                          content={item.content}
                          assignees={item.assignees}
                          commentCount={item.commentCount}
                          meta={item.meta}
                          className="alpaca-item-inner"
                          style={{ visibility: 'hidden' }}
                        />
                      </div>
                    );
                  }

                  return (
                    <DraggableItem
                      className="alpaca-item"
                      key={item.id}
                      id={item.id}
                      index={index}
                      containerId={id}
                      content={item.content}
                      postDate={item.postDate}
                      assignees={item.assignees}
                      commentCount={item.commentCount}
                      meta={item.meta}
                      onClick={onItemClick}
                    />
                  );
                });
              })()
            ) : (
              <div className="alpaca-item empty">
                {__('Drop items here', 'alpaca')}
              </div>
            );
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
      commentCount: PropTypes.number,
      meta: PropTypes.object,
    }),
  ).isRequired,
  onItemClick: PropTypes.func.isRequired,
  onMoveAllToNext: PropTypes.func.isRequired,
  onDeleteAll: PropTypes.func.isRequired,
  isLastContainer: PropTypes.bool.isRequired,
  isHidden: PropTypes.bool.isRequired,
  onToggleHidden: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onItemDrop: PropTypes.func,
};

export default Container;
