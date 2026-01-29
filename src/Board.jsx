const { useState, useRef, useEffect, useCallback } = wp.element;
const { decodeEntities } = wp.htmlEntities;
const { __ } = wp.i18n;
const { Button, Notice } = wp.components;
const { doAction } = wp.hooks;

// Replaced Atlaskit DragDropContext with native HTML5 drag/drop handlers

import AlpacaIssue from './components/Issue';
import Container from './components/Container';

import { setCookie, getCookie } from './utils/cookies';
import { transformDataForBoard, saveBoardOrder } from './utils/data';
import { getUser } from './hooks/useUser';

import { updateIssue } from './services/issueApi';

/**
 * Main board component.
 */
export function AlpacaBoard() {
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

  // From BoardFrame.jsx
  useEffect(() => {
    // Fire an action to allow other components to render into the controls area.
    doAction('alpaca_board_controls', '#alpaca-board-controls-mount');

    const handleCreateBoardIssue = () => {
      setSelectedItem({ isCreating: true });
    };

    wp.hooks.addAction(
      'alpaca.createBoardIssue',
      'alpaca/board',
      handleCreateBoardIssue,
    );

    return () => {
      wp.hooks.removeAction('alpaca.createBoardIssue', 'alpaca/board');
    };
  }, []);

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
      // eslint-disable-next-line no-console
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

  // (Atlaskit handler removed; using native drop handlers and `handleItemDrop`)

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
          commentCount: newCount,
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

  const handleLastActivityChange = useCallback((issueId, newLastActivity) => {
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
            lastActivity: newLastActivity,
          },
        };

        return { ...container, items: newItems };
      }),
    );
  }, []);

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

  const handlePriorityChange = useCallback((issueId, isHighPriority) => {
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
            // eslint-disable-next-line camelcase
            alpaca_high_priority: isHighPriority,
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

    const priorityUpdatedCallback = (data) => {
      const { issueId, isHighPriority } = data;
      handlePriorityChange(issueId, isHighPriority);
    };

    const lastActivityChangedCallback = (data) => {
      const { issueId, lastActivity } = data;
      handleLastActivityChange(issueId, lastActivity);
    };

    wp.hooks.addAction(
      'alpaca.checklistChanged',
      'alpaca/boardmain',
      checklistChangedCallback,
    );

    wp.hooks.addAction(
      'alpaca.priorityUpdated',
      'alpaca/boardmain',
      priorityUpdatedCallback,
    );

    wp.hooks.addAction(
      'alpaca.lastActivityChanged',
      'alpaca/boardmain',
      lastActivityChangedCallback,
    );

    return () => {
      wp.hooks.removeAction('alpaca.checklistChanged', 'alpaca/boardmain');
      wp.hooks.removeAction('alpaca.priorityUpdated', 'alpaca/boardmain');
      wp.hooks.removeAction('alpaca.lastActivityChanged', 'alpaca/boardmain');
    };
  }, [handleChecklistChange, handlePriorityChange, handleLastActivityChange]);

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
        // eslint-disable-next-line no-console
      }).catch((err) => console.error(`Error updating issue ${item.id}:`, err));
    });

    setContainers(containersCopy);
    setNeedsSave(true);
  };

  const handleDeleteAll = (containerId) => {
    const originalContainers = containers;
    const containerToDeleteFrom = containers.find((c) => c.id === containerId);

    if (!containerToDeleteFrom) {
      // eslint-disable-next-line no-console
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
          path: `/alpaca/v1/delete/${issueId}`,
          method: 'DELETE',
        }),
      ),
    ).catch((err) => {
      // eslint-disable-next-line no-console
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
            // eslint-disable-next-line no-console
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
            response.message ||
              __('Failed to restore default statuses.', 'alpaca'),
          );
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error restoring default statuses:', err);
        setRestoreError(
          err.message ||
            __('An error occurred while restoring default statuses.', 'alpaca'),
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
      path: `/alpaca/v1/delete/${issueId}`,
      method: 'DELETE',
    })
      .then(() => {
        wp.hooks.doAction('alpaca.issueDeleted', issueId);
      })
      .catch((err) => {
        // Revert if the delete fails
        // eslint-disable-next-line no-console
        console.error('Error deleting issue:', err);
        setContainers(originalContainers);
      });
  };

  const handleIssueCreated = (createdIssue) => {
    if (!createdIssue || !createdIssue.id) {
      console.error('Invalid issue data received:', createdIssue);
      window.location.reload();
      return;
    }

    setContainers((prevContainers) => {
      if (prevContainers.length === 0) {
        window.location.reload();
        return prevContainers;
      }

      const firstContainerIndex = 0;
      const updatedContainers = [...prevContainers];
      const firstContainer = { ...updatedContainers[firstContainerIndex] };

      const newItem = {
        id: createdIssue.id.toString(),
        content: createdIssue.title,
        assignees: createdIssue.assignees || [],
        commentCount: 1,
        meta: {
          deadline: createdIssue.deadline ? [createdIssue.deadline] : undefined,
          // eslint-disable-next-line camelcase
          alpaca_high_priority: createdIssue.isHighPriority ? '1' : undefined,
        },
      };

      firstContainer.items = [newItem, ...firstContainer.items];
      updatedContainers[firstContainerIndex] = firstContainer;

      return updatedContainers;
    });

    closeModal();
    setNeedsSave(true);
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
            postDate: issue.post_date,
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

  // Handler invoked by Containers when an item is dropped
  const handleItemDrop = (data) => {
    // data: { itemId, sourceContainerId, sourceIndex, destinationContainerId, destinationIndex }
    const {
      //   itemId,
      sourceContainerId,
      sourceIndex,
      destinationContainerId,
      destinationIndex,
    } = data;

    if (!destinationContainerId) return;

    const sourceContainer = findContainerById(sourceContainerId);
    const destinationContainer = findContainerById(destinationContainerId);

    if (!sourceContainer || !destinationContainer) return;

    if (sourceContainer.id === destinationContainer.id) {
      const items = Array.from(sourceContainer.items);
      const [reorderedItem] = items.splice(sourceIndex, 1);
      items.splice(destinationIndex, 0, reorderedItem);

      setContainers((prev) =>
        prev.map((c) => (c.id === sourceContainer.id ? { ...c, items } : c)),
      );
    } else {
      const sourceItems = Array.from(sourceContainer.items);
      const destItems = Array.from(destinationContainer.items);
      const [movedItem] = sourceItems.splice(sourceIndex, 1);
      destItems.splice(destinationIndex, 0, movedItem);

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

      const movedItemId = parseInt(movedItem.id, 10);
      const newStatusTermId = parseInt(destinationContainer.id, 10);

      updateIssue(movedItemId, {
        taxonomies: {
          status: [newStatusTermId],
        },
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error updating issue:', err);
      });
    }

    setNeedsSave(true);
  };

  return (
    <>
      <ul className="subsubsub"></ul>
      <div id="alpaca-board-controls-mount"></div>
      {hasNoStatuses ? (
        <div className="alpaca-empty-state">
          <Notice status="warning" isDismissible={false}>
            <p>
              <strong>
                {__(
                  'Oh no! All your project statuses have disappeared.',
                  'alpaca',
                )}
              </strong>
            </p>
            <p>
              {__(
                'Without statuses, you cannot view or manage issues on the board. Click the button below to restore the default statuses (Backlog, Next, In Progress, Done).',
                'alpaca',
              )}
            </p>
            <Button
              variant="primary"
              onClick={handleRestoreDefaults}
              isBusy={isRestoring}
              disabled={isRestoring}
            >
              {isRestoring
                ? __('Restoring…', 'alpaca')
                : __('Restore Default Statuses', 'alpaca')}
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
              onItemDrop={handleItemDrop}
            />
          ))}
        </div>
      )}

      <AlpacaIssue
        key={selectedItem?.isCreating ? 'creating' : selectedItem?.id || 'none'}
        issueId={selectedItem?.id}
        isCreating={selectedItem?.isCreating}
        isOpen={!!selectedItem}
        onClose={closeModal}
        onDelete={handleDeleteIssue}
        triggerRef={triggerRef}
        onAssigneesChange={handleAssigneesChange}
        onDeadlineChange={handleDeadlineChange}
        onStatusChange={handleStatusChange}
        onIssueTitleChange={handleIssueTitleChange}
        onIssueCreated={handleIssueCreated}
      />
    </>
  );
}

AlpacaBoard.displayName = 'AlpacaBoard';
