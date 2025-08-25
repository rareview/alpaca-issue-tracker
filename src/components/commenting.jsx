const { useState, useEffect, useRef, useCallback } = wp.element;
import User from "./User";
const { TextareaControl, Button, Spinner, Modal } = wp.components;

import { marked } from "marked";

const Commenting = ({ issueId, onCommentCountChange, commentRefreshKey }) => {
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const editingRef = useRef(null);

  const [deleteCommentId, setDeleteCommentId] = useState(null); // New state for modal

  useEffect(() => {
    wp.apiFetch({ path: "/wp/v2/users/me" }).then((user) => {
      setCurrentUser(user);
    });
  }, []);

  const fetchComments = useCallback(() => {
    if (!issueId) return;
    setIsLoadingComments(true);
    setError(null);

    wp.apiFetch({
      path: `/wp/v2/comments?post=${issueId}&per_page=-1&orderby=date&order=desc&comment_type=issuecomment&show_hidden_comments=1&context=edit`,
    })
      .then((fetchedComments) => {
        setComments(fetchedComments);
        if (onCommentCountChange) {
          onCommentCountChange(fetchedComments.length);
        }
      })
      .catch((err) => {
        console.error("Error fetching comments:", err);
        setError("Could not load comments.");
      })
      .finally(() => setIsLoadingComments(false));
  }, [issueId, onCommentCountChange]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments, commentRefreshKey]);

  useEffect(() => {
    if (editingRef.current) editingRef.current.focus();
  }, [editingCommentId]);

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    wp.apiFetch({
      path: `/wp/v2/comments`,
      method: "POST",
      data: {
        content: newComment,
        post: issueId,
        comment_type: "issuecomment",
      },
    })
      .then(() => {
        setNewComment("");
        fetchComments();
      })
      .catch((err) => {
        console.error(err);
        alert(`Failed to submit comment: ${err.message || "Unknown error"}`);
      })
      .finally(() => setIsSubmitting(false));
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(
      comment.content.raw || stripHtml(comment.content.rendered)
    );
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const saveEdit = (commentId) => {
    if (!editingContent.trim()) return;
    setIsSubmitting(true);

    wp.apiFetch({
      path: `/wp/v2/comments/${commentId}`,
      method: "POST",
      data: { content: editingContent },
    })
      .then(() => {
        setEditingCommentId(null);
        setEditingContent("");
        fetchComments();
      })
      .catch((err) => {
        console.error(err);
        alert(`Failed to update comment: ${err.message || "Unknown error"}`);
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
      method: "DELETE",
      data: { force: true },
    })
      .then(() => {
        fetchComments();
        setDeleteCommentId(null);
      })
      .catch((err) => {
        console.error(err);
        alert(`Failed to delete comment: ${err.message || "Unknown error"}`);
      });
  };

  return (
    <>
      <div id="alpaca-comments" className="alpaca-grid">
        {/* New comment input */}
        <TextareaControl
          placeholder="Add a comment..."
          value={newComment}
          onChange={setNewComment}
          disabled={isSubmitting}
        />
        <Button isPrimary onClick={handleCommentSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Comment"}
        </Button>

        {isLoadingComments && <Spinner />}
        {error && <p className="alpaca-error">{error}</p>}
        {!isLoadingComments && !error && comments.length === 0 && (
          <p>No comments yet.</p>
        )}

        {/* Comments list */}
        {!isLoadingComments &&
          comments.map((comment) => (
            <div className="alpaca-row" key={comment.id}>
              <div className="alpaca-meta">
                <User
                  user={{
                    ...comment.author_meta,
                    name: comment.author_name,
                    avatar: comment.author_avatar_urls[96],
                  }}
                />
                <span className="alpaca-comment-date">
                  {new Date(comment.date).toLocaleString()}
                </span>
              </div>
              <div className="alpaca-comment">
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
                      dangerouslySetInnerHTML={{
                        __html: comment.content.raw
                          ? marked(comment.content.raw)
                          : comment.content.rendered,
                      }}
                    />
                    <div>
                      <button onClick={() => startEditing(comment)}>
                        Edit
                      </button>{" "}
                      <button
                        className="button-link-delete"
                        onClick={() => confirmDeleteComment(comment.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

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
    </>
  );
};

export default Commenting;
