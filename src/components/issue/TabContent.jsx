const { memo } = wp.element;
const { applyFilters } = wp.hooks;
import Commenting from '../Comment';
import JsonTable from './JsonTable';
import ReportTab from './ReportTab';
import ErrorsTab from './ErrorsTab';

export const getDefaultIssueTabContent = ({
  tab,
  issueDetails,
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
    case 'report':
      return <ReportTab issueDetails={issueDetails} />;
    case 'queriedobject':
      return (
        <JsonTable
          data={
            issueDetails.meta.alpaca_queried_object ||
            issueDetails.meta.queriedObject
          }
        />
      );
    case 'headers':
      return (
        <JsonTable
          data={issueDetails.meta.alpaca_headers || issueDetails.meta.headers}
        />
      );
    case 'errors':
      return (
        <ErrorsTab
          errorsJson={
            issueDetails.meta.alpaca_errors || issueDetails.meta.errors
          }
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
