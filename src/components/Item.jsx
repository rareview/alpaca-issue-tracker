const { forwardRef } = wp.element;
import PropTypes from 'prop-types';
import { useWatchlist } from '../context/WatchlistContext';
import User from './User';
import CommentIcon from './icons/CommentIcon';
import CalendarIcon from './icons/CalendarIcon';

/**
 * Item component displayed in board containers.
 *
 * @param {Object}   root0              - Props object
 * @param {number}   root0.id           - Item ID
 * @param {string}   root0.content      - Item content text
 * @param {Array}    root0.assignees    - Array of assignees
 * @param {number}   root0.commentCount - Number of comments
 * @param {Object}   root0.meta         - Metadata object
 * @param {string}   root0.className    - CSS class name
 * @param {Object}   root0.style        - Inline styles
 * @param {Function} root0.onClick      - Click handler
 * @param {Object}   root0.props        - Additional props
 * @param {Object}   ref                - Forwarded ref
 * @return {JSX.Element} Item component
 */
const Item = forwardRef(
  (
    {
      id,
      content,
      assignees = [],
      commentCount,
      meta,
      className,
      style,
      onClick,
      ...props
    },
    ref,
  ) => {
    const { isWatched, toggleWatch } = useWatchlist();
    const watched = isWatched(id);

    const assigneeDataAttributes = assignees.reduce((acc, assignee) => {
      if (assignee && assignee.id) {
        acc[`data-assignee-${assignee.id}`] = '';
      }
      return acc;
    }, {});

    const watchedClass = watched ? 'is-watched item-highlight' : '';

    const deadline =
      meta && meta.deadline && meta.deadline[0]
        ? new Date(meta.deadline[0])
        : null;
    const isValidDeadline = deadline && !isNaN(deadline);

    const deadlineFormatted = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(deadline);

    let diffDays = null;
    if (isValidDeadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    }

    const lateClass = diffDays < 0 ? 'is-late' : '';

    // Format deadline display text
    let deadlineText = deadlineFormatted;
    if (isValidDeadline) {
      if (diffDays === 1) {
        deadlineText = 'Tomorrow';
      } else if (diffDays === 0) {
        deadlineText = 'Today';
      } else if (diffDays === -1) {
        deadlineText = 'Yesterday';
      }
    }

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        ref={ref}
        className={`${className} ${watchedClass} ${lateClass}`.trim()}
        style={style}
        data-id={id}
        data-days-left={diffDays}
        {...assigneeDataAttributes}
        {...props}
        onClick={onClick}
      >
        <div className="alpaca-item-upper">
          <div className="alpaca-item-content">{content}</div>
          <div className="alpaca-item-controls">
            <div
              className="dashicons dashicons-star-filled"
              onClick={(e) => {
                e.stopPropagation();
                toggleWatch(id);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  toggleWatch(id);
                }
              }}
            />
          </div>
        </div>
        <div className="alpaca-item-meta flexalign">
          {assignees.length > 0 && (
            <div
              className="alpaca-item-assignees flexalign"
              data-assignees={assignees.length}
              title={
                assignees.length === 1
                  ? assignees[0].displayName || assignees[0].name
                  : assignees.map((a) => a.displayName || a.name).join(', ')
              }
            >
              {assignees.map((assignee) => (
                <User key={assignee.id} user={assignee} />
              ))}
            </div>
          )}

          {typeof commentCount !== 'undefined' && commentCount > 0 && (
            <div className="alpaca-item-icon alpaca-item-comment-count flexalign">
              <CommentIcon />
              {commentCount}
            </div>
          )}

          {wp.hooks.applyFilters('alpaca.item.datapoints', null, { id, meta })}

          {isValidDeadline && (
            <div className="alpaca-item-icon alpaca-item-deadline flexalign">
              <CalendarIcon />
              {deadlineText}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Item.propTypes = {
  id: PropTypes.number.isRequired,
  content: PropTypes.string.isRequired,
  assignees: PropTypes.arrayOf(PropTypes.object),
  commentCount: PropTypes.number,
  meta: PropTypes.object,
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

export default Item;
