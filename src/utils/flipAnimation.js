/**
 * Build a map of item bounding boxes keyed by item ID.
 *
 * @param {Array<Object>} items    Items to measure.
 * @param {Object}        itemRefs Map of React refs keyed by item ID.
 * @return {Object} Bounding box map keyed by item ID.
 */
export function captureBoundingBoxes(items, itemRefs) {
  const boxes = {};

  items.forEach((item) => {
    const ref = itemRefs[item.id];
    if (ref && ref.current) {
      boxes[item.id] = ref.current.getBoundingClientRect();
    }
  });

  return boxes;
}

/**
 * Apply FLIP transform transitions for moved items.
 *
 * @param {Array<Object>} items      Current items after reorder.
 * @param {Object}        oldBoxes   Previous bounding boxes.
 * @param {Object}        itemRefs   Map of React refs keyed by item ID.
 * @param {number}        durationMs Transition duration.
 * @param {string}        easing     Transition easing.
 * @return {void}
 */
export function applyFlipAnimation(
  items,
  oldBoxes,
  itemRefs,
  durationMs,
  easing = 'ease-out',
) {
  items.forEach((item) => {
    const ref = itemRefs[item.id];
    if (!ref || !ref.current) {
      return;
    }

    const newBox = ref.current.getBoundingClientRect();
    const oldBox = oldBoxes[item.id];
    const hasMoved =
      !!oldBox &&
      (oldBox.top !== newBox.top || oldBox.left !== newBox.left);

    if (!hasMoved) {
      return;
    }

    const deltaX = oldBox.left - newBox.left;
    const deltaY = oldBox.top - newBox.top;

    requestAnimationFrame(() => {
      ref.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      ref.current.style.transition = 'transform 0s';

      requestAnimationFrame(() => {
        ref.current.style.transform = '';
        ref.current.style.transition =
          'transform ' + durationMs + 'ms ' + easing;
      });
    });
  });
}

/**
 * Wait for the next browser paint cycle.
 *
 * @return {Promise<void>} Resolves after the next paint.
 */
export function waitForNextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

/**
 * Wait for a transform transition to complete on a specific element.
 *
 * @param {HTMLElement|null} element    Element to watch.
 * @param {number}           durationMs Transition duration in milliseconds.
 * @return {Promise<void>} Resolves when transition ends or timeout occurs.
 */
export function waitForTransformTransition(element, durationMs) {
  return new Promise((resolve) => {
    let transitionTimer = null;
    let isSettled = false;

    const onTransitionEnd = (event) => {
      if (event.propertyName === 'transform') {
        finish();
      }
    };

    const finish = () => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      if (transitionTimer) {
        clearTimeout(transitionTimer);
      }
      if (element) {
        element.removeEventListener('transitionend', onTransitionEnd);
      }
      resolve();
    };

    if (element) {
      element.addEventListener('transitionend', onTransitionEnd);
    }

    transitionTimer = setTimeout(finish, durationMs + 120);
  });
}

/**
 * Wait for transform transitions on multiple items.
 *
 * @param {Array<number|string>} itemIds    Item IDs that should animate.
 * @param {Object}               itemRefs   Map of React refs keyed by item ID.
 * @param {number}               durationMs Transition duration in milliseconds.
 * @return {Promise<void>} Resolves when all watched transitions complete.
 */
export function waitForTransformTransitionsByIds(itemIds, itemRefs, durationMs) {
  return Promise.all(
    itemIds.map((itemId) => {
      const ref = itemRefs[itemId];
      const element = ref && ref.current ? ref.current : null;
      return waitForTransformTransition(element, durationMs);
    }),
  ).then(() => undefined);
}
