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

The base plugin does not transmit issue data to an external service by default. Data remains in the WordPress database and filesystem unless another plugin, custom integration, or hosting layer moves that data elsewhere.

## Access Control

Board and issue access is based on WordPress capabilities and Alpaca Issue Tracker permission checks. Developers can customize selected permission decisions with the `alpaca_user_can` filter.

## Operational Guidance

Before enabling contextual capture on sensitive sites:

- Confirm which roles can access reporting and board screens.
- Confirm screenshots are acceptable for the site audience.
- Confirm retention expectations for deleted issues and uploaded attachments.
- Review notification templates for any sensitive data exposure.
