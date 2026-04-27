import PropTypes from 'prop-types';
import { getUser } from '../hooks/useUser';
import { fetchIssueCommentCount } from '../services/issueApi';
import useAutoExpandTextarea from '../hooks/useAutoExpandTextarea';
import TimelineEntry, { injectAvatarStyles } from './comment/TimelineEntry';

const { useState, useEffect, useRef, useCallback, memo } = wp.element;
const { __, _n, sprintf } = wp.i18n;
const { Button, Modal, Dropdown, MenuGroup, MenuItem, Tooltip } = wp.components;
import { getCookie, setCookie } from '../utils/cookies';
import { marked } from 'marked';
import { sanitizeHtml } from '../utils/sanitize';
import Lightbox from './issue/Lightbox';
import CommentForm from './CommentForm';

const deleteCommentAttachment = async (url, issueId, commentId = null) => {
  if (!url || !issueId) {
    return;
  }

  const requestDataEntries = [
    ['issue_id', issueId],
    ['url', url],
  ];

  if (Number(commentId) > 0) {
    requestDataEntries.push(['comment_id', Number(commentId)]);
  }

  const requestData = Object.fromEntries(requestDataEntries);

  const response = await wp.apiFetch({
    path: '/alpaca/v1/comment-attachments/delete',
    method: 'POST',
    data: requestData,
  });

  if (!response || response.success === false) {
    throw new Error(
      response?.message || __('Failed to delete attachment.', 'alpaca'),
    );
  }
};

/*
 * Comment component for displaying individual comments.
 *
 * @param {Object}   props                          - Props object
 * @param {Object}   props.comment                  - Comment data
 * @param {Function} props.startEditing             - Start editing function
 * @param {Function} props.confirmDeleteComment     - Confirm delete function
 * @param {number}   props.editingCommentId         - Current editing comment ID
 * @param {string}   props.editingContent           - Editing content
 * @param {Function} props.setEditingContent        - Set editing content function
 * @param {Object}   props.editingRef               - Ref for editing textarea
 * @param {Function} props.saveEdit                 - Save edit function
 * @param {boolean}  props.isSubmitting             - Is submitting flag
 * @param {Function} props.onAttachmentClick        - Attachment click handler
 * @return {JSX.Element} Comment component
 */

// --- Single Comment ---
const Comment = memo(
  ({
    comment,
    activeSearchQuery,
    startEditing,
    confirmDeleteComment,
    editingCommentId,
    editingContent,
    setEditingContent,
    editingRef,
    saveEdit,
    isSubmitting,
    currentUser,
    userCanManageOptions,
    onAttachmentClick,
    onAttachmentDelete,
  }) => {
    const commentAgentType = (
      comment?.author_user_agent ||
      comment?.comment_agent ||
      ''
    )
      .toString()
      .trim()
      .toLowerCase();
    const defaultIsEditable = ['human'];
    const isDefaultEditable = defaultIsEditable.includes(commentAgentType);

    // Allow extensions to override which issue comments are editable.
    const isEditable = Boolean(
      wp.hooks.applyFilters(
        'alpaca.isIssueCommentEditable',
        isDefaultEditable,
        comment,
        defaultIsEditable,
      ),
    );

    const currentUserId = Number(currentUser?.id || 0);
    const commentAuthorId = Number(comment?.author || 0);
    const isCommentAuthor =
      currentUserId > 0 &&
      commentAuthorId > 0 &&
      currentUserId === commentAuthorId;
    const lastEditedByUserId = Number(
      comment?.meta?.alpacaCommentLastEdit?.userId || 0,
    );
    const isLockedByDifferentEditor =
      isCommentAuthor &&
      lastEditedByUserId > 0 &&
      currentUserId > 0 &&
      lastEditedByUserId !== currentUserId;
    const canEditComment =
      isEditable &&
      (userCanManageOptions || (isCommentAuthor && !isLockedByDifferentEditor));
    const canDeleteComment = userCanManageOptions;
    const canManageComment = canEditComment || canDeleteComment;

    return (
      <TimelineEntry
        comment={comment}
        highlightQuery={activeSearchQuery}
        currentUser={currentUser}
        onAttachmentClick={onAttachmentClick}
        onAttachmentDelete={(attachmentUrl) =>
          onAttachmentDelete(comment.id, attachmentUrl)
        }
        showAttachmentDelete={canManageComment}
        isEditing={editingCommentId === comment.id}
        isSubmitting={isSubmitting}
        headerActions={
          canManageComment ? (
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
              renderContent={({ onClose }) => (
                <MenuGroup>
                  {canEditComment && (
                    <MenuItem
                      icon="edit"
                      onClick={() => {
                        startEditing(comment);
                        onClose();
                      }}
                    >
                      {__('Edit', 'alpaca')}
                    </MenuItem>
                  )}
                  {canDeleteComment && (
                    <MenuItem
                      icon="trash"
                      isDestructive
                      onClick={() => confirmDeleteComment(comment.id)}
                    >
                      {__('Delete', 'alpaca')}
                    </MenuItem>
                  )}
                </MenuGroup>
              )}
            />
          ) : null
        }
        editBody={
          <CommentForm
            value={editingContent}
            onChange={setEditingContent}
            placeholder={__('Edit comment…', 'alpaca')}
            textareaRef={editingRef}
            disabled={isSubmitting}
            isSubmitting={isSubmitting}
            issueId={comment.post}
            showNotification={() => {}}
            onSubmit={(text) => {
              setEditingContent(text);
              saveEdit(comment.id);
            }}
            submitButtonText={__('Save', 'alpaca')}
          />
        }
      />
    );
  },
  (prev, next) =>
    prev.comment === next.comment &&
    prev.activeSearchQuery === next.activeSearchQuery &&
    prev.editingCommentId === next.editingCommentId &&
    prev.editingContent === next.editingContent &&
    prev.isSubmitting === next.isSubmitting &&
    prev.isProcessingAttachments === next.isProcessingAttachments &&
    prev.editingAttachments === next.editingAttachments &&
    prev.currentUser?.id === next.currentUser?.id &&
    prev.userCanManageOptions === next.userCanManageOptions,
);

