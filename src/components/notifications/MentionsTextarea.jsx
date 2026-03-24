import PropTypes from 'prop-types';
import { fetchUsers } from '../../services/issueApi';

const { useCallback, useEffect, useMemo, useRef, useState } = wp.element;
const { __ } = wp.i18n;
const { Button, Popover, Spinner, TextareaControl } = wp.components;

/**
 * Safely assign a value to an external React ref.
 *
 * @param {Object|Function|null} ref   React ref.
 * @param {HTMLElement|null}     value Element instance.
 * @return {void}
 */
const assignRef = (ref, value) => {
  if (!ref) {
    return;
  }

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  ref.current = value;
};

/**
 * Derive the current @mention query from a textarea value and caret position.
 *
 * @param {string} value         - Current textarea value.
 * @param {number} caretPosition - Current caret position.
 * @return {Object|null} Mention match data.
 */
const getMentionMatch = (value, caretPosition) => {
  const text = typeof value === 'string' ? value : '';
  const beforeCaret = text.slice(0, caretPosition);
  const match = beforeCaret.match(/(^|\s)@([a-zA-Z0-9._-]*)$/);

  if (!match) {
    return null;
  }

  const query = match[2] || '';

  return {
    query,
    start: caretPosition - query.length - 1,
    end: caretPosition,
  };
};

/**
 * Textarea control with @mention suggestions.
 *
 * @param {Object}   props             Component props.
 * @param {string}   props.value       Current textarea value.
 * @param {Function} props.onChange    Change handler.
 * @param {Object}   props.textareaRef Forwarded textarea ref.
 * @param {boolean}  props.disabled    Disable state.
 * @param {string}   props.placeholder Placeholder text.
 * @return {JSX.Element} Mention-enabled textarea.
 */
const MentionsTextarea = ({
  value,
  onChange,
  textareaRef,
  disabled,
  placeholder,
}) => {
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [mentionState, setMentionState] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoadingUsers(true);
    fetchUsers()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setUsers(Array.isArray(response) ? response : []);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Could not load mention users.', error);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTextareaRef = useCallback(
    (node) => {
      inputRef.current = node;
      assignRef(textareaRef, node);
    },
    [textareaRef],
  );

  const updateMentionQuery = useCallback((nextValue, caretOverride) => {
    const textarea = inputRef.current;
    let caretPosition = 0;

    if (typeof caretOverride === 'number') {
      caretPosition = caretOverride;
    } else if (textarea && typeof textarea.selectionStart === 'number') {
      caretPosition = textarea.selectionStart;
    }

    const nextMentionState = getMentionMatch(nextValue, caretPosition);
    setMentionState(nextMentionState);
    setHighlightedIndex(0);
  }, []);

  const suggestions = useMemo(() => {
    if (!mentionState) {
      return [];
    }

    const query = mentionState.query.toLowerCase();

    return users
      .filter((user) => {
        if (!query) {
          return true;
        }

        const slug = String(user.slug || '').toLowerCase();
        const name = String(user.name || user.display_name || '').toLowerCase();

        return slug.includes(query) || name.includes(query);
      })
      .slice(0, 8);
  }, [mentionState, users]);

  useEffect(() => {
    if (!suggestions.length) {
      setHighlightedIndex(0);
      return;
    }

    if (highlightedIndex >= suggestions.length) {
      setHighlightedIndex(0);
    }
  }, [highlightedIndex, suggestions]);

  const closeSuggestions = useCallback(() => {
    setMentionState(null);
    setHighlightedIndex(0);
  }, []);

  const selectSuggestion = useCallback(
    (user) => {
      if (!mentionState) {
        return;
      }

      const currentValue = typeof value === 'string' ? value : '';
      const prefix = currentValue.slice(0, mentionState.start);
      const suffix = currentValue.slice(mentionState.end);
      const inserted = `@${user.slug} `;
      const nextValue = `${prefix}${inserted}${suffix}`;
      const nextCaretPosition = prefix.length + inserted.length;

      onChange(nextValue);
      closeSuggestions();

      window.requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.selectionStart = nextCaretPosition;
          inputRef.current.selectionEnd = nextCaretPosition;
        }
      });
    },
    [closeSuggestions, mentionState, onChange, value],
  );

  const handleChange = useCallback(
    (nextValue) => {
      onChange(nextValue);
      updateMentionQuery(nextValue);
    },
    [onChange, updateMentionQuery],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (!mentionState || !suggestions.length) {
        return;
      }

      if ('ArrowDown' === event.key) {
        event.preventDefault();
        setHighlightedIndex((current) =>
          current + 1 >= suggestions.length ? 0 : current + 1,
        );
        return;
      }

      if ('ArrowUp' === event.key) {
        event.preventDefault();
        setHighlightedIndex((current) =>
          current - 1 < 0 ? suggestions.length - 1 : current - 1,
        );
        return;
      }

      if ('Enter' === event.key || 'Tab' === event.key) {
        event.preventDefault();
        selectSuggestion(suggestions[highlightedIndex]);
        return;
      }

      if ('Escape' === event.key) {
        event.preventDefault();
        closeSuggestions();
      }
    },
    [
      closeSuggestions,
      highlightedIndex,
      mentionState,
      selectSuggestion,
      suggestions,
    ],
  );

  const handleCaretUpdate = useCallback(
    (event) => {
      const ignoredKeys = ['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'];

      if (
        event &&
        typeof event.key === 'string' &&
        ignoredKeys.includes(event.key)
      ) {
        return;
      }

      updateMentionQuery(value);
    },
    [updateMentionQuery, value],
  );

  return (
    <div className="alpaca-mentions-textarea" ref={wrapperRef}>
      <TextareaControl
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        ref={handleTextareaRef}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onKeyUp={handleCaretUpdate}
        onClick={handleCaretUpdate}
      />
      {mentionState && (
        <Popover
          anchor={wrapperRef.current}
          placement="bottom-start"
          className="alpaca-mentions-popover"
          onClose={closeSuggestions}
          focusOnMount={false}
        >
          <div className="alpaca-mentions-popover-content">
            {isLoadingUsers && <Spinner />}
            {!isLoadingUsers && !suggestions.length && (
              <p className="alpaca-mentions-empty">
                {__('No matching users found.', 'alpaca')}
              </p>
            )}
            {!isLoadingUsers &&
              suggestions.map((user, index) => {
                const isActive = index === highlightedIndex;
                const avatar =
                  user.avatar_urls?.['24'] ||
                  user.avatar_urls?.['48'] ||
                  user.avatar_urls?.['96'] ||
                  '';

                return (
                  <Button
                    key={user.id || user.slug}
                    className={`alpaca-mentions-option${
                      isActive ? ' is-active' : ''
                    }`}
                    onClick={() => selectSuggestion(user)}
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt=""
                        className="alpaca-mentions-option-avatar"
                      />
                    ) : (
                      <span className="alpaca-mentions-option-avatar alpaca-mentions-option-avatar--fallback dashicons dashicons-admin-users" />
                    )}
                    <span className="alpaca-mentions-option-labels">
                      <strong>{user.name || user.display_name}</strong>
                      <span>@{user.slug}</span>
                    </span>
                  </Button>
                );
              })}
          </div>
        </Popover>
      )}
    </div>
  );
};

export default MentionsTextarea;

MentionsTextarea.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  textareaRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({
      current: PropTypes.any,
    }),
  ]),
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
};

MentionsTextarea.defaultProps = {
  textareaRef: null,
  disabled: false,
  placeholder: '',
};
