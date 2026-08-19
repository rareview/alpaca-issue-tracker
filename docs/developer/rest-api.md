# REST API

Alpaca Issue Tracker registers custom REST routes under the `alpaca/v1` namespace and also filters selected WordPress core comment routes for issue comments.

The plugin also exposes abilities through the WordPress Abilities API (`wp-abilities/v1`), which allows MCP clients and AI agents to interact with the tracker programmatically. See [Abilities API](abilities-api.md) for the ability reference and authentication flow.

Most write routes call `validate_rest_nonce_permission()`, which checks capabilities and, for cookie-authenticated requests only, requires a valid `wp_rest` nonce (via `X-WP-Nonce` or a `nonce` parameter). Application Passwords and other non-cookie authentication methods are not required to send a nonce, matching WordPress Core REST behavior.

## Method Names

This reference uses plain HTTP method names. In code, some endpoints use WordPress REST constants:

- `WP_REST_Server::READABLE`: `GET`.
- `WP_REST_Server::CREATABLE`: `POST`.
- `WP_REST_Server::EDITABLE`: `POST`, `PUT`, or `PATCH`.
- `WP_REST_Server::DELETABLE`: `DELETE`.

## Permissions

Permissions are checked through `AlpacaIssueTracker\Helpers::user_can()` and `AlpacaIssueTracker\Helpers::validate_rest_nonce_permission()`.

Common permission actions:

| Permission action              | Default capability |
| ------------------------------ | ------------------ |
| `view_board`                   | `edit_posts`       |
| `get_issue`                    | `edit_posts`       |
| `comment_count`                | `edit_posts`       |
| `list_users`                   | `edit_posts`       |
| `presence`                     | `edit_posts`       |
| `watchlist`                    | `edit_posts`       |
| `get_statuses`                 | `edit_posts`       |
| `notification_preferences`     | `edit_posts`       |
| `notification_inbox`           | `edit_posts`       |
| `create_issue`                 | `edit_posts`       |
| `update_issue`                 | `edit_posts`       |
| `update_board`                 | `edit_posts`       |
| `watchlist_toggle`             | `edit_posts`       |
| `register_comment_meta`        | `edit_posts`       |
| `delete_issue`                 | `manage_options`   |
| `manage_options`               | `manage_options`   |
| `options_update`               | `manage_options`   |
| `notification_template_manage` | `manage_options`   |
| `restore_statuses`             | `manage_options`   |
| `update_status`                | `manage_options`   |

Custom permission behavior should use the `alpaca_user_can` filter documented in [../reference/core-and-admin.md](../reference/core-and-admin.md).

## Issue Endpoints

| Method   | Route                                   | Permission               | Purpose                                                      |
| -------- | --------------------------------------- | ------------------------ | ------------------------------------------------------------ |
| `POST`   | `/wp-json/alpaca/v1/submit`             | `create_issue` + nonce   | Create a new issue.                                          |
| `POST`   | `/wp-json/alpaca/v1/update/{id}`        | `update_issue` + nonce   | Update an issue title, content, parent, taxonomies, or meta. |
| `POST`   | `/wp-json/alpaca/v1/subissues`          | `create_issue` + nonce   | Create a subissue under a parent issue.                      |
| `GET`    | `/wp-json/alpaca/v1/get/{id}`           | `comment_count`          | Get full issue details.                                      |
| `GET`    | `/wp-json/alpaca/v1/comment-count/{id}` | `list_users`             | Get issue comment counts and last activity.                  |
| `GET`    | `/wp-json/alpaca/v1/deleted-items`      | `manage_options`         | List trashed issues for the Deleted Items screen.            |
| `POST`   | `/wp-json/alpaca/v1/restore/{id}`       | `manage_options` + nonce | Restore a trashed issue.                                     |
| `DELETE` | `/wp-json/alpaca/v1/delete/{id}`        | `delete_issue` + nonce   | Trash an issue.                                              |

### Create Issue

`POST /wp-json/alpaca/v1/submit`

Expected JSON payload includes:

```json
{
  "userinput": {
    "feedback": "Issue title or report text",
    "includeContext": true,
    "isHighPriority": false
  }
}
```

