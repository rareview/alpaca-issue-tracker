# Getting Started

## Requirements

Alpaca Issue Tracker requires:

- WordPress 6.9 or newer.
- PHP 8.0 or newer.
- A logged-in WordPress user account with access to the Project Board.

## Recommendations

Users are encouraged to set a profile picture, using the standard WordPress profile management screen. By default, WordPress uses an external service (Gravatar) for profile pictures: but you may wish to install a solution for local management, such as [Simple Local Avatars](https://wordpress.org/plugins/simple-local-avatars/).

## Installation

1. Upload the plugin ZIP in WordPress under Plugins > Add Plugin > Upload Plugin.
2. Activate Alpaca Issue Tracker.
3. Open Project Board in the WordPress admin menu.

For source checkout setup, see [Development](../developer/development.md).

## First Setup Checklist

After activation:

1. Open Project Board.
2. Confirm the default status columns are visible.
3. Open Project Board > Configure.
4. Review the Statuses tab and adjust column names/order if needed.
5. Review Labels and create project-specific labels.
6. Review Cards and choose which issue data should appear on board cards.
7. Review Settings and decide whether contextual capture should be enabled.
8. Open Project Board > My Notifications and configure personal notification preferences.
9. Open Project Board > Email Templates if site-wide email templates need to be customized.

## Main Admin Screens

- Project Board: kanban board and issue management.
- Project Activity: activity timeline across issues.
- Configure: site-wide status, card, label, deleted item, and setting controls.
- My Notifications: current user's notification preferences.
- Email Templates: site-wide notification email template editor.

## Dashboard Widget

Alpaca Issue Tracker adds a Project Issues widget to the WordPress Dashboard. It summarizes issue activity that is relevant to the current user, such as assigned issues, watched issues, latest issues, and overdue work.

For capability details, see [Roles And Permissions](../admin/roles-and-permissions.md).
