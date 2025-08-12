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
  function SortableItem({ id, content, className, isDragDisabled = false }) {
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

    return (
      <div
        className={`${className}`}
        ref={setNodeRef}
        style={style}
        {...(!isDragDisabled
          ? { ...attributes, ...listeners }
          : { tabIndex: -1 })}
      >
        {content}
      </div>
    );
  }

  function Container({ id, items }) {
    const hasItems = items.length > 0;

    return (
      <div className="alpaca-container">
        <h3>{id.toUpperCase()}</h3>
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
        <div className="alpaca-wrap">
          {Object.entries(containers).map(([containerId, items]) => (
            <Container key={containerId} id={containerId} items={items} />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeId && draggedItem ? (
            <div className="alpaca-item-dragging">{draggedItem.content}</div>
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
