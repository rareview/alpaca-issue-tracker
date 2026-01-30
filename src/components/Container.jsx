const { Card, CardHeader, CardBody, DropdownMenu, TextControl } = wp.components;
const { Heading = wp.components.__experimentalHeading } = wp.components;
const { __ } = wp.i18n;

const { useState, useEffect, useRef, useLayoutEffect, createRef } = wp.element;

import DraggableItem from './DraggableItem';

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
  const [, forceUpdate] = useState(0);
  const hasItems = items.length > 0;

  // --- FLIP Animation ---
  const isSortingRef = useRef(false);
  const itemRefs = useRef({});
  const [boundingBoxes, setBoundingBoxes] = useState({});
  const prevItemsRef = useRef(items);

  // Create refs for any new items
  items.forEach((item) => {
    if (!itemRefs.current[item.id]) {
      itemRefs.current[item.id] = createRef();
    }
  });

  useLayoutEffect(() => {
    const newBoxes = {};
    const prevItems = prevItemsRef.current;
    prevItems.forEach((item) => {
      const ref = itemRefs.current[item.id];
      if (ref && ref.current) {
        newBoxes[item.id] = ref.current.getBoundingClientRect();
      }
    });
    setBoundingBoxes(newBoxes);
    prevItemsRef.current = items;
  }, [items]);

  useLayoutEffect(() => {
    // Only animate when the automatic sort is running.
    if (!isSortingRef.current) {
      return;
    }

    const hasMoved = (box1, box2) => {
      if (!box1 || !box2) return false;
      return box1.top !== box2.top || box1.left !== box2.left;
    };

    items.forEach((item) => {
      const ref = itemRefs.current[item.id];
      if (!ref || !ref.current) return;

      const newBox = ref.current.getBoundingClientRect();
      const oldBox = boundingBoxes[item.id];

      if (hasMoved(oldBox, newBox)) {
        const deltaX = oldBox.left - newBox.left;
        const deltaY = oldBox.top - newBox.top;

        requestAnimationFrame(() => {
          ref.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          ref.current.style.transition = 'transform 0s';

          requestAnimationFrame(() => {
            ref.current.style.transform = '';
            ref.current.style.transition = 'transform 300ms ease-out';
          });
        });
      }
    });
  }, [boundingBoxes, items]);
  // --- End FLIP Animation ---

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
        const currentItemsState = [...items];
        const moves = [];

        // First, calculate the sequence of moves required.
        for (let i = 0; i < newItems.length; i++) {
          const desiredItem = newItems[i];
          const currentIndex = currentItemsState.findIndex(
            (item) => item.id === desiredItem.id,
          );

          if (currentIndex !== i) {
            moves.push({
              itemId: desiredItem.id,
              sourceContainerId: id,
              sourceIndex: currentIndex,
              destinationContainerId: id,
              destinationIndex: i,
            });

            const [movedItem] = currentItemsState.splice(currentIndex, 1);
            currentItemsState.splice(i, 0, movedItem);
          }
        }

        if (moves.length > 0) {
          isSortingRef.current = true;
        }

        // Now, execute the moves with a delay for animation.
        moves.forEach((move, index) => {
          setTimeout(() => {
            onItemDrop(move);
          }, index * 150); // 150ms delay between moves
        });

        // After the animation is complete, reset the flag.
        setTimeout(() => {
          isSortingRef.current = false;
        }, moves.length * 150);
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

  // Global dragend listener to catch drops outside any valid container
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      // Force reset of local drag state
      setIsDragOver(false);
      setDragOverIndex(null);
      setDragOverItem(null);
      isSortingRef.current = false;

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
  }, []);

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
            const renderList = [];

            // Identify if the dragged item originated from this container
            const draggingId = dragOverItem ? dragOverItem.itemId : null;
            const isSourceContainer =
              dragOverItem &&
              dragOverItem.sourceContainerId &&
              dragOverItem.sourceContainerId.toString() === id.toString();

            let insertAt = items.length;
            if (dragOverItem) {
              insertAt = Math.max(
                0,
                Math.min(
                  items.length,
                  dragOverIndex === null ? items.length : dragOverIndex,
                ),
              );
            }

            const renderPreview = () => (
              <div
                className="alpaca-item placeholder"
                key={`preview-${dragOverItem.itemId}`}
              >
                {dragOverItem.content ? (
                  <DraggableItem
                    id={-1}
                    index={-1}
                    containerId={id}
                    content={dragOverItem.content}
                    assignees={dragOverItem.assignees}
                    commentCount={dragOverItem.commentCount}
                    postDate={dragOverItem.postDate}
                    meta={dragOverItem.meta}
                    className="alpaca-item-inner"
                    isDragDisabled={true}
                  />
                ) : (
                  <div className="alpaca-item-inner">
                    {__('Moving…', 'alpaca')}
                  </div>
                )}
              </div>
            );

            if (!dragOverItem) {
              const listHasItems = items && items.length > 0;
              if (!listHasItems) {
                // Check if we are the source container (via global fallback), to ensure we don't assume empty if hidden source exists

                return (
                  <div className="alpaca-item empty">
                    {__('Drop items here', 'alpaca')}
                  </div>
                );
              }

              const globalDrag =
                typeof window !== 'undefined' ? window.__alpacaDragState : null;

              return items.map((item, index) => {
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
                      isGlobalSourceHidden ? 'is-source-hidden' : ''
                    }`}
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
                      isSource ? 'is-source-hidden' : ''
                    }`}
                    key={item.id}
                    id={item.id}
                    index={i}
                    containerId={id}
                    content={item.content}
                    postDate={item.postDate}
                    assignees={item.assignees}
                    commentCount={item.commentCount}
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
