import PropTypes from 'prop-types';
import useMarkdownShortcuts from '../hooks/useMarkdownShortcuts';

const { useCallback, useEffect, useRef, useState } = wp.element;
const { Button, Popover, TextControl } = wp.components;
const { __ } = wp.i18n;

const createMarkdownPattern = () =>
  /\[([^\]\n]+)\]\((https?:\/\/[^)\s]+|(?![A-Za-z][A-Za-z0-9+.-]*:)[^)\s]+)\)|`([^`\n]+)`|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const renderTextWithCaret = (
  value,
  caretOffset = null,
  selectionStart = null,
  selectionEnd = null,
) => {
  const text = String(value || '');
  let html = '';

  for (let index = 0; index <= text.length; index += 1) {
    if (index === selectionStart) {
      html += '<span class="alpaca-markdown-selection">';
    }

    if (index === caretOffset) {
      html += '<span class="alpaca-markdown-caret" aria-hidden="true"></span>';
    }

    if (index === selectionEnd && selectionEnd > selectionStart) {
      html += '</span>';
    }

    if (index < text.length) {
      const isParagraphBreak = text[index] === '\n' && text[index - 1] === '\n';
      html += isParagraphBreak
        ? '<span class="alpaca-markdown-paragraph-break">\n</span>'
        : escapeHtml(text[index]);
    }
  }

  return html;
};

const getSourceOffset = (value, previewOffset) => {
  const text = String(value || '');
  const markdownPattern = createMarkdownPattern();
  let sourcePosition = 0;
  let renderedPosition = 0;
  let match;

  while ((match = markdownPattern.exec(text)) !== null) {
    const plainLength = match.index - sourcePosition;
    if (previewOffset < renderedPosition + plainLength) {
      return sourcePosition + previewOffset - renderedPosition;
    }

    renderedPosition += plainLength;
    let markerLength = 1;
    if (match[4]) {
      markerLength = 2;
    }
    const content = match[1] || match[3] || match[4] || match[5];
    const contentLength = content.length;
    if (previewOffset <= renderedPosition) {
      return match.index + markerLength;
    }
    if (previewOffset < renderedPosition + contentLength) {
      return match.index + markerLength + previewOffset - renderedPosition;
    }
    if (previewOffset === renderedPosition + contentLength) {
      return match.index + markerLength + contentLength;
    }

    renderedPosition += contentLength;
    sourcePosition = markdownPattern.lastIndex;
  }

  return sourcePosition + previewOffset - renderedPosition;
};

const getRenderedOffset = (value, sourceOffset) => {
  const text = String(value || '');
  const markdownPattern = createMarkdownPattern();
  let sourcePosition = 0;
  let renderedPosition = 0;
  let match;

  while ((match = markdownPattern.exec(text)) !== null) {
    const plainLength = match.index - sourcePosition;
    if (sourceOffset <= match.index) {
      return renderedPosition + sourceOffset - sourcePosition;
    }

    renderedPosition += plainLength;
    let markerLength = 1;
    if (match[4]) {
      markerLength = 2;
    }
    const content = match[1] || match[3] || match[4] || match[5];
    const contentStart = match.index + markerLength;
    const contentEnd = contentStart + content.length;

    if (sourceOffset <= contentStart) {
      return renderedPosition;
    }
    if (sourceOffset <= contentEnd) {
      return renderedPosition + sourceOffset - contentStart;
    }
    if (sourceOffset <= markdownPattern.lastIndex) {
      return renderedPosition + content.length;
    }

    renderedPosition += content.length;
    sourcePosition = markdownPattern.lastIndex;
  }

  return renderedPosition + sourceOffset - sourcePosition;
};

const getVisibleWordBoundary = (value, sourceOffset, direction) => {
  const visibleText = String(value || '').replace(
    createMarkdownPattern(),
    (match, link, url, code, bold, italic) => link || code || bold || italic,
  );
  let visibleOffset = getRenderedOffset(value, sourceOffset);

  if (direction === 'left') {
    while (visibleOffset > 0 && /\s/.test(visibleText[visibleOffset - 1])) {
      visibleOffset -= 1;
    }
    while (visibleOffset > 0 && !/\s/.test(visibleText[visibleOffset - 1])) {
      visibleOffset -= 1;
    }
  } else {
    while (
      visibleOffset < visibleText.length &&
      /\s/.test(visibleText[visibleOffset])
    ) {
      visibleOffset += 1;
    }
    while (
      visibleOffset < visibleText.length &&
      !/\s/.test(visibleText[visibleOffset])
    ) {
      visibleOffset += 1;
    }
  }

  return getSourceOffset(value, visibleOffset);
};

const getVisibleWordSelection = (value, sourceOffset) => {
  const visibleText = String(value || '').replace(
    createMarkdownPattern(),
    (match, link, url, code, bold, italic) => link || code || bold || italic,
  );
  let visibleOffset = getRenderedOffset(value, sourceOffset);

  if (
    visibleOffset >= visibleText.length ||
    /\s/.test(visibleText[visibleOffset])
  ) {
    visibleOffset -= 1;
  }

  if (visibleOffset < 0 || /\s/.test(visibleText[visibleOffset])) {
    return null;
  }

  let selectionStart = visibleOffset;
  let selectionEnd = visibleOffset + 1;

  while (selectionStart > 0 && !/\s/.test(visibleText[selectionStart - 1])) {
    selectionStart -= 1;
  }
  while (
    selectionEnd < visibleText.length &&
    !/\s/.test(visibleText[selectionEnd])
  ) {
    selectionEnd += 1;
  }

  return {
    start: getSourceOffset(value, selectionStart),
    end: getSourceOffset(value, selectionEnd),
  };
};

const getPreviewOffsetAtPoint = (element, clientX, clientY) => {
  const documentObject = element.ownerDocument;
  const range = documentObject.caretRangeFromPoint?.(clientX, clientY);
  if (!range) {
    return null;
  }

  const prefixRange = documentObject.createRange();
  prefixRange.selectNodeContents(element);
  prefixRange.setEnd(range.startContainer, range.startOffset);
  return prefixRange.toString().length;
};

const getFormattedWordSelection = (value, caretPosition) => {
  const text = String(value || '');
  const markdownPattern = createMarkdownPattern();
  let match;

  while ((match = markdownPattern.exec(text)) !== null) {
    let markerLength = 1;
    if (match[4]) {
      markerLength = 2;
    }
    const content = match[1] || match[3] || match[4] || match[5];
    const contentStart = match.index + markerLength;
    const contentEnd = contentStart + content.length;
    const matchEnd = markdownPattern.lastIndex;
    const textAfterMatch = text.slice(matchEnd, caretPosition);

    if (
      caretPosition >= contentEnd &&
      caretPosition <= matchEnd &&
      !textAfterMatch.length
    ) {
      return { start: contentStart, end: contentEnd };
    }

    if (
      caretPosition > matchEnd &&
      /^\s*$/.test(textAfterMatch) &&
      textAfterMatch.length <= 1
    ) {
      return { start: contentStart, end: contentEnd };
    }
  }

  return null;
};

const renderMarkdownPreview = (
  value,
  caretPosition = null,
  selectionStart = null,
  selectionEnd = null,
) => {
  const text = String(value || '');
  const markdownPattern = createMarkdownPattern();
  let html = '';
  let sourcePosition = 0;
  let match;

  while ((match = markdownPattern.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = markdownPattern.lastIndex;
    let markerLength = 1;
    let content = match[1] || match[3] || match[5];
    let tagName = 'em';

    if (match[1]) {
      tagName = 'a';
    } else if (match[3]) {
      tagName = 'code';
    }

    if (match[4]) {
      markerLength = 2;
      content = match[4];
      tagName = 'strong';
    }

    const contentStart = matchStart + markerLength;
    const contentEnd = contentStart + content.length;
    const plainText = text.slice(sourcePosition, matchStart);
    const isCaretInPlainText =
      caretPosition !== null &&
      caretPosition >= sourcePosition &&
      caretPosition <= matchStart;
    const plainCaretOffset = isCaretInPlainText
      ? caretPosition - sourcePosition
      : null;
    const plainSelectionStart =
      selectionStart !== null &&
      selectionEnd !== null &&
      selectionEnd > sourcePosition &&
      selectionStart < matchStart
        ? Math.max(selectionStart - sourcePosition, 0)
        : null;
    const plainSelectionEnd =
      selectionEnd !== null && selectionEnd > sourcePosition
        ? Math.min(selectionEnd - sourcePosition, plainText.length)
        : null;

    html += renderTextWithCaret(
      plainText,
      plainCaretOffset,
      plainSelectionStart,
      plainSelectionEnd,
    );

    let formattedContent = escapeHtml(content);
    if (
      caretPosition !== null &&
      caretPosition >= contentStart &&
      caretPosition <= contentEnd
    ) {
      formattedContent = renderTextWithCaret(
        content,
        caretPosition - contentStart,
        selectionStart !== null && selectionStart < contentEnd
          ? Math.max(selectionStart - contentStart, 0)
          : null,
        selectionEnd !== null && selectionEnd > contentStart
          ? Math.min(selectionEnd - contentStart, content.length)
          : null,
      );
    } else if (
      selectionStart !== null &&
      selectionStart < contentEnd &&
      selectionEnd !== null &&
      selectionEnd > contentStart
    ) {
      formattedContent = renderTextWithCaret(
        content,
        null,
        Math.max(selectionStart - contentStart, 0),
        Math.min(selectionEnd - contentStart, content.length),
      );
    }

    const caretBeforeFormattedText =
      caretPosition !== null &&
      caretPosition > matchStart &&
      caretPosition < contentStart;
    const caretAfterFormattedText =
      caretPosition !== null &&
      caretPosition > contentEnd &&
      caretPosition < matchEnd;

    html += caretBeforeFormattedText
      ? '<span class="alpaca-markdown-caret" aria-hidden="true"></span>'
      : '';
    const linkAttributes = match[1]
      ? ` class="alpaca-markdown-link" href="${escapeHtml(match[2])}" data-alpaca-markdown-link="true" data-markdown-link-start="${matchStart}" data-markdown-link-end="${matchEnd}"`
      : '';
    html += `<${tagName}${linkAttributes}>${formattedContent}</${tagName}>`;
    html += caretAfterFormattedText
      ? '<span class="alpaca-markdown-caret" aria-hidden="true"></span>'
      : '';
    sourcePosition = matchEnd;
  }

  const trailingText = text.slice(sourcePosition);
  const isCaretInTrailingText =
    caretPosition !== null &&
    caretPosition >= sourcePosition &&
    caretPosition <= text.length;
  const trailingCaretOffset = isCaretInTrailingText
    ? caretPosition - sourcePosition
    : null;
  const trailingSelectionStart =
    selectionStart !== null &&
    selectionEnd !== null &&
    selectionEnd > sourcePosition &&
    selectionStart < text.length
      ? Math.max(selectionStart - sourcePosition, 0)
      : null;
  const trailingSelectionEnd =
    selectionEnd !== null && selectionEnd > sourcePosition
      ? Math.min(selectionEnd - sourcePosition, trailingText.length)
      : null;

  return `${html}${renderTextWithCaret(
    trailingText,
    trailingCaretOffset,
    trailingSelectionStart,
    trailingSelectionEnd,
  )}`;
};

const MarkdownTextarea = ({
  children,
  value,
  textareaRef,
  onChange,
  disabled,
}) => {
  const wrapperRef = useRef(null);
  const previewRef = useRef(null);
  const [previewCaretPosition, setPreviewCaretPosition] = useState(null);
  const [previewSelection, setPreviewSelection] = useState(null);
  const [activeLink, setActiveLink] = useState(null);
  const [isPreviewFocused, setIsPreviewFocused] = useState(false);
  const linkUndoStack = useRef([]);
  const { handleMarkdownShortcut, handlePaste } = useMarkdownShortcuts(
    textareaRef,
    value,
    onChange,
  );

  const updateCaret = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    setPreviewCaretPosition(textarea.selectionStart);
    setPreviewSelection(
      textarea.selectionStart === textarea.selectionEnd
        ? null
        : {
            start: textarea.selectionStart,
            end: textarea.selectionEnd,
          },
    );
    setIsPreviewFocused(textarea.ownerDocument.activeElement === textarea);
  }, [textareaRef]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return undefined;
    }

    const handleFocus = () => {
      updateCaret();
      setIsPreviewFocused(true);
    };
    const handleBlur = () => setIsPreviewFocused(false);
    const eventNames = ['click', 'input', 'keyup', 'mouseup', 'select'];

    eventNames.forEach((eventName) => {
      textarea.addEventListener(eventName, updateCaret);
    });
    textarea.addEventListener('focus', handleFocus);
    textarea.addEventListener('blur', handleBlur);
    updateCaret();

    return () => {
      eventNames.forEach((eventName) => {
        textarea.removeEventListener(eventName, updateCaret);
      });
      textarea.removeEventListener('focus', handleFocus);
      textarea.removeEventListener('blur', handleBlur);
    };
  }, [textareaRef, updateCaret]);

  useEffect(() => {
    updateCaret();
  }, [updateCaret, value]);

  const handleScroll = useCallback((event) => {
    if (previewRef.current) {
      previewRef.current.scrollTop = event.target.scrollTop;
      previewRef.current.scrollLeft = event.target.scrollLeft;
    }
  }, []);

  const handleCreateLinkShortcut = useCallback(
    (event) => {
      if (
        disabled ||
        event.key?.toLowerCase() !== 'k' ||
        (!event.metaKey && !event.ctrlKey)
      ) {
        return;
      }

      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setActiveLink({
        anchor: wrapperRef.current,
        end: textarea.selectionEnd,
        label: value.slice(textarea.selectionStart, textarea.selectionEnd),
        start: textarea.selectionStart,
        url: '',
      });
    },
    [disabled, textareaRef, value],
  );

  const handlePreviewMouseDown = useCallback(
    (event) => {
      if (disabled || event.button !== 0) {
        return;
      }

      const linkElement = event.target.closest?.(
        '[data-alpaca-markdown-link="true"]',
      );
      if (linkElement) {
        event.preventDefault();
        setActiveLink({
          anchor: wrapperRef.current,
          end: Number(linkElement.dataset.markdownLinkEnd),
          label: linkElement.textContent || '',
          start: Number(linkElement.dataset.markdownLinkStart),
          url: linkElement.getAttribute('href') || '',
        });
        return;
      }

      const previewElement = event.currentTarget;
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const startPreviewOffset = getPreviewOffsetAtPoint(
        previewElement,
        event.clientX,
        event.clientY,
      );
      if (startPreviewOffset === null) {
        return;
      }

      const startSourceOffset = getSourceOffset(value, startPreviewOffset);
      if (event.detail === 2) {
        const wordSelection = getVisibleWordSelection(value, startSourceOffset);
        if (wordSelection) {
          event.preventDefault();
          textarea.focus();
          textarea.setSelectionRange(wordSelection.start, wordSelection.end);
          updateCaret();
          globalThis.requestAnimationFrame(() => {
            if (!textareaRef.current) {
              return;
            }

            textareaRef.current.setSelectionRange(
              wordSelection.start,
              wordSelection.end,
            );
            updateCaret();
          });
          globalThis.setTimeout(() => {
            if (!textareaRef.current) {
              return;
            }

            textareaRef.current.setSelectionRange(
              wordSelection.start,
              wordSelection.end,
            );
            updateCaret();
          }, 0);
          return;
        }
      }

      const updateSelection = (moveEvent) => {
        const previewOffset = getPreviewOffsetAtPoint(
          previewElement,
          moveEvent.clientX,
          moveEvent.clientY,
        );
        if (previewOffset === null) {
          return;
        }

        const sourceOffset = getSourceOffset(value, previewOffset);
        const selectionStart = Math.min(startSourceOffset, sourceOffset);
        const selectionEnd = Math.max(startSourceOffset, sourceOffset);
        textarea.setSelectionRange(
          selectionStart,
          selectionEnd,
          sourceOffset < startSourceOffset ? 'backward' : 'forward',
        );
        updateCaret();
      };
      const finishSelection = () => {
        previewElement.ownerDocument.removeEventListener(
          'mousemove',
          updateSelection,
        );
        previewElement.ownerDocument.removeEventListener(
          'mouseup',
          finishSelection,
        );
      };

      event.preventDefault();
      textarea.focus();
      textarea.setSelectionRange(startSourceOffset, startSourceOffset);
      updateCaret();
      previewElement.ownerDocument.addEventListener(
        'mousemove',
        updateSelection,
      );
      previewElement.ownerDocument.addEventListener('mouseup', finishSelection);
    },
    [disabled, textareaRef, updateCaret, value],
  );

  const handlePreviewClick = useCallback(
    (event) => {
      if (event.target.closest?.('[data-alpaca-markdown-link="true"]')) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (event.detail !== 2) {
        return;
      }

      const previewOffset = getPreviewOffsetAtPoint(
        event.currentTarget,
        event.clientX,
        event.clientY,
      );
      if (previewOffset === null) {
        return;
      }

      const selection = getVisibleWordSelection(
        value,
        getSourceOffset(value, previewOffset),
      );
      const textarea = textareaRef.current;
      if (!selection || !textarea) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      textarea.focus();
      textarea.setSelectionRange(selection.start, selection.end);
      updateCaret();
      globalThis.requestAnimationFrame(() => {
        if (!textareaRef.current) {
          return;
        }

        textareaRef.current.setSelectionRange(selection.start, selection.end);
        updateCaret();
      });
    },
    [textareaRef, updateCaret, value],
  );

  const updateActiveLink = useCallback((field, nextValue) => {
    setActiveLink((currentLink) =>
      currentLink ? { ...currentLink, [field]: nextValue } : currentLink,
    );
  }, []);

  const applyActiveLink = useCallback(() => {
    if (!activeLink) {
      return;
    }

    const replacement = activeLink.url.trim()
      ? `[${activeLink.label}](${activeLink.url})`
      : activeLink.label;
    const nextValue = `${value.slice(0, activeLink.start)}${replacement}${value.slice(activeLink.end)}`;
    const nextCaretPosition = activeLink.start + replacement.length;

    linkUndoStack.current.push({
      nextValue,
      previousValue: value,
      previousSelectionStart: activeLink.start,
      previousSelectionEnd: activeLink.end,
    });

    onChange(nextValue);
    setActiveLink(null);
    globalThis.requestAnimationFrame(() => {
      if (!textareaRef.current) {
        return;
      }

      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        nextCaretPosition,
        nextCaretPosition,
      );
    });
  }, [activeLink, onChange, textareaRef, value]);

  const handleLinkUndoShortcut = useCallback(
    (event) => {
      if (
        event.defaultPrevented ||
        (!event.metaKey && !event.ctrlKey) ||
        event.key?.toLowerCase() !== 'z'
      ) {
        return;
      }

      const lastChange =
        linkUndoStack.current[linkUndoStack.current.length - 1];
      if (!lastChange || lastChange.nextValue !== value) {
        return;
      }

      event.preventDefault();
      linkUndoStack.current.pop();
      onChange(lastChange.previousValue);
      globalThis.requestAnimationFrame(() => {
        if (!textareaRef.current) {
          return;
        }

        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          lastChange.previousSelectionStart,
          lastChange.previousSelectionEnd,
        );
      });
    },
    [onChange, textareaRef, value],
  );

  const handleLinkEditorKeyDown = useCallback(
    (event) => {
      if (event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      applyActiveLink();
    },
    [applyActiveLink],
  );

  const handleWordBoundarySelection = useCallback(
    (event) => {
      if (
        (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
        event.altKey &&
        !event.shiftKey &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        const textarea = textareaRef.current;
        if (
          !textarea ||
          textarea.selectionStart !== textarea.selectionEnd ||
          !/[`*]/.test(value)
        ) {
          return;
        }

        const nextPosition = getVisibleWordBoundary(
          value,
          textarea.selectionStart,
          event.key === 'ArrowLeft' ? 'left' : 'right',
        );
        if (nextPosition === textarea.selectionStart) {
          return;
        }

        event.preventDefault();
        textarea.setSelectionRange(nextPosition, nextPosition);
        updateCaret();
        return;
      }

      if (
        event.key !== 'ArrowLeft' ||
        !event.altKey ||
        !event.shiftKey ||
        event.metaKey ||
        event.ctrlKey
      ) {
        return;
      }

      const textarea = textareaRef.current;
      if (!textarea || textarea.selectionStart !== textarea.selectionEnd) {
        return;
      }

      const selection = getFormattedWordSelection(
        value,
        textarea.selectionStart,
      );
      if (!selection) {
        return;
      }

      event.preventDefault();
      textarea.setSelectionRange(selection.start, selection.end);
      updateCaret();
    },
    [textareaRef, updateCaret, value],
  );

  return (
    <div
      className="alpaca-markdown-textarea"
      ref={wrapperRef}
      onKeyDownCapture={(event) => {
        handleMarkdownShortcut(event);
        handleLinkUndoShortcut(event);
        handleCreateLinkShortcut(event);
        handleWordBoundarySelection(event);
      }}
      onPasteCapture={handlePaste}
      data-disabled={disabled ? 'true' : 'false'}
    >
      <div
        className="alpaca-markdown-textarea__preview"
        ref={previewRef}
        aria-hidden="true"
        onMouseDown={handlePreviewMouseDown}
        onClick={handlePreviewClick}
        dangerouslySetInnerHTML={{
          __html: renderMarkdownPreview(
            value,
            isPreviewFocused && !previewSelection ? previewCaretPosition : null,
            isPreviewFocused ? previewSelection?.start : null,
            isPreviewFocused ? previewSelection?.end : null,
          ),
        }}
      />
      {activeLink?.anchor?.isConnected ? (
        <Popover
          anchor={activeLink.anchor}
          position="bottom center"
          className="alpaca-markdown-link-popover"
          onClose={() => setActiveLink(null)}
          onFocusOutside={() => setActiveLink(null)}
          onEscape={() => setActiveLink(null)}
          focusOnMount={false}
          animate={false}
        >
          <div className="alpaca-markdown-link-editor">
            <TextControl
              __next40pxDefaultSize
              label={__('Text', 'alpaca-issue-tracker')}
              value={activeLink.label}
              onKeyDown={handleLinkEditorKeyDown}
              onChange={(nextValue) => updateActiveLink('label', nextValue)}
            />
            <TextControl
              __next40pxDefaultSize
              label={__('URL', 'alpaca-issue-tracker')}
              type="url"
              value={activeLink.url}
              onKeyDown={handleLinkEditorKeyDown}
              onChange={(nextValue) => updateActiveLink('url', nextValue)}
            />
            <div className="alpaca-markdown-link-editor__actions">
              <Button variant="tertiary" onClick={() => setActiveLink(null)}>
                {__('Cancel', 'alpaca-issue-tracker')}
              </Button>
              <Button variant="primary" onClick={applyActiveLink}>
                {__('Apply', 'alpaca-issue-tracker')}
              </Button>
            </div>
          </div>
        </Popover>
      ) : null}
      <div onScroll={handleScroll}>{children}</div>
    </div>
  );
};

MarkdownTextarea.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  textareaRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

MarkdownTextarea.defaultProps = {
  disabled: false,
};

export default MarkdownTextarea;
