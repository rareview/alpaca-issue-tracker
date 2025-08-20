import { useState, useEffect, useRef } from "react";
const { DropdownMenu, TextControl } = wp.components;
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

/**
 * Container component (delegates rename to parent via onRename).
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
  onRename, // parent must pass this
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
    if (newTitle.trim() !== "" && newTitle !== title) {
      if (typeof onRename === "function") {
        onRename(id, newTitle); // delegate to parent
      } else {
        console.warn(
          "Container: onRename prop is missing or not a function. Rename not applied."
        );
      }
    } else {
      setNewTitle(title); // reset if unchanged or empty
    }
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setNewTitle(title); // reset to original
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleRename();
    } else if (event.key === "Escape") {
      event.preventDefault();
      handleCancelRename();
    }
  };

  const menuControls = [
    {
      icon: "edit",
      title: "Rename",
      onClick: () => {
        setNewTitle(title); // ensure starting from current prop
        setIsRenaming(true);
      },
    },
    {
      icon: isHidden ? "visibility" : "hidden",
      title: isHidden ? "Expand Column" : "Collapse Column",
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
      <div className="alpaca-container-header">
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
          <h2 className="alpaca-container-title">
            {title} <span className="alpaca-item-count">{items.length}</span>
          </h2>
        )}
        <div className="alpaca-container-controls">
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
              assignees={item.assignees}
              comment_count={item.comment_count}
              meta={item.meta}
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
