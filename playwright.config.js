const { defineConfig } = require('@playwright/test');
const {
  getPlaygroundBaseUrl,
  getPlaygroundPort,
} = require('./tests/e2e/helpers/playground');

const baseUrl = getPlaygroundBaseUrl();

module.exports = defineConfig({
  testDir: './tests/e2e/specs',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 120 * 1000,
  expect: {
    timeout: 30 * 1000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/playwright/results.json' }],
    ['./tests/e2e/reporters/performance-reporter.js'],
  ],
  outputDir: 'test-results/playwright/artifacts',
  use: {
    baseURL: baseUrl,
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run test:e2e:playground',
    port: getPlaygroundPort(),
    wait: {
      stdout:
        /Playground server ready at http:\/\/127\.0\.0\.1:(?<alpaca_playground_port>\d+)/,
    },
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
    gracefulShutdown: {
      signal: 'SIGTERM',
      timeout: 5 * 1000,
    },
    env: {
      ...process.env,
      ALPACA_PLAYGROUND_PORT: String(getPlaygroundPort()),
    },
  },
});
