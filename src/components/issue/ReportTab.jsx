const { memo } = wp.element;

const { date } = wp;
const datesettings = wp.date.getSettings();

const ReportTab = memo(
  ({ issueDetails, onScreenshotDelete, isLoading, onScreenshotClick }) => (
    <div className="alpaca-report-tab">
      {issueDetails.meta.screenshot && (
        <div>
          <p>
            <img
              src={issueDetails.meta.screenshot}
              className="alpaca-screenshot"
              alt="Screenshot"
              style={{ cursor: "zoom-in", maxWidth: "100%" }}
              onClick={() => onScreenshotClick(issueDetails.meta.screenshot)}
            />
          </p>
          <p>
            <button
              type="button"
              className="button-link-delete"
              disabled={isLoading}
              onClick={onScreenshotDelete}
            >
              Delete
            </button>
          </p>
        </div>
      )}

      <table className="widefat striped">
        <tbody>
          <tr>
            <th scope="row">Reported</th>
            <td>
              {date.format(
                datesettings.formats.datetimeAbbreviated,
                new Date(issueDetails.post_data.post_date)
              )}
            </td>
          </tr>
          <tr>
            <th scope="row">Last edit</th>
            <td>
              {date.format(
                datesettings.formats.datetimeAbbreviated,
                new Date(issueDetails.post_data.post_modified)
              )}
            </td>
          </tr>
          <tr>
            <th scope="row">URL</th>
            <td>
              {issueDetails.meta.URL ? (
                <a
                  href={issueDetails.meta.URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {issueDetails.meta.URL}
                </a>
              ) : (
                "N/A"
              )}
            </td>
          </tr>
          <tr>
            <th scope="row">Screen</th>
            <td>
              {issueDetails.meta.screenwidth && issueDetails.meta.screenheight
                ? `${issueDetails.meta.screenwidth} x ${issueDetails.meta.screenheight}`
                : "N/A"}
            </td>
          </tr>
          {Object.entries(issueDetails.taxonomies)
            .filter(([taxonomy]) => taxonomy !== "assignee")
            .map(([taxonomy, terms]) => (
              <tr key={taxonomy}>
                <th style={{ textTransform: "capitalize" }}>{taxonomy}</th>
                <td>{terms.map((term) => term.name).join(", ")}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
);

export default ReportTab;
