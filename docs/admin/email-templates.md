# Email Templates

Administrators manage shared email templates under Project Board > Email Templates.

The plugin has two template areas:

- Immediate notification emails for issue activity.
- Daily digest emails for grouped summary updates.

Templates are stored in WordPress options and rendered server-side before email delivery.

## Immediate Notification Template

The immediate notification template is used for activity emails such as comments, mentions, assignments, status changes, due date changes, and priority changes.

### Subject Tokens

Subject templates support these placeholder tokens:

| Token                   | Output                                                     |
| ----------------------- | ---------------------------------------------------------- |
| `{{issue_title}}`       | Issue title.                                               |
| `{{actor_name}}`        | Display name of the user who performed the activity.       |
| `{{performed_by}}`      | Same value as `{{actor_name}}`.                            |
| `{{event_label}}`       | Human-readable event label.                                |
| `{{site_name}}`         | Site title.                                                |
| `{{site_title}}`        | Site title.                                                |
| `{{site_tagline}}`      | Site tagline.                                              |
| `{{site_logo_url}}`     | Site icon URL.                                             |
| `{{site_icon_url}}`     | Site icon URL.                                             |
| `{{notifications_url}}` | Link to the current user's notification settings.          |
| `{{event_time}}`        | Event time formatted with the site's date and time format. |
| `{{issue_url}}`         | Link to the issue on the board.                            |

### Body Blocks

The body editor only allows a controlled set of blocks. The custom Alpaca Issue Tracker blocks are:

| Block                | Purpose                                                            |
| -------------------- | ------------------------------------------------------------------ |
| Issue Title          | Renders the issue title.                                           |
| Performed By         | Renders the activity actor.                                        |
| Event Label          | Renders the event label.                                           |
| Full Comment Content | Renders comment text and attachment links. This block is required. |
| Issue Link           | Renders a link to open the issue.                                  |
| Site Title           | Renders the site title.                                            |
| Site Tagline         | Renders the site tagline when one exists.                          |
| Site Icon            | Renders the site icon when one exists.                             |
| Event Time           | Renders the formatted event time.                                  |

The Full Comment Content block is required so comment-driven emails keep the actual comment content in the template. If it is missing, the template save is rejected.

## Daily Digest Template

The daily digest template is used when users enable the daily digest in My Notifications.

### Subject Tokens

Digest subject templates support these placeholder tokens:

| Token                   | Output                                                   |
| ----------------------- | -------------------------------------------------------- |
| `{{site_title}}`        | Site title.                                              |
| `{{site_tagline}}`      | Site tagline.                                            |
| `{{notifications_url}}` | Link to the current user's notification settings.        |
| `{{digest_day}}`        | Human-readable digest day.                               |
| `{{issue_count}}`       | Number of issues included in the digest payload.         |
| `{{activity_count}}`    | Number of activity items included in the digest payload. |
| `{{new_item_count}}`    | Number of new items included in the digest payload.      |

### Body Blocks

The daily digest editor supports these custom blocks:

| Block              | Required | Purpose                                      |
| ------------------ | -------- | -------------------------------------------- |
| Site Icon          | No       | Renders the site icon when one exists.       |
| Issues Falling Due | Yes      | Renders the deadline-watch digest section.   |
| My Issues          | Yes      | Renders followed or relevant issue activity. |
| New Items          | Yes      | Renders newly created issue activity.        |

Required digest section blocks are locked so the digest keeps its core structure. If any required section block is removed, the template save is rejected.

## Storage

Template values are stored as WordPress options:

| Option                                       | Purpose                                         |
| -------------------------------------------- | ----------------------------------------------- |
| `alpaistr_notification_email_subject_template` | Immediate notification email subject.           |
| `alpaistr_notification_email_body_template`    | Immediate notification email body block markup. |
| `alpaistr_daily_digest_subject_template`       | Daily digest email subject.                     |
| `alpaistr_daily_digest_body_template`          | Daily digest email body block markup.           |

Legacy daily digest preamble and postscript options are read during migration, then normalized into the body template.

## Reset Behavior

Resetting a template restores the plugin default subject and body for that template type.

## Developer Notes

- Template bodies are stored as serialized block markup.
- Only allowlisted blocks can be saved.
- Immediate notification rendering happens through the notification email render helpers.
- Daily digest rendering happens through the daily digest render helpers.
- Daily digest section output can be extended with the digest filters documented in [../reference/daily-digest.md](../reference/daily-digest.md).
