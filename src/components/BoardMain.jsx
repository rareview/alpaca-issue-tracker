const { useState, useRef, useEffect, useCallback } = wp.element;
const { decodeEntities } = wp.htmlEntities;
const { Button, Notice } = wp.components;

import { DragDropContext } from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration';

import AlpacaIssue from './Issue';
import Container from './Container';

import { setCookie, getCookie } from '../utils/cookies';
import { transformDataForBoard, saveBoardOrder } from '../utils/data';
import { getUser } from '../hooks/useUser';

import { updateIssue } from '../services/issueApi';

/**
 * Main board component.
 */
function Board() {
  const [containers, setContainers] = useState(() => {
    if (typeof window.alpacaBoardData !== 'undefined') {
      return transformDataForBoard(window.alpacaBoardData);
    }
    return [];
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const triggerRef = useRef(null);
  const [needsSave, setNeedsSave] = useState(false);
  const [hiddenContainerIds, setHiddenContainerIds] = useState(() => {
    const cookie = getCookie('alpaca_hidden_containers');
    return cookie ? cookie.split(',').filter(Boolean) : [];
  });
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState(null);

  // Effect to update cookie when hiddenContainerIds changes
  useEffect(() => {
    setCookie('alpaca_hidden_containers', hiddenContainerIds.join(','), 365);
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
      c.id === containerId ? { ...c, title: newTitle } : c,
    );
    setContainers(updated);

    // Persist via REST API
    wp.apiFetch({
      path: `/alpaca/v1/status/${containerId}`,
      method: 'POST',
      data: { name: newTitle },
    }).catch((err) => {
      console.error('Error renaming container:', err);
      setContainers(original); // revert on failure
    });
  };

  function findContainerById(containerId) {
    return containers.find((c) => c.id === containerId);
  }

  function getItemById(itemId) {
    for (const container of containers) {
      const foundItem = container.items.find((item) => item.id === itemId);
      if (foundItem) return foundItem;
    }
    return null;
  }

  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    const sourceContainer = findContainerById(source.droppableId);
    const destinationContainer = findContainerById(destination.droppableId);

    if (sourceContainer.id === destinationContainer.id) {
      const items = Array.from(sourceContainer.items);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      setContainers((prev) =>
        prev.map((c) => (c.id === sourceContainer.id ? { ...c, items } : c)),
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
          }
          return c;
        }),
      );

      wp.hooks.doAction(
        'alpaca.statusChanged',
        movedItem,
        sourceContainer.title,
        destinationContainer.title,
      );
    }

    saveBoardOrder();

    const movedItemId = parseInt(draggableId, 10);
    const newStatusTermId = parseInt(destination.droppableId, 10);

    updateIssue(movedItemId, {
      taxonomies: {
        status: [newStatusTermId],
      },
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Error updating issue:', err);
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
          (item) => item.id === issueId.toString(),
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
      }),
    );
  }, []);

  useEffect(() => {
    const handleCommentCountChanged = (data) => {
      const { issueId, newCount } = data;
      handleCommentCountChange(issueId, newCount);
    };

    wp.hooks.addAction(
      'alpaca.commentCountChanged',
      'alpaca/boardmain',
      handleCommentCountChanged,
    );

    return () => {
      wp.hooks.removeAction('alpaca.commentCountChanged', 'alpaca/boardmain');
    };
  }, [handleCommentCountChange]);

  const handleChecklistChange = useCallback((issueId, newChecklist) => {
    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString(),
        );

        if (itemIndex === -1) {
          return container;
        }

        const newItems = [...container.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          meta: {
            ...newItems[itemIndex].meta,
            checklist: newChecklist,
          },
        };

        return { ...container, items: newItems };
      }),
    );
  }, []);

  useEffect(() => {
    const checklistChangedCallback = (data) => {
      const { issueId, checklist } = data;
      handleChecklistChange(issueId, checklist);
    };

    wp.hooks.addAction(
      'alpaca.checklistChanged',
      'alpaca/boardmain',
      checklistChangedCallback,
    );

    return () => {
      wp.hooks.removeAction('alpaca.checklistChanged', 'alpaca/boardmain');
    };
  }, [handleChecklistChange]);

  const moveAllItemsToNextContainer = (sourceContainerId) => {
    const containersCopy = containers.map((c) => ({
      ...c,
      items: [...c.items],
    }));

    const sourceIndex = containersCopy.findIndex(
      (c) => c.id === sourceContainerId,
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

    itemsToMove.forEach((item) => {
      wp.hooks.doAction(
        'alpaca.statusChanged',
        item,
        sourceContainer.title,
        nextContainer.title,
      );

      updateIssue(item.id, {
        taxonomies: {
          status: [parseInt(nextContainer.id, 10)],
        },
      }).catch((err) => console.error(`Error updating issue ${item.id}:`, err));
    });

    setContainers(containersCopy);
    setNeedsSave(true);
  };

  const handleDeleteAll = (containerId) => {
    const originalContainers = containers;
    const containerToDeleteFrom = containers.find((c) => c.id === containerId);

    if (!containerToDeleteFrom) {
      console.warn(`Container with ID ${containerId} not found.`);
      return;
    }

    const itemsToDelete = containerToDeleteFrom.items.map((item) => item.id);

    // Optimistically update UI
    setContainers((prevContainers) =>
      prevContainers.map((c) =>
        c.id === containerId ? { ...c, items: [] } : c,
      ),
    );

    // API call to delete all issues in the container
    Promise.all(
      itemsToDelete.map((issueId) =>
        wp.apiFetch({
          path: `/issue/v1/delete/${issueId}`,
          method: 'DELETE',
        }),
      ),
    ).catch((err) => {
      console.error(
        `Error deleting issues from container ${containerId}:`,
        err,
      );
      setContainers(originalContainers); // Revert UI on error
    });
  };

  const handleAssigneesChange = async (issueId, newAssignees) => {
    const enrichedAssignees = await Promise.all(
      newAssignees.map(async (assignee) => {
        if (assignee && assignee.id && !assignee.displayName) {
          try {
            const fullUser = await getUser(assignee.id);
            return {
              ...assignee,
              displayName: fullUser.name,
              slug: fullUser.slug,
            };
          } catch (error) {
            console.error(
              `Error fetching user data for ID ${assignee.id}:`,
              error,
            );
            return assignee;
          }
        }
        return assignee;
      }),
    );

    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString(),
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
      }),
    );

    wp.hooks.doAction(
      'alpaca.issueAssigneesChanged',
      issueId,
      enrichedAssignees,
    );
  };

  const handleDeadlineChange = useCallback((issueId, newDeadline) => {
    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString(),
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
      }),
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
          (item) => item.id === issueId.toString(),
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
          (container) => container.id === newStatusTerm.term_id.toString(),
        );
        if (targetContainer) {
          targetContainer.items.push(movedItem);
          const sourceContainer = prevContainers.find(
            (c) => c.id === oldContainerId,
          );
          if (sourceContainer) {
            wp.hooks.doAction(
              'alpaca.statusChanged',
              movedItem,
              sourceContainer.title,
              targetContainer.title,
            );
          }
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
          (item) => item.id === issueId.toString(),
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
      }),
    );
  }, []);

  const closeModal = () => {
    setSelectedItem(null);
  };

  const handleRestoreDefaults = () => {
    setIsRestoring(true);
    setRestoreError(null);

    wp.apiFetch({
      path: '/alpaca/v1/statuses/restore-defaults',
      method: 'POST',
    })
      .then((response) => {
        if (response.success) {
          window.location.reload();
        } else {
          setRestoreError(
            response.message || 'Failed to restore default statuses.',
          );
        }
      })
      .catch((err) => {
        console.error('Error restoring default statuses:', err);
        setRestoreError(
          err.message || 'An error occurred while restoring default statuses.',
        );
      })
      .finally(() => {
        setIsRestoring(false);
      });
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
      method: 'DELETE',
    })
      .then(() => {
        wp.hooks.doAction('alpaca.issueDeleted', issueId);
      })
      .catch((err) => {
        // Revert if the delete fails
        console.error('Error deleting issue:', err);
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
    const handleIssueSubmitted = (issue, statusId) => {
      if (!issue || !statusId) return;

      setContainers((prevContainers) => {
        const newContainers = [...prevContainers];
        const targetContainer = newContainers.find(
          (c) => c.id === statusId.toString(),
        );

        if (targetContainer) {
          targetContainer.items.unshift({
            id: issue.id.toString(),
            content: decodeEntities(issue.title),
            authorName: issue.author_name,
            authorImg: issue.author_img,
            assignees: [],
            commentCount: issue.comment_count ?? 0,
            meta: issue.meta || {},
          });
        }

        return newContainers;
      });
      setNeedsSave(true);
    };

    wp.hooks.addAction(
      'alpaca.issueSubmitted',
      'alpaca/boardmain',
      handleIssueSubmitted,
    );

    return () => {
      wp.hooks.removeAction('alpaca.issueSubmitted', 'alpaca/boardmain');
    };
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
                (!existing.displayName && assignee.displayName)
              ) {
                allAssignees.set(assigneeId, assignee);
              }
            }
          });
        }
      });
    });

    const assigneesArray = Array.from(allAssignees.values());

    wp.hooks.doAction('alpaca.allAssigneesUpdated', assigneesArray);
  }, [containers]);

  const hasNoStatuses = containers.length === 0;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {hasNoStatuses ? (
        <div className="alpaca-empty-state">
          <Notice status="warning" isDismissible={false}>
            <p>
              <strong>
                Oh no! All your project statuses have disappeared.
              </strong>
            </p>
            <p>
              Without statuses, you cannot view or manage issues on the board.
              Click the button below to restore the default statuses (Backlog,
              Inbox, In Progress, Done).
            </p>
            <Button
              variant="primary"
              onClick={handleRestoreDefaults}
              isBusy={isRestoring}
              disabled={isRestoring}
            >
              {isRestoring ? 'Restoring...' : 'Restore Default Statuses'}
            </Button>
          </Notice>
          {restoreError && (
            <Notice status="error" isDismissible={false}>
              <p>{restoreError}</p>
            </Notice>
          )}
        </div>
      ) : (
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
              onRename={handleRenameContainer}
              onDeleteAll={handleDeleteAll}
            />
          ))}
        </div>
      )}

      <AlpacaIssue
        issueId={selectedItem?.id}
        isOpen={!!selectedItem}
        onClose={closeModal}
        onDelete={handleDeleteIssue}
        triggerRef={triggerRef}
        onAssigneesChange={handleAssigneesChange}
        onDeadlineChange={handleDeadlineChange}
        onStatusChange={handleStatusChange}
        onIssueTitleChange={handleIssueTitleChange}
      />
    </DragDropContext>
  );
}

export default Board;
