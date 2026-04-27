# Playground E2E tests

This directory contains the Alpaca end-to-end harness built on WordPress Playground and Playwright.

## What it does

- builds the current branch into `alpaca.zip`
- generates a local Blueprint bundle in `tests/e2e/.generated/playground-bundle`
- starts a fresh local Playground instance from that ZIP
- seeds a deterministic Alpaca board from `tests/e2e/fixtures/seed-manifest.json`
- runs Playwright smoke and regression coverage against that instance

## Local development

Install browsers once:

```bash
npm run test:e2e:install
```

Run the full local entrypoint:

```bash
npm run test:e2e
```

Run only the smoke or regression slices:

```bash
npm run test:e2e -- tests/e2e/specs/smoke
npm run test:e2e -- tests/e2e/specs/regressions
```

Start only the Playground server after generating the bundle:

```bash
npm run test:e2e:prepare
npm run test:e2e:playground
```

The default local Playground URL is `http://127.0.0.1:9400`. Override it with `ALPACA_PLAYGROUND_PORT` if that port is already in use.

## Trigger model

Hosted runs are intentionally opt-in for pull requests.

- Local development: run the suite directly while building a feature.
- Pull requests: the GitHub Actions workflow runs only when the PR has a `ready-for-tests` or `playground` label, or when it is triggered manually.
- Nightly: the full suite runs on a schedule from the default branch.

CI uses the same `npm run test:e2e -- <glob>` entrypoint that local development uses. The hosted workflow is the same branch ZIP + seeded Playground + Playwright flow, just running on GitHub Actions.

This avoids booting the full Playground environment on every small push while still giving us repeatable browser coverage once a PR is ready.

Every run also writes `test-results/playwright/performance-metrics.json` with observational timing data for the board load, issue create/progress flow, and comment submission flow. The hosted workflow uploads that file as part of the standard `test-results` artifact.

## Suite contract

- Every new feature should add at least one happy-path browser test.
- Every bug fix should add at least one regression test that proves the bug stays fixed.
- Reuse the shared seed manifest whenever possible. Only add new fixture data when an existing scenario cannot express the case you need.
- `tests/e2e/specs/smoke` is the required PR suite.
- `tests/e2e/specs/regressions` is the growing deeper suite that runs in nightly `full` coverage.
