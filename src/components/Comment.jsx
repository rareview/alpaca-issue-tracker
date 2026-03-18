import PropTypes from 'prop-types';
import { getUser } from '../hooks/useUser';
import { fetchIssueCommentCount } from '../services/issueApi';
import useAutoExpandTextarea from '../hooks/useAutoExpandTextarea';
import TimelineEntry, { injectAvatarStyles } from './comment/TimelineEntry';

const { useState, useEffect, useRef, useCallback, memo } = wp.element;
const { __, _n, sprintf } = wp.i18n;
const {
  TextareaControl,
  Button,
  Modal,
  Dropdown,
  MenuGroup,
  MenuItem,
  Tooltip,
  FormFileUpload,
  DropZone,
} = wp.components;
import { getCookie, setCookie } from '../utils/cookies';
import { marked } from 'marked';
import Lightbox from './issue/Lightbox';
import { Attachment } from './issue/AttachmentRow';
import { uploadIssueAttachment } from '../utils/attachmentUpload';

const deleteCommentAttachment = async (url, issueId) => {
  if (!url || !issueId) {
    return;
  }

  const response = await wp.apiFetch({
    path: '/alpaca/v1/comment-attachments/delete',
    method: 'POST',
    data: {
      issue_id: issueId,
      url,
    },
  });

  if (!response || response.success === false) {
    throw new Error(
      response?.message || __('Failed to delete attachment.', 'alpaca'),
    );
  }
};

const AttachmentControls = ({
  children,
  attachments,
  onDrop,
  onUpload,
  onRemove,
  onClick,
  isSubmitting,
  isProcessing,
  actions,
  pendingAltText,
}) => (
  <>
    <div className="alpaca-comment-dropzone">
      {children}
      <DropZone onFilesDrop={onDrop} />
    </div>
    {attachments.length > 0 && (
      <div className="alpaca-attachments-wrapper alpaca-comment-attachments alpaca-comment-attachments--pending">
        {attachments.map((attachment) => (
          <Attachment
            key={attachment.id}
            attachment={attachment}
            onAttachmentClick={onClick}
            onAttachmentDelete={() => onRemove(attachment.id)}
            isLoading={isSubmitting || isProcessing}
            showDelete
            altText={pendingAltText}
          />
        ))}
      </div>
    )}
    <div className="alpaca-comment-form-actions">
      <FormFileUpload
        icon="paperclip"
        multiple
        onChange={onUpload}
        disabled={isSubmitting || isProcessing}
      >
        {isProcessing
          ? __('Uploading…', 'alpaca')
          : __('Attach Files', 'alpaca')}
      </FormFileUpload>
      {actions}
    </div>
  </>
);

AttachmentControls.propTypes = {
  children: PropTypes.node.isRequired,
  attachments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      name: PropTypes.string,
      mime: PropTypes.string,
    }),
  ).isRequired,
  onDrop: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  isProcessing: PropTypes.bool.isRequired,
  actions: PropTypes.node.isRequired,
  pendingAltText: PropTypes.string.isRequired,
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
 * @param {Function} props.cancelEditing            - Cancel editing function
 * @param {boolean}  props.isSubmitting             - Is submitting flag
 * @param {Function} props.onAttachmentClick        - Attachment click handler
 * @param {Array}    props.editingAttachments       - Editing attachments
 * @param {Function} props.onEditAttachFiles        - Handle edit attachment upload
 * @param {Function} props.onEditAttachDrop         - Handle edit attachment drop
 * @param {Function} props.onEditAttachRemove       - Handle edit attachment removal
 * @param {boolean}  props.isProcessingAttachments  - Attachment processing flag
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
    onAttachmentClick,
    editingAttachments,
    onEditAttachFiles,
    onEditAttachDrop,
    onEditAttachRemove,
    isProcessingAttachments,
  }) => {
    return (
      <TimelineEntry
        comment={comment}
        currentUser={currentUser}
        onAttachmentClick={onAttachmentClick}
        isEditing={editingCommentId === comment.id}
        isSubmitting={isSubmitting}
        headerActions={
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
                <MenuItem
                  icon="edit"
                  onClick={() => {
                    startEditing(comment);
                    onClose();
                  }}
                >
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
        }
        editBody={
          <AttachmentControls
            attachments={editingAttachments}
            onDrop={onEditAttachDrop}
            onUpload={onEditAttachFiles}
            onRemove={onEditAttachRemove}
            onClick={onAttachmentClick}
            isSubmitting={isSubmitting}
            isProcessing={isProcessingAttachments}
            pendingAltText={__('Pending comment attachment', 'alpaca')}
            actions={
              <>
                <Button onClick={cancelEditing} disabled={isSubmitting}>
                  {__('Cancel', 'alpaca')}
                </Button>
                <Button
                  isPrimary
                  onClick={() => saveEdit(comment.id)}
                  disabled={isSubmitting || isProcessingAttachments}
                >
                  {__('Save', 'alpaca')}
                </Button>
              </>
            }
          >
            <TextareaControl
              value={editingContent}
              onChange={setEditingContent}
              ref={editingRef}
            />
          </AttachmentControls>
        }
      />
    );
  },
  (prev, next) =>
    prev.comment.id === next.comment.id &&
    prev.editingCommentId === next.editingCommentId &&
    prev.editingContent === next.editingContent &&
    prev.isSubmitting === next.isSubmitting &&
    prev.isProcessingAttachments === next.isProcessingAttachments &&
    prev.editingAttachments === next.editingAttachments,
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
  onAttachmentClick: PropTypes.func.isRequired,
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