Comment.propTypes = {
  comment: PropTypes.object.isRequired,
  activeSearchQuery: PropTypes.string,
  startEditing: PropTypes.func.isRequired,
  confirmDeleteComment: PropTypes.func.isRequired,
  editingCommentId: PropTypes.number,
  editingContent: PropTypes.string,
  setEditingContent: PropTypes.func.isRequired,
  editingRef: PropTypes.object,
  saveEdit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  currentUser: PropTypes.object,
  userCanManageOptions: PropTypes.bool.isRequired,
  onAttachmentClick: PropTypes.func.isRequired,
  onAttachmentDelete: PropTypes.func,
  editingAttachments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      name: PropTypes.string,
      mime: PropTypes.string,
    }),
  ).isRequired,
  onEditAttachFiles: PropTypes.func.isRequired,
  onEditAttachDrop: PropTypes.func.isRequired,
  onEditAttachRemove: PropTypes.func.isRequired,
  isProcessingAttachments: PropTypes.bool.isRequired,
};

Comment.defaultProps = {
  onAttachmentDelete: () => {},
};

// --- Commenting Component ---
const Commenting = ({
  issueId,
  activeSearchQuery,
  commentRefreshKey,
  showNotification,
}) => {
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const editingRef = useRef(null);
  const newCommentRef = useRef(null);
  const localizedCanManageOptions =
    typeof window !== 'undefined'
      ? window.alpacaSettings?.canManageOptions
      : false;
  const userCanManageOptions = Boolean(
    localizedCanManageOptions === true ||
      localizedCanManageOptions === 1 ||
      localizedCanManageOptions === '1' ||
      currentUser?.capabilities?.manage_options === true,
  );
  const [sortOrder, setSortOrder] = useState(
    getCookie('comment_sort_order') || 'desc',
  );

  useEffect(() => {
    getUser().then(setCurrentUser);
  }, []);

  useEffect(() => {
    if (!editingCommentId) {
      return;
    }

    if (editingRef.current && typeof editingRef.current.focus === 'function') {
      editingRef.current.focus();
    }
  }, [editingCommentId]);

  useAutoExpandTextarea(editingRef, editingContent, !!editingCommentId);

  useAutoExpandTextarea(newCommentRef, newComment);

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

    wp.apiFetch({
      path: `/wp/v2/comments?post=${issueId}&_embed=author&per_page=-1&orderby=date&order=desc&comment_type=issuecomment&alpaca_include_hidden_comments=1&context=edit`,
    })
      .then(setComments)
      .catch((err) => {
        console.error(err);
        showNotification(__('Could not load comments.', 'alpaca'), 'error');
      })
      .finally(() => setIsLoadingComments(false));
  }, [issueId, showNotification]);

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

  const handleCommentSubmit = useCallback(
    async (commentText, attachments) => {
      if (!commentText.trim()) {
        showNotification(
          __('Please add a comment before submitting.', 'alpaca'),
          'error',
        );
        return;
      }
      setIsSubmitting(true);

      const processedOptimisticContent = injectAvatarStyles(
        sanitizeHtml(marked(commentText)),
      );
      const attachmentUrls = attachments.map((attachment) => attachment.url);
      const hasAttachmentUrls = attachmentUrls.length > 0;

      const optimisticMeta = hasAttachmentUrls
        ? {
            alpacaCommentAttachments: attachmentUrls,
          }
        : {};

      const createMeta = hasAttachmentUrls
        ? {
            alpacaCommentAttachments: attachmentUrls,
          }
        : {};

      const optimisticComment = {
        id: Date.now(),
        content: { raw: commentText, rendered: processedOptimisticContent },
        _embedded: { author: currentUser },
        date: new Date().toISOString(),
        author_user_agent: 'human',
        meta: optimisticMeta,
      };
      setComments((prev) => [optimisticComment, ...prev]);

      wp.apiFetch({
        path: `/wp/v2/comments`,
        method: 'POST',
        data: {
          content: commentText,
          post: issueId,
          comment_type: 'issuecomment',
          author_user_agent: 'human',
          meta: createMeta,
        },
      })
        .then((created) => {
          const createdComment =
            created && created.meta
              ? created
              : {
                  ...created,
                  meta: {
                    ...(created && created.meta ? created.meta : {}),
                    ...createMeta,
                  },
                };

          setComments((prev) =>
            prev.map((c) =>
              c.id === optimisticComment.id ? createdComment : c,
            ),
          );
          wp.hooks.doAction(
            'alpaca.commentPosted',
            wp.hooks.applyFilters('alpaca.commentObject', createdComment),
          );

          fetchIssueCommentCount(issueId).then((response) => {
            if (response?.comment_count !== undefined) {
              wp.hooks.doAction('alpaca.commentCountChanged', {
                issueId: issueId.toString(),
                newCount: response.comment_count,
                newCountByAgent: response.comment_count_by_agent || null,
              });
              wp.hooks.doAction('alpaca.lastActivityChanged', {
                issueId: issueId.toString(),
                lastActivity:
                  typeof response.last_activity !== 'undefined'
                    ? response.last_activity
                    : new Date().toISOString(),
              });
            }
          });
          setNewComment('');
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
    },
    [currentUser, issueId, showNotification],
  );

  const startEditing = useCallback((comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content.raw || comment.content.rendered || '');
  }, []);

  const saveEdit = useCallback(
    (commentId) => {
      if (!editingContent.trim()) return;
      setIsSubmitting(true);

      const comment = comments.find((c) => c.id === commentId);
      const agent = comment?.author_user_agent || 'human';
      const currentTimestamp = new Date().toISOString();
      const lastEditedMeta = {
        date: currentTimestamp,
        userId: Number(currentUser?.id) || 0,
        userName:
          currentUser?.display_name ||
          currentUser?.name ||
          __('Unknown', 'alpaca'),
      };

      wp.apiFetch({
        path: `/wp/v2/comments/${commentId}`,
        method: 'POST',
        data: {
          content: editingContent,
          author_user_agent: agent,
          meta: {
            alpacaCommentLastEdit: lastEditedMeta,
          },
        },
      })
        .then((updated) => {
          const updatedComment = {
            ...(updated || {}),
            meta: {
              ...(updated && updated.meta ? updated.meta : {}),
              alpacaCommentLastEdit: lastEditedMeta,
            },
          };

          setComments((prev) =>
            prev.map((c) => (c.id === commentId ? updatedComment : c)),
          );
          setEditingCommentId(null);
          setEditingContent('');

          wp.hooks.doAction('alpaca.commentUpdated', updatedComment);
        })
        .catch((err) => {
          console.error(err);
          showNotification(
            `${__('Failed to update comment:', 'alpaca')} ${err.message || __('Unknown error', 'alpaca')}`,
          );
        })
        .finally(() => setIsSubmitting(false));
    },
    [editingContent, comments, showNotification, currentUser],
  );

  const confirmDeleteComment = useCallback(
    (commentId) => setDeleteCommentId(commentId),
    [],
  );
  const cancelDelete = useCallback(() => setDeleteCommentId(null), []);

  const deleteSingleCommentAttachment = useCallback(
    (commentId, attachmentUrl) => {
      if (!commentId || !attachmentUrl) {
        return;
      }

      setIsSubmitting(true);

      deleteCommentAttachment(attachmentUrl, issueId, commentId)
        .then(() => {
          setComments((previousComments) =>
            previousComments.map((commentItem) => {
              if (commentItem.id !== commentId) {
                return commentItem;
              }

              const attachments = Array.isArray(
                commentItem?.meta?.alpacaCommentAttachments,
              )
                ? commentItem.meta.alpacaCommentAttachments
                : [];

              return {
                ...commentItem,
                meta: {
                  ...(commentItem.meta || {}),
                  alpacaCommentAttachments: attachments.filter(
                    (url) => url !== attachmentUrl,
                  ),
                },
              };
            }),
          );
        })
        .catch((error) => {
          console.error('Failed to delete attachment', error);
          showNotification(
            __('Failed to delete attachment.', 'alpaca'),
            'error',
          );
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
    [issueId, showNotification],
  );

  const deleteComment = useCallback(() => {
    if (!deleteCommentId) return;
    const comment = comments.find((item) => item.id === deleteCommentId);
    const attachmentUrls = comment?.meta?.alpacaCommentAttachments || [];

    const deleteAttachments = attachmentUrls.length
      ? Promise.allSettled(
          attachmentUrls.map((url) =>
            deleteCommentAttachment(url, issueId, deleteCommentId),
          ),
        )
      : Promise.resolve([]);

    deleteAttachments
      .catch((error) => {
        console.error('Failed to delete comment attachments', error);
      })
      .finally(() => {
        wp.apiFetch({
          path: `/wp/v2/comments/${deleteCommentId}?force=true`,
          method: 'DELETE',
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
                    newCountByAgent: response.comment_count_by_agent || null,
                  });

                  if (typeof response.last_activity !== 'undefined') {
                    wp.hooks.doAction('alpaca.lastActivityChanged', {
                      issueId: postId.toString(),
                      lastActivity: response.last_activity,
                    });
                  }
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
      });
  }, [deleteCommentId, comments, issueId, showNotification]);

  const handleLightboxClose = useCallback(() => setLightboxSrc(null), []);

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
        <CommentForm
          value={newComment}
          onChange={setNewComment}
          placeholder={__('Add a comment…', 'alpaca')}
          textareaRef={newCommentRef}
          disabled={isSubmitting}
          isSubmitting={isSubmitting}
          issueId={issueId}
          showNotification={showNotification}
          onSubmit={handleCommentSubmit}
          submitButtonText={__('Submit Comment', 'alpaca')}
        />

        {isLoadingComments && (
          <p className="alpaca-loading">{__('Loading comments…', 'alpaca')}</p>
        )}

        <div className="alpaca-comments-timeline">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              activeSearchQuery={activeSearchQuery}
              startEditing={startEditing}
              confirmDeleteComment={confirmDeleteComment}
              editingCommentId={editingCommentId}
              editingContent={editingContent}
              setEditingContent={setEditingContent}
              editingRef={editingRef}
              saveEdit={saveEdit}
              isSubmitting={isSubmitting}
              currentUser={currentUser}
              userCanManageOptions={userCanManageOptions}
              onAttachmentClick={setLightboxSrc}
              onAttachmentDelete={deleteSingleCommentAttachment}
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
              {(() => {
                const commentToDelete = comments.find(
                  (item) => item.id === deleteCommentId,
                );
                const attachmentCount =
                  commentToDelete?.meta?.alpacaCommentAttachments?.length || 0;
                let attachmentText = '';

                if (attachmentCount === 1) {
                  attachmentText = __(' and its attachment', 'alpaca');
                } else if (attachmentCount > 1) {
                  attachmentText = __(' and its attachments', 'alpaca');
                }

                const commentCount = 1;

                return sprintf(
                  /* translators: %1$s: attachment text suffix for comment deletion confirmation. */
                  _n(
                    'Are you sure you want to delete this comment%1$s?',
                    'Are you sure you want to delete these comments%1$s?',
                    commentCount,
                    'alpaca',
                  ),
                  attachmentText,
                );
              })()}
            </p>
            <Button isPrimary onClick={deleteComment}>
              {__('Delete', 'alpaca')}
            </Button>
            <Button onClick={cancelDelete}>{__('Cancel', 'alpaca')}</Button>
          </Modal>
        )}
      </div>

      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={handleLightboxClose} />
      )}
    </div>
  );
};

Commenting.propTypes = {
  issueId: PropTypes.number.isRequired,
  activeSearchQuery: PropTypes.string,
  commentRefreshKey: PropTypes.number.isRequired,
  showNotification: PropTypes.func.isRequired,
};

Commenting.defaultProps = {
  activeSearchQuery: '',
};

export default memo(Commenting);
