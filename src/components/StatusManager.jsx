const { useState, useEffect, useRef } = wp.element;
const { Button, Spinner, Modal, TextControl } = wp.components;
import PropTypes from 'prop-types';

import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration';
import DragHandleIcon from './icons/DragHandleIcon';
import { updateIssue } from '../services/issueApi';

const StatusManager = ({
  statuses,
  fetchStatuses: fetchStatusesCallback,
  isLoading,
  error,
  onStatusesChange,
  defaultStatusId,
}) => {
  const [statusToDelete, setStatusToDelete] = useState(null);
  const [localStatuses, setLocalStatuses] = useState(statuses);

  useEffect(() => {
    setLocalStatuses(statuses);
  }, [statuses]);

  // Notify parent when local order changes
  useEffect(() => {
    if (onStatusesChange) {
      onStatusesChange(localStatuses);
    }
  }, [localStatuses, onStatusesChange]);

  // Recalculate term_scores based on order and default status
  const recalculateScores = async (statusesArray, defaultId) => {
    if (!defaultId) return; // No default selected, skip scoring

    try {
      const defaultIndex = statusesArray.findIndex(
        (s) => s.term_id.toString() === defaultId,
      );
      if (defaultIndex === -1) return; // Default status not found

      // Calculate scores relative to default status
      const scoreUpdates = statusesArray.map((status, index) => {
        const score = index - defaultIndex; // Default gets 0, above get negative, below get positive
        return {
          id: status.term_id,
          score,
        };
      });

      // Update all scores via API
      await Promise.all(
        scoreUpdates.map((update) =>
          wp.apiFetch({
            path: `/alpaca/v1/status/${update.id}`,
            method: 'POST',
            data: { term_score: update.score },
          }),
        ),
      );

      // Refresh the statuses to get updated scores
      fetchStatusesCallback();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error updating term scores:', err);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newStatuses = Array.from(localStatuses);
    const [reorderedItem] = newStatuses.splice(sourceIndex, 1);
    newStatuses.splice(destinationIndex, 0, reorderedItem);

    setLocalStatuses(newStatuses);

    // Recalculate scores when order changes
    if (defaultStatusId) {
      recalculateScores(newStatuses, defaultStatusId);
    }
  };

  const handleRename = (id, newName) => {
    wp.apiFetch({
      path: `/alpaca/v1/status/${id}`,
      method: 'POST',
      data: { name: newName },
    })
      .then(() => fetchStatusesCallback())
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error renaming status:', err);
      });
  };

  const handleDelete = (id) => {
    const status = localStatuses.find((s) => s.term_id === id);
    if (status) {
      setStatusToDelete(status);
    }
  };

  const cancelDelete = () => {
    setStatusToDelete(null);
  };

  const performDelete = async () => {
    if (!statusToDelete) return;

    const { term_id: id, name: oldStatusName } = statusToDelete;
    setStatusToDelete(null); // Close modal immediately

    try {
      // The localStatuses are already sorted by term_score
      const sortedStatuses = localStatuses;
      const deletedIndex = sortedStatuses.findIndex((s) => s.term_id === id);

      if (deletedIndex === -1) {
        throw new Error('Status to delete not found.');
      }

      // Determine the new status ID
      let newStatusId = null;
      if (sortedStatuses.length > 1) {
        // If deleting the first status, assign to the next one
        if (deletedIndex === 0) {
          newStatusId = sortedStatuses[1].term_id;
        } else {
          // Otherwise, assign to the previous one
          newStatusId = sortedStatuses[deletedIndex - 1].term_id;
        }
      }

      const newStatus = localStatuses.find((s) => s.term_id === newStatusId);
      const newStatusName = newStatus ? newStatus.name : 'Unknown';

      // Find all posts with the status to be deleted
      const issuesToUpdate = await wp.apiFetch({
        path: `/wp/v2/issue?status=${id}&per_page=-1`,
      });

      // Re-categorize posts if a new status is determined
      if (newStatusId && issuesToUpdate.length > 0) {
        const updatePromises = issuesToUpdate.map((issue) => {
          return updateIssue(issue.id, {
            taxonomies: {
              status: [newStatusId],
            },
          })
            .then(() => {
              wp.hooks.doAction(
                'alpaca.statusChanged',
                issue,
                oldStatusName,
                newStatusName,
              );
            })
            .catch((err) => {
              // eslint-disable-next-line no-console
              console.error(`Failed to update issue ${issue.id}:`, err);
              return null; // Don't let one failure stop others
            });
        });
        await Promise.all(updatePromises);
      }

      // Delete the status term
      await wp.apiFetch({
        path: `/wp/v2/status/${id}?force=true`,
        method: 'DELETE',
      });

      // Refresh the statuses list
      fetchStatusesCallback();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error during status deletion process:', err);
    }
  };

  const handleAddStatus = () => {
    // eslint-disable-next-line no-alert
    const newName = window.prompt('Enter the name for the new status:');
    if (!newName || !newName.trim()) {
      return;
    }

    const maxScore = localStatuses.reduce(
      (max, s) => Math.max(max, parseInt(s.term_score, 10) || 0),
      0,
    );

    wp.apiFetch({
      path: `/wp/v2/status`,
      method: 'POST',
      data: { name: newName, meta: { term_score: maxScore + 10 } },
    })
      .then(() => fetchStatusesCallback())
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error adding status:', err);
      });
  };

  if (isLoading) return <Spinner />;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <h2>Status Manager</h2>
      <div className="alpaca-status-manager">
        <div className="status-grid">
          {/* Grid header */}
          <div className="status-grid-header">
            <div className="status-grid-cell">
              <strong>Name</strong>
            </div>
            <div className="status-grid-cell actions-cell">
              <strong>Actions</strong>
            </div>
          </div>

          {/* Draggable grid body */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="status-list">
              {(droppableProvided) => (
                <div
                  {...droppableProvided.droppableProps}
                  ref={droppableProvided.innerRef}
                  className="status-grid-body"
                >
                  {localStatuses.map((status, index) => (
                    <Draggable
                      key={status.term_id.toString()}
                      draggableId={status.term_id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <StatusRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          dragHandleProps={provided.dragHandleProps}
                          status={status}
                          onRename={handleRename}
                          onDelete={handleDelete}
                          isDragging={snapshot.isDragging}
                        />
                      )}
                    </Draggable>
                  ))}
                  {droppableProvided.placeholder}{' '}
                  {/* ✅ keep this last inside the droppable */}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <p>
          <Button isPrimary onClick={handleAddStatus}>
            New Status
          </Button>
        </p>

        {statusToDelete && (
          <Modal
            title="Delete Status?"
            onRequestClose={cancelDelete}
            className="alpaca-modal"
          >
            <p>
              Are you sure you want to delete the status &quot;
              <strong>{statusToDelete.name}</strong>&quot;? This cannot be
              undone.
            </p>
            <div className="alpaca-actions">
              <Button variant="primary" isDestructive onClick={performDelete}>
                Delete
              </Button>
              <Button isSecondary onClick={cancelDelete}>
                Cancel
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

StatusManager.propTypes = {
  statuses: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchStatuses: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onStatusesChange: PropTypes.func,
  defaultStatusId: PropTypes.number,
};

// StatusRow using grid cell display
const StatusRow = wp.element.forwardRef(
  (
    { status, onRename, onDelete, isDragging, dragHandleProps, ...props },
    ref,
  ) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [name, setName] = useState(status.name);
    const inputRef = useRef(null);

    useEffect(() => {
      if (isRenaming && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isRenaming]);

    const handleStartRename = () => {
      setIsRenaming(true);
    };

    const handleCancelRename = () => {
      setIsRenaming(false);
      setName(status.name);
    };

    const handleSaveRename = () => {
      setIsRenaming(false);
      if (name.trim() && name !== status.name) {
        onRename(status.term_id, name);
      } else {
        setName(status.name);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        handleSaveRename();
      } else if (event.key === 'Escape') {
        handleCancelRename();
      }
    };

    return (
      <div
        ref={ref}
        {...props}
        className={`status-grid-row ${isDragging ? 'is-dragging' : ''}`}
      >
        <div className="status-grid-cell">
          <div className="status-row-content">
            <div
              {...dragHandleProps}
              className="drag-handle"
              title="Drag to reorder"
            >
              <DragHandleIcon />
            </div>
            {isRenaming ? (
              <TextControl
                ref={inputRef}
                value={name}
                onChange={setName}
                onBlur={handleSaveRename}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <Button
                isTertiary
                icon="edit"
                iconPosition="right"
                className=""
                onClick={handleStartRename}
              >
                {status.name}
              </Button>
            )}
          </div>
        </div>
        <div className="status-grid-cell actions-cell">
          <Button
            icon="trash"
            label="Delete"
            onClick={() => onDelete(status.term_id)}
          />
        </div>
      </div>
    );
  },
);

StatusRow.displayName = 'StatusRow';

StatusRow.propTypes = {
  status: PropTypes.shape({
    term_id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onRename: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isDragging: PropTypes.bool,
  dragHandleProps: PropTypes.object,
};

export default StatusManager;
