const { useMemo, useEffect, useRef } = wp.element;
const { __ } = wp.i18n;
const { decodeEntities } = wp.htmlEntities;
import PropTypes from 'prop-types';
import DataTable from './DataTable';

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
      // eslint-disable-next-line no-console
      console.error('Failed to parse errors JSON:', e);
      return [];
    }
  }, [errorsJson]);

  if (errors.length === 0) {
    return (
      <p>
        {__('No JavaScript errors were recorded for this issue.', 'alpaca-issue-tracker')}
      </p>
    );
  }

  return (
    <div className="alpaca-errors-tab alpaca-data-table-context">
      {errors.map((error, index) => {
        // Remove stack from main object to display it separately
        const { stack, ...errorWithoutStack } = error;
        return (
          <ErrorItem
            key={index}
            index={index}
            error={errorWithoutStack}
            message={error.message}
            stack={stack}
          />
        );
      })}
    </div>
  );
};

/**
 * Individual error item component with syntax highlighting.
 *
 * @param {Object} root0         - Props object
 * @param {number} root0.index   - Error index
 * @param {Object} root0.error   - Error object without stack
 * @param {string} root0.message - Error message
 * @param {string} root0.stack   - Stack trace string
 * @return {JSX.Element} ErrorItem component
 */
const ErrorItem = ({ index, error, message, stack }) => {
  const stackRef = useRef(null);

  // Apply syntax highlighting to stack trace after render
  useEffect(() => {
    if (stack && stackRef.current && window.Prism) {
      const codeEl = stackRef.current.querySelector('code');
      if (codeEl) {
        // Apply Prism highlighting to the code element
        window.Prism.highlightElement(codeEl);
      }
    }
  }, [stack]);

  return (
    <div className="alpaca-error-item">
      <h4>
        Error #{index + 1}: {message}
      </h4>
      <DataTable data={error} showSyntaxHighlighting={true} />
      {stack && (
        <div ref={stackRef} className="alpaca-error-stack">
          <h5>{__('Stack Trace', 'alpaca-issue-tracker')}</h5>
          <pre>
            <code className="language-javascript">{decodeEntities(stack)}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

ErrorItem.propTypes = {
  index: PropTypes.number.isRequired,
  error: PropTypes.object.isRequired,
  message: PropTypes.string.isRequired,
  stack: PropTypes.string,
};

ErrorsTab.propTypes = {
  errorsJson: PropTypes.string,
};

export default ErrorsTab;
