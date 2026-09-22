import StarControl from '../components/StarControl';

/**
 * Add the default watchlist star control to item controls.
 *
 * @param {Array}  controls  Existing controls from the hook chain.
 * @param {Object} itemProps Item props and control state.
 * @return {Array} Updated controls list.
 */
export const addWatchlistStarControl = (controls, itemProps) => {
  if (typeof itemProps?.onWatchToggle !== 'function') {
    return controls;
  }

  const nextControls = Array.isArray(controls) ? [...controls] : [];
  const isWatched = itemProps?.watched === true;

  nextControls.push({
    key: 'watchlist-star-control',
    isActive: isWatched,
    isReady: itemProps?.loading !== true,
    element: (
      <StarControl
        key="watchlist-star-control"
        watched={isWatched}
        data-active={isWatched ? '1' : undefined}
        onToggle={itemProps.onWatchToggle}
        disabled={Boolean(itemProps?.loading)}
      />
    ),
  });

  return nextControls;
};

wp.hooks.addFilter(
  'alpaca.item.controls',
  'alpaca/item/watchlist-star-control',
  addWatchlistStarControl,
);
