const { memo } = wp.element;
const { __ } = wp.i18n;
import PropTypes from 'prop-types';

const { date } = wp;
const datesettings = wp.date.getSettings();

/**
 * ReportTab component for displaying issue report information.
 *
 * @param {Object} root0              - Props object
 * @param {Object} root0.issueDetails - Issue details object
 * @return {JSX.Element} ReportTab component
 */
const ReportTab = memo(({ issueDetails }) => (
  <div className="alpaca-report-tab">
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
));

ReportTab.propTypes = {
  issueDetails: PropTypes.object.isRequired,
};

ReportTab.displayName = 'ReportTab';

export default ReportTab;
