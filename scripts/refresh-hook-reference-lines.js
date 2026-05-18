#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const REFERENCE_DIR = path.join(ROOT_DIR, 'docs/reference');

const REFERENCE_FILE_CONFIGS = [
  {
    fileName: 'core-and-admin.md',
    expectedHeadingCount: 7,
    sourceType: 'php',
  },
  {
    fileName: 'daily-digest.md',
    expectedHeadingCount: 8,
    sourceType: 'php',
  },
  {
    fileName: 'notifications.md',
    expectedHeadingCount: 14,
    sourceType: 'php',
  },
  {
    fileName: 'private-comments.md',
    expectedHeadingCount: 2,
    sourceType: 'php',
  },
  {
    fileName: 'rest-api.md',
    expectedHeadingCount: 5,
    sourceType: 'php',
  },
  {
    fileName: 'javascript-filters.md',
    expectedHeadingCount: 26,
    sourceType: 'js-filter',
    customPatterns: {
      'window.alpaca.itemDatapoints.register()':
        /window\.alpaca\.itemDatapoints\.register\s*=/g,
      'window.alpaca.itemDatapoints.getRegistered()':
        /window\.alpaca\.itemDatapoints\.getRegistered\s*=/g,
      'window.alpaca.itemDatapoints.getVisibility()':
        /window\.alpaca\.itemDatapoints\.getVisibility\s*=/g,
      'window.alpaca.itemDatapoints.fetchVisibility()':
        /window\.alpaca\.itemDatapoints\.fetchVisibility\s*=/g,
      'window.alpaca.itemDatapoints.saveVisibility()':
        /window\.alpaca\.itemDatapoints\.saveVisibility\s*=/g,
    },
  },
  {
    fileName: 'javascript-actions.md',
    expectedHeadingCount: 35,
    sourceType: 'js-action',
  },
];

const PHP_DIRS = [path.join(ROOT_DIR, 'includes'), path.join(ROOT_DIR, 'lib')];
const JS_DIRS = [path.join(ROOT_DIR, 'src')];

const PHP_DYNAMIC_HOOK_PATTERNS = {
  'alpaca_rest_{$action_type}':
    /do_action\s*\(\s*'alpaca_rest_'\s*\.\s*\$action_type\b/g,
  'alpaca_rest_error_{$action_type}':
    /do_action\s*\(\s*'alpaca_rest_error_'\s*\.\s*\$action_type\b/g,
};

/**
 * Escape a string for use in a regular expression.
 *
 * @param {string} value Raw string.
 * @return {string} Escaped string.
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Walk a directory recursively and return matching files.
 *
 * @param {string}   dirPath    Absolute directory path.
 * @param {string[]} extensions File extensions to include.
 * @return {string[]} Matching file paths.
 */
function getFilesRecursive(dirPath, extensions) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const filePaths = [];

  entries.forEach((entry) => {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      filePaths.push(...getFilesRecursive(entryPath, extensions));
      return;
    }

    if (
      entry.isFile() &&
      extensions.some((extension) => entry.name.endsWith(extension))
    ) {
      filePaths.push(entryPath);
    }
  });

  return filePaths;
}

/**
 * Return the regex used to find a hook call.
 *
 * @param {string} hookName Hook name from the markdown heading.
 * @return {RegExp} Search regex.
 */
function getHookPattern(hookName) {
  if (PHP_DYNAMIC_HOOK_PATTERNS[hookName]) {
    return PHP_DYNAMIC_HOOK_PATTERNS[hookName];
  }

  const escapedHookName = escapeRegExp(hookName);

  return new RegExp(
    String.raw`(?:apply_filters|do_action)\s*\(\s*(['"])${escapedHookName}\1`,
    'g',
  );
}

/**
 * Convert an index in a file to a 1-based line number.
 *
 * @param {string} content File content.
 * @param {number} index   Character index.
 * @return {number} 1-based line number.
 */
