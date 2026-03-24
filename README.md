# Alpaca: smart kanban inside WordPress

_Let's face it, nobody loves their project management platform._ They all have their limitations, or force you into certain workflow patterns. They become bloated with features you don't want, and won't let you tweak the experience how you want it. They are rarely client-friendly. Hosted platforms may not meet your regulatory or language requirements. The costs soon mount up.

Content management systems were very much the same, not so long ago. So we were thinking:

- Is it possible to do for kanban boards, what WordPress did for publishing?
- And can WordPress itself be part of that solution?

**Alpaca uses the WordPress conventions of custom post types, taxonomies, comments, hooks, and filters to deliver a WordPress-like kanban experience inside wp-admin.**

Our original plan was to provide a solution for issue reporting and management. Clients would only need to write a single sentence explaining the problem. All other context, including a screenshot, would be captured automatically, and delivered into a basic kanban board. Issues would be instantly actionable.

But we soon realised Alpaca could be a full collaboration solution, on par with platforms like Trello, Jira, or Asana.

## What's the big idea?

**Clients don't have the time or knowledge to provide detailed technical reports when they spot a problem.** But developers can't do their job without that detail. Time is wasted on every issue report as the developer tries to understand and contextualise the problem.

**But WordPress already knows everything about the context of each page request.** So an issue-capturing solution inside WordPress could capture all that information, silently in the background, giving the developer everything necessary to get to work.

**And if you start inside WordPress, you might as well stay inside WordPress.** We can build a Trello-like interface inside wp-admin, using WordPress core components and approaches, for a familiar user and developer experience.

Alpaca can be everything that a freelancer or small agency needs to track bugs and feature requests; and it can be the basis of a federated solution, suitable for larger agencies serving multiple clients.

## Release plan

- We have issued a number of private betas to friends and partners, to get feedback on the product's fundamentals as we developed its core feature set.
- When the base feature set is complete, we will make our first Release Candidate version available publicly, initially via a GitHub repository.
- We intend to release Alpaca as a free plugin within the WordPress.org plugin repository.
- We plan to launch a documentation site with details of Alpaca's action hooks and filters.
- We are already working on a set of premium features, some requiring a cloud-based component, as part of a future commercial subscription service.

## Project principles

Everything should look, feel and operate like a natural extension of how WordPress already works.

Think in terms of post types, taxonomies, comments and meta tables. Use action and filter hooks (php and js) in your custom code; expect and enable others to do the same. Use [existing WordPress components](https://wordpress.github.io/gutenberg/?path=/docs/docs-introduction--page) at every opportunity.

We believe in the [WordPress development philosophy](https://wordpress.org/about/philosophy/), even if WordPress seems to have forgotten it.

Our target market is individuals and smaller teams, with limited time and limited expertise. Make the human interactions as simple as possible. Capture more data than you probably need. Automate whatever you can. The base product should be 'perfect for most people', with the _potential_ to be extended to satisfy the rest.

We are building Alpaca as an exemplar of what can be done with WordPress as an application platform.
