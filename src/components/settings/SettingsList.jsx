import PropTypes from 'prop-types';

const { Button, TextControl } = wp.components;
const { __ } = wp.i18n;

export const SettingsList = ({ children, className }) => {
  return (
    <div
      className={`alpaca-settings-table alpaca-settings-list ${className}`.trim()}
      role="table"
    >
      {children}
    </div>
  );
};

SettingsList.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

SettingsList.defaultProps = {
  className: '',
};

export const SettingsListBody = ({
  children,
  bodyRef,
  className,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  return (
    <div
      ref={bodyRef}
      className={`alpaca-settings-list-body ${className}`.trim()}
      role="rowgroup"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
    </div>
  );
};

SettingsListBody.propTypes = {
  children: PropTypes.node.isRequired,
  bodyRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({})]),
  className: PropTypes.string,
  onDragOver: PropTypes.func,
  onDragLeave: PropTypes.func,
  onDrop: PropTypes.func,
};

SettingsListBody.defaultProps = {
  bodyRef: null,
  className: '',
  onDragOver: undefined,
  onDragLeave: undefined,
  onDrop: undefined,
};

export const SettingsListRow = wp.element.forwardRef(
  ({ children, className, style, ...restProps }, ref) => {
    return (
      <div
        ref={ref}
        className={`alpaca-settings-list-row ${className}`.trim()}
        role="row"
        style={style}
        {...restProps}
      >
        {children}
      </div>
    );
  },
);

SettingsListRow.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
};

SettingsListRow.defaultProps = {
  className: '',
  style: undefined,
};

SettingsListRow.displayName = 'SettingsListRow';

export const SettingsListNameCell = ({ children, className }) => {
  return (
    <div
      className={`alpaca-settings-list-name ${className}`.trim()}
      role="cell"
    >
      {children}
    </div>
  );
};

SettingsListNameCell.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

SettingsListNameCell.defaultProps = {
  className: '',
};

export const SettingsListEditableName = ({
  value,
  placeholder,
  onSave,
  disabled,
}) => {
  const [isEditing, setIsEditing] = wp.element.useState(false);
  const [draft, setDraft] = wp.element.useState(value);
  const inputRef = wp.element.useRef(null);

  wp.element.useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [isEditing, value]);

  wp.element.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const cancelEditing = () => {
    setDraft(value);
    setIsEditing(false);
  };

  const saveEditing = () => {
    const nextValue = draft.trim();

    setIsEditing(false);
    if (nextValue && nextValue !== value) {
      onSave(nextValue);
    } else {
      setDraft(value);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      saveEditing();
    } else if (event.key === 'Escape') {
      cancelEditing();
    }
  };

  if (isEditing) {
    return (
      <TextControl
        ref={inputRef}
        className="alpaca-settings-list-name-editor"
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        value={draft}
        placeholder={placeholder}
        onChange={setDraft}
        onBlur={saveEditing}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
    );
  }

  return (
    <Button
      variant="tertiary"
      icon="edit"
      iconPosition="right"
      className="alpaca-settings-list-name-editor"
      onClick={() => setIsEditing(true)}
      disabled={disabled}
      title={__('Edit name', 'alpaca-issue-tracker')}
    >
      {value || placeholder}
    </Button>
  );
};

SettingsListEditableName.propTypes = {
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

SettingsListEditableName.defaultProps = {
  placeholder: '',
  disabled: false,
};

export const SettingsListActionsCell = ({ children, className }) => {
  return (
    <div
      className={`alpaca-settings-list-actions ${className}`.trim()}
      role="cell"
    >
      {children}
    </div>
  );
};

SettingsListActionsCell.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

SettingsListActionsCell.defaultProps = {
  className: '',
};
