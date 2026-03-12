import PropTypes from 'prop-types';
import {
  fetchNotificationInbox,
  fetchNotificationInboxCount,
  markAllNotificationInboxItemsRead,
  markNotificationInboxItemsRead,
  markNotificationInboxItemsUnread,
} from '../services/notificationApi';
import UnreadCountBadge from './notifications/UnreadCountBadge';
import TimelineEntry from './comment/TimelineEntry';

const { useCallback, useEffect, useMemo, useRef, useState, createPortal } =
  wp.element;
const { __ } = wp.i18n;
const { Button, Notice, Spinner } = wp.components;
const { doAction } = wp.hooks;

const PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 30000;
const PANEL_CLOSE_ANIMATION_MS = 220;
const IS_UNREAD_KEY = 'is_unread';
const CREATED_GMT_KEY = 'created_gmt';
const EVENT_FAMILY_HUMAN_COMMENTS = 'human_comments';

/**
 * Map an inbox event family to an audit timeline tag.
 *
 * @param {string} eventFamily Inbox event family.
 * @return {string} Timeline tag.
 */
const getTimelineTagForEventFamily = (eventFamily) => {
  switch (eventFamily) {
    case 'status_changes':
      return 'status-changed';
    case 'issue_assignment_changes':
      return 'assignee-changed';
    case 'due_date_changes':
      return 'deadline-changed';
    case 'checklist_created_deleted':
      return 'subissue-created';
    case 'checklist_assignment_changes':
      return 'subissue-assignee-changed';
    case 'checklist_completion_changes':
      return 'subissue-completion-changed';
    case 'checklist_promotions':
      return 'subissue-promoted';
    case 'priority_changes':
      return 'priority-changed';
    default:
      return '';
  }
};

/**
 * Determine whether the inbox event label should be shown.
 *
 * @param {string} eventFamily Event family key.
 * @param {string} eventLabel  Localized event label.
 * @return {boolean} True when label should be rendered.
 */
const shouldShowInboxEventLabel = (eventFamily, eventLabel) => {
  if (EVENT_FAMILY_HUMAN_COMMENTS !== eventFamily) {
    // Audit entries already include full change context in the comment body.
    return false;
  }

  return (
    eventLabel.toLowerCase() !== __('Comment added', 'alpaca').toLowerCase()
  );
};

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
 * Build a comment-like payload for TimelineEntry.
 *
 * @param {Object} item Inbox API item.
 * @return {Object} TimelineEntry-compatible comment payload.
 */
const buildTimelineCommentFromInboxItem = (item) => {
  const parsedCreatedDate = parseGmtDate(item?.[CREATED_GMT_KEY]);
  const eventFamily = String(item?.event_family || '');
  const eventLabel = String(item?.event_label || '').trim();
  const showEventLabel = shouldShowInboxEventLabel(eventFamily, eventLabel);
  const preview = String(item?.preview || '').trim();
  const markdownBody = [
    showEventLabel && eventLabel ? `**${eventLabel}**` : '',
    preview,
  ]
    .filter(Boolean)
    .join('\n\n');
  const timelineTags = ['alpaca-inbox-timeline-item'];
  const commentAttachments = Array.isArray(item?.comment_attachments)
    ? item.comment_attachments.filter(
        (attachmentUrl) =>
          'string' === typeof attachmentUrl && attachmentUrl.trim().length > 0,
      )
    : [];
  const mappedEventTag = getTimelineTagForEventFamily(eventFamily);

  if (mappedEventTag) {
    timelineTags.push(mappedEventTag);
  }

  const timelineComment = {
    id: item?.id,
    date: parsedCreatedDate
      ? parsedCreatedDate.toISOString()
      : item?.[CREATED_GMT_KEY] || '',
    author_user_agent:
      EVENT_FAMILY_HUMAN_COMMENTS === eventFamily ? 'human' : 'audit',
    content: {
      raw: markdownBody,
    },
    meta: {
      alpacaCommentTags: timelineTags,
      alpacaCommentAttachments: commentAttachments,
    },
  };

  // eslint-disable-next-line camelcase
  timelineComment.author_details = {
    name: item?.actor?.display_name || __('Unknown user', 'alpaca'),
    avatar: item?.actor?.avatar_url || '',
  };

  return timelineComment;
};

/**
 * Board inbox control rendered beside the board search.
 *
 * @param {Object} props          Component props.
 * @param {string} props.selector Controls mount selector.
 * @return {JSX.Element|null} Inbox control.
 */
