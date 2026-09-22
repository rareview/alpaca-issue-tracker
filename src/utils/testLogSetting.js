/**
 * Check whether browser test logging is enabled from localized settings.
 *
 * @return {boolean} True when test logging is enabled.
 */
export const isTestLoggingEnabled = () => {
  if (
    typeof window === 'undefined' ||
    !window.alpaistrSettings ||
    typeof window.alpaistrSettings !== 'object'
  ) {
    return false;
  }

  const value = window.alpaistrSettings.enableTestLogs;

  return value === true || value === 1 || value === '1';
};
