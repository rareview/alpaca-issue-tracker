## WordPress development

Any code generated for use with WordPress must strictly follow the WordPress Coding Standards (WPCS), including naming conventions, formatting, and inline documentation.

All PHP functions, classes, methods, filters, and actions must include complete DocBlocks with relevant PHPDoc tags. Inline comments must be grammatically correct and end with a period.

Any time you propose to `npm run build`, run `npm run lint` first, and resolve all warnings and errors.

Be especially careful to ensure PHPDoc and JSDoc block lines are aligned, to avoid linting failures.

Avoid short ternary operators and other overly compact expressions that reduce readability. Favor explicit, readable control flow.

Do not use jQuery or third-party JavaScript libraries unless explicitly required. Prefer modern vanilla JavaScript and WordPress-native APIs.

For JavaScript and UI development, always prefer WordPress core React components (Gutenberg) and access them via the global wp object. Do not bundle external copies of React, ReactDOM, or WordPress packages.

Code should prioritize maintainability, clarity, and compatibility with current and future WordPress core releases.

All code must be compatible with typical WordPress environments ranging from cheap shared hosting to enterprise platforms like WordPress VIP. No build step should be required unless explicitly stated.

## Hook reference documentation

Any time you introduce a new PHP `do_action()` or `apply_filters()` call, or a new JavaScript `wp.hooks.doAction()` or `wp.hooks.applyFilters()` call, you must add a corresponding entry to the appropriate file in `docs/reference/`:

- PHP action hooks → `docs/reference/core-and-admin.md`, `docs/reference/notifications.md`, `docs/reference/daily-digest.md`, `docs/reference/rest-api.md`, or `docs/reference/private-comments.md`, depending on the feature area.
- JavaScript filter hooks → `docs/reference/javascript-filters.md`.
- JavaScript action hooks → `docs/reference/javascript-actions.md`.

Follow the style of existing entries in the target file and update the entry count for that file in `docs/reference/README.md`.

## Translation workflow notes

Wrap all user-facing strings in translation functions with the `alpaca-issue-tracker` text domain.

- For PHP, use context-appropriate translation and escaping functions for HTML content, attributes, and URLs.
- For JavaScript and JSX, use functions from `wp.i18n` for all user-facing strings.

Add translator comments immediately before strings with placeholders, and avoid concatenating partial translatable strings.

When writing CSS, avoid hardcoded directional properties such as `left` and `right` for layout. Prefer logical properties such as `margin-inline-start`, `margin-inline-end`, `padding-inline-start`, `padding-inline-end`, `inset-inline-start`, and `inset-inline-end`.

For directional graphics such as chevrons and arrows, ensure behavior is correct in RTL contexts.

When generating JavaScript translation catalogs with `wp i18n make-json`, always include `--extensions=js,jsx` so strings in React `.jsx` files are exported.

To keep the `languages` folder tidy, keep only the minimum required language runtime files.

If hashed `.json` files are generated, merge required entries into a minimal set and remove unnecessary hashed files.

Before release or merge, verify that new strings are extractable and that i18n-related linting or coding standard warnings are resolved.