function InboxControl({ selector }) {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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

  const closePanel = useCallback(() => {
    if (!isPanelVisible || isClosing) {
      return;
    }

    setIsClosing(true);
  }, [isClosing, isPanelVisible]);

  const openPanel = useCallback(() => {
    setIsClosing(false);
    setIsPanelVisible(true);
  }, []);

  useEffect(() => {
    if (!isClosing) {
      return undefined;
    }

    const closeTimerId = window.setTimeout(() => {
      setIsPanelVisible(false);
      setIsClosing(false);
    }, PANEL_CLOSE_ANIMATION_MS);

    return () => {
      window.clearTimeout(closeTimerId);
    };
  }, [isClosing]);

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
    if (!isPanelVisible) {
      return;
    }

    loadInbox({ nextPage: 1, nextFilter: filter, append: false });
  }, [filter, isPanelVisible, loadInbox]);

  useEffect(() => {
    if (!isPanelVisible) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if ('Escape' === event.key) {
        closePanel();
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

      closePanel();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('touchstart', handlePointerDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('touchstart', handlePointerDown, true);
    };
  }, [closePanel, isPanelVisible]);

  useEffect(() => {
    document.body.classList.toggle('alpaca-inbox-open', isPanelVisible);

    return () => {
      document.body.classList.remove('alpaca-inbox-open');
    };
  }, [isPanelVisible]);

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
        closePanel();
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
    [closePanel, updateLocalReadState],
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
      <div className="alpaca-inbox-list alpaca-comments-timeline">
        {items.map((item) => {
          const timelineComment = buildTimelineCommentFromInboxItem(item);
          const issueTitle =
            item?.issue?.title || __('Untitled issue', 'alpaca');
          const isAuditEntry = timelineComment.author_user_agent === 'audit';
          const readToggleAction = (
            <Button
              variant="link"
              className="alpaca-inbox-entry-read-toggle"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleMarkReadState(item.id, !item[IS_UNREAD_KEY]);
              }}
              disabled={isMutating}
            >
              {item[IS_UNREAD_KEY]
                ? __('Mark Read', 'alpaca')
                : __('Mark Unread', 'alpaca')}
            </Button>
          );

          return (
            <article
              key={item.id}
              className={`alpaca-inbox-entry ${
                item[IS_UNREAD_KEY] ? 'is-unread' : 'is-read'
              }`}
            >
              <div
                role="button"
                tabIndex={0}
                className="alpaca-inbox-entry-button"
                onClick={() => handleOpenItem(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleOpenItem(item);
                  }
                }}
              >
                <TimelineEntry
                  comment={timelineComment}
                  onAttachmentClick={null}
                  issueTitle={issueTitle}
                  showIssueTitle
                  showTime
                  stripInteractive
                  enableAttachmentPreview={false}
                  auditTimeInTopline={isAuditEntry}
                  className="alpaca-inbox-entry-item"
                  headerActions={isAuditEntry ? readToggleAction : null}
                  footerActions={isAuditEntry ? null : readToggleAction}
                />
              </div>
            </article>
          );
        })}
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
            className={`alpaca-inbox-trigger ${isPanelVisible ? 'is-open' : ''}`}
            onClick={() => {
              if (isPanelVisible) {
                closePanel();
                return;
              }

              openPanel();
            }}
            ref={buttonRef}
            aria-haspopup="dialog"
            aria-expanded={isPanelVisible}
            aria-controls="alpaca-inbox-panel"
          >
            <span className="dashicons dashicons-bell" aria-hidden="true" />
            <span className="screen-reader-text">{__('Inbox', 'alpaca')}</span>
            <UnreadCountBadge count={unreadCount} variant="inbox-trigger" />
          </button>
        </div>,
        mountNode,
      )}
      {isPanelVisible &&
        createPortal(
          <>
            <div className="alpaca-inbox-backdrop" />
            <aside
              id="alpaca-inbox-panel"
              className={`alpaca-inbox-panel alpaca-side-panel ${isClosing ? 'is-closing' : ''}`}
              ref={panelRef}
              aria-label={__('Inbox', 'alpaca')}
            >
              <div className="alpaca-inbox-panel-header">
                <div>
                  <h2>{__('Inbox', 'alpaca')}</h2>
                </div>
                <button
                  type="button"
                  className="alpaca-inbox-close"
                  onClick={closePanel}
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
