import { getUser, generateAssigneeSpan } from '../hooks/useUser.js';
import { fetchIssueCommentCount } from '../services/issueApi.js';

/**
 * Handles automatic commenting on issues, such as when an issue is created.
 * This script hooks into WordPress actions to add comments via the REST API.
 */
const { addAction, doAction } = wp.hooks;
const apiFetch = wp.apiFetch;

const postComment = async (issueOrId, content, commentTags = []) => {
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

  const commentData = {
    post: postId,
    content,
    comment_type: 'issuecomment',
    status: 'approve',
    author_user_agent: 'audit',
  };

  if (commentTags && commentTags.length > 0) {
    commentData.meta = {
      alpacaCommentTags: commentTags,
    };
  }

  try {
    await apiFetch({
      path: '/wp/v2/comments',
      method: 'POST',
      data: commentData,
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
  const actionClass = ['issue-created'];
  const commentContent = `Issue created by ${generateAssigneeSpan(
    currentUser,
    true,
  )}`;
  await postComment(issue, commentContent, actionClass); // Pass issue object
});

addAction(
  'alpaca.statusChanged',
  'alpaca/addStatusChangeComment',
  async (issue, fromStatus, toStatus) => {
    const currentUser = await getUser();
    const actionClass = ['status-changed'];
    const commentContent = `Status changed from **${fromStatus}** to **${toStatus}** by ${generateAssigneeSpan(currentUser)}`;
    await postComment(issue, commentContent, actionClass); // Pass issue object
  },
);

addAction(
  'alpaca.assigneeChanged',
  'alpaca/addAssigneeChangeComment',
  async (issue, user, isAssigned) => {
    const currentUser = await getUser();
    const actionText = isAssigned ? 'assigned to' : 'unassigned from';
    const actionClass = [
      'assignee-changed',
      isAssigned ? 'action-add' : 'action-remove',
    ];
    const commentContent = `${generateAssigneeSpan(
      user,
      true,
    )} was ${actionText} this issue by ${generateAssigneeSpan(currentUser)}`;
    await postComment(issue, commentContent, actionClass); // Pass issue object
  },
);

addAction(
  'alpaca.deadlineUpdated',
  'alpaca/addDeadlineChangeComment',
  async (payload) => {
    const { changeType, newDeadline, issue } = payload;
    // payload also includes oldDeadline
    const currentUser = await getUser();
    let commentContent = '';
    const actionClass = ['deadline-changed'];

    const formatDate = (dateString) => {
      if (!dateString) return '';
      // The 'Z' is important to ensure the date is treated as UTC.
      const dateObj = new Date(`${dateString}Z`);
      const format = wp.date.getSettings().formats.date;
      return wp.date.dateI18n(format, dateObj);
    };

    switch (changeType) {
      case 'added':
        actionClass.push('action-add');
        commentContent = `Deadline set to **${formatDate(
          newDeadline,
        )}** by ${generateAssigneeSpan(currentUser)}.`;
        break;
      case 'deleted':
        actionClass.push('action-remove');
        commentContent = `Deadline removed by ${generateAssigneeSpan(
          currentUser,
        )}.`;
        break;
      case 'changed':
        actionClass.push('action-update');
        commentContent = `Deadline changed to **${formatDate(newDeadline)}** by ${generateAssigneeSpan(
          currentUser,
        )}.`;
        break;
      default:
        // Do nothing if changeType is unknown
        break;
    }

    if (commentContent) {
      await postComment(issue, commentContent, actionClass);
    }
  },
);
