=== Alpaca ===
Contributors: rareview, s1m0nd, pratikbarvaliya, tahireu
Tags: issue tracker, bug tracker, project management, kanban, development
Requires at least: 6.8
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.0.0-beta
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

A lightweight issue tracker built directly into WordPress, designed for developers and agencies managing client projects.

== Description ==

Alpaca is a powerful yet simple issue tracking system that lives inside your WordPress admin. Built with the WordPress philosophy in mind, it provides a Trello-like kanban board interface for managing bugs, feature requests, and project tasks.

= Key Features =

* **Kanban Board Interface** - Drag-and-drop issues between customizable status columns
* **Automatic Context Capture** - Automatically captures browser info, page context, and technical details when issues are reported
* **Built for WordPress** - Uses native WordPress components, post types, and taxonomies
* **Developer Friendly** - Extensible via WordPress hooks and filters
* **User Permissions** - Integrates with WordPress user roles and capabilities
* **Screenshot Support** - Visual issue reporting with automatic screenshot capture
* **Comment System** - Built-in discussion threads for each issue
* **Priority Management** - Flag high-priority items and set deadlines
* **Assignee System** - Assign issues to team members

= Perfect For =

* Freelance developers managing client sites
* Small agencies tracking bugs and feature requests
* Development teams needing lightweight project management
* Anyone who wants issue tracking without leaving WordPress

= How It Works =

Clients don't have the time or knowledge to provide detailed technical reports when they spot a problem. But developers can't do their job without that detail. Alpaca solves this by automatically capturing all the technical context WordPress already knows about each page request.

When a user reports an issue, Alpaca silently captures:
- Browser and device information
- Current page URL and template
- Active plugins and theme
- PHP and WordPress versions
- User role and permissions
- Screenshots (optional)

This gives developers everything they need to reproduce and fix issues quickly.

== Installation ==

1. Upload the `alpaca` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Navigate to 'Project Board' in your admin sidebar to start tracking issues
4. Click 'Report An Issue' in the admin bar to create your first issue

== Frequently Asked Questions ==

= Who can see the Alpaca interface? =

By default, only logged-in users can see the Alpaca toolbar and report issues. Administrators have full access to the project board and all issues.

= Does this work with Gutenberg? =

Yes! Alpaca is built using WordPress Gutenberg components for a native WordPress experience.

= Can I customize the status columns? =

Yes, you can create custom statuses and reorder them via the Configure page.

= Is this compatible with multisite? =

Alpaca works on multisite installations, with each site having its own independent project board.

= Where is the data stored? =

All data is stored in your WordPress database using custom post types and taxonomies. No external services required.

== Screenshots ==

1. Kanban board interface with drag-and-drop functionality
2. Issue detail modal with tabs for comments, technical data, and errors
3. Quick issue creation from the admin bar
4. Customizable status columns

== Changelog ==

= 1.0.0-beta - 2026-02-05 =
* Initial MVP beta release for testing and feedback
* Kanban board interface with drag-and-drop
* Automatic context capture for issue reporting
* Screenshot support
* Comment system for issue discussions
* Priority and deadline management
* Assignee system
* WordPress Gutenberg component integration
* Automated build system via GitHub Actions
* Security: Restricted interface to logged-in users only

**Note:** This is a beta release intended for early adopters and testing. Features and functionality may change based on user feedback.

== Upgrade Notice ==

= 1.0.0-beta =
Initial MVP beta release. This is a beta version intended for testing and feedback. Please report any issues on GitHub.

== Development ==

Alpaca is open source and developed on GitHub. Contributions are welcome!

GitHub Repository: https://github.com/rareview/alpaca

= Building from Source =

1. Clone the repository
2. Run `npm install`
3. Run `npm run build`
4. Run `npm run zip` to create a distributable package

== Privacy Policy ==

Alpaca does not collect or transmit any data outside of your WordPress installation. All issue data, screenshots, and technical information are stored locally in your WordPress database.

== Credits ==

Developed by [Rareview](https://rareview.com/)
