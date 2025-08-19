const { useState, useEffect, useCallback } = wp.element;
const { Button, Spinner, Modal } = wp.components;
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableStatusRow from "./SortableStatusRow";

const StatusManager = ({ statuses, fetchStatuses, isLoading, error }) => {
  const [statusToDelete, setStatusToDelete] = useState(null);
  const [localStatuses, setLocalStatuses] = useState(statuses);

  useEffect(() => {
    setLocalStatuses(statuses);
  }, [statuses]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setLocalStatuses((items) => {
        const oldIndex = items.findIndex((item) => item.term_id === active.id);
        const newIndex = items.findIndex((item) => item.term_id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        // TODO: Save new order by updating term_score for each status
        return newOrder;
      });
    }
  };

  const handleMove = (id, direction) => {
    const oldIndex = localStatuses.findIndex((s) => s.term_id === id);
    if (oldIndex === -1) return;

    const newIndex = oldIndex + direction;
    if (newIndex < 0 || newIndex >= localStatuses.length) return;

    const newOrder = arrayMove(localStatuses, oldIndex, newIndex);
    setLocalStatuses(newOrder);
    // TODO: Save new order
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localStatuses.map((s) => s.term_id)}
          strategy={verticalListSortingStrategy}
        >
          <table className="wp-list-table widefat striped">
            <thead>
              <tr>
                <th style={{ width: "50px" }}></th>
                <th>Name</th>
                <th style={{ width: "200px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {localStatuses.map((status, index) => (
                <SortableStatusRow
                  key={status.term_id}
                  id={status.term_id}
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
        </SortableContext>
      </DndContext>
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


export default StatusManager;
