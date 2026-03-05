import PropTypes from 'prop-types';

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
