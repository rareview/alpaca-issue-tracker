# Daily Digest Hooks

## Payload Selection

### `alpaca_filter_deadlines_by_user_preferences`

**Type:** Filter.

**Purpose:** Controls whether the digest's deadline section is limited by the current user's notification subject preferences or instead evaluates all issues.

**Parameters**

| Parameter                | Type    | Description                                                 |
| ------------------------ | ------- | ----------------------------------------------------------- |
| `$filter_by_preferences` | `bool`  | Whether due-item selection should respect user preferences. |
| `$user_id`               | `int`   | The user receiving the digest.                              |
| `$preferences`           | `array` | The user's notification preferences.                        |

**Source:** `includes/notifications/digest/payload.php:527-532`.

### `alpaca_daily_digest_payload`

**Type:** Filter.

**Purpose:** Rewrites the structured daily digest payload after Alpaca has assembled counts, issue activity, deadline data, and optional new-item rows.

**Parameters**

| Parameter           | Type     | Description                                |
| ------------------- | -------- | ------------------------------------------ |
| `$payload`          | `array`  | The structured digest payload.             |
| `$user_id`          | `int`    | The user receiving the digest.             |
| `$preferences`      | `array`  | The user's notification preferences.       |
| `$window_start_gmt` | `string` | The beginning of the digest window in GMT. |
| `$window_end_gmt`   | `string` | The end of the digest window in GMT.       |

**Source:** `includes/notifications/digest/payload.php:811`.

### `alpaca_should_send_daily_digest_payload`

**Type:** Filter.

**Purpose:** Makes the final send or skip decision for a built digest payload before any channel dispatch begins.

**Parameters**

| Parameter      | Type    | Description                                               |
| -------------- | ------- | --------------------------------------------------------- |
| `$should_send` | `bool`  | Alpaca's default decision based on digest content counts. |
| `$payload`     | `array` | The structured digest payload.                            |
| `$user_id`     | `int`   | The user receiving the digest.                            |
| `$preferences` | `array` | The user's notification preferences.                      |

**Source:** `includes/notifications/digest/worker.php:36`.

**Example**

```php
add_filter(
	'alpaca_should_send_daily_digest_payload',
	static function ( $should_send, $payload ) {
		$has_issue_activity = ! empty( $payload['issue_activity'] );
		$has_new_items      = ! empty( $payload['new_items'] );
		$has_deadlines      = ! empty( $payload['deadline_watch'] );

		return $should_send && ( $has_issue_activity || $has_new_items || $has_deadlines );
	},
	10,
	2
);
```

## HTML Injection Points

### `alpaca_daily_digest_summary_block`

**Type:** Filter.

**Purpose:** Injects custom HTML above the built-in deadline watch section when Alpaca renders the digest placeholder blocks.

**Parameters**

| Parameter       | Type     | Description                            |
| --------------- | -------- | -------------------------------------- |
| `$summary_html` | `string` | HTML inserted before the section list. |
| `$payload`      | `array`  | The structured digest payload.         |
| `$template`     | `array`  | The digest template values.            |

**Source:** `includes/notifications/digest/render.php:534`.

### `alpaca_daily_digest_pre_sections_html`

**Type:** Filter.

**Purpose:** Injects custom HTML between the optional summary block and the first digest content section.

**Parameters**

| Parameter      | Type     | Description                               |
| -------------- | -------- | ----------------------------------------- |
| `$before_html` | `string` | HTML inserted before the digest sections. |
| `$payload`     | `array`  | The structured digest payload.            |
| `$template`    | `array`  | The digest template values.               |

**Source:** `includes/notifications/digest/render.php:535`.

### `alpaca_daily_digest_post_sections_html`

**Type:** Filter.

**Purpose:** Injects custom HTML after the main digest sections have been rendered.

**Parameters**

| Parameter     | Type     | Description                              |
| ------------- | -------- | ---------------------------------------- |
| `$after_html` | `string` | HTML appended after the digest sections. |
| `$payload`    | `array`  | The structured digest payload.           |
| `$template`   | `array`  | The digest template values.              |

**Source:** `includes/notifications/digest/render.php:562`.

## Channel Dispatch

### `alpaca_daily_digest_channel_message`

**Type:** Filter.

**Purpose:** Customizes the rendered digest message for a specific delivery channel before Alpaca dispatches it.

**Parameters**

| Parameter      | Type     | Description                             |
| -------------- | -------- | --------------------------------------- |
| `$message`     | `array`  | The rendered digest message payload.    |
| `$channel`     | `string` | The channel currently being dispatched. |
| `$user_id`     | `int`    | The user receiving the digest.          |
| `$preferences` | `array`  | The user's notification preferences.    |
| `$payload`     | `array`  | The structured digest payload.          |

**Source:** `includes/notifications/digest/render.php:722`.

### `alpaca_daily_digest_channel_dispatch`

**Type:** Filter.

**Purpose:** Short-circuits or replaces Alpaca's built-in digest delivery for a specific channel. Return a boolean to mark the channel as handled.

**Parameters**

| Parameter      | Type     | Description                             |
| -------------- | -------- | --------------------------------------- | --------------------------------------------------------------- |
| `$handled`     | `bool    | null`                                   | Return `true` or `false` to override the default dispatch path. |
| `$channel`     | `string` | The channel currently being dispatched. |
| `$user_id`     | `int`    | The user receiving the digest.          |
| `$preferences` | `array`  | The user's notification preferences.    |
| `$payload`     | `array`  | The structured digest payload.          |
| `$message`     | `array`  | The channel-specific digest message.    |

**Source:** `includes/notifications/digest/render.php:728`.
