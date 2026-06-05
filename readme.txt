=== Alpaca Issue Tracker ===
Contributors: rareview, s1m0nd, pratikbarvaliya, tahireu
Tags: issue tracker, bug tracker, project management, kanban, development
Requires at least: 6.8
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A lightweight issue tracker built entirely inside WordPress, designed for developers and agencies managing client projects.

== Description ==

Alpaca Issue Tracker is a powerful yet simple issue tracking system that lives inside your WordPress admin. Built with the WordPress philosophy in mind, it provides a Trello-like kanban board interface for managing bugs, feature requests, and project tasks.

= Key Features =

* **Kanban Board Interface** - Drag-and-drop issues between and within fully customizable status columns
* **Automatic Context Capture** - Browser info, page context, and technical details are saved with each bug report submitted from the front end
* **Built for WordPress** - Uses native WordPress components, post types, taxonomies and database tables
* **Extensibility** - Developers can add custom functions and integrations via conventional WordPress actions & filters
* **Respects User Permissions** - Integrates with WordPress user roles and capabilities
* **Screenshot Capture** - See exactly what the user saw, captured and processed locally within the browser
* **Comment and Activity Thread** - A unified view of each issue's progress, supporting attachment uploads and user mentions
* **Priority Management** - Flag high-priority items and set deadlines
* **Assignee System** - Assign issues and checklist items to team members
* **Email Notifications** - Instant or daily digest email notifications for the issues you care about
* **Translation Ready** - Fully localized and ready for translation into any language (including RTL support)
* **No Artificial Limitations** - Use on as many sites, with as many users, issues, attachments and interactions as you need

= Perfect For =

* Freelance developers managing client sites
* Small agencies tracking bugs and feature requests
* Development teams needing lightweight project management
* Clients performing QA on a new site
* Account managers responsible for rolling retainer contracts
* Enterprises and government bodies needing extra reassurance on hosting

= How It Works =

Clients don't have the time or knowledge to provide detailed technical reports when they spot a problem. But developers can't do their job without that detail. Alpaca Issue Tracker solves this by automatically capturing all the technical context WordPress already knows about each page request.

When a user reports an issue via the Alpaca Issue Tracker front-end toolbar, the plugin silently captures:
- A screenshot of what the user can see
- Browser and device information
- Current page URL and template
- Queried object details and HTTP headers
- Any JavaScript errors

This gives developers everything they need to reproduce and fix issues quickly, with zero burden on the client.

Issues can also be created on the admin side, meaning Alpaca Issue Tracker can also be used as a complete project management system, to plan new features or track internal tasks.

== Installation ==

1. Install and activate the plugin as normal.
2. Admin users can configure status columns and issue labels at: Project Board / Configure
3. Admin users can edit the design of Alpaca Issue Tracker email notifications at: Project Board / Email Templates
4. All users can set up personal notifications about issue progress: Project Board / My Notifications

== Frequently Asked Questions ==

= Who can see the Alpaca Issue Tracker interface? =

By default, only logged-in users can see the Alpaca Issue Tracker toolbar and report issues. Administrators have full access to the project board and all issues.

= Does this work with Gutenberg? =

Yes! Alpaca Issue Tracker is built using WordPress Gutenberg components for a native WordPress experience.

= Can I customize the Status columns and Labels? =

Yes, of course! You can add extra columns and labels, and change their names or presentation order, on the Configure screen.

= Can I customize the card presentation? =

Yes! You can choose which metadata points are shown on cards in the Board view, for just the right amount of information at a glance.

= Is this compatible with multisite? =

Alpaca Issue Tracker works on multisite installations, with each site having its own independent project board. An aggregation view across sites is planned for a future release.

= What kinds of notifications can Alpaca Issue Tracker send? =

Alpaca Issue Tracker ships with a highly configurable email notification system. You can choose to receive instant notifications of activity relevant to you and your issues; or a daily digest of all activity. You can even design the email templates using a block-based editor.

You can @-mention another user within the text of a comment, to send them a notification. A search window will appear as soon as you type an @ symbol.

Alpaca Issue Tracker's notification engine has been built with extensibility in mind: additional channels will be added in the future.

= Where is the data stored? =

All data is stored in your WordPress database's core tables using custom post types and taxonomies. The base plugin uses no external services.

== Screenshots ==

1. Project Board organizes issues by status with labels, assignees, deadlines, watchlist state, and priority indicators.
2. Issue details keep priority, due dates, assignees, labels, checklist items, attachments, and the comment timeline in one place.
3. Project Activity shows a chronological feed of issue comments and updates across the board.
4. Context Capture lets users report an issue from wp-admin with an optional high-priority flag and technical context.
5. Notification preferences let each user control instant and daily digest updates for issue activity.
6. Configure keeps board statuses, labels, deleted items, cards, and global settings inside WordPress.
7. Frontend issue capture lets logged-in users report problems from public pages without opening wp-admin.
8. Email Templates let admins edit instant and daily digest email content with a live preview.

== Third-Party Libraries ==

Alpaca Issue Tracker includes runtime copies or bundled output from the following GPL-compatible libraries:

* Bowser - MIT license - https://github.com/bowser-js/bowser
* DOMPurify - MPL-2.0 option from `(MPL-2.0 OR Apache-2.0)` - https://github.com/cure53/DOMPurify
* Marked - MIT license - https://marked.js.org/
* PrismJS - MIT license - https://prismjs.com/
* PropTypes - MIT license - https://github.com/facebook/prop-types
* SnapDOM - MIT license - https://github.com/zumerlab/snapdom

== Recommended Plugins ==

Alpaca Issue Tracker uses user images throughout its interface, for extra humanity. We recommend **Simple Local Avatars** as a reliable solution for processing and hosting photos of your users without using an external service.

== Changelog ==

= 1.0.2 =
* Updated the plugin readme changelog and release metadata.

= 1.0.1 =
* Added unread notification counts to the front-end toolbar.
* Added a board column action for creating issues directly in a selected status.

= 1.0.0 =
* First public release.

== Development ==

Source code and build configuration are available at:
https://github.com/rareview/alpaca-issue-tracker

= Building from Source =

1. Clone the repository
2. Run `npm install`
3. Run `npm run lint`
4. Run `npm run build`
5. Run `npm run zip` to create a distributable package

The distributed plugin includes compiled JavaScript and CSS assets. The source files, dependency manifests, and build instructions are available in the repository above. Composer dependencies are used for development tooling and coding standards checks.

== Privacy Policy ==

Alpaca Issue Tracker does not collect or transmit any data outside of your WordPress installation. All issue data, screenshots, and technical information are captured and stored locally in your WordPress database and/or filesystem.

== Credits ==

Developed by [Rareview®](https://rareview.com/)
