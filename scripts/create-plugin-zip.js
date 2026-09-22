#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const distignorePath = path.join(rootDir, '.distignore');
const stagingDir = path.join(rootDir, '.build', 'plugin-zip');
const zipPath = path.join(rootDir, 'alpaca-issue-tracker.zip');

/**
 * Run a command and throw when it fails.
 *
 * @param {string}   command Command name.
 * @param {string[]} args    Command arguments.
 * @param {Object}   options Spawn options.
 * @return {void}
 */
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
}

/**
 * Remove an existing directory tree if it is present.
 *
 * @param {string} directoryPath Directory path.
 * @return {void}
 */
function removeDirectory(directoryPath) {
  fs.rmSync(directoryPath, { recursive: true, force: true });
}

/**
 * Stage plugin files for packaging using .distignore exclusions.
 *
 * @return {void}
 */
function stagePluginFiles() {
  if (!fs.existsSync(distignorePath)) {
    throw new Error('Missing .distignore file required for plugin packaging.');
  }

  removeDirectory(stagingDir);
  fs.mkdirSync(stagingDir, { recursive: true });

  run('rsync', [
    '-a',
    '--delete',
    '--exclude-from',
    distignorePath,
    `${rootDir}/`,
    `${stagingDir}/`,
  ]);
}

/**
 * Create the plugin ZIP archive from staged files.
 *
 * @return {void}
 */
function createZipArchive() {
  fs.rmSync(zipPath, { force: true });
  run('zip', ['-rq', zipPath, '.'], { cwd: stagingDir });
}

/**
 * Main entry point.
 *
 * @return {void}
 */
function main() {
  stagePluginFiles();
  createZipArchive();
  process.stdout.write(`Created ${zipPath}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
