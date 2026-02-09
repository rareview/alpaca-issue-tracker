import PropTypes from 'prop-types';

const { Button } = wp.components;

const Attachment = ({
  attachment,
  onAttachmentClick,
  onAttachmentDelete,
  isLoading,
  showDelete,
  altText,
}) => (
  <div className="alpaca-attachment">
    <button
      type="button"
      className="alpaca-attachment-thumbnail"
      onClick={() => onAttachmentClick(attachment.url)}
      style={{
        cursor: 'zoom-in',
        padding: 0,
        border: 'none',
        background: 'none',
      }}
    >
      <img src={attachment.url} alt={altText} />
    </button>

    {showDelete && (
      <Button
        disabled={isLoading}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAttachmentDelete();
        }}
        label="Delete"
        showTooltip
        tooltipPosition="top"
        icon="trash"
        isDestructive
        className="alpaca-attachment-delete"
        variant="primary"
      />
    )}
  </div>
);

Attachment.propTypes = {
  attachment: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
  onAttachmentClick: PropTypes.func.isRequired,
  onAttachmentDelete: PropTypes.func,
  isLoading: PropTypes.bool,
  showDelete: PropTypes.bool,
  altText: PropTypes.string,
};

Attachment.defaultProps = {
  onAttachmentDelete: () => {},
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
      <td className="flexalign">
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
