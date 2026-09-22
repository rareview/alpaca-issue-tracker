# Alpaca Issue Tracker: smart kanban inside WordPress

- Minimum burden on users reporting website issues
- Maximum detail in technical reports received by developers
- Full-featured kanban board in wp-admin, for a familiar and secure user experience

**Clients have neither the time nor the knowledge to provide detailed technical reports when they spot a problem on their website.** But developers can't do their job without that detail. Time is wasted on every issue report, as the developer tries to understand and replicate the problem.

**But WordPress already knows everything about the context of each page request.** So an issue-capturing solution inside WordPress can capture all that information, silently in the background, giving the developer everything necessary to get to work.

**Why take it outside WordPress?** Every project needs a method for tracking issue progress: since your clients and developers will already be using WordPress for the website itself, the most logical place to do that is within WordPress.

Alpaca Issue Tracker provides a full-featured kanban experience inside wp-admin, using WordPress core components and approaches, for a familiar user _and_ developer experience.

## Try it in WordPress Playground

[Open Alpaca Issue Tracker in WordPress Playground](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/rareview/alpaca-issue-tracker/main/.github/blueprint.json)

[Download the latest Alpaca Issue Tracker ZIP](https://github.com/rareview/alpaca-issue-tracker/releases/latest/download/alpaca-issue-tracker.zip)

For local branch testing, run `npm run playground:start`. That builds the current branch ZIP and opens a local Playground instance using the same seeded content as the public demo.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, coding standards, and pull request guidelines.

## Key features

- **Kanban Board Interface** - Drag-and-drop issues between and within fully customizable status columns
- **Automatic Context Capture** - Browser info, page context, and technical details are saved with each bug report submitted from the front end
- **Built for WordPress** - Uses native WordPress components, post types, taxonomies and database tables
- **Extensibility** - Developers can add custom functions and integrations via conventional WordPress actions & filters
- **Respects User Permissions** - Integrates with WordPress user roles and capabilities
- **Screenshot Capture** - See exactly what the user saw, captured and processed locally within the browser
- **Comment and Activity Thread** - A unified view of each issue's progress, supporting attachment uploads and user mentions
- **Priority Management** - Flag high-priority items and set deadlines
- **Assignee System** - Assign issues and checklist items to team members
- **Email Notifications** - Instant or daily digest email notifications for the issues you care about
- **Translation Ready** - Fully localized and ready for translation into any language (including RTL support)
- **No Artificial Limitations** - Use on as many sites, with as many users, issues, attachments and interactions as you need

## Who is Alpaca Issue Tracker designed for?

- Freelance developers managing client sites
- Small agencies tracking bugs and feature requests
- Engineering teams needing lightweight project management
- Developers wanting tune their kanban experience
- Clients performing QA on a new site
- Account managers responsible for rolling retainer contracts
- Enterprises and government bodies needing extra reassurance on hosting

## External dependencies

- [Bowser](https://github.com/bowser-js/bowser) for browser detection. Copyright 2015, Dustin Diaz (the "Original Author"). All rights reserved. [MIT license.](https://github.com/bowser-js/bowser/blob/master/LICENSE)
- [DOMPurify](https://github.com/cure53/DOMPurify) for HTML sanitization. Copyright 2025, Dr.-Ing. Mario Heiderich, Cure53. [MPL-2.0 or Apache-2.0 license.](https://github.com/cure53/DOMPurify/blob/main/LICENSE)
- [Marked](https://marked.js.org/license) for Markdown processing. Copyright (c) 2018+, MarkedJS (https://github.com/markedjs/) Copyright (c) 2011-2018, Christopher Jeffrey (https://github.com/chjj/) [MIT license.](https://github.com/markedjs/marked/blob/master/LICENSE.md)
- [PrismJS](https://prismjs.com/) for syntax highlighting. Copyright (c) 2012, Lea Verou. [MIT license.](https://github.com/PrismJS/prism/blob/master/LICENSE)
- [PropTypes](https://github.com/facebook/prop-types) for React prop validation. Copyright (c) 2013-present, Facebook, Inc. [MIT license.](https://github.com/facebook/prop-types/blob/main/LICENSE)
- [Snapdom](https://github.com/zumerlab/snapdom) for screenshot capture. Copyright (c) 2025 ZumerLab. [MIT license.](https://github.com/zumerlab/snapdom/blob/main/LICENSE)
