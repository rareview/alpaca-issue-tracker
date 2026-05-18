# JavaScript Filters And Browser API

Alpaca exposes JavaScript filters through WordPress `wp.hooks.applyFilters()` and `wp.hooks.addFilter()`. These filters allow integrations to extend the React UI without patching Alpaca internals.

Use `wp.hooks.addFilter()` from code that runs in the same WordPress admin context as Alpaca.

## Settings Screens

### `alpaca.settings.tabs`

**Type:** Filter.

**Purpose:** Adds, removes, or reorders tabs in the Configure screen before the tab panel renders.

**Parameters**

| Parameter  | Type            | Description                                             |
| ---------- | --------------- | ------------------------------------------------------- |
| `$tabs`    | `Array<Object>` | Current tab definitions for the Configure screen.       |
| `$context` | `Object`        | Context object containing the current `statuses` array. |

**Source:** `src/Settings.jsx:83`.

### `alpaca.settings.tabContent`

**Type:** Filter.

**Purpose:** Returns custom tab content for a settings tab. Return `null` to leave a tab unhandled.

**Parameters**

| Parameter  | Type       | Description                                                  |
| ---------- | ---------- | ------------------------------------------------------------ | --------------------------------------------------------------------- |
| `$content` | `ReactNode | null`                                                        | Existing tab content. Alpaca passes `null` before custom filters run. |
| `$tab`     | `Object`   | Active tab definition with `name`, `title`, and `className`. |
| `$context` | `Object`   | Context object containing the current `statuses` array.      |

**Source:** `src/Settings.jsx:164`.

**Example**

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

### `alpaca.settings.additionalRows`

**Type:** Filter.

**Purpose:** Injects additional `<tr>` rows into the main Settings tab table.

**Parameters**

| Parameter  | Type       | Description                                             |
| ---------- | ---------- | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| `$rows`    | `ReactNode | null`                                                   | Existing row markup. Alpaca passes `null` before third-party filters run. |
| `$context` | `Object`   | Context object containing the current `statuses` array. |

**Source:** `src/Settings.jsx:107-109`.

### `alpaca.settings.afterTable`

**Type:** Filter.

**Purpose:** Injects content after the main Settings tab table.

**Parameters**

| Parameter  | Type       | Description                                             |
| ---------- | ---------- | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| `$content` | `ReactNode | null`                                                   | Existing content. Alpaca passes `null` before third-party filters run. |
| `$context` | `Object`   | Context object containing the current `statuses` array. |

**Source:** `src/Settings.jsx:116-118`.

## Notification Preferences

### `alpaca.notificationPreferences.tabs`

**Type:** Filter.

**Purpose:** Adds or reorders tabs in the notification preferences interface.

**Parameters**

| Parameter  | Type            | Description                                         |
| ---------- | --------------- | --------------------------------------------------- |
| `$tabs`    | `Array<Object>` | Current notification preference tab definitions.    |
| `$context` | `Object`        | Context object containing the available `channels`. |

**Sources**

- `src/components/NotificationPreferences.jsx:216`
- `src/components/NotificationPreferences.jsx:402-424`

### `alpaca.notificationPreferences.tabContent`

**Type:** Filter.

**Purpose:** Returns custom content for a notification preferences tab. Return `null` to leave a tab unhandled.

**Parameters**

| Parameter  | Type       | Description                                                                             |
| ---------- | ---------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `$content` | `ReactNode | null`                                                                                   | Existing tab content. Alpaca passes `null` before custom filters run. |
| `$tab`     | `Object`   | Active tab definition.                                                                  |
| `$context` | `Object`   | Context object containing `channels`, `preferences`, `channelStatus`, and save helpers. |

**Sources**

- `src/components/NotificationPreferences.jsx:426-436`
- `src/components/NotificationPreferences.jsx:1118-1123`
## Board And Issue UI Filters

### `alpaca.board.controls`

**Type:** Filter.

**Purpose:** Replaces or extends the board header control list.

**Parameters**

| Parameter   | Type            | Description                                                              |
| ----------- | --------------- | ------------------------------------------------------------------------ |
| `$controls` | `Array<Object>` | Default board control descriptors.                                       |
| `$context`  | `Object`        | Context with selector, containers, active filters, and setter callbacks. |

**Source:** `src/components/BoardControls.jsx:82-92`.

**Example**

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

### `alpaca.container.menuControls`

**Type:** Filter.

**Purpose:** Rewrites the menu actions available for a board column or container.

**Parameters**

| Parameter       | Type            | Description                                                                  |
| --------------- | --------------- | ---------------------------------------------------------------------------- |
| `$menuControls` | `Array<Object>` | Current container menu control descriptors.                                  |
| `$context`      | `Object`        | Context including container state, visible items, and bulk action callbacks. |

**Source:** `src/components/Container.jsx:243-271`.

### `alpaca.item.controls`

**Type:** Filter.

**Purpose:** Adds or replaces issue card controls such as the built-in watchlist star.

**Parameters**

