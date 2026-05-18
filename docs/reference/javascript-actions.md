# JavaScript Actions

Alpaca emits JavaScript actions through WordPress `wp.hooks.doAction()` so integrations can react to UI changes, issue lifecycle events, and browser-side synchronization.

Use `wp.hooks.addAction()` from code that runs in the same WordPress admin context as Alpaca.

## Datapoint Registry Actions

### `alpaca.item.datapoints.visibilityChanged`

**Type:** Action.

**Purpose:** Fires after Alpaca updates the card datapoint visibility map.

**Parameters**

| Parameter     | Type     | Description                                     |
| ------------- | -------- | ----------------------------------------------- |
| `$visibility` | `Object` | Current visibility map keyed by datapoint slug. |

**Source:** `src/utils/itemDatapoints.js:87-90`.

### `alpaca.item.datapoints.registryChanged`

**Type:** Action.

**Purpose:** Fires after Alpaca registers a new card datapoint.

**Parameters**

| Parameter        | Type            | Description                            |
| ---------------- | --------------- | -------------------------------------- |
| `$registrations` | `Array<Object>` | Registered datapoint metadata entries. |

**Source:** `src/utils/itemDatapoints.js:163-166`.

## Common UI Actions

### `alpaca.issueSubmitted`

**Type:** Action.

**Purpose:** Fires after Alpaca creates a new issue through the UI.

**Parameters**

| Parameter         | Type      | Description                                                                          |
| ----------------- | --------- | ------------------------------------------------------------------------------------ | ------------------------------------------- |
| `$issue`          | `Object`  | Created issue payload.                                                               |
| `$statusId`       | `number   | string`                                                                              | Status identifier assigned during creation. |
| `$isHighPriority` | `boolean` | Whether the created issue is marked high priority.                                   |
| `$submission`     | `Object`  | Submission metadata such as feedback text and whether a comment was already created. |

**Sources**

- `src/Modal.jsx:152-161`
- `src/Toolbar.jsx:199-208`
- `src/components/Issue.jsx:1334-1345`

### `alpaca.issueUpdated`

**Type:** Action.

**Purpose:** Fires after Alpaca updates an issue through the modal UI.

**Parameters**

| Parameter  | Type    | Description |
| ---------- | ------- | ----------- | ----------------- |
| `$issueId` | `number | string`     | Updated issue ID. |

**Source:** `src/components/Issue.jsx:893`.

### `alpaca.statusChanged`

**Type:** Action.

**Purpose:** Fires when an issue status changes.

**Parameters**

| Parameter     | Type     | Description            |
| ------------- | -------- | ---------------------- |
| `$issue`      | `Object` | Issue payload.         |
| `$fromStatus` | `string` | Previous status label. |
| `$toStatus`   | `string` | Next status label.     |

**Sources**

- `src/components/StatusManager.jsx:337-342`
- `src/utils/statusChange.js:15-20`
  **Example**

```jsx
const { addAction } = wp.hooks;

addAction(
  'alpaca.statusChanged',
  'my-plugin/status-change-log',
  (issue, fromStatus, toStatus) => {
    window.console.log('Issue status changed', {
      issue,
      fromStatus,
      toStatus,
    });
  },
);
```

### `alpaca.priorityUpdated`

**Type:** Action.

**Purpose:** Fires when an issue's high-priority state changes.

**Parameters**

| Parameter  | Type     | Description                                                  |
| ---------- | -------- | ------------------------------------------------------------ |
| `$payload` | `Object` | Payload containing `issueId`, `isHighPriority`, and `issue`. |

**Sources**

- `src/components/Issue.jsx:894-898`
- `src/components/Issue.jsx:1382-1386`

### `alpaca.deadlineUpdated`

**Type:** Action.

**Purpose:** Fires when an issue deadline is added, changed, or removed.

**Parameters**

| Parameter  | Type     | Description                                                                            |
| ---------- | -------- | -------------------------------------------------------------------------------------- |
| `$payload` | `Object` | Payload containing `issueId`, `changeType`, `newDeadline`, `oldDeadline`, and `issue`. |

**Source:** `src/components/Issue.jsx:994-1000`.

### `alpaca.commentPosted`

**Type:** Action.

**Purpose:** Fires after Alpaca posts a new issue comment.

**Parameters**

| Parameter  | Type     | Description                                                      |
| ---------- | -------- | ---------------------------------------------------------------- |
| `$comment` | `Object` | Created comment object after `alpaca.commentObject` filters run. |

**Sources**

- `src/components/Comment.jsx:608-611`
- `src/utils/issueCommentHandler.js:199-202`

### `alpaca.commentUpdated`

**Type:** Action.

**Purpose:** Fires after Alpaca updates an existing issue comment.

**Parameters**

| Parameter  | Type     | Description             |
| ---------- | -------- | ----------------------- |
| `$comment` | `Object` | Updated comment object. |

**Source:** `src/components/Comment.jsx:749`.

### `alpaca.commentDeleted`

**Type:** Action.

**Purpose:** Fires after Alpaca deletes an issue comment.

**Parameters**

| Parameter  | Type     | Description                                       |
| ---------- | -------- | ------------------------------------------------- |
| `$comment` | `Object` | Deleted comment payload returned by the REST API. |

**Source:** `src/components/Comment.jsx:805`.

### `alpaca.issueDeleted`

**Type:** Action.

**Purpose:** Fires after Alpaca deletes an issue or removes a promoted checklist item from board state.

**Parameters**

| Parameter  | Type    | Description |
| ---------- | ------- | ----------- | ----------------- |
| `$issueId` | `number | string`     | Deleted issue ID. |

**Sources**

- `src/Board.jsx:1340`
- `src/components/Issue.jsx:1854`
- `src/components/Issue.jsx:1888`

### `alpaca.watchlistUpdated`

**Type:** Action.

**Purpose:** Broadcasts watchlist changes between multiple Alpaca UI roots on the same page.

**Parameters**

| Parameter  | Type     | Description                                                    |
| ---------- | -------- | -------------------------------------------------------------- |
| `$payload` | `Object` | Payload containing `source` and the updated `watchlist` array. |

**Source:** `src/context/WatchlistContext.jsx:91-94`.

### `alpaca.watchlistSynced`

**Type:** Action.

**Purpose:** Emits a debug event after one Alpaca watchlist context synchronizes with another.

**Parameters**

| Parameter  | Type     | Description                                                                   |
| ---------- | -------- | ----------------------------------------------------------------------------- |
| `$payload` | `Object` | Payload containing `source`, `target`, `count`, `watchlist`, and `timestamp`. |

**Source:** `src/context/WatchlistContext.jsx:110-116`.
