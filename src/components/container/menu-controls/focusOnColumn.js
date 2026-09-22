const { __ } = wp.i18n;

/**
 * Build the Focus on Column control for a container menu.
 *
 * @param {Object}   root0               Control configuration.
 * @param {number}   root0.containerId   Current container ID.
 * @param {boolean}  root0.isFocused     Whether the current container is focused.
 * @param {Function} root0.onToggleFocus Toggle the focused container.
 * @return {Object} Dropdown control descriptor.
 */
export const createFocusOnColumnMenuControl = ({
  containerId,
  isFocused,
  onToggleFocus,
}) => {
  return {
    icon: 'visibility',
    title: isFocused
      ? __('Clear Column Focus', 'alpaca-issue-tracker')
      : __('Focus on Column', 'alpaca-issue-tracker'),
    onClick: () => {
      onToggleFocus(containerId);
    },
  };
};
