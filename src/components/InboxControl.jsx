import PropTypes from 'prop-types';
import {
  fetchNotificationInbox,
  fetchNotificationInboxCount,
  markAllNotificationInboxItemsRead,
  markNotificationInboxItemsRead,
  markNotificationInboxItemsUnread,
} from '../services/notificationApi';

const { useCallback, useEffect, useMemo, useRef, useState, createPortal } =
  wp.element;
const { __ } = wp.i18n;
const { Button, Notice, Spinner } = wp.components;
const { doAction } = wp.hooks;

const PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 30000;
const IS_UNREAD_KEY = 'is_unread';
const CREATED_GMT_KEY = 'created_gmt';

/**
 * Convert a MySQL GMT date string to a Date object.
 *
 * @param {string} value GMT date string.
 * @return {Date|null} Parsed date.
 */
const parseGmtDate = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.includes('T')
    ? value
    : `${value.replace(' ', 'T')}Z`;
  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

/**
 * Format an inbox item timestamp.
 *
 * @param {string} value GMT date string.
 * @return {string} Formatted timestamp.
 */
const formatInboxTimestamp = (value) => {
  const date = parseGmtDate(value);
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

/**
 * Board inbox control rendered beside the board search.
 *
 * @param {Object} props          Component props.
 * @param {string} props.selector Controls mount selector.
 * @return {JSX.Element|null} Inbox control.
 */
function InboxControl({ selector }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('unread');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const loadUnreadCount = useCallback(() => {
    fetchNotificationInboxCount()
      .then((response) => {
        setUnreadCount(Number(response?.unread_count || 0));
      })
      .catch(() => {
        setUnreadCount(0);
      });
  }, []);

  useEffect(() => {
    loadUnreadCount();

    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        loadUnreadCount();
      }
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadUnreadCount]);

  const loadInbox = useCallback(
    ({ nextPage = 1, nextFilter = filter, append = false } = {}) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError('');
      }

      fetchNotificationInbox({
        filter: nextFilter,
        page: nextPage,
        perPage: PAGE_SIZE,
      })
        .then((response) => {
          const nextItems = Array.isArray(response?.items)
            ? response.items
            : [];
          setItems((currentItems) =>
            append ? [...currentItems, ...nextItems] : nextItems,
          );
          setPage(Number(response?.page || nextPage));
          setTotalPages(Number(response?.total_pages || 0));
          setUnreadCount(Number(response?.unread_count || 0));
        })
        .catch((loadError) => {
          setError(
            loadError?.message || __('Could not load inbox updates.', 'alpaca'),
          );
        })
        .finally(() => {
          setIsLoading(false);
          setIsLoadingMore(false);
        });
    },
    [filter],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    loadInbox({ nextPage: 1, nextFilter: filter, append: false });
  }, [filter, isOpen, loadInbox]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if ('Escape' === event.key) {
        setIsOpen(false);
      }
    };

    const handlePointerDown = (event) => {
      const target = event.target;
      if (!target) {
        return;
      }

      if (buttonRef.current && buttonRef.current.contains(target)) {
        return;
      }

      if (panelRef.current && panelRef.current.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('touchstart', handlePointerDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('touchstart', handlePointerDown, true);
    };
  }, [isOpen]);

  useEffect(() => {
    document.body.classList.toggle('alpaca-inbox-open', isOpen);

    return () => {
      document.body.classList.remove('alpaca-inbox-open');
    };
  }, [isOpen]);

  const hasMoreItems = useMemo(() => page < totalPages, [page, totalPages]);

  const updateLocalReadState = useCallback(
    (itemId, isUnread) => {
      setItems((currentItems) => {
        if ('unread' === filter && !isUnread) {
          return currentItems.filter((item) => item.id !== itemId);
        }

        return currentItems.map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          return {
            ...item,
            [IS_UNREAD_KEY]: isUnread,
          };
        });
      });
    },
    [filter],
  );

  const handleMarkReadState = useCallback(
    (itemId, isUnread) => {
      setIsMutating(true);
      setError('');

      const request = isUnread
        ? markNotificationInboxItemsUnread([itemId])
        : markNotificationInboxItemsRead([itemId]);

      request
        .then((response) => {
          updateLocalReadState(itemId, isUnread);
          setUnreadCount(Number(response?.unread_count || 0));
        })
        .catch((mutationError) => {
          setError(
            mutationError?.message ||
              __('Could not update inbox state.', 'alpaca'),
          );
        })
        .finally(() => {
          setIsMutating(false);
        });
    },
    [updateLocalReadState],
  );

  const handleOpenItem = useCallback(
    (item) => {
      if (!item) {
        return;
      }

      const continueOpen = () => {
        doAction('alpaca.openIssue', {
          id: item?.issue?.id,
          slug: item?.issue?.slug,
        });
        setIsOpen(false);
      };

      if (!item[IS_UNREAD_KEY]) {
        continueOpen();
        return;
      }

      setIsMutating(true);
      setError('');

      markNotificationInboxItemsRead([item.id])
        .then((response) => {
          updateLocalReadState(item.id, false);
          setUnreadCount(Number(response?.unread_count || 0));
          continueOpen();
        })
        .catch((mutationError) => {
          setError(
            mutationError?.message ||
              __('Could not update inbox state.', 'alpaca'),
          );
        })
        .finally(() => {
          setIsMutating(false);
        });
    },
    [updateLocalReadState],
  );

  const handleMarkAllRead = useCallback(() => {
    setIsMutating(true);
    setError('');

    markAllNotificationInboxItemsRead()
      .then((response) => {
        setUnreadCount(Number(response?.unread_count || 0));
        setItems((currentItems) => {
          if ('unread' === filter) {
            return [];
          }

          return currentItems.map((item) => ({
            ...item,
            [IS_UNREAD_KEY]: false,
          }));
        });
      })
      .catch((mutationError) => {
        setError(
          mutationError?.message ||
            __('Could not mark inbox items as read.', 'alpaca'),
        );
      })
      .finally(() => {
        setIsMutating(false);
      });
  }, [filter]);

  const handleLoadMore = useCallback(() => {
    if (!hasMoreItems || isLoadingMore) {
      return;
    }

    loadInbox({ nextPage: page + 1, nextFilter: filter, append: true });
  }, [filter, hasMoreItems, isLoadingMore, loadInbox, page]);

  let panelBody = (
    <div className="alpaca-inbox-empty-state">
      <p>
        {'unread' === filter
          ? __('No unread updates right now.', 'alpaca')
          : __('No inbox updates yet.', 'alpaca')}
      </p>
    </div>
  );

  if (isLoading) {
    panelBody = (
      <div className="alpaca-inbox-loading">
        <Spinner />
      </div>
    );
  } else if (items.length > 0) {
    panelBody = (
      <div className="alpaca-inbox-list">
        {items.map((item) => (
          <article
            key={item.id}
            className={`alpaca-inbox-item ${
              item[IS_UNREAD_KEY] ? 'is-unread' : ''
            }`}
          >
            <button
              type="button"
              className="alpaca-inbox-item-main"
              onClick={() => handleOpenItem(item)}
            >
              <div className="alpaca-inbox-item-topline">
                <span className="alpaca-inbox-item-issue">
                  {item?.issue?.title || __('Untitled issue', 'alpaca')}
                </span>
                <span className="alpaca-inbox-item-time">
                  {formatInboxTimestamp(item[CREATED_GMT_KEY])}
                </span>
              </div>
              <div className="alpaca-inbox-item-meta">
                {item[IS_UNREAD_KEY] && (
                  <span
                    className="alpaca-inbox-item-unread-dot"
                    aria-hidden="true"
                  />
                )}
                <span className="alpaca-inbox-item-label">
                  {item.event_label}
                </span>
              </div>
              <p className="alpaca-inbox-item-preview">{item.preview}</p>
              <div className="alpaca-inbox-item-actor">
                {item?.actor?.avatar_url && (
                  <img
                    src={item.actor.avatar_url}
                    alt=""
                    className="alpaca-inbox-item-avatar"
                  />
                )}
                <span>
                  {item?.actor?.display_name || __('Unknown user', 'alpaca')}
                </span>
              </div>
            </button>
            <div className="alpaca-inbox-item-actions">
              <Button
                variant="link"
                onClick={() =>
                  handleMarkReadState(item.id, !item[IS_UNREAD_KEY])
                }
                disabled={isMutating}
              >
                {item[IS_UNREAD_KEY]
                  ? __('Mark Read', 'alpaca')
                  : __('Mark Unread', 'alpaca')}
              </Button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (typeof document === 'undefined' || typeof createPortal !== 'function') {
    return null;
  }

  const mountNode = document.querySelector(selector);
  if (!mountNode) {
    return null;
  }

  return (
    <>
      {createPortal(
        <div className="alpaca-inbox-control">
          <button
            type="button"
            className={`alpaca-inbox-trigger ${isOpen ? 'is-open' : ''}`}
            onClick={() => setIsOpen((current) => !current)}
            ref={buttonRef}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls="alpaca-inbox-panel"
          >
            <span className="dashicons dashicons-bell" aria-hidden="true" />
            <span className="screen-reader-text">{__('Inbox', 'alpaca')}</span>
            {unreadCount > 0 && (
              <span className="alpaca-inbox-trigger-badge">{unreadCount}</span>
            )}
          </button>
        </div>,
        mountNode,
      )}
      {isOpen &&
        createPortal(
          <>
            <div className="alpaca-inbox-backdrop" />
            <aside
              id="alpaca-inbox-panel"
              className="alpaca-inbox-panel"
              ref={panelRef}
              aria-label={__('Inbox', 'alpaca')}
            >
              <div className="alpaca-inbox-panel-header">
                <div>
                  <h2>{__('Inbox', 'alpaca')}</h2>
                  <p>{__('Relevant issue activity for you.', 'alpaca')}</p>
                </div>
                <button
                  type="button"
                  className="alpaca-inbox-close"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="screen-reader-text">
                    {__('Close inbox', 'alpaca')}
                  </span>
                  <span
                    className="dashicons dashicons-no-alt"
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className="alpaca-inbox-panel-toolbar">
                <div className="alpaca-inbox-filter-group">
                  <Button
                    variant={'unread' === filter ? 'primary' : 'secondary'}
                    onClick={() => setFilter('unread')}
                    disabled={isLoading || isMutating}
                  >
                    {__('Unread', 'alpaca')}
                  </Button>
                  <Button
                    variant={'all' === filter ? 'primary' : 'secondary'}
                    onClick={() => setFilter('all')}
                    disabled={isLoading || isMutating}
                  >
                    {__('All', 'alpaca')}
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  onClick={handleMarkAllRead}
                  disabled={isMutating || unreadCount <= 0}
                >
                  {__('Mark All Read', 'alpaca')}
                </Button>
              </div>

              {error && (
                <Notice status="error" onRemove={() => setError('')}>
                  {error}
                </Notice>
              )}

              <div className="alpaca-inbox-panel-body">{panelBody}</div>

              {hasMoreItems && (
                <div className="alpaca-inbox-panel-footer">
                  <Button
                    variant="secondary"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore
                      ? __('Loading…', 'alpaca')
                      : __('Load More', 'alpaca')}
                  </Button>
                </div>
              )}
            </aside>
          </>,
          document.body,
        )}
    </>
  );
}

InboxControl.propTypes = {
  selector: PropTypes.string,
};

InboxControl.defaultProps = {
  selector: '#project-board-controls-mount',
};

export default InboxControl;
