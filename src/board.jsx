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

const AlpacaBoard = () => {
  function SortableItem({ id, content }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
      transition: isDragging ? "none" : transition, // disable transition while dragging
      padding: "8px 12px",
      margin: "4px 0",
      border: "1px solid #ccc",
      backgroundColor: isDragging ? "#eee" : "white",
      cursor: "grab",
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
          items={hasItems ? items.map((item) => item.id) : [id]} // container id as dummy sortable item
          strategy={verticalListSortingStrategy}
        >
          {hasItems ? (
            items.map((item) => (
              <SortableItem key={item.id} id={item.id} content={item.content} />
            ))
          ) : (
            // Render the placeholder as a SortableItem so it can receive drops
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
      backlog: [], // empty container example
    });

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      })
    );

    const [activeId, setActiveId] = useState(null);

    function findContainer(id) {
      for (const key in containers) {
        if (containers[key].some((item) => item.id === id)) {
          return key;
        }
      }
      // also check if id is a container id (for placeholders)
      if (containers[id] !== undefined) {
        return id;
      }
      return null;
    }

    function handleDragStart(event) {
      setActiveId(event.active.id);
    }

    function handleDragEnd(event) {
      const { active, over } = event;

      if (!over) {
        setActiveId(null);
        return;
      }

      const activeContainer = findContainer(active.id);
      let overContainer = findContainer(over.id);

      if (!activeContainer || !overContainer) {
        setActiveId(null);
        return;
      }

      if (activeContainer === overContainer) {
        const items = containers[activeContainer];
        const oldIndex = items.findIndex((i) => i.id === active.id);
        let newIndex = items.findIndex((i) => i.id === over.id);

        // If dropped on placeholder (over.id === container id), put at end
        if (newIndex === -1) {
          newIndex = items.length - 1;
        }

        if (oldIndex !== newIndex) {
          const newItems = arrayMove(items, oldIndex, newIndex);
          setContainers({
            ...containers,
            [activeContainer]: newItems,
          });
        }
      } else {
        // Move between containers
        const activeItems = [...containers[activeContainer]];
        const overItems = [...containers[overContainer]];
        const activeIndex = activeItems.findIndex((i) => i.id === active.id);

        let overIndex = overItems.findIndex((i) => i.id === over.id);
        if (overIndex === -1) {
          overIndex = overItems.length;
        }

        const [moved] = activeItems.splice(activeIndex, 1);
        overItems.splice(overIndex, 0, moved);

        setContainers({
          ...containers,
          [activeContainer]: activeItems,
          [overContainer]: overItems,
        });
      }
      setActiveId(null);
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

        <DragOverlay>
          {activeId ? (
            <div
              style={{ padding: 8, background: "lightblue", borderRadius: 4 }}
            >
              {
                containers[findContainer(activeId)].find(
                  (i) => i.id === activeId
                ).content
              }
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
