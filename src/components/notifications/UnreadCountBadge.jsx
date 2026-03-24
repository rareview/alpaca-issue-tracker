import PropTypes from 'prop-types';

const { __, sprintf } = wp.i18n;

/**
 * Render an unread count badge.
 *
 * @param {Object} props         Component props.
 * @param {number} props.count   Unread count.
 * @param {string} props.variant Badge display variant.
 * @return {JSX.Element|null} Badge markup.
 */
function UnreadCountBadge({ count, variant }) {
  const normalizedCount = Number(count);

  if (!Number.isFinite(normalizedCount) || normalizedCount <= 0) {
    return null;
  }

  if ('admin-menu' === variant) {
    const adminMenuScreenReaderLabel = sprintf(
      /* translators: %d is the current user's unread inbox notification count. */
      __('Project Board has %d unread notifications', 'alpaca'),
      normalizedCount,
    );

    return (
      <>
        <span
          className={`update-plugins count-${normalizedCount}`}
          aria-hidden="true"
        >
          <span className="plugin-count">{normalizedCount}</span>
        </span>
        <span className="screen-reader-text">{adminMenuScreenReaderLabel}</span>
      </>
    );
  }

  return <span className="alpaca-inbox-trigger-badge">{normalizedCount}</span>;
}

UnreadCountBadge.propTypes = {
  count: PropTypes.number,
  variant: PropTypes.oneOf(['inbox-trigger', 'admin-menu']),
};

UnreadCountBadge.defaultProps = {
  count: 0,
  variant: 'inbox-trigger',
};

export default UnreadCountBadge;
