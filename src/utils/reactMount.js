/**
 * Create a React mount helper that prefers `createRoot` and falls back to
 * legacy `render` when needed.
 *
 * @param {Object}   root0              Dependencies.
 * @param {Function} root0.createRoot   React root factory.
 * @param {Function} root0.legacyRender Legacy render function.
 * @return {Function} Mount helper.
 */
function createMountReactTree({ createRoot, legacyRender }) {
  const rootsByNode = new WeakMap();

  /**
   * Mount an element into a node.
   *
   * @param {*}       element React element tree.
   * @param {Element} node    Mount target.
   * @return {Object|null} React root when available, otherwise null.
   */
  return function mountReactTree(element, node) {
    if (!node) {
      return null;
    }

    if (typeof createRoot === 'function') {
      let root = rootsByNode.get(node);

      if (!root) {
        root = createRoot(node);
        rootsByNode.set(node, root);
      }

      root.render(element);
      return root;
    }

    if (typeof legacyRender === 'function') {
      legacyRender(element, node);
    }

    return null;
  };
}

module.exports = {
  createMountReactTree,
};
