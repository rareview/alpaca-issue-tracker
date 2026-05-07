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
const SVG_ALLOWLIST_FILE = path.join(
  ROOT_DIR,
  'includes/utilities/icon-sanitizer-allowlist.json',
);

const ICON_ALIASES = {
  calendar: 'calendar2-week',
  priority: 'exclamation-circle-fill',
  report: 'exclamation-circle-fill',
};

const TERMINAL_STYLE = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  yellow: '\x1b[33m',
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
  const sanitizedSvgText = svgText
    .replace(/\r\n?/g, '\n')
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject\b[^>]*>[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-z0-9_:-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(?:href|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, '')
    .trim();

  return sanitizedSvgText;
}

/**
 * Read and normalize the shared SVG sanitizer allowlist.
 *
 * @return {{allowedTags: Set<string>, allowedAttributesByTag: Map<string, Set<string>>}} Sanitizer allowlist policy.
 */
function getSvgAllowlistPolicy() {
  const allowlistJson = fs.readFileSync(SVG_ALLOWLIST_FILE, 'utf8');
  const allowlist = JSON.parse(allowlistJson);
  const globalAttributes = Array.isArray(allowlist.globalAttributes)
    ? allowlist.globalAttributes
    : [];
  const allowedTagsObject = allowlist.allowedTags || {};
  const allowedTagNames = Object.keys(allowedTagsObject).map((tagName) =>
    String(tagName).toLowerCase(),
  );
  const allowedAttributesByTag = new Map();

  for (const tagName of allowedTagNames) {
    const tagAttributes = Array.isArray(allowedTagsObject[tagName])
      ? allowedTagsObject[tagName]
      : [];
    const mergedAttributes = [...globalAttributes, ...tagAttributes].map(
      (attributeName) => String(attributeName).toLowerCase(),
    );

    allowedAttributesByTag.set(tagName, new Set(mergedAttributes));
  }

  if (0 === allowedTagNames.length) {
    throw new Error('SVG sanitizer allowlist is empty.');
  }

  return {
    allowedTags: new Set(allowedTagNames),
    allowedAttributesByTag,
  };
}

/**
 * Validate SVG markup against the shared allowlist policy.
 *
 * @param {string} svgMarkup SVG markup after pre-sanitization.
 * @param {Object} policy    Shared allowlist policy.
 */
function validateSvgAgainstAllowlist(svgMarkup, policy) {
  if (!/<svg\b/i.test(svgMarkup) || !/<\/svg>/i.test(svgMarkup)) {
    throw new Error('Invalid SVG: missing <svg> root element.');
  }

  const tagPattern = /<\s*\/?\s*([A-Za-z][A-Za-z0-9:-]*)\b([^>]*)>/g;
  const attributePattern =
    /([:@A-Za-z_][:@A-Za-z0-9_.-]*)\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+)/g;

  for (const tagMatch of svgMarkup.matchAll(tagPattern)) {
    const rawTag = tagMatch[0];
    const rawTagName = tagMatch[1] || '';
    const tagName = rawTagName.toLowerCase();

    if (!policy.allowedTags.has(tagName)) {
      throw new Error(`Disallowed SVG tag <${rawTagName}>.`);
    }

    if (/^<\s*\//.test(rawTag)) {
      continue;
    }

    const tagAttributes = policy.allowedAttributesByTag.get(tagName);

    if (!tagAttributes) {
      throw new Error(`Missing attribute policy for SVG tag <${rawTagName}>.`);
    }

    const attributeSource = tagMatch[2] || '';

    for (const attributeMatch of attributeSource.matchAll(attributePattern)) {
      const rawAttributeName = attributeMatch[1] || '';
      const attributeName = rawAttributeName.toLowerCase();
      const rawAttributeValue = (attributeMatch[2] || '').trim();
      const normalizedValue = rawAttributeValue.replace(/^['"]|['"]$/g, '');

      if (attributeName.startsWith('on')) {
        throw new Error(
          `Disallowed event attribute "${rawAttributeName}" on <${rawTagName}>.`,
        );
      }

      if (!tagAttributes.has(attributeName)) {
        throw new Error(
          `Disallowed attribute "${rawAttributeName}" on <${rawTagName}>.`,
        );
      }

      if (
        (attributeName === 'href' || attributeName === 'xlink:href') &&
        /^\s*javascript:/i.test(normalizedValue)
      ) {
        throw new Error(
          `Disallowed JavaScript URL in attribute "${rawAttributeName}".`,
        );
      }
    }
  }
}

/**
 * Build a prominent malformed SVG warning message for terminal output.
 *
 * @param {string} fileName     SVG file name.
 * @param {string} errorMessage Parse error message.
 * @return {string} Styled warning message ending with a newline.
 */
function formatMalformedSvgWarning(fileName, errorMessage) {
  const warningPrefix = '[icons:generate] WARNING';
  const warningMessage = `${warningPrefix} Skipping malformed SVG "${fileName}": ${errorMessage}`;

  if (!process.stderr.isTTY) {
    return `${warningMessage}\n`;
  }

  return `${TERMINAL_STYLE.bold}${TERMINAL_STYLE.yellow}${warningMessage}${TERMINAL_STYLE.reset}\n`;
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
 * Format a value as a single-quoted PHP string literal.
 *
 * @param {string} value Input string.
 * @return {string} PHP string literal.
 */
function formatPhpStringLiteral(value) {
  const normalizedValue = value.replace(/\r?\n\s*/g, '');
  return `'${escapePhpSingleQuotedString(normalizedValue)}'`;
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
      return `\t\t${padPhpArrayKey(iconDefinition.slug, maxIconSlugLength)} => ${formatPhpStringLiteral(iconDefinition.svgMarkup)},`;
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

  const svgAllowlistPolicy = getSvgAllowlistPolicy();
  const iconDefinitions = [];

  for (const fileName of svgFiles) {
    const iconSlug = path.basename(fileName, '.svg');
    const filePath = path.join(SVG_DIR, fileName);

    try {
      const svgText = fs.readFileSync(filePath, 'utf8');
      const svgMarkup = sanitizeSvgText(svgText);
      validateSvgAgainstAllowlist(svgMarkup, svgAllowlistPolicy);
      const innerMarkup = extractInnerSvgMarkup(svgMarkup);
      const jsxMarkup = normalizeSvgMarkupForJsx(innerMarkup);
      const viewBox =
        extractSvgRootAttribute(svgMarkup, 'viewBox') || '0 0 16 16';

      iconDefinitions.push({
        slug: iconSlug,
        jsxMarkup,
        svgMarkup,
        viewBox,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      process.stderr.write(formatMalformedSvgWarning(fileName, errorMessage));
    }
  }

  if (0 === iconDefinitions.length) {
    throw new Error('No valid SVG icons found in src/components/icons/svg.');
  }

  return iconDefinitions;
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
  try {
    main();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[icons:generate] ERROR ${errorMessage}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  buildIconComponentFile,
  buildPhpIconRegistryFile,
  collectSvgIconDefinitions,
  extractInnerSvgMarkup,
  extractSvgRootAttribute,
  getSvgAllowlistPolicy,
  normalizeSvgMarkupForJsx,
  sanitizeSvgText,
  validateSvgAgainstAllowlist,
};
