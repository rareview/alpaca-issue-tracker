const { useState, useEffect, useRef } = wp.element;
const { Button, Spinner, Modal, TextControl } = wp.components;

const StatusManager = ({
  statuses,
  fetchStatuses,
  isLoading,
  error,
  onStatusesChange,
  defaultStatusId,
}) => {
  const [statusToDelete, setStatusToDelete] = useState(null);
  const [localStatuses, setLocalStatuses] = useState(statuses);
  const [isUpdatingScores, setIsUpdatingScores] = useState(false);

  // fix: table flashes when statuses move

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

    setIsUpdatingScores(true);

    try {
      const defaultIndex = statusesArray.findIndex(
        (s) => s.term_id.toString() === defaultId
      );
      if (defaultIndex === -1) return; // Default status not found

      // Calculate scores relative to default status
      const scoreUpdates = statusesArray.map((status, index) => {
        const score = index - defaultIndex; // Default gets 0, above get negative, below get positive
        return {
          id: status.term_id,
          score: score,
        };
      });

      // Update all scores via API
      await Promise.all(
        scoreUpdates.map((update) =>
          wp.apiFetch({
            path: `/alpaca/v1/status/${update.id}`,
            method: "POST",
            data: { term_score: update.score },
          })
        )
      );

      // Refresh the statuses to get updated scores
      fetchStatuses();
    } catch (err) {
      console.error("Error updating term scores:", err);
      alert("Error updating status order: " + err.message);
    } finally {
      setIsUpdatingScores(false);
    }
  };

  const handleMove = (id, direction) => {
    const oldIndex = localStatuses.findIndex((s) => s.term_id === id);
    if (oldIndex === -1) return;

    const newIndex = oldIndex + direction;
    if (newIndex < 0 || newIndex >= localStatuses.length) return;

    const newStatuses = [...localStatuses];
    const [movedItem] = newStatuses.splice(oldIndex, 1);
    newStatuses.splice(newIndex, 0, movedItem);

    setLocalStatuses(newStatuses);

    // Recalculate scores when order changes
    if (defaultStatusId) {
      recalculateScores(newStatuses, defaultStatusId);
    }
  };

  const handleRename = (id, newName) => {
    wp.apiFetch({
      path: `/alpaca/v1/status/${id}`,
      method: "POST",
      data: { name: newName },
    })
      .then(() => fetchStatuses())
      .catch((err) => {
        console.error("Error renaming status:", err);
        alert("Error renaming status: " + err.message);
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

  const performDelete = () => {
    if (!statusToDelete) return;

    const { term_id: id } = statusToDelete;
    setStatusToDelete(null); // Close modal immediately

    wp.apiFetch({
      path: `/wp/v2/status/${id}?force=true`,
      method: "DELETE",
    })
      .then(() => fetchStatuses())
      .catch((err) => {
        console.error("Error deleting status:", err);
        alert("Error deleting status: " + err.message);
      });
  };

  const handleAddStatus = () => {
    const newName = prompt("Enter the name for the new status:");
    if (!newName || !newName.trim()) {
      return;
    }

    const maxScore = localStatuses.reduce(
      (max, s) => Math.max(max, parseInt(s.term_score, 10) || 0),
      0
    );

    wp.apiFetch({
      path: `/wp/v2/status`,
      method: "POST",
      data: { name: newName, meta: { term_score: maxScore + 10 } },
    })
      .then(() => fetchStatuses())
      .catch((err) => {
        console.error("Error adding status:", err);
        alert("Error adding status: " + err.message);
      });
  };

  if (isLoading) return <Spinner />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="alpaca-status-manager">
      <table className="wp-list-table widefat striped">
        <thead>
          <tr>
            <th>Name</th>
            <th className="alpaca-status-manager-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {localStatuses.map((status, index) => (
            <StatusRow
              key={status.term_id}
              status={status}
              onRename={handleRename}
              onDelete={handleDelete}
              onMove={handleMove}
              isFirst={index === 0}
              isLast={index === localStatuses.length - 1}
            />
          ))}
        </tbody>
      </table>

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
            Are you sure you want to delete the status "
            <strong>{statusToDelete.name}</strong>"? This cannot be undone.
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
  );
};

// Simple StatusRow component without drag-and-drop
const StatusRow = ({ status, onRename, onDelete, onMove, isFirst, isLast }) => {
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
    if (event.key === "Enter") {
      handleSaveRename();
    } else if (event.key === "Escape") {
      handleCancelRename();
    }
  };

  return (
    <tr>
      <td className="alpaca-status-manager-name">
        {isRenaming ? (
          <TextControl
            ref={inputRef}
            value={name}
            onChange={setName}
            onBlur={handleSaveRename}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <button className="button-link" onClick={handleStartRename}>
            {status.name} <span className="dashicons dashicons-edit"></span>
          </button>
        )}
      </td>
      <td className="alpaca-status-manager-actions">
        <Button
          icon="arrow-up-alt2"
          label="Move Up"
          onClick={() => onMove(status.term_id, -1)}
          disabled={isFirst}
        />
        <Button
          icon="arrow-down-alt2"
          label="Move Down"
          onClick={() => onMove(status.term_id, 1)}
          disabled={isLast}
        />
        <Button
          icon="trash"
          // isDestructive
          onClick={() => onDelete(status.term_id)}
        />
      </td>
    </tr>
  );
};

export default StatusManager;
