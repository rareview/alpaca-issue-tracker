/**
 * Alpaca Issue Tracker Data Dump - Device & Error Tracking
 *
 * Captures device information and JavaScript errors for issue reporting.
 */

/* global bowser */

let hasInitializedAlpacaDataDump = false;

export const initializeAlpacaDataDump = () => {
  if (hasInitializedAlpacaDataDump) {
    return;
  }

  hasInitializedAlpacaDataDump = true;

  if (
    typeof window !== 'undefined' &&
    typeof window.alpaistrDataDump === 'undefined'
  ) {
    window.alpaistrDataDump = {};
  }

  const alpaistrDataDump =
    typeof window !== 'undefined' ? window.alpaistrDataDump : undefined;

  // Wait for bowser library to be available
  if (typeof bowser === 'undefined') {
    console.error('Alpaca: bowser library not loaded');
  } else {
    const b = bowser.parse(window.navigator.userAgent);

    if (typeof alpaistrDataDump === 'undefined') {
      console.error('Alpaca: alpaistrDataDump not initialized');
    } else {
      alpaistrDataDump.device = {
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
      };

      alpaistrDataDump.errors = [];

      window.addEventListener('resize', function () {
        alpaistrDataDump.device.browser.width = window.innerWidth;
        alpaistrDataDump.device.browser.height = window.innerHeight;
      });

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
        alpaistrDataDump.errors.push(errorDetails);
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
        alpaistrDataDump.errors.push(errorDetails);
      });

      // Capture console.error calls
      const origConsoleError = console.error;
      console.error = function (...args) {
        alpaistrDataDump.errors.push({
          type: 'console.error',
          message: args
            .map((a) => (a instanceof Error ? a.message : String(a)))
            .join(' '),
          stack: args.find((a) => a instanceof Error)?.stack || null,
        });
        origConsoleError.apply(console, args);
      };
    }
  }
};
