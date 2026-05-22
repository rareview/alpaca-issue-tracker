import PropTypes from 'prop-types';

const { useState } = wp.element;
const { __ } = wp.i18n;
const { Button, Modal } = wp.components;

const IMAGE_EXTENSIONS = [
  'apng',
  'avif',
  'bmp',
  'gif',
  'ico',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'tif',
  'tiff',
  'webp',
];

const getAttachmentName = (attachment) => {
  if (attachment.name) {
    return attachment.name;
  }

  if (!attachment.url) {
    return '';
  }

  const cleanedUrl = attachment.url.split('#')[0].split('?')[0];
  const lastSlash = cleanedUrl.lastIndexOf('/');
  const rawName =
    lastSlash === -1 ? cleanedUrl : cleanedUrl.slice(lastSlash + 1);

  try {
    return decodeURIComponent(rawName);
  } catch (error) {
    return rawName;
  }
};

const getAttachmentExtension = (attachmentName) => {
  if (!attachmentName) {
    return '';
  }

  const lastDot = attachmentName.lastIndexOf('.');
  if (lastDot === -1) {
    return '';
  }

  return attachmentName.slice(lastDot + 1).toLowerCase();
};

const isImageAttachment = (attachment) => {
  if (attachment.mime && attachment.mime.startsWith('image/')) {
    return true;
  }

  const extension = getAttachmentExtension(getAttachmentName(attachment));
  return extension ? IMAGE_EXTENSIONS.includes(extension) : false;
};

const getAttachmentTypeLabel = (attachment) => {
  const extension = getAttachmentExtension(getAttachmentName(attachment));
  return extension
    ? extension.toUpperCase()
    : __('File', 'alpaca-issue-tracker');
};

const Attachment = ({
  attachment,
  onAttachmentClick,
  onAttachmentDelete,
  isLoading,
  showDelete,
  altText,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const canPreviewAttachment = 'function' === typeof onAttachmentClick;

  return (
    <div className="alpaca-attachment">
      {isImageAttachment(attachment) ? (
        <button
          type="button"
          className="alpaca-attachment-thumbnail"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            if (canPreviewAttachment) {
              onAttachmentClick(attachment.url);
            }
          }}
          style={{
            cursor: canPreviewAttachment ? 'zoom-in' : 'inherit',
            padding: 0,
            border: 'none',
            background: 'none',
          }}
        >
          <img src={attachment.url} alt={altText} />
        </button>
      ) : (
        <div
          className="alpaca-attachment-file"
          data-filetype={getAttachmentTypeLabel(attachment)}
        >
          <a
            className="alpaca-attachment-file-link"
            href={attachment.url}
            download
            aria-label={__('Download attachment', 'alpaca-issue-tracker')}
          >
            <span className="alpaca-attachment-file-meta">
              <span className="alpaca-attachment-file-name">
                {getAttachmentName(attachment)}
              </span>
              <span className="alpaca-attachment-file-type">
                {getAttachmentTypeLabel(attachment)}
              </span>
            </span>
          </a>
        </div>
      )}

      {showDelete && (
        <>
          <button
            type="button"
            disabled={isLoading}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setShowConfirm(true);
            }}
            aria-label={__('Delete attachment', 'alpaca-issue-tracker')}
            title={__('Delete attachment', 'alpaca-issue-tracker')}
            className="alpaca-attachment-delete"
          >
            <span aria-hidden="true">×</span>
          </button>

          {showConfirm && (
            <Modal
              title={__('Delete attachment?', 'alpaca-issue-tracker')}
              onRequestClose={() => setShowConfirm(false)}
              className="alpaca-modal"
            >
              <p>
                {__(
                  'Are you sure you want to delete this attachment?',
                  'alpaca-issue-tracker',
                )}
              </p>
              <Button
                isPrimary
                isDestructive
                onClick={() => {
                  setShowConfirm(false);
                  onAttachmentDelete();
                }}
              >
                {__('Delete', 'alpaca-issue-tracker')}
              </Button>
              <Button onClick={() => setShowConfirm(false)}>
                {__('Cancel', 'alpaca-issue-tracker')}
              </Button>
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

Attachment.propTypes = {
  attachment: PropTypes.shape({
    url: PropTypes.string.isRequired,
    name: PropTypes.string,
    mime: PropTypes.string,
  }).isRequired,
  onAttachmentClick: PropTypes.func,
  onAttachmentDelete: PropTypes.func,
  isLoading: PropTypes.bool,
  showDelete: PropTypes.bool,
  altText: PropTypes.string,
};

Attachment.defaultProps = {
  onAttachmentDelete: () => {},
  onAttachmentClick: null,
  isLoading: false,
  showDelete: true,
  altText: 'Screenshot',
};

const AttachmentRow = ({
  attachments,
  onAttachmentClick,
  onAttachmentDelete,
  isLoading,
}) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <tr>
      <th scope="row">Attachments</th>
      <td className="alpaca-flex-align">
        <div className="alpaca-attachments-wrapper">
          {attachments.map((attachment) => (
            <Attachment
              key={attachment.url}
              attachment={attachment}
              onAttachmentClick={onAttachmentClick}
              onAttachmentDelete={onAttachmentDelete}
              isLoading={isLoading}
              showDelete
              altText="Screenshot"
            />
          ))}
        </div>
      </td>
    </tr>
  );
};

AttachmentRow.propTypes = {
  attachments: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      name: PropTypes.string,
      mime: PropTypes.string,
    }),
  ),
  onAttachmentClick: PropTypes.func.isRequired,
  onAttachmentDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

AttachmentRow.defaultProps = {
  attachments: [],
};

export { Attachment };

export default AttachmentRow;
