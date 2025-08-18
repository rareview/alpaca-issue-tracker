const { useState, useRef, useEffect, forwardRef, useCallback } = wp.element;
const { decodeEntities } = wp.htmlEntities;
const { DropdownMenu } = wp.components;

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import AlpacaUser from "./user";
import AlpacaIssue from "./issue";

/**
 * Transform server data into array format for board state.
 * @param {Array} data The data from `alpaca_get_board_data`.
 */
const transformDataForBoard = (data) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((column) => ({
    id: column.id.toString(),
    title: decodeEntities(column.title),
    items: column.issues.map((issue) => ({
      id: issue.id.toString(),
      content: decodeEntities(issue.title),
      assignees: issue.assignees || [], // <-- Add this line
      comment_count: issue.comment_count,
    })),
  }));
};

/**
 * Generates HTML for an assignee span to be used in comments.
 * @param {object} user The user object for the assignee.
 * @returns {string} HTML string.
 */
const generateAssigneeSpan = (user) => {
  if (!user) return "";
  const avatarAttr = user.avatar ? ` data-avatar="${user.avatar}"` : "";
  return `<span class="alpaca-status-assignee" data-userid="${user.id}"${avatarAttr}>${user.name}</span>`;
};

/**
 * Generates HTML for a status change comment.
 * @param {string} fromStatus The title of the original status.
 * @param {string} toStatus The title of the new status.
 * @returns {string} HTML string.
 */
const generateStatusChangeComment = (fromStatus, toStatus) => {
  return `Item moved from status <span class="alpaca-status-comment">${fromStatus}</span> to <span class="alpaca-status-comment">${toStatus}</span>`;
};

/**
 * Save board order in DOM order, including container IDs & titles.
 */
const saveBoardOrder = () => {
  const containersInDomOrder = document.querySelectorAll(".alpaca-container");

  const data = Array.from(containersInDomOrder).map((containerEl) => {
    const id = parseInt(containerEl.dataset.id, 10);
    const title = containerEl.querySelector("h2").textContent.trim();
    // Select all items except for the empty placeholder.
    const items = containerEl.querySelectorAll(".alpaca-item:not(.empty)");

    return {
      id,
      title,
      issues: Array.from(items).map((itemEl) =>
        parseInt(itemEl.dataset.id, 10)
      ),
    };
  });

  // Use wp.apiFetch to send data to the REST API endpoint.
  // It automatically handles nonces for authenticated requests.
  wp.apiFetch({
    path: "/alpaca/v1/board",
    method: "POST",
    data: data,
  })
    .then((res) => {
      // saved successfully
    })
    .catch((err) => {
      console.error("Error saving board order:", err);
    });
};

