import { getUser } from "./usercache.js";
import { generateAssigneeSpan } from "./comments.js";
/**
 * Handles automatic commenting on issues, such as when an issue is created.
 * This script hooks into WordPress actions to add comments via the REST API.
 */
const { addAction } = wp.hooks;
const apiFetch = wp.apiFetch;

addAction(
  "alpaca.issueSubmitted",
  "alpaca/addIssueComment",
  async (issue, statusId) => {
    try {
      // Get the current user's display name
      const currentUser = await getUser();
      const userName = currentUser.name || "Unknown User";

      const commentContent = `Issue created by ${generateAssigneeSpan(currentUser)}`;

      await apiFetch({
        path: "/wp/v2/comments",
        method: "POST",
        data: {
          post: issue.id,
          content: commentContent,
          comment_type: "issuecomment",
          status: "approve",
        },
      }).then(() => {
        document.dispatchEvent(
          new CustomEvent("alpaca:comment-count-changed", {
            detail: {
              issueId: issue.id.toString(),
              newCount: 1,
            },
          })
        );
      });
    } catch (error) {
      console.error("issue-comment-handler.js: Error adding comment:", error);
    }
  }
);

// todo: rationalise this? can probably combine with comments.js somehow