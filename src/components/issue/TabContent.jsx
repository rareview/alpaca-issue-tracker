const { memo } = wp.element;
import Commenting from '../Comment';
import JsonTable from './JsonTable';
import ReportTab from './ReportTab';
import ErrorsTab from './ErrorsTab';
import AgenticHistoryTab from './AgenticHistoryTab';

const TabContent = memo(
  ({
    tab,
    issueDetails,
    issueId,
    searchScopeIssueIds,
    activeSearchQuery,
    commentRefreshKey,
    showNotification,
  }) => {
    switch (tab.name) {
      case 'comments':
        return (
          <Commenting
            issueId={issueId}
            issueTitle={
              issueDetails?.post_data?.post_title ||
              issueDetails?.post_data?.post_content ||
              ''
            }
            issueSlug={
              issueDetails?.slug || issueDetails?.post_data?.post_name || ''
            }
            activeSearchQuery={activeSearchQuery}
            commentRefreshKey={commentRefreshKey}
            searchScopeIssueIds={searchScopeIssueIds}
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
      case 'jserrors':
        return (
          <ErrorsTab
            errorsJson={
              issueDetails.meta.alpaca_errors || issueDetails.meta.errors
            }
          />
        );
      case 'agentic':
        return (
          <AgenticHistoryTab issueId={issueId} issueDetails={issueDetails} />
        );
      default:
        return null;
    }
  },
);

export default TabContent;
