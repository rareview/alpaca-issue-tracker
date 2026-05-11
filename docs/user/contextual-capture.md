# Contextual Capture

Contextual capture lets logged-in users report an issue from the front end or supported admin surfaces while the plugin captures useful debugging context.

## What The Reporter Does

A user opens the report form, describes the issue, optionally marks it high priority, and submits it.

The plugin creates an issue on the Project Board and attaches captured context to help developers reproduce the problem.

## What The Plugin Captures

When contextual capture is enabled, issue reports can include:

- User-provided feedback.
- Current page URL.
- Browser and device information.
- JavaScript errors captured during the page session.
- WordPress request/page context from the server.
- A screenshot of what the user could see, when screenshot capture succeeds.

Screenshot capture and upload can fail independently from issue creation. If screenshot upload fails, the issue can still be created with the available context.

## Where Reports Go

Captured reports become issue records. They appear on the Project Board in the default status column and can be triaged like any other issue.

## Settings

Administrators control contextual capture under Project Board > Configure > Settings.

If contextual capture is disabled, the front-end reporting UI and related capture behavior should not load for normal front-end pages.

## Privacy Expectations

The base plugin stores captured issue data inside the WordPress installation. It does not send issue data to an external service by default.

Because screenshots and request context can include sensitive information, teams should confirm that contextual capture is appropriate for the site and user roles that can access it.
