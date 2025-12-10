import PropTypes from 'prop-types';
import { getUser } from '../hooks/useUser';
import { fetchIssueCommentCount } from '../services/issueApi';

const { useState, useEffect, useRef, useCallback, useMemo, memo } = wp.element;
import User from './User';
import Time from './Time';
const { TextareaControl, Button, Modal } = wp.components;
import { getCookie, setCookie } from '../utils/cookies';
import { marked } from 'marked';

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
      currentUser || { name: 'Unknown' };

    const dataSource =
      comment.author_user_agent === 'audit' ? 'audit' : 'human';
    const isAudit = dataSource === 'audit';

    const processedContent = useMemo(() => {
      return comment.content.raw
        ? marked(comment.content.raw)
        : comment.content.rendered;
    }, [comment.content.raw, comment.content.rendered]);

    if (isAudit) {
      // --- Audit Comment Layout ---
      return (
        <div className="alpaca-timeline-item" data-source={dataSource}>
          <div className="alpaca-timeline-content">
            <div className="alpaca-comment-header">
              <User user={author} showName={false} />
              <div className="alpaca-comment-content">
                <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                <Time value={comment.date} type="relative" />
              </div>
              <div className="alpaca-comment-buttons">
                <Button
                  icon="trash"
                  label="Delete"
                  showTooltip
                  className="button-link-delete"
                  onClick={() => confirmDeleteComment(comment.id)}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="alpaca-timeline-item" data-source={dataSource}>
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
              <Button
                label="Edit"
                showTooltip
                icon="edit"
                onClick={() => startEditing(comment)}
              />
              <Button
                icon="trash"
                label="Delete"
                showTooltip
                className="button-link-delete"
                onClick={() => confirmDeleteComment(comment.id)}
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
                  Save
                </Button>
                <Button onClick={cancelEditing} disabled={isSubmitting}>
                  Cancel
                </Button>
              </>
            ) : (
              <div
                className="alpaca-comment-content"
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
        setError('Could not load comments.');
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

    const optimisticComment = {
      id: Date.now(),
      content: { raw: newComment },
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
        status: 'approve',
        author_user_agent: 'human',
      },
    })
      .then((created) => {
        setComments((prev) =>
          prev.map((c) => (c.id === optimisticComment.id ? created : c)),
        );
        wp.hooks.doAction('alpaca.commentPosted', created);

        fetchIssueCommentCount(issueId).then((response) => {
          if (response?.comment_count !== undefined) {
            wp.hooks.doAction('alpaca.commentCountChanged', {
              issueId: issueId.toString(),
              newCount: response.comment_count,
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
          `Failed to submit comment: ${err.message || 'Unknown error'}`,
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
      wp.apiFetch({
        path: `/wp/v2/comments/${commentId}`,
        method: 'POST',
        data: { content: editingContent },
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
            `Failed to update comment: ${err.message || 'Unknown error'}`,
          );
        })
        .finally(() => setIsSubmitting(false));
    },
    [editingContent, showNotification],
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
          `Failed to delete comment: ${err.message || 'Unknown error'}`,
        );
      });
  }, [deleteCommentId, showNotification]);

  return (
    <div id="alpaca-comments-wrapper" className="has-sidecontrols">
      <div id="alpaca-comments-header" className="sidecontrols">
        <Button variant="tertiary" onClick={toggleSortOrder}>
          {sortOrder === 'desc' ? 'Sort: ↑' : 'Sort: ↓'}
        </Button>
      </div>
      <div id="alpaca-comments">
        <div className="alpaca-comment-form" data-source="human">
          <User user={currentUser} />
          <div className="alpaca-timeline-content">
            <TextareaControl
              placeholder="Add a comment..."
              value={newComment}
              onChange={setNewComment}
              disabled={isSubmitting}
            />
            <Button
              isPrimary
              onClick={handleCommentSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Comment'}
            </Button>
          </div>
        </div>

        {isLoadingComments && (
          <p className="alpaca-loading">Loading comments...</p>
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
            title="Delete Comment?"
            onRequestClose={cancelDelete}
            className="alpaca-modal"
          >
            <p>Are you sure you want to delete this comment?</p>
            <Button isPrimary onClick={deleteComment}>
              Delete
            </Button>
            <Button onClick={cancelDelete}>Cancel</Button>
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
