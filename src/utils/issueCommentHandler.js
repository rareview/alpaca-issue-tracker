import { getUser, generateAssigneeSpan } from '../hooks/useUser.js';
import { fetchIssueCommentCount } from '../services/issueApi.js';

/**
 * Handles automatic commenting on issues, such as when an issue is created.
 * This script hooks into WordPress actions to add comments via the REST API.
 */
const { addAction, doAction, addFilter, applyFilters } = wp.hooks;
const apiFetch = wp.apiFetch;
const { __ } = wp.i18n;

/**
 * Strips HTML and basic Markdown from a string.
 *
 * @param {string} input The string to sanitize.
 * @return {string} The plain text string.
 */
const stripHtmlAndMarkdown = (input) => {
  if (!input) {
    return '';
  }

  let output = input;

  // Strip HTML tags
  output = output.replace(/<[^>]*>?/gm, '');

  // Strip Markdown links, keeping the text
  output = output.replace(/\[(.*?)\]\(.*?\)/g, '$1');

  // Strip Markdown bold and italic, keeping the text
  output = output.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');

  return output;
};

/**
 * Safely format a subtask title for comments.
 *
 * @param {Object} subtask Subtask object.
 * @return {string} Formatted subtask title.
 */
const getSubtaskLabel = (subtask) => {
  const title = subtask?.title || subtask?.content || '';
  const cleanedTitle = stripHtmlAndMarkdown(title).trim();
  return cleanedTitle || 'Untitled subtask';
};

/**
 * Build an issue link using the current board URL when possible.
 *
 * @param {Object} issueData     Issue data (slug).
 * @param {string} fallbackLabel Text to display when URL cannot be built.
 * @return {string} Markdown link or plain fallback label.
 */
const getIssueLinkLabel = (issueData, fallbackLabel) => {
  const issueSlug = issueData?.slug || '';
  if (!issueSlug) {
    return fallbackLabel;
  }

  try {
    if (typeof window !== 'undefined' && window.location) {
      const issueUrl = new URL(window.location.href);
      issueUrl.searchParams.set('issue', issueSlug);
      return `[${fallbackLabel}](${issueUrl.toString()})`;
    }
  } catch (error) {
    // Fall through to plain text label.
  }

  return fallbackLabel;
};

addFilter('alpaca.commentObject', 'alpaca/addPlainText', (comment) => {
  if (comment && comment.content && comment.content.raw) {
    comment.content.txt = stripHtmlAndMarkdown(comment.content.raw);
  }
  return comment;
});

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
      doAction(
        'alpaca.commentPosted',
        applyFilters('alpaca.commentObject', newlyCreatedComment),
      );
      const response = await fetchIssueCommentCount(postId);
      if (response && typeof response.comment_count !== 'undefined') {
        doAction('alpaca.commentCountChanged', {
          issueId: postId.toString(),
          newCount: response.comment_count,
        });
        doAction('alpaca.lastActivityChanged', {
          issueId: postId.toString(),
          lastActivity: new Date().toISOString(),
        });
      }
    });
  } catch (error) {
    console.error('issueCommentHandler.js: Error adding comment:', error);
  }
};

