import { getUser, generateAssigneeSpan } from '../hooks/useUser.js';
import { fetchIssueCommentCount } from '../services/issueApi.js';
import { formatWpDateValue } from './date';

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
 * Build a user label for audit comments.
 *
 * @param {Object|null} user       Candidate user object.
 * @param {string}      identifier User name or slug fallback.
 * @return {string} HTML-safe label.
 */
const getAuditCommentUserLabel = (user, identifier = '') => {
  if (user) {
    return generateAssigneeSpan(user, true);
  }

  const fallbackLabel =
    typeof identifier === 'string' && identifier.trim()
      ? identifier.trim()
      : __('Unknown user', 'alpaca');

  return fallbackLabel;
};

/**
 * Safely format a subissue title for comments.
 *
 * @param {Object} subissue Subissue object.
 * @return {string} Formatted subissue title.
 */
const getSubissueLabel = (subissue) => {
  const title = subissue?.title || subissue?.content || '';
  const cleanedTitle = stripHtmlAndMarkdown(title).trim();
  return cleanedTitle || __('Untitled subissue', 'alpaca');
};

/**
 * Build structured notification context saved alongside audit comments.
 *
 * @param {Object} context Raw context object.
 * @return {Object} Sanitized notification context.
 */
const buildNotificationContext = (context = {}) => {
  const affectedUserIdsKey = 'affected_user_ids';
  const subissueTitleKey = 'subissue_title';
  const notificationContext = {};

  if (typeof context.action === 'string' && context.action.trim()) {
    notificationContext.action = context.action.trim();
  }

  if (Array.isArray(context.affectedUserIds)) {
    notificationContext[affectedUserIdsKey] = context.affectedUserIds
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);
  }

  if (
    Number.isInteger(Number(context.subissueId)) &&
    Number(context.subissueId) > 0
  ) {
    notificationContext.subissue_id = Number(context.subissueId);
  }

  if (
    typeof context.subissueTitle === 'string' &&
    context.subissueTitle.trim()
  ) {
    notificationContext[subissueTitleKey] = context.subissueTitle.trim();
  }

  return notificationContext;
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

const postComment = async (
  issueOrId,
  content,
  commentTags = [],
  options = {},
) => {
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
    return null;
  }

  const authorUserAgent =
    typeof options.authorUserAgent === 'string' &&
    options.authorUserAgent.trim()
      ? options.authorUserAgent.trim()
      : 'audit';

  const commentData = {
    post: postId,
    content,
    comment_type: 'issuecomment',
    author_user_agent: authorUserAgent,
  };

  const commentMeta =
    options && options.meta && typeof options.meta === 'object'
      ? options.meta
      : {};

  if (commentTags && commentTags.length > 0) {
    commentData.meta = {
      alpacaCommentTags: commentTags,
      ...commentMeta,
    };
  } else if (Object.keys(commentMeta).length > 0) {
    commentData.meta = commentMeta;
  }

  try {
    const newlyCreatedComment = await apiFetch({
      path: '/wp/v2/comments',
      method: 'POST',
      data: commentData,
    });

    doAction(
      'alpaca.commentPosted',
      applyFilters('alpaca.commentObject', newlyCreatedComment),
    );

    const response = await fetchIssueCommentCount(postId);
    if (response && typeof response.comment_count !== 'undefined') {
      doAction('alpaca.commentCountChanged', {
        issueId: postId.toString(),
        newCount: response.comment_count,
        newCountByAgent: response.comment_count_by_agent || null,
      });
      doAction('alpaca.lastActivityChanged', {
        issueId: postId.toString(),
        lastActivity:
          typeof response.last_activity !== 'undefined'
            ? response.last_activity
            : new Date().toISOString(),
      });
    }

    return newlyCreatedComment;
  } catch (error) {
    console.error('issueCommentHandler.js: Error adding comment:', error);
    return null;
  }
};

addAction(
  'alpaca.issueSubmitted',
  'alpaca/addIssueSubmittedComment',
  async (issue, _statusId, isHighPriority, submission = {}) => {
    if (!issue || !issue.id) {
      return;
    }

    if (submission.commentAlreadyCreated) {
      return;
    }

    const submittedText =
      typeof submission.feedback === 'string' ? submission.feedback.trim() : '';
    const fallbackTitle =
      typeof issue.title === 'string'
        ? stripHtmlAndMarkdown(issue.title).trim()
        : '';
    const commentContent = submittedText || fallbackTitle;

    if (!commentContent) {
      return;
    }

    const screenshotUrl =
      typeof submission.screenshotUrl === 'string'
        ? submission.screenshotUrl.trim()
        : '';
    const commentMeta = {};
    if (screenshotUrl) {
      commentMeta.alpacaCommentAttachments = [screenshotUrl];
    }

    const commentTags = ['issue-created'];
    if (isHighPriority) {
      commentTags.push('high-priority');
    }

    await postComment(issue.id, commentContent, commentTags, {
      authorUserAgent: 'create',
      meta: commentMeta,
    });
  },
);

