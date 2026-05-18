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

| Parameter         | Type             | Description                                                                                                                                |
| ----------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `$issue`          | `Object`         | Created issue payload.                                                                                                                     |
| `$statusId`       | `number\|string` | Status identifier assigned during creation.                                                                                                |
| `$isHighPriority` | `boolean`        | Whether the created issue is marked high priority.                                                                                         |
| `$submission`     | `Object`         | Submission metadata. Contains `feedback` (string), `screenshotUrl` (string), and optionally `commentAlreadyCreated` and `skipBoardInsert`. |

**Sources**

- `src/Modal.jsx:152-161`
- `src/Toolbar.jsx:199-208`
- `src/components/Issue.jsx:1334-1345`

### `alpaca.issueUpdated`

**Type:** Action.

**Purpose:** Fires after Alpaca updates an issue through the modal UI.

**Parameters**

| Parameter  | Type             | Description       |
| ---------- | ---------------- | ----------------- |
| `$issueId` | `number\|string` | Updated issue ID. |

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

| Parameter  | Type             | Description       |
| ---------- | ---------------- | ----------------- |
| `$issueId` | `number\|string` | Deleted issue ID. |

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

## Assignee Actions

### `alpaca.assigneeChanged`

**Type:** Action.

**Purpose:** Fires once for each user added to or removed from an issue's assignee list.

**Parameters**

| Parameter  | Type      | Description                                                       |
| ---------- | --------- | ----------------------------------------------------------------- |
| `$issue`   | `Object`  | Issue details from the component state at the time of the change. |
| `$user`    | `Object`  | User object resolved from the assignee list.                      |
| `$isAdded` | `boolean` | `true` when the user was added to the list; `false` when removed. |

**Sources**

- `src/components/Issue.jsx:843-848`
- `src/components/Issue.jsx:852-857`

### `alpaca.issueAssigneesChanged`

**Type:** Action.

**Purpose:** Fires after all assignee changes for an issue have been applied and the board item state is updated.

**Parameters**

| Parameter    | Type             | Description                               |
| ------------ | ---------------- | ----------------------------------------- |
| `$issueId`   | `number\|string` | Identifier of the issue that was updated. |
| `$assignees` | `Array<Object>`  | Full assignee list after the update.      |

**Source:** `src/Board.jsx:1153-1157`.

### `alpaca.allAssigneesUpdated`

**Type:** Action.

**Purpose:** Fires whenever the complete set of assignees across all board containers changes.

**Parameters**

| Parameter         | Type            | Description                                                               |
| ----------------- | --------------- | ------------------------------------------------------------------------- |
| `$assigneesArray` | `Array<Object>` | Deduplicated array of all unique assignee objects currently on the board. |

**Source:** `src/Board.jsx:1517`.

## Comment Activity Actions

### `alpaca.commentCountChanged`

**Type:** Action.

**Purpose:** Fires after a comment is posted or deleted and the server-confirmed comment count is available.

**Parameters**

| Parameter  | Type     | Description                                                      |
| ---------- | -------- | ---------------------------------------------------------------- |
| `$payload` | `Object` | Payload containing `issueId`, `newCount`, and `newCountByAgent`. |

**Sources**

- `src/components/Comment.jsx:615-619`
- `src/components/Comment.jsx:813-817`
- `src/utils/issueCommentHandler.js:207-211`

### `alpaca.lastActivityChanged`

**Type:** Action.

**Purpose:** Fires after a comment is posted or deleted and the server-confirmed last-activity timestamp is available.

**Parameters**

| Parameter  | Type     | Description                                                   |
| ---------- | -------- | ------------------------------------------------------------- |
| `$payload` | `Object` | Payload containing `issueId` and `lastActivity` (ISO string). |

**Sources**

- `src/components/Comment.jsx:620-626`
- `src/components/Comment.jsx:820-823`
- `src/utils/issueCommentHandler.js:212-218`

## Label Actions

### `alpaca.labelsChanged`

**Type:** Action.

**Purpose:** Fires after labels are fetched, created, updated, or deleted. When called after a fetch, all current labels are included. When called after a save or delete, only the affected label is included.