When `includeContext` is true, the endpoint can store contextual capture data from `client`, `server`, `wp`, `headers`, and `errors` payload sections.

### Update Issue

`POST /wp-json/alpaca/v1/update/{id}`

Supported JSON fields include:

```json
{
  "title": "Updated title",
  "content": "Updated issue body",
  "post_parent": 123,
  "taxonomies": {
    "alpaca_status": [51],
    "alpaca_label": [88],
    "alpaca_assignee": ["user-slug"]
  },
  "meta": {
    "high_priority": true
  }
}
```

`alpaca_assignee` expects WordPress user slugs and resolves them to assignee taxonomy terms.

### Create Subissue

`POST /wp-json/alpaca/v1/subissues`

Expected JSON payload:

```json
{
  "parent_id": 123,
  "content": "Checklist item title"
}
```

### Deleted Items

`GET /wp-json/alpaca/v1/deleted-items`

Supported query parameters:

| Parameter  | Purpose                           |
| ---------- | --------------------------------- |
| `search`   | Optional search string.           |
| `page`     | Page number. Defaults to `1`.     |
| `per_page` | Items per page. Defaults to `20`. |

## Board And Status Endpoints

| Method | Route                                          | Permission                 | Purpose                                   |
| ------ | ---------------------------------------------- | -------------------------- | ----------------------------------------- |
| `GET`  | `/wp-json/alpaca/v1/board`                     | `get_statuses`             | Get board columns and issues.             |
| `POST` | `/wp-json/alpaca/v1/board`                     | `update_board` + nonce     | Save issue ordering inside board columns. |
| `GET`  | `/wp-json/alpaca/v1/statuses`                  | `get_statuses`             | Get status terms.                         |
| `POST` | `/wp-json/alpaca/v1/status/{id}`               | `update_status` + nonce    | Update a status name, slug, or score.     |
| `POST` | `/wp-json/alpaca/v1/statuses/restore-defaults` | `restore_statuses` + nonce | Restore default status terms.             |

### Update Board

`POST /wp-json/alpaca/v1/board`

Expected JSON payload is an array of columns:

```json
[
  {
    "id": 51,
    "issues": [123, 124, 125]
  }
]
```

### Update Status

`POST /wp-json/alpaca/v1/status/{id}`

Supported JSON fields:

```json
{
  "name": "In Review",
  "term_score": 30
}
```

`term_score` must be numeric and inside the allowed status score range.

## Users, Labels, And Watchlist Endpoints

| Method   | Route                           | Permission                 | Purpose                                         |
| -------- | ------------------------------- | -------------------------- | ----------------------------------------------- |
| `GET`    | `/wp-json/alpaca/v1/users`      | `watchlist`                | Get assignable users.                           |
| `GET`    | `/wp-json/alpaca/v1/labels`     | `watchlist`                | Get labels.                                     |
| `POST`   | `/wp-json/alpaca/v1/labels`     | `manage_options` + nonce   | Create a label.                                 |
| `POST`   | `/wp-json/alpaca/v1/label/{id}` | `manage_options` + nonce   | Update a label.                                 |
| `DELETE` | `/wp-json/alpaca/v1/label/{id}` | `manage_options` + nonce   | Delete a label.                                 |
| `GET`    | `/wp-json/alpaca/v1/watchlist`  | `watchlist`                | Get the current user's watched issue IDs.       |
| `POST`   | `/wp-json/alpaca/v1/watchlist`  | `watchlist_toggle` + nonce | Toggle or replace the current user's watchlist. |

### Create Or Update Label

Supported JSON fields:

```json
{
  "name": "Design",
  "color": "#172b4d"
}
```

### Update Watchlist

Preferred JSON payload for replacing the user's watchlist:

```json
{
  "watchlist": [123, 124]
}
```

Backward-compatible JSON payload for toggling one issue:

```json
{
  "issue_id": 123
}
```

## Notification Endpoints

