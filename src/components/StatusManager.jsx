const { useState, useEffect, useCallback } = wp.element;
const { Button, Spinner } = wp.components;
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

const StatusManager = () => {
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatuses = useCallback(() => {
    setIsLoading(true);
    wp.apiFetch({ path: "/alpaca/v1/statuses" })
      .then((data) => {
        setStatuses(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setStatuses((items) => {
        const oldIndex = items.findIndex((item) => item.term_id === active.id);
        const newIndex = items.findIndex((item) => item.term_id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        console.log(
          "New order (drag):",
          newOrder.map((s) => s.name)
        );
        // TODO: Save new order by updating term_score for each status
        return newOrder;
      });
    }
  };

  const handleMove = (id, direction) => {
    const oldIndex = statuses.findIndex((s) => s.term_id === id);
    if (oldIndex === -1) return;

    const newIndex = oldIndex + direction;
    if (newIndex < 0 || newIndex >= statuses.length) return;

    const newOrder = arrayMove(statuses, oldIndex, newIndex);
    setStatuses(newOrder);
    console.log(
      "New order (click):",
      newOrder.map((s) => s.name)
    );
    // TODO: Save new order
  };

  const handleRename = (id, newName) => {
    const originalStatuses = [...statuses];
    const updatedStatuses = statuses.map((status) =>
      status.term_id === id ? { ...status, name: newName } : status
    );
    setStatuses(updatedStatuses);

    wp.apiFetch({
      path: `/alpaca/v1/status/${id}`,
      method: "POST",
      data: { name: newName },
    }).catch((err) => {
      console.error("Error renaming status:", err);
      setStatuses(originalStatuses);
      alert("Error renaming status: " + err.message);
    });
  };

  const handleDelete = (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this status? This cannot be undone."
      )
    ) {
      return;
    }

    const originalStatuses = [...statuses];
    setStatuses((prev) => prev.filter((status) => status.term_id !== id));

    wp.apiFetch({
      path: `/wp/v2/status/${id}?force=true`,
      method: "DELETE",
    }).catch((err) => {
      console.error("Error deleting status:", err);
      setStatuses(originalStatuses);
      alert("Error deleting status: " + err.message);
    });
  };

  const handleAddStatus = () => {
    const newName = prompt("Enter the name for the new status:");
    if (!newName || !newName.trim()) {
      return;
    }

    const maxScore = statuses.reduce(
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
          items={statuses.map((s) => s.term_id)}
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
              {statuses.map((status, index) => (
                <SortableStatusRow
                  key={status.term_id}
                  id={status.term_id}
                  status={status}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  isFirst={index === 0}
                  isLast={index === statuses.length - 1}
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
    </div>
  );
};

export default StatusManager;