| Parameter    | Type            | Description                                                             |
| ------------ | --------------- | ----------------------------------------------------------------------- |
| `$controls`  | `Array<Object>` | Current card control descriptors or renderable elements.                |
| `$itemProps` | `Object`        | Card state including item fields, watchlist state, and `onWatchToggle`. |

**Sources**

- `src/components/Item.jsx:85-101`
- `src/utils/itemControls.js:36-40`
  **Example**

```jsx
const { addFilter } = wp.hooks;
const { createElement } = wp.element;

addFilter(
  'alpaca.item.controls',
  'my-plugin/item-control',
  (controls, item) => [
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
  ],
);
```

### `alpaca.item.datapoints`

**Type:** Filter.

**Purpose:** Adds or replaces the rendered metadata datapoints shown on issue cards.

**Parameters**

| Parameter    | Type       | Description                                                             |
| ------------ | ---------- | ----------------------------------------------------------------------- | ------------------------- |
| `$content`   | `ReactNode | null`                                                                   | Current datapoint markup. |
| `$itemProps` | `Object`   | Item fields including IDs, meta, assignees, labels, and comment counts. |

**Sources**

- `src/components/Item.jsx:158-168`
- `src/utils/itemDatapoints.js:224`
  **Example**

```jsx
const { addFilter } = wp.hooks;
const { createElement, Fragment } = wp.element;

addFilter('alpaca.item.datapoints', 'my-plugin/item-marker', (content, item) =>
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

### `alpaca.item.card.dataAttributes`

**Type:** Filter.

**Purpose:** Adds extra `data-*` attributes to the root board card element.

**Parameters**

| Parameter     | Type     | Description                                                  |
| ------------- | -------- | ------------------------------------------------------------ |
| `$attributes` | `Object` | Existing attribute map.                                      |
| `$item`       | `Object` | Card data including assignees, labels, counts, and metadata. |

**Sources**

- `src/components/Item.jsx:60-74`
- `src/datapoints/assigneesDatapoint.js:56-70`

### `alpaca.item.commentCount.agentType`

**Type:** Filter.

**Purpose:** Chooses which comment agent types are counted for the comment count datapoint.

**Parameters**

| Parameter     | Type           | Description                                   |
| ------------- | -------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| `$agentTypes` | `Array<string> | null`                                         | Requested comment agent types. Returning `null` leaves the base count unchanged. |
| `$itemProps`  | `Object`       | Item fields passed to the datapoint resolver. |

**Sources**

- `src/datapoints/commentCountDatapoint.js:86-90`
- `src/datapoints/commentCountDatapoint.js:156-160`

### `alpaca.item.commentCount`

**Type:** Filter.

**Purpose:** Overrides the final numeric comment count displayed on the card.

**Parameters**

| Parameter  | Type     | Description                                                                    |
| ---------- | -------- | ------------------------------------------------------------------------------ |
| `$count`   | `number` | Comment count after Alpaca resolves any requested agent type filtering.        |
| `$context` | `Object` | Item fields plus `requestedCommentAgentType` and `requestedCommentAgentTypes`. |

**Source:** `src/datapoints/commentCountDatapoint.js:106-111`.

### `alpaca.label_color_options`

**Type:** Filter.

**Purpose:** Replaces or extends the color palette offered by the label manager.

**Parameters**

| Parameter | Type            | Description               |
| --------- | --------------- | ------------------------- |
| `$colors` | `Array<string>` | Current label color list. |

**Source:** `src/components/LabelsManager.jsx:394-397`.

### `alpaca.issue.abovetabs`

**Type:** Filter.

**Purpose:** Inserts content above the tab panel in the issue modal.

**Parameters**

| Parameter  | Type       | Description                                            |
| ---------- | ---------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| `$content` | `ReactNode | null`                                                  | Existing content. Alpaca passes `null` before custom filters run. |
| `$context` | `Object`   | Context with the current `issueId` and `meta` payload. |

**Source:** `src/components/Issue.jsx:2368-2371`.

## Comments, Search, And Reporting

### `alpaca.commentingTips`

**Type:** Filter.

**Purpose:** Adds or rewrites the help tips shown next to issue comment forms.

**Parameters**

| Parameter | Type            | Description                                          |
| --------- | --------------- | ---------------------------------------------------- |
| `$tips`   | `Array<Object>` | Tip entries with `text` and optional `placeholders`. |

**Sources**

- `src/components/Comment.jsx:157-160`
- `src/components/CommentForm.jsx:140-143`
  **Example**

```jsx
const { addFilter } = wp.hooks;
const { __ } = wp.i18n;

