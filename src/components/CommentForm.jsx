import PropTypes from 'prop-types';
import { Attachment } from './issue/AttachmentRow';
import { uploadIssueAttachment } from '../utils/attachmentUpload';
import MentionsTextarea from './notifications/MentionsTextarea';

const { useState, useCallback, memo, createInterpolateElement } = wp.element;
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

const CommentForm = memo(
  ({
    value,
    onChange,
    placeholder = __('Add a comment…', 'alpaca'),
    textareaRef,
    disabled = false,
    isSubmitting = false,
    issueId = null,
    showNotification,
    onSubmit,
    submitButtonText = __('Submit Comment', 'alpaca'),
    submitButtonDisabled = false,
    className = 'alpaca-comment-form',
    dataSource = 'human',
  }) => {
    const [pendingAttachments, setPendingAttachments] = useState([]);
    const [isProcessingAttachments, setIsProcessingAttachments] =
      useState(false);

    const handleAttachmentFiles = useCallback(
      async (files, onSuccess) => {
        if (!files || files.length === 0) return;

        const incomingFiles = Array.from(files);
        setIsProcessingAttachments(true);

        try {
          const results = await Promise.allSettled(
            incomingFiles.map((file) =>
              uploadIssueAttachment(file, issueId || 0),
            ),
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
        handleAttachmentFiles(event.target.files, (processed) => {
          setPendingAttachments((prev) => [...prev, ...processed]);
        });
        event.target.value = null;
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
            await deleteCommentAttachment(attachment.url, issueId || 0);
          } catch (deleteError) {
            console.error('Failed to delete attachment', deleteError);
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

    const handleSubmit = useCallback(() => {
      if (onSubmit) {
        onSubmit(value, pendingAttachments);
      }
    }, [onSubmit, value, pendingAttachments]);

    let buttonText;
    if (isSubmitting) {
      buttonText = __('Submitting…', 'alpaca');
    } else if (issueId === null) {
      buttonText = __('Create Issue', 'alpaca');
    } else {
      buttonText = submitButtonText;
    }

    return (
      <div className={className} data-source={dataSource}>
        <div className="alpaca-timeline-content">
          <AttachmentControls
            attachments={pendingAttachments}
            onDrop={handlePendingAttachmentDrop}
            onUpload={handleAttachmentUpload}
            onRemove={removePendingAttachment}
            onClick={() => {}} // Lightbox not needed for creation
            isSubmitting={isSubmitting}
            isProcessing={isProcessingAttachments}
            pendingAltText={__('Pending comment attachment', 'alpaca')}
            actions={
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
            }
          >
            <MentionsTextarea
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              textareaRef={textareaRef}
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
  submitButtonText: PropTypes.string,
  submitButtonDisabled: PropTypes.bool,
  className: PropTypes.string,
  dataSource: PropTypes.string,
};

export default CommentForm;
