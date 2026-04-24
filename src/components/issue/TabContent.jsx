const { memo } = wp.element;
const { applyFilters } = wp.hooks;
import Commenting from '../Comment';

export const getDefaultIssueTabContent = ({
  tab,
  issueId,
  activeSearchQuery,
  commentRefreshKey,
  showNotification,
}) => {
  switch (tab.name) {
    case 'comments':
      return (
        <Commenting
          issueId={issueId}
          activeSearchQuery={activeSearchQuery}
          commentRefreshKey={commentRefreshKey}
          showNotification={showNotification}
        />
      );
    default:
      return null;
  }
};

const TabContent = memo(
  ({
    tab,
    issueDetails,
    issueId,
    activeSearchQuery,
    commentRefreshKey,
    showNotification,
  }) => {
    const context = {
      tab,
      issueDetails,
      issueId,
      activeSearchQuery,
      commentRefreshKey,
      showNotification,
    };

    return applyFilters(
      'alpaca.issue.tabContent',
      getDefaultIssueTabContent(context),
      context,
    );
  },
);

export default TabContent;
