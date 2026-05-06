import PropTypes from 'prop-types';
import { Attachment } from './issue/AttachmentRow';
import { uploadIssueAttachment } from '../utils/attachmentUpload';
import MentionsTextarea from './notifications/MentionsTextarea';
import useAutoExpandTextarea from '../hooks/useAutoExpandTextarea';

const {
  useState,
  useCallback,
  useEffect,
  memo,
  createInterpolateElement,
  useRef,
} = wp.element;
const { __ } = wp.i18n;
const { Button, Modal, Tooltip, FormFileUpload, DropZone } = wp.components;

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
            ? __('Uploading…', 'alpaca')
            : __('Attach Files', 'alpaca')}
        </FormFileUpload>

        <Tooltip text={__('Commenting Tips', 'alpaca')}>
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
          title={__('Commenting Tips', 'alpaca')}
          onRequestClose={() => setShowHelp(false)}
          className="alpaca-modal"
        >
          <div className="alpaca-help-content">
            {(() => {
              const defaultTips = [
                {
                  text: __(
                    'Type <kbd>@</kbd> and select a user to notify.',
                    'alpaca',
                  ),
                  placeholders: { kbd: <kbd /> },
                },
                {
                  text: __(
                    'Basic Markdown is supported: <code>**bold**</code>, <code>*italic*</code>, <code>`code`</code>, <code>- lists</code>, etc.',
                    'alpaca',
                  ),
                  placeholders: { code: <code /> },
                },
                {
                  text: __(
                    'You can click <strong>Attach Files</strong> to upload an attachment, or simply drag and drop files into the comment area.',
                    'alpaca',
                  ),
                  placeholders: { strong: <strong /> },
                },
              ];

              const tips = wp.hooks.applyFilters(
                'alpaca.commentingTips',
                defaultTips,
              );

              return (
                <ul>
                  {Array.isArray(tips)
                    ? tips.map((tip, index) => (
                        <li key={index}>
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

const CommentForm = memo(
  ({
    value,
    onChange,
    placeholder = __('Add a comment…', 'alpaca'),
    textareaRef,
    disabled = false,
    isSubmitting = false,
    issueId = null,
    commentId = null,
    initialAttachments = [],
    showNotification,
    onSubmit,
    submitButtonText = null,
    onRemoteAttachmentDelete,
    submitButtonDisabled = false,
    className = 'alpaca-comment-form',
    dataSource = 'human',
    onCancel,
  }) => {
    const [pendingAttachments, setPendingAttachments] = useState([]);
    const [isProcessingAttachments, setIsProcessingAttachments] =
      useState(false);
    const innerTextareaRef = useRef(null);
    const textareaRefToUse = textareaRef || innerTextareaRef;

    useAutoExpandTextarea(textareaRefToUse, value, !disabled);

    useEffect(() => {
      if (
        !Array.isArray(initialAttachments) ||
        initialAttachments.length === 0
      ) {
        return;
      }

      const mappedAttachments = initialAttachments
        .filter(Boolean)
        .map((item) => {
          if (typeof item === 'string') {
            return {
              id: item,
              url: item,
              name: undefined,
              mime: undefined,
              localOnly: false,
            };
          }

          return {
            id: item.id || item.url || String(item.name || Date.now()),
            url: item.url,
            name: item.name,
            mime: item.mime,
            localOnly: Boolean(item.localOnly),
          };
        });

      setPendingAttachments((previousAttachments) => [
        ...mappedAttachments,
        ...previousAttachments.filter(
          (pendingAttachment) =>
            !mappedAttachments.some(
              (mappedAttachment) =>
                mappedAttachment.url === pendingAttachment.url,
            ),
        ),
      ]);
    }, [initialAttachments]);

    const clearLocalPreviewUrls = useCallback((items) => {
      if (!Array.isArray(items) || items.length === 0) {
        return;
      }

      items.forEach((item) => {
        if (item && item.localOnly && item.url) {
          window.URL.revokeObjectURL(item.url);
        }
      });
    }, []);

    const handleAttachmentFiles = useCallback(
      async (files, onSuccess) => {
        if (!files || files.length === 0) {
          return;
        }

        const incomingFiles = Array.from(files);

        if (!issueId) {
          const queuedAttachments = incomingFiles.map((file, index) => ({
            id: `${file.name}-${file.size}-${Date.now()}-${index}`,
            name: file.name,
            mime: file.type || '',
            url: window.URL.createObjectURL(file),
            file,
            localOnly: true,
          }));

          if (typeof onSuccess === 'function') {
            onSuccess(queuedAttachments);
          }

          return;
        }

        setIsProcessingAttachments(true);

        try {
          const results = await Promise.allSettled(
            incomingFiles.map((file) =>
              uploadIssueAttachment(file, issueId || 0),
            ),
          );

          const uploadedAttachments = results
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

          if (
            uploadedAttachments.length > 0 &&
            typeof onSuccess === 'function'
          ) {
            onSuccess(uploadedAttachments);
          }
        } catch (uploadError) {
          console.error('Failed to upload attachments', uploadError);
          showNotification(
            __('Failed to upload one or more attachments.', 'alpaca'),
            'error',
          );
        } finally {
          setIsProcessingAttachments(false);
        }
      },
      [issueId, showNotification],
    );

    const handleAttachmentUpload = useCallback(
      (event) => {
        handleAttachmentFiles(event.target.files, (processedAttachments) => {
          setPendingAttachments((previousAttachments) => [
            ...previousAttachments,
            ...processedAttachments,
          ]);
        });
        event.target.value = null;
      },
      [handleAttachmentFiles],
    );

    const handlePendingAttachmentDrop = useCallback(
      (files) => {
        handleAttachmentFiles(files, (processedAttachments) => {
          setPendingAttachments((previousAttachments) => [
            ...previousAttachments,
            ...processedAttachments,
          ]);
        });
      },
      [handleAttachmentFiles],
    );

    const removePendingAttachment = useCallback(
      async (attachmentId) => {
        const attachment = pendingAttachments.find(
          (item) => item.id === attachmentId,
        );

        if (!attachment) {
          return;
        }

        if (attachment.localOnly) {
          if (attachment.url) {
            window.URL.revokeObjectURL(attachment.url);
          }

          setPendingAttachments((previousAttachments) =>
            previousAttachments.filter((item) => item.id !== attachmentId),
          );

          return;
        }

        if (attachment.url) {
          try {
            if (typeof onRemoteAttachmentDelete === 'function') {
              await onRemoteAttachmentDelete(attachment.url);
            } else {
              await deleteCommentAttachment(
                attachment.url,
                issueId || 0,
                commentId || null,
              );
            }
          } catch (deleteError) {
            console.error('Failed to delete attachment', deleteError);
            showNotification(
              __('Failed to delete attachment.', 'alpaca'),
              'error',
            );
            return;
          }
        }

        setPendingAttachments((previousAttachments) =>
          previousAttachments.filter((item) => item.id !== attachmentId),
        );
      },
      [
        pendingAttachments,
        issueId,
        commentId,
        onRemoteAttachmentDelete,
        showNotification,
      ],
    );

    const handleSubmit = useCallback(async () => {
      if (!onSubmit) {
        return;
      }

      try {
        const result = onSubmit(value, pendingAttachments);
        const resolvedResult =
          result && typeof result.then === 'function' ? await result : result;

        if (resolvedResult === false) {
          return;
        }

        clearLocalPreviewUrls(pendingAttachments);
        setPendingAttachments([]);
      } catch (submitError) {
        // The caller is responsible for surfacing submission errors.
      }
    }, [onSubmit, value, pendingAttachments, clearLocalPreviewUrls]);

    useEffect(() => {
      return () => {
        clearLocalPreviewUrls(pendingAttachments);
      };
    }, [pendingAttachments, clearLocalPreviewUrls]);

    let buttonText;
    if (isSubmitting) {
      buttonText = __('Submitting…', 'alpaca');
    } else if (submitButtonText) {
      buttonText = submitButtonText;
    } else if (issueId === null) {
      buttonText = __('Create Issue', 'alpaca');
    } else {
      buttonText = __('Submit Comment', 'alpaca');
    }

    return (
      <div className={className} data-source={dataSource}>
        <div className="alpaca-comment-form__content alpaca-timeline-content">
          <AttachmentControls
            attachments={pendingAttachments}
            onDrop={handlePendingAttachmentDrop}
            onUpload={handleAttachmentUpload}
            onRemove={removePendingAttachment}
            onClick={() => {}}
            isSubmitting={isSubmitting}
            isProcessing={isProcessingAttachments}
            pendingAltText={__('Pending comment attachment', 'alpaca')}
            actions={
              <>
                <Button
                  isPrimary
                  onClick={handleSubmit}
                  disabled={
                    submitButtonDisabled ||
                    isSubmitting ||
                    isProcessingAttachments
                  }
                >
                  {buttonText}
                </Button>
                {typeof onCancel === 'function' && (
                  <Button
                    onClick={() => {
                      clearLocalPreviewUrls(pendingAttachments);
                      setPendingAttachments([]);
                      onCancel();
                    }}
                    disabled={isSubmitting || isProcessingAttachments}
                  >
                    {__('Cancel', 'alpaca')}
                  </Button>
                )}
              </>
            }
          >
            <MentionsTextarea
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              textareaRef={textareaRefToUse}
              disabled={disabled}
            />
          </AttachmentControls>
        </div>
      </div>
    );
  },
);

CommentForm.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  textareaRef: PropTypes.object,
  disabled: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  issueId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showNotification: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  onRemoteAttachmentDelete: PropTypes.func,
  submitButtonText: PropTypes.string,
  submitButtonDisabled: PropTypes.bool,
  className: PropTypes.string,
  dataSource: PropTypes.string,
  onCancel: PropTypes.func,
  commentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialAttachments: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.string,
        url: PropTypes.string,
        name: PropTypes.string,
        mime: PropTypes.string,
        localOnly: PropTypes.bool,
      }),
    ]),
  ),
};

export default CommentForm;
