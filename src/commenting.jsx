const { useState, useEffect, useRef, useCallback } = wp.element;
import AlpacaUser from "./user";
const { TextareaControl, Button, Spinner } = wp.components;

const AlpacaCommenting = ({ issueId }) => {
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const editingRef = useRef(null);

  const fetchComments = useCallback(() => {
    if (!issueId) return;

    setIsLoadingComments(true);
    setError(null);

    wp.apiFetch({
      path: `/wp/v2/comments?post=${issueId}&orderby=date&order=asc&comment_type=issuecomment&show_hidden_comments=1`,
    })
      .then(setComments)
      .catch((err) => {
        console.error("Error fetching comments:", err);
        setError("Could not load comments.");
      })
      .finally(() => setIsLoadingComments(false));
  }, [issueId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Focus Textarea when editing
  useEffect(() => {
    if (editingRef.current) {
      editingRef.current.focus();
    }
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
        console.error("Error submitting comment:", err);
        alert(`Failed to submit comment: ${err.message || "Unknown error"}`);
      })
      .finally(() => setIsSubmitting(false));
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(stripHtml(comment.content.rendered));
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
        console.error("Error updating comment:", err);
        alert(`Failed to update comment: ${err.message || "Unknown error"}`);
      })
      .finally(() => setIsSubmitting(false));
  };

  const deleteComment = (commentId) => {
    if (!confirm("Delete this comment?")) return;

    wp.apiFetch({
      path: `/wp/v2/comments/${commentId}`,
      method: "DELETE",
      data: { force: true },
    })
      .then(() => fetchComments())
      .catch((err) => {
        console.error("Error deleting comment:", err);
        alert(`Failed to delete comment: ${err.message || "Unknown error"}`);
      });
  };

  return (
    <>
      <h3>Comments</h3>
      <div id="alpaca-comments" className="alpaca-grid">
        {/* New comment input */}
        <div className="alpaca-row">
          <div className="alpaca-meta">
            <AlpacaUser />
          </div>
          <div className="alpaca-comment">
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
              {isSubmitting ? "Submitting..." : "Submit Comment"}
            </Button>
          </div>
        </div>

        {isLoadingComments && <Spinner />}
        {error && <p className="alpaca-error">{error}</p>}
        {!isLoadingComments && !error && comments.length === 0 && (
          <p>No comments yet.</p>
        )}

        {/* Existing comments */}
        {!isLoadingComments &&
          comments.map((comment) => (
            <div className="alpaca-row" key={comment.id}>
              <div className="alpaca-meta">
                <AlpacaUser userId={comment.author} />
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
                        __html: comment.content.rendered,
                      }}
                    />
                    <small className="alpaca-comment-date">
                      {new Date(comment.date).toLocaleString()}
                    </small>
                    <div>
                      <button onClick={() => startEditing(comment)}>
                        Edit
                      </button>{" "}
                      <button onClick={() => deleteComment(comment.id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default AlpacaCommenting;
