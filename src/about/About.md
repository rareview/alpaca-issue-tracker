## Thanks for testing Alpaca with us!

_Let's face it, nobody loves their project management platform._ They all have their limitations, or force you into certain workflow patterns. They become bloated with features you don't want, and won't let you tweak it how you want it.

Content management systems were very much the same, not so long ago. So we've been thinking:

- Is it possible to do for kanban boards, what WordPress did for publishing?
- And can WordPress itself be part of that solution?

**Alpaca uses the WordPress conventions of custom post types, taxonomies, comments, hooks, and filters to deliver a Trello-esque kanban experience within wp-admin.**

Out of the box, Alpaca presents itself as a solution for reporting and tracking issues on a WordPress site. Because: who knows more about your WordPress website than WordPress itself?

When you see a problem, you press the Report Issue button, write a one-sentence description, and press Submit. *That's it.*

Alpaca captures the full context of what's in your browser at the time (including a screenshot!) and creates a detailed issue in your Backlog. Every report is instantly actionable: you will never have to go back to your client, to ask what exactly they meant by 'broken'.

But just as WordPress is capable of much more than its base use-case of blogging, we are building Alpaca to be much more ambitious than a single-site issue tracker.

---

### Current Features and Future Plans

```
MVP FEATURE SET (this version)                              FIRST FULL RELEASE (already in development)
==============================                              ===========================================
Contextualised issue capture (inc screenshot)               Checklists and/or subtasks
Customisable kanban board with drag-and-drop                Starred Items watchlists
Add assignees and deadlines to issues                       Visible 'Tagging' of issues
Add comments on issues (including basic Markdown)           Table and swim-line views
User actions create comments on Issues                      Comments pushed to external channels (eg Slack)
Heavy use of Gutenberg components for UX consistency        Comments pulled from external activity (eg GitHub)
                                                            Board filtering
                                                            Basic email notifications
                                                            Basic user/role permission controls
                                                            Additional attachments

FUTURE PLANS                                                UNDER CONSIDERATION
============                                                ===================
Unified view across multiple projects                       AI analysis and developer support
Store/backup Alpaca data in a different WP instance         Add Alpaca reporting tools to non-WordPress sites
                                                            Cloud-hosted functions (eg multi browser testing)
                                                            Cloud-hosted platform
```

---

### Recommended plugins

Alpaca should work on any current WordPress install, without further dependencies. We suggest adding the following plugins for a better usage or testing experience.

- [Simple Local Avatars](https://wordpress.org/plugins/simple-local-avatars/)
- [User Switching](https://wordpress.org/plugins/user-switching/)

---

### Your Questions Answered

**Who is Alpaca aimed at?**

Out of the box, Alpaca will present itself as a solution for solo consultants and small teams working on a single website. But just like WordPress isn't just for bloggers, Alpaca will have much greater ambitions.

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

- Recognising that screenshots could include sensitive data, we have opted to store them as obfuscated code in postmeta, not as image uploads which could become visible through the Media Library or URL guessing.
- Alpaca comments are stored as a custom comment type in the WordPress comments table; but they are filtered out of all standard comment outputs, including the Comments admin screens, RSS feeds, and REST API output. At present this is done with custom code, but we hope to build on core's recent addition of the private 'note' comment type.
- Otherwise: Alpaca closely follows WordPress core development practices, and is as secure as your WordPress install.

**Will I be able to tweak/extend Alpaca?**

Yes, naturally! Alpaca itself relies on hooks, actions and filters across its codebase, in both PHP and JS. If Alpaca doesn't already offer the feature you need, you will be able to use those same hooks to inject your own code, or adapt Alpaca's output to suit your requirements.

**Are Pull Requests welcome?**

We are not actively seeking external contributions in these early stages; but we will open up our development repository in the coming months for transparency and external submissions.
