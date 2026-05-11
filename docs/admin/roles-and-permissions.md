# Roles And Permissions

Alpaca Issue Tracker uses WordPress capabilities rather than custom plugin roles.

## Default Access

Users with `edit_posts` can access the main project workflow by default. In standard WordPress roles, that usually means Contributors and above.

Users with `manage_options` can access site-wide configuration and template management. In standard WordPress roles, that usually means Administrators.

## Admin Screens

| Screen | Default capability |
| --- | --- |
| Project Board | `edit_posts` |
| Project Activity | `edit_posts` |
| My Notifications | `edit_posts` |
| Configure | `manage_options` |
| Email Templates | `manage_options` |

## Issue Workflows

Users with `edit_posts` can usually:

- View the board.
- Create issues.
- Edit issue details.
- Move issues between statuses.
- Add issue comments.
- Upload issue/comment attachments through supported issue workflows.
- Toggle their own watchlist state.
- Manage their own notification preferences.
- View their notification inbox.

Issue deletion is restricted to `manage_options` by default.

## Configuration Workflows

Users with `manage_options` can usually:

- Configure statuses.
- Restore default statuses.
- Configure labels.
- Configure card display.
- Manage deleted items.
- Configure contextual capture settings.
- Manage email templates.
- Manage daily digest templates.

## Custom Permission Rules

Developers can customize permission decisions with the `alpaca_user_can` filter.

```php
add_filter(
    'alpaca_user_can',
    static function ( $allowed, $action, $args ) {
        if ( 'delete_issue' === $action ) {
            return current_user_can( 'manage_options' );
        }

        return $allowed;
    },
    10,
    3
);
```

Use this filter when a site needs custom role handling without changing Alpaca Issue Tracker core code.
