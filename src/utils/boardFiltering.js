/**
 * Determine whether bulk container actions should be disabled.
 *
 * @param {Object}  root0             - Helper arguments.
 * @param {boolean} root0.hasItems    - Whether the container has any items.
 * @param {boolean} root0.isFiltering - Whether a board filter is active.
 * @return {boolean} True when bulk actions should be disabled.
 */
function shouldDisableBulkContainerActions({ hasItems, isFiltering }) {
  return !hasItems || isFiltering;
}

/**
 * Convert a filtered visible drop slot into an absolute insertion index.
 *
 * @param {Object}  root0                    - Helper arguments.
 * @param {number}  root0.visibleDropIndex   - Drop index among visible rows.
 * @param {Array}   root0.visibleItemEntries - Visible item entries with actualIndex.
 * @param {number}  root0.itemsLength        - Total item count in the list.
 * @param {boolean} root0.isFiltering        - Whether a board filter is active.
 * @return {number} Absolute insertion index in the full list.
 */
function getAbsoluteDropIndexForFilteredContainer({
  visibleDropIndex,
  visibleItemEntries,
  itemsLength,
  isFiltering,
}) {
  if (!isFiltering) {
    return Math.max(0, Math.min(itemsLength, visibleDropIndex));
  }

  if (!Array.isArray(visibleItemEntries) || visibleItemEntries.length < 1) {
    return 0;
  }

  if (visibleDropIndex <= 0) {
    return visibleItemEntries[0].actualIndex;
  }

  if (visibleDropIndex >= visibleItemEntries.length) {
    return visibleItemEntries[visibleItemEntries.length - 1].actualIndex + 1;
  }

  return visibleItemEntries[visibleDropIndex].actualIndex;
}

/**
 * Build the board order payload from React state rather than the DOM.
 *
 * @param {Array} containers - Container state.
 * @return {Array} Serialized payload for the board save endpoint.
 */
function buildBoardOrderPayload(containers) {
  if (!Array.isArray(containers)) {
    return [];
  }

  return containers.map((container) => {
    const items = Array.isArray(container.items) ? container.items : [];

    return {
      id: parseInt(container.id, 10),
      title: typeof container.title === 'string' ? container.title : '',
      issues: items
        .map((item) => parseInt(item.id, 10))
        .filter(Number.isInteger),
    };
  });
}

/**
 * Reorder only the visible filtered items while preserving hidden item slots.
 *
 * @param {Object}   root0                         - Helper arguments.
 * @param {Array}    root0.items                   - Full item list.
 * @param {number}   root0.sourceIndex             - Actual source index in the full list.
 * @param {number}   root0.destinationVisibleIndex - Destination index among visible filtered items.
 * @param {Object}   root0.activeFilter            - Current active filter.
 * @param {Function} root0.itemMatchesFilter       - Visibility matcher.
 * @return {Array} Reordered full item list.
 */
function reorderItemsWithinFilteredSlots({
  items,
  sourceIndex,
  destinationVisibleIndex,
  activeFilter,
  itemMatchesFilter,
}) {
  if (!Array.isArray(items)) {
    return [];
  }

  if (
    !Number.isInteger(sourceIndex) ||
    sourceIndex < 0 ||
    sourceIndex >= items.length ||
    typeof itemMatchesFilter !== 'function'
  ) {
    return Array.from(items);
  }

  const visibleEntries = items.reduce((accumulator, item, index) => {
    if (itemMatchesFilter(item, activeFilter)) {
      accumulator.push({ item, index });
    }

    return accumulator;
  }, []);

  const sourceVisibleIndex = visibleEntries.findIndex(
    (entry) => entry.index === sourceIndex,
  );

  if (sourceVisibleIndex === -1) {
    return Array.from(items);
  }

  const visibleItems = visibleEntries.map((entry) => entry.item);
  const reorderedVisibleItems = Array.from(visibleItems);
  const [movedVisibleItem] = reorderedVisibleItems.splice(
    sourceVisibleIndex,
    1,
  );
  const clampedDestinationIndex = Number.isInteger(destinationVisibleIndex)
    ? Math.max(
        0,
        Math.min(reorderedVisibleItems.length, destinationVisibleIndex),
      )
    : reorderedVisibleItems.length;

  reorderedVisibleItems.splice(clampedDestinationIndex, 0, movedVisibleItem);

  let visiblePointer = 0;

  return items.map((item) => {
    if (!itemMatchesFilter(item, activeFilter)) {
      return item;
    }

    const reorderedItem = reorderedVisibleItems[visiblePointer];
    visiblePointer += 1;
    return reorderedItem;
  });
}

module.exports = {
  buildBoardOrderPayload,
  getAbsoluteDropIndexForFilteredContainer,
  reorderItemsWithinFilteredSlots,
  shouldDisableBulkContainerActions,
};
