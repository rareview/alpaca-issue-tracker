#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SVG_DIR = path.join(ROOT_DIR, 'src/components/icons/svg');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src/components/icons/Icon.jsx');

const ICON_ALIASES = {
  calendar: 'calendar2-week',
  priority: 'exclamation-circle-fill',
  report: 'exclamation-circle-fill',
};

const ATTRIBUTE_NAME_MAP = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'xlink:href': 'xlinkHref',
  'xml:space': 'xmlSpace',
};

/**
 * Convert a kebab-case attribute name to camelCase for JSX.
 *
 * @param {string} attributeName SVG/XML attribute name.
 * @return {string} JSX-safe attribute name.
 */
function normalizeAttributeName(attributeName) {
  const lowerName = attributeName.toLowerCase();

  if (ATTRIBUTE_NAME_MAP[lowerName]) {
    return ATTRIBUTE_NAME_MAP[lowerName];
  }

  if (lowerName.includes('-')) {
    return lowerName.replace(/-([a-z])/g, (_, character) =>
      character.toUpperCase(),
    );
  }

  return attributeName;
}

/**
 * Transform raw SVG inner markup into JSX-safe markup.
 *
 * @param {string} markup Raw SVG inner markup.
 * @return {string} JSX-safe markup.
 */
function normalizeSvgMarkupForJsx(markup) {
  return markup.replace(/([:@A-Za-z0-9_-]+)=/g, (match, attributeName) => {
    return `${normalizeAttributeName(attributeName)}=`;
  });
}

/**
 * Extract inner markup from an SVG file.
 *
 * @param {string} svgText SVG file text.
 * @return {string} SVG inner markup.
 */
function extractInnerSvgMarkup(svgText) {
  const withoutDoctype = svgText
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/<!doctype[^>]*>/gi, '')
    .trim();

  const openingTagMatch = withoutDoctype.match(/<svg\b[^>]*>/i);

  if (!openingTagMatch) {
    throw new Error('Invalid SVG: opening <svg> tag not found.');
  }

  const openingTagIndex = openingTagMatch.index + openingTagMatch[0].length;
  const closingTagIndex = withoutDoctype.lastIndexOf('</svg>');

  if (closingTagIndex < 0 || closingTagIndex < openingTagIndex) {
    throw new Error('Invalid SVG: closing </svg> tag not found.');
  }

  return withoutDoctype.slice(openingTagIndex, closingTagIndex).trim();
}

/**
 * Build JSX object entry for one icon slug.
 *
 * @param {string} iconSlug  Icon slug.
 * @param {string} jsxMarkup JSX-safe SVG child markup.
 * @return {string} Object entry for ICONS map.
 */
function buildIconEntry(iconSlug, jsxMarkup) {
  const indentedMarkup = jsxMarkup
    .split('\n')
    .map((line) => `      ${line}`)
    .join('\n');

  return `  '${iconSlug}': (\n    <>\n${indentedMarkup}\n    </>\n  ),`;
}

/**
 * Generate Icon.jsx content.
 *
 * @param {Array<{slug: string, jsxMarkup: string}>} iconDefinitions Icon definitions.
 * @return {string} Full Icon.jsx file contents.
 */
function buildIconComponentFile(iconDefinitions) {
  const iconEntries = iconDefinitions
    .map((iconDefinition) =>
      buildIconEntry(iconDefinition.slug, iconDefinition.jsxMarkup),
    )
    .join('\n');

  const aliasEntries = Object.entries(ICON_ALIASES)
    .map(([aliasSlug, iconSlug]) => `  '${aliasSlug}': '${iconSlug}',`)
    .join('\n');

  return `import PropTypes from 'prop-types';
import BaseIcon from './BaseIcon';

// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Regenerate with: npm run icons:generate

const ICONS = {
${iconEntries}
};

const ICON_ALIASES = {
${aliasEntries}
};

const iconNames = Object.freeze([
  ...Object.keys(ICONS),
  ...Object.keys(ICON_ALIASES),
]);

const Icon = ({ name, ...props }) => {
  const resolvedName = ICON_ALIASES[name] || name;
  const fallbackName = 'missing';
  const iconMarkup = ICONS[resolvedName] || ICONS[fallbackName] || null;

  if (!iconMarkup) {
    return null;
  }

  return <BaseIcon {...props}>{iconMarkup}</BaseIcon>;
};

Icon.propTypes = {
  name: PropTypes.oneOf(iconNames).isRequired,
};

export { iconNames };
export default Icon;
`;
}

/**
 * Collect all icon definitions from the SVG source directory.
 *
 * @return {Array<{slug: string, jsxMarkup: string}>} Icon definitions.
 */
function collectSvgIconDefinitions() {
  const svgFiles = fs
    .readdirSync(SVG_DIR)
    .filter((fileName) => fileName.endsWith('.svg'))
    .sort((leftName, rightName) => leftName.localeCompare(rightName));

  if (0 === svgFiles.length) {
    throw new Error('No SVG icons found in src/components/icons/svg.');
  }

  return svgFiles.map((fileName) => {
    const iconSlug = path.basename(fileName, '.svg');
    const filePath = path.join(SVG_DIR, fileName);
    const svgText = fs.readFileSync(filePath, 'utf8');
    const innerMarkup = extractInnerSvgMarkup(svgText);
    const jsxMarkup = normalizeSvgMarkupForJsx(innerMarkup);

    return {
      slug: iconSlug,
      jsxMarkup,
    };
  });
}

/**
 * Main entrypoint.
 */
function main() {
  const iconDefinitions = collectSvgIconDefinitions();
  const fileContents = buildIconComponentFile(iconDefinitions);

  fs.writeFileSync(OUTPUT_FILE, fileContents);
  process.stdout.write(
    `Generated ${path.relative(ROOT_DIR, OUTPUT_FILE)} from ${iconDefinitions.length} SVG files.\n`,
  );
}

main();
