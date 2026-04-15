const { useState, useEffect, useRef } = wp.element;
const { __ } = wp.i18n;
const { Button, Spinner, Modal, TextControl } = wp.components;
import PropTypes from 'prop-types';

// Using native HTML5 drag/drop instead of Atlaskit
import Icon from './icons/Icon';
import { updateIssue } from '../services/issueApi';
import {
  SettingsList,
  SettingsListBody,
  SettingsListRow,
  SettingsListNameCell,
  SettingsListActionsCell,
} from './settings/SettingsList';

const StatusManager = ({
  statuses,
  fetchStatuses: fetchStatusesCallback,
  isLoading,
  error,
  onStatusesChange,
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

  const listRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [dragSourceIndex, setDragSourceIndex] = useState(null);

  // Recalculate term_scores based on order
  // Scores are sequential starting from 0 for the first status
  const recalculateScores = async (statusesArray) => {
    try {
      // Calculate scores based on position: first = 0, second = 1, etc.
      const scoreUpdates = statusesArray.map((status, index) => ({
        id: status.term_id,
        score: index,
      }));

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

      // Refresh in the background to keep the UI stable during drag/drop saves.
      fetchStatusesCallback({ silent: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error updating term scores:', err);
    }
  };

  const handleReorder = (sourceIndex, destinationIndex) => {
    if (sourceIndex === destinationIndex) return;

    const newStatuses = Array.from(localStatuses);
    const [reorderedItem] = newStatuses.splice(sourceIndex, 1);
    newStatuses.splice(destinationIndex, 0, reorderedItem);

    setLocalStatuses(newStatuses);

    // Always recalculate scores when order changes
    recalculateScores(newStatuses);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);

    // throttle dragover processing to avoid jank
    if (!handleDragOver._last || Date.now() - handleDragOver._last > 50) {
      handleDragOver._last = Date.now();
    } else {
      return;
    }

    // Read payload from dataTransfer or fallback global state
    let parsed = null;
    try {
      const raw =
        e.dataTransfer.getData('application/json') ||
        e.dataTransfer.getData('text/plain');
      if (raw) parsed = JSON.parse(raw);
    } catch (err) {
      parsed = null;
    }

    if (!parsed && typeof window !== 'undefined') {
      parsed = window.__alpacaDragState || null;
    }

    if (parsed && typeof parsed.sourceIndex === 'number') {
      const dest = getDropIndex(e);
      setDragOverIndex(dest);
      // include status data if present
      setDragOverStatus(
        parsed.status || localStatuses[parsed.sourceIndex] || null,
      );
      setDragSourceIndex(parsed.sourceIndex);
    } else {
      setDragOverIndex(null);
      setDragOverStatus(null);
      setDragSourceIndex(null);
    }
  };

  const handleDragLeave = (e) => {
    if (listRef.current && !listRef.current.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const getDropIndex = (e) => {
    const el = listRef.current;
    if (!el) return localStatuses.length - 1;
    const children = Array.from(
      el.querySelectorAll('.alpaca-settings-list-row'),
    );
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) return i;
    }
    return children.length - 1;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    // prefer dataTransfer payload, fallback to global state
    let parsed = null;
    try {
      const raw =
        e.dataTransfer.getData('application/json') ||
        e.dataTransfer.getData('text/plain');
      if (raw) parsed = JSON.parse(raw);
    } catch (err) {
      parsed = null;
    }
    if (!parsed && typeof window !== 'undefined')
      parsed = window.__alpacaDragState || null;

    const sourceIndex =
      parsed && typeof parsed.sourceIndex === 'number'
        ? parsed.sourceIndex
        : null;
    const destIndex = getDropIndex(e);
    if (sourceIndex !== null) {
      // clear any preview state first
      setDragOverIndex(null);
      setDragOverStatus(null);
      handleReorder(sourceIndex, destIndex);
    }
    setDraggingIndex(null);
    setDragSourceIndex(null);
  };

  const handleRowDragStart = (e, index) => {
    setDraggingIndex(index);
    const payload = { sourceIndex: index, status: localStatuses[index] };
    try {
      e.dataTransfer.setData('application/json', JSON.stringify(payload));
    } catch (err) {
      // ignore
    }

    // Fallback global drag state for dragover handlers
    try {
      window.__alpacaDragState = payload;
    } catch (err) {
      // ignore
    }

    // Use a compact custom drag image that does not inherit UI component padding.
    const rowEl =
      e.currentTarget && e.currentTarget.closest
        ? e.currentTarget.closest('.status-grid-row') ||
          e.currentTarget.closest('.alpaca-settings-list-row')
        : e.currentTarget;

    if (rowEl && e.dataTransfer && e.dataTransfer.setDragImage) {
      const ghost = document.createElement('div');
      const iconWrap = document.createElement('span');
      const text = document.createElement('span');
      const statusName =
        localStatuses[index] && localStatuses[index].name
          ? localStatuses[index].name
          : '';

      ghost.className = 'alpaca-status-drag-ghost';
      ghost.style.position = 'absolute';
      ghost.style.top = '-10000px';
      ghost.style.left = '-10000px';
      ghost.style.display = 'inline-flex';
      ghost.style.alignItems = 'center';
      ghost.style.padding = '6px 10px';
      ghost.style.border = '1px solid #d0d7de';
      ghost.style.borderRadius = '8px';
      ghost.style.background = '#fff';
      ghost.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
      ghost.style.maxWidth = '320px';
      ghost.style.gap = '8px';
      ghost.style.fontSize = '13px';
      ghost.style.lineHeight = '1.4';

      iconWrap.textContent = '⋮⋮';
      iconWrap.style.color = '#8c8f94';
      iconWrap.style.fontSize = '12px';
      iconWrap.style.letterSpacing = '-1px';
      iconWrap.style.flex = '0 0 16px';

      text.textContent = statusName;
      text.style.color = '#1d2327';
      text.style.whiteSpace = 'nowrap';
      text.style.overflow = 'hidden';
      text.style.textOverflow = 'ellipsis';

      ghost.appendChild(iconWrap);
      ghost.appendChild(text);
      document.body.appendChild(ghost);

      try {
        e.dataTransfer.setDragImage(ghost, 16, 16);
      } catch (err) {
        // ignore
      }

      setTimeout(() => {
        try {
          document.body.removeChild(ghost);
        } catch (err) {
          // ignore
        }
      }, 0);
    }
  };

  const handleRowDragEnd = () => {
    setDraggingIndex(null);
    try {
      delete window.__alpacaDragState;
    } catch (err) {
      // ignore
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
        path: `/wp/v2/alpaca_issue?alpaca_status=${id}&per_page=-1`,
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
        path: `/wp/v2/alpaca_status/${id}?force=true`,
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
    const newName = window.prompt(
      __('Enter the name for the new status:', 'alpaca'),
    );
    if (!newName || !newName.trim()) {
      return;
    }

    const maxScore = localStatuses.reduce(
      (max, s) => Math.max(max, parseInt(s.term_score, 10) || 0),
      0,
    );

    wp.apiFetch({
      path: `/wp/v2/alpaca_status`,
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
  if (error)
    return (
      <p>
        {__('Error:', 'alpaca')} {error}
      </p>
    );

  return (
    <>
      <h2 className="screen-reader-text">{__('Status Manager', 'alpaca')}</h2>
      <p className="alpaca-settings-manager-intro">
        {__(
          'Create and organize statuses. Drag rows to control their order across the board.',
          'alpaca',
        )}
      </p>
      <div className="alpaca-status-manager">
        <SettingsList className="status-grid">
          {/* Draggable grid body (native HTML5 drag/drop) */}
          <SettingsListBody
            bodyRef={listRef}
            className={`status-grid-body ${isDragOver ? 'dragging-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {(() => {
              if (dragOverStatus) {
                // build preview list: remove source index and insert placeholder at dragOverIndex
                let srcIndex = null;
                if (typeof dragSourceIndex === 'number') {
                  srcIndex = dragSourceIndex;
                } else if (typeof draggingIndex === 'number') {
                  srcIndex = draggingIndex;
                }
                const preview = [...localStatuses];
                if (srcIndex !== null) preview.splice(srcIndex, 1);
                const insertAt = Math.max(
                  0,
                  Math.min(
                    preview.length,
                    dragOverIndex === null ||
                      typeof dragOverIndex === 'undefined'
                      ? preview.length
                      : dragOverIndex,
                  ),
                );

                return (
                  <>
                    {preview.slice(0, insertAt).map((status, i) => {
                      const idx = i >= srcIndex ? i + 1 : i;
                      const dh = {
                        draggable: true,
                        onDragStart: (e) => handleRowDragStart(e, idx),
                        onDragEnd: handleRowDragEnd,
                      };

                      return (
                        <StatusRow
                          key={status.term_id.toString()}
                          ref={null}
                          status={status}
                          onRename={handleRename}
                          onDelete={handleDelete}
                          isDragging={false}
                          dragHandleProps={dh}
                          draggable={true}
                          onDragStart={(e) => handleRowDragStart(e, idx)}
                          onDragEnd={handleRowDragEnd}
                        />
                      );
                    })}

                    <SettingsListRow
                      className="status-grid-row placeholder"
                      key="status-placeholder"
                    >
                      <SettingsListNameCell className="status-grid-cell">
                        <div className="status-row-content flexalign">
                          <div className="drag-handle flexalign" />
                          <Button isTertiary className="placeholder-label">
                            {dragOverStatus.name}
                          </Button>
                        </div>
                      </SettingsListNameCell>
                      <SettingsListActionsCell className="status-grid-cell actions-cell" />
                    </SettingsListRow>

                    {preview.slice(insertAt).map((status, i) => {
                      const idx = insertAt + i;
                      const dh = {
                        draggable: true,
                        onDragStart: (e) => handleRowDragStart(e, idx),
                        onDragEnd: handleRowDragEnd,
                      };

                      return (
                        <StatusRow
                          key={status.term_id.toString()}
                          ref={null}
                          status={status}
                          onRename={handleRename}
                          onDelete={handleDelete}
                          isDragging={false}
                          dragHandleProps={dh}
                          draggable={true}
                          onDragStart={(e) => handleRowDragStart(e, idx)}
                          onDragEnd={handleRowDragEnd}
                        />
                      );
                    })}
                  </>
                );
              }

              return localStatuses.map((status, index) => (
                <StatusRow
                  key={status.term_id.toString()}
                  ref={null}
                  status={status}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  isDragging={draggingIndex === index}
                  dragHandleProps={{
                    draggable: true,
                    onDragStart: (e) => handleRowDragStart(e, index),
                    onDragEnd: handleRowDragEnd,
                  }}
                  draggable={true}
                  onDragStart={(e) => handleRowDragStart(e, index)}
                  onDragEnd={handleRowDragEnd}
                />
              ));
            })()}
          </SettingsListBody>
        </SettingsList>

        <p>
          <Button isPrimary onClick={handleAddStatus}>
            {__('New Status', 'alpaca')}
          </Button>
        </p>

        {statusToDelete && (
          <Modal
            title={__('Delete Status?', 'alpaca')}
            onRequestClose={cancelDelete}
            className="alpaca-modal"
          >
            <p>
              {__('Are you sure you want to delete the status', 'alpaca')}{' '}
              &quot;
              <strong>{statusToDelete.name}</strong>&quot;?{' '}
              {__('This cannot be undone.', 'alpaca')}
            </p>
            <div className="alpaca-actions flexalign">
              <Button variant="primary" isDestructive onClick={performDelete}>
                {__('Delete', 'alpaca')}
              </Button>
              <Button isSecondary onClick={cancelDelete}>
                {__('Cancel', 'alpaca')}
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
};

StatusManager.defaultProps = {
  isLoading: false,
  error: '',
  onStatusesChange: null,
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

    const handleProps = dragHandleProps || {};

    return (
      <SettingsListRow
        ref={ref}
        {...props}
        className={`status-grid-row ${isDragging ? 'is-dragging' : ''}`}
        style={{ opacity: isDragging ? 0.35 : 1 }}
      >
        <SettingsListNameCell className="status-grid-cell">
          <div className="status-row-content flexalign">
            <div
              {...handleProps}
              className="drag-handle flexalign"
              title={__('Drag to reorder', 'alpaca')}
            >
              <Icon name="drag-handle" style={{ verticalAlign: 'middle' }} />
            </div>
            {isRenaming ? (
              <TextControl
                ref={inputRef}
                __next40pxDefaultSize
                __nextHasNoMarginBottom
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
        </SettingsListNameCell>
        <SettingsListActionsCell className="status-grid-cell actions-cell">
          <Button
            icon="trash"
            className="alpaca-settings-table-delete"
            label={__('Delete', 'alpaca')}
            isDestructive
            onClick={() => onDelete(status.term_id)}
          />
        </SettingsListActionsCell>
      </SettingsListRow>
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
