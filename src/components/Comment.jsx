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
  FormFileUpload,
  DropZone,
} = wp.components;
import { getCookie, setCookie } from '../utils/cookies';
import { marked } from 'marked';
import Lightbox from './issue/Lightbox';
import { Attachment } from './issue/AttachmentRow';

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

const ATTACHMENT_MIME_PREFIX = 'image/';
const ATTACHMENT_OUTPUT_MIME = 'image/webp';
const ATTACHMENT_OUTPUT_QUALITY = 0.7;

const fileToWebpDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith(ATTACHMENT_MIME_PREFIX)) {
      reject(new Error('Invalid file type.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Failed to load image.'));
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Failed to render image.'));
          return;
        }

        context.drawImage(image, 0, 0);
        let dataUrl = '';

        try {
          dataUrl = canvas.toDataURL(
            ATTACHMENT_OUTPUT_MIME,
            ATTACHMENT_OUTPUT_QUALITY,
          );
        } catch (error) {
          dataUrl = '';
        }

        if (dataUrl) {
          resolve(dataUrl);
          return;
        }

        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }

        reject(new Error('Failed to process image.'));
      };

      if (typeof reader.result === 'string') {
        image.src = reader.result;
      } else {
        reject(new Error('Failed to read image.'));
      }
    };
    reader.readAsDataURL(file);
  });

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
        accept="image/*"
        icon="paperclip"
        multiple
        onChange={onUpload}
        disabled={isSubmitting || isProcessing}
      >
        {isProcessing
          ? __('Processing…', 'alpaca')
          : __('Attach Images', 'alpaca')}
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
    const author = comment.author_details ||
      comment._embedded?.author?.[0] ||
      currentUser || { name: __('Unknown', 'alpaca') };

    const dataSource =
      comment.author_user_agent === 'audit' ? 'audit' : 'human';
    const isAudit = dataSource === 'audit';

    const commentTags = comment.meta?.alpacaCommentTags || [];
    const commentAttachments = comment.meta?.alpacaCommentAttachments || [];
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
            </div>
          </div>
          <div className="alpaca-comment-body">
            {editingCommentId === comment.id ? (
              <>
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
              </>
            ) : (
              <div
                className="alpaca-comment-content with-avatar-meta"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            )}
            {editingCommentId !== comment.id &&
              !isSubmitting &&
              commentAttachments.length > 0 && (
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
              lastActivity: new Date().toISOString(),
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

  const handleAttachmentFiles = useCallback(
    async (files, onSuccess) => {
      if (!files || files.length === 0) return;

      const incomingFiles = Array.from(files);
      const invalidFiles = incomingFiles.filter(
        (file) => !file.type || !file.type.startsWith(ATTACHMENT_MIME_PREFIX),
      );

      if (invalidFiles.length > 0) {
        showNotification(
          __('Only image files can be attached to comments.', 'alpaca'),
          'error',
        );
      }

      const imageFiles = incomingFiles.filter(
        (file) => file.type && file.type.startsWith(ATTACHMENT_MIME_PREFIX),
      );

      if (imageFiles.length === 0) {
        return;
      }

      setIsProcessingAttachments(true);
      try {
        const processed = await Promise.all(
          imageFiles.map(async (file) => {
            const url = await fileToWebpDataUrl(file);
            return {
              id: `${file.name}-${file.size}-${Date.now()}`,
              name: file.name,
              url,
            };
          }),
        );

        if (typeof onSuccess === 'function') {
          onSuccess(processed);
        }
      } catch (error) {
        console.error('Failed to process attachments', error);
        showNotification(
          __('Failed to process one or more attachments.', 'alpaca'),
          'error',
        );
      } finally {
        setIsProcessingAttachments(false);
      }
    },
    [showNotification],
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

  const removePendingAttachment = useCallback((attachmentId) => {
    setPendingAttachments((prev) =>
      prev.filter((attachment) => attachment.id !== attachmentId),
    );
  }, []);

  const removeEditingAttachment = useCallback((attachmentId) => {
    setEditingAttachments((prev) =>
      prev.filter((attachment) => attachment.id !== attachmentId),
    );
  }, []);

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
              {__('Are you sure you want to delete this comment?', 'alpaca')}
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
