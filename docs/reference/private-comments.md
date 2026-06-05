# Private Comment Hooks

## REST Visibility Override

### `alpaca_private_comments_rest_visibility_param`

**Type:** Filter.

**Purpose:** Supplies the request parameter name that trusted REST callers can use to request visibility of hidden comment types.

**Parameters**

| Parameter         | Type     | Description                                       |
| ----------------- | -------- | ------------------------------------------------- |
| `$override_param` | `string` | The request parameter name Alpaca should inspect. |

## Per-Type Visibility Decisions

### `alpaca_private_comments_user_can_view_type`

**Type:** Filter.

**Purpose:** Overrides whether the current user can view a specific hidden comment type after Alpaca Issue Tracker's default `moderate_comments` capability check.

**Parameters**

| Parameter   | Type     | Description                              |
| ----------- | -------- | ---------------------------------------- |
| `$can_view` | `bool`   | Alpaca Issue Tracker's current visibility decision. |
| `$type`     | `string` | The hidden comment type being evaluated. |
