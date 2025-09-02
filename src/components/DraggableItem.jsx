import { Draggable } from "@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration";
import Item from "./Item";

/**
 * Draggable item wrapper.
 */
function DraggableItem({
  id,
  index,
  content,
  className,
  isDragDisabled = false,
  onClick,
  assignees = [],
  comment_count,
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
            comment_count={comment_count}
            meta={meta}
            className={`${className} ${snapshot.isDragging ? "dragging" : ""}`}
            onClick={handleClick}
            style={combinedStyle}
          />
        );
      }}
    </Draggable>
  );
}

export default DraggableItem;
