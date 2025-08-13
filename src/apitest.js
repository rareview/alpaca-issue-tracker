// --- Basic API Endpoint Tests ---
// To enable, set ALPACA_RUN_API_TESTS to true below.
// The results will be logged to your browser's developer console when the
// #alpaca-board element is on the page.
// You must be logged in with a user that has 'edit_posts' capabilities.
const ALPACA_RUN_API_TESTS = false;

if (ALPACA_RUN_API_TESTS && document.querySelector("#alpaca-board")) {
  const runApiTests = () => {
    console.log("--- Running Alpaca API Endpoint Tests ---");

    // Helper function for making API requests
    const testEndpoint = (url, options, operation) => {
      // Ensure wpApiSettings is available
      if (
        typeof wpApiSettings === "undefined" ||
        !wpApiSettings.root ||
        !wpApiSettings.nonce
      ) {
        console.error(
          'wpApiSettings is not defined. Make sure "wp-api" is an enqueued dependency.'
        );
        return;
      }

      console.log(`Testing ${operation}...`);
      fetch(url, options)
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(
                `HTTP error! Status: ${response.status}, Body: ${text}`
              );
            });
          }
          return response.json();
        })
        .then((data) => console.log(`✅ ${operation} SUCCESS:`, data))
        .catch((error) =>
          console.error(`❌ ${operation} FAILED:`, error.message)
        );
    };

    const nonceHeader = { "X-WP-Nonce": wpApiSettings.nonce };
    const jsonHeaders = { ...nonceHeader, "Content-Type": "application/json" };

    // Test GET /alpaca/v1/board
    testEndpoint(
      `${wpApiSettings.root}alpaca/v1/board`,
      { method: "GET", headers: nonceHeader },
      "GET /alpaca/v1/board"
    );
  };

  // Wait for the DOM to be fully loaded to ensure wpApiSettings is available.
  document.addEventListener("DOMContentLoaded", runApiTests);
}
