const { useState, useRef, useEffect } = wp.element;
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
const { TextControl, Button, Dashicon } = wp.components;

const SortableStatusRow = ({
  id,
  status,
  onRename,
  onDelete,
  onMove,
  isFirst,
  isLast,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(status.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleStartRename = () => {
    setIsRenaming(true);
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setName(status.name);
  };

  const handleSaveRename = () => {
    setIsRenaming(false);
    if (name.trim() && name !== status.name) {
      onRename(id, name);
    } else {
      setName(status.name);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSaveRename();
    } else if (event.key === "Escape") {
      handleCancelRename();
    }
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td
        className="alpaca-status-drag-handle"
        {...listeners}
        style={{ cursor: "grab" }}
      >
        <Dashicon icon="menu" />
      </td>
      <td>
        {isRenaming ? (
          <TextControl
            ref={inputRef}
            value={name}
            onChange={setName}
            onBlur={handleSaveRename}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <button className="button-link" onClick={handleStartRename}>
            {status.name}
          </button>
        )}
      </td>
      <td>
        <Button
          icon="arrow-up-alt2"
          label="Move Up"
          onClick={() => onMove(id, -1)}
          disabled={isFirst}
        />
        <Button
          icon="arrow-down-alt2"
          label="Move Down"
          onClick={() => onMove(id, 1)}
          disabled={isLast}
        />
        <Button isDestructive onClick={() => onDelete(id)}>
          Delete
        </Button>
      </td>
    </tr>
  );
};

export default SortableStatusRow;
