const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');
const E2E_DIR = path.join(ROOT_DIR, 'tests', 'e2e');
const GENERATED_DIR = path.join(E2E_DIR, '.generated');
const GENERATED_BUNDLE_DIR = path.join(GENERATED_DIR, 'playground-bundle');
const GENERATED_BLUEPRINT_PATH = path.join(
  GENERATED_BUNDLE_DIR,
  'blueprint.json',
);
const SEED_MANIFEST_PATH = path.join(
  ROOT_DIR,
  'tests',
  'e2e',
  'fixtures',
  'seed-manifest.json',
);
const DEFAULT_PORT = Number.parseInt(
  process.env.ALPACA_PLAYGROUND_PORT || '9400',
  10,
);
const DEFAULT_BASE_URL = `http://127.0.0.1:${DEFAULT_PORT}`;

/**
 * Return the repository root directory.
 *
 * @return {string} Absolute repository path.
 */
function getRootDir() {
  return ROOT_DIR;
}

/**
 * Return the generated Playground bundle directory.
 *
 * @return {string} Absolute bundle directory path.
 */
function getGeneratedBundleDir() {
  return GENERATED_BUNDLE_DIR;
}

/**
 * Return the generated blueprint file path.
 *
 * @return {string} Absolute blueprint file path.
 */
function getGeneratedBlueprintPath() {
  return GENERATED_BLUEPRINT_PATH;
}

/**
 * Return the configured Playground port.
 *
 * @return {number} Playground port.
 */
function getPlaygroundPort() {
  return DEFAULT_PORT;
}

/**
 * Return the configured Playground base URL.
 *
 * @return {string} Playground base URL.
 */
function getPlaygroundBaseUrl() {
  return process.env.ALPACA_PLAYGROUND_BASE_URL || DEFAULT_BASE_URL;
}

/**
 * Build an admin URL inside the Playground site.
 *
 * @param {string} pageSlug Admin page slug.
 * @return {string} Absolute admin URL.
 */
function getAdminPageUrl(pageSlug) {
  return `${getPlaygroundBaseUrl()}/wp-admin/admin.php?page=${pageSlug}`;
}

/**
 * Assert that the generated blueprint exists before starting tests.
 *
 * @return {void}
 */
function assertGeneratedBlueprintExists() {
  if (fs.existsSync(GENERATED_BLUEPRINT_PATH)) {
    return;
  }

  throw new Error(
    'Generated Playground blueprint not found. Run "npm run test:e2e:prepare" first.',
  );
}

/**
 * Read the deterministic seed manifest.
 *
 * @return {Object} Parsed seed manifest.
 */
function readSeedManifest() {
  return JSON.parse(fs.readFileSync(SEED_MANIFEST_PATH, 'utf8'));
}

module.exports = {
  getRootDir,
  getGeneratedBundleDir,
  getGeneratedBlueprintPath,
  getPlaygroundPort,
  getPlaygroundBaseUrl,
  getAdminPageUrl,
  assertGeneratedBlueprintExists,
  readSeedManifest,
};
