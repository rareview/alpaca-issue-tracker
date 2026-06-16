# Contributing to Alpaca Issue Tracker

Thank you for your interest in contributing. Alpaca Issue Tracker is a WordPress-native issue tracker for bug reports, QA feedback, and project work inside `wp-admin`.

## Code of conduct

This project follows the [WordPress Community Code of Conduct](https://make.wordpress.org/handbook/community-code-of-conduct/). By participating, you agree to uphold a welcoming and respectful environment.

## License

Alpaca Issue Tracker is licensed under the [GNU General Public License v2 or later](license.txt). By submitting a pull request, you agree to release your contribution under the same license. You retain copyright over your work.

## Ways to contribute

- Report bugs and suggest improvements through [GitHub Issues](https://github.com/rareview/alpaca-issue-tracker/issues).
- Improve documentation in `docs/`.
- Submit code changes for PHP, React, SCSS, and tests.

For larger features or architectural changes, open an issue first so we can agree on scope before you invest significant time.

## Development setup

Detailed setup instructions live in [docs/developer/development.md](docs/developer/development.md).

Quick start from the repository root:

```bash
composer install
npm ci
npm run lint
npm run build
```

You need a local WordPress site (or [WordPress Playground](https://wordpress.org/playground/)) to activate and test the plugin. For a browser-based demo of the current branch, run `npm run playground:start`.

### Requirements

- **WordPress:** 6.9 or newer (see `readme.txt`).
- **PHP:** 8.0 or newer.
- **Node.js** and **npm** for front-end assets and linting.
- **Composer** for PHP tooling and tests.

## Coding standards

All contributions must follow the [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/) and project conventions:

- Run `npm run lint` before `npm run build`. Fix all lint errors and warnings.
- PHP: complete PHPDoc on functions, classes, methods, filters, and actions. Use `npm run lint:php` or `npm run format:php`.
- JavaScript and SCSS: ESLint and Stylelint via `npm run lint:js` and `npm run lint:styles`. Prefer WordPress core React components through the global `wp` object. Do not bundle external copies of React or WordPress packages.
- User-facing strings: wrap in translation functions with the `alpaca-issue-tracker` text domain. Run `npm run make-pot` when strings change.
- CSS layout: prefer logical properties (`margin-inline-start`, `padding-inline-end`, etc.) over hardcoded `left`/`right` where possible.
- New PHP `do_action()` / `apply_filters()` or JavaScript `wp.hooks` extension points must be documented in `docs/reference/` (see [Hook And Filter Reference](docs/reference/README.md)).

Functional PHP changes should include PHPUnit tests under `tests/unit/` when practical.

## Testing

Before opening a pull request:

```bash
npm run lint
composer test
```

CI on pull requests to `main` runs JavaScript, CSS, PHP, and Markdown linting, builds assets, and runs PHPUnit (see [.github/workflows/code-quality.yml](.github/workflows/code-quality.yml)).

For manual verification, use WordPress Playground (`npm run playground:start`) or your local WordPress install.

## Commit messages

This repository follows a [Conventional Commits](https://www.conventionalcommits.org/)–style format:

```text
type(scope): short description
```

Examples from this project:

- `fix(rest): require REST nonce only for cookie-authenticated requests`
- `feat(playground): add WordPress.org Live Preview blueprint`
- `docs(readme): add 1.0.7 changelog entry`
- `chore(i18n): regenerate POT file`

### Types

Use the type that best matches the change:

| Type    | Use for                                                          |
| ------- | ---------------------------------------------------------------- |
| `fix`   | Bug fixes                                                        |
| `feat`  | New features or user-visible behavior                            |
| `docs`  | Documentation only                                               |
| `chore` | Tooling, releases, housekeeping (no user-facing behavior change) |
| `test`  | Test-only changes                                                |

### Scope

Scope is optional but helpful. Prefer a short area name when it clarifies the change, such as `rest`, `board`, `abilities`, `security`, `playground`, `i18n`, or `readme`.

### Guidelines

- Use the imperative mood (“add feature”, not “added feature”).
- Keep the subject line concise; add a body only when extra context helps reviewers.
- One logical change per commit when possible.
- Release version bumps are handled by maintainers with `chore(release): release X.Y.Z`.

Pull request titles can follow the same pattern when practical.

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Keep each pull request focused on one logical change.
3. Describe what changed and why. Note user-facing changes that may need a `readme.txt` changelog entry.
4. Ensure CI passes.
5. Open the pull request against `main`.

Maintainers review contributions as time allows. You may be asked to adjust scope, tests, or documentation before merge.

## Security issues

Do not report security vulnerabilities in public GitHub issues. See [SECURITY.md](SECURITY.md).

## Documentation

- [User and developer documentation](docs/README.md)
- [REST API reference](docs/developer/rest-api.md)
- [Abilities API reference](docs/developer/abilities-api.md)

## Questions

Open a [GitHub Issue](https://github.com/rareview/alpaca-issue-tracker/issues) for questions about contributing or using the plugin.
