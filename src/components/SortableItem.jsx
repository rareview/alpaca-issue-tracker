import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Item from "./Item";

/**
 * Sortable item component.
 */
function SortableItem({
  id,
  content,
  className,
  isDragDisabled = false,
  onClick,
  assignees = [],
  comment_count,
  meta,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges: () => false,
    disabled: isDragDisabled,
  });

  const style = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    cursor: isDragging ? "grabbing" : isDragDisabled ? "default" : "grab",
    visibility: isDragging ? "hidden" : "visible",
    userSelect: isDragDisabled ? "none" : "auto",
  };

  const handleClick = (event) => {
    if (!isDragging && onClick) {
      onClick(event, id);
    }
  };

  return (
    <Item
      ref={setNodeRef}
      id={id}
      content={content}
      assignees={assignees}
      comment_count={comment_count}
      meta={meta}
      className={className}
      style={style}
      onClick={handleClick}
      {...(!isDragDisabled
        ? { ...attributes, ...listeners }
        : { tabIndex: -1 })}
    />
  );
}

export default SortableItem;
