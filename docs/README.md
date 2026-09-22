---
sidebar_label: 'Home'
sidebar_position: 1
---

# Alpaca Issue Tracker Documentation

Alpaca Issue Tracker is a WordPress-native issue tracker for bug reports, QA feedback, and project work inside `wp-admin`.

This documentation is for site owners, project teams, and developers working with the plugin from the GitHub repository.

## User Guides

- [Getting Started](user/getting-started.md): installation, activation, first setup, and main admin screens.
- [Project Board](user/project-board.md): statuses, cards, filters, issue creation, deadlines, priority, and watchlist behavior.
- [Contextual Capture](user/contextual-capture.md): front-end reporting, screenshots, browser context, and captured data.
- [Comments And Activity](user/comments-and-activity.md): comments, attachments, mentions, timeline entries, and audit behavior.
- [Notifications](user/notifications.md): notification preferences, inbox, email delivery, mentions, and email templates.
- [Privacy And Data](user/privacy-and-data.md): what the plugin stores and where it is stored.

## Admin Guides

- [Configuration](admin/configuration.md): Configure screen tabs and site-wide settings.
- [Email Templates](admin/email-templates.md): notification and daily digest template blocks, placeholders, and storage.
- [Roles And Permissions](admin/roles-and-permissions.md): default WordPress capability requirements and customization points.

## Developer Guides

- [Hook And Filter Reference](reference/README.md): detailed descriptions of Alpaca Issue Tracker action hooks and filters.
- [Development](developer/development.md): local tooling, lint, build, and translation commands.
- [Architecture](developer/architecture.md): runtime structure, data model, and React entrypoints.
- [Data Model](developer/data-model.md): post types, taxonomies, meta, comments, options, and notification tables.
- [Settings And Options](developer/settings-options.md): site options, REST settings, user preferences, and internal options.
- [REST API](developer/rest-api.md): endpoint reference, permissions, payloads, and REST hooks.
- [Abilities API](developer/abilities-api.md): WordPress Abilities API tools for MCP clients and local agents.
- [Agent skill](../skills/alpaca/SKILL.md): Cursor and local-agent skill for the Abilities API (repo checkout only; not shipped in the release ZIP).
- [Icon System](developer/icon-system.md): source SVGs, generated icon registries, and SVG sanitization.
