const { memo } = wp.element;
import PropTypes from 'prop-types';

const { Button } = wp.components;

const { date } = wp;
const datesettings = wp.date.getSettings();

/**
 * ReportTab component for displaying issue report information.
 *
 * @param {Object}   root0                    - Props object
 * @param {Object}   root0.issueDetails       - Issue details object
 * @param {Function} root0.onScreenshotDelete - Screenshot delete handler
 * @param {boolean}  root0.isLoading          - Loading state
 * @param {Function} root0.onScreenshotClick  - Screenshot click handler
 * @return {JSX.Element} ReportTab component
 */
const ReportTab = memo(
  ({ issueDetails, onScreenshotDelete, isLoading, onScreenshotClick }) => (
    <div className="alpaca-report-tab">
      {(issueDetails.meta.alpaca_screenshot ||
        issueDetails.meta.screenshot) && (
        <div className="alpaca-screenshot-wrapper">
          {/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */}
          <img
            src={
              issueDetails.meta.alpaca_screenshot ||
              issueDetails.meta.screenshot
            }
            className="alpaca-screenshot"
            alt="Screenshot"
            style={{ cursor: 'zoom-in', maxWidth: '100%' }}
            onClick={() =>
              onScreenshotClick(
                issueDetails.meta.alpaca_screenshot ||
                  issueDetails.meta.screenshot,
              )
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onScreenshotClick(
                  issueDetails.meta.alpaca_screenshot ||
                    issueDetails.meta.screenshot,
                );
              }
            }}
          />
          {/* eslint-enable jsx-a11y/no-noninteractive-element-to-interactive-role */}
          <Button
            disabled={isLoading}
            onClick={onScreenshotDelete}
            label="Delete"
            showTooltip="true"
            tooltipPosition="middle left"
            icon="trash"
            isDestructive
            className="alpaca-screenshot-delete"
            variant="primary"
          />
        </div>
      )}

      <table className="widefat striped">
        <tbody>
          <tr>
            <th scope="row">Reported</th>
            <td>
              {date.format(
                datesettings.formats.datetimeAbbreviated,
                new Date(issueDetails.post_data.post_date),
              )}
            </td>
          </tr>
          <tr>
            <th scope="row">Last edit</th>
            <td>
              {date.format(
                datesettings.formats.datetimeAbbreviated,
                new Date(issueDetails.post_data.post_modified),
              )}
            </td>
          </tr>
          <tr>
            <th scope="row">URL</th>
            <td>
              {issueDetails.meta.alpaca_url || issueDetails.meta.URL ? (
                <a
                  href={issueDetails.meta.alpaca_url || issueDetails.meta.URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {issueDetails.meta.alpaca_url || issueDetails.meta.URL}
                </a>
              ) : (
                'N/A'
              )}
            </td>
          </tr>
          <tr>
            <th scope="row">Screen</th>
            <td>
              {(issueDetails.meta.alpaca_screenwidth ||
                issueDetails.meta.screenwidth) &&
              (issueDetails.meta.alpaca_screenheight ||
                issueDetails.meta.screenheight)
                ? `${
                    issueDetails.meta.alpaca_screenwidth ||
                    issueDetails.meta.screenwidth
                  } x ${
                    issueDetails.meta.alpaca_screenheight ||
                    issueDetails.meta.screenheight
                  }`
                : 'N/A'}
            </td>
          </tr>
          {Object.entries(issueDetails.taxonomies)
            .filter(([taxonomy]) => taxonomy !== 'assignee')
            .map(([taxonomy, terms]) => (
              <tr key={taxonomy}>
                <th style={{ textTransform: 'capitalize' }}>{taxonomy}</th>
                <td>{terms.map((term) => term.name).join(', ')}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  ),
);

ReportTab.propTypes = {
  issueDetails: PropTypes.object.isRequired,
  onScreenshotDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onScreenshotClick: PropTypes.func.isRequired,
};

ReportTab.displayName = 'ReportTab';

export default ReportTab;
