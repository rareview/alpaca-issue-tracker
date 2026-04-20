const WORDPRESS_NOT_READY_TEXT = 'WordPress is not ready yet';

/**
 * Return whether a Playground response represents a ready WordPress site.
 *
 * @param {Object} options          Readiness options.
 * @param {number} options.status   HTTP status code.
 * @param {string} options.bodyText Response body.
 * @return {boolean} True when the response indicates WordPress is ready.
 */
export function isWordPressReadyResponse({ status, bodyText }) {
  const isSuccessStatus =
    (status >= 200 && status < 300) || (status >= 300 && status < 400);

  if (!isSuccessStatus) {
    return false;
  }

  return !bodyText.includes(WORDPRESS_NOT_READY_TEXT);
}

/**
 * Wait until Playground stops serving the WordPress bootstrap placeholder.
 *
 * @param {Object}   options                  Readiness options.
 * @param {string}   options.baseUrl          Playground base URL.
 * @param {number}   [options.timeoutMs]      Maximum wait time.
 * @param {number}   [options.pollIntervalMs] Poll interval.
 * @param {Function} [options.fetchImpl]      Fetch implementation.
 * @param {Function} [options.sleep]          Sleep implementation.
 * @param {Function} [options.now]            Clock implementation.
 * @return {Promise<void>} Resolves when the site is ready.
 */
export async function waitForWordPressReady({
  baseUrl,
  timeoutMs = 60_000,
  pollIntervalMs = 1_000,
  fetchImpl = fetch,
  sleep = (delayMs) =>
    new Promise((resolve) => {
      setTimeout(resolve, delayMs);
    }),
  now = () => Date.now(),
}) {
  const deadline = now() + timeoutMs;
  let lastErrorMessage = 'No response received.';

  while (now() < deadline) {
    try {
      const response = await fetchImpl(`${baseUrl}/`, {
        redirect: 'manual',
      });
      const bodyText = await response.text();

      if (isWordPressReadyResponse({ status: response.status, bodyText })) {
        return;
      }

      lastErrorMessage = `HTTP ${response.status}`;

      if (bodyText.includes(WORDPRESS_NOT_READY_TEXT)) {
        lastErrorMessage = WORDPRESS_NOT_READY_TEXT;
      }
    } catch (error) {
      lastErrorMessage =
        error instanceof Error ? error.message : String(error);
    }

    await sleep(pollIntervalMs);
  }

  throw new Error(
    `Timed out waiting for WordPress to finish booting at ${baseUrl}. Last response: ${lastErrorMessage}.`,
  );
}
