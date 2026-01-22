const { forwardRef } = wp.element;
const { __, sprintf } = wp.i18n;
import PropTypes from 'prop-types';
const { Card, CardBody, CardFooter } = wp.components;
const { Text = wp.components.__experimentalText } = wp.components;
import { useWatchlist } from '../context/WatchlistContext';
import '../utils/itemDatapoints';

/**
 * Item component displayed in board containers.
 *
 * @param {Object}   root0              - Props object
 * @param {number}   root0.id           - Item ID
 * @param {string}   root0.content      - Item content text
 * @param {Array}    root0.assignees    - Array of assignees
 * @param {number}   root0.commentCount - Number of comments
 * @param {Object}   root0.meta         - Metadata object
 * @param {string}   root0.postDate     - Post creation date
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
      postDate,
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

    const lastActivityDateString = meta?.lastActivity || postDate;
    let idleText = null;

    if (lastActivityDateString) {
      const lastActivityDate = new Date(lastActivityDateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastActivityDate.setHours(0, 0, 0, 0);
      const daysIdle = Math.floor(
        (today - lastActivityDate) / (1000 * 60 * 60 * 24),
      );

      if (daysIdle > 0) {
        // translators: %d: Number of days
        idleText = sprintf(__('%dd idle', 'alpaca'), daysIdle);
      }
    }

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <Card
        ref={ref}
        className={`${className} ${watchedClass} `.trim()}
        style={style}
        data-id={id}
        {...assigneeDataAttributes}
        {...props}
        onClick={onClick}
      >
        <CardBody size="xSmall">
          <div className="alpaca-item-upper">
            <div className="alpaca-item-content">
              <Text>{content}</Text>
            </div>
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
        </CardBody>
        <CardFooter size="xSmall" isBorderless>
          <div className="alpaca-item-datapoints flexalign">
            {wp.hooks.applyFilters('alpaca.item.datapoints', null, {
              id,
              meta,
              postDate,
              assignees,
              commentCount,
            })}
          </div>
        </CardFooter>
      </Card>
    );
  },
);

Item.propTypes = {
  id: PropTypes.number.isRequired,
  content: PropTypes.string.isRequired,
  assignees: PropTypes.arrayOf(PropTypes.object),
  commentCount: PropTypes.number,
  meta: PropTypes.object,
  postDate: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

export default Item;