addAction(
  'alpaca.statusChanged',
  'alpaca/addStatusChangeComment',
  async (issue, fromStatus, toStatus) => {
    const currentUser = await getUser();
    const actionClass = ['status-changed'];
    const commentContent = `${__('Status changed from', 'alpaca')} **${fromStatus}** ${__(
      'to',
      'alpaca',
    )} **${toStatus}** ${__('by', 'alpaca')} ${generateAssigneeSpan(
      currentUser,
    )}`;
    await postComment(issue, commentContent, actionClass, {
      meta: {
        alpacaNotificationContext: buildNotificationContext({
          action: 'changed',
        }),
      },
    });
  },
);

addAction(
  'alpaca.assigneeChanged',
  'alpaca/addAssigneeChangeComment',
  async (issue, user, isAssigned, identifier = '') => {
    const currentUser = await getUser();
    const actionText = isAssigned ? 'assigned to' : 'unassigned from';
    const actionClass = [
      'assignee-changed',
      isAssigned ? 'action-add' : 'action-remove',
    ];
    const targetUserLabel = getAuditCommentUserLabel(user, identifier);
    const commentContent = `${targetUserLabel} ${__('was', 'alpaca')} ${actionText} ${__(
      'this issue by',
      'alpaca',
    )} ${generateAssigneeSpan(currentUser)}`;
    await postComment(issue, commentContent, actionClass, {
      meta: {
        alpacaNotificationContext: buildNotificationContext({
          action: isAssigned ? 'assign' : 'unassign',
          affectedUserIds: user?.id ? [user.id] : [],
        }),
      },
    });
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
      const format = wp.date.getSettings().formats.date;
      return formatWpDateValue(dateString, format, {
        treatMysqlAsUtc: true,
      });
    };

    switch (changeType) {
      case 'added':
        actionClass.push('action-add');
        commentContent = `${__('Deadline set to', 'alpaca')} **${formatDate(
          newDeadline,
        )}** ${__('by', 'alpaca')} ${generateAssigneeSpan(currentUser)}`;
        break;
      case 'deleted':
        actionClass.push('action-remove');
        commentContent = `${__('Deadline removed by', 'alpaca')} ${generateAssigneeSpan(
          currentUser,
        )}`;
        break;
      case 'changed':
        actionClass.push('action-update');
        commentContent = `${__('Deadline changed to', 'alpaca')} **${formatDate(
          newDeadline,
        )}** ${__('by', 'alpaca')} ${generateAssigneeSpan(currentUser)}`;
        break;
      default:
        // Do nothing if changeType is unknown
        break;
    }

    if (commentContent) {
      await postComment(issue, commentContent, actionClass, {
        meta: {
          alpacaNotificationContext: buildNotificationContext({
            action: changeType,
          }),
        },
      });
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
      commentContent = `${__('Priority set to **High** by', 'alpaca')} ${generateAssigneeSpan(
        currentUser,
      )}`;
    } else {
      actionClass.push('action-remove');
      commentContent = `${__('High priority removed by', 'alpaca')} ${generateAssigneeSpan(
        currentUser,
      )}`;
    }

    if (commentContent) {
      await postComment(issue, commentContent, actionClass, {
        meta: {
          alpacaNotificationContext: buildNotificationContext({
            action: isHighPriority ? 'enable' : 'disable',
          }),
        },
      });
    }
  },
);

addAction(
  'alpaca.subissueCreated',
  'alpaca/addSubissueCreatedComment',
  async (issue, subissue) => {
    const currentUser = await getUser();
    const actionClass = ['subissue-created'];
    const subissueLabel = getSubissueLabel(subissue);
    const commentContent = `${__('Checklist item', 'alpaca')} **${subissueLabel}** ${__(
      'created by',
      'alpaca',
    )} ${generateAssigneeSpan(currentUser)}`;

    await postComment(issue, commentContent, actionClass, {
      meta: {
        alpacaNotificationContext: buildNotificationContext({
          action: 'create',
          subissueId: subissue?.id,
          subissueTitle: subissueLabel,
        }),
      },
    });
  },
);

addAction(
  'alpaca.subissueCompletionToggled',
  'alpaca/addSubissueCompletionComment',
  async (issue, subissue, isCompleted) => {
    const currentUser = await getUser();
    const actionClass = ['subissue-completion-changed'];
    const subissueLabel = getSubissueLabel(subissue);
    const stateLabel = isCompleted ? 'completed' : 'reopened';
    const commentContent = `${__('Checklist item', 'alpaca')} **${subissueLabel}** ${__(
      'marked as',
      'alpaca',
    )} **${stateLabel}** ${__('by', 'alpaca')} ${generateAssigneeSpan(
      currentUser,
    )}`;

    await postComment(issue, commentContent, actionClass, {
      meta: {
        alpacaNotificationContext: buildNotificationContext({
          action: isCompleted ? 'complete' : 'reopen',
          subissueId: subissue?.id,
          subissueTitle: subissueLabel,
        }),
      },
    });
  },
);

