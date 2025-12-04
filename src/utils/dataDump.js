/**
 * Alpaca Data Dump - Device & Error Tracking
 *
 * Captures device information and JavaScript errors for issue reporting.
 */

/* global bowser */

// Wait for bowser library to be available
if (typeof bowser === 'undefined') {
  console.error('Alpaca: bowser library not loaded');
} else {
  // Parse user agent
  const b = bowser.parse(window.navigator.userAgent);

  // Create global alpaca_data object
  window.alpaca_data = {
    env: window.alpacaDataDump?.env || '',
    raw: window.alpacaDataDump?.raw || {},
    device: {
      browser: {
        name: b.browser.name,
        version: b.browser.version,
        width: window.innerWidth,
        height: window.innerHeight,
      },
      vendor: b.platform.vendor,
      model: b.platform.model,
      type: b.platform.type,
      os: b.os.name,
      version: b.os.version,
      versionName: b.os.versionName,
    },
    errors: [],
  };

  // Track window resize events
  window.addEventListener('resize', function () {
    window.alpaca_data.device.browser.width = window.innerWidth;
    window.alpaca_data.device.browser.height = window.innerHeight;
  });

  // Catch uncaught JavaScript runtime errors
  window.addEventListener('error', function (event) {
    const errorDetails = {
      type: 'error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    };
    if (event.error && event.error.stack) {
      errorDetails.stack = event.error.stack;
    }
    window.alpaca_data.errors.push(errorDetails);
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', function (event) {
    const errorDetails = {
      type: 'unhandledrejection',
      message:
        event.reason && event.reason.message
          ? event.reason.message
          : String(event.reason),
      stack: event.reason && event.reason.stack ? event.reason.stack : null,
    };
    window.alpaca_data.errors.push(errorDetails);
  });

  // Capture console.error calls
  const origConsoleError = console.error;
  console.error = function (...args) {
    window.alpaca_data.errors.push({
      type: 'console.error',
      message: args
        .map((a) => (a instanceof Error ? a.message : String(a)))
        .join(' '),
      stack: args.find((a) => a instanceof Error)?.stack || null,
    });
    origConsoleError.apply(console, args);
  };
}
