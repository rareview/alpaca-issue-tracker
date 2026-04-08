#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SVG_DIR = path.join(ROOT_DIR, 'src/components/icons/svg');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src/components/icons/Icon.jsx');
const PHP_OUTPUT_FILE = path.join(
  ROOT_DIR,
  'includes/utilities/icon-registry.php',
);

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
 * Remove non-SVG preamble markup that should not be inlined.
 *
 * @param {string} svgText Raw SVG file text.
 * @return {string} SVG text without XML or doctype preamble.
 */
function sanitizeSvgText(svgText) {
  return svgText
    .replace(/\r\n?/g, '\n')
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/<!doctype[^>]*>/gi, '')
    .trim();
}

/**
 * Extract a root SVG attribute value.
 *
 * @param {string} sanitizedSvgText Sanitized SVG file text.
 * @param {string} attributeName    Root attribute name.
 * @return {string} Attribute value, or an empty string when not present.
 */
function extractSvgRootAttribute(sanitizedSvgText, attributeName) {
  const openingTagMatch = sanitizedSvgText.match(/<svg\b[^>]*>/i);

  if (!openingTagMatch) {
    throw new Error('Invalid SVG: opening <svg> tag not found.');
  }

  const attributePattern = new RegExp(
    `\\b${attributeName}\\s*=\\s*(['"])(.*?)\\1`,
    'i',
  );
  const attributeMatch = openingTagMatch[0].match(attributePattern);

  if (!attributeMatch) {
    return '';
  }

  return attributeMatch[2].trim();
}

/**
 * Extract inner markup from an SVG file.
 *
 * @param {string} sanitizedSvgText SVG file text without XML/doctype preamble.
 * @return {string} SVG inner markup.
 */
function extractInnerSvgMarkup(sanitizedSvgText) {
  const openingTagMatch = sanitizedSvgText.match(/<svg\b[^>]*>/i);

  if (!openingTagMatch) {
    throw new Error('Invalid SVG: opening <svg> tag not found.');
  }

  const openingTagIndex = openingTagMatch.index + openingTagMatch[0].length;
  const closingTagIndex = sanitizedSvgText.lastIndexOf('</svg>');

  if (closingTagIndex < 0 || closingTagIndex < openingTagIndex) {
    throw new Error('Invalid SVG: closing </svg> tag not found.');
  }

  return sanitizedSvgText.slice(openingTagIndex, closingTagIndex).trim();
}

/**
 * Escape a string for single-quoted PHP string output.
 *
 * @param {string} value Input string.
 * @return {string} Escaped string.
 */
function escapePhpSingleQuotedString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Pad a PHP array key string so double arrows can be aligned.
 *
 * @param {string} key       Array key.
 * @param {number} maxLength Maximum key length in the current array.
 * @return {string} Padded key string.
 */
function padPhpArrayKey(key, maxLength) {
  const quotedKey = `'${escapePhpSingleQuotedString(key)}'`;
  return quotedKey.padEnd(maxLength + 2, ' ');
}

/**
 * Build JSX object entry for one icon slug.
 *
 * @param {string} iconSlug  Icon slug.
 * @param {string} jsxMarkup JSX-safe SVG child markup.
 * @param {string} viewBox   SVG viewBox value.
 * @return {string} Object entry for ICONS map.
 */
function buildIconEntry(iconSlug, jsxMarkup, viewBox) {
  const indentedMarkup = jsxMarkup
    .split('\n')
    .map((line) => `      ${line}`)
    .join('\n');

  return `  '${iconSlug}': {\n    markup: (\n    <>\n${indentedMarkup}\n    </>\n    ),\n    viewBox: '${viewBox}',\n  },`;
}

/**
 * Generate Icon.jsx content.
 *
 * @param {Array<{slug: string, jsxMarkup: string, viewBox: string}>} iconDefinitions Icon definitions.
 * @return {string} Full Icon.jsx file contents.
 */
