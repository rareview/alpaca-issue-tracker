# Extension Points

This page lists supported extension areas for customizing Alpaca Issue Tracker.

Use documented hooks instead of depending on internal component state or private helper methods. When changing permissions or notification routing, test with multiple user roles so the UI and REST behavior stay aligned.

## PHP Filters

### Permissions

`alpaca_user_can`

Customize plugin-level permission decisions.

Example: allow a custom capability to delete issues.

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

### Board Statuses

`alpaca_board_statuses`

Customize the board status terms returned to the board UI.

Example: remove one status column from the board by slug.

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

`alpaca_default_status`

Customize which status is used as the default status when an issue is created.

Example: use a status with the `triage` slug when it exists.

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

### REST API

REST API routes and REST-specific hooks are documented in [REST API](rest-api.md).

### Notifications

`alpaca_notification_channels`

Register or customize notification channels.

Example: disable the built-in email channel for a site.

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

`alpaca_notifications_recipients`

Customize notification recipients.

Example: always notify a project manager user for issue activity.

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

Other notification filters:

- `alpaca_notification_recipient_routes` customizes recipient delivery routes.
- `alpaca_notification_transport_requires_message` controls whether a transport needs a rendered message.
- `alpaca_notification_route_message` customizes a route-specific message.
- `alpaca_notification_route_dispatch` handles custom route delivery.
- `alpaca_notifications_event` customizes the event payload.
- `alpaca_notifications_transports` customizes delivery transports.
- `alpaca_notifications_message` customizes the rendered notification message.

### Daily Digest

Daily digest filters:

- `alpaca_daily_digest_payload` customizes the digest payload.
- `alpaca_should_send_daily_digest_payload` controls whether a digest should be sent.
- `alpaca_daily_digest_summary_block` customizes digest summary markup.
- `alpaca_daily_digest_pre_sections_html` adds markup before digest sections.
- `alpaca_daily_digest_post_sections_html` adds markup after digest sections.
- `alpaca_daily_digest_channel_message` customizes channel-specific digest messages.
- `alpaca_daily_digest_channel_dispatch` handles custom digest dispatch behavior.

Example: skip empty daily digests.

```php
add_filter(
	'alpaca_should_send_daily_digest_payload',
	static function ( $should_send, $payload ) {
		$events = isset( $payload['events'] ) && is_array( $payload['events'] ) ? $payload['events'] : [];

		return $should_send && ! empty( $events );
	},
	10,
	2
);
```

## PHP Actions

`alpaca_init`

Runs during Alpaca Issue Tracker initialization.

Example: register integration behavior after the plugin initializes.

```php
add_action(
	'alpaca_init',
	static function () {
		// Register integration setup here.
	}
);
```

`alpaca_settings_plugin`

Add server-rendered settings UI to the Configure screen.

Example: render an extra settings section below the React settings UI.

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

## JavaScript Filters and Actions

Alpaca Issue Tracker exposes JavaScript extension points through WordPress hooks.

### Settings Screens

`alpaca.settings.tabs`

Add or modify Configure screen tabs.

`alpaca.settings.tabContent`

Add or replace Configure tab content.

Example: add a custom Configure tab.

```jsx
const { addFilter } = wp.hooks;
const { createElement } = wp.element;
const { __ } = wp.i18n;

addFilter('alpaca.settings.tabs', 'my-plugin/settings-tab', (tabs) => [
  ...tabs,
  {
    name: 'my-plugin',
    title: __('My Plugin', 'my-plugin'),
    className: 'alpaca-settings-tab--my-plugin',
  },
]);

addFilter(
  'alpaca.settings.tabContent',
  'my-plugin/settings-tab-content',
  (content, tab, context) => {
    if ('my-plugin' !== tab.name) {
      return content;
    }

    return createElement(
      'div',
      { className: 'alpaca-settings-tab-content' },
      createElement('p', null, __('Custom settings go here.', 'my-plugin')),
    );
  },
);
```

`alpaca.settings.additionalRows`

Add rows to the Settings tab table.

`alpaca.settings.afterTable`

Add content after the Settings tab table.

### Notification Preferences

`alpaca.notificationPreferences.tabs`

Add notification preference tabs.

`alpaca.notificationPreferences.tabContent`

Add notification preference tab content.

### Board and Issue UI

`alpaca.board.controls`

Add controls to the board header.

Example: add a board control button.

```jsx
const { addFilter } = wp.hooks;
const { createElement } = wp.element;
const { __ } = wp.i18n;

const CustomBoardControl = ({ onClearFilter }) =>
  createElement(
    'button',
    {
      type: 'button',
      className: 'components-button is-secondary',
      onClick: onClearFilter,
    },
    __('Clear filters', 'my-plugin'),
  );

addFilter(
  'alpaca.board.controls',
  'my-plugin/board-control',
  (controls, context) => [
    ...controls,
    {
      key: 'my-plugin-clear-filters',
      component: CustomBoardControl,
      props: {
        onClearFilter: context.onClearFilter,
      },
    },
  ],
);
```

`alpaca.item.controls`

Add controls to issue cards.

Example: add a small issue ID badge to each card.

