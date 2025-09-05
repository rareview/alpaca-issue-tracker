const { useState, useEffect, useRef, useCallback } = wp.element;
const { Popover, Button, ComboboxControl, MenuGroup, MenuItem } = wp.components;
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

  // --- Load assignee data on mount ---
  useEffect(() => {
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

  // --- Unified filtering logic ---
  useEffect(() => {
    const boardElement = document.querySelector("#alpaca-board");
    if (!boardElement) return;

    const items = boardElement.querySelectorAll(".alpaca-item");

    const deadlineConditions = {
      today: (d) => d === 0,
      week: (d) => d >= 0 && d <= 7,
      late: (d) => d < 0,
    };

    items.forEach((item) => {
      let isVisible = true;

      // Assignee filter
      if (filteredAssignee) {
        const matchesByDataAssignee = item.hasAttribute(
          `data-assignee-${filteredAssignee}`
        );
        const matchesByList = (item.dataset.assignees || "")
          .split(" ")
          .includes(filteredAssignee);

        if (!matchesByDataAssignee && !matchesByList) {
          isVisible = false;
        }
      }

      // Starred filter
      if (showStarredOnly && !item.classList.contains("is-watched")) {
        isVisible = false;
      }

      // Deadline filter
      const diffDays = parseInt(item.dataset.diffDays, 10);
      const deadlineCheck = deadlineConditions[deadlineFilter];
      const matchesDeadline =
        !isNaN(diffDays) && deadlineCheck && deadlineCheck(diffDays);

      if (deadlineFilter !== "none" && !matchesDeadline) {
        isVisible = false;
      }

      // Apply filter result
      item.classList.toggle("is-filtered-out", !isVisible);

      // Highlight deadline matches
      item.classList.remove("item-highlight");
      if (isVisible && deadlineFilter !== "none" && matchesDeadline) {
        item.classList.add("item-highlight");
      }
    });
  }, [filteredAssignee, showStarredOnly, deadlineFilter]);

  // --- Reset assignee filter if invalid ---
  useEffect(() => {
    if (filteredAssignee && allAssignees.length > 0) {
      const isStillPresent = allAssignees.some(
        (assignee) => assignee.id.toString() === filteredAssignee
      );
      if (!isStillPresent) {
        setFilteredAssignee("");
      }
    }
  }, [allAssignees, filteredAssignee]);

  // --- Build assignee options for combobox ---
  const assigneeOptions = (allAssignees || [])
    .filter((assignee) => assignee && assignee.id)
    .map((assignee) => ({
      value: assignee.id.toString(),
      label: assignee.display_name || assignee.slug || "Unnamed",
    }));

  if (typeof alpacaUserData === "undefined" || !alpacaUserData.currentUserId) {
    return null; // Don't render if we don't know the current user
  }

  // --- Popover state ---
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverAnchorRef = useRef();
  const popoverContentRef = useRef();

  const togglePopover = useCallback(() => {
    setIsPopoverOpen((prev) => !prev);
  }, []);

  const onClosePopover = () => {
    setIsPopoverOpen(false);
  };

  // --- Click outside detection for popover ---
  useEffect(() => {
    const handleClickOutside = (event) => {
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
  }, [isPopoverOpen]);

  // --- Handlers ---
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

  // --- Render ---
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
        <Popover anchor={popoverAnchorRef.current}>
          <div className="alpaca-control-popover" ref={popoverContentRef}>
            <MenuGroup>
              <MenuItem
                onClick={() => {
                  setFilteredAssignee("");
                  setShowStarredOnly(false);
                  setDeadlineFilter("none");
                }}
              >
                Show All Items
              </MenuItem>
              <MenuItem
                onClick={handleShowStarredOnlyChange}
                icon={showStarredOnly ? "star-filled" : "star-empty"}
              >
                Starred Items
              </MenuItem>
            </MenuGroup>
            <MenuGroup label="Filter by Assignee">
              <MenuItem
                onClick={() =>
                  handleFilteredAssigneeChange(
                    alpacaUserData.currentUserId.toString()
                  )
                }
                icon={
                  filteredAssignee === alpacaUserData.currentUserId.toString()
                    ? "yes"
                    : ""
                }
              >
                Assigned to me
              </MenuItem>
              <ComboboxControl
                value={filteredAssignee}
                onChange={handleFilteredAssigneeChange}
                options={assigneeOptions}
                className="alpaca-control"
                placeholder="Search for a user"
              />
            </MenuGroup>
            <MenuGroup label="Deadlines">
              <MenuItem
                onClick={() => handleDeadlineFilterChange("today")}
                icon={deadlineFilter === "today" ? "yes" : ""}
              >
                Today
              </MenuItem>
              <MenuItem
                onClick={() => handleDeadlineFilterChange("week")}
                icon={deadlineFilter === "week" ? "yes" : ""}
              >
                Next 7 days
              </MenuItem>
              <MenuItem
                onClick={() => handleDeadlineFilterChange("late")}
                icon={deadlineFilter === "late" ? "yes" : ""}
              >
                Overdue
              </MenuItem>
            </MenuGroup>
          </div>
        </Popover>
      )}
    </div>
  );
}
