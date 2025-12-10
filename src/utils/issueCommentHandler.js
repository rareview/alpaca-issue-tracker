import { getUser, generateAssigneeSpan } from '../hooks/useUser.js';
import { fetchIssueCommentCount } from '../services/issueApi.js';

/**
 * Handles automatic commenting on issues, such as when an issue is created.
 * This script hooks into WordPress actions to add comments via the REST API.
 */
const { addAction, doAction } = wp.hooks;
const apiFetch = wp.apiFetch;

const postComment = async (issueOrId, content) => {
  let postId;
  if (issueOrId && typeof issueOrId === 'object') {
    // Prioritize issue.post_id if available (for full issue objects)
    // Otherwise, assume issue.id is the post ID (for simplified board items)
    postId = issueOrId.post_id || issueOrId.id;
  } else {
    // If issueOrId is not an object, assume it's already the post ID
    postId = issueOrId;
  }

  if (!postId) {
    console.error(
      'postComment: No valid post ID found for comment.',
      issueOrId,
    );
    return;
  }

  try {
    await apiFetch({
      path: '/wp/v2/comments',
      method: 'POST',
      data: {
        post: postId,
        content,
        comment_type: 'issuecomment',
        status: 'approve',
        author_user_agent: 'audit',
      },
    }).then(async (newlyCreatedComment) => {
      wp.hooks.doAction('alpaca.commentPosted', newlyCreatedComment);
      const response = await fetchIssueCommentCount(postId);
      if (response && typeof response.comment_count !== 'undefined') {
        doAction('alpaca.commentCountChanged', {
          issueId: postId.toString(),
          newCount: response.comment_count,
        });
      }
    });
  } catch (error) {
    console.error('issueCommentHandler.js: Error adding comment:', error);
  }
};

addAction('alpaca.issueSubmitted', 'alpaca/addIssueComment', async (issue) => {
  const currentUser = await getUser();
  const commentContent = `Issue created by ${generateAssigneeSpan(
    currentUser,
  )}`;
  await postComment(issue, commentContent); // Pass issue object
});

addAction(
  'alpaca.statusChanged',
  'alpaca/addStatusChangeComment',
  async (issue, fromStatus, toStatus) => {
    const commentContent = `Status changed from **${fromStatus}** to **${toStatus}**`;
    await postComment(issue, commentContent); // Pass issue object
  },
);

addAction(
  'alpaca.assigneeChanged',
  'alpaca/addAssigneeChangeComment',
  async (issue, user, isAssigned) => {
    const actionText = isAssigned ? 'assigned to' : 'unassigned from';
    const commentContent = `${generateAssigneeSpan(
      user,
    )} ${actionText} this issue`;
    await postComment(issue, commentContent); // Pass issue object
  },
);
