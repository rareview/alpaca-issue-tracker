# Notifications

Alpaca Issue Tracker includes inbox and email notification workflows for issue activity.

## Notification Preferences

Each user manages their own preferences under Project Board > My Notifications.

Users can choose which subjects and event types they care about, including:

- Issues they created.
- Issues assigned to them.
- Issues they starred/watched.
- Comments that mention them.
- Issues with selected labels.
- Issues currently marked high priority.
- Newly created issues.

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

Email delivery can be enabled and configured from the user's notification settings. A user can use the profile email address or provide an override address if allowed by the current settings.

## Daily Digest

The notification system includes daily digest support. Digest content can include due items, followed issue activity, and new items.

## Email Templates

Administrators manage shared email templates under Project Board > Email Templates.

Template editing uses a block-based editor with Alpaca Issue Tracker placeholder blocks for values such as:

- Issue title.
- Actor/performed-by name.
- Event label.
- Comment content.
- Issue link.
- Site title and tagline.
- Site icon.
- Event time.

Daily digest templates have their own placeholder blocks for digest sections and summary values.

The full template block and placeholder reference is documented in [Email Templates](../admin/email-templates.md).

## Mentions And Future Notifications

A mention can create a notification for that comment. It does not automatically opt the mentioned user into all future notifications on the issue unless their preferences also match future activity, such as watched/starred issues, assigned issues, or other enabled subjects.