**Parameters**

| Parameter  | Type     | Description                          |
| ---------- | -------- | ------------------------------------ |
| `$payload` | `Object` | Payload containing a `labels` array. |

**Sources**

- `src/components/LabelsManager.jsx:78`
- `src/components/LabelsManager.jsx:267`
- `src/components/LabelsManager.jsx:318`

## Subissue Actions

### `alpaca.subissueProgressChanged`

**Type:** Action.

**Purpose:** Fires when the subissue completion counts for an issue change.

**Parameters**

| Parameter  | Type     | Description                                                                                       |
| ---------- | -------- | ------------------------------------------------------------------------------------------------- |
| `$payload` | `Object` | Payload containing `issueId` and `progress` (object with integer `total` and `completed` counts). |

**Source:** `src/components/Issue.jsx:806-812`.

### `alpaca.subissueCreated`

**Type:** Action.

**Purpose:** Fires after a new subissue is successfully created and saved.

**Parameters**

| Parameter          | Type     | Description                                                              |
| ------------------ | -------- | ------------------------------------------------------------------------ |
| `$issueDetails`    | `Object` | Parent issue details from the component state at the time of the action. |
| `$createdSubissue` | `Object` | Subissue returned by the REST API after creation.                        |

**Source:** `src/components/Issue.jsx:1487-1491`.

### `alpaca.subissueTitleChanged`

**Type:** Action.

**Purpose:** Fires after a subissue title is saved and confirmed by the server.

**Parameters**

| Parameter       | Type     | Description                                                              |
| --------------- | -------- | ------------------------------------------------------------------------ |
| `$issueDetails` | `Object` | Parent issue details from the component state at the time of the action. |
| `$subissue`     | `Object` | Updated subissue object with the new title.                              |
| `$oldTitle`     | `string` | Title before the edit.                                                   |
| `$newTitle`     | `string` | Title after the edit.                                                    |

**Source:** `src/components/Issue.jsx:1602-1608`.

### `alpaca.subissueCompletionToggled`

**Type:** Action.

**Purpose:** Fires after a subissue's completed state is toggled and confirmed by the server.

**Parameters**

| Parameter       | Type      | Description                                                              |
| --------------- | --------- | ------------------------------------------------------------------------ |
| `$issueDetails` | `Object`  | Parent issue details from the component state at the time of the action. |
| `$subissue`     | `Object`  | Subissue object with the updated `isCompleted` property.                 |
| `$isCompleted`  | `boolean` | New completion state.                                                    |

**Source:** `src/components/Issue.jsx:1671-1676`.

### `alpaca.subissueAssigneeChanged`

**Type:** Action.

**Purpose:** Fires once for each user added to or removed from a subissue's assignee list.

**Parameters**

| Parameter       | Type      | Description                                                              |
| --------------- | --------- | ------------------------------------------------------------------------ |
| `$issueDetails` | `Object`  | Parent issue details from the component state at the time of the action. |
| `$subissue`     | `Object`  | Subissue at the time of the change, with its previous assignee list.     |
| `$user`         | `Object`  | User object for the assignee being added or removed.                     |
| `$isAdded`      | `boolean` | `true` when the user was added; `false` when removed.                    |

**Sources**

- `src/components/Issue.jsx:1744-1750`
- `src/components/Issue.jsx:1754-1760`

### `alpaca.subissuePromoted`

**Type:** Action.

**Purpose:** Fires after a subissue is promoted to a standalone board issue.

**Parameters**

| Parameter  | Type     | Description                                                                                                                                   |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `$payload` | `Object` | Payload containing `parentIssue` (`{id, slug, title}`), `promotedIssue` (`{id, slug, title}`), and `subissue` (the original subissue object). |

**Source:** `src/components/Issue.jsx:1871-1886`.

### `alpaca.subissueDeleted`

**Type:** Action.

**Purpose:** Fires after a subissue is permanently deleted.

**Parameters**

| Parameter       | Type     | Description                                                              |
| --------------- | -------- | ------------------------------------------------------------------------ |
| `$issueDetails` | `Object` | Parent issue details from the component state at the time of the action. |
| `$subissue`     | `Object` | The subissue that was deleted.                                           |

