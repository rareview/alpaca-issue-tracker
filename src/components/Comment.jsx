import PropTypes from 'prop-types';
import { getUser } from '../hooks/useUser';
import { fetchIssueCommentCount } from '../services/issueApi';

const { useState, useEffect, useRef, useCallback, useMemo, memo } = wp.element;
const { __ } = wp.i18n;
import User from './User';
import Time from './Time';
const {
  TextareaControl,
  Button,
  Modal,
  Dropdown,
  MenuGroup,
  MenuItem,
  Tooltip,
} = wp.components;
import { getCookie, setCookie } from '../utils/cookies';
import { marked } from 'marked';

const injectAvatarStyles = (htmlString) => {
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
  } catch (e) {
    console.error('Failed to process content for avatar styles', e);
    return htmlString; // Return original string on error
  }
};

/**
 * Comment component for displaying individual comments.
 *
 * @param {Object}   props                      - Props object
 * @param {Object}   props.comment              - Comment data
 * @param {Function} props.startEditing         - Start editing function
 * @param {Function} props.confirmDeleteComment - Confirm delete function
 * @param {number}   props.editingCommentId     - Current editing comment ID
 * @param {string}   props.editingContent       - Editing content
 * @param {Function} props.setEditingContent    - Set editing content function
 * @param {Object}   props.editingRef           - Ref for editing textarea
 * @param {Function} props.saveEdit             - Save edit function
 * @param {Function} props.cancelEditing        - Cancel editing function
 * @param {boolean}  props.isSubmitting         - Is submitting flag
 * @return {JSX.Element} Comment component
 */

