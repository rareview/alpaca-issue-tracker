# Notifications

Alpaca Issue Tracker ships with an in-app inbox, and email notification workflows for issue activity.

The Alpaca team is planning to add further notification channels in future. Action hooks and filters in the Alpaca codebase can be used to add other channels.

## Notification Preferences

Each user manages their own preferences under Project Board > My Notifications.

Users can choose which subjects and event types they care about, including:

- Issues they created.
- Issues assigned to them.
- Issues they have starred/watched.
- Comments that mention them.
- Issues with selected labels.
- Issues currently marked high priority.
- Newly created issues.

Note: a user will receive a notification that they have been mentioned in discussion of an issue - but they will not be automatically opted into receiving all updates relating to that issue. If they wish to receive further notifications, they should add the issue to their watchlist.

Event categories include:

- Human comments.
- Status changes.
- Issue assignment changes.
- Due date changes.
- Checklist create/delete activity.
- Checklist assignment changes.
- Checklist completion changes.
- Checklist promotions.
- High-priority changes.

## Inbox

The notification inbox stores Alpaca Issue Tracker notifications inside WordPress. Users can review unread activity and mark notifications read or unread.

## Email Notifications

Email delivery can be enabled and configured from the user's notification settings.

By default, notifications will be sent to the email address defined in the user's profile.

The user has the option to specify an alternative address for notification emails.

## Instant Notifications and Daily Digests

Users can receive email notifications immediately following a triggering action.

They can also choose to consolidate all notifications into a single daily digest email, sent at a time of their choosing.

Note: the time for daily digest generation is based on the timezone setting for the site. Users must factor in any time difference to their own location.

## Email Templates

Administrators manage shared email templates under Project Board > Email Templates.

The full template block and placeholder reference is documented in [Email Templates](../admin/email-templates.md).
