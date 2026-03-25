import AlpacaIssue from './components/Issue';
import TimelineEntry from './components/comment/TimelineEntry';
import {
  buildStatusIssuePayload,
  dispatchStatusChangedAction,
  getStatusName,
} from './utils/statusChange';
import { parseWpDateValue } from './utils/date';

const { __ } = wp.i18n;
const { decodeEntities } = wp.htmlEntities;
const { useState, useEffect, useMemo, useCallback, useRef } = wp.element;
const { Spinner, Notice } = wp.components;

const COMMENTS_PER_PAGE = 20;

/**
 * Strip HTML tags from a string.
 *
 * @param {string} maybeHtml Potential HTML string.
 * @return {string} Plain text.
 */
const stripHtml = (maybeHtml) => {
  if (!maybeHtml) {
    return '';
  }

  return String(maybeHtml)
    .replace(/<[^>]*>/g, '')
    .trim();
};

/**
 * Format a date heading label for grouped timeline sections.
 *
 * @param {string} value ISO date string.
 * @return {string} Group heading label.
 */
const formatGroupDateLabel = (value, isGmt = false) => {
  const date = parseWpDateValue(value, { treatMysqlAsUtc: isGmt });
  if (!date) {
    return __('Unknown date', 'alpaca');
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Extract a post title from a REST post object.
 *
 * @param {Object} post REST post object.
 * @return {string} Decoded post title.
 */
const extractTitle = (post) => {
  if (!post) {
    return '';
  }

  if (post.post_title && String(post.post_title).trim()) {
    return decodeEntities(String(post.post_title).trim());
  }

  if (post.title) {
    if (typeof post.title === 'string' && post.title.trim()) {
      return decodeEntities(post.title.trim());
    }

    if (typeof post.title.rendered === 'string' && post.title.rendered.trim()) {
      return decodeEntities(stripHtml(post.title.rendered));
    }
  }

  if (post.content && post.content.rendered) {
    const titleFromContent = decodeEntities(stripHtml(post.content.rendered));
    if (titleFromContent) {
      return titleFromContent;
    }
  }

  return decodeEntities(post.post_content || post.slug || post.post_name || '');
};

/**
 * Build a lookup map from issue ID to issue summary data.
 *
 * @param {Array} posts Issue posts.
 * @return {Object} Lookup map.
 */
const buildIssueLookupFromPosts = (posts) => {
  const lookup = {};

  if (!Array.isArray(posts)) {
    return lookup;
  }

  posts.forEach((post) => {
    const issueId = Number(post?.id);
    if (issueId <= 0) {
      return;
    }

    lookup[issueId] = {
      id: String(issueId),
      slug: post?.slug || '',
      title: extractTitle(post),
      status: post.status,
    };
  });

  return lookup;
};

/**
 * Project activity screen with timeline entries for issue comments.
 *
 * @return {JSX.Element} Activity screen.
 */
const Activity = () => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [issueLookup, setIssueLookup] = useState({});
  const [selectedIssue, setSelectedIssue] = useState(null);
  const issueLookupRef = useRef({});
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    issueLookupRef.current = issueLookup;
  }, [issueLookup]);

  const loadIssueTitles = useCallback(async (issueIds) => {
    const normalizedIssueIds = Array.from(
      new Set(
        issueIds
          .map((issueId) => Number(issueId))
          .filter((issueId) => issueId > 0),
      ),
    );

    if (normalizedIssueIds.length === 0) {
      return;
    }

    const unknownIssueIds = normalizedIssueIds.filter(
      (issueId) =>
        !Object.prototype.hasOwnProperty.call(issueLookupRef.current, issueId),
    );

    if (unknownIssueIds.length === 0) {
      return;
    }

    try {
      const posts = await wp.apiFetch({
        path:
          '/wp/v2/alpaca_issue?context=view&_fields=id,title,content,slug,status&per_page=' +
          unknownIssueIds.length +
          '&include=' +
          unknownIssueIds.join(','),
      });
      const nextLookup = buildIssueLookupFromPosts(posts);
      setIssueLookup((previousLookup) => {
        const mergedLookup = {
          ...previousLookup,
          ...nextLookup,
        };
        issueLookupRef.current = mergedLookup;
        return mergedLookup;
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load issue titles for activity timeline', error);
    }
  }, []);

  const loadComments = useCallback(
    async (page, append) => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setErrorMessage('');
      }

      try {
        // context=edit is required so show_hidden_comments surfaces audit entries.
        const response = await wp.apiFetch({
          path:
            '/wp/v2/comments?' +
            'context=edit' +
            '&show_hidden_comments=1' +
            '&comment_type=issuecomment' +
            '&orderby=date' +
            '&order=desc' +
            '&_embed=author' +
            '&per_page=' +
            COMMENTS_PER_PAGE +
            '&page=' +
            page,
          parse: false,
        });

        const parsedComments = await response.json();
        const nextTotalPages = parseInt(
          response.headers.get('X-WP-TotalPages') || '1',
          10,
        );
        const normalizedComments = Array.isArray(parsedComments)
          ? parsedComments
          : [];

        if (append) {
          setComments((previousComments) => {
            const seenCommentIds = new Set(
              previousComments.map((comment) => comment.id),
            );
            const deduplicatedNewComments = normalizedComments.filter(
              (comment) => !seenCommentIds.has(comment.id),
            );
            return [...previousComments, ...deduplicatedNewComments];
          });
        } else {
          setComments(normalizedComments);
        }

        setHasMorePages(page < nextTotalPages);

        if (normalizedComments.length > 0) {
          const commentIssueIds = normalizedComments.map(
            (comment) => comment.post,
          );
          await loadIssueTitles(commentIssueIds);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load project activity comments', error);
        setErrorMessage(__('Could not load project activity.', 'alpaca'));
        setHasMorePages(false);
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [loadIssueTitles],
  );

  useEffect(() => {
    loadComments(currentPage, currentPage > 1);
  }, [currentPage, loadComments]);

  const requestNextPage = useCallback(() => {
    if (loadingRef.current || !hasMorePages) {
      return;
    }

    setCurrentPage((previousPage) => previousPage + 1);
  }, [hasMorePages]);

  useEffect(() => {
    const sentinelElement = sentinelRef.current;

    if (!sentinelElement || !hasMorePages) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry || !entry.isIntersecting) {
          return;
        }

        requestNextPage();
      },
      {
        root: null,
        rootMargin: '300px 0px',
        threshold: 0.01,
      },
    );

    observer.observe(sentinelElement);

    return () => {
      observer.disconnect();
    };
  }, [hasMorePages, requestNextPage]);

  useEffect(() => {
    if (!hasMorePages) {
      return undefined;
    }

    const handleScroll = () => {
      if (loadingRef.current) {
        return;
      }

      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop || 0;
      const viewportHeight = window.innerHeight || 0;
      const documentHeight = document.documentElement.scrollHeight || 0;
      const threshold = 240;

      if (scrollTop + viewportHeight >= documentHeight - threshold) {
        requestNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [hasMorePages, requestNextPage]);

  // If the initial batch does not fill the viewport, eagerly load the next page.
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasMorePages || loadingRef.current) {
      return;
    }

    const viewportHeight = window.innerHeight || 0;
    const documentHeight = document.documentElement.scrollHeight || 0;

    if (documentHeight <= viewportHeight + 120) {
      requestNextPage();
    }
  }, [
    comments.length,
    hasMorePages,
    isLoading,
    isLoadingMore,
    requestNextPage,
  ]);

  const groupedComments = useMemo(() => {
    const grouped = [];
    const groupIndexByKey = {};

    comments.forEach((comment) => {
      const dateValue = comment?.date_gmt || comment?.date || '';
      const isGmt = Boolean(comment?.date_gmt);
      const parsedDate = parseWpDateValue(dateValue, {
        treatMysqlAsUtc: isGmt,
      });
      const groupKey = parsedDate
        ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`
        : 'unknown-date';

      if (!Object.prototype.hasOwnProperty.call(groupIndexByKey, groupKey)) {
        groupIndexByKey[groupKey] = grouped.length;
        grouped.push({
          key: groupKey,
          label: formatGroupDateLabel(dateValue, isGmt),
          comments: [],
        });
      }

      grouped[groupIndexByKey[groupKey]].comments.push(comment);
    });

    return grouped;
  }, [comments]);

  const handleOpenIssue = useCallback(
    (comment) => {
      const issueId = Number(comment?.post);
      if (issueId <= 0) {
        return;
      }

      const issueData = issueLookup[issueId] || {};
      setSelectedIssue({
        id: String(issueId),
        slug: issueData.slug || '',
        content: issueData.title || '',
      });
    },
    [issueLookup],
  );

  const handleCloseIssue = useCallback(() => {
    setSelectedIssue(null);
  }, []);

  const handleIssueDeleted = useCallback(() => {
    setSelectedIssue(null);
  }, []);

  /**
   * Mirror board status-change hook dispatch so audit comments are generated.
   *
   * @param {string|number} issueId        Issue ID.
   * @param {Object}        newStatus      New status term object.
   * @param {Object}        previousStatus Previous status term object.
   * @param {Object}        issueDetails   Full issue details payload.
   */
  const handleStatusChange = useCallback(
    (issueId, newStatus, previousStatus, issueDetails) => {
      const statusIssuePayload = buildStatusIssuePayload(
        issueId,
        issueDetails,
        issueLookupRef.current,
      );

      if (!statusIssuePayload) {
        return;
      }

      dispatchStatusChangedAction(
        statusIssuePayload,
        getStatusName(previousStatus),
        getStatusName(newStatus),
      );
    },
    [],
  );

  const handleIssueTitleChange = useCallback((issueId, newTitle) => {
    const normalizedIssueId = Number(issueId);
    if (normalizedIssueId <= 0) {
      return;
    }

    setIssueLookup((previousLookup) => {
      const mergedLookup = {
        ...previousLookup,
        [normalizedIssueId]: {
          ...(previousLookup[normalizedIssueId] || {}),
          id: String(normalizedIssueId),
          title: decodeEntities(newTitle || ''),
        },
      };
      issueLookupRef.current = mergedLookup;
      return mergedLookup;
    });
  }, []);

  const noop = useCallback(() => {}, []);

  return (
    <div id="alpaca-activity">
      {isLoading && (
        <div className="alpaca-activity-loading">
          <Spinner />
        </div>
      )}

      {!isLoading && errorMessage && (
        <Notice status="error" isDismissible={false}>
          <p>{errorMessage}</p>
        </Notice>
      )}

      {!isLoading && !errorMessage && groupedComments.length === 0 && (
        <Notice status="info" isDismissible={false}>
          <p>{__('No activity found yet.', 'alpaca')}</p>
        </Notice>
      )}

      {!isLoading && !errorMessage && groupedComments.length > 0 && (
        <div className="alpaca-activity-timeline">
          {groupedComments.map((group) => (
            <section key={group.key} className="alpaca-activity-date-group">
              <h2 className="alpaca-activity-date-heading">{group.label}</h2>
              <div className="alpaca-comments-timeline">
                {group.comments.map((comment) => {
                  const issueId = Number(comment.post);
                  const issueTitle = issueLookup[issueId]?.title || '';

                  if (
                    issueLookup[issueId] &&
                    issueLookup[issueId].status !== 'publish'
                  ) {
                    return null;
                  }

                  return (
                    <div
                      role="button"
                      tabIndex={0}
                      key={comment.id}
                      className="alpaca-activity-entry-button"
                      onClick={() => handleOpenIssue(comment)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleOpenIssue(comment);
                        }
                      }}
                    >
                      <TimelineEntry
                        comment={comment}
                        onAttachmentClick={noop}
                        issueTitle={
                          issueTitle ||
                          `${__('Issue', 'alpaca')} #${String(issueId)}`
                        }
                        showIssueTitle
                        showTime
                        stripInteractive
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {isLoadingMore && (
            <div className="alpaca-activity-loading-more">
              <Spinner />
            </div>
          )}

          {hasMorePages && (
            <div ref={sentinelRef} className="alpaca-activity-sentinel" />
          )}
        </div>
      )}

      <AlpacaIssue
        key={selectedIssue?.id || 'none'}
        issueId={selectedIssue?.id || ''}
        isCreating={false}
        isOpen={Boolean(selectedIssue)}
        onClose={handleCloseIssue}
        onDelete={handleIssueDeleted}
        onAssigneesChange={noop}
        onDeadlineChange={noop}
        onStatusChange={handleStatusChange}
        onIssueTitleChange={handleIssueTitleChange}
        onIssueCreated={noop}
        onLabelsChange={noop}
      />
    </div>
  );
};

export default Activity;
