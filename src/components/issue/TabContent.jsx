const { memo } = wp.element;
import AlpacaCommenting from "../commenting.jsx";
import JsonTable from "./JsonTable";
import ReportTab from "./ReportTab";

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
      case "comments":
        return (
          <AlpacaCommenting
            issueId={issueId}
            commentRefreshKey={commentRefreshKey}
          />
        );
      case "report":
        return (
          <ReportTab
            issueDetails={issueDetails}
            onScreenshotDelete={onScreenshotDelete}
            isLoading={loadingStates.screenshot}
            onScreenshotClick={onScreenshotClick}
          />
        );
      case "queriedobject":
        return <JsonTable data={issueDetails.meta.queriedObject} />;
      case "headers":
        return <JsonTable data={issueDetails.meta.headers} />;
      case "jserrors":
        return null;
      default:
        return null;
    }
  }
);

export default TabContent;
