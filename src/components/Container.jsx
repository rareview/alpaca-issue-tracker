const { Card, CardHeader, CardBody, DropdownMenu, TextControl } = wp.components;
const { Heading = wp.components.__experimentalHeading } = wp.components;

const { useState, useEffect, useRef } = wp.element;

import DraggableItem from './DraggableItem';
import Item from './Item';
import PropTypes from 'prop-types';
import { useDragState } from '../context/DragContext';
import { removeDragClone } from '../utils/dragClone';

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
  const throttleRef = useRef(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const { dragState, clearDragState } = useDragState();
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
      title: 'Rename',
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
  ];

  if (!isLastContainer) {
    menuControls.push({
      icon: 'arrow-right-alt',
      title: 'Move All To Next Column',
      onClick: () => onMoveAllToNext(id),
      disabled: !hasItems,
    });
  }

  if (isLastContainer) {
    menuControls.push({
      icon: 'trash',
      title: 'Delete All',
      onClick: () => onDeleteAll(id),
    });
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);

    // throttle expensive work to avoid jank on large lists
    const now = Date.now();
    if (now - throttleRef.current < 50) {
      return;
    }
    throttleRef.current = now;

    // try to read drag payload so we can show a live preview.
    // Prefer dataTransfer, fall back to context state.
    let parsed = null;
    try {
      const raw =
        e.dataTransfer.getData('application/json') ||
        e.dataTransfer.getData('text/plain');
      if (raw) parsed = JSON.parse(raw);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Container: Failed to parse dataTransfer data', err);
    }

    if (!parsed && dragState) {
      parsed = dragState;
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

    // Read payload from dataTransfer if available, otherwise use context
    const raw =
      e.dataTransfer.getData('application/json') ||
      e.dataTransfer.getData('text/plain');
    let parsed = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Container: Failed to parse drop data', err);
      }
    }

    if (!parsed && dragState) {
      parsed = dragState;
    }

    const { itemId, sourceContainerId, sourceIndex } = parsed || {};
    const destIndex = getDropIndex(e);

    // Clear preview state immediately to avoid temporary hiding of the dropped element
    setDragOverIndex(null);
    setDragOverItem(null);

    onItemDrop({
      itemId,
      sourceContainerId,
      sourceIndex,
      destinationContainerId: id,
      destinationIndex: destIndex,
    });

    clearDragState();
    try {
      removeDragClone();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Container: Failed to remove drag clone', err);
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
          <DropdownMenu icon="menu" label="Options" controls={menuControls} />
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
                        meta={dragOverItem.meta}
                        className="alpaca-item-inner"
                      />
                    ) : (
                      <div className="alpaca-item-inner">Moving...</div>
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
                return items.map((item, index) => {
                  const isSourceHidden =
                    dragState &&
                    dragState.itemId &&
                    dragState.sourceContainerId &&
                    dragState.itemId.toString() === item.id.toString() &&
                    dragState.sourceContainerId.toString() === id.toString();

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
                      assignees={item.assignees}
                      commentCount={item.commentCount}
                      meta={item.meta}
                      onClick={onItemClick}
                    />
                  );
                });
              })()
            ) : (
              <div className="alpaca-item empty">Drop items here</div>
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
  onItemDrop: PropTypes.func.isRequired,
};

export default Container;
