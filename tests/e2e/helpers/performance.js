const fs = require('node:fs/promises');
const { performance } = require('node:perf_hooks');

/**
 * Return a filesystem-safe metric slug.
 *
 * @param {string} metricName Metric name.
 * @return {string} Metric slug.
 */
function getMetricSlug(metricName) {
  return metricName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Attach a recorded performance metric to the current test result.
 *
 * @param {import('@playwright/test').TestInfo} testInfo Test info object.
 * @param {Object}                              metric   Metric payload.
 * @return {Promise<void>} Resolves when the metric is attached.
 */
async function attachPerformanceMetric(testInfo, metric) {
  const metricPath = testInfo.outputPath(
    `performance-${getMetricSlug(metric.name)}.json`,
  );

  await fs.writeFile(metricPath, JSON.stringify(metric, null, 2));
  await testInfo.attach(`performance:${metric.name}`, {
    path: metricPath,
    contentType: 'application/json',
  });
}

/**
 * Measure an end-to-end action and persist it as a JSON attachment.
 *
 * @param {import('@playwright/test').TestInfo} testInfo   Test info object.
 * @param {string}                              metricName Metric name.
 * @param {Function}                            action     Async action to time.
 * @param {Object}                              details    Extra metric fields.
 * @return {Promise<number>} Duration in milliseconds.
 */
async function measureAction(testInfo, metricName, action, details = {}) {
  const startedAt = new Date().toISOString();
  const startTime = performance.now();

  await action();

  const endedAt = new Date().toISOString();
  const durationMs = Number((performance.now() - startTime).toFixed(2));

  await attachPerformanceMetric(testInfo, {
    name: metricName,
    durationMs,
    startedAt,
    endedAt,
    browserName: testInfo.project.use.browserName || null,
    projectName: testInfo.project.name || null,
    testFile: testInfo.file,
    testTitle: testInfo.title,
    ...details,
  });

  return durationMs;
}

module.exports = {
  measureAction,
};
