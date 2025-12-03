const { memo } = wp.element;
import Commenting from '../Comment';
import JsonTable from './JsonTable';
import ReportTab from './ReportTab';

const TabContent = memo(
  ({
    tab,
    issueDetails,
    issueId,
    commentRefreshKey,
    onScreenshotDelete,
    loadingStates,
    onScreenshotClick,
  }) => {
    switch (tab.name) {
      case 'comments':
        return (
          <Commenting issueId={issueId} commentRefreshKey={commentRefreshKey} />
        );
      case 'report':
        return (
          <ReportTab
            issueDetails={issueDetails}
            onScreenshotDelete={onScreenshotDelete}
            isLoading={loadingStates.screenshot}
            onScreenshotClick={onScreenshotClick}
          />
        );
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
        return null;
      default:
        return null;
    }
  },
);

export default TabContent;
