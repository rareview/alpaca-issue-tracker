/**
 * Build the extension context for container menu control hooks.
 *
 * @param {Object} context Source context values.
 * @return {Object} Hook context.
 */
export const buildContainerMenuControlContext = (context) => {
  const items = Array.isArray(context?.items) ? context.items : [];
  const visibleItemEntries = Array.isArray(context?.visibleItemEntries)
    ? context.visibleItemEntries
    : [];

  return {
    ...context,
    items,
    visibleItemEntries,
    visibleItems: visibleItemEntries.map((entry) => entry.item),
    isFiltering: context?.isFiltering === true,
    areBulkActionsDisabled: context?.areBulkActionsDisabled === true,
  };
};
