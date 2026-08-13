import PropTypes from 'prop-types';
import { getUser } from '../hooks/useUser';
import { fetchIssueCommentCount } from '../services/issueApi';
import useAutoExpandTextarea from '../hooks/useAutoExpandTextarea';
import TimelineEntry, { injectAvatarStyles } from './comment/TimelineEntry';

const {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  createInterpolateElement,
} = wp.element;
const { __, _n, sprintf } = wp.i18n;
const {
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
import { sanitizeHtml } from '../utils/sanitize';
import Lightbox from './issue/Lightbox';
import { Attachment } from './issue/AttachmentRow';
import { uploadIssueAttachment } from '../utils/attachmentUpload';
import { renderIssueLinkMarkup } from '../utils/issueLinks';
import { postIssueMentionAuditComments } from '../utils/issueCommentHandler';
import MentionsTextarea from './notifications/MentionsTextarea';
import MarkdownTextarea from './MarkdownTextarea';

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
      response?.message ||
        __('Failed to delete attachment.', 'alpaca-issue-tracker'),
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
}) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
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
          __next40pxDefaultSize
          __nextHasNoMarginBottom
        >
          {isProcessing
            ? __('Uploading…', 'alpaca-issue-tracker')
            : __('Attach Files', 'alpaca-issue-tracker')}
        </FormFileUpload>

        <Tooltip text={__('Commenting Tips', 'alpaca-issue-tracker')}>
          <Button
            variant="tertiary"
            icon="info-outline"
            onClick={() => setShowHelp(true)}
            disabled={isSubmitting}
          />
        </Tooltip>

        {actions}
      </div>

      {showHelp && (
        <Modal
          title={__('Commenting Tips', 'alpaca-issue-tracker')}
          onRequestClose={() => setShowHelp(false)}
          className="alpaca-modal"
        >
          <div className="alpaca-help-content">
            {(() => {
              const defaultTips = [
                {
                  text: __(
                    'Type <kbd>@</kbd> and select a user to notify.',
                    'alpaca-issue-tracker',
                  ),
                  placeholders: { kbd: <kbd /> },
                },
                {
                  text: __(
                    'Type <kbd>#</kbd> and select an issue to link.',
                    'alpaca-issue-tracker',
                  ),
                  placeholders: { kbd: <kbd /> },
                },
                {
                  text: __(
                    'Basic Markdown is supported: <code>**bold**</code>, <code>*italic*</code>, <code>`code`</code>, <code>- lists</code>, etc.',
                    'alpaca-issue-tracker',
                  ),
                  placeholders: { code: <code /> },
                },
                {
                  text: __(
                    'Use <kbd>Cmd/Ctrl+B</kbd> for bold, <kbd>Cmd/Ctrl+I</kbd> for italic, and <kbd>Cmd/Ctrl+K</kbd> to create a link.',
                    'alpaca-issue-tracker',
                  ),
                  placeholders: { kbd: <kbd /> },
                },
                {
                  text: __(
                    'You can click <strong>Attach Files</strong> to upload an attachment, or simply drag and drop files into the comment area.',
                    'alpaca-issue-tracker',
                  ),
                  placeholders: { strong: <strong /> },
                },
              ];

              // Allow third-party plugins to add or modify tips.
              const tips = wp.hooks.applyFilters(
                'alpaca.commentingTips',
                defaultTips,
              );

              return (
                <ul>
                  {Array.isArray(tips)
                    ? tips.map((tip, idx) => (
                        <li key={idx}>
                          {createInterpolateElement(
                            tip.text || '',
                            tip.placeholders || {},
                          )}
                        </li>
                      ))
                    : null}
                </ul>
              );
            })()}
          </div>
        </Modal>
      )}
    </>
  );
};

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
    activeSearchQuery,
    searchScopeIssueIds,
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
    userCanManageOptions,
    onAttachmentClick,
    editingAttachments,
    onEditAttachFiles,
    onEditAttachDrop,
    onEditAttachRemove,
    isProcessingAttachments,
  }) => {
    const commentAgentType = (
      comment?.author_user_agent ||
      comment?.comment_agent ||
      ''
    )
      .toString()
      .trim()
      .toLowerCase();
    const defaultIsEditable = ['human', 'create'];
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
        isEditing={editingCommentId === comment.id}
        isSubmitting={isSubmitting}
        headerActions={
          canManageComment ? (
            <Dropdown
              popoverProps={{ placement: 'bottom-end' }}
              renderToggle={({ isOpen, onToggle }) => (
                <Tooltip text={__('Options', 'alpaca-issue-tracker')}>
                  <Button
                    icon="ellipsis"
                    onClick={onToggle}
                    aria-expanded={isOpen}
                    className="alpaca-rotate-90"
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
                      {__('Edit', 'alpaca-issue-tracker')}
                    </MenuItem>
                  )}
                  {canDeleteComment && (
                    <MenuItem
                      icon="trash"
                      isDestructive
                      onClick={() => confirmDeleteComment(comment.id)}
                    >
                      {__('Delete', 'alpaca-issue-tracker')}
                    </MenuItem>
                  )}
                </MenuGroup>
              )}
            />
          ) : null
        }
        editBody={
          <div className="alpaca-comment-form">
            <div className="alpaca-comment-form__content alpaca-timeline-content">
              <AttachmentControls
                attachments={editingAttachments}
                onDrop={onEditAttachDrop}
                onUpload={onEditAttachFiles}
                onRemove={onEditAttachRemove}
                onClick={onAttachmentClick}
                isSubmitting={isSubmitting}
                isProcessing={isProcessingAttachments}
                pendingAltText={__(
                  'Pending comment attachment',
                  'alpaca-issue-tracker',
                )}
                actions={
                  <>
                    <Button onClick={cancelEditing} disabled={isSubmitting}>
                      {__('Cancel', 'alpaca-issue-tracker')}
                    </Button>
                    <Button
                      isPrimary
                      onClick={() => saveEdit(comment.id)}
                      disabled={isSubmitting || isProcessingAttachments}
                    >
                      {__('Save', 'alpaca-issue-tracker')}
                    </Button>
                  </>
                }
              >
                <MarkdownTextarea
                  value={editingContent}
                  onChange={setEditingContent}
                  textareaRef={editingRef}
                  disabled={isSubmitting}
                >
                  <MentionsTextarea
                    value={editingContent}
                    onChange={setEditingContent}
                    textareaRef={editingRef}
                    placeholder={__('Edit comment…', 'alpaca-issue-tracker')}
                    disabled={isSubmitting}
                    searchScopeIssueIds={searchScopeIssueIds}
                  />
                </MarkdownTextarea>
              </AttachmentControls>
            </div>
          </div>
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
  searchScopeIssueIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ),
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
  userCanManageOptions: PropTypes.bool.isRequired,
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
const Commenting = ({
  issueId,
  issueTitle,
  issueSlug,
  activeSearchQuery,
  commentRefreshKey,
  searchScopeIssueIds,
  showNotification,
}) => {
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingAttachments, setIsProcessingAttachments] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [editingAttachments, setEditingAttachments] = useState([]);
  const [editingOriginalAttachmentIds, setEditingOriginalAttachmentIds] =
    useState([]);
  const [editingRemovedAttachmentUrls, setEditingRemovedAttachmentUrls] =
    useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const editingRef = useRef(null);
  const newCommentRef = useRef(null);
  const localizedCanManageOptions =
    typeof window !== 'undefined'
      ? window.alpaistrSettings?.canManageOptions
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

  const fetchComments = useCallback(
    (options = {}) => {
      if (!issueId) return;

      const { showLoading = true } = options;

      if (showLoading) {
        setIsLoadingComments(true);
      }

      wp.apiFetch({
        path: `/wp/v2/comments?post=${issueId}&_embed=author&per_page=-1&orderby=date&order=desc&comment_type=issuecomment&alpaca_include_hidden_comments=1&context=edit`,
      })
        .then(setComments)
        .catch((err) => {
          console.error(err);
          showNotification(
            __('Could not load comments.', 'alpaca-issue-tracker'),
            'error',
          );
        })
        .finally(() => {
          if (showLoading) {
            setIsLoadingComments(false);
          }
        });
    },
    [issueId, showNotification],
  );

  useEffect(() => fetchComments(), [fetchComments, commentRefreshKey]);

  useEffect(() => {
    const handleCommentCountChanged = ({ issueId: changedId }) => {
      if (changedId.toString() === issueId.toString()) {
        fetchComments({ showLoading: false });
      }
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
        __('Please add a comment before submitting.', 'alpaca-issue-tracker'),
        'error',
      );
      return;
    }
    setIsSubmitting(true);

    const processedOptimisticContent = injectAvatarStyles(
      sanitizeHtml(marked(renderIssueLinkMarkup(newComment))),
    );
    const attachmentUrls = pendingAttachments.map(
      (attachment) => attachment.url,
    );
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

    const optimisticCommentClientId = `optimistic-comment-${Date.now()}`;

    const optimisticComment = {
      id: Date.now(),
      clientId: optimisticCommentClientId,
      content: { raw: newComment, rendered: processedOptimisticContent },
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
        content: newComment,
        post: issueId,
        comment_type: 'issuecomment',
        author_user_agent: 'human',
        meta: createMeta,
      },
    })
      .then(async (created) => {
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

        createdComment.clientId = optimisticCommentClientId;

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

        try {
          await postIssueMentionAuditComments({
            content: newComment,
            currentUser,
            sourceIssue: {
              id: issueId,
              slug: issueSlug,
              title: issueTitle,
            },
          });
        } catch (auditError) {
          // eslint-disable-next-line no-console
          console.error(
            'Failed to create issue mention audit comments.',
            auditError,
          );
        }

        setNewComment('');
        setPendingAttachments([]);
      })
      .catch((err) => {
        console.error(err);
        setComments((prev) =>
          prev.filter((c) => c.id !== optimisticComment.id),
        );
        showNotification(
          `${__('Failed to submit comment:', 'alpaca-issue-tracker')} ${err.message || __('Unknown error', 'alpaca-issue-tracker')}`,
        );
      })
      .finally(() => setIsSubmitting(false));
  }, [
    newComment,
    currentUser,
    issueId,
    issueSlug,
    issueTitle,
    showNotification,
    pendingAttachments,
  ]);

  const startEditing = useCallback((comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content.raw || comment.content.rendered || '');
    const existingAttachments = comment.meta?.alpacaCommentAttachments || [];
    setEditingRemovedAttachmentUrls([]);
    const formattedAttachments = existingAttachments.map((url, index) => ({
      id: `${comment.id}-${index}`,
      url,
    }));
    setEditingOriginalAttachmentIds(
      formattedAttachments.map((attachment) => attachment.id),
    );
    setEditingAttachments(formattedAttachments);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent('');
    setEditingAttachments([]);
    setEditingOriginalAttachmentIds([]);
    setEditingRemovedAttachmentUrls([]);
  }, []);

  const saveEdit = useCallback(
    (commentId) => {
      if (!editingContent.trim()) return;
      setIsSubmitting(true);

      const comment = comments.find((c) => c.id === commentId);
      const previousContent =
        comment?.content?.raw || comment?.content?.rendered || '';
      const agent = comment?.author_user_agent || 'human';
      const currentTimestamp = new Date().toISOString();
      const lastEditedMeta = {
        date: currentTimestamp,
        userId: Number(currentUser?.id) || 0,
        userName:
          currentUser?.display_name ||
          currentUser?.name ||
          __('Unknown', 'alpaca-issue-tracker'),
      };
      const attachmentUrls = editingAttachments
        .map((attachment) => attachment.url)
        .filter((url) => !editingRemovedAttachmentUrls.includes(url));
      const attachmentMeta = {
        alpacaCommentAttachments: attachmentUrls,
      };
      const removedUrls = [...editingRemovedAttachmentUrls];

      const performSave = () =>
        wp.apiFetch({
          path: `/wp/v2/comments/${commentId}`,
          method: 'POST',
          data: {
            content: editingContent,
            author_user_agent: agent,
            meta: {
              ...attachmentMeta,
              alpacaCommentLastEdit: lastEditedMeta,
            },
          },
        });

      const deleteRemovedAttachments =
        removedUrls.length > 0
          ? Promise.allSettled(
              removedUrls.map((url) =>
                deleteCommentAttachment(url, issueId, commentId),
              ),
            )
          : Promise.resolve([]);

      deleteRemovedAttachments
        .then((results) => {
          const failedCount = results.filter(
            (result) => result.status === 'rejected',
          ).length;

          if (failedCount > 0) {
            showNotification(
              __(
                'Failed to delete one or more attachments.',
                'alpaca-issue-tracker',
              ),
              'error',
            );
            throw new Error('attachment_delete_failed');
          }

          return performSave();
        })
        .then(async (updated) => {
          const updatedComment = {
            ...(updated || {}),
            meta: {
              ...(updated && updated.meta ? updated.meta : {}),
              ...attachmentMeta,
              alpacaCommentLastEdit: lastEditedMeta,
            },
          };

          setComments((prev) =>
            prev.map((c) => (c.id === commentId ? updatedComment : c)),
          );
          setEditingCommentId(null);
          setEditingContent('');
          setEditingAttachments([]);
          setEditingOriginalAttachmentIds([]);
          setEditingRemovedAttachmentUrls([]);

          try {
            await postIssueMentionAuditComments({
              content: editingContent,
              previousContent,
              currentUser,
              sourceIssue: {
                id: issueId,
                slug: issueSlug,
                title: issueTitle,
              },
            });
          } catch (auditError) {
            // eslint-disable-next-line no-console
            console.error(
              'Failed to update issue mention audit comments.',
              auditError,
            );
          }

          wp.hooks.doAction('alpaca.commentUpdated', updatedComment);
        })
        .catch((err) => {
          if ('attachment_delete_failed' === err?.message) {
            return;
          }

          console.error(err);
          showNotification(
            `${__('Failed to update comment:', 'alpaca-issue-tracker')} ${err.message || __('Unknown error', 'alpaca-issue-tracker')}`,
          );
        })
        .finally(() => setIsSubmitting(false));
    },
    [
      editingContent,
      comments,
      showNotification,
      editingAttachments,
      editingRemovedAttachmentUrls,
      currentUser,
      issueId,
      issueSlug,
      issueTitle,
    ],
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
              `${__('Failed to delete comment:', 'alpaca-issue-tracker')} ${err.message || __('Unknown error', 'alpaca-issue-tracker')}`,
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
            __(
              'Failed to upload one or more attachments.',
              'alpaca-issue-tracker',
            ),
            'error',
          );
        }

        if (uploaded.length > 0 && typeof onSuccess === 'function') {
          onSuccess(uploaded);
        }
      } catch (error) {
        console.error('Failed to upload attachments', error);
        showNotification(
          __(
            'Failed to upload one or more attachments.',
            'alpaca-issue-tracker',
          ),
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
            __('Failed to delete attachment.', 'alpaca-issue-tracker'),
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
        const isOriginalAttachment = editingOriginalAttachmentIds.includes(
          attachment.id,
        );

        if (isOriginalAttachment) {
          setEditingRemovedAttachmentUrls((prev) => {
            if (prev.includes(attachment.url)) {
              return prev;
            }

            return [...prev, attachment.url];
          });
        } else {
          try {
            await deleteCommentAttachment(
              attachment.url,
              issueId,
              editingCommentId,
            );
          } catch (error) {
            console.error('Failed to delete attachment', error);
            showNotification(
              __('Failed to delete attachment.', 'alpaca-issue-tracker'),
              'error',
            );
            return;
          }
        }
      }

      setEditingAttachments((prev) =>
        prev.filter((item) => item.id !== attachmentId),
      );
    },
    [
      editingAttachments,
      editingCommentId,
      editingOriginalAttachmentIds,
      issueId,
      showNotification,
    ],
  );

  const handleLightboxClose = useCallback(() => setLightboxSrc(null), []);

  return (
    <div id="alpaca-comments-wrapper">
      <div id="alpaca-comments-header">
        <Button variant="tertiary" onClick={toggleSortOrder}>
          {sortOrder === 'desc'
            ? __('Sort: ↑', 'alpaca-issue-tracker')
            : __('Sort: ↓', 'alpaca-issue-tracker')}
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
              pendingAltText={__(
                'Pending comment attachment',
                'alpaca-issue-tracker',
              )}
              actions={
                <Button
                  isPrimary
                  onClick={handleCommentSubmit}
                  disabled={isSubmitting || isProcessingAttachments}
                >
                  {isSubmitting
                    ? __('Submitting…', 'alpaca-issue-tracker')
                    : __('Submit Comment', 'alpaca-issue-tracker')}
                </Button>
              }
            >
              <MarkdownTextarea
                value={newComment}
                textareaRef={newCommentRef}
                onChange={setNewComment}
                disabled={isSubmitting}
              >
                <MentionsTextarea
                  placeholder={__('Add a comment…', 'alpaca-issue-tracker')}
                  value={newComment}
                  onChange={setNewComment}
                  textareaRef={newCommentRef}
                  disabled={isSubmitting}
                  searchScopeIssueIds={searchScopeIssueIds}
                />
              </MarkdownTextarea>
            </AttachmentControls>
          </div>
        </div>

        {isLoadingComments && (
          <p className="alpaca-loading">
            {__('Loading comments…', 'alpaca-issue-tracker')}
          </p>
        )}

        <div className="alpaca-comments-timeline">
          {comments.map((comment) => (
            <Comment
              key={comment.clientId || comment.id}
              comment={comment}
              activeSearchQuery={activeSearchQuery}
              searchScopeIssueIds={searchScopeIssueIds}
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
              userCanManageOptions={userCanManageOptions}
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
            title={__('Delete Comment?', 'alpaca-issue-tracker')}
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
                  attachmentText = __(
                    ' and its attachment',
                    'alpaca-issue-tracker',
                  );
                } else if (attachmentCount > 1) {
                  attachmentText = __(
                    ' and its attachments',
                    'alpaca-issue-tracker',
                  );
                }

                const commentCount = 1;

                return sprintf(
                  /* translators: %1$s: attachment text suffix for comment deletion confirmation. */
                  _n(
                    'Are you sure you want to delete this comment%1$s?',
                    'Are you sure you want to delete these comments%1$s?',
                    commentCount,
                    'alpaca-issue-tracker',
                  ),
                  attachmentText,
                );
              })()}
            </p>
            <Button isPrimary onClick={deleteComment}>
              {__('Delete', 'alpaca-issue-tracker')}
            </Button>
            <Button onClick={cancelDelete}>
              {__('Cancel', 'alpaca-issue-tracker')}
            </Button>
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
  issueTitle: PropTypes.string,
  issueSlug: PropTypes.string,
  activeSearchQuery: PropTypes.string,
  commentRefreshKey: PropTypes.number.isRequired,
  searchScopeIssueIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ),
  showNotification: PropTypes.func.isRequired,
};

Commenting.defaultProps = {
  issueTitle: '',
  issueSlug: '',
  activeSearchQuery: '',
  searchScopeIssueIds: [],
};

export default memo(Commenting);
