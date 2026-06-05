# Data Model

Alpaca Issue Tracker stores issue-tracking data with WordPress-native data types plus a small number of plugin-owned tables for notifications.

## Post Types

| Type | Purpose | Notes |
| --- | --- | --- |
| `alpaca_issue` | Main issue record. | Private post type. Exposed to REST. Supports editor, custom fields, author, and comments. |

## Taxonomies

| Taxonomy | Purpose |
| --- | --- |
| `alpaca_status` | Board columns and issue workflow status. |
| `alpaca_label` | Issue labels. |
| `alpaca_assignee` | Issue assignees. |
| `alpaca_watching` | Users watching or starring issues. |
| `alpaca_browser` | Captured browser context. |
| `alpaca_phptemplate` | Captured PHP template context. |
| `alpaca_type` | Captured issue type context. |

## Term Meta

| Taxonomy | Meta key | Purpose |
| --- | --- | --- |
| `alpaca_status` | `term_score` | Numeric sort/order score for board statuses. |
| `alpaca_label` | `alpaca_label_color` | Hex color used for label display. |

## Issue Meta

| Meta key | Purpose |
| --- | --- |
| `alpaca_high_priority` | Marks an issue as high priority. |
| `alpaca_deadline` | Stores the issue due date/deadline. |
| `alpaca_lastActivity` | Stores the most recent issue activity timestamp. |
| `alpaca_subissue_completed` | Marks a subissue/checklist item as completed. |
| `alpaca_trashed_with_parent` | Tracks child issues trashed with a parent issue. |
| `alpaca_status_before_parent_trash` | Stores the previous child status before parent trash behavior. |
| `alpaca_screenwidth` | Captured browser viewport width for contextual reports. |
| `alpaca_screenheight` | Captured browser viewport height for contextual reports. |
| `alpaca_url` | Captured request URL for contextual reports. |
| `alpaca_queried_object` | Captured queried object data for contextual reports. |
| `alpaca_headers` | Captured request header data for contextual reports. |
| `alpaca_errors` | Captured client or server error data for contextual reports. |

## Comments

Issue discussion uses WordPress comments with comment type `issuecomment` attached to `alpaca_issue` posts.

Hidden issue comments are loaded through explicit Alpaca REST behavior and should only apply to `alpaca_issue` posts.

## Comment Meta

| Meta key | Purpose |
| --- | --- |
| `alpacaCommentTags` | Activity/timeline tags for a comment. |
| `alpacaCommentAttachments` | Attachment URLs associated with a comment. |
| `alpacaMentionedUsers` | Structured user data for users mentioned in a comment. |
| `alpacaCommentLastEdit` | Metadata for the latest comment edit. |
| `alpacaNotificationContext` | Structured notification context for activity comments. |

## User Meta

| Meta key | Purpose |
| --- | --- |
| `alpaca_notification_preferences` | Per-user notification and digest preferences. |
| `alpaca_watchlist` | Legacy watchlist storage read for compatibility. |

Current watch/watchlist behavior is represented by the `alpaca_watching` taxonomy.

## Notification Tables

The notification system creates plugin-owned tables for inbox and digest scheduling.

| Table | Purpose |
| --- | --- |
| `{prefix}alpaca_inbox` | Stores in-app notification inbox items. |
| `{prefix}alpaca_notification_digest_schedule` | Stores next digest run information per user. |
| `{prefix}alpaca_notification_digest_delivery` | Stores digest delivery history/status rows. |

## Attachments

Comment attachments are uploaded through the comment attachment REST endpoints.

Files are stored under the WordPress uploads directory in an Alpaca issue-specific subdirectory:

```text
wp-content/uploads/alpaca/{issue-slug}/
```

The comment stores attachment URLs in `alpacaCommentAttachments`.

## Options

Site-wide settings and internal schema versions are documented in [Settings and Options](settings-options.md).
