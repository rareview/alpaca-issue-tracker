#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const publicBlueprintPath = path.join(rootDir, '.github', 'blueprint.json');
const seedSourcePath = path.join(
  rootDir,
  'playground',
  'seed-demo-content.php',
);
const zipPath = path.join(rootDir, 'alpaca.zip');
const outputDir = path.join(rootDir, 'playground', '.generated', 'bundle');
const outputBlueprintPath = path.join(outputDir, 'blueprint.json');
const outputZipPath = path.join(outputDir, 'alpaca.zip');
const outputSeedPath = path.join(outputDir, 'seed-demo-content.php');

/**
 * Ensure a directory exists.
 *
 * @param {string} directoryPath Directory path.
 * @return {void}
 */
function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
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
 * Load the public Playground blueprint JSON.
 *
 * @return {Object} Parsed blueprint object.
 */
function loadPublicBlueprint() {
  return JSON.parse(fs.readFileSync(publicBlueprintPath, 'utf8'));
}

/**
 * Build the local bundled Playground blueprint.
 *
 * @param {Object} publicBlueprint Public blueprint object.
 * @return {Object} Local bundled blueprint object.
 */
function buildBundledBlueprint(publicBlueprint) {
  const bundledBlueprint = structuredClone(publicBlueprint);
  const installPluginStep = bundledBlueprint.steps.find(
    (step) => step.step === 'installPlugin',
  );
  const writeFileStep = bundledBlueprint.steps.find(
    (step) =>
      step.step === 'writeFile' &&
      step.path === '/tmp/alpaca-playground-seed.php',
  );

  if (!installPluginStep) {
    throw new Error('Public blueprint is missing the installPlugin step.');
  }

  if (!writeFileStep) {
    throw new Error(
      'Public blueprint is missing the Playground seed file step.',
    );
  }

  installPluginStep.pluginData = {
    resource: 'bundled',
    path: '/alpaca.zip',
  };

  writeFileStep.data = {
    resource: 'bundled',
    path: '/seed-demo-content.php',
  };

  return bundledBlueprint;
}

/**
 * Write the generated bundle files.
 *
 * @param {Object} bundledBlueprint Local bundled blueprint object.
 * @return {void}
 */
function writeBundle(bundledBlueprint) {
  removeDirectory(outputDir);
  ensureDirectory(outputDir);

  fs.copyFileSync(zipPath, outputZipPath);
  fs.copyFileSync(seedSourcePath, outputSeedPath);
  fs.writeFileSync(
    outputBlueprintPath,
    `${JSON.stringify(bundledBlueprint, null, 2)}\n`,
  );
}

/**
 * Validate the required input files exist.
 *
 * @return {void}
 */
function validateInputs() {
  if (!fs.existsSync(publicBlueprintPath)) {
    throw new Error('Public blueprint file not found.');
  }

  if (!fs.existsSync(zipPath)) {
    throw new Error(
      'Plugin ZIP not found. Run the packaging step before generating the Playground bundle.',
    );
  }

  if (!fs.existsSync(seedSourcePath)) {
    throw new Error('Playground seed file not found.');
  }
}

/**
 * Main entry point.
 *
 * @return {void}
 */
function main() {
  validateInputs();

  const publicBlueprint = loadPublicBlueprint();
  const bundledBlueprint = buildBundledBlueprint(publicBlueprint);

  writeBundle(bundledBlueprint);

  process.stdout.write(
    `Playground bundle created at ${path.relative(rootDir, outputDir)}\n`,
  );
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
