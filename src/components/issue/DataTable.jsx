const { memo, useEffect, useRef } = wp.element;
const { __ } = wp.i18n;
import PropTypes from 'prop-types';
import { highlightTableCells } from '../../utils/syntaxHighlight';
import registerKeyValueLanguage from '../../utils/prismKeyValue';
import { isValidHttpUrl } from '../../utils/sanitize';

/**
 * Unified data table component with syntax highlighting support.
 * Consolidates functionality from ReportTab and JsonTable.
 *
 * @param {Object}        root0                        - Props object
 * @param {Object|string} root0.data                   - Data to display (object or JSON string)
 * @param {Array}         root0.fields                 - Optional array of specific fields to display
 * @param {boolean}       root0.showSyntaxHighlighting - Whether to apply syntax highlighting (default: true)
 * @return {JSX.Element} DataTable component
 */
const DataTable = memo(
  ({ data, fields = null, showSyntaxHighlighting = true }) => {
    const tableRef = useRef(null);

    // Register custom Prism language on mount
    useEffect(() => {
      registerKeyValueLanguage();
    }, []);

    // Apply syntax highlighting after render
    useEffect(() => {
      if (!showSyntaxHighlighting || !tableRef.current) return;

      const timeoutId = setTimeout(() => {
        highlightTableCells(tableRef.current);

        const urlCells = tableRef.current.querySelectorAll('code.language-uri');
        urlCells.forEach((codeEl) => {
          const url = codeEl.textContent;
          if (url && isValidHttpUrl(url)) {
            codeEl.style.cursor = 'pointer';
            codeEl.addEventListener('click', () => {
              window.open(url, '_blank', 'noopener,noreferrer');
            });
          }
        });
      }, 0);

      return () => clearTimeout(timeoutId);
    }, [data, showSyntaxHighlighting]);

    if (!data) return null;

    let parsedData;
    try {
      if (typeof data === 'string') {
        if (data === 'null' || data === '') return null;
        parsedData = JSON.parse(data);
      } else {
        parsedData = data;
      }

      if (!parsedData || typeof parsedData !== 'object') {
        return <p>{__('Invalid data format', 'alpaca')}</p>;
      }
    } catch (e) {
      return <p>{__('Error parsing JSON data', 'alpaca')}</p>;
    }

    // Filter fields if specified
    const dataToDisplay = fields
      ? Object.fromEntries(
          fields
            .map((field) => [field, parsedData[field]])
            .filter(([, v]) => v !== undefined),
        )
      : parsedData;

    return (
      <table ref={tableRef} className="alpaca-data-table">
        <tbody>
          {Object.entries(dataToDisplay).map(([key, value]) => {
            // Convert value to string for display
            let displayValue = value;
            if (value === null || value === undefined) {
              displayValue = '';
            } else if (typeof value === 'object') {
              displayValue = JSON.stringify(value);
            } else {
              displayValue = String(value);
            }

            return (
              <tr key={key}>
                <th scope="row">{key}</th>
                <td>{displayValue}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  },
);

DataTable.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  fields: PropTypes.arrayOf(PropTypes.string),
  showSyntaxHighlighting: PropTypes.bool,
};

DataTable.displayName = 'DataTable';

export default DataTable;
