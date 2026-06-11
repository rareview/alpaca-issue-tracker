# Abilities API

Alpaca Issue Tracker registers WordPress Abilities API tools for MCP clients and local agents.

The Abilities API was introduced in WordPress 6.9, which is the plugin's minimum supported WordPress version.

For Cursor and other local agents, the repository also ships an agent skill at `skills/alpaca/SKILL.md`.

## Authentication

Ability requests use normal WordPress REST authentication. For agent use, the recommended approach is WordPress Application Passwords.

1. Open the WordPress application authorization screen:

```text
https://example.com/wp-admin/authorize-application.php?app_name=Alpaca+Local+Agent
```

2. Approve the application and copy the generated Application Password.
3. Send future requests with HTTP Basic Authentication using the WordPress username and Application Password.

## Endpoint Shape

Abilities are exposed through the WordPress Abilities API namespace.

| Purpose        | Route                                                        |
| -------------- | ------------------------------------------------------------ |
| List abilities | `GET /wp-json/wp-abilities/v1/abilities`                     |
| Run an ability | `POST /wp-json/wp-abilities/v1/abilities/{ability-name}/run` |

Run requests use an `input` object:

```json
{
  "input": {
    "id": 123
  }
}
```

## Registered Abilities

| Ability               | Permission     | Purpose                                                        |
| --------------------- | -------------- | -------------------------------------------------------------- |
| `alpaca/get-board`    | `view_board`   | Read board columns and issues.                                 |
| `alpaca/create-issue` | `create_issue` | Create an issue.                                               |
| `alpaca/get-issue`    | `view_board`   | Read detailed issue data.                                      |
| `alpaca/update-issue` | `update_issue` | Update title, content, status, priority, parent, or assignees. |
| `alpaca/delete-issue` | `delete_issue` | Move an issue to the trash.                                    |
| `alpaca/add-comment`  | `create_issue` | Add a comment to an issue.                                     |
| `alpaca/get-comments` | `view_board`   | Read issue comments.                                           |

Permission behavior maps to the same `AlpacaIssueTracker\Helpers::user_can()` checks documented in [REST API](rest-api.md).

## Ability Inputs

### `alpaca/create-issue`

```json
{
  "input": {
    "feedback": "Database query timeout on dashboard",
    "is_high_priority": true
  }
}
```

`feedback` is required. `is_high_priority` is optional.

Creating an issue also creates an activity comment with the `issue-created` tag. If the issue is created as high priority, it also records a high-priority activity entry.

### `alpaca/update-issue`

```json
{
  "input": {
    "id": 123,
    "title": "Updated issue title",
    "content": "Updated issue description",
    "status_id": 45,
    "is_high_priority": false,
    "parent_id": 0,
    "assignees": ["sam"]
  }
}
```

`id` is required. All other fields are optional.

Status, assignee, and priority changes create the same type of activity/audit comments used by the normal issue workflow.

### `alpaca/delete-issue`

```json
{
  "input": {
    "id": 123
  }
}
```

`id` is required. The issue is moved to trash and an `issue-deleted` activity entry is recorded.

### `alpaca/add-comment`

```json
{
  "input": {
    "issue_id": 123,
    "content": "This is ready for another pass."
  }
}
```

`issue_id` and `content` are required. The comment is inserted as an `issuecomment`, last activity is updated, and comment notifications are dispatched.

### `alpaca/get-comments`

```json
{
  "input": {
    "issue_id": 123
  }
}
```

`issue_id` is required. Returned comments include `author_user_agent`, author details, avatar URLs, dates, and these meta fields:

- `alpacaCommentTags`
- `alpacaNotificationContext`
- `alpacaCommentAttachments`

## Current Surface Limitations

The Abilities API covers the core board, issue, and comment workflows. These features still use the admin UI or existing REST endpoints:

- Label creation, update, deletion, or assignment to issues.
- Subissue (checklist item) creation, completion, deletion, or restore. `alpaca/get-issue` may return existing subissues, but subissue management still uses the plugin's REST/UI flow.
- Deadline writes.
- Board column/card reordering beyond status changes. `alpaca/update-issue` status changes update column order for the moved issue, but full board drag-and-drop ordering still uses the plugin's REST/UI flow.
- File upload, attachment deletion, or attachment linking.
- Contextual capture, screenshots, and browser data on issue creation.
- Restoring trashed issues.
- Notification preference reads or writes.

## MCP Adapter

When the WordPress MCP Adapter is installed, these abilities are exposed as MCP tools.

| Ability               | MCP tool name         |
| --------------------- | --------------------- |
| `alpaca/get-board`    | `alpaca-get-board`    |
| `alpaca/create-issue` | `alpaca-create-issue` |
| `alpaca/get-issue`    | `alpaca-get-issue`    |
| `alpaca/update-issue` | `alpaca-update-issue` |
| `alpaca/delete-issue` | `alpaca-delete-issue` |
| `alpaca/add-comment`  | `alpaca-add-comment`  |
| `alpaca/get-comments` | `alpaca-get-comments` |
