# Architecture

This page summarizes how Alpaca Issue Tracker is organized.

## Bootstrap

The plugin starts from `alpaca.php`.

The bootstrap loads the core plugin classes, registers activation and deactivation hooks, and starts the main plugin registration flow.

## Main PHP Areas

- `includes/class-register.php`: registers assets, admin screens, settings, API routes, and WordPress hooks.
- `includes/class-helpers.php`: shared helper methods and shared constants.
- `includes/api/`: API endpoint and filter registration.
- `includes/core/`: custom post types, taxonomies, and shared core behavior.
- `includes/notifications/`: notification events, routing, channels, templates, and digest behavior.
- `includes/utilities/`: utility functions used across PHP features.
- `templates/`: PHP templates for plugin admin pages.

## Admin Screens

The main admin screens are registered from PHP and mounted with React where needed.

Core screens include:

- Project Board.
- Configure.
- Email Templates.
- Daily Digest Template.
- My Notifications.

## React Entrypoints

React source lives in `src/`.

Important entrypoints include:

- `src/index.jsx`: full plugin UI entrypoint.
- `src/admin-global.jsx`: lightweight admin-global UI entrypoint.
- `src/components/`: board, issue, comment, notification, and settings components.

The plugin uses WordPress-provided packages from the global `wp` object instead of bundling separate copies of WordPress React packages.

## REST API

The endpoint reference lives in [REST API](rest-api.md).

## Data Model

The data model reference lives in [Data Model](data-model.md).

Site options and user preferences are documented in [Settings and Options](settings-options.md).

## Notifications

Notifications are built from issue and comment events, routed through notification recipients, and delivered through configured channels such as the in-app inbox and email.

Daily digest behavior is handled separately from immediate notifications.
