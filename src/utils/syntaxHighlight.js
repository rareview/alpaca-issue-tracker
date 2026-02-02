/**
 * Syntax highlighting utilities for Alpaca data tabs.
 * Provides language detection and formatting for Prism.js integration.
 */

/**
 * Detect the language of a text string.
 *
 * @param {string} text - The text to analyze.
 * @return {string|false} Language identifier or false if no match.
 */
export function detectLanguage(text) {
  const t = text.trim();
  if (!t) return false;

  // URL detection (must be checked before JSON to catch URLs in data)
  if (
    t.match(/^https?:\/\//i) ||
    t.match(/^www\./i) ||
    t.match(/^[a-z0-9-]+\.[a-z]{2,}\//i)
  ) {
    return 'uri';
  }

  // JSON detection (starts with { or [)
  if (t.startsWith('{') || t.startsWith('[')) return 'json';

  // HTML detection (contains < and >)
  if (t.includes('<') && t.includes('>')) return 'html';

  // Key-value detection (contains = and ;)
  if (t.includes('=') && t.includes(';')) return 'keyvalue';

  return false;
}

/**
 * Format a value based on its detected language.
 *
 * @param {string} value    - The value to format.
 * @param {string} language - The detected language.
 * @return {string} Formatted value.
 */
export function formatValue(value, language) {
  if (!language) return value;

  if (language === 'keyvalue') {
    // Format key-value pairs: split by ;, trim, add newlines
    return value
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s + ';')
      .join('\n');
  }

  if (language === 'json') {
    try {
      const obj = JSON.parse(value);
      return JSON.stringify(obj, null, 2); // pretty-print JSON
    } catch (e) {
      return value; // fallback if JSON invalid
    }
  }

  return value;
}

/**
 * Normalize text content for highlighting.
 * Removes special characters and normalizes whitespace.
 *
 * @param {string} text - The text to normalize.
 * @return {string} Normalized text.
 */
export function normalizeText(text) {
  return (text || '')
    .replace(/\u00B6/g, '&') // Replace paragraph symbol with &
    .replace(/[\r\n\t]+/g, ' ') // Replace newlines/tabs with space
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Apply syntax highlighting to a DOM element.
 * Wraps content in <pre><code> with appropriate language class and highlights.
 *
 * @param {HTMLElement} element - The element to highlight (typically a <td>).
 * @param {string}      text    - Optional text content. If not provided, uses element's textContent.
 * @return {boolean} True if highlighting was applied, false otherwise.
 */
export function highlightElement(element, text = null) {
  // Ensure Prism is available
  if (typeof window === 'undefined' || !window.Prism) {
    // eslint-disable-next-line no-console
    console.warn('Prism.js is not loaded. Syntax highlighting skipped.');
    return false;
  }

  const originalText = text || element.textContent || '';
  const normalizedText = normalizeText(originalText);

  if (!normalizedText) {
    element.textContent = '';
    return false;
  }

  const language = detectLanguage(normalizedText);
  if (!language) {
    element.textContent = normalizedText;
    return false;
  }

  const formattedText = formatValue(normalizedText, language);

  // Create pre and code elements
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.className = `language-${language}`;
  code.textContent = formattedText;
  pre.appendChild(code);

  // Clear and replace content
  element.textContent = '';
  element.appendChild(pre);

  // Apply Prism highlighting
  try {
    window.Prism.highlightElement(code);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Prism highlighting error:', error);
    return false;
  }
}

/**
 * Apply syntax highlighting to all table cells in a container.
 * Useful for highlighting all <td> elements in a table after render.
 *
 * @param {HTMLElement|string} container - Container element or selector.
 * @return {number} Number of elements highlighted.
 */
export function highlightTableCells(container) {
  const containerEl =
    typeof container === 'string'
      ? document.querySelector(container)
      : container;

  if (!containerEl) return 0;

  const cells = containerEl.querySelectorAll('td');
  let highlighted = 0;

  cells.forEach((cell) => {
    // Skip if already highlighted (has pre > code structure)
    if (cell.querySelector('pre code[class*="language-"]')) {
      return;
    }

    // Skip if cell contains interactive elements (links, buttons, etc.)
    if (
      cell.querySelector('a, button, input, select, textarea') &&
      !cell.classList.contains('alpaca-highlight-allowed')
    ) {
      return;
    }

    if (highlightElement(cell)) {
      highlighted++;
    }
  });

  return highlighted;
}