| Method                 | Route                                                     | Permission                             | Purpose                                         |
| ---------------------- | --------------------------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| `GET`                  | `/wp-json/alpaca/v1/notification-preferences`             | `notification_preferences`             | Get current user's notification preferences.    |
| `POST`, `PUT`, `PATCH` | `/wp-json/alpaca/v1/notification-preferences`             | `notification_preferences` + nonce     | Update current user's notification preferences. |
| `GET`                  | `/wp-json/alpaca/v1/notification-inbox`                   | `notification_inbox`                   | Get inbox items.                                |
| `GET`                  | `/wp-json/alpaca/v1/notification-inbox/count`             | `notification_inbox`                   | Get unread inbox count.                         |
| `POST`                 | `/wp-json/alpaca/v1/notification-inbox/mark-read`         | `notification_inbox` + nonce           | Mark inbox items as read.                       |
| `POST`                 | `/wp-json/alpaca/v1/notification-inbox/mark-unread`       | `notification_inbox` + nonce           | Mark inbox items as unread.                     |
| `POST`                 | `/wp-json/alpaca/v1/notification-inbox/mark-all-read`     | `notification_inbox` + nonce           | Mark all inbox items as read.                   |
| `GET`                  | `/wp-json/alpaca/v1/notification-template`                | `notification_template_manage`         | Get the email notification template.            |
| `POST`, `PUT`, `PATCH` | `/wp-json/alpaca/v1/notification-template`                | `notification_template_manage` + nonce | Update the email notification template.         |
| `POST`                 | `/wp-json/alpaca/v1/notification-template/preview`        | `notification_template_manage` + nonce | Preview the email notification template.        |
| `POST`                 | `/wp-json/alpaca/v1/notification-template/test`           | `notification_template_manage` + nonce | Send a test email notification.                 |
| `POST`                 | `/wp-json/alpaca/v1/notification-template/reset`          | `notification_template_manage` + nonce | Reset the email notification template.          |
| `GET`                  | `/wp-json/alpaca/v1/notification-digest-template`         | `notification_template_manage`         | Get the daily digest template.                  |
| `POST`, `PUT`, `PATCH` | `/wp-json/alpaca/v1/notification-digest-template`         | `notification_template_manage` + nonce | Update the daily digest template.               |
| `POST`                 | `/wp-json/alpaca/v1/notification-digest-template/preview` | `notification_template_manage` + nonce | Preview the daily digest template.              |
| `POST`                 | `/wp-json/alpaca/v1/notification-digest-template/test`    | `notification_template_manage` + nonce | Send a test daily digest.                       |
| `POST`                 | `/wp-json/alpaca/v1/notification-digest-template/reset`   | `notification_template_manage` + nonce | Reset the daily digest template.                |

### Notification Inbox Query Parameters

`GET /wp-json/alpaca/v1/notification-inbox`

| Parameter  | Purpose                                                 |
| ---------- | ------------------------------------------------------- |
| `page`     | Page number. Defaults to `1`.                           |
| `per_page` | Items per page. Defaults to `20` and is capped at `50`. |
| `filter`   | `unread` or `all`. Defaults to `unread`.                |

### Mark Inbox Items

`POST /wp-json/alpaca/v1/notification-inbox/mark-read`

`POST /wp-json/alpaca/v1/notification-inbox/mark-unread`

Expected JSON payload:

```json
{
  "item_ids": [12, 13]
}
```

### Notification Preferences

Update payloads use a `preferences` object:

```json
{
  "preferences": {
    "instant": {},
    "digest": {}
  }
}
```

### Notification Templates

Template update, preview, and test endpoints accept:

```json
{
  "subject": "{{issue_title}} updated",
  "body": "<!-- wp:paragraph --><p>{{comment}}</p><!-- /wp:paragraph -->"
}
```

## Attachment Endpoints

| Method | Route                                           | Permission                      | Purpose                                   |
| ------ | ----------------------------------------------- | ------------------------------- | ----------------------------------------- |
| `POST` | `/wp-json/alpaca/v1/comment-attachments`        | `register_comment_meta` + nonce | Upload a comment attachment for an issue. |
| `POST` | `/wp-json/alpaca/v1/comment-attachments/delete` | `register_comment_meta` + nonce | Delete a comment attachment.              |

### Upload Attachment

`POST /wp-json/alpaca/v1/comment-attachments`

Expected multipart form data:

