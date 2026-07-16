const { useState, useEffect, useRef } = wp.element;
const { __ } = wp.i18n;
const { Button, Spinner, TextControl } = wp.components;
import PropTypes from 'prop-types';

// Using native HTML5 drag/drop instead of Atlaskit
import Icon from './icons/Icon';
import { updateIssue } from '../services/issueApi';
import {
  SettingsList,
  SettingsListBody,
  SettingsListRow,
  SettingsListNameCell,
  SettingsListEditableRow,
  SettingsListActionsCell,
  SettingsListDeleteModal,
  useSettingsListDeleteConfirmation,
} from './settings/SettingsList';

const StatusManager = ({
  statuses,
  fetchStatuses: fetchStatusesCallback,
  isLoading,
  error,
  onStatusesChange,
}) => {
  const {
    itemToDelete: statusToDelete,
    requestDelete,
    cancelDelete,
  } = useSettingsListDeleteConfirmation();
  const [localStatuses, setLocalStatuses] = useState(statuses);
  const [creatingStatusKey, setCreatingStatusKey] = useState(null);

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
    setLocalStatuses((previousStatuses) =>
      previousStatuses.map((status) =>
        status.term_id === id ? { ...status, name: newName } : status,
      ),
    );

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
      requestDelete(status);
    }
  };

  const performDelete = async () => {
    if (!statusToDelete) return;

    const { term_id: id, name: oldStatusName } = statusToDelete;
    cancelDelete();

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
              // eslint-disable-next-line camelcase
              alpaca_status: [newStatusId],
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
    if (localStatuses.some((status) => status.isNew)) {
      return;
    }

    const newStatus = {
      term_id: null,
      name: '',
      key: `new-${Date.now()}`,
      isNew: true,
    };

    setLocalStatuses((previousStatuses) => [...previousStatuses, newStatus]);
  };

  const handleCreateStatus = (key, newName) => {
    if (creatingStatusKey === key) {
      return Promise.resolve();
    }

    setCreatingStatusKey(key);
    const maxScore = localStatuses.reduce(
      (max, status) => Math.max(max, parseInt(status.term_score, 10) || 0),
      0,
    );

    return wp
      .apiFetch({
        path: `/wp/v2/alpaca_status`,
        method: 'POST',
        data: { name: newName, meta: { term_score: maxScore + 10 } },
      })
      .then(() => {
        setLocalStatuses((previousStatuses) =>
          previousStatuses.filter((status) => status.key !== key),
        );
        fetchStatusesCallback();
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error adding status:', err);
        throw err;
      })
      .finally(() => {
        setCreatingStatusKey(null);
      });
  };

  const handleCancelNewStatus = (key) => {
    setLocalStatuses((previousStatuses) =>
      previousStatuses.filter((status) => status.key !== key),
    );
  };

  if (isLoading) return <Spinner />;
  if (error)
    return (
      <p>
        {__('Error:', 'alpaca-issue-tracker')} {error}
      </p>
    );

  return (
    <>
      <h2 className="screen-reader-text">
        {__('Status Manager', 'alpaca-issue-tracker')}
      </h2>
      <p className="alpaca-settings-manager-intro">
        {__(
          'Create and organize statuses. Drag rows to control their order across the board.',
          'alpaca-issue-tracker',
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
                          key={status.key || status.term_id.toString()}
                          ref={null}
                          status={status}
                          onRename={handleRename}
                          onDelete={handleDelete}
                          onCreate={handleCreateStatus}
                          onCancel={handleCancelNewStatus}
                          isNew={status.isNew}
                          isSaving={creatingStatusKey === status.key}
                          isDragging={false}
                          dragHandleProps={dh}
                          draggable={!status.isNew}
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
                        <div className="status-row-content alpaca-flex-align">
                          <div className="drag-handle alpaca-flex-align" />
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
                          key={status.key || status.term_id.toString()}
                          ref={null}
                          status={status}
                          onRename={handleRename}
                          onDelete={handleDelete}
                          onCreate={handleCreateStatus}
                          onCancel={handleCancelNewStatus}
                          isNew={status.isNew}
                          isSaving={creatingStatusKey === status.key}
                          isDragging={false}
                          dragHandleProps={dh}
                          draggable={!status.isNew}
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
                  key={status.key || status.term_id.toString()}
                  ref={null}
                  status={status}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onCreate={handleCreateStatus}
                  onCancel={handleCancelNewStatus}
                  isNew={status.isNew}
                  isSaving={creatingStatusKey === status.key}
                  isDragging={draggingIndex === index}
                  dragHandleProps={{
                    draggable: true,
                    onDragStart: (e) => handleRowDragStart(e, index),
                    onDragEnd: handleRowDragEnd,
                  }}
                  draggable={!status.isNew}
                  onDragStart={(e) => handleRowDragStart(e, index)}
                  onDragEnd={handleRowDragEnd}
                />
              ));
            })()}
          </SettingsListBody>
        </SettingsList>

        <p>
          <Button isPrimary onClick={handleAddStatus}>
            {__('New Status', 'alpaca-issue-tracker')}
          </Button>
        </p>

        {statusToDelete && (
          <SettingsListDeleteModal
            title={__('Delete Status?', 'alpaca-issue-tracker')}
            message={__(
              'Are you sure you want to delete the status',
              'alpaca-issue-tracker',
            )}
            name={statusToDelete.name}
            onConfirm={performDelete}
            onCancel={cancelDelete}
          />
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
    {
      status,
      onRename,
      onDelete,
      onCreate,
      onCancel,
      isNew,
      isSaving,
      isDragging,
      dragHandleProps,
      ...props
    },
    ref,
  ) => {
    const [newName, setNewName] = useState(status.name);
    const submittedRef = useRef(false);
    const newNameInputRef = useRef(null);
    const handleProps = dragHandleProps || {};

    useEffect(() => {
      if (isNew && newNameInputRef.current) {
        newNameInputRef.current.focus();
      }
    }, [isNew]);

    const submitNewStatus = () => {
      const trimmedName = newName.trim();

      if (!isNew || !trimmedName || submittedRef.current) {
        return;
      }

      submittedRef.current = true;
      Promise.resolve(onCreate(status.key, trimmedName)).catch(() => {
        submittedRef.current = false;
      });
    };

    const handleNewStatusKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitNewStatus();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onCancel(status.key);
      }
    };

    if (!isNew) {
      return (
        <SettingsListEditableRow
          ref={ref}
          {...props}
          className={`status-grid-row ${isDragging ? 'is-dragging' : ''}`}
          style={{ opacity: isDragging ? 0.35 : 1 }}
          value={status.name}
          onSave={(newStatusName) => onRename(status.term_id, newStatusName)}
          deleteLabel={__('Delete', 'alpaca-issue-tracker')}
          onDelete={() => onDelete(status.term_id)}
          disabled={isDragging}
          nameCellClassName="status-grid-cell"
          nameContentClassName="status-row-content alpaca-flex-align"
          namePrefix={
            <div
              {...handleProps}
              className="drag-handle alpaca-flex-align"
              title={__('Drag to reorder', 'alpaca-issue-tracker')}
            >
              <Icon name="drag-handle" style={{ verticalAlign: 'middle' }} />
            </div>
          }
          actionsCellClassName="status-grid-cell actions-cell"
        />
      );
    }

    return (
      <SettingsListRow
        ref={ref}
        {...props}
        className={`status-grid-row ${isDragging ? 'is-dragging' : ''}`}
        style={{ opacity: isDragging ? 0.35 : 1 }}
      >
        <SettingsListNameCell className="status-grid-cell">
          <div className="status-row-content alpaca-flex-align">
            <TextControl
              ref={newNameInputRef}
              className="alpaca-settings-list-name-editor"
              __next40pxDefaultSize
              __nextHasNoMarginBottom
              label={__('Name', 'alpaca-issue-tracker')}
              hideLabelFromVision
              placeholder={__('Status name', 'alpaca-issue-tracker')}
              value={newName}
              onChange={setNewName}
              onBlur={submitNewStatus}
              onKeyDown={handleNewStatusKeyDown}
              disabled={isSaving}
            />
          </div>
        </SettingsListNameCell>
        <SettingsListActionsCell className="status-grid-cell actions-cell" />
      </SettingsListRow>
    );
  },
);

StatusRow.displayName = 'StatusRow';

StatusRow.propTypes = {
  status: PropTypes.shape({
    term_id: PropTypes.number,
    name: PropTypes.string.isRequired,
    key: PropTypes.string,
    isNew: PropTypes.bool,
  }).isRequired,
  onRename: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isNew: PropTypes.bool,
  isSaving: PropTypes.bool,
  isDragging: PropTypes.bool,
  dragHandleProps: PropTypes.object,
};

export default StatusManager;
