import { useState, createElement } from "react";
import { render } from "react-dom";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";

import {
  SortableContext,
  sortableKeyboardCoordinates,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

const AlpacaBoard = () => {
  function SortableItem({ id, content }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      animateLayoutChanges: () => false, // Disable all layout animations
    });

    const style = {
      // Only apply transform when not dragging to prevent snap-back
      transform: isDragging ? undefined : CSS.Transform.toString(transform),
      // Only use transition when not dragging
      transition: isDragging ? "none" : transition,
      padding: "8px 12px",
      margin: "4px 0",
      border: "1px solid #ccc",
      backgroundColor: "white",
      cursor: isDragging ? "grabbing" : "grab",
      visibility: isDragging ? "hidden" : "visible",
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {content}
      </div>
    );
  }

  function Container({ id, items }) {
    const hasItems = items.length > 0;

    return (
      <div
        style={{
          margin: "0 10px",
          padding: "10px",
          width: "250px",
          background: "#f4f5f7",
          borderRadius: "4px",
          minHeight: "300px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3>{id.toUpperCase()}</h3>
        <SortableContext
          id={id}
          items={hasItems ? items.map((item) => item.id) : [id]}
          strategy={verticalListSortingStrategy}
        >
          {hasItems ? (
            items.map((item) => (
              <SortableItem key={item.id} id={item.id} content={item.content} />
            ))
          ) : (
            <SortableItem
              key={id}
              id={id}
              content={
                <i style={{ color: "#999", fontStyle: "italic" }}>
                  Drop items here
                </i>
              }
            />
          )}
        </SortableContext>
      </div>
    );
  }

  function Board() {
    const [containers, setContainers] = useState({
      todo: [
        { id: "c1", content: "Fix bug" },
        { id: "c2", content: "Write tests" },
      ],
      inprogress: [{ id: "c3", content: "Build UI" }],
      done: [{ id: "c4", content: "Deploy" }],
      backlog: [],
    });

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      })
    );

    const [activeId, setActiveId] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);

    function findContainer(id) {
      for (const key in containers) {
        if (containers[key].some((item) => item.id === id)) {
          return key;
        }
      }
      if (containers[id] !== undefined) {
        return id;
      }
      return null;
    }

    function getItemById(id) {
      for (const containerItems of Object.values(containers)) {
        const item = containerItems.find((item) => item.id === id);
        if (item) return item;
      }
      return null;
    }

    function handleDragStart(event) {
      const { active } = event;
      setActiveId(active.id);
      setDraggedItem(getItemById(active.id));
    }

    function handleDragEnd(event) {
      const { active, over } = event;

      if (!over) {
        setActiveId(null);
        setDraggedItem(null);
        return;
      }

      const activeContainer = findContainer(active.id);
      let overContainer = findContainer(over.id);

      if (!activeContainer || !overContainer) {
        setActiveId(null);
        setDraggedItem(null);
        return;
      }

      // Use requestAnimationFrame to ensure state updates happen after drag end
      requestAnimationFrame(() => {
        if (activeContainer === overContainer) {
          const items = containers[activeContainer];
          const oldIndex = items.findIndex((i) => i.id === active.id);
          let newIndex = items.findIndex((i) => i.id === over.id);

          if (newIndex === -1) {
            newIndex = items.length - 1;
          }

          if (oldIndex !== newIndex) {
            const newItems = arrayMove(items, oldIndex, newIndex);
            setContainers((prev) => ({
              ...prev,
              [activeContainer]: newItems,
            }));
          }
        } else {
          const activeItems = [...containers[activeContainer]];
          const overItems = [...containers[overContainer]];
          const activeIndex = activeItems.findIndex((i) => i.id === active.id);

          let overIndex = overItems.findIndex((i) => i.id === over.id);
          if (overIndex === -1) {
            overIndex = overItems.length;
          }

          const [moved] = activeItems.splice(activeIndex, 1);
          overItems.splice(overIndex, 0, moved);

          setContainers((prev) => ({
            ...prev,
            [activeContainer]: activeItems,
            [overContainer]: overItems,
          }));
        }

        setActiveId(null);
        setDraggedItem(null);
      });
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: "flex", padding: "10px" }}>
          {Object.entries(containers).map(([containerId, items]) => (
            <Container key={containerId} id={containerId} items={items} />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeId && draggedItem ? (
            <div
              style={{
                padding: "8px 12px",
                margin: "4px 0",
                background: "white",
                borderRadius: 4,
                border: "2px solid #007cba",
                boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
                cursor: "grabbing",
                transform: "rotate(5deg)",
              }}
            >
              {draggedItem.content}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }

  wp.domReady(() => {
    const el = document.getElementById("alpaca-board");
    if (el) {
      render(<Board />, el);
    }
  });
};

export default AlpacaBoard;
