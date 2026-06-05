# Icon System

## Goal

Alpaca Issue Tracker uses a no-touch icon pipeline for React:

- Add or update SVG files in one source folder.
- Regenerate a single React icon registry automatically.
- Consume all React icons through one component API.

This keeps icon additions low-friction and avoids manual JSX wrapper files.

## Source Of Truth

All canonical icon source files live in `src/components/icons/svg/`.

- File name is the icon slug, for example `calendar2-week.svg`.
- Prefer `viewBox="0 0 16 16"` for consistency.
- Keep SVG markup clean and minimal.

## Generated React API

`src/components/icons/Icon.jsx` is auto-generated from the SVG folder.

- Do not edit `Icon.jsx` manually.
- Use `Icon` in React with `<Icon name="icon-slug" />`.
- `BaseIcon.jsx` remains the shared low-level wrapper for sizing, color, and accessibility behavior.

### Example

```jsx
import Icon from './components/icons/Icon';

<Icon name="calendar2-week" />;
```

## Generator

Generator script: `scripts/generate-icons.js`.

It:

- Reads every `.svg` file in `src/components/icons/svg/`.
- Extracts inner SVG markup and converts attributes to JSX-safe names.
- Rebuilds `src/components/icons/Icon.jsx`.
- Adds compatibility aliases (for existing call sites) such as `calendar`, `priority`, and `report`.

## Automatic Runs

The generator runs automatically via npm lifecycle hooks:

- `prestart`
- `prewatch`
- `prebuild`
- `prelint:js`

That means React icons stay in sync before local dev, watch mode, build, and lint checks.

## How To Add A New Icon

1. Add a new SVG file to `src/components/icons/svg/` using a kebab-case slug.
2. Run `npm run icons:generate` if you want immediate local regeneration.
3. Use the icon in JSX with `<Icon name="your-new-slug" />`.
4. Run `npm run lint` to verify formatting and standards.

No extra JSX icon file is required.

## CSS/SCSS Usage

For mask-based decorative icons in stylesheets, continue referencing SVG files directly:

- Example: `mask-image: url('../components/icons/svg/calendar2-week.svg');`

### Which SVGs end up in `dist`

Parcel only emits hashed files into `dist/` for SVGs that the bundler actually sees as build inputs — for example SVGs referenced from CSS (`url(...)` / `mask-image`).

## PHP Usage

For PHP-rendered icons, use `alpaistr_get_icon( $icon_slug )` in `includes/utilities/functions.php`.

- The generator also writes `includes/utilities/icon-registry.php` from the same SVG source folder.
- `alpaistr_get_icon()` reads that generated registry, so PHP icons do not depend on Parcel emitting a separate hashed SVG file.
- When a requested icon cannot be found, this helper returns the generated `missing` icon as a visual developer fallback.

## Sanitization

SVG files are sanitized before being returned for output. The repository uses a small, project-maintained allowlist to ensure only safe SVG tags and attributes are permitted.

- The allowlist JSON lives at `includes/utilities/icon-sanitizer-allowlist.json`.
- At build time the icon generator validates SVG source files against this allowlist and skips malformed or disallowed files.
- At runtime PHP uses `wp_kses()` with the same allowlist to sanitize the SVG markup returned by `alpaistr_get_icon()`.

If you need to allow additional tags or attributes, update `includes/utilities/icon-sanitizer-allowlist.json` and re-run `npm run icons:generate`.
