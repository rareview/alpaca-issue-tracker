const { forwardRef } = wp.element;
import PropTypes from 'prop-types';
const { Card, CardBody } = wp.components;
const { Text = wp.components.__experimentalText } = wp.components;
import { useWatchlist } from '../context/WatchlistContext';
import '../utils/itemControls';
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

    // Allow third-party code to inject additional `data-` attributes
    // via the `alpaca.item.card.dataAttributes` filter. The default
    // value is an empty object; a filter registered elsewhere (for
    // example to add `data-assignee-*`) will supply defaults.
    const extraDataAttributes = wp.hooks.applyFilters(
      'alpaca.item.card.dataAttributes',
      {},
      {
        id,
        content,
        meta,
        postDate,
        assignees,
        labels,
        commentCount,
        commentCountByAgent,
        watched,
      },
    );

    const watchedClass = watched ? 'is-watched item-highlight' : '';

    const handleWatchToggle = (event) => {
      event.stopPropagation();
      toggleWatch(id);
    };

    // Allow third-party code to add controls via `alpaca.item.controls`.
    // Filters should return an array of renderable elements.
    const filteredItemControls = wp.hooks.applyFilters(
      'alpaca.item.controls',
      [],
      {
        id,
        content,
        meta,
        postDate,
        assignees,
        labels,
        commentCount,
        commentCountByAgent,
        watched,
        loading,
        onWatchToggle: handleWatchToggle,
      },
    );

    const itemControls = Array.isArray(filteredItemControls)
      ? filteredItemControls
      : [];

    // Sort controls so active ones (marked with data-active="1") appear first.
    const sortedItemControls = itemControls.slice().sort((a, b) => {
      const aActive = Boolean(a && a.props && a.props['data-active'] === '1');
      const bActive = Boolean(b && b.props && b.props['data-active'] === '1');

      // Active controls should come before inactive.
      if (aActive === bActive) return 0;
      return aActive ? -1 : 1;
    });

    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <Card
        ref={ref}
        className={`${className} ${watchedClass} `.trim()}
        style={style}
        {...extraDataAttributes}
        {...props}
        onClick={onClick}
      >
        <CardBody size="xSmall">
          <div className="alpaca-item-layout">
            <div className="alpaca-item-main">
              <div className="alpaca-item-content">
                <Text>{content}</Text>
              </div>
              <div className="alpaca-item-datapoints flexalign">
                {wp.hooks.applyFilters('alpaca.item.datapoints', null, {
                  id,
                  title: content,
                  content,
                  meta,
                  postDate,
                  assignees,
                  labels,
                  commentCount,
                  commentCountByAgent,
                })}
              </div>
            </div>
            <div className="alpaca-item-controls">{sortedItemControls}</div>
          </div>
        </CardBody>
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
