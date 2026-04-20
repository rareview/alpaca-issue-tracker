const fs = require('node:fs');
const path = require('node:path');
const childProcess = require('node:child_process');

/**
 * Return the current git branch when available.
 *
 * @return {string|null} Git branch name.
 */
function getGitBranchName() {
  try {
    return childProcess
      .execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
      .trim();
  } catch (error) {
    return null;
  }
}

/**
 * Return the current git commit hash when available.
 *
 * @return {string|null} Git commit hash.
 */
function getGitCommitSha() {
  try {
    return childProcess
      .execSync('git rev-parse HEAD', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
      .trim();
  } catch (error) {
    return null;
  }
}

/**
 * Aggregate per-test performance metric attachments into one JSON artifact.
 */
class PerformanceReporter {
  /**
   * Initialize the reporter.
   */
  constructor() {
    this.metrics = [];
  }

  /**
   * Collect performance attachments after each test finishes.
   *
   * @param {import('@playwright/test/reporter').TestCase}   test   Test case.
   * @param {import('@playwright/test/reporter').TestResult} result Test result.
   * @return {void}
   */
  onTestEnd(test, result) {
    for (const attachment of result.attachments) {
      if (
        !attachment.name.startsWith('performance:') ||
        !attachment.path ||
        !fs.existsSync(attachment.path)
      ) {
        continue;
      }

      const metric = JSON.parse(fs.readFileSync(attachment.path, 'utf8'));

      this.metrics.push({
        ...metric,
        resultStatus: result.status,
        retry: result.retry,
        titlePath: test.titlePath(),
      });
    }
  }

  /**
   * Persist the aggregated performance metrics artifact.
   *
   * @return {void}
   */
  onEnd() {
    const artifactPath = path.join(
      process.cwd(),
      'test-results',
      'playwright',
      'performance-metrics.json',
    );

    fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
    fs.writeFileSync(
      artifactPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          branch:
            process.env.GITHUB_HEAD_REF ||
            process.env.GITHUB_REF_NAME ||
            getGitBranchName(),
          commitSha: process.env.GITHUB_SHA || getGitCommitSha(),
          workflowRunId: process.env.GITHUB_RUN_ID || null,
          browser: this.metrics[0]?.browserName || null,
          metrics: this.metrics,
        },
        null,
        2,
      ),
    );
  }
}

module.exports = PerformanceReporter;