function getLineNumber(content, index) {
  return content.slice(0, index).split('\n').length;
}

/**
 * Find the matching closing parenthesis for a function call.
 *
 * @param {string} content    File content.
 * @param {number} startIndex Character index of the function call.
 * @return {number} Character index of the closing parenthesis.
 */
function findCallEndIndex(content, startIndex) {
  const openingParenIndex = content.indexOf('(', startIndex);

  if (-1 === openingParenIndex) {
    throw new Error('Unable to find opening parenthesis for hook call.');
  }

  let depth = 0;
  let quote = '';

  for (let index = openingParenIndex; index < content.length; index += 1) {
    const character = content[index];

    if (quote) {
      if ('\\' === character) {
        index += 1;
        continue;
      }

      if (character === quote) {
        quote = '';
      }

      continue;
    }

    if ("'" === character || '"' === character) {
      quote = character;
      continue;
    }

    if ('(' === character) {
      depth += 1;
      continue;
    }

    if (')' === character) {
      depth -= 1;

      if (0 === depth) {
        return index;
      }
    }
  }

  throw new Error('Unable to find closing parenthesis for hook call.');
}

/**
 * Render a source reference string for a matched hook call.
 *
 * @param {string} filePath  Absolute source file path.
 * @param {number} startLine 1-based start line.
 * @param {number} endLine   1-based end line.
 * @return {string} Markdown-ready source reference.
 */
function formatSourceReference(filePath, startLine, endLine) {
  const relativePath = path
    .relative(ROOT_DIR, filePath)
    .split(path.sep)
    .join('/');

  if (startLine === endLine) {
    return `${relativePath}:${startLine}`;
  }

  return `${relativePath}:${startLine}-${endLine}`;
}

/**
 * Find all source references for a hook name.
 *
 * @param {string}   hookName Hook name from the markdown heading.
 * @param {string[]} phpFiles Absolute PHP file paths.
 * @return {string[]} Source references.
 */
function findHookSources(hookName, phpFiles) {
  const pattern = getHookPattern(hookName);
  const sources = [];

  phpFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');

    for (const match of content.matchAll(pattern)) {
      const startIndex = typeof match.index === 'number' ? match.index : -1;

      if (-1 === startIndex) {
        continue;
      }

      const endIndex = findCallEndIndex(content, startIndex);
      const startLine = getLineNumber(content, startIndex);
      const endLine = getLineNumber(content, endIndex);

      sources.push(formatSourceReference(filePath, startLine, endLine));
    }
  });

  if (0 === sources.length) {
    throw new Error(`No hook call found for ${hookName}.`);
  }

  return Array.from(new Set(sources));
}

/**
 * Mask JavaScript comments while preserving line numbers.
 *
 * @param {string} content Original JavaScript or JSX source.
 * @return {string} Source with comments replaced by spaces.
 */
function maskJsComments(content) {
  let masked = '';
  let index = 0;
  let state = 'normal';
  let quote = '';

  while (index < content.length) {
    const character = content[index];
    const nextCharacter = content[index + 1] || '';

    if ('normal' === state) {
      if ('/' === character && '/' === nextCharacter) {
        masked += '  ';
        index += 2;
        state = 'line-comment';
        continue;
      }

      if ('/' === character && '*' === nextCharacter) {
        masked += '  ';
        index += 2;
        state = 'block-comment';
        continue;
      }

      if ("'" === character || '"' === character || '`' === character) {
        quote = character;
        state = 'string';
      }

      masked += character;
      index += 1;
      continue;
    }

    if ('line-comment' === state) {
      masked += '\n' === character ? '\n' : ' ';
      index += 1;

      if ('\n' === character) {
        state = 'normal';
      }

      continue;
    }

    if ('block-comment' === state) {
      if ('*' === character && '/' === nextCharacter) {
        masked += '  ';
        index += 2;
        state = 'normal';
        continue;
      }

      masked += '\n' === character ? '\n' : ' ';
      index += 1;
      continue;
    }

    masked += character;

    if ('\\' === character) {
      masked += nextCharacter;
      index += 2;
      continue;
    }

    index += 1;

    if (character === quote) {
      state = 'normal';
      quote = '';
    }
  }

  return masked;
}