function buildIconComponentFile(iconDefinitions) {
  const iconEntries = iconDefinitions
    .map((iconDefinition) =>
      buildIconEntry(
        iconDefinition.slug,
        iconDefinition.jsxMarkup,
        iconDefinition.viewBox,
      ),
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
  const iconDefinition = ICONS[resolvedName] || ICONS[fallbackName] || null;

  if (!iconDefinition || !iconDefinition.markup) {
    return null;
  }

  return (
    <BaseIcon viewBox={iconDefinition.viewBox} {...props}>
      {iconDefinition.markup}
    </BaseIcon>
  );
};

Icon.propTypes = {
  name: PropTypes.oneOf(iconNames).isRequired,
};

export { iconNames };
export default Icon;
`;
}

/**
 * Generate PHP icon registry contents.
 *
 * @param {Array<{slug: string, svgMarkup: string}>} iconDefinitions Icon definitions.
 * @return {string} Full PHP icon registry contents.
 */
function buildPhpIconRegistryFile(iconDefinitions) {
  const maxIconSlugLength = iconDefinitions.reduce(
    (currentMax, iconDefinition) => {
      return Math.max(currentMax, iconDefinition.slug.length);
    },
    0,
  );
  const maxAliasSlugLength = Object.keys(ICON_ALIASES).reduce(
    (currentMax, aliasSlug) => {
      return Math.max(currentMax, aliasSlug.length);
    },
    0,
  );
  const iconEntries = iconDefinitions
    .map((iconDefinition) => {
      return `\t\t${padPhpArrayKey(iconDefinition.slug, maxIconSlugLength)} => <<<'SVG'\n${iconDefinition.svgMarkup}\nSVG\n\t\t,`;
    })
    .join('\n');

  const aliasEntries = Object.entries(ICON_ALIASES)
    .map(([aliasSlug, iconSlug]) => {
      return `\t\t${padPhpArrayKey(aliasSlug, maxAliasSlugLength)} => '${escapePhpSingleQuotedString(iconSlug)}',`;
    })
    .join('\n');
  const rootEntries = [
    {
      key: 'icons',
      value: 'array(\n' + iconEntries + '\n\t)',
    },
    {
      key: 'aliases',
      value: 'array(\n' + aliasEntries + '\n\t)',
    },
  ];
  const maxRootKeyLength = rootEntries.reduce((currentMax, entry) => {
    return Math.max(currentMax, entry.key.length);
  }, 0);

  return `<?php
/**
 * Auto-generated icon registry for PHP icon rendering.
 *
 * @package Alpaca
 */

return array(
\t${padPhpArrayKey('icons', maxRootKeyLength)} => array(
${iconEntries}
\t),
\t${padPhpArrayKey('aliases', maxRootKeyLength)} => array(
${aliasEntries}
\t),
);
`;
}

/**
 * Collect all icon definitions from the SVG source directory.
 *
 * @return {Array<{slug: string, jsxMarkup: string, svgMarkup: string, viewBox: string}>} Icon definitions.
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
    const svgMarkup = sanitizeSvgText(svgText);
    const innerMarkup = extractInnerSvgMarkup(svgMarkup);
    const jsxMarkup = normalizeSvgMarkupForJsx(innerMarkup);
    const viewBox =
      extractSvgRootAttribute(svgMarkup, 'viewBox') || '0 0 16 16';

    return {
      slug: iconSlug,
      jsxMarkup,
      svgMarkup,
      viewBox,
    };
  });
}

/**
 * Main entrypoint.
 */
function main() {
  const iconDefinitions = collectSvgIconDefinitions();
  const reactFileContents = buildIconComponentFile(iconDefinitions);
  const phpFileContents = buildPhpIconRegistryFile(iconDefinitions);

  fs.writeFileSync(OUTPUT_FILE, reactFileContents);
  fs.writeFileSync(PHP_OUTPUT_FILE, phpFileContents);
  process.stdout.write(
    `Generated ${path.relative(ROOT_DIR, OUTPUT_FILE)} and ${path.relative(ROOT_DIR, PHP_OUTPUT_FILE)} from ${iconDefinitions.length} SVG files.\n`,
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  buildIconComponentFile,
  buildPhpIconRegistryFile,
  collectSvgIconDefinitions,
  extractInnerSvgMarkup,
  extractSvgRootAttribute,
  normalizeSvgMarkupForJsx,
  sanitizeSvgText,
};
