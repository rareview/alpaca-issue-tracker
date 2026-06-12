# Playground

This directory supports local and CI WordPress Playground runs for the current branch.

- The GitHub demo blueprint lives at `.github/blueprint.json` (installs the latest GitHub release ZIP).
- The WordPress.org Live Preview blueprint lives at `.wordpress-org/blueprints/blueprint.json` (installs from the plugin directory).
- The demo content lives in `playground/seed-demo-content.php`.
- `npm run playground:prepare` builds `alpaca-issue-tracker.zip` and generates a local bundle in `playground/.generated/bundle/`.
- `npm run playground:start` starts WordPress Playground with that generated bundle.

See `.wordpress-org/README.md` for deploying assets and enabling the plugin directory Live Preview button.