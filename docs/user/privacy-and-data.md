# Privacy And Data

Alpaca Issue Tracker stores issue-tracking data inside the WordPress installation.

## Stored Data

The plugin can store:

- Issues as the `alpaca_issue` custom post type.
- Issue content, title, author, status, and comment data.
- Issue labels, statuses, assignees, and related taxonomies.
- Issue metadata such as priority, deadline, captured URL, browser data, and page context.
- Comments and activity/audit entries.
- Attachment URLs connected to comments.
- Notification preferences and inbox entries.
- Email template settings.
- Presence/watchlist related user data.

## Attachments And Screenshots

Attachments and screenshots are uploaded to the WordPress site and referenced from issue/comment metadata. Screenshots may include visible page content from the user's browser at the time of reporting.

## External Services

The plugin does not transmit issue data to an external service by default. Data remains in the WordPress database and filesystem unless an optional integration is enabled or another plugin or hosting layer moves it elsewhere.

If an administrator enables Fix With AI, an authorized user's draft request sends issue details and context to the configured AI provider. This can include the title, content, comments, labels, screenshot URLs, captured browser/request details, and live site environment information such as WordPress, PHP, theme, and plugin versions. Sending an approved draft creates an issue in the configured GitHub repository. GitHub workflow installation also creates or updates files in that repository. The AI provider and GitHub then handle that information under their own privacy and retention terms.

Uninstalling Alpaca Issue Tracker removes local Fix With AI settings but does not change GitHub. Before uninstalling, an administrator can use **Remove GitHub setup** on the Fix With AI settings screen to preview and remove unchanged plugin-provided files. Customized files, branches, pull requests, secrets, issues, labels, and repository variables remain for manual review. The action reports any GitHub deletion failures.

## Access Control

Board and issue access is based on WordPress capabilities and Alpaca Issue Tracker permission checks. Developers can customize selected permission decisions with the `alpaca_user_can` filter.

## Operational Guidance

Before enabling contextual capture on sensitive sites:

- Confirm which roles can access reporting and board screens.
- Confirm screenshots are acceptable for the site audience.
- Confirm retention expectations for deleted issues and uploaded attachments.
- Review notification templates for any sensitive data exposure.
