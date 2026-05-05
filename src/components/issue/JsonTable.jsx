const { memo } = wp.element;
import PropTypes from 'prop-types';
import DataTable from './DataTable';

/**
 * JsonTable component - wrapper around DataTable for backward compatibility.
 *
 * @param {Object}        root0      - Props object
 * @param {Object|string} root0.data - Data to display (object or JSON string)
 * @return {JSX.Element} JsonTable component
 */
const JsonTable = memo(({ data }) => {
  return (
    <div className="alpaca-json-table alpaca-data-table-context">
      <DataTable data={data} showSyntaxHighlighting={true} />
    </div>
  );
});

JsonTable.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

JsonTable.displayName = 'JsonTable';

export default JsonTable;
