# Notification Hooks

## Comment Notification Dispatch Paths

Immediate issue-comment notifications use `alpaistr_dispatch_new_comment_notifications()` as the shared dispatch helper. The helper syncs mention metadata, skips non-`issuecomment` comments, skips unapproved comments, builds the notification event from the saved comment, and passes that event into the notification delivery pipeline.

The helper is reached through three creation paths:

- REST comments created through `/wp/v2/comments`: `rest_after_insert_comment` calls `alpaistr_handle_rest_insert_comment_notifications()` after the REST controller has saved comment meta. This path also normalizes attachment meta before dispatching, and only dispatches on comment creation.
- Abilities API comments created through `alpaca/add-comment`: `alpaistr_ability_add_comment()` calls `alpaistr_dispatch_new_comment_notifications()` directly after inserting the comment. This is needed because Abilities requests run inside REST, but they do not use the core comments REST controller.
- Non-REST comments inserted with `wp_insert_comment()`: `wp_insert_comment` calls `alpaistr_handle_new_comment_notifications()` for direct PHP, WP-CLI, or similar inserts. The handler intentionally returns during REST requests so REST comments are not dispatched before their meta is saved.

## Channel Registration And Preferences

### `alpaca_notification_channels`

**Type:** Filter.

**Purpose:** Registers, removes, or adjusts available notification channels before Alpaca normalizes the channel registry used by settings, delivery, and digest logic.

**Parameters**

| Parameter   | Type    | Description                                  |
| ----------- | ------- | -------------------------------------------- |
| `$channels` | `array` | Raw channel definitions keyed by channel ID. |

**Example**

```php
add_filter(
	'alpaca_notification_channels',
	static function ( $channels ) {
		if ( isset( $channels['email'] ) ) {
			$channels['email']['is_available'] = false;
		}

		return $channels;
	}
);
```

### `alpaistr_notification_builtin_inbox_is_enabled`

**Type:** Filter.

**Purpose:** Enables or disables Alpaca Issue Tracker's built-in inbox capture when notifications are processed.

**Parameters**

| Parameter  | Type   | Description                       |
| ---------- | ------ | --------------------------------- |
| `$enabled` | `bool` | Whether inbox capture is enabled. |

## Recipient Resolution And Routing

### `alpaca_notification_recipient_routes`

**Type:** Filter.

**Purpose:** Rewrites the resolved delivery routes for a recipient after Alpaca Issue Tracker has matched the user's enabled channels and transport details.

**Parameters**

| Parameter    | Type    | Description                                    |
| ------------ | ------- | ---------------------------------------------- |
| `$routes`    | `array` | The route list Alpaca built for the recipient. |
| `$recipient` | `array` | The recipient data being processed.            |
| `$event`     | `array` | The notification event payload.                |
| `$channels`  | `array` | The normalized channel registry.               |

### `alpaistr_notification_transport_requires_message`

**Type:** Filter.

**Purpose:** Declares whether a transport needs a rendered message payload before Alpaca attempts delivery.

**Parameters**

| Parameter    | Type     | Description                                       |
| ------------ | -------- | ------------------------------------------------- |
| `$required`  | `bool`   | Whether the transport requires a message payload. |
| `$transport` | `string` | The transport key being evaluated.                |

### `alpaca_notification_route_message`

**Type:** Filter.

**Purpose:** Customizes the message payload for one specific delivery route after the shared notification message has been rendered.

**Parameters**

| Parameter    | Type    | Description                                    |
| ------------ | ------- | ---------------------------------------------- |
| `$message`   | `array` | The base message payload for the notification. |
| `$route`     | `array` | The route that will receive the message.       |
| `$recipient` | `array` | The current recipient.                         |
| `$event`     | `array` | The notification event payload.                |

### `alpaca_notification_route_dispatch`

**Type:** Filter.

**Purpose:** Short-circuits or replaces the default route dispatch logic. Return a boolean to signal that the route has been handled.

**Parameters**

