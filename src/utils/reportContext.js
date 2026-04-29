const REPORT_CONTEXT_PATH = '/alpaca/v1/report-context';

let reportContextPromise = null;

/**
 * Get the shared client-side report context object.
 *
 * @return {Object} Mutable report context object.
 */
export const getAlpacaReportContext = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  if (!window.alpacaDataDump) {
    window.alpacaDataDump = {};
  }

  return window.alpacaDataDump;
};

/**
 * Ensure the server-side report context has been loaded.
 *
 * @return {Promise<Object>} Report context object.
 */
export const ensureAlpacaReportContext = async () => {
  const currentContext = getAlpacaReportContext();

  if (currentContext.env) {
    return currentContext;
  }

  if (reportContextPromise) {
    return reportContextPromise;
  }

  reportContextPromise = wp
    .apiFetch({ path: REPORT_CONTEXT_PATH })
    .then((response) => {
      const nextContext = getAlpacaReportContext();
      Object.assign(nextContext, response);

      if (!Array.isArray(nextContext.errors)) {
        nextContext.errors = [];
      }

      return nextContext;
    })
    .catch((error) => {
      reportContextPromise = null;
      throw error;
    });

  return reportContextPromise;
};
