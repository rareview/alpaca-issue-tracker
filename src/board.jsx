const { useState, useRef, useEffect } = wp.element;
const { decodeEntities } = wp.htmlEntities;
const { Modal, TextareaControl, Button, Panel, PanelBody, PanelRow } =
  wp.components;

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
  const [selectedItem, setSelectedItem] = useState(null);
  const [issueDetails, setIssueDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const triggerRef = useRef(null); // To store the element that opened the modal
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
    // Store the trigger element so we can return focus to it when the modal closes.
    triggerRef.current = event.currentTarget;

    // Immediately blur the clicked item. This prevents the accessibility warning
    // by ensuring the item doesn't have focus when the modal applies `aria-hidden`
    // to the rest of the page. The Modal component will then trap focus inside itself.
    event.currentTarget.blur();

    const item = getItemById(itemId);
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIssueDetails(null);
  };

  // When the modal closes, return focus to the element that opened it.
  useEffect(() => {
    if (selectedItem === null && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [selectedItem]);

  useEffect(() => {
    if (selectedItem) {
      setIsLoadingDetails(true);
      setIssueDetails(null); // Clear previous details

      wp.apiFetch({
        path: `/issue/v1/get/${selectedItem.id}`,
      })
        .then((data) => {
          setIssueDetails(data);
          setIsLoadingDetails(false);
        })
        .catch((err) => {
          console.error("Error fetching issue details:", err);
          setIssueDetails({ error: "Failed to load details." });
          setIsLoadingDetails(false);
        });
    }
  }, [selectedItem]);

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

      {selectedItem && (
        <Modal
          title={
            <>
              Issue Details
              <span className="alpaca-issue-id"> #{selectedItem.id}</span>
            </>
          }
          size="large"
          onRequestClose={closeModal}
          className="alpaca-details-modal"
        >
          {isLoadingDetails ? (
            <p>Loading...</p>
          ) : issueDetails && issueDetails.success ? (
            <div className="alpaca-issue-details">
              <table className="wp-list-table widefat striped">
                <tbody>
                  <tr>
                    <th scope="row">Screenshot</th>
                    <td>
                      <p>
                        <img
                          src={issueDetails.meta.screenshot}
                          alt="Screenshot"
                          style={{ height: "240px" }}
                        />
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Submitted</th>
                    <td>
                      {new Date(
                        issueDetails.post_data.post_date
                      ).toLocaleString()}{" "}
                      by {issueDetails.post_data.post_author_display_name}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Description</th>
                    <td>{issueDetails.post_data.post_content}</td>
                  </tr>
                  <tr>
                    <th scope="row">URL</th>
                    <td>
                      {issueDetails.meta.URL ? (
                        <a
                          href={issueDetails.meta.URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {issueDetails.meta.URL}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Screen Size</th>
                    <td>
                      {issueDetails.meta.screenwidth &&
                      issueDetails.meta.screenheight
                        ? `${issueDetails.meta.screenwidth} x ${issueDetails.meta.screenheight}`
                        : "N/A"}
                    </td>
                  </tr>
                  {Object.entries(issueDetails.taxonomies).map(
                    ([taxonomy, terms]) => (
                      <tr key={taxonomy}>
                        <th scope="row" style={{ textTransform: "capitalize" }}>
                          {taxonomy}
                        </th>
                        <td>{terms.map((term) => term.name).join(", ")}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              <Panel>
                <PanelBody title="Raw data" initialOpen={false}>
                  <PanelRow>
                    <TextareaControl
                      readOnly
                      rows={10} // Increased rows to accommodate "large amount"
                      className="alpaca-modal-textarea json"
                      value={
                        isLoadingDetails
                          ? "Loading..."
                          : issueDetails
                          ? JSON.stringify(issueDetails, null, 2)
                          : ""
                      }
                    />
                  </PanelRow>
                </PanelBody>
              </Panel>
            </div>
          ) : (
            <p>{issueDetails?.message || "Could not load issue details."}</p>
          )}
          <Button isPrimary onClick={closeModal}>
            Close
          </Button>
        </Modal>
      )}
    </DndContext>
  );
}

export default function AlpacaBoard() {
  return <Board />;
}
