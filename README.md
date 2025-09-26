# ⏩ I just want to try the thing

Quick and dirty 'just get it running' instructions:

- Clone the repository
- `npm install`
- `npm run build`
- `npm run zip`: you should now have `alpaca.zip` in your folder
- Go to WordPress → wp-admin → Plugins → Add Plugin → Upload Plugin
- Upload `alpaca.zip`
- Activate
- You should now have a Project Board in your `wp-admin` sidebar...
- ... and an `Issues` menu in your admin toolbar along the top of the screen

# 📚 Back story

_(16 Sep 2025)_ It will probably help if I provide some context about what is (and isn't) happening here.

## Some context before we begin...

- Alpaca is just a working title: it isn't a serious proposal for the product's eventual name.
- Some aspects of technical and visual design are further advanced than others.
- It's the first large-scale project I've done with React, and with AI support. This may be obvious.
- Some completed (or half-completed) functionality will be held back for a premium product.
- Everything is up for discussion.

## What's the big idea?

**Clients don't have the time or knowledge to provide detailed technical reports when they spot a problem.** But developers can't do their job without that detail. Time is wasted on every issue report as the developer tries to understand and contextualise the problem.

**But WordPress already knows everything about the context of each page request.** So an issue-capturing solution inside WordPress could capture all that information, silently in the background, giving the developer everything necessary to get to work.

**And if you start inside WordPress, you might as well stay inside WordPress.** We can build a Trello-like interface inside wp-admin, using WordPress core components and approaches, for a familiar user and developer experience.

Alpaca can be everything that a freelancer or small agency needs to track bugs and feature requests; and it can be the basis of a federated solution, suitable for larger agencies serving multiple clients. It's easy to see a roadmap from a free community product to a commercial solution with obvious value-adds.

## Project principles

Everything should look, feel and operate like a natural extension of how WordPress already works.

Think in terms of post types, taxonomies, comments and meta tables. Use action and filter hooks (php and js) in your custom code; expect and enable others to do the same. Use [existing WordPress components](https://wordpress.github.io/gutenberg/?path=/docs/docs-introduction--page) at every opportunity.

We believe in the [WordPress development philosophy](https://wordpress.org/about/philosophy/), even if WordPress seems to have forgotten it.

Our target market is individuals and smaller teams, with limited time and limited expertise. Make the human interactions as simple as possible. Capture more data than you probably need. Automate whatever you can. The base product should be 'perfect for most people', with the _potential_ to be extended to satisfy the rest.

## Future

There are 10-20 plugins in the WordPress space - some free, some premium - which most site-builders install on most of their projects. Think Yoast, Gravity Forms, ACF, Woo. We believe this plugin can earn a place alongside these industry leaders.

We believe it can be the basis of a strong commercial business. A premium version must follow very quickly after the community release; but it must justify its cost. People will buy it because:

- they see that it will deliver an immediate return on the investment they make
- they acknowledge that some premium/cloud features incur costs to us

Our approach must also be an example to our ecosystem. There has been a lot of talk about WordPress as an operating system; and about Gutenberg as a general-purpose component library. We can put those principles into practice, inspiring the community, and asserting our own expertise.
