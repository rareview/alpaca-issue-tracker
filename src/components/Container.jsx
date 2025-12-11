const { Card, CardHeader, CardBody, DropdownMenu, TextControl } = wp.components;
const { Heading = wp.components.__experimentalHeading } = wp.components;

const { useState, useEffect, useRef } = wp.element;

import { Droppable } from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration';
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
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const inputRef = useRef(null);
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
        <Droppable droppableId={id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`alpaca-items ${
                snapshot.isDraggingOver ? 'dragging-over' : ''
              }`}
            >
              {hasItems ? (
                items.map((item, index) => (
                  <DraggableItem
                    className="alpaca-item"
                    key={item.id}
                    id={item.id}
                    index={index}
                    content={item.content}
                    assignees={item.assignees}
                    commentCount={item.commentCount}
                    meta={item.meta}
                    onClick={onItemClick}
                  />
                ))
              ) : (
                <div className="alpaca-item empty">Drop items here</div>
              )}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
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
};

export default Container;
