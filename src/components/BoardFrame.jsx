const { useState, useEffect, useRef } = wp.element;
const { ComboboxControl, Popover, Button } = wp.components;
import Board from "./BoardMain";
import { getCookie, setCookie } from "../utils/cookies";

export function AlpacaBoard() {
  return <Board />;
}

export function AlpacaBoardControls() {
  const [allAssignees, setAllAssignees] = useState([]);
  const [filteredAssignee, setFilteredAssignee] = useState("");
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  useEffect(() => {
    // On mount, check for assignee data that may have been set globally
    // to win a race condition with the event firing.
    if (window.alpacaAssignees && window.alpacaAssignees.length > 0) {
      setAllAssignees(window.alpacaAssignees);
    }

    const handleAssigneesUpdated = (event) => {
      const { assignees } = event.detail;
      if (assignees && Array.isArray(assignees)) {
        setAllAssignees([...assignees]);
      }
    };

    document.addEventListener(
      "alpaca:assignees-updated",
      handleAssigneesUpdated
    );

    return () => {
      document.removeEventListener(
        "alpaca:assignees-updated",
        handleAssigneesUpdated
      );
    };
  }, []);

  // This effect generates and injects the CSS for assignee filtering.
  useEffect(() => {
    if (allAssignees.length > 0) {
      const styleId = "alpaca-assignee-filter-styles";
      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      let rules = `
        #alpaca-board[class*="assignee-filter-"] .alpaca-item {
          opacity: 0.2;
        }
      `;

      allAssignees.forEach((assignee) => {
        rules += `
          #alpaca-board.assignee-filter-${assignee.id} .alpaca-item[data-assignee-${assignee.id}] {
            opacity: 1;
          }
        `;
      });

      styleElement.innerHTML = rules;
    }
  }, [allAssignees]);

  const boardElement = document.querySelector("#alpaca-board");

  useEffect(() => {
    if (boardElement) {
      // Remove previous assignee filters
      boardElement.className = boardElement.className.replace(
        /\s*assignee-filter-\S*/g,
        ""
      );
      if (filteredAssignee) {
        boardElement.classList.add(`assignee-filter-${filteredAssignee}`);
      }
    }
  }, [filteredAssignee, boardElement]);

  // Clear the assignee filter if the selected assignee is no longer valid.
  useEffect(() => {
    if (filteredAssignee && allAssignees.length > 0) {
      const isFilteredAssigneeStillPresent = allAssignees.some(
        (assignee) => assignee.id.toString() === filteredAssignee
      );
      if (!isFilteredAssigneeStillPresent) {
        setFilteredAssignee("");
      }
    }
  }, [allAssignees, filteredAssignee]);

  // Update board classes based on showStarredOnly
  useEffect(() => {
    if (boardElement) {
      if (showStarredOnly) {
        boardElement.classList.add("filter-watchlist");
      } else {
        boardElement.classList.remove("filter-watchlist");
      }
    }
  }, [showStarredOnly, boardElement]);

  const assigneeOptions = (allAssignees || [])
    .filter((assignee) => assignee && assignee.id)
    .map((assignee) => ({
      value: assignee.id.toString(),
      label: assignee.display_name || assignee.slug || "Unnamed",
    }));

  if (typeof alpacaUserData === "undefined" || !alpacaUserData.currentUserId) {
    return null; // Don't render if we don't know the current user
  }

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverAnchorRef = useRef();

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const onClosePopover = () => {
    setIsPopoverOpen(false);
  };

  return (
    <div className="alpaca-board-controls">
      <Button
        ref={popoverAnchorRef}
        onClick={togglePopover}
        isSecondary
        label="Open Filters"
      >
        Open Filters
      </Button>
      {isPopoverOpen && (
        <Popover anchorRef={popoverAnchorRef} onClose={onClosePopover}>
          <div className="alpaca-control-popover">
            <div className="alpaca-control alpaca-control-starred">
              <Button
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                isPressed={showStarredOnly}
                icon={showStarredOnly ? "star-filled" : "star-empty"}
                label="Toggle Starred Items"
                variant="secondary"
              >
                Starred Items
              </Button>
            </div>

            <ComboboxControl
              label="Filter by Assignee"
              value={filteredAssignee}
              onChange={setFilteredAssignee}
              options={assigneeOptions}
              className="alpaca-control"
            />
          </div>
        </Popover>
      )}
    </div>
  );
}
