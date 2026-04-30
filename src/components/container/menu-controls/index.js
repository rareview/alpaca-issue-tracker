import { createFocusOnColumnMenuControl } from './focusOnColumn';

/**
 * Build built-in container menu controls owned by the main plugin.
 *
 * @param {Object}   root0               Control configuration.
 * @param {number}   root0.containerId   Current container ID.
 * @param {boolean}  root0.isFocused     Whether the current container is focused.
 * @param {Function} root0.onToggleFocus Toggle the focused container.
 * @return {Array} Built-in control descriptors.
 */
export const getBuiltInContainerMenuControls = ({
  containerId,
  isFocused,
  onToggleFocus,
}) => {
  return [
    createFocusOnColumnMenuControl({
      containerId,
      isFocused,
      onToggleFocus,
    }),
  ];
};
