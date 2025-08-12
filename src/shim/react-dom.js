const { render, createPortal } = wp.element;

const unstable_batchedUpdates =
  wp.element.unstable_batchedUpdates ||
  function (fn, ...args) {
    // naive fallback: just call fn synchronously (no batching)
    return fn(...args);
  };

export { render, createPortal, unstable_batchedUpdates };

export default {
  render,
  createPortal,
  unstable_batchedUpdates,
};
