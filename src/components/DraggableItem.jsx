import PropTypes from 'prop-types';
import { Draggable } from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration';
import Item from './Item';

/**
 * Draggable item wrapper component.
 *
 * @param {Object}   root0                - Props object
 * @param {number}   root0.id             - Item ID
 * @param {number}   root0.index          - Index in drag list
 * @param {string}   root0.content        - Item content text
 * @param {string}   root0.className      - CSS class name
 * @param {boolean}  root0.isDragDisabled - Whether dragging is disabled
 * @param {Function} root0.onClick        - Click handler
 * @param {Array}    root0.assignees      - Array of assignees
 * @param {number}   root0.comment_count  - Comment count
 * @param {Object}   root0.meta           - Metadata object
 * @return {JSX.Element} Draggable item component
 */
function DraggableItem({
  id,
  index,
  content,
  className,
  isDragDisabled = false,
  onClick,
  assignees = [],
  comment_count: commentCount,
  meta,
}) {
  const handleClick = (event) => {
    if (onClick) {
      onClick(event, id);
    }
  };

  return (
    <Draggable draggableId={id} index={index} isDragDisabled={isDragDisabled}>
      {(provided, snapshot) => {
        const combinedStyle = {
          ...provided.draggableProps.style, // required for correct positioning
          ...(snapshot.isDragging ? { opacity: 0.5 } : {}),
        };

        return (
          <Item
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            id={id}
            content={content}
            assignees={assignees}
            commentCount={commentCount}
            meta={meta}
            className={`${className} ${snapshot.isDragging ? 'dragging' : ''}`}
            onClick={handleClick}
            style={combinedStyle}
          />
        );
      }}
    </Draggable>
  );
}

DraggableItem.propTypes = {
  id: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  content: PropTypes.string.isRequired,
  className: PropTypes.string,
  isDragDisabled: PropTypes.bool,
  onClick: PropTypes.func,
  assignees: PropTypes.array,
  comment_count: PropTypes.number,
  meta: PropTypes.object,
};

export default DraggableItem;