/**
 * Build a map of JavaScript constants to string values.
 *
 * @param {string} maskedContent Source with comments masked out.
 * @return {Map<string, string>} Constant names to string values.
 */
function getJsConstantMap(maskedContent) {
  const constantMap = new Map();
  const constantPattern =
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(['"])(.*?)\2\s*;/gs;

  for (const match of maskedContent.matchAll(constantPattern)) {
    constantMap.set(match[1], match[3]);
  }

  return constantMap;
}

/**
 * Read the first function argument token for a JavaScript hook call.
 *
 * @param {string} maskedContent     Source with comments masked out.
 * @param {number} openingParenIndex Character index of the opening parenthesis.
 * @return {{type:string,value:string}|null} Parsed token, or null when unsupported.
 */
function getFirstArgumentToken(maskedContent, openingParenIndex) {
  let index = openingParenIndex + 1;

  while (index < maskedContent.length && /\s/u.test(maskedContent[index])) {
    index += 1;
  }

  const startCharacter = maskedContent[index];

  if ("'" === startCharacter || '"' === startCharacter) {
    let value = '';

    for (index += 1; index < maskedContent.length; index += 1) {
      const character = maskedContent[index];

      if ('\\' === character) {
        value += character + (maskedContent[index + 1] || '');
        index += 1;
        continue;
      }

      if (character === startCharacter) {
        return {
          type: 'string',
          value,
        };
      }

      value += character;
    }

    return null;
  }

  if (/[A-Za-z_$]/u.test(startCharacter)) {
    let value = startCharacter;

    for (index += 1; index < maskedContent.length; index += 1) {
      const character = maskedContent[index];

      if (!/[\w$]/u.test(character)) {
        break;
      }

      value += character;
    }

    return {
      type: 'identifier',
      value,
    };
  }

  return null;
}

/**
 * Add a source reference to an index map.
 *
 * @param {Map<string, Set<string>>} indexMap  Hook source index.
 * @param {string}                   entryName Entry name.
 * @param {string}                   source    Source reference.
 * @return {void}
 */
function addSourceToIndex(indexMap, entryName, source) {
  if (!indexMap.has(entryName)) {
    indexMap.set(entryName, new Set());
  }

  indexMap.get(entryName).add(source);
}

/**
 * Build a JavaScript hook index for the requested call methods.
 *
 * @param {string[]} jsFiles        Absolute JavaScript and JSX file paths.
 * @param {string[]} allowedMethods Hook API method names to collect.
 * @return {Map<string, Set<string>>} Hook names to source references.
 */
function buildJsHookIndex(jsFiles, allowedMethods) {
  const hookIndex = new Map();
  const methodPattern = new RegExp(
    String.raw`(?:wp\.hooks\.)?(${allowedMethods.join('|')})\s*\(`,
    'g',
  );

  jsFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const maskedContent = maskJsComments(content);
    const constantMap = getJsConstantMap(maskedContent);

    for (const match of maskedContent.matchAll(methodPattern)) {
      const startIndex = typeof match.index === 'number' ? match.index : -1;

      if (-1 === startIndex) {
        continue;
      }

      const openingParenIndex = startIndex + match[0].length - 1;
      const token = getFirstArgumentToken(maskedContent, openingParenIndex);

      if (!token) {
        continue;
      }

      let hookName = '';

      if ('string' === token.type) {
        hookName = token.value;
      }

      if ('identifier' === token.type && constantMap.has(token.value)) {
        hookName = constantMap.get(token.value);
      }

      if (!hookName) {
        continue;
      }

      const endIndex = findCallEndIndex(content, startIndex);
      const startLine = getLineNumber(content, startIndex);
      const endLine = getLineNumber(content, endIndex);
      const source = formatSourceReference(filePath, startLine, endLine);

      addSourceToIndex(hookIndex, hookName, source);
    }
  });

  return hookIndex;
}

