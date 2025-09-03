const { useState, useRef, useEffect, useCallback } = wp.element;
const { decodeEntities } = wp.htmlEntities;

import { DragDropContext } from "@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration";

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
import { getUser } from "../utils/usercache";
import { fetchIssue } from "../services/issueApi";

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

  const [selectedItem, setSelectedItem] = useState(null);
  const triggerRef = useRef(null);
  const [needsSave, setNeedsSave] = useState(false);
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

  const createIssueComment = async (issueId, commentContent) => {
    try {
      const createCommentResponse = await wp.apiFetch({
        path: `/wp/v2/comments`,
        method: "POST",
        data: {
          content: commentContent,
          post: issueId,
          comment_type: "issuecomment",
        },
      });
      console.log("Create Comment Response:", createCommentResponse);
      console.log("Issue ID for comment count fetch:", issueId);

      if (!createCommentResponse || !createCommentResponse.id) {
        console.error(
          "Comment creation failed or returned invalid response:",
          createCommentResponse
        );
        throw new Error("Comment creation failed.");
      }

      const postIdForCommentCount = createCommentResponse.post;
      let newCount = 0;
      let retries = 0;
      const maxRetries = 5;
      const retryDelay = 500; // milliseconds

      console.log(
        `Attempting to fetch post for comment count for postId: ${postIdForCommentCount} with retries...`
      );

      while (newCount === 0 && retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        const postResponse = fetchIssue(postIdForCommentCount);
        newCount = postResponse.comment_count || 0;
        console.log(
          `Retry ${
            retries + 1
          }: Fetched post for comment count for post ${postIdForCommentCount}:`,
          postResponse
        );
        retries++;
      }

      console.log("Final New Comment Count:", newCount);

      // Dispatch the custom event to update the comment count in the UI
      document.dispatchEvent(
        new CustomEvent("alpaca:comment-count-changed", {
          detail: {
            issueId: issueId,
            newCount: newCount,
          },
        })
      );
    } catch (err) {
      console.error("Error creating status change comment:", err);
      throw err;
    }
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

  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;
    console.log("handleDragEnd called");
    console.log("Source:", source);
    console.log("Destination:", destination);

    if (!destination) {
      console.log("No destination, returning.");
      return;
    }

    const sourceContainer = findContainerById(source.droppableId);
    const destinationContainer = findContainerById(destination.droppableId);

    if (sourceContainer.id === destinationContainer.id) {
      const items = Array.from(sourceContainer.items);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setContainers((prev) =>
        prev.map((c) =>
          c.id === sourceContainer.id ? { ...c, items: items } : c
        )
      );
    } else {
      const sourceItems = Array.from(sourceContainer.items);
      const destItems = Array.from(destinationContainer.items);
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);

      setContainers((prev) =>
        prev.map((c) => {
          if (c.id === sourceContainer.id) {
            return { ...c, items: sourceItems };
          } else if (c.id === destinationContainer.id) {
            return { ...c, items: destItems };
          } else {
            return c;
          }
        })
      );

      const commentContent = generateStatusChangeComment(
        sourceContainer.title,
        destinationContainer.title
      );
      await createIssueComment(draggableId, commentContent);
    }

    saveBoardOrder();

    const movedItemId = parseInt(draggableId, 10);
    const newStatusTermId = parseInt(destination.droppableId, 10);

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

  useEffect(() => {
    const handleCommentCountChanged = (event) => {
      const { issueId, newCount } = event.detail;
      handleCommentCountChange(issueId, newCount);
    };

    document.addEventListener(
      "alpaca:comment-count-changed",
      handleCommentCountChanged
    );
    return () =>
      document.removeEventListener(
        "alpaca:comment-count-changed",
        handleCommentCountChanged
      );
  }, [handleCommentCountChange]);

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
            const fullUser = await getUser(assignee.id);
            return {
              ...assignee,
              display_name: fullUser.name,
              slug: fullUser.slug,
            };
          } catch (error) {
            console.error(
              `Error fetching user data for ID ${assignee.id}:`,
              error
            );
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

  const handleStatusChange = useCallback((issueId, newStatusTerm) => {
    setContainers((prevContainers) => {
      const newContainers = prevContainers.map((container) => ({
        ...container,
        items: [...container.items],
      }));

      let movedItem = null;
      let oldContainerId = null;

      // Find the item and remove it from its current container
      for (const container of newContainers) {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString()
        );
        if (itemIndex !== -1) {
          movedItem = container.items.splice(itemIndex, 1)[0];
          oldContainerId = container.id;
          break;
        }
      }

      if (movedItem) {
        // Update the item's status taxonomy
        movedItem.taxonomies = {
          ...movedItem.taxonomies,
          status: [newStatusTerm],
        };

        // Add the item to the new container
        const targetContainer = newContainers.find(
          (container) => container.id === newStatusTerm.term_id.toString()
        );
        if (targetContainer) {
          targetContainer.items.push(movedItem);
        }
      }

      return newContainers;
    });
    setNeedsSave(true);
  }, []);

  const handleIssueTitleChange = useCallback((issueId, newTitle) => {
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
          content: newTitle,
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
            content: decodeEntities(issue.title),
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
              if (
                !existing ||
                (!existing.display_name && assignee.display_name)
              ) {
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
    <DragDropContext onDragEnd={handleDragEnd}>
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

      <AlpacaIssue
        issueId={selectedItem?.id}
        isOpen={!!selectedItem}
        onClose={closeModal}
        onDelete={handleDeleteIssue}
        triggerRef={triggerRef}
        onAssigneesChange={handleAssigneesChange}
        onDeadlineChange={handleDeadlineChange}
        createIssueComment={createIssueComment}
        generateAssigneeChangeComment={generateAssigneeChangeComment}
        onStatusChange={handleStatusChange}
        onIssueTitleChange={handleIssueTitleChange}
      />
    </DragDropContext>
  );
}

export default Board;
