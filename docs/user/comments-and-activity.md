# Comments And Activity

Alpaca Issue Tracker uses issue comments and audit entries to show what happened over time.

## Comments

Users can add comments to issues from the issue modal. Comments support:

- Plain text, with selected Markdown formatting.
- Attachments.
- User mentions with `@username` style suggestions.
- Edit and delete actions, when permissions allow.

Comments are stored as WordPress comments with plugin-specific metadata and comment type behavior.

Markdown functionality is provided by the open-source [Marked](https://marked.js.org/license).

## Attachments

Issue and comment attachments are uploaded to an `alpaca` folder within the WordPress site's `uploads` folder, and referenced from comment metadata.

Attachment behavior is intentionally tied to the issue/comment context so files are not deleted from the wrong issue or comment.

Alpaca Issue Tracker uses the site's list of accepted file types.

## Mentions

Mentioning another user in a comment can notify that user. Mention notifications are separate from long-term subscriptions; future notifications depend on that user's notification preferences and issue relationship.

## Activity Timeline

Activity entries are generated for important issue changes, including:

- Issue creation.
- Human comments.
- Status changes.
- Assignment changes.
- Deadline changes.
- High-priority changes.
- Checklist item creation, deletion, assignment, completion, and promotion.
- Issue deletion and restoration audit entries.

## High Priority On Creation

If an issue is created with high priority already enabled, the timeline still records priority activity. This makes it clear that the issue was created as high priority instead of becoming high priority later.

## Deleted And Restored Items

Deleted issues and checklist items can appear in Deleted Items depending on permissions and item state. Restoration creates audit activity so the timeline records that recovery action.
