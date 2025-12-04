import { getUser } from '../hooks/useUser';
import { fetchIssueCommentCount } from '../services/issueApi';
import PropTypes from 'prop-types';

const { useState, useEffect, useRef, useCallback, memo, useMemo } = wp.element;
import User from './User';
const { TextareaControl, Button, Spinner, Modal } = wp.components;

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
const Comment = (props) => {
  const {
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
  } = props;

  const processedContent = useMemo(() => {
    return comment.content.raw
      ? marked(comment.content.raw)
      : comment.content.rendered;
  }, [comment.content.raw, comment.content.rendered]);

  return (
    <div
      className="alpaca-timeline-item"
      data-source={comment.author_user_agent}
    >
      <div className="alpaca-timeline-content">
        <div className="alpaca-comment-header">
          <User user={comment._embedded?.author?.[0]} showName={false} />
          <div className="alpaca-comment-author">
            <strong>{comment._embedded?.author?.[0]?.name || 'Unknown'}</strong>
          </div>
          <div className="alpaca-comment-date">
            <small>{new Date(comment.date).toLocaleString()}</small>
          </div>
          <div className="alpaca-comment-buttons">
            <Button
              label="Edit"
              showTooltip="true"
              icon="edit"
              onClick={() => {
                startEditing(comment);
              }}
            />
            <Button
              icon="trash"
              label="Delete"
              showTooltip="true"
              className="button-link-delete"
              onClick={() => {
                confirmDeleteComment(comment.id);
              }}
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
            <>
              <div
                className="alpaca-comment-content"
                dangerouslySetInnerHTML={{
                  __html: processedContent,
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

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
};

const MemoizedComment = memo(Comment);

const Commenting = ({ issueId, commentRefreshKey }) => {
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const editingRef = useRef(null);

  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [sortOrder, setSortOrder] = useState(
    getCookie('comment_sort_order') || 'desc',
  ); // 'desc' or 'asc'

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newSortOrder);
    setCookie('comment_sort_order', newSortOrder, 365);
    document.getElementById('alpaca-comments').classList.toggle('oldestfirst');
  };

  useEffect(() => {
    getUser().then((user) => {
      setCurrentUser(user);
    });
  }, []); // Run once on mount to get user

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
      .then((fetchedComments) => {
        setComments(fetchedComments);
      })
      .catch((err) => {
        console.error('Error fetching comments:', err);
        setError('Could not load comments.');
      })
      .finally(() => setIsLoadingComments(false));
  }, [issueId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments, commentRefreshKey]);

  useEffect(() => {
    const handleCommentCountChanged = (data) => {
      const { issueId: changedIssueId } = data;
      if (changedIssueId.toString() === issueId.toString()) {
        fetchComments();
      }
    };

    wp.hooks.addAction(
      'alpaca.commentCountChanged',
      'alpaca/commenting',
      handleCommentCountChanged,
    );

    return () => {
      wp.hooks.removeAction('alpaca.commentCountChanged', 'alpaca/commenting');
    };
  }, [issueId, fetchComments]);

  useEffect(() => {
    if (editingRef.current) editingRef.current.focus();
  }, [editingCommentId]);

  const stripHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);

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
      .then((newlyCreatedComment) => {
        setNewComment('');
        fetchComments();

        wp.hooks.doAction('alpaca.commentPosted', newlyCreatedComment); // New doAction

        // Dispatch event to update comment count
        const postId = newlyCreatedComment.post;
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
            console.error(
              'Error fetching updated comment count after adding:',
              err,
            );
          });
      })
      .catch((err) => {
        console.error(err);
        // eslint-disable-next-line no-alert
        alert(`Failed to submit comment: ${err.message || 'Unknown error'}`);
      })
      .finally(() => setIsSubmitting(false));
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(
      comment.content.raw || stripHtml(comment.content.rendered),
    );
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const saveEdit = (commentId) => {
    if (!editingContent.trim()) return;
    setIsSubmitting(true);

    // Find original comment to preserve user agent
    const originalComment = comments.find((c) => c.id === commentId);
    const userAgent = originalComment?.author_user_agent || 'human';

    wp.apiFetch({
      path: `/wp/v2/comments/${commentId}`,
      method: 'POST',
      data: {
        content: editingContent,
        author_user_agent: userAgent,
      },
    })
      .then((updatedComment) => {
        // Add updatedComment parameter
        setEditingCommentId(null);
        setEditingContent('');
        fetchComments();

        wp.hooks.doAction('alpaca.commentUpdated', updatedComment); // New doAction
      })
      .catch((err) => {
        console.error(err);
        // eslint-disable-next-line no-alert
        alert(`Failed to update comment: ${err.message || 'Unknown error'}`);
      })
      .finally(() => setIsSubmitting(false));
  };

  const confirmDeleteComment = (commentId) => {
    setDeleteCommentId(commentId);
  };

  const cancelDelete = () => setDeleteCommentId(null);

  const deleteComment = () => {
    if (!deleteCommentId) return;
    wp.apiFetch({
      path: `/wp/v2/comments/${deleteCommentId}`,
      method: 'DELETE',
      data: { force: true },
    })
      .then((deletedComment) => {
        fetchComments();
        setDeleteCommentId(null);

        wp.hooks.doAction('alpaca.commentDeleted', deletedComment); // New doAction

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
        // eslint-disable-next-line no-alert
        alert(`Failed to delete comment: ${err.message || 'Unknown error'}`);
      });
  };

  return (
    <>
      <div id="alpaca-comments-wrapper">
        <div id="alpaca-comments-header">
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

          {isLoadingComments && <Spinner />}
          {error && <p className="alpaca-error">{error}</p>}
          {!isLoadingComments && !error && comments.length === 0 && (
            <p>No comments yet.</p>
          )}

          <div className="alpaca-comments-timeline">
            {!isLoadingComments &&
              comments.map((comment) => (
                <MemoizedComment
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
                />
              ))}
          </div>

          {/* Modal for delete */}
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
    </>
  );
};

Commenting.propTypes = {
  issueId: PropTypes.number.isRequired,
  commentRefreshKey: PropTypes.number.isRequired,
};

export default Commenting;