| Parameter    | Type         | Description                                                                            |
| ------------ | ------------ | -------------------------------------------------------------------------------------- |
| `$handled`   | `bool\|null` | Return `true` or `false` to override Alpaca Issue Tracker's default dispatch behavior. |
| `$route`     | `array`      | The route being dispatched.                                                            |
| `$recipient` | `array`      | The current recipient.                                                                 |
| `$event`     | `array`      | The notification event payload.                                                        |
| `$message`   | `array`      | The route-specific message payload.                                                    |

## Event Processing

### `alpaca_notifications_event`

**Type:** Filter.

**Purpose:** Adjusts the raw notification event before recipient resolution and message rendering begin.

**Parameters**

| Parameter | Type    | Description                                      |
| --------- | ------- | ------------------------------------------------ |
| `$event`  | `array` | The event payload derived from comment activity. |

### `alpaca_notifications_recipients`

**Type:** Filter.

**Purpose:** Adds, removes, or rewrites the final recipient list for an event.

**Parameters**

| Parameter     | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| `$recipients` | `array` | The recipients resolved by Alpaca. |
| `$event`      | `array` | The notification event payload.    |

**Example**

```php
add_filter(
	'alpaca_notifications_recipients',
	static function ( $recipients, $event ) {
		$manager = get_user_by( 'email', 'project-manager@example.com' );

		if ( $manager ) {
			$recipients[] = (int) $manager->ID;
			$recipients   = array_values( array_unique( array_map( 'intval', $recipients ) ) );
		}

		return $recipients;
	},
	10,
	2
);
```

### `alpaca_notifications_transports`

**Type:** Filter.

**Purpose:** Limits or expands the transport keys allowed to deliver a notification for the current event.

**Parameters**

| Parameter     | Type    | Description                                          |
| ------------- | ------- | ---------------------------------------------------- |
| `$transports` | `array` | The allowed transport keys. Defaults to `['email']`. |
| `$event`      | `array` | The notification event payload.                      |
| `$recipients` | `array` | The resolved recipients.                             |
| `$context`    | `array` | An empty array reserved for future context.          |

### `alpaca_notifications_message`

**Type:** Filter.

**Purpose:** Rewrites the shared rendered notification message before it is adapted per route.

**Parameters**

| Parameter     | Type    | Description                                         |
| ------------- | ------- | --------------------------------------------------- |
| `$message`    | `array` | The rendered message payload with subject and HTML. |
| `$event`      | `array` | The notification event payload.                     |
| `$recipients` | `array` | The recipient list for the event.                   |

## Delivery Result Actions

### `alpaca_notifications_sent`

**Type:** Action.

**Purpose:** Fires after Alpaca successfully dispatches a notification to one recipient and route.

**Parameters**

| Parameter        | Type    | Description                        |
| ---------------- | ------- | ---------------------------------- |
| `$recipient`     | `array` | The recipient that was notified.   |
| `$event`         | `array` | The notification event payload.    |
| `$route_message` | `array` | The message payload that was sent. |

### `alpaca_notifications_failed`

**Type:** Action.

**Purpose:** Fires after Alpaca fails to dispatch a notification to one recipient and route.

**Parameters**

| Parameter        | Type    | Description                                   |
| ---------------- | ------- | --------------------------------------------- |
| `$recipient`     | `array` | The recipient that failed delivery.           |
| `$event`         | `array` | The notification event payload.               |
| `$route_message` | `array` | The message payload Alpaca attempted to send. |

## Core WordPress Filters Used During Mail Delivery

The hooks below are WordPress core filters. Alpaca invokes them when preparing notification sender details.

### `wp_mail_from`

**Type:** Filter.

**Purpose:** Overrides the sender email address used for Alpaca notification emails.

**Parameters**

| Parameter          | Type     | Description                                                          |
| ------------------ | -------- | -------------------------------------------------------------------- |
| `$default_address` | `string` | The sender address Alpaca derived from the site host or admin email. |

### `wp_mail_from_name`

**Type:** Filter.

**Purpose:** Overrides the sender display name used for Alpaca notification emails.

**Parameters**

| Parameter       | Type     | Description                                        |
| --------------- | -------- | -------------------------------------------------- |
| `$default_name` | `string` | The sender name Alpaca will use if not overridden. |