addAction(
  'alpaca.subissueAssigneeChanged',
  'alpaca/addSubissueAssigneeComment',
  async (issue, subissue, user, isAssigned, identifier = '') => {
    const currentUser = await getUser();
    const actionText = isAssigned ? 'assigned to' : 'unassigned from';
    const actionClass = [
      'subissue-assignee-changed',
      isAssigned ? 'action-add' : 'action-remove',
    ];
    const subissueLabel = getSubissueLabel(subissue);
    const targetUserLabel = getAuditCommentUserLabel(user, identifier);
    const commentContent = `${targetUserLabel} ${__('was', 'alpaca')} ${actionText} ${__(
      'checklist item',
      'alpaca',
    )} **${subissueLabel}** ${__('by', 'alpaca')} ${generateAssigneeSpan(
      currentUser,
    )}`;

    await postComment(issue, commentContent, actionClass, {
      meta: {
        alpacaNotificationContext: buildNotificationContext({
          action: isAssigned ? 'assign' : 'unassign',
          affectedUserIds: user?.id ? [user.id] : [],
          subissueId: subissue?.id,
          subissueTitle: subissueLabel,
        }),
      },
    });
  },
);

addAction(
  'alpaca.subissuePromoted',
  'alpaca/addSubissuePromotedComment',
  async (payload) => {
    const { parentIssue, promotedIssue, subissue } = payload || {};
    const currentUser = await getUser();
    const actionClass = ['subissue-promoted'];
    const subissueLabel = getSubissueLabel(subissue);

    const parentTitle = stripHtmlAndMarkdown(parentIssue?.title || '').trim();
    const parentLabel = parentTitle || __('Unknown issue', 'alpaca');
    const parentIssueLink = getIssueLinkLabel(parentIssue, parentLabel);

    const promotedId = promotedIssue?.id || subissue?.id;
    const promotedTitle = stripHtmlAndMarkdown(
      promotedIssue?.title || '',
    ).trim();
    const promotedLabel = promotedTitle || __('Issue', 'alpaca');
    const promotedIssueLink = getIssueLinkLabel(
      {
        slug: promotedIssue?.slug || subissue?.slug || '',
      },
      promotedLabel,
    );

    const parentComment = `${__('Checklist item', 'alpaca')} **${subissueLabel}** ${__(
      'was promoted to issue',
      'alpaca',
    )} ${promotedIssueLink} ${__('by', 'alpaca')} ${generateAssigneeSpan(
      currentUser,
    )}`;
    const promotedComment = `${__('Issue created from checklist item', 'alpaca')} **${subissueLabel}** ${__(
      'on',
      'alpaca',
    )} ${parentIssueLink} ${__('by', 'alpaca')} ${generateAssigneeSpan(
      currentUser,
    )}`;

    if (parentIssue?.id) {
      await postComment(parentIssue.id, parentComment, actionClass, {
        meta: {
          alpacaNotificationContext: buildNotificationContext({
            action: 'promote',
            subissueId: subissue?.id,
            subissueTitle: subissueLabel,
          }),
        },
      });
    }

    if (promotedId) {
      await postComment(promotedId, promotedComment, actionClass, {
        meta: {
          alpacaNotificationContext: buildNotificationContext({
            action: 'promote',
            subissueId: subissue?.id,
            subissueTitle: subissueLabel,
          }),
        },
      });
    }
  },
);

addAction(
  'alpaca.subissueDeleted',
  'alpaca/addSubissueDeletedComment',
  async (issue, subissue) => {
    const currentUser = await getUser();
    const actionClass = ['subissue-deleted'];
    const subissueLabel = getSubissueLabel(subissue);
    const commentContent = `${__('Checklist item', 'alpaca')} **${subissueLabel}** ${__(
      'deleted by',
      'alpaca',
    )} ${generateAssigneeSpan(currentUser)}`;

    await postComment(issue, commentContent, actionClass, {
      meta: {
        alpacaNotificationContext: buildNotificationContext({
          action: 'delete',
          subissueId: subissue?.id,
          subissueTitle: subissueLabel,
        }),
      },
    });
  },
);

addAction(
  'alpaca.issueDeletedAudit',
  'alpaca/addIssueDeletedAuditComment',
  async (issueId) => {
    if (!issueId) {
      return;
    }

    const currentUser = await getUser();
    const actionClass = ['issue-deleted'];
    const commentContent = `${__('Issue **deleted** by', 'alpaca')} ${generateAssigneeSpan(
      currentUser,
    )}`;

    await postComment(issueId, commentContent, actionClass, {
      meta: {
        alpacaNotificationContext: buildNotificationContext({
          action: 'delete',
        }),
      },
    });
  },
);

addAction(
  'alpaca.issueRestoredAudit',
  'alpaca/addIssueRestoredAuditComment',
  async (issueId) => {
    if (!issueId) {
      return;
    }

    const currentUser = await getUser();
    const actionClass = ['issue-restored'];
    const commentContent = `${__('Issue **restored** by', 'alpaca')} ${generateAssigneeSpan(
      currentUser,
    )}`;

    await postComment(issueId, commentContent, actionClass, {
      meta: {
        alpacaNotificationContext: buildNotificationContext({
          action: 'restore',
        }),
      },
    });
  },
);
