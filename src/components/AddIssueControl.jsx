const { createPortal } = wp.element;
const { Button } = wp.components;
const { __ } = wp.i18n;

import PropTypes from 'prop-types';

/**
 * Primary board control for creating an issue in the first board column.
 *
 * @param {Object}   props            Component props.
 * @param {string}   props.selector   Controls mount selector.
 * @param {Function} props.onAddIssue Create issue callback.
 * @return {JSX.Element|null} Add issue control portal.
 */
function AddIssueControl({ selector, onAddIssue }) {
  if (typeof document === 'undefined' || typeof createPortal !== 'function') {
    return null;
  }

  const mountNode = document.querySelector(selector);

  if (!mountNode) {
    return null;
  }

  return createPortal(
    <Button
      className="alpaca-add-issue-control"
      variant="primary"
      onClick={onAddIssue}
    >
      {__('Add Issue', 'alpaca-issue-tracker')}
    </Button>,
    mountNode,
  );
}

AddIssueControl.propTypes = {
  selector: PropTypes.string,
  onAddIssue: PropTypes.func,
};

AddIssueControl.defaultProps = {
  selector: '#project-board-controls-mount',
  onAddIssue: () => {},
};

export default AddIssueControl;
