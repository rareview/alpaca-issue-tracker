# Settings and Options

This page documents the main WordPress options and user meta keys used by Alpaca Issue Tracker.

## REST-Registered Settings

These options are registered with WordPress settings and exposed through `wp/v2/settings`.

| Option | Type | Default | Purpose |
| --- | --- | --- | --- |
| `alpaistr_enable_test_logs` | string | `0` | Enables test/debug console messages. |
| `alpaistr_enable_context_capture` | string | `1` | Enables contextual capture behavior. |
| `alpaistr_item_datapoint_visibility` | object | `{}` | Stores enabled/disabled card datapoints by datapoint slug. |

## Template Options

These options store shared email template settings.

| Option | Purpose |
| --- | --- |
| `alpaistr_notification_email_subject_template` | Immediate notification email subject template. |
| `alpaistr_notification_email_body_template` | Immediate notification email body block markup. |
| `alpaistr_notification_email_template_context` | Temporary notification template editing context; deleted after the template is saved. |
| `alpaistr_daily_digest_subject_template` | Daily digest email subject template. |
| `alpaistr_daily_digest_body_template` | Daily digest email body block markup. |
| `alpaistr_daily_digest_preamble_template` | Legacy daily digest preamble read during template migration. |
| `alpaistr_daily_digest_postscript_template` | Legacy daily digest postscript read during template migration. |

Template behavior is documented in [Email Templates](../admin/email-templates.md).

## Internal Options

These options support plugin internals and should not be edited manually unless debugging a specific issue.

| Option | Purpose |
| --- | --- |
| `alpaistr_default_status_id` | Stores the default board status term ID after default status creation. |
| `alpaistr_needs_term_setup` | Internal setup flag used during install/update flows for default terms. |
| `alpaistr_board_cache_version` | Cache-busting version for board cache keys. |
| `alpaistr_notification_inbox_schema_version` | Installed schema version for the notification inbox table. |
| `alpaistr_notification_digest_schema_version` | Installed schema version for digest schedule/delivery tables. |

## User Meta

| User meta key | Purpose |
| --- | --- |
| `alpaca_notification_preferences` | Stores the user's notification subjects, event categories, channels, label selections, and digest preferences. |
| `alpaca_watchlist` | Legacy watchlist data read for compatibility. |

## Notification Preference Shape

Notification preferences are normalized before saving. The current structure includes:

| Key | Purpose |
| --- | --- |
| `channels` | Immediate notification delivery channels, including email settings. |
| `digests.daily` | Daily digest enabled state, channels, and send time. |
| `label_ids` | Label IDs watched by the user. |
| `subjects` | Issue subject categories such as created, assigned, starred, mentioned, labeled, high priority, and all new tasks. |
| `events` | Event categories such as comments, status changes, assignment changes, due date changes, checklist activity, and priority changes. |

## Card Datapoint Visibility

Card datapoint visibility is stored in `alpaistr_item_datapoint_visibility` as a boolean map keyed by datapoint slug.

Example:

```json
{
  "priority": true,
  "assignees": true,
  "deadline": false
}
```

If a datapoint slug is missing from the option, the datapoint's registered `defaultEnabled` value is used.
