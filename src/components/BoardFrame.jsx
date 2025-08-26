const { useState, useEffect } = wp.element;
const {
  __experimentalToggleGroupControl: ToggleGroupControl,
  __experimentalToggleGroupControlOption: ToggleGroupControlOption,
  ComboboxControl,
} = wp.components;
import Board from "./BoardMain";
import { getCookie, setCookie } from "../utils/cookies";

export function AlpacaBoard() {
  return <Board />;
}

export function AlpacaBoardControls() {
  // Use a string state instead of a boolean
  const [filterIssues, setFilterIssues] = useState(() => {
    return getCookie("alpaca_filter_issues") || "all";
  });
  const [allAssignees, setAllAssignees] = useState([]);
  const [filteredAssignee, setFilteredAssignee] = useState("");

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
        [class*="assignee-filter-"] .alpaca-item {
          display: none;
        }
      `;

      allAssignees.forEach((assignee) => {
        rules += `
          #alpaca-board.assignee-filter-${assignee.id} .alpaca-item[data-assignee-${assignee.id}] {
            display: block;
          }
        `;
      });

      styleElement.innerHTML = rules;
    }
  }, [allAssignees]);

  const boardElement = document.querySelector("#alpaca-board");

  useEffect(() => {
    setCookie("alpaca_filter_issues", filterIssues, 365);

    if (boardElement) {
      // Remove any existing filter classes first
      boardElement.classList.remove(
        "filter-all",
        "filter-mine",
        "filter-watchlist"
      );

      // Add the selected filter class
      boardElement.classList.add(`filter-${filterIssues}`);
    }
  }, [filterIssues, boardElement]);

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

  // Set initial class on mount
  useEffect(() => {
    if (boardElement) {
      boardElement.classList.add(`filter-${filterIssues}`);
    }
  }, [boardElement]);

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

  const assigneeOptions = (allAssignees || [])
    .filter((assignee) => assignee && assignee.id)
    .map((assignee) => ({
      value: assignee.id.toString(),
      label: assignee.display_name || assignee.slug || "Unnamed",
    }));

  if (typeof alpacaUserData === "undefined" || !alpacaUserData.currentUserId) {
    return null; // Don't render if we don't know the current user
  }

  return (
    <div className="alpaca-board-controls">
      <ToggleGroupControl
        className="alpaca-board-filter"
        value={filterIssues}
        onChange={(value) => setFilterIssues(value)}
        isBlock
      >
        <ToggleGroupControlOption value="all" label="All Issues" />
        <ToggleGroupControlOption value="mine" label="Assigned to me" />
        <ToggleGroupControlOption value="watchlist" label="Starred" />
      </ToggleGroupControl>
      <ComboboxControl
        label="Filter by Assignee"
        // value={filteredAssignee}
        onChange={setFilteredAssignee}
        options={assigneeOptions}
      />
    </div>
  );
}
