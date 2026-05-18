# Contextual Capture

Contextual capture lets logged-in users report an issue from the front end or supported admin surfaces while the plugin captures useful debugging context.

## What The Reporter Does

Alpaca deliberately makes the reporting action as simple and low-friction as possible.

A user opens the report form, describes the issue, optionally marks it high priority, and submits it.

The plugin creates an issue on the Project Board and attaches captured context to help developers reproduce the problem.

## What The Plugin Captures

When contextual capture is enabled, issue reports can include:

- User-provided feedback.
- Current page URL.
- Browser and device information.
- WordPress request/page context from the server.
- HTTP header information.
- Any JavaScript errors captured during the page session.
- A screenshot of what the user could see at the time.

Screenshot capture and upload can fail independently from issue creation. If screenshot upload fails, the issue can still be created with the available context.

## Where Reports Go

Captured reports will appear in the default status column, and can be triaged like any other issue.

Contextual data is displayed in tabs alongside the Timeline.

The screenshot will appear as an attachment against the initial comment.

## Settings

Administrators turn contextual capture on and off at: Configure > Settings.

If contextual capture is disabled, the front-end reporting UI and related capture behavior will not load for normal front-end pages.

Issues should be created using the Add Issue button on the Project Board itself.

## Privacy Expectations

The base plugin stores captured issue data inside the WordPress database and file system. It does not send issue data to an external service by default.

Because screenshots and request context can include sensitive information, teams should confirm that contextual capture is appropriate for the site and user roles that can access it.
