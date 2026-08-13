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
 * Remove matching Markdown markers from selected text before wrapping it.
 *
 * @param {string} selectedText Selected text.
 * @param {Object} shortcut     Markdown prefix and suffix.
 * @return {string} Text without existing markers for this shortcut.
 */
export const removeMarkdownFormatting = (selectedText, shortcut) => {
  const marker = shortcut.prefix;

  if (marker === '*') {
    let normalizedText = '';

    for (let index = 0; index < selectedText.length; index += 1) {
      if (selectedText[index] !== '*') {
        normalizedText += selectedText[index];
        continue;
      }

      let markerEnd = index;

      while (selectedText[markerEnd] === '*') {
        markerEnd += 1;
      }

      const markerLength = markerEnd - index;
      normalizedText += '*'.repeat(markerLength - (markerLength % 2));
      index = markerEnd - 1;
    }

    return normalizedText;
  }

  return selectedText.split(marker).join('');
};

/**
 * Wrap a selected range after removing existing matching Markdown markers.
 *
 * @param {string} value          Current text value.
 * @param {number} selectionStart Selection start offset.
 * @param {number} selectionEnd   Selection end offset.
 * @param {Object} shortcut       Markdown prefix and suffix.
 * @return {Object} Replacement text and resulting caret position.
 */
export const formatMarkdownSelection = (
  value,
  selectionStart,
  selectionEnd,
  shortcut,
) => {
  const currentValue = typeof value === 'string' ? value : '';
  const marker = shortcut.prefix;
  const hasEnclosingFormatting =
    selectionStart >= marker.length &&
    currentValue.slice(selectionStart - marker.length, selectionStart) ===
      marker &&
    currentValue.slice(selectionEnd, selectionEnd + marker.length) === marker;
  const replacementStart = hasEnclosingFormatting
    ? selectionStart - marker.length
    : selectionStart;
  const replacementEnd = hasEnclosingFormatting
    ? selectionEnd + marker.length
    : selectionEnd;
  const selectedText = currentValue.slice(replacementStart, replacementEnd);
  const normalizedText = removeMarkdownFormatting(selectedText, shortcut);
  const replacement = hasEnclosingFormatting
    ? normalizedText
    : `${shortcut.prefix}${normalizedText}${shortcut.suffix}`;

  return {
    replacement,
    nextValue: `${currentValue.slice(0, replacementStart)}${replacement}${currentValue.slice(replacementEnd)}`,
    nextCaretPosition: replacementStart + replacement.length,
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
  const undoStack = wp.element.useRef([]);

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

      const textarea = textareaRef.current;

      if (event.key?.toLowerCase() === 'z' && textarea) {
        const lastChange = undoStack.current[undoStack.current.length - 1];

        if (lastChange?.nextValue === value) {
          event.preventDefault();
          undoStack.current.pop();
          replaceSelection({
            nextValue: lastChange.previousValue,
            nextCaretPosition: lastChange.previousSelectionEnd,
          });

          globalThis.requestAnimationFrame(() => {
            if (!textareaRef.current) {
              return;
            }

            textareaRef.current.selectionStart =
              lastChange.previousSelectionStart;
            textareaRef.current.selectionEnd = lastChange.previousSelectionEnd;
          });
        }

        return false;
      }

      const shortcut = shortcuts[event.key?.toLowerCase()];

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
      const nextValue = formatMarkdownSelection(
        value,
        selectionStart,
        selectionEnd,
        shortcut,
      );
      undoStack.current.push({
        nextValue: nextValue.nextValue,
        previousValue: value,
        previousSelectionStart: selectionStart,
        previousSelectionEnd: selectionEnd,
      });
      replaceSelection(nextValue);

      return true;
    },
    [replaceSelection, shortcuts, textareaRef, undoStack, value],
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
