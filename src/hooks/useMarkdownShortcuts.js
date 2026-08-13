const { useCallback } = wp.element;

export const DEFAULT_MARKDOWN_SHORTCUTS = {
  b: { prefix: '**', suffix: '**' },
  i: { prefix: '*', suffix: '*' },
};

/**
 * Check whether a value is an absolute HTTP(S) URL.
 *
 * @param {string} value URL candidate.
 * @return {boolean} Whether the value is an HTTP(S) URL.
 */
export const isHttpUrl = (value) => {
  try {
    const url = new globalThis.URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

/**
 * Wrap a selected range with Markdown syntax.
 *
 * @param {string} value          Current text value.
 * @param {number} selectionStart Selection start offset.
 * @param {number} selectionEnd   Selection end offset.
 * @param {Object} shortcut       Markdown prefix and suffix.
 * @return {Object} Replacement text and resulting caret position.
 */
export const wrapMarkdownSelection = (
  value,
  selectionStart,
  selectionEnd,
  shortcut,
) => {
  const currentValue = typeof value === 'string' ? value : '';
  const selectedText = currentValue.slice(selectionStart, selectionEnd);
  const replacement = `${shortcut.prefix}${selectedText}${shortcut.suffix}`;

  return {
    replacement,
    nextValue: `${currentValue.slice(0, selectionStart)}${replacement}${currentValue.slice(selectionEnd)}`,
    nextCaretPosition: selectionStart + replacement.length,
  };
};

/**
 * Turn selected text and a URL into Markdown link syntax.
 *
 * @param {string} value          Current text value.
 * @param {number} selectionStart Selection start offset.
 * @param {number} selectionEnd   Selection end offset.
 * @param {string} url            Link URL.
 * @return {Object} Replacement text and resulting caret position.
 */
export const linkMarkdownSelection = (
  value,
  selectionStart,
  selectionEnd,
  url,
) => {
  const currentValue = typeof value === 'string' ? value : '';
  const selectedText = currentValue.slice(selectionStart, selectionEnd);
  const replacement = `[${selectedText}](${url})`;

  return {
    replacement,
    nextValue: `${currentValue.slice(0, selectionStart)}${replacement}${currentValue.slice(selectionEnd)}`,
    nextCaretPosition: selectionStart + replacement.length,
  };
};

/**
 * Add Markdown keyboard shortcuts and selection-aware URL paste handling.
 *
 * @param {Object}   textareaRef Ref pointing to the textarea element.
 * @param {string}   value       Current textarea value.
 * @param {Function} onChange    Change handler for the textarea value.
 * @param {Object}   options     Optional shortcut configuration.
 * @return {Object} Markdown event handlers.
 */
const useMarkdownShortcuts = (textareaRef, value, onChange, options = {}) => {
  const shortcuts = options.shortcuts || DEFAULT_MARKDOWN_SHORTCUTS;
  const isUrl = options.isUrl || isHttpUrl;

  const replaceSelection = useCallback(
    ({ nextValue, nextCaretPosition }) => {
      onChange(nextValue);

      globalThis.requestAnimationFrame(() => {
        if (!textareaRef.current) {
          return;
        }

        textareaRef.current.focus();
        textareaRef.current.selectionStart = nextCaretPosition;
        textareaRef.current.selectionEnd = nextCaretPosition;
      });
    },
    [onChange, textareaRef],
  );

  const handleMarkdownShortcut = useCallback(
    (event) => {
      if (!event.metaKey && !event.ctrlKey) {
        return false;
      }

      const shortcut = shortcuts[event.key?.toLowerCase()];
      const textarea = textareaRef.current;

      if (
        !shortcut ||
        !textarea ||
        textarea.selectionStart === textarea.selectionEnd
      ) {
        return false;
      }

      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;

      event.preventDefault();
      replaceSelection(
        wrapMarkdownSelection(value, selectionStart, selectionEnd, shortcut),
      );

      return true;
    },
    [replaceSelection, shortcuts, textareaRef, value],
  );

  const handlePaste = useCallback(
    (event) => {
      const textarea = textareaRef.current;
      const pastedUrl = event.clipboardData?.getData('text/plain')?.trim();

      if (
        !textarea ||
        textarea.selectionStart === textarea.selectionEnd ||
        !pastedUrl ||
        !isUrl(pastedUrl)
      ) {
        return;
      }

      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      event.preventDefault();
      replaceSelection(
        linkMarkdownSelection(value, selectionStart, selectionEnd, pastedUrl),
      );
    },
    [isUrl, replaceSelection, textareaRef, value],
  );

  return { handleMarkdownShortcut, handlePaste };
};

export default useMarkdownShortcuts;
