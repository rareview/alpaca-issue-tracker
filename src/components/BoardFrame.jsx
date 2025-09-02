const { useState, useEffect, useRef, useCallback } = wp.element;
const { ComboboxControl, Popover, Button, RadioControl } = wp.components;
import Board from "./BoardMain";
import { getCookie, setCookie } from "../utils/cookies";

export function AlpacaBoard() {
  return <Board />;
}

export function AlpacaBoardControls() {
  const [allAssignees, setAllAssignees] = useState([]);
  const [filteredAssignee, setFilteredAssignee] = useState("");
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState("none");

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
      const styleId = "alpaca-filter-assignee-styles";
      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      let rules = `
        #alpaca-board[class*="filter-assignee-"] .alpaca-item {
          opacity: 0.2;
        }
      `;

      allAssignees.forEach((assignee) => {
        rules += `
          #alpaca-board.filter-assignee-${assignee.id} .alpaca-item[data-assignee-${assignee.id}] {
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
        /\s*filter-assignee-\S*/g,
        ""
      );
      if (filteredAssignee) {
        boardElement.classList.add(`filter-assignee-${filteredAssignee}`);
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

  useEffect(() => {
    if (boardElement) {
      // Remove previous deadline filters
      boardElement.className = boardElement.className.replace(
        /\s*filter-deadline-\S*/g,
        ""
      );
      boardElement.classList.remove("filter-deadline");

      if (deadlineFilter && deadlineFilter !== "none") {
        boardElement.classList.add(
          `filter-deadline`,
          `filter-deadline-${deadlineFilter}`
        );
      }

      const deadlineConditions = {
        today: (diffDays) => diffDays === 0,
        week: (diffDays) => diffDays >= 0 && diffDays <= 7,
        late: (diffDays) => diffDays < 0,
      };

      const items = boardElement.querySelectorAll(".alpaca-item");
      const condition = deadlineConditions[deadlineFilter];

      items.forEach((item) => {
        item.classList.remove("item-highlight");
        if (condition) {
          const diffDays = parseInt(item.dataset.diffDays, 10);
          if (condition(diffDays)) {
            item.classList.add("item-highlight");
          }
        }
      });
    }
  }, [deadlineFilter, boardElement]);

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
  const popoverContentRef = useRef(); // New ref for popover content

  const togglePopover = useCallback(() => {
    setIsPopoverOpen((prevIsPopoverOpen) => {
      const newState = !prevIsPopoverOpen;
      return newState;
    });
  }, [isPopoverOpen]);

  const onClosePopover = () => {
    setIsPopoverOpen(false);
  };

  // New useEffect for global click-outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If popover is open AND
      // click is NOT on the button AND
      // click is NOT inside the popover content
      if (
        isPopoverOpen &&
        popoverAnchorRef.current &&
        !popoverAnchorRef.current.contains(event.target) &&
        popoverContentRef.current &&
        !popoverContentRef.current.contains(event.target)
      ) {
        onClosePopover();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen, popoverAnchorRef, popoverContentRef, onClosePopover]); // Dependencies

  const handleShowStarredOnlyChange = () => {
    setShowStarredOnly(!showStarredOnly);
    setFilteredAssignee("");
    setDeadlineFilter("none");
  };

  const handleFilteredAssigneeChange = (value) => {
    setFilteredAssignee(value);
    setShowStarredOnly(false);
    setDeadlineFilter("none");
  };

  const handleDeadlineFilterChange = (value) => {
    setDeadlineFilter(value);
    setShowStarredOnly(false);
    setFilteredAssignee("");
  };

  return (
    <div className="alpaca-board-controls">
      <Button
        ref={popoverAnchorRef}
        onClick={() => {
          togglePopover();
        }}
        isSecondary
        label="Open Filters"
      >
        Open Filters
      </Button>
      {isPopoverOpen && (
        <Popover anchor={popoverAnchorRef.current}>
          <div className="alpaca-control-popover" ref={popoverContentRef}>
            {" "}
            {/* Assign ref here */}
            <Button
              onClick={() => {
                setFilteredAssignee("");
                setShowStarredOnly(false);
                setDeadlineFilter("none");
              }}
            >
              Show All Items
            </Button>
            <div className="alpaca-control alpaca-control-starred">
              <Button
                onClick={handleShowStarredOnlyChange}
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
              onChange={handleFilteredAssigneeChange}
              options={assigneeOptions}
              className="alpaca-control"
            />
            <RadioControl
              label="Deadlines"
              options={[
                {
                  label: "Today",
                  value: "today",
                },
                {
                  label: "Next 7 days",
                  value: "week",
                },
                {
                  label: "Overdue",
                  value: "late",
                },
              ]}
              selected={deadlineFilter}
              onChange={handleDeadlineFilterChange}
            />
          </div>
        </Popover>
      )}
    </div>
  );
}
