/**
 * Utility to remove any leftover drag clone elements from the DOM.
 */
export function removeDragClone() {
  const clones = document.querySelectorAll('.alpaca-drag-clone');
  clones.forEach((clone) => {
    try {
      clone.parentNode.removeChild(clone);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('removeDragClone: Failed to remove clone', err);
    }
  });
}
