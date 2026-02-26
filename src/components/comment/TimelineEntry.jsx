import PropTypes from 'prop-types';
import { marked } from 'marked';
import User from '../User';
import Time from '../Time';
import { Attachment } from '../issue/AttachmentRow';

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

  if (!comment.meta && comment.content.rendered) {
    return comment.content.rendered;
  }

  const content = comment.content.raw
    ? marked(comment.content.raw)
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
 * @param {string}   props.issueTitle        Issue title.
 * @param {boolean}  props.showIssueTitle    Whether to display issue title.
 * @param {boolean}  props.showTime          Whether to display time.
 * @param {boolean}  props.isEditing         Whether the entry is in edit mode.
 * @param {Object}   props.editBody          Edit form body.
 * @param {boolean}  props.isSubmitting      Whether submit is in progress.
 * @return {JSX.Element} Rendered timeline entry.
 */
const TimelineEntry = ({
  comment,
  currentUser,
  onAttachmentClick,
  headerActions,
  issueTitle,
  showIssueTitle,
  showTime,
  isEditing,
  editBody,
  isSubmitting,
}) => {
  const author = comment.author_details ||
    comment._embedded?.author?.[0] ||
    currentUser || { name: __('Unknown', 'alpaca') };

  const dataSource = comment.author_user_agent === 'audit' ? 'audit' : 'human';
  const isAudit = dataSource === 'audit';
  const commentTags = comment.meta?.alpacaCommentTags || [];
  const commentAttachments = comment.meta?.alpacaCommentAttachments || [];
  const timelineItemClasses = ['alpaca-timeline-item', ...commentTags].join(
    ' ',
  );
  const issuePrefix = sprintf(
    /* translators: Prefix before issue title in activity headers. */
    __('on %s', 'alpaca'),
    '',
  ).trim();
  const processedContent = useMemo(
    () => getProcessedCommentContent(comment),
    [comment],
  );

  if (isAudit) {
    return (
      <div className={timelineItemClasses} data-source={dataSource}>
        <div className="alpaca-timeline-icon" />
        <div className="alpaca-timeline-msg">
          {showIssueTitle && issueTitle && (
            <div className="alpaca-comment-issue-title">{issueTitle}</div>
          )}
          <div
            className="alpaca-timeline-msg-content with-avatar-meta"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
          {showTime && (
            <Time
              value={comment.date}
              type="relative"
              className="alpaca-comment-date"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={timelineItemClasses} data-source={dataSource}>
      <div className="alpaca-timeline-content">
        <div className="alpaca-comment-header flexalign">
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
                  onAttachmentClick={onAttachmentClick}
                  showDelete={false}
                  altText={__('Comment attachment', 'alpaca')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

TimelineEntry.propTypes = {
  comment: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
  onAttachmentClick: PropTypes.func.isRequired,
  headerActions: PropTypes.node,
  issueTitle: PropTypes.string,
  showIssueTitle: PropTypes.bool,
  showTime: PropTypes.bool,
  isEditing: PropTypes.bool,
  editBody: PropTypes.node,
  isSubmitting: PropTypes.bool,
};

TimelineEntry.defaultProps = {
  currentUser: null,
  headerActions: null,
  issueTitle: '',
  showIssueTitle: false,
  showTime: true,
  isEditing: false,
  editBody: null,
  isSubmitting: false,
};

export default memo(TimelineEntry);