// --- Commenting Component ---
const Commenting = ({ issueId, commentRefreshKey, showNotification }) => {
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingAttachments, setIsProcessingAttachments] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [editingAttachments, setEditingAttachments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const editingRef = useRef(null);
  const newCommentRef = useRef(null);
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
      path: `/wp/v2/comments?post=${issueId}&_embed=author&per_page=-1&orderby=date&order=desc&comment_type=issuecomment&show_hidden_comments=1&context=edit`,
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

  const handleCommentSubmit = useCallback(() => {
    if (!newComment.trim()) {
      showNotification(
        __('Please add a comment before submitting.', 'alpaca'),
        'error',
      );
      return;
    }
    setIsSubmitting(true);

    const processedOptimisticContent = injectAvatarStyles(marked(newComment));
    const attachmentUrls = pendingAttachments.map(
      (attachment) => attachment.url,
    );

    const optimisticComment = {
      id: Date.now(),
      content: { raw: newComment, rendered: processedOptimisticContent },
      _embedded: { author: currentUser },
      date: new Date().toISOString(),
      author_user_agent: 'human',
      meta: {
        alpacaCommentAttachments: attachmentUrls,
      },
    };
    setComments((prev) => [optimisticComment, ...prev]);

    wp.apiFetch({
      path: `/wp/v2/comments`,
      method: 'POST',
      data: {
        content: newComment,
        post: issueId,
        comment_type: 'issuecomment',
        author_user_agent: 'human',
        meta: {
          alpacaCommentAttachments: attachmentUrls,
        },
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
                  alpacaCommentAttachments: attachmentUrls,
                },
              };

        setComments((prev) =>
          prev.map((c) => (c.id === optimisticComment.id ? createdComment : c)),
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
        setPendingAttachments([]);
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
  }, [newComment, currentUser, issueId, showNotification, pendingAttachments]);

  const startEditing = useCallback((comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content.raw || comment.content.rendered || '');
    const existingAttachments = comment.meta?.alpacaCommentAttachments || [];
    const formattedAttachments = existingAttachments.map((url, index) => ({
      id: `${comment.id}-${index}`,
      url,
    }));
    setEditingAttachments(formattedAttachments);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent('');
    setEditingAttachments([]);
  }, []);

  const saveEdit = useCallback(
    (commentId) => {
      if (!editingContent.trim()) return;
      setIsSubmitting(true);

      const comment = comments.find((c) => c.id === commentId);
      const agent = comment?.author_user_agent || 'human';
      const attachmentUrls = editingAttachments.map(
        (attachment) => attachment.url,
      );

      wp.apiFetch({
        path: `/wp/v2/comments/${commentId}`,
        method: 'POST',
        data: {
          content: editingContent,
          author_user_agent: agent,
          meta: {
            alpacaCommentAttachments: attachmentUrls,
          },
        },
      })
        .then((updated) => {
          const updatedComment =
            updated && updated.meta
              ? updated
              : {
                  ...updated,
                  meta: {
                    ...(updated && updated.meta ? updated.meta : {}),
                    alpacaCommentAttachments: attachmentUrls,
                  },
                };

          setComments((prev) =>
            prev.map((c) => (c.id === commentId ? updatedComment : c)),
          );
          setEditingCommentId(null);
          setEditingContent('');
          setEditingAttachments([]);
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
    [editingContent, comments, showNotification, editingAttachments],
  );

  const confirmDeleteComment = useCallback(
    (commentId) => setDeleteCommentId(commentId),
    [],
  );
  const cancelDelete = useCallback(() => setDeleteCommentId(null), []);
  const deleteComment = useCallback(() => {
    if (!deleteCommentId) return;
    const comment = comments.find((item) => item.id === deleteCommentId);
    const attachmentUrls = comment?.meta?.alpacaCommentAttachments || [];

    const deleteAttachments = attachmentUrls.length
      ? Promise.allSettled(
          attachmentUrls.map((url) => deleteCommentAttachment(url, issueId)),
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

  const handleAttachmentFiles = useCallback(
    async (files, onSuccess) => {
      if (!files || files.length === 0 || !issueId) return;

      const incomingFiles = Array.from(files);
      setIsProcessingAttachments(true);

      try {
        const results = await Promise.allSettled(
          incomingFiles.map((file) => uploadIssueAttachment(file, issueId)),
        );

        const uploaded = results
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value);
        const failedCount = results.filter(
          (result) => result.status === 'rejected',
        ).length;

        if (failedCount > 0) {
          showNotification(
            __('Failed to upload one or more attachments.', 'alpaca'),
            'error',
          );
        }

        if (uploaded.length > 0 && typeof onSuccess === 'function') {
          onSuccess(uploaded);
        }
      } catch (error) {
        console.error('Failed to upload attachments', error);
        showNotification(
          __('Failed to upload one or more attachments.', 'alpaca'),
          'error',
        );
      } finally {
        setIsProcessingAttachments(false);
      }
    },
    [showNotification, issueId],
  );

  const handleAttachmentUpload = useCallback(
    (event) => {
      handleAttachmentFiles(event.target.files, (processed) => {
        setPendingAttachments((prev) => [...prev, ...processed]);
      });
      event.target.value = null;
    },
    [handleAttachmentFiles],
  );

  const handleEditAttachmentUpload = useCallback(
    (event) => {
      handleAttachmentFiles(event.target.files, (processed) => {
        setEditingAttachments((prev) => [...prev, ...processed]);
      });
      event.target.value = null;
    },
    [handleAttachmentFiles],
  );

  const handleEditAttachmentDrop = useCallback(
    (files) => {
      handleAttachmentFiles(files, (processed) => {
        setEditingAttachments((prev) => [...prev, ...processed]);
      });
    },
    [handleAttachmentFiles],
  );

  const handlePendingAttachmentDrop = useCallback(
    (files) => {
      handleAttachmentFiles(files, (processed) => {
        setPendingAttachments((prev) => [...prev, ...processed]);
      });
    },
    [handleAttachmentFiles],
  );

  const removePendingAttachment = useCallback(
    async (attachmentId) => {
      const attachment = pendingAttachments.find(
        (item) => item.id === attachmentId,
      );

      if (attachment?.url) {
        try {
          await deleteCommentAttachment(attachment.url, issueId);
        } catch (error) {
          console.error('Failed to delete attachment', error);
          showNotification(
            __('Failed to delete attachment.', 'alpaca'),
            'error',
          );
          return;
        }
      }

      setPendingAttachments((prev) =>
        prev.filter((item) => item.id !== attachmentId),
      );
    },
    [pendingAttachments, issueId, showNotification],
  );

  const removeEditingAttachment = useCallback(
    async (attachmentId) => {
      const attachment = editingAttachments.find(
        (item) => item.id === attachmentId,
      );

      if (attachment?.url) {
        try {
          await deleteCommentAttachment(attachment.url, issueId);
        } catch (error) {
          console.error('Failed to delete attachment', error);
          showNotification(
            __('Failed to delete attachment.', 'alpaca'),
            'error',
          );
          return;
        }
      }

      setEditingAttachments((prev) =>
        prev.filter((item) => item.id !== attachmentId),
      );
    },
    [editingAttachments, issueId, showNotification],
  );

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
        <div className="alpaca-comment-form" data-source="human">
          <div className="alpaca-timeline-content">
            <AttachmentControls
              attachments={pendingAttachments}
              onDrop={handlePendingAttachmentDrop}
              onUpload={handleAttachmentUpload}
              onRemove={removePendingAttachment}
              onClick={setLightboxSrc}
              isSubmitting={isSubmitting}
              isProcessing={isProcessingAttachments}
              pendingAltText={__('Pending comment attachment', 'alpaca')}
              actions={
                <Button
                  isPrimary
                  onClick={handleCommentSubmit}
                  disabled={isSubmitting || isProcessingAttachments}
                >
                  {isSubmitting
                    ? __('Submitting…', 'alpaca')
                    : __('Submit Comment', 'alpaca')}
                </Button>
              }
            >
              <TextareaControl
                placeholder={__('Add a comment…', 'alpaca')}
                value={newComment}
                onChange={setNewComment}
                ref={newCommentRef}
                disabled={isSubmitting}
              />
            </AttachmentControls>
          </div>
        </div>

        {isLoadingComments && (
          <p className="alpaca-loading">{__('Loading comments…', 'alpaca')}</p>
        )}

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
              onAttachmentClick={setLightboxSrc}
              editingAttachments={
                editingCommentId === comment.id ? editingAttachments : []
              }
              onEditAttachFiles={
                editingCommentId === comment.id
                  ? handleEditAttachmentUpload
                  : () => {}
              }
              onEditAttachDrop={
                editingCommentId === comment.id
                  ? handleEditAttachmentDrop
                  : () => {}
              }
              onEditAttachRemove={
                editingCommentId === comment.id
                  ? removeEditingAttachment
                  : () => {}
              }
              isProcessingAttachments={isProcessingAttachments}
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
  commentRefreshKey: PropTypes.number.isRequired,
  showNotification: PropTypes.func.isRequired,
};

export default memo(Commenting);