// --- Single Comment ---
const Comment = memo(
  ({
    comment,
    startEditing,
    confirmDeleteComment,
    editingCommentId,
    editingContent,
    setEditingContent,
    editingRef,
    saveEdit,
    cancelEditing,
    isSubmitting,
    currentUser,
  }) => {
    const author = comment._embedded?.author?.[0] ||
      currentUser || { name: __('Unknown', 'alpaca') };

    const dataSource =
      comment.author_user_agent === 'audit' ? 'audit' : 'human';
    const isAudit = dataSource === 'audit';

    const commentTags = comment.meta?.alpacaCommentTags || [];
    const timelineItemClasses = ['alpaca-timeline-item', ...commentTags].join(
      ' ',
    );

    const processedContent = useMemo(() => {
      // Optimistic comments have pre-rendered content
      if (!comment.meta && comment.content.rendered) {
        return comment.content.rendered;
      }

      const content = comment.content.raw
        ? marked(comment.content.raw)
        : comment.content.rendered;

      return injectAvatarStyles(content);
    }, [comment]);

    if (isAudit) {
      return (
        <div className={timelineItemClasses} data-source={dataSource}>
          <div className="alpaca-timeline-icon" />
          <div className="alpaca-timeline-msg">
            <div
              className="alpaca-timeline-msg-content with-avatar-meta"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
            <Time
              value={comment.date}
              type="relative"
              className="alpaca-comment-date"
            />
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
            </div>
            <div className="alpaca-comment-date">
              <Time value={comment.date} type="relative" />
            </div>
            <div className="alpaca-comment-buttons">
              <Dropdown
                popoverProps={{ placement: 'bottom-end' }}
                renderToggle={({ isOpen, onToggle }) => (
                  <Tooltip text={__('Options', 'alpaca')}>
                    <Button
                      icon="ellipsis"
                      onClick={onToggle}
                      aria-expanded={isOpen}
                      className="rotate90"
                    />
                  </Tooltip>
                )}
                renderContent={() => (
                  <MenuGroup>
                    <MenuItem icon="edit" onClick={() => startEditing(comment)}>
                      {__('Edit', 'alpaca')}
                    </MenuItem>
                    <MenuItem
                      icon="trash"
                      isDestructive
                      onClick={() => confirmDeleteComment(comment.id)}
                    >
                      {__('Delete', 'alpaca')}
                    </MenuItem>
                  </MenuGroup>
                )}
              />
            </div>
          </div>
          <div className="alpaca-comment-body">
            {editingCommentId === comment.id ? (
              <>
                <TextareaControl
                  value={editingContent}
                  onChange={setEditingContent}
                  ref={editingRef}
                />
                <Button
                  isPrimary
                  onClick={() => saveEdit(comment.id)}
                  disabled={isSubmitting}
                >
                  {__('Save', 'alpaca')}
                </Button>
                <Button onClick={cancelEditing} disabled={isSubmitting}>
                  {__('Cancel', 'alpaca')}
                </Button>
              </>
            ) : (
              <div
                className="alpaca-comment-content with-avatar-meta"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.comment.id === next.comment.id &&
    prev.editingCommentId === next.editingCommentId &&
    prev.editingContent === next.editingContent &&
    prev.isSubmitting === next.isSubmitting,
);

Comment.propTypes = {
  comment: PropTypes.object.isRequired,
  startEditing: PropTypes.func.isRequired,
  confirmDeleteComment: PropTypes.func.isRequired,
  editingCommentId: PropTypes.number,
  editingContent: PropTypes.string,
  setEditingContent: PropTypes.func.isRequired,
  editingRef: PropTypes.object,
  saveEdit: PropTypes.func.isRequired,
  cancelEditing: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  currentUser: PropTypes.object,
};

// --- Commenting Component ---
const Commenting = ({ issueId, commentRefreshKey }) => {
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const editingRef = useRef(null);
  const [sortOrder, setSortOrder] = useState(
    getCookie('comment_sort_order') || 'desc',
  );

  const showNotification = useCallback((message) => {
    setNotificationMessage(message);
    setTimeout(() => setNotificationMessage(null), 5000);
  }, []);

  useEffect(() => {
    getUser().then(setCurrentUser);
  }, []);

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newSortOrder);
    setCookie('comment_sort_order', newSortOrder, 365);
    document.getElementById('alpaca-comments')?.classList.toggle('oldestfirst');
  };

  useEffect(() => {
    if (sortOrder === 'asc') {
      // Original condition was 'asc'
      document.getElementById('alpaca-comments').classList.add('oldestfirst');
    } else {
      document
        .getElementById('alpaca-comments')
        .classList.remove('oldestfirst');
    }
  }, [sortOrder]);

  const fetchComments = useCallback(() => {
    if (!issueId) return;
    setIsLoadingComments(true);
    setError(null);

    wp.apiFetch({
      path: `/wp/v2/comments?post=${issueId}&_embed=author&per_page=-1&orderby=date&order=desc&comment_type=issuecomment&show_hidden_comments=1&context=edit`,
    })
      .then(setComments)
      .catch((err) => {
        console.error(err);
        setError(__('Could not load comments.', 'alpaca'));
      })
      .finally(() => setIsLoadingComments(false));
  }, [issueId]);

  useEffect(() => fetchComments(), [fetchComments, commentRefreshKey]);

  useEffect(() => {
    const handleCommentCountChanged = ({ issueId: changedId }) => {
      if (changedId.toString() === issueId.toString()) fetchComments();
    };
    wp.hooks.addAction(
      'alpaca.commentCountChanged',
      'alpaca/commenting',
      handleCommentCountChanged,
    );
    return () =>
      wp.hooks.removeAction('alpaca.commentCountChanged', 'alpaca/commenting');
  }, [issueId, fetchComments]);

  const handleCommentSubmit = useCallback(() => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    const processedOptimisticContent = injectAvatarStyles(marked(newComment));

    const optimisticComment = {
      id: Date.now(),
      content: { raw: newComment, rendered: processedOptimisticContent },
      _embedded: { author: currentUser },
      date: new Date().toISOString(),
      author_user_agent: 'human',
    };
    setComments((prev) => [optimisticComment, ...prev]);
    setNewComment('');

    wp.apiFetch({
      path: `/wp/v2/comments`,
      method: 'POST',
      data: {
        content: newComment,
        post: issueId,
        comment_type: 'issuecomment',
        author_user_agent: 'human',
      },
    })
      .then((created) => {
        setComments((prev) =>
          prev.map((c) => (c.id === optimisticComment.id ? created : c)),
        );
        wp.hooks.doAction(
          'alpaca.commentPosted',
          wp.hooks.applyFilters('alpaca.commentObject', created),
        );

        fetchIssueCommentCount(issueId).then((response) => {
          if (response?.comment_count !== undefined) {
            wp.hooks.doAction('alpaca.commentCountChanged', {
              issueId: issueId.toString(),
              newCount: response.comment_count,
            });
            wp.hooks.doAction('alpaca.lastActivityChanged', {
              issueId: issueId.toString(),
              lastActivity: new Date().toISOString(),
            });
          }
        });
      })
      .catch((err) => {
        console.error(err);
        setComments((prev) =>
          prev.filter((c) => c.id !== optimisticComment.id),
        );
        showNotification(
          `${__('Failed to submit comment:', 'alpaca')} ${err.message || __('Unknown error', 'alpaca')}`,
        );
      })
      .finally(() => setIsSubmitting(false));
  }, [newComment, currentUser, issueId, showNotification]);

  const startEditing = useCallback((comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content.raw || comment.content.rendered || '');
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent('');
  }, []);

  const saveEdit = useCallback(
    (commentId) => {
      if (!editingContent.trim()) return;
      setIsSubmitting(true);

      const comment = comments.find((c) => c.id === commentId);
      const agent = comment?.author_user_agent || 'human';

      wp.apiFetch({
        path: `/wp/v2/comments/${commentId}`,
        method: 'POST',
        data: {
          content: editingContent,
          author_user_agent: agent,
        },
      })
        .then((updated) => {
          setComments((prev) =>
            prev.map((c) => (c.id === commentId ? updated : c)),
          );
          setEditingCommentId(null);
          setEditingContent('');
          wp.hooks.doAction('alpaca.commentUpdated', updated);
        })
        .catch((err) => {
          console.error(err);
          showNotification(
            `${__('Failed to update comment:', 'alpaca')} ${err.message || __('Unknown error', 'alpaca')}`,
          );
        })
        .finally(() => setIsSubmitting(false));
    },
    [editingContent, comments, showNotification],
  );

  const confirmDeleteComment = useCallback(
    (commentId) => setDeleteCommentId(commentId),
    [],
  );
  const cancelDelete = useCallback(() => setDeleteCommentId(null), []);
  const deleteComment = useCallback(() => {
    if (!deleteCommentId) return;
    wp.apiFetch({
      path: `/wp/v2/comments/${deleteCommentId}`,
      method: 'DELETE',
      data: { force: true },
    })
      .then((deletedComment) => {
        setComments((prev) => prev.filter((c) => c.id !== deleteCommentId));
        setDeleteCommentId(null);

        wp.hooks.doAction('alpaca.commentDeleted', deletedComment);

        // Dispatch event to update comment count
        // The deletedComment object contains the post ID
        const postId = deletedComment.previous.post;
        fetchIssueCommentCount(postId)
          .then((response) => {
            if (response && typeof response.comment_count !== 'undefined') {
              wp.hooks.doAction('alpaca.commentCountChanged', {
                issueId: postId.toString(),
                newCount: response.comment_count,
              });
            }
          })
          .catch((err) => {
            console.error('Error fetching updated comment count:', err);
          });
      })
      .catch((err) => {
        console.error(err);
        showNotification(
          `${__('Failed to delete comment:', 'alpaca')} ${err.message || __('Unknown error', 'alpaca')}`,
        );
      });
  }, [deleteCommentId, showNotification]);

  return (
    <div id="alpaca-comments-wrapper">
      <div id="alpaca-comments-header">
        <Button variant="tertiary" onClick={toggleSortOrder}>
          {sortOrder === 'desc'
            ? __('Sort: ↑', 'alpaca')
            : __('Sort: ↓', 'alpaca')}
        </Button>
      </div>

      <div id="alpaca-comments">
        <div className="alpaca-comment-form" data-source="human">
          <div className="alpaca-timeline-content">
            <TextareaControl
              placeholder={__('Add a comment…', 'alpaca')}
              value={newComment}
              onChange={setNewComment}
              disabled={isSubmitting}
            />
            <div className="alpaca-comment-form-actions">
              <Button
                isPrimary
                onClick={handleCommentSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? __('Submitting…', 'alpaca')
                  : __('Submit Comment', 'alpaca')}
              </Button>
            </div>
          </div>
        </div>

        {isLoadingComments && (
          <p className="alpaca-loading">{__('Loading comments…', 'alpaca')}</p>
        )}
        {notificationMessage && (
          <div className="notice notice-error inline">
            <p>{notificationMessage}</p>
          </div>
        )}
        {error && <p className="alpaca-error">{error}</p>}

        <div className="alpaca-comments-timeline">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              startEditing={startEditing}
              confirmDeleteComment={confirmDeleteComment}
              editingCommentId={editingCommentId}
              editingContent={editingContent}
              setEditingContent={setEditingContent}
              editingRef={editingRef}
              saveEdit={saveEdit}
              cancelEditing={cancelEditing}
              isSubmitting={isSubmitting}
              currentUser={currentUser}
            />
          ))}
        </div>

        {deleteCommentId && (
          <Modal
            title={__('Delete Comment?', 'alpaca')}
            onRequestClose={cancelDelete}
            className="alpaca-modal"
          >
            <p>
              {__('Are you sure you want to delete this comment?', 'alpaca')}
            </p>
            <Button isPrimary onClick={deleteComment}>
              {__('Delete', 'alpaca')}
            </Button>
            <Button onClick={cancelDelete}>{__('Cancel', 'alpaca')}</Button>
          </Modal>
        )}
      </div>
    </div>
  );
};

Commenting.propTypes = {
  issueId: PropTypes.number.isRequired,
  commentRefreshKey: PropTypes.number.isRequired,
};

export default memo(Commenting);
