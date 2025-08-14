import AlpacaUser from "./user";
const { useState, useEffect, useCallback } = wp.element;
const { TextareaControl, Button, Spinner } = wp.components;

const AlpacaCommenting = ({ issueId }) => {
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(() => {
    if (!issueId) return;

    setIsLoadingComments(true);
    setError(null);

    wp.apiFetch({
      path: `/wp/v2/comments?post=${issueId}&orderby=date&order=asc&comment_type=issuecomment&show_hidden_comments=1`,
    })
      .then((fetchedComments) => {
        setComments(fetchedComments);
      })
      .catch((err) => {
        console.error("Error fetching comments:", err);
        setError("Could not load comments.");
      })
      .finally(() => {
        setIsLoadingComments(false);
      });
  }, [issueId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentSubmit = () => {
    if (!newComment.trim()) {
      return;
    }

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
        fetchComments(); // Refetch comments
      })
      .catch((err) => {
        console.error("Error submitting comment:", err);
        const errorMessage = err.message || "An unknown error occurred.";
        alert(`Failed to submit comment: ${errorMessage}`);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <h3>Comments</h3>
      <div id="alpaca-comments" className="alpaca-grid">
        <div className="alpaca-row">
          <div className="alpaca-meta">
            <AlpacaUser />
          </div>
          <div className="alpaca-comment">
            <TextareaControl
              placeholder="Add a comment..."
              id="alpaca-comment-textarea"
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

        {!isLoadingComments &&
          comments.map((comment) => (
            <div className="alpaca-row" key={comment.id}>
              <div className="alpaca-meta">
                <AlpacaUser userId={comment.author} />
              </div>
              <div className="alpaca-comment">
                <div
                  dangerouslySetInnerHTML={{ __html: comment.content.rendered }}
                />
                <small className="alpaca-comment-date">
                  {new Date(comment.date).toLocaleString()}
                </small>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default AlpacaCommenting;
