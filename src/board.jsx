const { useState } = wp.element;
const { decodeEntities } = wp.htmlEntities;

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

/**
 * Transform server data into array format for board state.
 * @param {Array} data The data from `alpaca_get_board_data`.
 */
const transformDataForBoard = (data) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((column) => ({
    id: column.id.toString(),
    title: decodeEntities(column.title),
    items: column.issues.map((issue) => ({
      id: issue.id.toString(),
      content: decodeEntities(issue.title),
    })),
  }));
};

/**
 * Save board order in DOM order, including container IDs & titles.
 */
const saveBoardOrder = () => {
  const containersInDomOrder = document.querySelectorAll(".alpaca-container");

  const data = Array.from(containersInDomOrder).map((containerEl) => {
    const id = parseInt(containerEl.dataset.id, 10);
    const title = containerEl.querySelector("h2").textContent.trim();
    // Select all items except for the empty placeholder.
    const items = containerEl.querySelectorAll(".alpaca-item:not(.empty)");

    return {
      id,
      title,
      issues: Array.from(items).map((itemEl) =>
        parseInt(itemEl.dataset.id, 10)
      ),
    };
  });

  // Use wp.apiFetch to send data to the REST API endpoint.
  // It automatically handles nonces for authenticated requests.
  wp.apiFetch({
    path: "/alpaca/v1/board",
    method: "POST",
    data: data,
  })
    .then((res) => {
      // saved successfully
    })
    .catch((err) => {
      console.error("Error saving board order:", err);
    });
};

/**
 * Sortable item component.
 */
function SortableItem({
  id,
  content,
  className,
  isDragDisabled = false,
  onClick,
}) {
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

  const handleClick = (event) => {
    if (!isDragging && onClick) {
      onClick(event, id);
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
      onClick={handleClick}
      data-id={id}
    >
      {content}
    </div>
  );
}

/**
 * Container component.
 */
function Container({ id, title, items, onItemClick }) {
  const hasItems = items.length > 0;

  return (
    <div className="alpaca-container" data-id={id}>
      <h2 className="alpaca-container-title">{title}</h2>
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
              onClick={onItemClick}
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

/**
 * Main board component.
 */
function Board() {
  const [containers, setContainers] = useState(() => {
    if (typeof alpacaBoardData !== "undefined") {
      return transformDataForBoard(alpacaBoardData);
    }
    return [];
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const [activeId, setActiveId] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  function findContainerByItemId(itemId) {
    return containers.find((c) => c.items.some((item) => item.id === itemId));
  }

  function findContainerById(containerId) {
    return containers.find((c) => c.id === containerId);
  }

  function getItemById(itemId) {
    for (const container of containers) {
      const item = container.items.find((item) => item.id === itemId);
      if (item) return item;
    }
    return null;
  }

  function handleDragStart(event) {
    const { active } = event;
    setActiveId(active.id);
    setDraggedItem(getItemById(active.id));
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainerByItemId(active.id);
    const overContainer =
      findContainerByItemId(over.id) || findContainerById(over.id);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer.id === overContainer.id
    ) {
      return;
    }

    setContainers((prev) => {
      const newContainers = prev.map((c) => ({ ...c, items: [...c.items] }));

      const source = newContainers.find((c) => c.id === activeContainer.id);
      const destination = newContainers.find((c) => c.id === overContainer.id);

      const activeIndex = source.items.findIndex(
        (item) => item.id === active.id
      );
      const [movedItem] = source.items.splice(activeIndex, 1);

      let newIndex;
      if (over.id === overContainer.id) {
        newIndex = destination.items.length;
      } else {
        newIndex = destination.items.findIndex((item) => item.id === over.id);
        if (newIndex === -1) newIndex = destination.items.length;
      }

      destination.items.splice(newIndex, 0, movedItem);

      return newContainers;
    });
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    setDraggedItem(null);

    if (!over) return;

    const activeContainer = findContainerByItemId(active.id);
    const overContainer =
      findContainerByItemId(over.id) || findContainerById(over.id);

    if (!activeContainer || !overContainer) return;

    if (activeContainer.id === overContainer.id) {
      const items = activeContainer.items;
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      if (oldIndex !== newIndex) {
        setContainers((prev) =>
          prev.map((c) =>
            c.id === activeContainer.id
              ? { ...c, items: arrayMove(items, oldIndex, newIndex) }
              : c
          )
        );
      }
    }

    saveBoardOrder();

    // Send REST API call to update taxonomy term (status)
    const movedItemId = parseInt(active.id, 10);
    const newStatusTermId = parseInt(overContainer.id, 10);

    wp.apiFetch({
      path: `/issue/v1/update/${movedItemId}`,
      method: "POST",
      data: {
        taxonomies: {
          status: [newStatusTermId],
        },
      },
    })
      .then((res) => {
        // successfully updated
      })
      .catch((err) => {
        console.error("Error updating issue:", err);
      });
  }

  const handleItemClick = (event, itemId) => {
    const clickedItem = getItemById(itemId);
    if (clickedItem) {
      console.log(`Clicked: "${clickedItem.content}"`);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="alpaca-wrap">
        {containers.map((container) => (
          <Container
            key={container.id}
            id={container.id}
            title={container.title}
            items={container.items}
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
  );
}

export default function AlpacaBoard() {
  return <Board />;
}
