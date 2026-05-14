# Playground

This directory supports local and CI WordPress Playground runs for the current branch.

- The public demo blueprint lives at `.github/blueprint.json`.
- The demo content lives in `playground/seed-demo-content.php`.
- `npm run playground:prepare` builds `alpaca.zip` and generates a local bundle in `playground/.generated/bundle/`.
- `npm run playground:start` starts WordPress Playground with that generated bundle.