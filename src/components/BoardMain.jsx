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
  const triggerRef = useRef(null);
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

  // 🔹 Handle renaming a container
  const handleRenameContainer = (containerId, newTitle) => {
    const original = containers;
    const updated = containers.map((c) =>
      c.id === containerId ? { ...c, title: newTitle } : c
    );
    setContainers(updated);

    // Persist via REST API
    wp.apiFetch({
      path: `/alpaca/v1/status/${containerId}`,
      method: "POST",
      data: { name: newTitle },
    }).catch((err) => {
      console.error("Error renaming container:", err);
      setContainers(original); // revert on failure
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
    }).catch((err) => {
      console.error("Error updating issue:", err);
    });
  }

  const handleItemClick = (event, itemId) => {
    triggerRef.current = event.currentTarget;
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

    sourceContainer.items = [];
    nextContainer.items.push(...itemsToMove);

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

  const handleAssigneesChange = async (issueId, newAssignees) => {
    const enrichedAssignees = await Promise.all(
      newAssignees.map(async (assignee) => {
        if (assignee && assignee.id && !assignee.display_name) {
          try {
            const fullUser = await wp.apiFetch({ path: `/wp/v2/users/${assignee.id}` });
            return { ...assignee, display_name: fullUser.name, slug: fullUser.slug };
          } catch (error) {
            console.error(`Error fetching user data for ID ${assignee.id}:`, error);
            return assignee;
          }
        }
        return assignee;
      })
    );

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
          assignees: enrichedAssignees,
        };

        return { ...container, items: newItems };
      })
    );
  };

  const handleDeadlineChange = useCallback((issueId, newDeadline) => {
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
          meta: {
            ...newItems[itemIndex].meta,
            deadline: newDeadline ? [newDeadline] : null,
          },
        };

        return { ...container, items: newItems };
      })
    );
  }, []);

  const closeModal = () => {
    setSelectedItem(null);
  };

  const handleDeleteIssue = (issueId) => {
    // Optimistically remove the issue from the UI
    const originalContainers = containers;
    const newContainers = containers.map((c) => ({
      ...c,
      items: c.items.filter((item) => item.id !== issueId.toString()),
    }));
    setContainers(newContainers);
    closeModal();

    wp.apiFetch({
      path: `/issue/v1/delete/${issueId}`,
      method: "DELETE",
    }).catch((err) => {
      // Revert if the delete fails
      console.error("Error deleting issue:", err);
      setContainers(originalContainers);
    });
  };

  useEffect(() => {
    if (!selectedItem && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [selectedItem]);

  useEffect(() => {
    if (needsSave) {
      saveBoardOrder();
      setNeedsSave(false);
    }
  }, [needsSave, containers]);

  useEffect(() => {
    const handleIssueSubmitted = (event) => {
      const { issue, statusId } = event.detail;
      if (!issue || !statusId) return;

      setContainers((prevContainers) => {
        const newContainers = [...prevContainers];
        const targetContainer = newContainers.find(
          (c) => c.id === statusId.toString()
        );

        if (targetContainer) {
          targetContainer.items.unshift({
            id: issue.id.toString(),
            content: issue.title,
            author_name: issue.author_name,
            author_img: issue.author_img,
            assignees: [],
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

  useEffect(() => {
    const allAssignees = new Map();
    containers.forEach((container) => {
      container.items.forEach((item) => {
        if (item.assignees && Array.isArray(item.assignees)) {
          item.assignees.forEach((assignee) => {
            if (assignee && assignee.id) {
              const assigneeId = assignee.id.toString();
              const existing = allAssignees.get(assigneeId);
              if (!existing || (!existing.display_name && assignee.display_name)) {
                allAssignees.set(assigneeId, assignee);
              }
            }
          });
        }
      });
    });

    const assigneesArray = Array.from(allAssignees.values());

    window.alpacaAssignees = assigneesArray;
    const event = new CustomEvent("alpaca:assignees-updated", {
      detail: { assignees: assigneesArray },
    });
    document.dispatchEvent(event);
  }, [containers]);

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
            onRename={handleRenameContainer} // 🔹 pass down rename handler
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeId && draggedItem ? (
          <Item
            id={draggedItem.id}
            content={draggedItem.content}
            assignees={draggedItem.assignees}
            comment_count={draggedItem.comment_count}
            meta={draggedItem.meta}
            className="alpaca-item-dragging"
          />
        ) : null}
      </DragOverlay>

      <AlpacaIssue
        issueId={selectedItem?.id}
        isOpen={!!selectedItem}
        onClose={closeModal}
        onDelete={handleDeleteIssue}
        triggerRef={triggerRef}
        onCommentCountChange={onCommentCountChangeForIssue}
        onAssigneesChange={handleAssigneesChange}
        onDeadlineChange={handleDeadlineChange}
        createIssueComment={createIssueComment}
        generateAssigneeChangeComment={generateAssigneeChangeComment}
      />
    </DndContext>
  );
}

export default Board;
