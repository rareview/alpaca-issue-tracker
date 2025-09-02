import { generateCheckedItemComment } from "../utils/comments.js";
const { useState, useEffect, useRef } = wp.element;
const { useSelect } = wp.data;
const { Button, BaseControl, CheckboxControl, TextControl } = wp.components;
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@atlaskit/pragmatic-drag-and-drop-react-beautiful-dnd-migration";
import DragHandleIcon from "./icons/DragHandleIcon";

const Checklist = ({
  issueId,
  initialChecklistItems,
  isSaving,
  setIsSaving,
  createIssueComment,
}) => {
  const [checklistItems, setChecklistItems] = useState(
    initialChecklistItems || []
  );
  const [activeIndex, setActiveIndex] = useState(null);
  const checklistContainerRef = useRef(null);
  const prevChecklistLength = useRef(checklistItems.length);

  const { currentUser } = useSelect((select) => ({
    currentUser: select("core").getCurrentUser(),
  }));

  const saveChecklist = (items) => {
    setIsSaving(true);
    wp.apiFetch({
      path: `/issue/v1/checklist/${issueId}`,
      method: "POST",
      data: items,
    }).finally(() => setIsSaving(false));
  };

  const addChecklistItem = () => {
    const newItem = {
      id: Date.now(),
      label: "",
      checked: 0,
    };
    setChecklistItems((prevItems) => [...prevItems, newItem]);
  };

  const updateChecklistItemLabel = (index, newLabel) => {
    const newItems = [...checklistItems];
    newItems[index].label = newLabel;
    setChecklistItems(newItems);
  };

  const toggleChecklistItem = (index) => {
    const newItems = [...checklistItems];
    const currentItem = newItems[index];
    const isBeingChecked = currentItem.checked === 0;
    currentItem.checked = isBeingChecked ? currentUser.id : 0;

    setChecklistItems(newItems);
    saveChecklist(newItems);

    if (isBeingChecked && createIssueComment) {
      createIssueComment(
        issueId,
        generateCheckedItemComment(currentItem, currentUser)
      );
    }
  };

  const deleteChecklistItem = (index) => {
    const newItems = checklistItems.filter((_, i) => i !== index);
    setChecklistItems(newItems);
    saveChecklist(newItems);
  };

  const handleDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) return;

    const newItems = Array.from(checklistItems);
    const [reorderedItem] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, reorderedItem);

    setChecklistItems(newItems);
    saveChecklist(newItems);
  };

  const handleChecklistItemKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addChecklistItem();
    }
  };

  const handleChecklistItemBlur = (index) => {
    setActiveIndex(null);
    const item = checklistItems[index];
    if (item.label.trim() === "") {
      const newItems = checklistItems.filter((_, i) => i !== index);
      setChecklistItems(newItems);
      saveChecklist(newItems);
    } else {
      saveChecklist(checklistItems);
    }
  };

  useEffect(() => {
    if (checklistItems.length > prevChecklistLength.current) {
      if (checklistContainerRef.current) {
        const textInputs = checklistContainerRef.current.querySelectorAll(
          ".components-text-control__input"
        );
        if (textInputs.length > 0) {
          const lastInput = textInputs[textInputs.length - 1];
          if (lastInput) lastInput.focus();
        }
      }
    }
    prevChecklistLength.current = checklistItems.length;
  }, [checklistItems.length]);

  return (
    <div className="alpaca-checklist-container" ref={checklistContainerRef}>
      <BaseControl label="Checklist" className="alpaca-checklist-label" />
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="checklist"
          renderClone={(provided, snapshot, rubric) => {
            const item = checklistItems[rubric.source.index];
            return (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`alpaca-checklist-item ${
                  item.checked !== 0 ? "checked" : ""
                } alpaca-checklist-item--dragging`}
                style={{
                  ...provided.draggableProps.style,
                  left: 0, // lock X relative to container
                  // width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <CheckboxControl
                  checked={item.checked !== 0}
                  onChange={() => toggleChecklistItem(rubric.source.index)}
                />
                <TextControl
                  className="alpaca-textinput"
                  value={item.label}
                  onChange={(newLabel) =>
                    updateChecklistItemLabel(rubric.source.index, newLabel)
                  }
                  onFocus={() => setActiveIndex(rubric.source.index)}
                  onBlur={() => handleChecklistItemBlur(rubric.source.index)}
                  placeholder="Add an item..."
                />
                <Button
                  icon="trash"
                  onClick={() => deleteChecklistItem(rubric.source.index)}
                  label="Delete item"
                  showTooltip="true"
                />
                <div className="alpaca-drag-handle">
                  <DragHandleIcon />
                </div>
              </div>
            );
          }}
        >
          {(provided) => (
            <div
              className="alpaca-checklist"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {checklistItems.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`alpaca-checklist-item ${
                        item.checked !== 0 ? "checked" : ""
                      } ${activeIndex === index ? "active" : ""}`}
                    >
                      <CheckboxControl
                        checked={item.checked !== 0}
                        onChange={() => toggleChecklistItem(index)}
                      />
                      <TextControl
                        className="alpaca-textinput"
                        value={item.label}
                        onChange={(newLabel) =>
                          updateChecklistItemLabel(index, newLabel)
                        }
                        onFocus={() => setActiveIndex(index)}
                        onBlur={() => handleChecklistItemBlur(index)}
                        onKeyDown={(e) => handleChecklistItemKeyDown(e, index)}
                        placeholder="Add an item..."
                      />
                      <Button
                        icon="trash"
                        onClick={() => deleteChecklistItem(index)}
                        label="Delete item"
                        showTooltip="true"
                      />
                      <div className="alpaca-drag-handle">
                        <DragHandleIcon />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Button
        variant="secondary"
        icon="plus"
        iconPosition="left"
        onClick={addChecklistItem}
      >
        Add Checklist Item
      </Button>
    </div>
  );
};

export default Checklist;