const Item = forwardRef(
  (
    { id, content, assignees = [], comment_count, className, style, ...props },
    ref
  ) => {
    const assigneeDataAttributes = assignees.reduce((acc, assignee) => {
      if (assignee && assignee.id) {
        acc[`data-assignee-${assignee.id}`] = "";
      }
      return acc;
    }, {});

    return (
      <div
        ref={ref}
        className={className}
        style={style}
        data-id={id}
        {...assigneeDataAttributes}
        {...props}
      >
        <div className="alpaca-item-content">{content}</div>
        <div className="alpaca-item-meta">
          {/* --- Assignees --- */}
          {assignees.length > 0 && (
            <div
              className="alpaca-item-assignees"
              data-assignees={assignees.length}
              title={
                assignees.length === 1
                  ? assignees[0].display_name || assignees[0].name
                  : assignees.map((a) => a.display_name || a.name).join(", ")
              }
            >
              {assignees.map((assignee) => (
                <div key={assignee.id} className="alpaca-item-assignee">
                  {assignee.avatar && (
                    <img
                      className="alpaca-item-user-img"
                      src={assignee.avatar}
                      alt={assignee.display_name || assignee.name}
                      title={assignee.display_name || assignee.name}
                    />
                  )}
                  <div className="alpaca-item-assignee-name">
                    {assignee.display_name || assignee.name}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* If no assignees, show nothing */}

          {typeof comment_count !== "undefined" && comment_count > 0 && (
            <div className="alpaca-item-comment-count has-dashicon">
              <span
                className="dashicons dashicons-admin-comments"
                aria-hidden="true"
              ></span>
              {comment_count}
            </div>
          )}
        </div>
      </div>
    );
  }
);

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
      className={className}
      style={style}
      onClick={handleClick}
      {...(!isDragDisabled
        ? { ...attributes, ...listeners }
        : { tabIndex: -1 })}
    />
  );
}

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
}) {
  const [isHidden, setIsHidden] = useState(false);
  const hasItems = items.length > 0;

  const toggleHidden = () => {
    setIsHidden((prev) => !prev);
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
        <h2 className="alpaca-container-title">{title}</h2>
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

/**
 * Main board component.
 */
function Board() {
  const [containers, setContainers] = useState(() => {
    if (typeof alpacaBoardData !== "undefined") {
      return transformDataForBoard(alpacaBoardData);
    }
    return [];
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const [activeId, setActiveId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const triggerRef = useRef(null); // To store the element that opened the modal
  const [draggedItem, setDraggedItem] = useState(null);
  const [needsSave, setNeedsSave] = useState(false);
  const [originalContainerId, setOriginalContainerId] = useState(null);

  const createIssueComment = (issueId, commentContent) => {
    return wp
      .apiFetch({
        path: `/wp/v2/comments`,
        method: "POST",
        data: {
          content: commentContent,
          post: issueId,
          comment_type: "issuecomment",
        },
      })
      .then(() => {
        // On success, update the comment count for the item on the board
        const item = getItemById(issueId);
        if (item && typeof item.comment_count !== "undefined") {
          handleCommentCountChange(issueId, item.comment_count + 1);
        }
      })
      .catch((err) => {
        console.error("Error creating status change comment:", err);
        throw err;
      });
  };

  function findContainerByItemId(itemId) {
    return containers.find((c) => c.items.some((item) => item.id === itemId));
  }

  function findContainerById(containerId) {
    return containers.find((c) => c.id === containerId);
  }

  function getItemById(itemId) {
    for (const container of containers) {
      const item = container.items.find((item) => item.id === itemId);
      if (item) return item;
    }
    return null;
  }

  function handleDragStart(event) {
    const { active } = event;
    setActiveId(active.id);
    setDraggedItem(getItemById(active.id));
    const container = findContainerByItemId(active.id);
    if (container) {
      setOriginalContainerId(container.id);
    }
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainerByItemId(active.id);
    const overContainer =
      findContainerByItemId(over.id) || findContainerById(over.id);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer.id === overContainer.id
    ) {
      return;
    }

    setContainers((prev) => {
      const newContainers = prev.map((c) => ({ ...c, items: [...c.items] }));

      const source = newContainers.find((c) => c.id === activeContainer.id);
      const destination = newContainers.find((c) => c.id === overContainer.id);

      const activeIndex = source.items.findIndex(
        (item) => item.id === active.id
      );
      const [movedItem] = source.items.splice(activeIndex, 1);

      let newIndex;
      if (over.id === overContainer.id) {
        newIndex = destination.items.length;
      } else {
        newIndex = destination.items.findIndex((item) => item.id === over.id);
        if (newIndex === -1) newIndex = destination.items.length;
      }

      destination.items.splice(newIndex, 0, movedItem);

      return newContainers;
    });
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (over && originalContainerId) {
      const overContainer =
        findContainerByItemId(over.id) || findContainerById(over.id);

      if (overContainer && overContainer.id !== originalContainerId) {
        const originalContainer = findContainerById(originalContainerId);
        if (originalContainer) {
          const commentContent = generateStatusChangeComment(
            originalContainer.title,
            overContainer.title
          );
          createIssueComment(active.id, commentContent);
        }
      }
    }

    setActiveId(null);
    setDraggedItem(null);
    setOriginalContainerId(null);

    if (!over) return;

    const activeContainer = findContainerByItemId(active.id);
    const overContainer =
      findContainerByItemId(over.id) || findContainerById(over.id);

    if (!activeContainer || !overContainer) return;

    if (activeContainer.id === overContainer.id) {
      const items = activeContainer.items;
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      if (oldIndex !== newIndex) {
        setContainers((prev) =>
          prev.map((c) =>
            c.id === activeContainer.id
              ? { ...c, items: arrayMove(items, oldIndex, newIndex) }
              : c
          )
        );
      }
    }

    saveBoardOrder();

    // Send REST API call to update taxonomy term (status)
    const movedItemId = parseInt(active.id, 10);
    const newStatusTermId = parseInt(overContainer.id, 10);

    wp.apiFetch({
      path: `/issue/v1/update/${movedItemId}`,
      method: "POST",
      data: {
        taxonomies: {
          status: [newStatusTermId],
        },
      },
    })
      .then((res) => {
        // successfully updated
      })
      .catch((err) => {
        console.error("Error updating issue:", err);
      });
  }

  const handleItemClick = (event, itemId) => {
    // Store the trigger element so we can return focus to it when the modal closes.
    triggerRef.current = event.currentTarget;

    // Immediately blur the clicked item. This prevents the accessibility warning
    // by ensuring the item doesn't have focus when the modal applies `aria-hidden`
    // to the rest of the page. The Modal component will then trap focus inside itself.
    event.currentTarget.blur();

    const item = getItemById(itemId);
    setSelectedItem(item);
  };

  const handleCommentCountChange = useCallback((issueId, newCount) => {
    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString()
        );

        if (itemIndex === -1) {
          return container;
        }

        const newItems = [...container.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          comment_count: newCount,
        };

        return { ...container, items: newItems };
      })
    );
  }, []);

  const onCommentCountChangeForIssue = useCallback(
    (newCount) =>
      selectedItem?.id && handleCommentCountChange(selectedItem.id, newCount),
    [selectedItem, handleCommentCountChange]
  );

  const moveAllItemsToNextContainer = (sourceContainerId) => {
    const containersCopy = containers.map((c) => ({
      ...c,
      items: [...c.items],
    }));

    const sourceIndex = containersCopy.findIndex(
      (c) => c.id === sourceContainerId
    );

    if (sourceIndex === -1 || sourceIndex >= containersCopy.length - 1) {
      return;
    }

    const sourceContainer = containersCopy[sourceIndex];
    const nextContainer = containersCopy[sourceIndex + 1];
    const itemsToMove = [...sourceContainer.items];

    if (itemsToMove.length === 0) {
      return;
    }

    // Update the arrays in our copied state
    sourceContainer.items = [];
    nextContainer.items.push(...itemsToMove);

    // Create status change comments and update taxonomies for each moved item
    const commentContent = generateStatusChangeComment(
      sourceContainer.title,
      nextContainer.title
    );
    itemsToMove.forEach((item) => {
      createIssueComment(item.id, commentContent);
      wp.apiFetch({
        path: `/issue/v1/update/${item.id}`,
        method: "POST",
        data: {
          taxonomies: {
            status: [parseInt(nextContainer.id, 10)],
          },
        },
      }).catch((err) => console.error(`Error updating issue ${item.id}:`, err));
    });

    setContainers(containersCopy);
    setNeedsSave(true);
  };

  // Add this handler to update assignees for a specific issue/item
  const handleAssigneesChange = useCallback((issueId, newAssignees) => {
    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString()
        );

        if (itemIndex === -1) {
          return container;
        }

        const newItems = [...container.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          assignees: newAssignees, // Update only the assignees field
        };

        return { ...container, items: newItems };
      })
    );
  }, []);

  const closeModal = () => {
    setSelectedItem(null);
  };

  // When the modal closes, return focus to the element that opened it.
  useEffect(() => {
    if (!selectedItem && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [selectedItem]);

  useEffect(() => {
    // After a new issue is submitted and the state has been updated,
    // save the new board order.
    if (needsSave) {
      saveBoardOrder();
      setNeedsSave(false); // Reset the flag
    }
  }, [needsSave, containers]);

  useEffect(() => {
    const handleIssueSubmitted = (event) => {
      const { issue, statusId } = event.detail;

      // Ensure we have the necessary data
      if (!issue || !statusId) {
        return;
      }

      setContainers((prevContainers) => {
        const newContainers = [...prevContainers];
        const targetContainer = newContainers.find(
          (c) => c.id === statusId.toString()
        );

        if (targetContainer) {
          // Add the new issue to the top of the correct column
          targetContainer.items.unshift({
            id: issue.id.toString(),
            content: decodeEntities(issue.title),
            author_name: issue.author_name,
            author_img: issue.author_img,
            assignees: [], // New issues have no assignees
            comment_count: issue.comment_count ?? 0,
          });
        }

        return newContainers;
      });
      setNeedsSave(true);
    };

    document.addEventListener("alpaca:issue-submitted", handleIssueSubmitted);
    return () =>
      document.removeEventListener(
        "alpaca:issue-submitted",
        handleIssueSubmitted
      );
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="alpaca-wrap">
        {containers.map((container, index) => (
          <Container
            key={container.id}
            id={container.id}
            title={container.title}
            items={container.items}
            onItemClick={handleItemClick}
            onMoveAllToNext={moveAllItemsToNextContainer}
            isLastContainer={index === containers.length - 1}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeId && draggedItem ? (
          <Item
            id={draggedItem.id}
            content={draggedItem.content}
            assignees={draggedItem.assignees} // <-- Add this line to show assignees in drag overlay
            comment_count={draggedItem.comment_count}
            className="alpaca-item-dragging"
          />
        ) : null}
      </DragOverlay>

      <AlpacaIssue
        issueId={selectedItem?.id}
        isOpen={!!selectedItem}
        onClose={closeModal}
        triggerRef={triggerRef}
        onCommentCountChange={onCommentCountChangeForIssue}
        onAssigneesChange={handleAssigneesChange}
        createIssueComment={createIssueComment}
        generateAssigneeSpan={generateAssigneeSpan}
      />
    </DndContext>
  );
}

export default function AlpacaBoard() {
  return <Board />;
}