/**
 * Find source references for a custom JavaScript entry pattern.
 *
 * @param {string}                 entryName      Entry name from the markdown heading.
 * @param {string[]}               jsFiles        Absolute JavaScript and JSX file paths.
 * @param {Object<string, RegExp>} customPatterns Entry-specific search patterns.
 * @return {string[]|null} Source references, or null when no custom pattern exists.
 */
function findCustomJsSources(entryName, jsFiles, customPatterns = {}) {
  if (!customPatterns[entryName]) {
    return null;
  }

  const pattern = customPatterns[entryName];
  const sources = [];

  jsFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const maskedContent = maskJsComments(content);

    for (const match of maskedContent.matchAll(pattern)) {
      const startIndex = typeof match.index === 'number' ? match.index : -1;

      if (-1 === startIndex) {
        continue;
      }

      const startLine = getLineNumber(content, startIndex);
      sources.push(formatSourceReference(filePath, startLine, startLine));
    }
  });

  return Array.from(new Set(sources));
}

/**
 * Find all source references for a JavaScript hook or browser API entry.
 *
 * @param {string}                   entryName      Entry name from the markdown heading.
 * @param {Map<string, Set<string>>} hookIndex      Hook names to source references.
 * @param {string[]}                 jsFiles        Absolute JavaScript and JSX file paths.
 * @param {Object<string, RegExp>}   customPatterns Entry-specific search patterns.
 * @return {string[]} Source references.
 */
function findJsSources(entryName, hookIndex, jsFiles, customPatterns = {}) {
  const customSources = findCustomJsSources(entryName, jsFiles, customPatterns);

  if (customSources && customSources.length > 0) {
    return customSources;
  }

  if (!hookIndex.has(entryName)) {
    throw new Error(`No hook call found for ${entryName}.`);
  }

  return Array.from(hookIndex.get(entryName));
}

/**
 * Render the markdown source block for a hook section.
 *
 * @param {string[]} sources Source references.
 * @return {string} Markdown block.
 */
function renderSourceBlock(sources) {
  if (1 === sources.length) {
    return `**Source:** \`${sources[0]}\`.`;
  }

  const list = sources.map((source) => `- \`${source}\``).join('\n');

  return `**Sources**\n\n${list}`;
}

/**
 * Replace the source block inside a hook section.
 *
 * @param {string} sectionContent Hook section markdown.
 * @param {string} sourceBlock    Replacement source block.
 * @return {string|null} Updated hook section markdown, or null when no source block exists.
 */
function replaceSourceBlock(sectionContent, sourceBlock) {
  const lines = sectionContent.split('\n');
  const startIndex = lines.findIndex(
    (line) => line.startsWith('**Source:**') || line.startsWith('**Sources**'),
  );

  if (-1 === startIndex) {
    return null;
  }

  let contentStartIndex = startIndex + 1;

  if (lines[startIndex].startsWith('**Sources**')) {
    let index = startIndex + 1;

    while (
      index < lines.length &&
      ('' === lines[index] || lines[index].startsWith('- '))
    ) {
      index += 1;
    }

    contentStartIndex = index;
  }

  const trailingBlankLines = [];

  while (contentStartIndex < lines.length && '' === lines[contentStartIndex]) {
    trailingBlankLines.push('');
    contentStartIndex += 1;
  }

  let separatorLines = trailingBlankLines;

  if (0 === separatorLines.length && contentStartIndex < lines.length) {
    separatorLines = [''];
  }

  return [
    ...lines.slice(0, startIndex),
    ...sourceBlock.split('\n'),
    ...separatorLines,
    ...lines.slice(contentStartIndex),
  ].join('\n');
}

