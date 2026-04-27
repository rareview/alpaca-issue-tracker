import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCLI } from '@wp-playground/cli';
import { waitForWordPressReady } from '../helpers/playground-ready.mjs';

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
const generatedBlueprintPath = path.join(generatedBundleDir, 'blueprint.json');
const defaultPort = Number.parseInt(
  process.env.ALPACA_PLAYGROUND_PORT || '9400',
  10,
);

/**
 * Exit with a message when the generated blueprint is missing.
 *
 * @return {never} Always throws.
 */
function throwMissingBlueprintError() {
  throw new Error(
    'Generated Playground blueprint not found. Run "npm run test:e2e:prepare" first.',
  );
}

/**
 * Start the local Playground server and keep the process alive.
 *
 * @return {Promise<void>} Resolves only when the process exits.
 */
async function startServer() {
  let cliServer;

  try {
    cliServer = await runCLI({
      command: 'server',
      blueprint: generatedBundleDir,
      'blueprint-may-read-adjacent-files': true,
      login: true,
      port: defaultPort,
      verbosity: process.env.CI ? 'quiet' : 'normal',
    });
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
    return;
  }

  try {
    await waitForWordPressReady({
      baseUrl: cliServer.serverUrl,
    });
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );

    if (cliServer && cliServer.server) {
      await cliServer.server.close();
    }

    process.exitCode = 1;
    return;
  }

  process.stdout.write(`Playground server ready at ${cliServer.serverUrl}\n`);

  let isClosing = false;

  const closeServer = async (exitCode = 0) => {
    if (isClosing) {
      return;
    }

    isClosing = true;

    if (cliServer && cliServer.server) {
      await cliServer.server.close();
    }

    process.exit(exitCode);
  };

  process.on('SIGINT', () => {
    closeServer(0).catch((error) => {
      process.stderr.write(
        `${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exit(1);
    });
  });

  process.on('SIGTERM', () => {
    closeServer(0).catch((error) => {
      process.stderr.write(
        `${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exit(1);
    });
  });

  await new Promise(() => {});
}

try {
  await import('node:fs/promises').then(({ access }) =>
    access(generatedBlueprintPath),
  );
} catch (error) {
  throwMissingBlueprintError();
}

await startServer();
