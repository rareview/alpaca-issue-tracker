import JsonTable from './JsonTable';
import PropTypes from 'prop-types';

const { useMemo } = wp.element;
const { decodeEntities } = wp.htmlEntities;

/**
 * ErrorsTab component for displaying error information in a table format.
 *
 * @param {Object} root0            - Props object
 * @param {string} root0.errorsJson - JSON string of errors
 * @return {JSX.Element} ErrorsTab component
 */
const ErrorsTab = ({ errorsJson }) => {
  const errors = useMemo(() => {
    if (!errorsJson || typeof errorsJson !== 'string') return [];
    try {
      const parsed = JSON.parse(errorsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse errors JSON:', e);
      return [];
    }
  }, [errorsJson]);

  if (errors.length === 0) {
    return <p>No JavaScript errors were recorded for this issue.</p>;
  }

  return (
    <div className="alpaca-errors-tab">
      {errors.map((error, index) => {
        // Remove stack from main object to display it separately
        const { stack, ...errorWithoutStack } = error;
        return (
          <div
            key={index}
            className="alpaca-error-item"
            style={{
              marginBottom: '2rem',
              borderBottom: '1px solid #eee',
              paddingBottom: '1rem',
            }}
          >
            <h4>
              Error #{index + 1}: {error.message}
            </h4>
            <JsonTable data={JSON.stringify(errorWithoutStack)} />
            {stack && (
              <div className="alpaca-error-stack" style={{ marginTop: '1rem' }}>
                <h5>Stack Trace</h5>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    background: '#f7f7f7',
                    padding: '1rem',
                    borderRadius: '4px',
                  }}
                >
                  <code>{decodeEntities(stack)}</code>
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

ErrorsTab.propTypes = {
  errorsJson: PropTypes.string,
};

export default ErrorsTab;
