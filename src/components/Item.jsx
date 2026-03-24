const { forwardRef } = wp.element;
import PropTypes from 'prop-types';
const { Card, CardBody, CardFooter } = wp.components;
const { Text = wp.components.__experimentalText } = wp.components;
import { useWatchlist } from '../context/WatchlistContext';
import StarControl from './StarControl';
import '../utils/itemDatapoints';

/**
 * Item component displayed in board containers.
 *
 * @param {Object}   root0                     - Props object
 * @param {number}   root0.id                  - Item ID
 * @param {string|*} root0.content             - Item content text or inline markup
 * @param {Array}    root0.assignees           - Array of assignees
 * @param {Array}    root0.labels              - Array of labels
 * @param {number}   root0.commentCount        - Number of comments
 * @param {Object}   root0.commentCountByAgent - Comment counts by agent type
 * @param {Object}   root0.meta                - Metadata object
 * @param {string}   root0.postDate            - Post creation date
 * @param {string}   root0.className           - CSS class name
 * @param {Object}   root0.style               - Inline styles
 * @param {Function} root0.onClick             - Click handler
 * @param {Object}   root0.props               - Additional props
 * @param {Object}   ref                       - Forwarded ref
 * @return {JSX.Element} Item component
 */
const Item = forwardRef(
  (
    {
      id,
      content,
      assignees = [],
      labels = [],
      commentCount,
      commentCountByAgent,
      meta,
      postDate,
      className,
      style,
      onClick,
      ...props
    },
    ref,
  ) => {
    const { isWatched, toggleWatch, loading } = useWatchlist();
    const watched = isWatched(id);

    const assigneeDataAttributes = assignees.reduce((acc, assignee) => {
      if (assignee && assignee.id) {
        acc[`data-assignee-${assignee.id}`] = '';
      }
      return acc;
    }, {});

    const watchedClass = watched ? 'is-watched item-highlight' : '';

    const handleWatchToggle = (event) => {
      event.stopPropagation();
      toggleWatch(id);
    };

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
              <StarControl
                watched={watched}
                onToggle={handleWatchToggle}
                disabled={loading}
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
              labels,
              commentCount,
              commentCountByAgent,
            })}
          </div>
        </CardFooter>
      </Card>
    );
  },
);

Item.propTypes = {
  id: PropTypes.number.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  assignees: PropTypes.arrayOf(PropTypes.object),
  labels: PropTypes.arrayOf(PropTypes.object),
  commentCount: PropTypes.number,
  commentCountByAgent: PropTypes.object,
  meta: PropTypes.object,
  postDate: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func,
};

export default Item;
