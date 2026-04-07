import StarControl from '../components/StarControl';

/**
 * Add the default watchlist star control to item controls.
 *
 * @param {Array<JSX.Element>} controls  Existing controls from the hook chain.
 * @param {Object}             itemProps Item props and control state.
 * @return {Array<JSX.Element>} Updated controls list.
 */
export const addWatchlistStarControl = (controls, itemProps) => {
  if (typeof itemProps?.onWatchToggle !== 'function') {
    return controls;
  }

  const nextControls = Array.isArray(controls) ? [...controls] : [];

  nextControls.push(
    <StarControl
      key="watchlist-star-control"
      watched={Boolean(itemProps?.watched)}
      onToggle={itemProps.onWatchToggle}
      disabled={Boolean(itemProps?.loading)}
    />,
  );

  return nextControls;
};

wp.hooks.addFilter(
  'alpaca.item.controls',
  'alpaca/item/watchlist-star-control',
  addWatchlistStarControl,
);
