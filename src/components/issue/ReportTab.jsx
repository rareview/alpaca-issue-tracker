const { memo, useEffect, useRef } = wp.element;
const { __, sprintf } = wp.i18n;
import PropTypes from 'prop-types';
import { highlightTableCells } from '../../utils/syntaxHighlight';
import { isValidHttpUrl } from '../../utils/sanitize';
import { formatWpDateValue, parseWpDateValue } from '../../utils/date';

const datesettings = wp.date.getSettings();

/**
 * Format a date with an explicit UTC offset suffix.
 *
 * @param {Date} value Date value.
 * @return {string} Formatted date and offset label.
 */
const formatDateTimeWithUtcOffset = (value) => {
  const formattedDate = formatWpDateValue(
    value,
    datesettings.formats.datetimeAbbreviated,
  );
  let offset = formatWpDateValue(value, 'P');

  if (!offset) {
    return formattedDate;
  }

  if ('Z' === offset) {
    offset = '+00:00';
  }

  /* translators: 1: formatted date/time. 2: UTC offset, e.g. +02:00. */
  return sprintf(__('%1$s (UTC%2$s)', 'alpaca'), formattedDate, offset);
};

/**
 * Convert a taxonomy slug into a readable fallback label.
 *
 * @param {string} taxonomy Taxonomy slug.
 * @return {string} Human-readable taxonomy label.
 */
function getTaxonomyFallbackLabel(taxonomy) {
  return taxonomy
    .replace(/^alpaca_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * ReportTab component for displaying issue report information.
 *
 * @param {Object} root0              - Props object
 * @param {Object} root0.issueDetails - Issue details object
 * @return {JSX.Element} ReportTab component
 */
const ReportTab = memo(({ issueDetails }) => {
  const tableRef = useRef(null);
  const urlCellRef = useRef(null);
  const reportedDateRawValue =
    issueDetails?.post_data?.post_date_gmt ||
    issueDetails?.post_data?.post_date;
  const lastEditedDateRawValue =
    issueDetails?.post_data?.post_modified_gmt ||
    issueDetails?.post_data?.post_modified;
  const reportedDate = parseWpDateValue(reportedDateRawValue, {
    treatMysqlAsUtc: Boolean(issueDetails?.post_data?.post_date_gmt),
  });
  const lastEditedDate = parseWpDateValue(lastEditedDateRawValue, {
    treatMysqlAsUtc: Boolean(issueDetails?.post_data?.post_modified_gmt),
  });

  const urlValue = issueDetails.meta.alpaca_url || issueDetails.meta.URL;
  const taxonomyLabels = issueDetails.taxonomy_labels || {};

  // Apply syntax highlighting to table cells after render
  useEffect(() => {
    if (!tableRef.current) return;

    const timeoutId = setTimeout(() => {
      highlightTableCells(tableRef.current);

      // Make highlighted URLs clickable
      if (urlValue && isValidHttpUrl(urlValue) && urlCellRef.current) {
        const codeEl = urlCellRef.current.querySelector('code.language-uri');
        if (codeEl) {
          codeEl.style.cursor = 'pointer';
          codeEl.addEventListener('click', () => {
            window.open(urlValue, '_blank', 'noopener,noreferrer');
          });
        }
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [issueDetails, urlValue]);

  return (
    <div className="alpaca-report-tab alpaca-data-table-context">
      <table ref={tableRef} className="alpaca-data-table">
        <tbody>
          <tr>
            <th scope="row">{__('Reported', 'alpaca')}</th>
            <td>
              {reportedDate
                ? formatDateTimeWithUtcOffset(reportedDate)
                : __('N/A', 'alpaca')}
            </td>
          </tr>
          <tr>
            <th scope="row">{__('Last edit', 'alpaca')}</th>
            <td>
              {lastEditedDate
                ? formatDateTimeWithUtcOffset(lastEditedDate)
                : __('N/A', 'alpaca')}
            </td>
          </tr>
          <tr>
            <th scope="row">{__('URL', 'alpaca')}</th>
            <td ref={urlCellRef} className="alpaca-highlight-allowed">
              {urlValue ? urlValue : __('N/A', 'alpaca')}
            </td>
          </tr>
          <tr>
            <th scope="row">{__('Screen', 'alpaca')}</th>
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
                : __('N/A', 'alpaca')}
            </td>
          </tr>
          {Object.entries(issueDetails.taxonomies)
            .filter(([taxonomy]) => taxonomy !== 'assignee')
            .map(([taxonomy, terms]) => (
              <tr key={taxonomy}>
                <th>
                  {taxonomyLabels[taxonomy] ||
                    getTaxonomyFallbackLabel(taxonomy)}
                </th>
                <td>{terms.map((term) => term.name).join(', ')}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
});

ReportTab.propTypes = {
  issueDetails: PropTypes.object.isRequired,
};

ReportTab.displayName = 'ReportTab';

export default ReportTab;
