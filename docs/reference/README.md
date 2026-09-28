# Hook And Filter Reference

This reference documents Alpaca Issue Tracker public PHP hooks, JavaScript extension points, and browser-side extension APIs.

## Scope

- Includes the main Alpaca Issue Tracker plugin only.
- Includes dynamic REST action names created with `do_action( 'alpaca_rest_' . $action_type, ... )` and `do_action( 'alpaca_rest_error_' . $action_type, ... )`.
- Includes JavaScript `wp.hooks` extension points and the public `window.alpaca.itemDatapoints` and `window.alpaca.services` browser APIs exposed by the React application.

## How To Use This Reference

Each PHP or JavaScript hook entry includes:

- The hook type (`action` or `filter`).
- A purpose statement focused on runtime behavior.
- The parameter list in call order.

Use the pages below when you need exact signatures, examples, source locations, or subsystem-level navigation.

## Reference Pages

| Page                                           | Focus                                                                            | Entries |
| ---------------------------------------------- | -------------------------------------------------------------------------------- | ------: |
| [core-and-admin.md](core-and-admin.md)         | Initialization, permissions, board behavior, admin UI, localization, migrations  |       7 |
| [notifications.md](notifications.md)           | Notification channels, recipients, routing, message delivery, mail sender hooks  |      14 |
| [daily-digest.md](daily-digest.md)             | Daily digest payload building, rendering, and channel dispatch                   |       9 |
| [rest-api.md](rest-api.md)                     | REST response hooks, dynamic REST hooks, and REST root customization             |       5 |
| [private-comments.md](private-comments.md)     | Private comment visibility and REST override hooks                               |       2 |
| [javascript-filters.md](javascript-filters.md) | JavaScript filters and public browser extension APIs                             |      32 |
| [javascript-actions.md](javascript-actions.md) | JavaScript actions emitted by issue, comment, watchlist, and datapoint workflows |      36 |
