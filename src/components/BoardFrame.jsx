const { useState, useEffect } = wp.element;
const { ToggleControl } = wp.components;
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
    <div className="alignleft actions">
      <ToggleControl
        label="Show only my issues"
        checked={showOnlyMyIssues}
        onChange={() => setShowOnlyMyIssues(!showOnlyMyIssues)}
      />
    </div>
  );
}
