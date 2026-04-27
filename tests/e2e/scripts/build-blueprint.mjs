import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..', '..');
const generatedBundleDir = path.join(
  rootDir,
  'tests',
  'e2e',
  '.generated',
  'playground-bundle',
);
const blueprintTemplatePath = path.join(
  rootDir,
  'tests',
  'e2e',
  'playground',
  'blueprint.template.json',
);
const seedScriptPath = path.join(
  rootDir,
  'tests',
  'e2e',
  'playground',
  'seed.php',
);
const seedManifestPath = path.join(
  rootDir,
  'tests',
  'e2e',
  'fixtures',
  'seed-manifest.json',
);
const zipPath = path.join(rootDir, 'alpaca.zip');
const generatedBlueprintPath = path.join(generatedBundleDir, 'blueprint.json');

/**
 * Assert that an input file exists before continuing.
 *
 * @param {string} filePath File path.
 * @param {string} message  Error message.
 * @return {Promise<void>} Resolves when the file exists.
 */
async function assertFileExists(filePath, message) {
  try {
    await fs.access(filePath);
  } catch (error) {
    throw new Error(message, { cause: error });
  }
}

/**
 * Copy a file into the generated bundle.
 *
 * @param {string} sourcePath Source file path.
 * @param {string} targetPath Target file path.
 * @return {Promise<void>} Resolves when the file is copied.
 */
async function copyBundleFile(sourcePath, targetPath) {
  await fs.copyFile(sourcePath, targetPath);
}

/**
 * Build the generated Playground bundle directory.
 *
 * @return {Promise<void>} Resolves when the bundle is ready.
 */
async function buildBlueprintBundle() {
  await assertFileExists(
    zipPath,
    'Missing alpaca.zip. Run "npm run zip" before building the Playground bundle.',
  );
  await assertFileExists(
    blueprintTemplatePath,
    'Missing blueprint template for the Playground E2E harness.',
  );
  await assertFileExists(
    seedScriptPath,
    'Missing Playground seed script for the E2E harness.',
  );
  await assertFileExists(
    seedManifestPath,
    'Missing seed manifest for the Playground E2E harness.',
  );

  await fs.rm(generatedBundleDir, { recursive: true, force: true });
  await fs.mkdir(generatedBundleDir, { recursive: true });

  await copyBundleFile(zipPath, path.join(generatedBundleDir, 'alpaca.zip'));
  await copyBundleFile(
    seedScriptPath,
    path.join(generatedBundleDir, 'seed.php'),
  );
  await copyBundleFile(
    seedManifestPath,
    path.join(generatedBundleDir, 'seed-manifest.json'),
  );
  await copyBundleFile(blueprintTemplatePath, generatedBlueprintPath);

  process.stdout.write(
    `Playground bundle generated at ${generatedBundleDir}\n`,
  );
}

await buildBlueprintBundle();
