import PropTypes from 'prop-types';
import { marked } from 'marked';
import User from '../User';
import Time from '../Time';
import { Attachment } from '../issue/AttachmentRow';
import { generateAssigneeSpan } from '../../hooks/useUser';
import { highlightHtmlContent } from '../../utils/searchHighlight';
import { sanitizeHtml, isValidHttpUrl } from '../../utils/sanitize';

const { __, sprintf } = wp.i18n;
const { useMemo, memo } = wp.element;

/**
 * Convert supported user identifier shapes to a positive integer.
 *
 * @param {unknown} candidate Potential user identifier.
 * @return {number} Positive integer user ID or 0 when unavailable.
 */
const resolveUserId = (candidate) => {
  if (typeof candidate === 'number' && Number.isFinite(candidate)) {
    return candidate > 0 ? candidate : 0;
  }

  if (typeof candidate === 'string') {
    const parsed = Number(candidate);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  if (candidate && typeof candidate === 'object') {
    return (
      resolveUserId(candidate.id) ||
      resolveUserId(candidate.ID) ||
      resolveUserId(candidate.user_id)
    );
  }

  return 0;
};

/**
 * Normalize a display name for reliable equality checks.
 *
 * @param {string} name Raw name value.
 * @return {string} Lowercased and trimmed name.
 */
const normalizeUserName = (name) =>
  String(name || '')
    .trim()
    .toLowerCase();

/**
 * Determine whether the latest edit came from a different user.
 *
 * @param {Object} comment      Comment object.
 * @param {Object} author       Resolved original author object.
 * @param {Object} lastEditMeta Latest edit metadata.
 * @return {boolean} True when edit user differs from comment author.
 */
const isEditedByDifferentUser = (comment, author, lastEditMeta) => {
  const originalAuthorId =
    resolveUserId(comment?.author) ||
    resolveUserId(comment?.author_details) ||
    resolveUserId(comment?._embedded?.author?.[0]);
  const editedByUserId = resolveUserId(lastEditMeta?.userId);

  if (editedByUserId > 0 && originalAuthorId > 0) {
    return editedByUserId !== originalAuthorId;
  }

  const editedByUserName = normalizeUserName(lastEditMeta?.userName);
  const authorName = normalizeUserName(author?.name);

  return Boolean(
    editedByUserId === 0 && editedByUserName && editedByUserName !== authorName,
  );
};

/**
 * Add inline avatar CSS variable styles to rendered comment HTML.
 *
 * @param {string} htmlString HTML string to process.
 * @return {string} Processed HTML string.
 */
export const injectAvatarStyles = (htmlString) => {
  if (
    typeof DOMParser === 'undefined' ||
    !htmlString ||
    !htmlString.includes('data-avatar')
  ) {
    return htmlString;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const spans = doc.querySelectorAll('[data-avatar]');
    spans.forEach((span) => {
      const avatarUrl = span.dataset.avatar;
      if (avatarUrl && isValidHttpUrl(avatarUrl)) {
        const safeUrl = avatarUrl.replace(/'/g, "\\'");
        span.style.setProperty('--avatar-url', `url('${safeUrl}')`);
      }
    });
    return doc.body.innerHTML;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to process content for avatar styles', error);
    return htmlString;
  }
};

/**
 * Build rendered HTML for a comment body.
 *
 * @param {Object} comment Comment object.
 * @return {string} Rendered comment HTML.
 */
export const getProcessedCommentContent = (comment) => {
  if (!comment || !comment.content) {
    return '';
  }

  const mentionMarkup = (rawContent) => {
    const content = typeof rawContent === 'string' ? rawContent : '';
    const mentions = Array.isArray(comment.meta?.alpacaMentionedUsers)
      ? comment.meta.alpacaMentionedUsers
      : [];

    if (!content || !mentions.length) {
      return content;
    }

    const mentionReplacements = mentions.reduce((accumulator, mention) => {
      const slug = mention?.slug;
      const displayName = mention?.display_name;
      const avatar = mention?.avatar;
      const userId = mention?.id;

      if (!slug || !displayName) {
        return accumulator;
      }

      accumulator[String(slug).toLowerCase()] = generateAssigneeSpan(
        {
          id: userId,
          display_name: displayName,
          avatar,
        },
        Boolean(avatar),
      );

      return accumulator;
    }, {});

    return content.replace(
      /(^|[\s>([{])@([a-zA-Z0-9._-]+)(?=$|[^a-zA-Z0-9._-])/g,
      (match, prefix, slug) => {
        const replacement = mentionReplacements[String(slug).toLowerCase()];

        if (!replacement) {
          return match;
        }

        return `${prefix}${replacement}`;
      },
    );
  };

  let content = '';

  if (comment.content.raw) {
    content = sanitizeHtml(marked(mentionMarkup(comment.content.raw)));
  } else if (comment.content.rendered) {
    content = sanitizeHtml(mentionMarkup(comment.content.rendered));
  }

  return injectAvatarStyles(content);
};

/**
 * Shared timeline entry renderer for issue comments.
 *
 * @param {Object}   props                         Component props.
 * @param {Object}   props.comment                 Comment object.
 * @param {Object}   props.currentUser             Current user object.
 * @param {Function} props.onAttachmentClick       Attachment click callback.
 * @param {Object}   props.headerActions           Header actions.
 * @param {Object}   props.footerActions           Footer actions.
 * @param {string}   props.issueTitle              Issue title.
 * @param {boolean}  props.showIssueTitle          Whether to display issue title.
 * @param {boolean}  props.showTime                Whether to display time.
 * @param {boolean}  props.isEditing               Whether the entry is in edit mode.
 * @param {Object}   props.editBody                Edit form body.
 * @param {boolean}  props.isSubmitting            Whether submit is in progress.
 * @param {boolean}  props.stripInteractive        Remove interactive HTML elements from rendered body.
 * @param {boolean}  props.enableAttachmentPreview Whether image attachment zoom preview is enabled.
 * @param {boolean}  props.auditTimeInTopline      Whether audit timestamp renders in a title row.
 * @param {string}   props.className               Optional extra class names for wrapper.
 * @param {string}   props.highlightQuery          Active search query for inline highlighting.
 * @return {JSX.Element} Rendered timeline entry.
 */
const TimelineEntry = ({
  comment,
  currentUser,
  onAttachmentClick,
  headerActions,
  footerActions,
  issueTitle,
  showIssueTitle,
  showTime,
  isEditing,
  editBody,
  isSubmitting,
  stripInteractive,
  enableAttachmentPreview,
  auditTimeInTopline,
  className,
  highlightQuery,
}) => {
  const author = comment.author_details ||
    comment._embedded?.author?.[0] ||
    currentUser || { name: __('Unknown', 'alpaca-issue-tracker') };

  let dataSource = 'human';

  if ('audit' === comment.author_user_agent) {
    dataSource = 'audit';
  } else if ('create' === comment.author_user_agent) {
    dataSource = 'create';
  }
  const isAudit = dataSource === 'audit';
  const commentTags = comment.meta?.alpacaCommentTags || [];
  const commentAttachments = comment.meta?.alpacaCommentAttachments || [];
  const lastEditMeta = comment.meta?.alpacaCommentLastEdit || null;
  const editedByUserId = resolveUserId(lastEditMeta?.userId);
  const editedByUserName =
    typeof lastEditMeta?.userName === 'string' ? lastEditMeta.userName : '';
  const editedDate =
    typeof lastEditMeta?.date === 'string' && lastEditMeta.date
      ? lastEditMeta.date
      : '';
  const editedDateIsGmt = /(?:Z|[+-]\d{2}:\d{2})$/i.test(editedDate);
  const createdAtValue =
    typeof comment?.date_gmt === 'string' && comment.date_gmt
      ? comment.date_gmt
      : comment?.date || '';
  const createdAtIsGmt =
    typeof comment?.date_gmt === 'string' && Boolean(comment.date_gmt);
  const showEditedStamp = Boolean(editedDate);
  const editedByDifferentUser = isEditedByDifferentUser(
    comment,
    author,
    lastEditMeta,
  );
  const editedByUserLabel =
    editedByUserName || __('another user', 'alpaca-issue-tracker');
  let editedByUser = null;
  if (editedByUserId > 0) {
    editedByUser = editedByUserId;
  } else if (editedByUserName) {
    editedByUser = {
      name: editedByUserLabel,
    };
  }
  const timelineItemClasses = [
    'alpaca-timeline-item',
    ...commentTags,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const issuePrefix = sprintf(
    /* translators: Prefix before issue title in activity headers. */
    __('on %s', 'alpaca-issue-tracker'),
    '',
  ).trim();
  const processedContent = useMemo(() => {
    let html = getProcessedCommentContent(comment);
    if (stripInteractive && html) {
      // Remove interactive elements that would nest inside a clickable wrapper.
      html = html.replace(
        /<(a|button|input|select|textarea)\b[^>]*>([\s\S]*?)<\/\1>/gi,
        '$2',
      );
      html = html.replace(/<input\b[^>]*\/?>/gi, '');
    }
    const highlightableDataSources = ['human', 'create'];
    if (highlightableDataSources.includes(dataSource)) {
      html = highlightHtmlContent(html, highlightQuery);
    }

    return html;
  }, [comment, stripInteractive, dataSource, highlightQuery]);

  if (isAudit) {
    return (
      <div className={timelineItemClasses} data-source={dataSource}>
        <div className="alpaca-timeline-icon" />
        <div className="alpaca-timeline-msg">
          {auditTimeInTopline &&
            ((showIssueTitle && issueTitle) || showTime) && (
              <div className="alpaca-audit-topline">
                {showIssueTitle && issueTitle && (
                  <div className="alpaca-comment-issue-title">{issueTitle}</div>
                )}
                {showTime && (
                  <Time
                    value={createdAtValue}
                    isGmt={createdAtIsGmt}
                    type="relative"
                    className="alpaca-comment-date"
                  />
                )}
              </div>
            )}
          {!auditTimeInTopline && showIssueTitle && issueTitle && (
            <div className="alpaca-comment-issue-title">{issueTitle}</div>
          )}
          <div className="alpaca-audit-inline-row">
            <div
              className="alpaca-timeline-msg-content with-avatar-meta"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
            {showTime && !auditTimeInTopline && (
              <Time
                value={createdAtValue}
                isGmt={createdAtIsGmt}
                type="relative"
                className="alpaca-comment-date alpaca-audit-inline-time"
              />
            )}
          </div>
          <div className="alpaca-timeline-msg-meta alpaca-flex-align">
            {headerActions && (
              <div className="alpaca-comment-buttons">{headerActions}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={timelineItemClasses} data-source={dataSource}>
      <div className="alpaca-timeline-content">
        <div
          className={`alpaca-comment-header alpaca-flex-align${
            showIssueTitle && issueTitle ? ' has-issue-title' : ''
          }`}
        >
          <User user={author} showName={false} />
          <div className="alpaca-comment-author">
            <strong>{author.name}</strong>
            {showIssueTitle && issueTitle && (
              <span className="alpaca-comment-on-title">
                {' '}
                {issuePrefix}{' '}
                <strong className="alpaca-comment-on-title-text">
                  {issueTitle}
                </strong>
              </span>
            )}
          </div>
          {showTime && (
            <div className="alpaca-comment-date">
              <Time
                value={createdAtValue}
                isGmt={createdAtIsGmt}
                type="relative"
              />
              {showEditedStamp && (
                <div className="alpaca-comment-edited-date">
                  {' '}
                  (
                  {editedByDifferentUser ? (
                    <>
                      {__('edited by', 'alpaca-issue-tracker')}{' '}
                      {editedByUser ? (
                        <User
                          user={editedByUser}
                          showName
                          avatarAfterName
                          avatarSize={24}
                        />
                      ) : (
                        editedByUserLabel
                      )}
                    </>
                  ) : (
                    __('edited', 'alpaca-issue-tracker')
                  )}{' '}
                  <Time
                    value={editedDate}
                    isGmt={editedDateIsGmt}
                    type="relative"
                  />
                  )
                </div>
              )}
            </div>
          )}
          {headerActions && (
            <div className="alpaca-comment-buttons">{headerActions}</div>
          )}
        </div>
        <div className="alpaca-comment-body">
          {isEditing ? (
            editBody
          ) : (
            <div
              className="alpaca-comment-content with-avatar-meta"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          )}
          {!isEditing && !isSubmitting && commentAttachments.length > 0 && (
            <div className="alpaca-attachments-wrapper alpaca-comment-attachments">
              {commentAttachments.map((attachmentUrl, index) => (
                <Attachment
                  key={`${comment.id}-${index}`}
                  attachment={{ url: attachmentUrl }}
                  onAttachmentClick={
                    enableAttachmentPreview ? onAttachmentClick : null
                  }
                  showDelete={false}
                  altText={__('Comment attachment', 'alpaca-issue-tracker')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {footerActions && (
        <div className="alpaca-timeline-footer-actions">{footerActions}</div>
      )}
    </div>
  );
};

TimelineEntry.propTypes = {
  comment: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  onAttachmentClick: PropTypes.func,
  headerActions: PropTypes.node,
  footerActions: PropTypes.node,
  issueTitle: PropTypes.string,
  showIssueTitle: PropTypes.bool,
  showTime: PropTypes.bool,
  isEditing: PropTypes.bool,
  editBody: PropTypes.node,
  isSubmitting: PropTypes.bool,
  stripInteractive: PropTypes.bool,
  enableAttachmentPreview: PropTypes.bool,
  auditTimeInTopline: PropTypes.bool,
  className: PropTypes.string,
  highlightQuery: PropTypes.string,
};

TimelineEntry.defaultProps = {
  currentUser: null,
  onAttachmentClick: null,
  headerActions: null,
  footerActions: null,
  issueTitle: '',
  showIssueTitle: false,
  showTime: true,
  isEditing: false,
  editBody: null,
  isSubmitting: false,
  stripInteractive: false,
  enableAttachmentPreview: true,
  auditTimeInTopline: false,
  className: '',
  highlightQuery: '',
};

export default memo(TimelineEntry);
