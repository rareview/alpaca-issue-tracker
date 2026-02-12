import PropTypes from 'prop-types';

const { __ } = wp.i18n;

/**
 * Star control used to add or remove an issue from the watchlist.
 *
 * @param {Object}   root0           - Component props.
 * @param {boolean}  root0.watched   - Whether the issue is watched.
 * @param {Function} root0.onToggle  - Callback fired when the control is clicked.
 * @param {boolean}  root0.disabled  - Whether the control is disabled.
 * @param {string}   root0.className - Optional class names.
 * @return {JSX.Element} Star control button.
 */
const StarControl = ({ watched, onToggle, disabled, className }) => {
  const classes = [
    className,
    'dashicons',
    watched ? 'dashicons-star-filled' : 'dashicons-star-empty',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onToggle}
      aria-label={
        watched
          ? __('Remove from Watchlist', 'alpaca')
          : __('Add to Watchlist', 'alpaca')
      }
      title={
        watched
          ? __('Remove from Watchlist', 'alpaca')
          : __('Add to Watchlist', 'alpaca')
      }
      disabled={disabled}
    />
  );
};

StarControl.propTypes = {
  watched: PropTypes.bool,
  onToggle: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

StarControl.defaultProps = {
  watched: false,
  onToggle: null,
  disabled: false,
  className: '',
};

export default StarControl;
