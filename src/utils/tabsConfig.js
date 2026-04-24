const { __ } = wp.i18n;
const { applyFilters } = wp.hooks;

export const getDefaultTabsConfig = () => {
  return [
    {
      name: 'comments',
      title: __('Timeline', 'alpaca'),
      className: 'comments',
    },
  ];
};

export const getTabsConfig = (issueDetails) => {
  const defaultTabs = getDefaultTabsConfig(issueDetails);
  const filteredTabs = applyFilters('alpaca.issue.tabs', defaultTabs, {
    issueDetails,
  });

  return Array.isArray(filteredTabs) ? filteredTabs : defaultTabs;
};
