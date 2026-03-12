import PropTypes from 'prop-types';
import { marked } from 'marked';
import User from '../User';
import Time from '../Time';
import { Attachment } from '../issue/AttachmentRow';
import { generateAssigneeSpan } from '../../hooks/useUser';

const { __, sprintf } = wp.i18n;
const { useMemo, memo } = wp.element;

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
      if (avatarUrl) {
        span.style.setProperty('--avatar-url', `url('${avatarUrl}')`);
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

    return mentions.reduce((processed, mention) => {
      const slug = mention?.slug;
      const displayName = mention?.display_name;
      const avatar = mention?.avatar;
      const userId = mention?.id;

      if (!slug || !displayName) {
        return processed;
      }

      const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const replacement = generateAssigneeSpan(
        {
          id: userId,
          display_name: displayName,
          avatar,
        },
        Boolean(avatar),
      );

      return processed.replace(
        new RegExp(`(^|\\\\s)@${escapedSlug}(?=$|[^a-zA-Z0-9._-])`, 'g'),
        `$1${replacement}`,
      );
    }, content);
  };

  if (!comment.meta && comment.content.rendered) {
    return comment.content.rendered;
  }

  const content = comment.content.raw
    ? marked(mentionMarkup(comment.content.raw))
    : comment.content.rendered;

  return injectAvatarStyles(content);
};

/**
 * Shared timeline entry renderer for issue comments.
 *
 * @param {Object}   props                   Component props.
 * @param {Object}   props.comment           Comment object.
 * @param {Object}   props.currentUser       Current user object.
 * @param {Function} props.onAttachmentClick Attachment click callback.
 * @param {Object}   props.headerActions     Header actions.
 * @param {Object}   props.footerActions     Footer actions.
 * @param {string}   props.issueTitle        Issue title.
 * @param {boolean}  props.showIssueTitle    Whether to display issue title.
 * @param {boolean}  props.showTime          Whether to display time.
 * @param {boolean}  props.isEditing         Whether the entry is in edit mode.
 * @param {Object}   props.editBody          Edit form body.
 * @param {boolean}  props.isSubmitting      Whether submit is in progress.
 * @param {boolean}  props.stripInteractive  Remove interactive HTML elements from rendered body.
 * @param {boolean}  props.enableAttachmentPreview Whether image attachment zoom preview is enabled.
 * @param {boolean}  props.auditTimeInTopline Whether audit timestamp renders in a title row.
 * @param {string}   props.className         Optional extra class names for wrapper.
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
}) => {
  const author = comment.author_details ||
    comment._embedded?.author?.[0] ||
    currentUser || { name: __('Unknown', 'alpaca') };

  const dataSource = comment.author_user_agent === 'audit' ? 'audit' : 'human';
  const isAudit = dataSource === 'audit';
  const commentTags = comment.meta?.alpacaCommentTags || [];
  const commentAttachments = comment.meta?.alpacaCommentAttachments || [];
  const timelineItemClasses = [
    'alpaca-timeline-item',
    ...commentTags,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const issuePrefix = sprintf(
    /* translators: Prefix before issue title in activity headers. */
    __('on %s', 'alpaca'),
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
    return html;
  }, [comment, stripInteractive]);

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
                    value={comment.date}
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
                value={comment.date}
                type="relative"
                className="alpaca-comment-date alpaca-audit-inline-time"
              />
            )}
          </div>
          <div className="alpaca-timeline-msg-meta flexalign">
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
          className={`alpaca-comment-header flexalign${
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
              <Time value={comment.date} type="relative" />
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
                  altText={__('Comment attachment', 'alpaca')}
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
};

export default memo(TimelineEntry);
