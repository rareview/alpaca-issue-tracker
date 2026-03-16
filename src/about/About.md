## Thanks for testing Alpaca with us!

_Let's face it, nobody loves their project management platform._ They all have their limitations, or force you into certain workflow patterns. They become bloated with features you don't want, and won't let you tweak the experience how you want it. They are rarely client-friendly. Hosted platforms may not meet your regulatory or language requirements. The costs soon mount up.

Content management systems were very much the same, not so long ago. So we were thinking:

- Is it possible to do for kanban boards, what WordPress did for publishing?
- And can WordPress itself be part of that solution?

**Alpaca uses the WordPress conventions of custom post types, taxonomies, comments, hooks, and filters to deliver a WordPress-like kanban experience inside wp-admin.**

Our original plan was to provide a solution for issue reporting and management. Clients would only need to write a single sentence explaining the problem. All other context, including a screenshot, would be captured automatically, and delivered into a basic kanban board. Issues would be instantly actionable.

But we soon realised Alpaca could be a full collaboration solution, on par with platforms like Trello, Jira, or Asana.

---

### Current Features and Future Plans

<details>
<summary><strong>Beta 1: early Feb 2026</strong></summary>

- Create Issues with context (front end)
- Create non-contextual Issues (back end)
- Customisable kanban board with drag-and-drop
- Add assignees and deadlines to issues
- Add comments on issues (including basic Markdown)
- User actions create comments on Issues
- Heavy use of Gutenberg components for UX consistency
- WP-Admin Dashboard Widget
- Basic 'presence' indicator
</details>

---

<details>
<summary><strong>Beta 2: late Feb 2026</strong></summary>

- Attach files of multiple filetypes to comments
- Watchlist (Starred Items)
- Labels taxonomy
- Checklists with subtask assignment and promotion
- Search function (across issues and comments)
</details>

---

<details open="">
<summary><strong>Beta 3: mid March 2026</strong></summary>

- Notifications: configurable inbox of action on issues that matter to you
- Notifications: delivery of action notifications via email
- Notifications: block-based email template designer
- Project Activity screen: unfiltered timeline of all project activity
- Full translation readiness, including support for RTL languages
- New `alpaca-beta` release channel at GitHub
</details>

---

<details>
<summary><strong>In planning</strong></summary>

- Add support for other outbound communication channels (eg Slack)
- Add support for inbound communication from other platforms (eg GitHub)
- Data storage in a different WP instance
- Real-time collaboration / syncing
- Consolidated multi-project view
- AI-based issue analysis (and more?)
- Make Alpaca available for other CMSes

_Note: some of these ideas would most likely require a cloud component, and would form part of a premium service._

</details>

---

### Recommended Plugins

Alpaca should work on any current WordPress install, without further dependencies. We suggest adding the following plugins for a better usage or testing experience.

- [Simple Local Avatars](https://wordpress.org/plugins/simple-local-avatars/)
- [User Switching](https://wordpress.org/plugins/user-switching/)

---

### External dependencies

- [Bowser](https://github.com/bowser-js/bowser) for browser detection. Copyright 2015, Dustin Diaz (the "Original Author"). All rights reserved. [📜 MIT license.](https://github.com/bowser-js/bowser/blob/master/LICENSE)
- [Snapdom](https://github.com/zumerlab/snapdom) for screenshot capture. Copyright (c) 2025 ZumerLab. [📜 MIT license.](https://github.com/zumerlab/snapdom/blob/main/LICENSE)
- [Marked](https://marked.js.org/license) for Markdown processing. Copyright (c) 2018+, MarkedJS (https://github.com/markedjs/) Copyright (c) 2011-2018, Christopher Jeffrey (https://github.com/chjj/) [📜 License](https://github.com/markedjs/marked/blob/master/LICENSE.md)

---

### Your Questions Answered

**What do you want to achieve with Alpaca?**

There is no better place for managing a WordPress launch or retainer contract than inside WordPress itself. Reporting and resolving bugs is often frustrating for both client and contractor: Alpaca will make it easier to deliver results faster, and with greater visibility.

But as long-standing members of the WordPress community, we also want Alpaca to demonstrate the potential of 'WordPress as an operating system', through its use of the REST API and Gutenberg component library.

**What design and development principles have you used?**

We want Alpaca to feel like an integral part of the WordPress admin experience. Its design and interactions follow WordPress and Gutenberg conventions wherever practical, including re-using existing code.

Alpaca is primarily a React application, underpinned by a modern build process. We follow WordPress core coding standards.

**What is Alpaca's business strategy?**

The base version of Alpaca will be free and open-source. Agencies and corporate users will have greater needs, and we expect to offer premium features and cloud-hosted services on a commercial basis. We also believe there is potential to grow a plugin ecosystem around Alpaca, similar to WooCommerce or Gravity Forms.

**Is it ready to run in production?**

Alpaca's fundamentals are sound, having gone through multiple prototypes to reach this stage. But we would not advise you to use it in production _quite_ yet.

**Is my data secure?**

- Alpaca comments are stored as a custom comment type in the WordPress comments table; but they are filtered out of all standard comment outputs, including the Comments admin screens, RSS feeds, and REST API output. At present this is done with custom code, but we hope to build on core's recent addition of the private 'note' comment type.
- Alpaca relies on obfuscated slugs rather than sequential post IDs, reducing the possibility of guessing issue URLs.
- Otherwise: Alpaca closely follows WordPress core development practices, and is as secure as your WordPress install.

**Will I be able to tweak/extend Alpaca?**

Yes, naturally! Alpaca itself relies on hooks, actions and filters across its codebase, in both PHP and JS. If Alpaca doesn't already offer the feature you need, you will be able to use those same hooks to inject your own code, or adapt Alpaca's output to suit your requirements.

**Are Pull Requests welcome?**

Not yet. We are not actively seeking external contributions in these early stages; but we will open up our development repository in the coming months for transparency and external submissions.