**Source:** `src/components/Issue.jsx:1928`.

## Board State Actions

### `alpaca.issueInserted`

**Type:** Action.

**Purpose:** Fires to insert an issue into board state. The board listens for this action to add the issue to the appropriate status column without a full reload. It is emitted when a subissue is promoted to a standalone issue.

**Parameters**

| Parameter   | Type             | Description                                                                                                    |
| ----------- | ---------------- | -------------------------------------------------------------------------------------------------------------- |
| `$issue`    | `Object`         | Issue object to insert. Includes `id`, `slug`, `title`, `post_date`, `assignees`, `comment_count`, and `meta`. |
| `$statusId` | `number\|string` | Status column identifier that the issue should be inserted into.                                               |

**Sources**

- `src/components/Issue.jsx:1833-1846`
- `src/components/Issue.jsx:1855-1868`

### `alpaca.issueDeletedAudit`

**Type:** Action.

**Purpose:** Fires immediately before `alpaca.issueDeleted` when an issue is deleted from the board UI.

**Parameters**

| Parameter  | Type             | Description              |
| ---------- | ---------------- | ------------------------ |
| `$issueId` | `number\|string` | ID of the deleted issue. |

**Source:** `src/Board.jsx:1339`.

### `alpaca.issueRestoredAudit`

**Type:** Action.

**Purpose:** Fires after a top-level issue is restored from the trash.

**Parameters**

| Parameter  | Type     | Description               |
| ---------- | -------- | ------------------------- |
| `$issueId` | `string` | ID of the restored issue. |

**Source:** `src/components/RestoreManager.jsx:216`.

### `alpaca.subissueRestoredAudit`

**Type:** Action.

**Purpose:** Fires after a subissue is restored from the trash.

**Parameters**

| Parameter   | Type     | Description                                                           |
| ----------- | -------- | --------------------------------------------------------------------- |
| `$parentId` | `string` | ID of the parent issue.                                               |
| `$subissue` | `Object` | Object containing `id` (string) and `title` of the restored subissue. |

**Source:** `src/components/RestoreManager.jsx:207-214`.

## Navigation Actions

### `alpaca.openIssue`

**Type:** Action.

**Purpose:** Fires when the inbox control opens an issue, enabling other components to respond to the navigation event.

**Parameters**

| Parameter  | Type     | Description                                                |
| ---------- | -------- | ---------------------------------------------------------- |
| `$payload` | `Object` | Object containing `id` (issue ID) and `slug` (issue slug). |

**Source:** `src/components/InboxControl.jsx:426-429`.

### `alpaca.createBoardIssue`

**Type:** Action.

**Purpose:** Fires when the "Add issue" board button is activated. The board listens for this action to open the new-issue panel.

**Parameters**

None.

**Source:** `src/utils/boardHelpers.js:17`.

### `alpaca.openModal`

**Type:** Action.

**Purpose:** Fires when the toolbar modal button is activated. The modal listens for this action to open the issue-submission form.

**Parameters**

None.

**Source:** `src/utils/boardHelpers.js:19`.

## Settings Actions

### `alpaca.enableTestLogsChanged`

**Type:** Action.

**Purpose:** Fires when the "Enable Browser Console Messages" debug setting is toggled in the plugin settings screen.

**Parameters**

| Parameter | Type      | Description                                                      |
| --------- | --------- | ---------------------------------------------------------------- |
| `$value`  | `boolean` | `true` when console messages are enabled; `false` when disabled. |

**Source:** `src/components/EnableTestLogsControl.jsx:11`.

## Legacy Actions

### `alpaca_board_controls`

**Type:** Action.

**Purpose:** Fires after the board controls component mounts. This is a backwards-compatible action provided for integrations built before the `alpaca.board.controls` filter was available. New integrations should use the `alpaca.board.controls` JavaScript filter instead.

**Parameters**

| Parameter   | Type     | Description                                             |
| ----------- | -------- | ------------------------------------------------------- |
| `$selector` | `string` | CSS selector string used to identify the board element. |

**Source:** `src/components/BoardControls.jsx:96`.
