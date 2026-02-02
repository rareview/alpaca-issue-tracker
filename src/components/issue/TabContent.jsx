const { memo } = wp.element;
import Commenting from '../Comment';
import JsonTable from './JsonTable';
import ReportTab from './ReportTab';
import ErrorsTab from './ErrorsTab';

const TabContent = memo(({ tab, issueDetails, issueId, commentRefreshKey }) => {
  switch (tab.name) {
    case 'comments':
      return (
        <Commenting issueId={issueId} commentRefreshKey={commentRefreshKey} />
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
    default:
      return null;
  }
});

export default TabContent;
