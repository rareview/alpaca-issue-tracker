import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT_RUNTIME_FILES = ['alpaca.php', 'readme.txt', 'uninstall.php'];
const REQUIRED_RUNTIME_DIRECTORIES = ['dist', 'includes', 'lib'];
const OPTIONAL_RUNTIME_DIRECTORIES = ['languages'];

/**
 * Throw when a required runtime path is missing.
 *
 * @param {string} rootDir      Repository root path.
 * @param {string} relativePath Relative path to validate.
 * @param {string} type         Expected path type.
 * @return {void}
 */
function assertRuntimePathExists(rootDir, relativePath, type) {
  const absolutePath = path.join(rootDir, relativePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Required ${type} is missing: ${relativePath}`);
  }
}

/**
 * Return whether a file inside dist should be packaged.
 *
 * @param {string} relativePath Relative file path.
 * @return {boolean} True when the file should be included.
 */
function shouldIncludeDistFile(relativePath) {
  return !relativePath.endsWith('.map');
}

/**
 * Return whether a runtime file should be packaged from a recursive directory.
 *
 * @param {string} relativePath Relative file path.
 * @return {boolean} True when the file should be included.
 */
function shouldIncludeRuntimeFile(relativePath) {
  const fileName = path.basename(relativePath);

  if (fileName.startsWith('.')) {
    return false;
  }

  if (fileName.endsWith('.backup')) {
    return false;
  }

  return true;
}

/**
 * Return whether a file inside languages should be packaged.
 *
 * @param {string} relativePath Relative file path.
 * @return {boolean} True when the file should be included.
 */
function shouldIncludeLanguageFile(relativePath) {
  return /\.(json|mo|po|l10n\.php)$/i.test(relativePath);
}

/**
 * Collect relative file paths inside a directory using a predicate.
 *
 * @param {string}   rootDir           Repository root path.
 * @param {string}   relativeDirectory Relative directory path.
 * @param {Function} shouldIncludeFile Include predicate.
 * @return {string[]} Relative file paths.
 */
function collectDirectoryFiles(rootDir, relativeDirectory, shouldIncludeFile) {
  const absoluteDirectory = path.join(rootDir, relativeDirectory);
  const entries = [];
  const directoryEntries = fs.readdirSync(absoluteDirectory, {
    withFileTypes: true,
  });

  directoryEntries.forEach((directoryEntry) => {
    const entryRelativePath = path.join(relativeDirectory, directoryEntry.name);

    if (directoryEntry.isDirectory()) {
      entries.push(
        ...collectDirectoryFiles(rootDir, entryRelativePath, shouldIncludeFile),
      );
      return;
    }

    if (directoryEntry.isFile() && shouldIncludeFile(entryRelativePath)) {
      entries.push(entryRelativePath);
    }
  });

  return entries;
}

/**
 * Return the runtime file list that should be bundled into the plugin ZIP.
 *
 * @param {string} rootDir Repository root path.
 * @return {string[]} Sorted relative file paths.
 */
export function getPluginPackagePaths(rootDir) {
  ROOT_RUNTIME_FILES.forEach((relativePath) => {
    assertRuntimePathExists(rootDir, relativePath, 'file');
  });

  REQUIRED_RUNTIME_DIRECTORIES.forEach((relativePath) => {
    assertRuntimePathExists(rootDir, relativePath, 'directory');
  });

  const runtimeFiles = new Set(ROOT_RUNTIME_FILES);

  collectDirectoryFiles(rootDir, 'dist', shouldIncludeDistFile).forEach(
    (relativePath) => {
      runtimeFiles.add(relativePath);
    },
  );

  ['includes', 'lib'].forEach((relativeDirectory) => {
    collectDirectoryFiles(
      rootDir,
      relativeDirectory,
      shouldIncludeRuntimeFile,
    ).forEach((relativePath) => {
      runtimeFiles.add(relativePath);
    });
  });

  OPTIONAL_RUNTIME_DIRECTORIES.forEach((relativeDirectory) => {
    const absoluteDirectory = path.join(rootDir, relativeDirectory);

    if (!fs.existsSync(absoluteDirectory)) {
      return;
    }

    collectDirectoryFiles(
      rootDir,
      relativeDirectory,
      shouldIncludeLanguageFile,
    ).forEach((relativePath) => {
      runtimeFiles.add(relativePath);
    });
  });

  return Array.from(runtimeFiles).sort();
}

/**
 * Stage the plugin runtime files into a clean directory.
 *
 * @param {string} rootDir  Repository root path.
 * @param {string} stageDir Staging directory path.
 * @return {string[]} Staged relative file paths.
 */
export function stagePluginPackage(rootDir, stageDir) {
  const runtimeFiles = getPluginPackagePaths(rootDir);

  fs.rmSync(stageDir, {
    recursive: true,
    force: true,
  });
  fs.mkdirSync(stageDir, { recursive: true });

  runtimeFiles.forEach((relativePath) => {
    const sourcePath = path.join(rootDir, relativePath);
    const destinationPath = path.join(stageDir, relativePath);

    fs.mkdirSync(path.dirname(destinationPath), {
      recursive: true,
    });
    fs.copyFileSync(sourcePath, destinationPath);
  });

  return runtimeFiles;
}

/**
 * Build the plugin ZIP from the staged runtime files.
 *
 * @param {string} rootDir    Repository root path.
 * @param {string} outputFile Output ZIP file path.
 * @param {string} stageDir   Staging directory path.
 * @return {string[]} Packaged relative file paths.
 */
export function buildPluginZip(rootDir, outputFile, stageDir) {
  const runtimeFiles = stagePluginPackage(rootDir, stageDir);

  fs.rmSync(outputFile, {
    force: true,
  });

  const zipResult = spawnSync('zip', ['-rq', outputFile, '.'], {
    cwd: stageDir,
    encoding: 'utf8',
  });

  if (zipResult.error) {
    throw zipResult.error;
  }

  if (zipResult.status !== 0) {
    throw new Error(
      zipResult.stderr?.trim() ||
        zipResult.stdout?.trim() ||
        `zip exited with ${zipResult.status}`,
    );
  }

  return runtimeFiles;
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
const currentModulePath = fileURLToPath(import.meta.url);

if (executedPath === currentModulePath) {
  const rootDir = path.resolve(path.dirname(currentModulePath), '..');
  const stageDir = path.join(rootDir, '.build', 'plugin-package');
  const outputFile = path.join(rootDir, 'alpaca.zip');
  const runtimeFiles = buildPluginZip(rootDir, outputFile, stageDir);

  process.stdout.write(
    `Created ${outputFile} with ${runtimeFiles.length} runtime files.\n`,
  );
}
