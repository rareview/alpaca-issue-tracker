const { useState, useEffect } = wp.element;
const {
  __experimentalToggleGroupControl: ToggleGroupControl,
  __experimentalToggleGroupControlOption: ToggleGroupControlOption,
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

  const boardElement = document.querySelector("#alpaca-board");

  useEffect(() => {
    setCookie("alpaca_filter_issues", filterIssues, 365);

    if (boardElement) {
      // Remove any existing filter classes first
      boardElement.classList.remove(
        "filter-all",
        "filter-mine",
        "filter-others",
        "filter-watchlist"
      );

      // Add the selected filter class
      boardElement.classList.add(`filter-${filterIssues}`);
    }
  }, [filterIssues, boardElement]);

  // Set initial class on mount
  useEffect(() => {
    if (boardElement) {
      boardElement.classList.add(`filter-${filterIssues}`);
    }
  }, [boardElement]);

  if (typeof alpacaUserData === "undefined" || !alpacaUserData.currentUserId) {
    return null; // Don't render if we don't know the current user
  }

  return (
    <ToggleGroupControl
      className="alpaca-board-filter"
      value={filterIssues}
      onChange={(value) => setFilterIssues(value)}
      isBlock
    >
      <ToggleGroupControlOption value="all" label="All Issues" />
      <ToggleGroupControlOption value="mine" label="Assigned to me" />
      <ToggleGroupControlOption value="watchlist" label="My Watchlist" />
      <ToggleGroupControlOption value="others" label="Others" />
    </ToggleGroupControl>
  );
  // TODO: watchlist functionality
}
