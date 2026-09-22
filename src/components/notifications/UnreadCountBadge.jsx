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
      __('Project Board has %d unread notifications', 'alpaca-issue-tracker'),
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

  const srLabel = sprintf(
    /* translators: %d is the number of unread inbox notifications. */
    __('%d unread notifications', 'alpaca-issue-tracker'),
    normalizedCount,
  );

  if ('inline' === variant) {
    return (
      <span
        className="alpaca-inline-badge"
        aria-live="polite"
        aria-atomic="true"
      >
        <span aria-hidden="true">{normalizedCount}</span>
        <span className="screen-reader-text">{srLabel}</span>
      </span>
    );
  }

  return (
    <span
      className="alpaca-inbox-trigger-badge"
      aria-live="polite"
      aria-atomic="true"
    >
      <span aria-hidden="true">{normalizedCount}</span>
      <span className="screen-reader-text">{srLabel}</span>
    </span>
  );
}

UnreadCountBadge.propTypes = {
  count: PropTypes.number,
  variant: PropTypes.oneOf(['inbox-trigger', 'admin-menu', 'inline']),
};

UnreadCountBadge.defaultProps = {
  count: 0,
  variant: 'inbox-trigger',
};

export default UnreadCountBadge;