| Field      | Purpose          |
| ---------- | ---------------- |
| `issue_id` | Target issue ID. |
| `file`     | Uploaded file.   |

The upload uses WordPress allowed MIME types and stores the file in an issue-specific upload directory.

### Delete Attachment

`POST /wp-json/alpaca/v1/comment-attachments/delete`

Expected JSON or form fields:

| Field        | Purpose                                           |
| ------------ | ------------------------------------------------- |
| `issue_id`   | Target issue ID.                                  |
| `comment_id` | Optional comment ID used for stricter validation. |
| `url`        | Attachment URL to delete.                         |

## Presence, Capture, And Proxy Endpoints

| Method | Route                               | Permission                                  | Purpose                                                              |
| ------ | ----------------------------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| `POST` | `/wp-json/alpaca/v1/presence`       | `presence` + nonce                          | Update current user's board presence and return other present users. |
| `GET`  | `/wp-json/alpaca/v1/report-context` | `create_issue` + nonce                      | Return contextual capture data for the current request.              |
| `GET`  | `/wp-json/alpaca/v1/proxy`          | `view_board` + nonce or valid `proxy_token` | Proxy an image for screenshot capture.                               |

### Image Proxy

`GET /wp-json/alpaca/v1/proxy`

Supported query parameters:

| Parameter     | Purpose                                     |
| ------------- | ------------------------------------------- |
| `url`         | External image URL to proxy. Required.      |
| `nonce`       | Same-origin WordPress REST nonce.           |
| `proxy_token` | Signed token used when cookies are omitted. |

The proxy rejects unsafe private or reserved IP targets.

## WordPress Core Comment Routes

Issue comments use WordPress comments with the `issuecomment` type, so the plugin extends selected WordPress core comment routes instead of registering separate comment CRUD routes.

| Method | Route                          | Purpose                                           |
| ------ | ------------------------------ | ------------------------------------------------- |
| `GET`  | `/wp-json/wp/v2/comments`      | List issue comments when explicitly requested.    |
| `POST` | `/wp-json/wp/v2/comments`      | Create issue comments for Alpaca issues.          |
| `GET`  | `/wp-json/wp/v2/comments/{id}` | Read one issue comment when explicitly requested. |

For hidden issue comments, REST reads must explicitly target the issue comment type and opt into visibility:

```text
comment_type=issuecomment
alpaca_include_hidden_comments=1
context=edit
```

Collection requests that include a `post` parameter must target `alpaca_issue` posts. Comment creation also requires an `alpaca_issue` post target.

## REST Extension Hooks

### Response Object Filter

`alpaca_rest_response_object`

Filter the final REST response object.

Example: add a custom header to successful Alpaca Issue Tracker REST responses.

```php
add_filter(
	'alpaca_rest_response_object',
	static function ( $response, $action_type, $data, $status ) {
		if ( $status >= 200 && $status < 300 ) {
			$response->header( 'X-Alpaca-Handled', '1' );
		}

		return $response;
	},
	10,
	4
);
```

### REST Root Filter

`alpaca_rest_api_root`

Filter the REST API root used by localized JavaScript settings.

Example: point Alpaca Issue Tracker REST requests at a custom REST root.

```php
add_filter(
	'alpaca_rest_api_root',
	static function ( $root ) {
		return trailingslashit( home_url( '/wp-json/' ) );
	}
);
```

### Private Comment Visibility Filters

`private_comments_rest_visibility_param` customizes the request parameter used to opt into hidden issue comments.

`private_comments_user_can_view_type` customizes who can view private issue comments by comment type.

Example: restrict hidden issue comments to administrators.

```php
add_filter(
  'private_comments_user_can_view_type',
	static function ( $allowed, $comment_type ) {
		if ( 'issuecomment' === $comment_type ) {
			return current_user_can( 'manage_options' );
		}

		return $allowed;
	},
	10,
	2
);
```

### REST Lifecycle Actions

- `alpaistr_rest_response` fires for every wrapped Alpaca Issue Tracker REST response.
- `alpaca_rest_{action_type}` fires for successful responses with an action type.
- `alpaca_rest_error_{action_type}` fires for error responses with an action type.
