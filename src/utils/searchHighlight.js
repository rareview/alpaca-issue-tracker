/**
 * Escape a string for safe use in a RegExp.
 *
 * @param {string} value Raw value.
 * @return {string} Escaped value.
 */
export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Highlight color is controlled via CSS variable `--alpaca-search-highlight`.
// JS no longer injects inline colors; styling is handled in SCSS.

/**
 * Normalize a query string into unique tokens used for highlighting.
 *
 * @param {string} query Active search query.
 * @return {Array<string>} Normalized query tokens.
 */
export function getSearchQueryTokens(query) {
  const normalizedQuery =
    typeof query === 'string' ? query.trim().toLowerCase() : '';

  if (!normalizedQuery) {
    return [];
  }

  return Array.from(
    new Set(
      normalizedQuery
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 1),
    ),
  );
}

/**
 * Split text into ordered parts and mark whether each part matches the query.
 *
 * @param {string} text  Source text.
 * @param {string} query Active search query.
 * @return {Array<Object>} Array of text parts with match metadata.
 */
export function splitTextForHighlight(text, query) {
  const normalizedText = typeof text === 'string' ? text : String(text || '');
  const queryTokens = getSearchQueryTokens(query);

  if (!normalizedText || queryTokens.length < 1) {
    return [
      {
        text: normalizedText,
        isMatch: false,
      },
    ];
  }

  const matcher = new RegExp(
    `(${queryTokens.map((token) => escapeRegExp(token)).join('|')})`,
    'ig',
  );

  return normalizedText
    .split(matcher)
    .filter(Boolean)
    .map((part) => ({
      text: part,
      isMatch: queryTokens.some((token) =>
        part.toLowerCase().includes(token.toLowerCase()),
      ),
    }));
}

/**
 * Apply inline highlighting to text nodes within rendered HTML.
 *
 * @param {string} htmlString Rendered HTML.
 * @param {string} query      Active search query.
 * @param {string} className  CSS class applied to wrapped matches.
 * @return {string} HTML with matched text wrapped in a mark element.
 */
export function highlightHtmlContent(
  htmlString,
  query,
  className = 'alpaca-inline-search-highlight',
) {
  const content = typeof htmlString === 'string' ? htmlString : '';
  const queryTokens = getSearchQueryTokens(query);

  if (
    !content ||
    queryTokens.length < 1 ||
    typeof DOMParser === 'undefined' ||
    typeof NodeFilter === 'undefined'
  ) {
    return content;
  }

  // color is provided via CSS variable; JS no longer injects inline styles

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const matcher = new RegExp(
      `(${queryTokens.map((token) => escapeRegExp(token)).join('|')})`,
      'ig',
    );

    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((textNode) => {
      const sourceText = textNode.nodeValue || '';
      const parentTag = textNode.parentElement
        ? textNode.parentElement.tagName.toLowerCase()
        : '';

      if (!sourceText.trim()) {
        return;
      }

      // Skip tags where inline mark wrapping is undesirable.
      if (['code', 'pre', 'style', 'script', 'svg'].includes(parentTag)) {
        return;
      }

      if (!matcher.test(sourceText)) {
        matcher.lastIndex = 0;
        return;
      }

      matcher.lastIndex = 0;
      const fragment = doc.createDocumentFragment();
      const parts = sourceText.split(matcher);

      parts.forEach((part) => {
        if (!part) {
          return;
        }

        const isMatch = queryTokens.some((token) =>
          part.toLowerCase().includes(token.toLowerCase()),
        );

        if (!isMatch) {
          fragment.appendChild(doc.createTextNode(part));
          return;
        }

        const mark = doc.createElement('mark');
        mark.className = className;
        mark.textContent = part;
        fragment.appendChild(mark);
      });

      textNode.parentNode.replaceChild(fragment, textNode);
    });

    return doc.body.innerHTML;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to highlight HTML content', error);
    return content;
  }
}
