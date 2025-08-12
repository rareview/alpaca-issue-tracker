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
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

const AlpacaBoard = () => {
  return (
    <>
      <Board />
    </>
  );

  // SortableItem component: Represents a draggable and sortable item
  function SortableItem({
    id,
    content,
    className,
    isDragDisabled = false,
    onClick,
  }) {
    // Added onClick prop
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id,
      animateLayoutChanges: () => false,
      disabled: isDragDisabled,
    });

    const style = {
      transform: isDragging ? undefined : CSS.Transform.toString(transform),
      transition: isDragging ? "none" : transition,
      cursor: isDragging ? "grabbing" : isDragDisabled ? "default" : "grab",
      visibility: isDragging ? "hidden" : "visible",
      userSelect: isDragDisabled ? "none" : "auto",
    };

    // Handle click event: only trigger if not currently dragging
    const handleClick = (event) => {
      if (!isDragging && onClick) {
        onClick(event, id); // Pass the event and item ID to the onClick handler
      }
    };

    return (
      <div
        className={`${className}`}
        ref={setNodeRef}
        style={style}
        {...(!isDragDisabled
          ? { ...attributes, ...listeners }
          : { tabIndex: -1 })}
        onClick={handleClick} // Attach the click handler
      >
        {content}
      </div>
    );
  }

  // Container component: Holds a list of sortable items
  function Container({ id, items, onItemClick }) {
    // Added onItemClick prop
    const hasItems = items.length > 0;

    return (
      <div className="alpaca-container">
        <h2>{id}</h2>
        <SortableContext
          id={id}
          items={hasItems ? items.map((item) => item.id) : [id]}
          strategy={verticalListSortingStrategy}
        >
          {hasItems ? (
            items.map((item) => (
              <SortableItem
                className="alpaca-item"
                key={item.id}
                id={item.id}
                content={item.content}
                onClick={onItemClick} // Pass the click handler down
              />
            ))
          ) : (
            <SortableItem
              key={id}
              id={id}
              className="alpaca-item empty"
              content={"Drop items here"}
              isDragDisabled={true}
            />
          )}
        </SortableContext>
      </div>
    );
  }

  // Board component: Manages the overall DndContext and state
  function Board() {
    const [containers, setContainers] = useState({
      "To do": [
        { id: "c1", content: "Fix production bug" },
        { id: "c2", content: "Write comprehensive tests" },
        { id: "c5", content: "Refactor old module" },
      ],
      "In Progress": [{ id: "c3", content: "Build new UI feature" }],
      Done: [{ id: "c4", content: "Deploy latest version" }],
      Backlog: [
        { id: "c6", content: "Research new tech" },
        { id: "c7", content: "Update documentation" },
      ],
    });

    // Configure sensors for drag interactions (PointerSensor for mouse/touch)
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      })
    );

    const [activeId, setActiveId] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);

    // Helper function to find which container an item belongs to
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

    // Helper function to get the full item object by its ID
    function getItemById(id) {
      for (const containerItems of Object.values(containers)) {
        const item = containerItems.find((item) => item.id === id);
        if (item) return item;
      }
      return null;
    }

    // Handler for when a drag operation starts
    function handleDragStart(event) {
      const { active } = event;
      setActiveId(active.id);
      setDraggedItem(getItemById(active.id));
    }

    // Handler for when a draggable item is dragged over a droppable area
    function handleDragOver(event) {
      const { active, over } = event;

      if (!over) return;

      const activeContainer = findContainer(active.id);
      const overContainer = findContainer(over.id);

      if (
        !activeContainer ||
        !overContainer ||
        activeContainer === overContainer
      ) {
        return;
      }

      setContainers((prevContainers) => {
        const newContainers = { ...prevContainers };

        const activeItems = [...newContainers[activeContainer]];
        const overItems = [...newContainers[overContainer]];

        const activeIndex = activeItems.findIndex(
          (item) => item.id === active.id
        );

        if (activeIndex === -1) {
          return prevContainers;
        }

        const [movedItem] = activeItems.splice(activeIndex, 1);

        let newIndex;
        if (
          over.id === overContainer ||
          over.id === overItems[overItems.length - 1]?.id
        ) {
          newIndex = overItems.length;
        } else {
          newIndex = overItems.findIndex((item) => item.id === over.id);
          if (newIndex === -1) {
            newIndex = overItems.length;
          }
        }

        overItems.splice(newIndex, 0, movedItem);

        newContainers[activeContainer] = activeItems;
        newContainers[overContainer] = overItems;

        return newContainers;
      });
    }

    // Handler for when a drag operation ends
    function handleDragEnd(event) {
      const { active, over } = event;

      setActiveId(null);
      setDraggedItem(null);

      if (!over) {
        return;
      }

      const activeContainer = findContainer(active.id);
      const overContainer = findContainer(over.id);

      if (!activeContainer || !overContainer) {
        return;
      }

      if (activeContainer === overContainer) {
        const items = containers[activeContainer];
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        if (oldIndex !== newIndex) {
          setContainers((prev) => ({
            ...prev,
            [activeContainer]: arrayMove(items, oldIndex, newIndex),
          }));
        }
      }
      console.log("Drag is finished");
    }

    // NEW: Function to handle item clicks
    const handleItemClick = (event, itemId) => {
      console.log(`Item clicked: ${itemId}`);
      // You can add any action here, e.g., open a modal, show details, etc.
      // For demonstration, let's find the item and log its content
      const clickedItem = getItemById(itemId);
      if (clickedItem) {
        console.log(`Content: "${clickedItem.content}"`);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-br flex items-center justify-center py-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="alpaca-wrap">
            {Object.entries(containers).map(([containerId, items]) => (
              <Container
                key={containerId}
                id={containerId}
                items={items}
                onItemClick={handleItemClick}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeId && draggedItem ? (
              <div className="alpaca-item-dragging">{draggedItem.content}</div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
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
