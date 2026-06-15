#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');

const versionFiles = [
  {
    path: 'alpacaissuetracker.php',
    replace: (content, version) =>
      content.replace(/^(\s*\*\s+Version:\s+).+$/m, `$1${version}`),
  },
  {
    path: 'includes/class-helpers.php',
    replace: (content, version) =>
      content.replace(/(return\s+')([^']+)(';)/, `$1${version}$3`),
  },
  {
    path: 'includes/class-alpacaissuetracker.php',
    replace: (content, version) =>
      content.replace(/(const VERSION = ')([^']+)(';)/, `$1${version}$3`),
  },
  {
    path: 'readme.txt',
    replace: (content, version) =>
      content.replace(/^(Stable tag:\s+).+$/m, `$1${version}`),
  },
  {
    path: 'package.json',
    replace: (content, version) =>
      content.replace(/^(\s*"version":\s+")([^"]+)(",)$/m, `$1${version}$3`),
  },
  {
    path: 'package-lock.json',
    replace: (content, version) => {
      let updatedContent = content.replace(
        /^(\s*"version":\s+")([^"]+)(",)$/m,
        `$1${version}$3`,
      );

      const rootPackageVersionPattern =
        /("":\s*{\r?\n\s+"name":\s+"[^"]+",\r?\n\s+"version":\s+")([^"]+)(")/;

      if (rootPackageVersionPattern.test(updatedContent)) {
        return updatedContent.replace(rootPackageVersionPattern, `$1${version}$3`);
      }

      return updatedContent.replace(
        /("":\s*{\r?\n\s+"name":\s+"[^"]+",)/,
        `$1\n      "version": "${version}",`,
      );
    },
  },
  {
    path: 'languages/alpaca-issue-tracker.pot',
    replace: (content, version) =>
      content.replace(
        /(Project-Id-Version: Alpaca Issue Tracker )([^\\]+)(\\n")/,
        `$1${version}$3`,
      ),
  },
];

/**
 * Print usage text and exit.
 *
 * @param {number} exitCode Exit code.
 * @return {void}
 */
function printUsage(exitCode) {
  const message = [
    'Usage: npm run release:create -- <version> [--dry-run] [--notes-file=path]',
    '',
    'Examples:',
    '  npm run release:create -- 1.0.0-beta.3',
    '  npm run release:create -- 1.0.0-beta.3 --dry-run',
    '  npm run release:create -- 1.0.0-beta.3 --notes-file=release-notes.md',
  ].join('\n');

  const stream = exitCode === 0 ? process.stdout : process.stderr;
  stream.write(`${message}\n`);
  process.exit(exitCode);
}

/**
 * Parse CLI arguments.
 *
 * @return {Object} Parsed args.
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let version = '';
  let dryRun = false;
  let notesFile = '';

  args.forEach((arg) => {
    if ('--dry-run' === arg) {
      dryRun = true;
      return;
    }

    if (arg.startsWith('--notes-file=')) {
      notesFile = arg.slice('--notes-file='.length).trim();
      return;
    }

    if ('--help' === arg || '-h' === arg) {
      printUsage(0);
    }

    if (!version) {
      version = arg.trim();
    }
  });

  return { version, dryRun, notesFile };
}

/**
 * Validate the requested version string.
 *
 * @param {string} version Candidate version string.
 * @return {void}
 */
function validateVersion(version) {
  const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

  if (!versionPattern.test(version)) {
    throw new Error(
      `Invalid version "${version}". Use a format like 1.0.0 or 1.0.0-beta.3.`,
    );
  }
}

/**
 * Determine whether the requested version is a prerelease.
 *
 * @param {string} version Candidate version string.
 * @return {boolean} Whether the version is a prerelease.
 */
function isPrereleaseVersion(version) {
  return version.includes('-');
}

/**
 * Run a command and return trimmed stdout.
 *
 * @param {string}   command Command name.
 * @param {string[]} args    Command arguments.
 * @param {Object}   options Extra options.
 * @return {string} Trimmed stdout.
 */
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const stderr = result.stderr ? result.stderr.trim() : '';
    const stdout = result.stdout ? result.stdout.trim() : '';
    throw new Error(
      stderr || stdout || `${command} exited with ${result.status}`,
    );
  }

  return result.stdout ? result.stdout.trim() : '';
}

/**
 * Ensure required CLI tools are available.
 *
 * @return {void}
 */
function assertDependencies() {
  run('git', ['--version']);
  run('gh', ['--version']);
}

/**
 * Ensure the tracked worktree is clean before modifying files.
 *
 * Untracked files are ignored so local editor metadata does not block releases.
 *
 * @return {void}
 */
function assertTrackedWorktreeIsClean() {
  const status = run('git', ['status', '--porcelain', '--untracked-files=no']);

  if (status) {
    throw new Error(
      'Tracked changes detected. Commit or stash them before creating a release.',
    );
  }
}

/**
 * Ensure the target tag does not already exist locally.
 *
 * @param {string} tagName Proposed tag.
 * @return {void}
 */
function assertTagDoesNotExist(tagName) {
  const existing = run('git', ['tag', '--list', tagName]);

  if (existing === tagName) {
    throw new Error(`Tag ${tagName} already exists.`);
  }
}

/**
 * Update all versioned files.
 *
 * @param {string}  version Version string.
 * @param {boolean} apply   Whether to write changes to disk.
 * @return {string[]} Changed file paths.
 */
function updateVersionFiles(version, apply = true) {
  const changedFiles = [];

  versionFiles.forEach((fileConfig) => {
    const filePath = path.join(rootDir, fileConfig.path);
    const original = fs.readFileSync(filePath, 'utf8');
    const updated = fileConfig.replace(original, version);

    if (updated === original) {
      return;
    }

    if (apply) {
      fs.writeFileSync(filePath, updated);
    }

    changedFiles.push(fileConfig.path);
  });

  return changedFiles;
}

/**
 * Create and publish a GitHub release for the current HEAD commit.
 *
 * @param {string} version   Version string.
 * @param {string} notesFile Optional path to release notes file.
 * @return {void}
 */
function createRelease(version, notesFile) {
  const tagName = `v${version}`;
  const releaseTitle = tagName;
  const releaseArgs = [
    'release',
    'create',
    tagName,
    '--title',
    releaseTitle,
    '--target',
    run('git', ['rev-parse', 'HEAD']),
  ];

  if (isPrereleaseVersion(version)) {
    releaseArgs.push('--prerelease');
  }

  if (notesFile) {
    const absoluteNotesFile = path.isAbsolute(notesFile)
      ? notesFile
      : path.join(rootDir, notesFile);

    if (!fs.existsSync(absoluteNotesFile)) {
      throw new Error(`Release notes file not found: ${notesFile}`);
    }

    releaseArgs.push('--notes-file', absoluteNotesFile);
  } else {
    releaseArgs.push('--generate-notes');
  }

  run('gh', releaseArgs, { stdio: 'inherit' });
}

/**
 * Commit and push the version bump before creating the GitHub release.
 *
 * @param {string}   version      Version string.
 * @param {string[]} changedFiles Files to commit.
 * @return {void}
 */
function commitAndPush(version, changedFiles) {
  if (0 === changedFiles.length) {
    return;
  }

  run('git', ['add', ...changedFiles], { stdio: 'inherit' });
  run('git', ['commit', '-m', `chore(release): release ${version}`], {
    stdio: 'inherit',
  });
  run('git', ['push', 'origin', 'HEAD'], { stdio: 'inherit' });
}

/**
 * Main entry point.
 *
 * @return {void}
 */
function main() {
  const { version, dryRun, notesFile } = parseArgs();

  if (!version) {
    printUsage(1);
  }

  validateVersion(version);
  assertDependencies();
  assertTrackedWorktreeIsClean();
  assertTagDoesNotExist(`v${version}`);

  const changedFiles = updateVersionFiles(version, !dryRun);

  if (dryRun) {
    if (0 === changedFiles.length) {
      process.stdout.write(
        'Dry run complete. Version files already match the requested version.\n',
      );
      return;
    }

    process.stdout.write(
      `Dry run complete. Updated files:\n${changedFiles
        .map((filePath) => `- ${filePath}`)
        .join('\n')}\n`,
    );
    return;
  }

  commitAndPush(version, changedFiles);
  createRelease(version, notesFile);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
