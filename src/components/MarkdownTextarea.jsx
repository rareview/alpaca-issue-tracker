import PropTypes from 'prop-types';
import useMarkdownShortcuts from '../hooks/useMarkdownShortcuts';

const { useCallback, useEffect, useRef, useState } = wp.element;

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

    if (index < text.length) {
      html += escapeHtml(text[index]);
    }

    if (index === selectionEnd) {
      html += '</span>';
    }
  }

  return html;
};

const getSourceOffset = (value, previewOffset) => {
  const text = String(value || '');
  const markdownPattern = /`([^`\n]+)`|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;
  let sourcePosition = 0;
  let renderedPosition = 0;
  let match;

  while ((match = markdownPattern.exec(text)) !== null) {
    const plainLength = match.index - sourcePosition;
    if (previewOffset <= renderedPosition + plainLength) {
      return sourcePosition + previewOffset - renderedPosition;
    }

    renderedPosition += plainLength;
    let markerLength = 1;
    if (match[2]) {
      markerLength = 2;
    }
    const content = match[1] || match[2] || match[3];
    const contentLength = content.length;
    if (previewOffset < renderedPosition + contentLength) {
      return match.index + markerLength + previewOffset - renderedPosition;
    }

    renderedPosition += contentLength;
    sourcePosition = markdownPattern.lastIndex;
  }

  return sourcePosition + previewOffset - renderedPosition;
};

const getRenderedOffset = (value, sourceOffset) => {
  const text = String(value || '');
  const markdownPattern = /`([^`\n]+)`|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;
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
    if (match[2]) {
      markerLength = 2;
    }
    const content = match[1] || match[2] || match[3];
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
    /`([^`\n]+)`|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g,
    (match, code, bold, italic) => code || bold || italic,
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

const getPreviewOffsetAtPoint = (element, clientX, clientY) => {
  const documentObject = element.ownerDocument;
  const range = documentObject.caretRangeFromPoint?.(clientX, clientY);
  if (!range) {
    return null;
  }

  const textWalker = documentObject.createTreeWalker(element, 4);
  let renderedOffset = 0;
  let textNode;

  while ((textNode = textWalker.nextNode())) {
    if (textNode === range.startContainer) {
      return renderedOffset + range.startOffset;
    }

    renderedOffset += textNode.textContent.length;
  }

  return renderedOffset;
};

const getFormattedWordSelection = (value, caretPosition) => {
  const text = String(value || '');
  const markdownPattern = /`([^`\n]+)`|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;
  let match;

  while ((match = markdownPattern.exec(text)) !== null) {
    let markerLength = 1;
    if (match[2]) {
      markerLength = 2;
    }
    const content = match[1] || match[2] || match[3];
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
  const markdownPattern = /`([^`\n]+)`|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;
  let html = '';
  let sourcePosition = 0;
  let match;

  while ((match = markdownPattern.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = markdownPattern.lastIndex;
    let markerLength = 1;
    let content = match[1] || match[3];
    let tagName = match[1] ? 'code' : 'em';

    if (match[2]) {
      markerLength = 2;
      content = match[2];
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
    html += `<${tagName}>${formattedContent}</${tagName}>`;
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
  const [isPreviewFocused, setIsPreviewFocused] = useState(false);
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

  const handlePreviewMouseDown = useCallback(
    (event) => {
      if (disabled || event.button !== 0) {
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

      event.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const sourceOffset = getSourceOffset(value, previewOffset);
      textarea.focus();
      textarea.setSelectionRange(sourceOffset, sourceOffset);
      updateCaret();
    },
    [disabled, textareaRef, updateCaret, value],
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
        dangerouslySetInnerHTML={{
          __html: renderMarkdownPreview(
            value,
            isPreviewFocused && !previewSelection ? previewCaretPosition : null,
            isPreviewFocused ? previewSelection?.start : null,
            isPreviewFocused ? previewSelection?.end : null,
          ),
        }}
      />
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
