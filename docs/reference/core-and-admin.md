# Core And Admin Hooks

## Initialization

### `alpaca_init`

**Type:** Action.

**Purpose:** Runs when Alpaca finishes its own initialization so integrations can register follow-up behavior after the plugin is loaded.

**Parameters:** This action does not pass any parameters.

**Source:** `includes/class-alpaca.php:316`.

**Example**

```php
add_action(
	'alpaca_init',
	static function () {
		// Register integration setup here.
	}
);
```

## Permissions

### `alpaca_user_can`

**Type:** Filter.

**Purpose:** Overrides Alpaca's internal permission decisions for plugin actions such as issue deletion, board updates, notification settings access, or REST endpoint permissions.

**Parameters**

| Parameter  | Type     | Description                                                          |
| ---------- | -------- | -------------------------------------------------------------------- |
| `$allowed` | `bool`   | The permission decision calculated by Alpaca before the filter runs. |
| `$action`  | `string` | The Alpaca permission action being evaluated.                        |
| `$args`    | `array`  | Context for the permission check, such as `post_id`.                 |

**Source:** `includes/class-helpers.php:121`.

**Example**

```php
add_filter(
	'alpaca_user_can',
	static function ( $allowed, $action, $args ) {
		if ( 'delete_issue' === $action ) {
			return current_user_can( 'manage_alpaca_issues' );
		}

		return $allowed;
	},
	10,
	3
);
```

## Board And Issue Creation

### `alpaca_board_statuses`

**Type:** Filter.

**Purpose:** Controls which status terms are exposed to the board data builder and therefore which columns appear in the board response.

**Parameters**

| Parameter   | Type    | Description                                                  |
| ----------- | ------- | ------------------------------------------------------------ |
| `$statuses` | `array` | The status term objects returned by `alpaca_get_statuses()`. |

**Source:** `includes/core/board.php:312`.

**Example**

```php
add_filter(
	'alpaca_board_statuses',
	static function ( $statuses ) {
		return array_values(
			array_filter(
				$statuses,
				static function ( $status ) {
					return isset( $status->slug ) && 'internal-review' !== $status->slug;
				}
			)
		);
	}
);
```

### `alpaca_default_status`

**Type:** Filter.

**Purpose:** Chooses the default status term assigned to a newly created issue when the REST issue creation flow does not already have a final status.

**Parameters**

| Parameter      | Type    | Description                                             |
| -------------- | ------- | ------------------------------------------------------- | ----------------------------------------------- |
| `$status_term` | `object | null`                                                   | The status term Alpaca selected as the default. |
| `$statuses`    | `array` | All available status terms considered during selection. |

**Source:** `includes/api/endpoints/issues.php:123`.

**Example**

```php
add_filter(
	'alpaca_default_status',
	static function ( $default_status, $statuses ) {
		foreach ( $statuses as $status ) {
			if ( isset( $status->slug ) && 'triage' === $status->slug ) {
				return $status;
			}
		}

		return $default_status;
	},
	10,
	2
);
```

## Admin UI

### `alpaca_settings_plugin`

**Type:** Action.

**Purpose:** Renders extra server-side content inside the Configure screen below the React-managed settings interface.

**Parameters:** This action does not pass any parameters.

**Source:** `includes/admin/admin-screens.php:81`.

**Example**

```php
add_action(
	'alpaca_settings_plugin',
	static function () {
		?>
		<div class="alpaca-settings-plugin-section">
			<h2><?php esc_html_e( 'Custom Integration', 'my-plugin' ); ?></h2>
			<p><?php esc_html_e( 'Settings for a site-specific integration can render here.', 'my-plugin' ); ?></p>
		</div>
		<?php
	}
);
```

## Migration And Feature Flags

### `alpaca_should_migrate_legacy_watchlist`

**Type:** Filter.

**Purpose:** Enables or disables the temporary migration path that moves legacy watchlist user meta data into the current taxonomy-based storage model.

**Parameters**

| Parameter         | Type   | Description                              |
| ----------------- | ------ | ---------------------------------------- |
| `$should_migrate` | `bool` | Whether the legacy migration should run. |

**Source:** `includes/utilities/functions.php:721`.

## Core WordPress Filters Used By Alpaca

The hooks below are not defined by Alpaca, but Alpaca explicitly calls them and they directly affect plugin behavior.

### `plugin_locale`

**Type:** Filter.

**Purpose:** Lets WordPress or another plugin override the locale Alpaca uses when loading PHP and JavaScript translation files.

**Parameters**

| Parameter  | Type     | Description                         |
| ---------- | -------- | ----------------------------------- |
| `$locale`  | `string` | The locale Alpaca is about to load. |
| `'alpaca'` | `string` | The Alpaca text domain.             |

**Sources**

- `includes/class-alpaca.php:174`
- `includes/class-register.php:126`
