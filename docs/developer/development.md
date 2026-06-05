# Development

This page covers repository setup and development commands for Alpaca Issue Tracker.

## Tooling

- Node.js and npm are used for React, Sass, linting, and asset builds.
- Composer is used for PHP tooling.
- A local WordPress site is needed to activate and test the plugin.

## Source Checkout Setup

Install dependencies from the repository root:

```bash
composer install
npm ci
```

Build assets before activating a source checkout in WordPress:

```bash
npm run lint
npm run build
```

Always run `npm run lint` before `npm run build`. Fix lint errors and warnings before building assets.

## JavaScript and CSS

Source files live under `src/`.

Common commands:

```bash
npm run lint:js
npm run lint:styles
npm run format:js
```

Built assets are written to `dist/`.

## PHP

Plugin PHP lives in these main areas:

- `alpacaissuetracker.php` for the plugin bootstrap.
- `includes/` for core classes, API endpoint handlers, filters, notifications, and utilities.
- `templates/` for PHP-rendered admin screens.

Common commands:

```bash
npm run lint:php
npm run format:php
```

Follow WordPress Coding Standards for PHP changes. Public functions, classes, methods, filters, and actions should include complete PHPDoc.

## Translations

User-facing strings should use the `alpaca-issue-tracker` text domain.

Generate the PHP translation catalog with:

```bash
npm run make-pot
```

This writes to `languages/alpaca-issue-tracker.pot`.

For JavaScript and JSX strings, use `wp.i18n` functions. When generating JavaScript translation catalogs, include JSX extensions so React strings are exported:

```bash
wp i18n make-json languages --extensions=js,jsx
```

Keep the `languages/` folder limited to the runtime files needed by the plugin.

## WordPress Playground

The repository includes Playground commands for a clean browser-based demo or local verification flow.

Common commands:

```bash
npm run playground:prepare
npm run playground:start
npm run playground:run-blueprint
```

The Playground flow builds the installable ZIP, creates a generated Playground bundle, installs the plugin in a fresh Playground site, and seeds demo issue data.

## Packaging

Create an installable ZIP with:

```bash
npm run zip
```

The ZIP should include runtime plugin files only. Repo-only files such as `docs/`, source tooling, and local configuration should stay out of the package.
