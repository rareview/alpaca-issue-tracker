# Project Board

The Project Board is the primary workspace for issue tracking. It displays issues as cards grouped by status columns.

## Status Columns

Statuses are stored as WordPress taxonomy terms and ordered by their status score. Administrators manage statuses under Project Board > Configure > Statuses.

Users can drag issues from column to column. They can also drag issues within a column, to imply a priority order.

:::info
At the narrowest screen sizes, columns are presented as rows.
:::

## Creating Issues

Issues can be created from the board with Add Issue. A new issue can include:

- Title.
- Initial comment.
- Attachments.
- Assignees.
- Labels.
- Deadline.
- High Priority flag.

When an issue is created as High Priority, the timeline includes priority activity so there is visible history that the issue started that way.

## Editing Issues

Opening a card shows the issue modal. Depending on permission and issue state, users can:

- Rename the issue.
- Add or edit comments.
- Upload attachments.
- Change status.
- Change assignees.
- Change labels.
- Change deadline.
- Toggle High Priority.
- Add checklist items.
- Promote checklist items into issues.
- Delete or restore items when permitted.

## Search And Filters

The board supports filtering by:

- Search text.
- Label.
- Assignee.
- Deadline state.

Filters work together, so a label filter and a search query narrow the board at the same time.

## Watchlist

Users can star/watch issues to follow them. Watched issues are used by notification preferences and inbox behavior.

On mobile, the watchlist control is visible on issue cards so users do not need hover behavior.

## Deadlines And Priority

Issues can have deadlines and High Priority state. These values are shown on cards and in issue details when configured. Changes are tracked through the activity system.

## Presence

The board includes a simple presence indicator, showing whether anyone else is viewing the board. This helps teams understand when multiple users may be working in the same board, with the potential for clashing edits.

The Alpaca team is monitoring the development of new collaboration functionality in core WordPress.
