const { useState, useRef, useEffect, useCallback } = wp.element;

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";

import { arrayMove } from "@dnd-kit/sortable";

import AlpacaIssue from "./issue";
import Item from "./Item";
import Container from "./Container";

import { setCookie, getCookie } from "../utils/cookies";
import { transformDataForBoard, saveBoardOrder } from "../utils/data";
import {
  generateAssigneeSpan,
  generateStatusChangeComment,
  generateAssigneeChangeComment,
} from "../utils/comments";

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
  const [hiddenContainerIds, setHiddenContainerIds] = useState(() => {
    const cookie = getCookie("alpaca_hidden_containers");
    return cookie ? cookie.split(",").filter(Boolean) : [];
  });

  // Effect to update cookie when hiddenContainerIds changes
  useEffect(() => {
    setCookie("alpaca_hidden_containers", hiddenContainerIds.join(","), 365);
  }, [hiddenContainerIds]);

  const handleToggleHidden = (containerId) => {
    setHiddenContainerIds((prev) => {
      const newIds = new Set(prev);
      if (newIds.has(containerId)) {
        newIds.delete(containerId);
      } else {
        newIds.add(containerId);
      }
      return Array.from(newIds);
    });
  };

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
      wp.apiFetch({
        path: `/wp/v2/comments`,
        method: "POST",
        data: {
          content: commentContent,
          post: item.id,
          comment_type: "issuecomment",
        },
      }).catch((err) =>
        console.error(
          `Error creating status change comment for issue ${item.id}:`,
          err
        )
      );

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
            content: issue.title,
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
            isHidden={hiddenContainerIds.includes(container.id)}
            onToggleHidden={handleToggleHidden}
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
        generateAssigneeChangeComment={generateAssigneeChangeComment}
      />
    </DndContext>
  );
}

export default Board;
