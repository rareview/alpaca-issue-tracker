# Architecture

This page summarizes how Alpaca Issue Tracker is organized.

## Bootstrap

The plugin starts from `alpacaissuetracker.php`.

The bootstrap loads the core plugin classes, registers activation and deactivation hooks, and starts the main plugin registration flow.

PHP classes use the `AlpacaIssueTracker` namespace. The public REST namespace remains `alpaca/v1`, so existing API URLs do not change with the plugin display-name update.

## Main PHP Areas

- `includes/class-alpacaissuetracker.php`: main plugin lifecycle, settings registration, activation hooks, and initialization.
- `includes/class-register.php`: registers assets, admin screens, API routes, and WordPress hooks.
- `includes/class-helpers.php`: shared helper methods and shared constants.
- `includes/api/`: API endpoint and filter registration, including `abilities.php` which registers the plugin's [WordPress Abilities API](https://developer.wordpress.org/apis/abilities-api/) category and abilities for MCP and agent access.
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

The plugin also adds a WordPress Dashboard widget that summarizes relevant project issues for the current user.

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

`alpaistr_dispatch_new_comment_notifications()` in `includes/notifications/dispatch.php` is the shared helper that syncs `@mention` metadata and sends notifications for a newly inserted `issuecomment`. It is called by three paths:

- `rest_after_insert_comment` — for comments created via `/wp/v2/comments`, after the REST controller has saved all comment meta.
- Explicitly from `alpaistr_ability_add_comment()` — for comments created through the Abilities API, which runs inside a REST request but does not go through the comments REST controller.
- `wp_insert_comment` (skipped during REST requests) — for comments inserted directly, such as via WP-CLI or custom PHP.

This split ensures notifications always fire with complete data regardless of the creation path.