addFilter('alpaca.commentingTips', 'my-plugin/comment-tip', (tips) => [
  ...tips,
  {
    text: __('Use @mentions to notify teammates.', 'my-plugin'),
  },
]);
```

### `alpaca.isIssueCommentEditable`

**Type:** Filter.

**Purpose:** Overrides whether an issue comment is editable in the current UI state.

**Parameters**

| Parameter               | Type            | Description                            |
| ----------------------- | --------------- | -------------------------------------- |
| `$isEditable`           | `boolean`       | Alpaca's default editability decision. |
| `$comment`              | `Object`        | Comment payload.                       |
| `$defaultEditableTypes` | `Array<string>` | Default editable agent types.          |

**Source:** `src/components/Comment.jsx:263-268`.

### `alpaca.commentObject`

**Type:** Filter.

**Purpose:** Normalizes or augments comment objects before Alpaca broadcasts them through JavaScript actions.

**Parameters**

| Parameter  | Type     | Description                            |
| ---------- | -------- | -------------------------------------- |
| `$comment` | `Object` | Comment payload about to be broadcast. |

**Sources**

- `src/components/Comment.jsx:610`
- `src/utils/issueCommentHandler.js:134-139`
- `src/utils/issueCommentHandler.js:201`

### `alpaca.search.commentAgentTypes`

**Type:** Filter.

**Purpose:** Controls which comment agent types are included when search results are built from comment matches.

**Parameters**

| Parameter     | Type           | Description                                                           |
| ------------- | -------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `$agentTypes` | `Array<string> | null`                                                                 | Requested comment agent types. Alpaca defaults to `['human', 'create']`. |
| `$context`    | `Object`       | Search context containing the current `query` and fetched `comments`. |

**Sources**

- `src/components/Search.jsx:286-289`
- `src/components/Search.jsx:611-615`
  **Example**

```jsx
const { addFilter } = wp.hooks;

addFilter(
  'alpaca.search.commentAgentTypes',
  'my-plugin/search-agent-types',
  (agentTypes) => [...agentTypes, 'my_custom_agent'],
);
```

### `alpaca.reportTab.excludedTaxonomies`

**Type:** Filter.

**Purpose:** Controls which taxonomies are omitted from the issue report tab.

**Parameters**

| Parameter     | Type            | Description                                               |
| ------------- | --------------- | --------------------------------------------------------- |
| `$taxonomies` | `Array<string>` | Taxonomy slugs that Alpaca will hide from the report tab. |

**Source:** `src/components/issue/ReportTab.jsx:81-84`.

### `alpaca.api.root`

**Type:** Filter.

**Purpose:** Rewrites the REST root used by Alpaca's browser-side API helper before requests are sent.

**Parameters**

| Parameter  | Type     | Description                                                          |
| ---------- | -------- | -------------------------------------------------------------------- |
| `$root`    | `string` | Current resolved REST root.                                          |
| `$context` | `Object` | Context with `configuredRoot`, `hasCustomRoot`, and `currentOrigin`. |

**Source:** `src/utils/restApiRoot.js:66`.

## Item Datapoint Browser API

The public registration API is available at `window.alpaca.itemDatapoints`.

### `window.alpaca.itemDatapoints.register()`

**Type:** Browser API.

**Purpose:** Registers a new card datapoint and wires it into the `alpaca.item.datapoints` filter chain.

**Parameters**

| Parameter       | Type     | Description                                    |
| --------------- | -------- | ---------------------------------------------- |
| `$registration` | `Object` | Datapoint registration object described below. |

**Source:** `src/utils/itemDatapoints.js:253`.

Registration fields:

| Field            | Required | Purpose                                                                              |
| ---------------- | -------- | ------------------------------------------------------------------------------------ |
| `slug`           | Yes      | Unique datapoint slug.                                                               |
| `callback`       | Yes      | Function that receives current content and item props, then returns updated content. |
| `label`          | No       | Human-readable label shown in settings. Falls back to the slug.                      |
| `description`    | No       | Optional settings description.                                                       |
| `namespace`      | No       | WordPress hook namespace. Falls back to `alpaca/item/datapoint/{slug}`.              |
| `defaultEnabled` | No       | Whether the datapoint is visible by default. Defaults to `true`.                     |

**Example**

```jsx
const { createElement, Fragment } = wp.element;
const { __ } = wp.i18n;

window.alpaca.itemDatapoints.register({
  slug: 'client_reference',
  label: __('Client Reference', 'my-plugin'),
  description: __(
    'Shows a client reference value on issue cards.',
    'my-plugin',
  ),
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

### `window.alpaca.itemDatapoints.getRegistered()`

**Type:** Browser API.

**Purpose:** Returns the registered datapoint metadata list.

**Parameters:** This method does not accept any parameters.

**Source:** `src/utils/itemDatapoints.js:254`.

### `window.alpaca.itemDatapoints.getVisibility()`

**Type:** Browser API.

**Purpose:** Returns the current datapoint visibility map.

**Parameters:** This method does not accept any parameters.

**Source:** `src/utils/itemDatapoints.js:255`.

### `window.alpaca.itemDatapoints.fetchVisibility()`

**Type:** Browser API.

**Purpose:** Refreshes datapoint visibility from `wp/v2/settings`.

**Parameters:** This method does not accept any parameters.

**Source:** `src/utils/itemDatapoints.js:256`.

### `window.alpaca.itemDatapoints.saveVisibility()`

**Type:** Browser API.

**Purpose:** Persists datapoint visibility to the `alpaca_item_datapoint_visibility` setting.

**Parameters**

| Parameter     | Type     | Description                             |
| ------------- | -------- | --------------------------------------- |
| `$visibility` | `Object` | Visibility map keyed by datapoint slug. |

**Source:** `src/utils/itemDatapoints.js:257`.
