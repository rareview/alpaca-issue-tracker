import { generateCheckedItemComment } from "../utils/comments.js";
const { useState, useEffect, useRef } = wp.element;
const { useSelect } = wp.data;
const { Button, BaseControl, CheckboxControl, TextControl } = wp.components;

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

    if (isBeingChecked) {
      // addChecklistItem();
      if (createIssueComment) {
        createIssueComment(
          issueId,
          generateCheckedItemComment(currentItem, currentUser)
        );
      }
    }
  };

  const deleteChecklistItem = (index) => {
    const newItems = checklistItems.filter((_, i) => i !== index);
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
          if (lastInput) {
            lastInput.focus();
          }
        }
      }
    }
    prevChecklistLength.current = checklistItems.length;
  }, [checklistItems.length]);

  return (
    <div className="alpaca-checklist-container">
      <BaseControl label="Checklist" className="alpaca-checklist-label" />
      <div className="alpaca-checklist" ref={checklistContainerRef}>
        {checklistItems.map((item, index) => (
          <div
            className={`alpaca-checklist-item ${
              item.checked !== 0 ? "checked" : ""
            } ${activeIndex === index ? "active" : ""}`}
            key={item.id}
          >
            <CheckboxControl
              checked={item.checked !== 0}
              onChange={() => toggleChecklistItem(index)}
            />
            <TextControl
              className="alpaca-textinput"
              value={item.label}
              onChange={(newLabel) => updateChecklistItemLabel(index, newLabel)}
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
          </div>
        ))}
      </div>
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
