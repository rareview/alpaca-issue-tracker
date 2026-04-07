const { forwardRef, useEffect, useRef, useState } = wp.element;
import PropTypes from 'prop-types';
const { Card, CardBody } = wp.components;
const { Text = wp.components.__experimentalText } = wp.components;
import { useWatchlist } from '../context/WatchlistContext';
import '../utils/itemControls';
import '../utils/itemDatapoints';

/**
 * Normalize an item control into a descriptor object.
 *
 * The `alpaca.item.controls` filter supports either a renderable element or an
 * object descriptor with these properties:
 *
 * - `element`: Renderable control element.
 * - `isActive`: Whether the control should be treated as active before hover.
 * - `isReady`: Whether the control is ready to render at all.
 * - `key`: Stable key used for subscription tracking.
 * - `subscribe`: Optional function that accepts a notify callback and returns
 *   an unsubscribe function.
 *
 * @param {*}      control Raw control value from the filter.
 * @param {number} index   Fallback index for key generation.
 * @return {?Object} Normalized control descriptor.
 */
const normalizeItemControl = (control, index) => {
  if (!control) {
    return null;
  }

  const isDescriptor =
    typeof control === 'object' && control !== null && 'element' in control;
  const element = isDescriptor ? control.element : control;

  if (!element) {
    return null;
  }

  const elementIsActive = Boolean(
    element && element.props && element.props['data-active'] === '1',
  );

  return {
    element,
    isActive: isDescriptor ? Boolean(control.isActive) : elementIsActive,
    isReady: isDescriptor ? control.isReady !== false : true,
    key:
      (isDescriptor && control.key) ||
      (element && element.key) ||
      `alpaca-item-control-${index}`,
    subscribe:
      isDescriptor && typeof control.subscribe === 'function'
        ? control.subscribe
        : null,
  };
};

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
    const [, setControlStateVersion] = useState(0);
    const normalizedItemControlsRef = useRef([]);
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
    // Filters may return either renderable elements or descriptor objects.
    const filteredItemControls = wp.hooks.applyFilters('alpaca.item.controls', [], {
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
    });

    const normalizedItemControls = (
      Array.isArray(filteredItemControls) ? filteredItemControls : []
    )
      .map((control, index) => normalizeItemControl(control, index))
      .filter(Boolean);

    normalizedItemControlsRef.current = normalizedItemControls;

    const controlSubscriptionSignature = normalizedItemControls
      .map((control) => {
        return [
          control.key,
          control.isActive ? '1' : '0',
          control.isReady ? '1' : '0',
          control.subscribe ? '1' : '0',
        ].join(':');
      })
      .join('|');

    useEffect(() => {
      const unsubscribeCallbacks = normalizedItemControlsRef.current
        .map((control) => {
          if (!control.subscribe) {
            return null;
          }

          return control.subscribe(() => {
            setControlStateVersion((version) => version + 1);
          });
        })
        .filter(Boolean);

      return () => {
        unsubscribeCallbacks.forEach((unsubscribe) => {
          unsubscribe();
        });
      };
    }, [controlSubscriptionSignature]);

    // Sort ready controls so active ones appear first.
    const sortedItemControls = normalizedItemControls
      .filter((control) => control.isReady)
      .slice()
      .sort((a, b) => {
        if (a.isActive === b.isActive) {
          return 0;
        }

        return a.isActive ? -1 : 1;
      })
      .map((control) => control.element);

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
