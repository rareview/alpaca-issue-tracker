#!/usr/bin/env node

/**
 * Generate the PHP translation catalog without requiring a global WP-CLI install.
 *
 * Resolution order:
 * 1. `wp` on PATH (global or local install)
 * 2. `vendor/bin/wp` (Composer wp-cli package, if present)
 * 3. Download wp-cli.phar to `.cache/wp-cli.phar` and run via PHP
 */

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const { spawnSync } = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const cacheDir = path.join(rootDir, '.cache');
const pharPath = path.join(cacheDir, 'wp-cli.phar');
const WP_CLI_PHAR_URL =
  'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar';

const makePotArgs = [
  'i18n',
  'make-pot',
  '.',
  'languages/alpaca-issue-tracker.pot',
  '--domain=alpaca-issue-tracker',
  '--slug=alpaca-issue-tracker',
  '--exclude=node_modules,vendor,dist,build,.git,tests,skills',
];

/**
 * Run a command and return whether it exited successfully.
 *
 * @param {string}   command Executable.
 * @param {string[]} args    Arguments.
 * @return {boolean} True when the command succeeds.
 */
function commandSucceeds(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  return result.status === 0;
}

/**
 * Download the WP-CLI phar to the local cache directory.
 *
 * @param {string} destination Absolute path for the phar file.
 * @return {Promise<void>}
 */
function downloadPhar(destination) {
  return new Promise((resolve, reject) => {
    https
      .get(WP_CLI_PHAR_URL, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download WP-CLI phar (HTTP ${response.statusCode}).`,
            ),
          );
          response.resume();
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          fs.writeFileSync(destination, Buffer.concat(chunks));
          resolve();
        });
      })
      .on('error', reject);
  });
}

/**
 * Resolve the WP-CLI invocation strategy.
 *
 * @return {Promise<{ command: string, args: string[] }>} WP-CLI command and arguments.
 */
async function resolveWpInvocation() {
  if (commandSucceeds('wp', ['--version'])) {
    return { command: 'wp', args: makePotArgs };
  }

  const vendorWp = path.join(rootDir, 'vendor', 'bin', 'wp');
  if (fs.existsSync(vendorWp) && commandSucceeds(vendorWp, ['--version'])) {
    return { command: vendorWp, args: makePotArgs };
  }

  if (!fs.existsSync(pharPath)) {
    process.stdout.write(
      'WP-CLI not found. Downloading wp-cli.phar to .cache/...\n',
    );
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    await downloadPhar(pharPath);
  }

  if (!commandSucceeds('php', ['--version'])) {
    throw new Error(
      'PHP is required to run WP-CLI. Install PHP or WP-CLI globally: https://wp-cli.org/#installing',
    );
  }

  return { command: 'php', args: [pharPath, ...makePotArgs] };
}

/**
 * Run make-pot via the resolved WP-CLI invocation.
 *
 * @return {Promise<void>}
 */
async function main() {
  const { command, args } = await resolveWpInvocation();
  const result = spawnSync(command, args, { cwd: rootDir, stdio: 'inherit' });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
