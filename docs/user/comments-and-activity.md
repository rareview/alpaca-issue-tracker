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

### Formatting Comments

The comment field shows a rich preview as you type. Supported inline formatting includes **bold**, _italic_, combined **_bold and italic_**, `inline code`, and links. The Markdown markers are hidden in the preview; the comment is still stored as Markdown.

Select text in the comment field before using a formatting shortcut. You can drag across the visible text or double-click a word.

| Action                                    | macOS   | Windows / Linux |
| ----------------------------------------- | ------- | --------------- |
| Toggle bold                               | `Cmd+B` | `Ctrl+B`        |
| Toggle italic                             | `Cmd+I` | `Ctrl+I`        |
| Open the link editor                      | `Cmd+K` | `Ctrl+K`        |
| Undo the latest formatting or link change | `Cmd+Z` | `Ctrl+Z`        |

Bold and italic can be combined. For example, selecting a bold word and applying italic keeps the bold formatting. Applying the same shortcut again to the selected word removes that style.

You can also type Markdown directly: `**bold**`, `*italic*`, or `***bold and italic***`. Wrap inline code in single backticks.

### Adding And Editing Links

- Select text and press `Cmd+K` or `Ctrl+K`. The link editor opens with the URL field focused. Enter a URL, adjust the link text if needed, and click **Apply**. Pressing `Enter` in either field also applies the change.
- To create a link directly, copy a complete `http://` or `https://` URL and paste it over selected text. For example, pasting `https://example.com` over `label` creates `[label](https://example.com)`.
- Click an existing link in the comment editor to change its URL or text. Clear the URL and click **Apply** to keep the text without a link.
- Click **Cancel** or press `Escape` to close the link editor without applying its changes.
- Use `Cmd+Z` or `Ctrl+Z` to undo a link change, including a paste-to-link conversion. Undo restores the original text and selection.

## Attachments

Issue and comment attachments are uploaded to an `alpaca` folder within the WordPress site's `uploads` folder, and referenced from comment metadata.

Attachment behavior is intentionally tied to the issue/comment context so files are not deleted from the wrong issue or comment.

Alpaca Issue Tracker uses the site's list of accepted file types.

## Mentions

Mentioning another user in a comment can notify that user. Mention notifications are separate from long-term subscriptions; future notifications depend on that user's notification preferences and issue relationship.

Type `@` followed by part of a user's name to see suggestions. Select a user from the list, or use the arrow keys and press `Enter` or `Tab`. Press `Escape` to dismiss the list. Clicking elsewhere in the comment updates the suggestions for the new caret position.

## Linking To Other Issues

Type `#` at the beginning of a comment or after a space to open the issue picker. Enter at least three characters in its search field, then choose an issue to insert a reference. Clicking elsewhere in the comment closes the picker when the caret is no longer at the `#` trigger.

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
