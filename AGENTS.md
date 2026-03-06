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
