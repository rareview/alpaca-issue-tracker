const { useState, useEffect } = wp.element;
const {
  ToggleControl,
  __experimentalToggleGroupControl: ToggleGroupControl,
  __experimentalToggleGroupControlOption: ToggleGroupControlOption,
} = wp.components;
import Board from "./BoardMain";
import { getCookie, setCookie } from "../utils/cookies";

export function AlpacaBoard() {
  return <Board />;
}

export function AlpacaBoardControls() {
  const [showOnlyMyIssues, setShowOnlyMyIssues] = useState(() => {
    return getCookie("alpaca_show_only_my_issues") === "true";
  });
  const boardElement = document.querySelector("#alpaca-board");

  useEffect(() => {
    setCookie("alpaca_show_only_my_issues", showOnlyMyIssues, 365);
    if (boardElement) {
      if (showOnlyMyIssues) {
        boardElement.classList.add("show-only-my-issues");
      } else {
        boardElement.classList.remove("show-only-my-issues");
      }
    }
  }, [showOnlyMyIssues, boardElement]);

  // Set initial class on mount
  useEffect(() => {
    if (boardElement && showOnlyMyIssues) {
      boardElement.classList.add("show-only-my-issues");
    }
  }, [boardElement]);

  if (typeof alpacaUserData === "undefined" || !alpacaUserData.currentUserId) {
    return null; // Don't render if we don't know the current user
  }

  return (
    <ToggleGroupControl
      className="alpaca-board-filter"
      value={showOnlyMyIssues ? "my-issues" : "all-issues"}
      onChange={(value) => setShowOnlyMyIssues(value === "my-issues")}
      isBlock
    >
      <ToggleGroupControlOption value="all-issues" label="All Issues" />
      <ToggleGroupControlOption value="my-issues" label="Assigned to me" />
      <ToggleGroupControlOption value="my-watchlist" label="My Watchlist" />
    </ToggleGroupControl>
  );
  // TODO: watchlist functionality
}
