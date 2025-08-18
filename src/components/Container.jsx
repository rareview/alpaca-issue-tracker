const { DropdownMenu } = wp.components;
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

/**
 * Container component.
 */
function Container({
  id,
  title,
  items,
  onItemClick,
  onMoveAllToNext,
  isLastContainer,
  isHidden,
  onToggleHidden,
}) {
  const hasItems = items.length > 0;

  const toggleHidden = () => {
    onToggleHidden(id);
  };

  const menuControls = [
    {
      icon: isHidden ? "visibility" : "hidden",
      title: isHidden ? "Show items" : "Hide items",
      onClick: toggleHidden,
    },
  ];

  if (!isLastContainer) {
    menuControls.push({
      icon: "arrow-right-alt",
      title: "Move all to next column",
      onClick: () => onMoveAllToNext(id),
      disabled: !hasItems,
    });
  }

  return (
    <div
      className={`alpaca-container ${isHidden ? "hidden" : ""}`}
      data-id={id}
    >
      <div class="alpaca-container-header">
        <h2 className="alpaca-container-title">
          {title} <span className="alpaca-item-count">{items.length}</span>
        </h2>
        <div class="alpaca-container-controls">
          <DropdownMenu icon="menu" label="Options" controls={menuControls} />
        </div>
      </div>
      <SortableContext
        id={id}
        items={hasItems ? items.map((item) => item.id) : [id]}
        strategy={verticalListSortingStrategy}
      >
        {hasItems ? (
          items.map((item) => (
            <SortableItem
              className="alpaca-item"
              key={item.id}
              id={item.id}
              content={item.content}
              assignees={item.assignees} // <-- Add this line
              comment_count={item.comment_count}
              onClick={onItemClick}
            />
          ))
        ) : (
          <SortableItem
            key={id}
            id={id}
            className="alpaca-item empty"
            content={"Drop items here"}
            isDragDisabled={true}
          />
        )}
      </SortableContext>
    </div>
  );
}

export default Container;
