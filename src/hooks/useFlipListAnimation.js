const { useRef, useState, useLayoutEffect, createRef } = wp.element;

import {
  applyFlipAnimation,
  captureBoundingBoxes,
  waitForNextPaint,
  waitForTransformTransitionsByIds,
} from '../utils/flipAnimation';

/**
 * Manage FLIP animations for a list of items keyed by `item.id`.
 *
 * @param {Array<Object>} items      Current ordered item list.
 * @param {number}        durationMs Transition duration in milliseconds.
 * @param {string}        easing     Transition easing value.
 * @return {Object} Hook API.
 */
function useFlipListAnimation(
  items,
  durationMs = 300,
  easing = 'ease-out',
) {
  const itemRefs = useRef({});
  const isAnimatingRef = useRef(false);
  const [boundingBoxes, setBoundingBoxes] = useState({});
  const prevItemsRef = useRef(items);

  items.forEach((item) => {
    if (!itemRefs.current[item.id]) {
      itemRefs.current[item.id] = createRef();
    }
  });

  useLayoutEffect(() => {
    const prevItems = prevItemsRef.current;
    const newBoxes = captureBoundingBoxes(prevItems, itemRefs.current);
    setBoundingBoxes(newBoxes);
    prevItemsRef.current = items;
  }, [items]);

  useLayoutEffect(() => {
    if (!isAnimatingRef.current) {
      return;
    }

    applyFlipAnimation(
      items,
      boundingBoxes,
      itemRefs.current,
      durationMs,
      easing,
    );
  }, [boundingBoxes, durationMs, easing, items]);

  /**
   * Mark the next reorder update as FLIP-animated.
   *
   * @return {void}
   */
  const startAnimation = () => {
    isAnimatingRef.current = true;
  };

  /**
   * Stop FLIP animation mode.
   *
   * @return {void}
   */
  const stopAnimation = () => {
    isAnimatingRef.current = false;
  };

  /**
   * Wait for transitions to finish on a subset of items.
   *
   * @param {Array<number|string>} itemIds Item IDs expected to animate.
   * @return {Promise<void>} Resolves when all target transitions settle.
   */
  const waitForTransitions = async (itemIds) => {
    await waitForNextPaint();
    await waitForTransformTransitionsByIds(
      itemIds,
      itemRefs.current,
      durationMs,
    );
  };

  return {
    itemRefs,
    startAnimation,
    stopAnimation,
    waitForTransitions,
    isAnimatingRef,
  };
}

export default useFlipListAnimation;