/**
 * Update all hook source references in one markdown file.
 *
 * @param {Object} fileConfig Reference file configuration.
 * @param {Object} context    Shared source indexing context.
 * @return {boolean} True when the file changed.
 */
function updateReferenceFile(fileConfig, context) {
  const filePath = path.join(REFERENCE_DIR, fileConfig.fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  const headingPattern = /^### `(.+)`$/gm;
  const matches = Array.from(content.matchAll(headingPattern));

  if (
    'number' === typeof fileConfig.expectedHeadingCount &&
    matches.length !== fileConfig.expectedHeadingCount
  ) {
    throw new Error(
      `Expected ${fileConfig.expectedHeadingCount} entries in docs/reference/${fileConfig.fileName}, found ${matches.length}.`,
    );
  }

  if (0 === matches.length) {
    return false;
  }

  const hadTrailingNewline = content.endsWith('\n');
  let updatedContent = '';
  let lastIndex = 0;

  matches.forEach((match, index) => {
    const sectionStart = match.index;
    const sectionEnd =
      index + 1 < matches.length ? matches[index + 1].index : content.length;
    updatedContent += content.slice(lastIndex, sectionStart);

    const sectionContent = content.slice(sectionStart, sectionEnd);
    const hookName = match[1];
    let sources = [];

    if ('php' === fileConfig.sourceType) {
      sources = findHookSources(hookName, context.phpFiles);
    }

    if ('js-filter' === fileConfig.sourceType) {
      sources = findJsSources(
        hookName,
        context.jsFilterIndex,
        context.jsFiles,
        fileConfig.customPatterns,
      );
    }

    if ('js-action' === fileConfig.sourceType) {
      sources = findJsSources(
        hookName,
        context.jsActionIndex,
        context.jsFiles,
        fileConfig.customPatterns,
      );
    }

    const sourceBlock = renderSourceBlock(sources);
    const updatedSectionContent = replaceSourceBlock(
      sectionContent,
      sourceBlock,
    );

    if (null === updatedSectionContent) {
      throw new Error(
        `Could not find a source block to replace in docs/reference/${fileConfig.fileName} for ${hookName}.`,
      );
    }

    updatedContent += updatedSectionContent;

    if (index + 1 < matches.length && !updatedSectionContent.endsWith('\n\n')) {
      updatedContent += '\n\n';
    }

    lastIndex = sectionEnd;
  });

  updatedContent += content.slice(lastIndex);

  if (hadTrailingNewline && !updatedContent.endsWith('\n')) {
    updatedContent += '\n';
  }

  if (updatedContent === content) {
    return false;
  }

  fs.writeFileSync(filePath, updatedContent);
  return true;
}

/**
 * Main execution entry point.
 */
function main() {
  const phpFiles = PHP_DIRS.flatMap((dirPath) =>
    getFilesRecursive(dirPath, ['.php']),
  ).sort();
  const jsFiles = JS_DIRS.flatMap((dirPath) =>
    getFilesRecursive(dirPath, ['.js', '.jsx']),
  ).sort();
  const changedFiles = [];
  const context = {
    phpFiles,
    jsFiles,
    jsFilterIndex: buildJsHookIndex(jsFiles, ['applyFilters', 'addFilter']),
    jsActionIndex: buildJsHookIndex(jsFiles, ['doAction']),
  };

  REFERENCE_FILE_CONFIGS.forEach((fileConfig) => {
    if (updateReferenceFile(fileConfig, context)) {
      changedFiles.push(`docs/reference/${fileConfig.fileName}`);
    }
  });

  if (0 === changedFiles.length) {
    process.stdout.write('Hook source references are already up to date.\n');
    return;
  }

  process.stdout.write('Updated hook source references in:\n');
  changedFiles.forEach((filePath) => {
    process.stdout.write(`- ${filePath}\n`);
  });
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