addAction(
  'alpaca.issueSubmitted',
  'alpaca/addIssueComment',
  async (issue, statusId, isHighPriority) => {
    const currentUser = await getUser();
    const actionClass = ['issue-created'];
    let commentContent = `Issue created by ${generateAssigneeSpan(
      currentUser,
      true,
    )}`;

    if (isHighPriority) {
      actionClass.push('high-priority');
      commentContent += ' with **High Priority**';
    }

    await postComment(issue, commentContent, actionClass); // Pass issue object
  },
);

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
    const targetUserLabel = user
      ? generateAssigneeSpan(user, true)
      : __('Unknown user', 'alpaca');
    const commentContent = `${targetUserLabel} was ${actionText} this issue by ${generateAssigneeSpan(
      currentUser,
    )}`;
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
        )}** by ${generateAssigneeSpan(currentUser)}`;
        break;
      case 'deleted':
        actionClass.push('action-remove');
        commentContent = `Deadline removed by ${generateAssigneeSpan(
          currentUser,
        )}`;
        break;
      case 'changed':
        actionClass.push('action-update');
        commentContent = `Deadline changed to **${formatDate(newDeadline)}** by ${generateAssigneeSpan(
          currentUser,
        )}`;
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

addAction(
  'alpaca.priorityUpdated',
  'alpaca/addPriorityChangeComment',
  async (payload) => {
    const { issue, isHighPriority } = payload;
    const currentUser = await getUser();
    const actionClass = ['priority-changed'];

    let commentContent = '';
    if (isHighPriority) {
      actionClass.push('action-add');
      commentContent = `Priority set to **High** by ${generateAssigneeSpan(
        currentUser,
      )}`;
    } else {
      actionClass.push('action-remove');
      commentContent = `High priority removed by ${generateAssigneeSpan(
        currentUser,
      )}`;
    }

    if (commentContent) {
      await postComment(issue, commentContent, actionClass);
    }
  },
);

addAction(
  'alpaca.subtaskCreated',
  'alpaca/addSubtaskCreatedComment',
  async (issue, subtask) => {
    const currentUser = await getUser();
    const actionClass = ['subtask-created'];
    const subtaskLabel = getSubtaskLabel(subtask);
    const commentContent = `Subtask **${subtaskLabel}** created by ${generateAssigneeSpan(
      currentUser,
    )}`;

    await postComment(issue, commentContent, actionClass);
  },
);

addAction(
  'alpaca.subtaskCompletionToggled',
  'alpaca/addSubtaskCompletionComment',
  async (issue, subtask, isCompleted) => {
    const currentUser = await getUser();
    const actionClass = ['subtask-completion-changed'];
    const subtaskLabel = getSubtaskLabel(subtask);
    const stateLabel = isCompleted ? 'completed' : 'reopened';
    const commentContent = `Subtask **${subtaskLabel}** marked as **${stateLabel}** by ${generateAssigneeSpan(
      currentUser,
    )}`;

    await postComment(issue, commentContent, actionClass);
  },
);

addAction(
  'alpaca.subtaskAssigneeChanged',
  'alpaca/addSubtaskAssigneeComment',
  async (issue, subtask, user, isAssigned) => {
    const currentUser = await getUser();
    const actionText = isAssigned ? 'assigned to' : 'unassigned from';
    const actionClass = [
      'subtask-assignee-changed',
      isAssigned ? 'action-add' : 'action-remove',
    ];
    const subtaskLabel = getSubtaskLabel(subtask);
    const targetUserLabel = user
      ? generateAssigneeSpan(user, true)
      : __('Unknown user', 'alpaca');
    const commentContent = `${targetUserLabel} was ${actionText} subtask **${subtaskLabel}** by ${generateAssigneeSpan(
      currentUser,
    )}`;

    await postComment(issue, commentContent, actionClass);
  },
);

addAction(
  'alpaca.subtaskPromoted',
  'alpaca/addSubtaskPromotedComment',
  async (payload) => {
    const { parentIssue, promotedIssue, subtask } = payload || {};
    const currentUser = await getUser();
    const actionClass = ['subtask-promoted'];
    const subtaskLabel = getSubtaskLabel(subtask);

    const parentTitle = stripHtmlAndMarkdown(parentIssue?.title || '').trim();
    const parentLabel = parentTitle || __('Unknown issue', 'alpaca');
    const parentIssueLink = getIssueLinkLabel(parentIssue, parentLabel);

    const promotedId = promotedIssue?.id || subtask?.id;
    const promotedTitle = stripHtmlAndMarkdown(promotedIssue?.title || '').trim();
    const promotedLabel = promotedTitle || __('Issue', 'alpaca');
    const promotedIssueLink = getIssueLinkLabel(
      {
        slug: promotedIssue?.slug || subtask?.slug || '',
      },
      promotedLabel,
    );

    const parentComment = `Subtask **${subtaskLabel}** was promoted to issue ${promotedIssueLink} by ${generateAssigneeSpan(
      currentUser,
    )}`;
    const promotedComment = `Issue created from checklist subtask **${subtaskLabel}** on ${parentIssueLink} by ${generateAssigneeSpan(
      currentUser,
    )}`;

    if (parentIssue?.id) {
      await postComment(parentIssue.id, parentComment, actionClass);
    }

    if (promotedId) {
      await postComment(promotedId, promotedComment, actionClass);
    }
  },
);

addAction(
  'alpaca.subtaskDeleted',
  'alpaca/addSubtaskDeletedComment',
  async (issue, subtask) => {
    const currentUser = await getUser();
    const actionClass = ['subtask-deleted'];
    const subtaskLabel = getSubtaskLabel(subtask);
    const commentContent = `Subtask **${subtaskLabel}** deleted by ${generateAssigneeSpan(
      currentUser,
    )}`;

    await postComment(issue, commentContent, actionClass);
  },
);