```jsx
const { addFilter } = wp.hooks;
const { createElement } = wp.element;

addFilter('alpaca.item.controls', 'my-plugin/item-control', (controls, item) => [
  ...controls,
  {
    key: 'my-plugin-issue-id',
    isActive: true,
    element: createElement(
      'span',
      { className: 'my-plugin-issue-id' },
      `#${item.id}`,
    ),
  },
]);
```

### Card Datapoints

Card datapoints are the small pieces of issue metadata rendered on board cards. Built-in datapoints include priority, assignees, labels, last activity, comment count, checklist progress, and deadline.

The public registration API is available at `window.alpaca.itemDatapoints`.

| Method | Purpose |
| --- | --- |
| `register( registration )` | Register a new card datapoint. |
| `getRegistered()` | Return registered datapoint metadata. |
| `getVisibility()` | Return the current visibility map. |
| `fetchVisibility()` | Refresh visibility from `wp/v2/settings`. |
| `saveVisibility( visibility )` | Save visibility to `alpaca_item_datapoint_visibility`. |

Registration fields:

| Field | Required | Purpose |
| --- | --- | --- |
| `slug` | Yes | Unique datapoint slug. |
| `callback` | Yes | Function that receives existing content and issue item data, then returns updated content. |
| `label` | No | Human-readable label shown in settings. Falls back to the slug. |
| `description` | No | Short settings description. |
| `namespace` | No | WordPress hook namespace. Falls back to an Alpaca namespace based on the slug. |
| `defaultEnabled` | No | Whether the datapoint is visible by default. Defaults to `true`. |

Example: register a disabled-by-default custom reference datapoint.

```jsx
const { createElement, Fragment } = wp.element;
const { __ } = wp.i18n;

window.alpaca.itemDatapoints.register({
  slug: 'client_reference',
  label: __('Client Reference', 'my-plugin'),
  description: __('Shows a client reference value on issue cards.', 'my-plugin'),
  namespace: 'my-plugin/item/client-reference',
  defaultEnabled: false,
  callback: (content, item) => {
    const reference = item?.meta?.client_reference?.[0];

    if (!reference) {
      return content;
    }

    return createElement(
      Fragment,
      null,
      content,
      createElement(
        'span',
        { className: 'my-plugin-client-reference' },
        reference,
      ),
    );
  },
});
```

The lower-level `alpaca.item.datapoints` filter is also available when an integration needs to modify card datapoint output directly.

Example: append a marker through the filter API.

```jsx
const { addFilter } = wp.hooks;
const { createElement, Fragment } = wp.element;

addFilter(
  'alpaca.item.datapoints',
  'my-plugin/item-marker',
  (content, item) =>
    createElement(
      Fragment,
      null,
      content,
      item?.isInternal
        ? createElement('span', { className: 'my-plugin-marker' }, 'Internal')
        : null,
    ),
);
```

Datapoint visibility changes trigger the `alpaca.item.datapoints.visibilityChanged` JavaScript action. Registry changes trigger `alpaca.item.datapoints.registryChanged`.

Other board and issue UI filters:

- `alpaca.container.menuControls` adds controls to container menus.
- `alpaca.item.datapoints` adds datapoints to issue cards.
- `alpaca.item.card.dataAttributes` adds data attributes to issue cards.
- `alpaca.label_color_options` customizes label color options.
- `alpaca.issue.abovetabs` adds content above issue modal tabs.

### Comments and Activity

`alpaca.commentingTips`

Customize the comment tips shown near comment forms.

Example: add a custom comment tip.

```jsx
const { addFilter } = wp.hooks;
const { __ } = wp.i18n;

addFilter('alpaca.commentingTips', 'my-plugin/comment-tip', (tips) => [
  ...tips,
  __('Use @mentions to notify teammates.', 'my-plugin'),
]);
```

`alpaca.isIssueCommentEditable`

Customize editability checks for issue comments.

### Search and Reporting

`alpaca.search.commentAgentTypes`

Customize which comment agent types are included in search.

Example: include a custom comment agent type in search.

```jsx
const { addFilter } = wp.hooks;

addFilter(
  'alpaca.search.commentAgentTypes',
  'my-plugin/search-agent-types',
  (agentTypes) => [...agentTypes, 'my_custom_agent'],
);
```

`alpaca.reportTab.excludedTaxonomies`

Customize taxonomies excluded from report tab data.

## JavaScript Actions

Common JavaScript actions are available for integrations that need to react to board activity:

- `alpaca.issueSubmitted`
- `alpaca.issueUpdated`
- `alpaca.statusChanged`
- `alpaca.priorityUpdated`
- `alpaca.deadlineUpdated`
- `alpaca.commentPosted`
- `alpaca.commentUpdated`
- `alpaca.commentDeleted`
- `alpaca.issueDeleted`
- `alpaca.watchlistUpdated`
- `alpaca.watchlistSynced`

Example: log issue status changes for a site-specific integration.

```jsx
const { addAction } = wp.hooks;

addAction(
  'alpaca.statusChanged',
  'my-plugin/status-change-log',
  (payload) => {
    window.console.log('Issue status changed', payload);
  },
);
```
