import { getUser } from "./usercache.js";
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

      const commentContent = `Issue created by ${userName}`;

      const response = await apiFetch({
        path: "/wp/v2/comments",
        method: "POST",
        data: {
          post: issue.id,
          content: commentContent,
          comment_type: "issuecomment",
          status: "approve",
        },
      });
    } catch (error) {
      console.error("issue-comment-handler.js: Error adding comment:", error);
    }
  }
);

// todo: rationalise this? can probably combine with comments.js somehow
