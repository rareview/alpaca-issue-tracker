import { getUser } from "../hooks/useUser";
import { fetchIssueCommentCount } from "../services/issueApi";
const { useState, useEffect, useRef, useCallback } = wp.element;
import User from "./User";
const { TextareaControl, Button, Spinner, Modal } = wp.components;

import { marked } from "marked";

const Commenting = ({ issueId, commentRefreshKey }) => {
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
    getUser().then((user) => {
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
      })
      .catch((err) => {
        console.error("Error fetching comments:", err);
        setError("Could not load comments.");
      })
      .finally(() => setIsLoadingComments(false));
  }, [issueId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments, commentRefreshKey]);

  useEffect(() => {
    const handleCommentCountChanged = (data) => {
      const { issueId: eventIssueId } = data;
      if (eventIssueId.toString() === issueId.toString()) {
        fetchComments();
      }
    };

    wp.hooks.addAction(
      "alpaca.commentCountChanged",
      "alpaca/commenting",
      handleCommentCountChanged
    );

    return () => {
      wp.hooks.removeAction("alpaca.commentCountChanged", "alpaca/commenting");
    };
  }, [issueId, fetchComments]);

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
        status: "approve",
      },
    })
      .then((newlyCreatedComment) => {
        setNewComment("");
        fetchComments();

        wp.hooks.doAction("alpaca.commentPosted", newlyCreatedComment); // New doAction

        // Dispatch event to update comment count
        const postId = newlyCreatedComment.post;
        fetchIssueCommentCount(postId)
          .then((response) => {
            if (response && typeof response.comment_count !== "undefined") {
              wp.hooks.doAction("alpaca.commentCountChanged", {
                issueId: postId.toString(),
                newCount: response.comment_count,
              });
            }
          })
          .catch((err) => {
            console.error(
              "Error fetching updated comment count after adding:",
              err
            );
          });
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
      .then((updatedComment) => {
        // Add updatedComment parameter
        setEditingCommentId(null);
        setEditingContent("");
        fetchComments();

        wp.hooks.doAction("alpaca.commentUpdated", updatedComment); // New doAction
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
      .then((deletedComment) => {
        fetchComments();
        setDeleteCommentId(null);

        wp.hooks.doAction("alpaca.commentDeleted", deletedComment); // New doAction

        // Dispatch event to update comment count
        // The deletedComment object contains the post ID
        const postId = deletedComment.previous.post;
        fetchIssueCommentCount(postId)
          .then((response) => {
            if (response && typeof response.comment_count !== "undefined") {
              wp.hooks.doAction("alpaca.commentCountChanged", {
                issueId: postId.toString(),
                newCount: response.comment_count,
              });
            }
          })
          .catch((err) => {
            console.error("Error fetching updated comment count:", err);
          });
      })
      .catch((err) => {
        console.error(err);
        alert(`Failed to delete comment: ${err.message || "Unknown error"}`);
      });
  };

  return (
    <>
      <div id="alpaca-comments" className="alpaca-comments-timeline">
        <div className="alpaca-timeline-item">
          <div className="alpaca-timeline-marker">
            <User user={currentUser} />
          </div>

          <div className="alpaca-comment-form">
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

        {!isLoadingComments &&
          comments.map((comment) => (
            <div className="alpaca-timeline-item" key={comment.id}>
              <div className="alpaca-timeline-marker">
                <User
                  user={{
                    ...comment.author_meta,
                    name: comment.author_name,
                    avatar: comment.author_avatar_urls[96],
                  }}
                />
              </div>
              <div className="alpaca-timeline-content">
                <div className="alpaca-comment-header">
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
                          __html: comment.content.raw
                            ? marked(comment.content.raw)
                            : comment.content.rendered,
                        }}
                      />
                    </>
                  )}
                </div>
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
