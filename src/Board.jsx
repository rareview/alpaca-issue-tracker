const { useState, useRef, useEffect, useCallback, useMemo } = wp.element;
const { decodeEntities } = wp.htmlEntities;
const { __ } = wp.i18n;
const { Button, Notice, Snackbar } = wp.components;

// Replaced Atlaskit DragDropContext with native HTML5 drag/drop handlers

import AlpacaIssue from './components/Issue';
import Container from './components/Container';
import BoardControls from './components/BoardControls';

import { setCookie, getCookie } from './utils/cookies';
import { transformDataForBoard, saveBoardOrder } from './utils/data';
import { reorderItemsWithinFilteredSlots } from './utils/boardFiltering';
import { getUser } from './hooks/useUser';
import { dispatchStatusChangedAction } from './utils/statusChange';
import { parseWpDateValue } from './utils/date';

import { updateIssue } from './services/issueApi';

/**
 * Main board component.
 */
export function AlpacaBoard() {
  const [containers, setContainers] = useState(() => {
    if (typeof window.alpacaBoardData !== 'undefined') {
      return transformDataForBoard(window.alpacaBoardData);
    }
    return [];
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const triggerRef = useRef(null);
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const [snackbarClosing, setSnackbarClosing] = useState(false);
  const snackbarTimerRef = useRef(null);
  const snackbarFadeTimerRef = useRef(null);
  const [needsSave, setNeedsSave] = useState(false);
  const [hiddenContainerIds, setHiddenContainerIds] = useState(() => {
    const cookie = getCookie('alpaca_hidden_containers');
    return cookie ? cookie.split(',').filter(Boolean) : [];
  });
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState(null);
  const [activeBoardFilter, setActiveBoardFilter] = useState(null);
  const [activeSearchFilter, setActiveSearchFilter] = useState(null);

  // Pre-built Set for O(1) lookups inside itemMatchesBoardFilter.
  const searchIdsSet = useMemo(
    () =>
      new Set(
        activeSearchFilter && Array.isArray(activeSearchFilter.issueIds)
          ? activeSearchFilter.issueIds
          : [],
      ),
    [activeSearchFilter],
  );

  /**
   * Resolve a normalized board filter object supporting legacy and combined shapes.
   *
   * @param {Object|null} filterValue Raw board filter payload.
   * @return {Object} Normalized board filter shape.
   */
  const normalizeBoardFilter = useCallback((filterValue) => {
    if (!filterValue || typeof filterValue !== 'object') {
      return {
        label: null,
        assignee: null,
        deadline: null,
      };
    }

    // Backward compatibility with older single-filter payloads.
    if (filterValue.type === 'label') {
      return {
        label: filterValue,
        assignee: null,
      };
    }

    if (filterValue.type === 'assignee') {
      return {
        label: null,
        assignee: filterValue,
        deadline: null,
      };
    }

    if (filterValue.type === 'deadline') {
      return {
        label: null,
        assignee: null,
        deadline: filterValue,
      };
    }

    return {
      label:
        filterValue.label && typeof filterValue.label === 'object'
          ? filterValue.label
          : null,
      assignee:
        filterValue.assignee && typeof filterValue.assignee === 'object'
          ? filterValue.assignee
          : null,
      deadline:
        filterValue.deadline && typeof filterValue.deadline === 'object'
          ? filterValue.deadline
          : null,
    };
  }, []);

  /**
   * Check whether an item matches the active board filter.
   *
   * @param {Object}      item   Item payload.
   * @param {Object|null} filter Filter to evaluate.
   * @return {boolean} True when the item matches or no filter is active.
   */
  const itemMatchesBoardFilter = useCallback(
    (item, filter = null) => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const hasCompositeFilter =
        !!filter &&
        typeof filter === 'object' &&
        (Object.prototype.hasOwnProperty.call(filter, 'boardFilter') ||
          Object.prototype.hasOwnProperty.call(filter, 'searchFilter'));

      const boardFilter = hasCompositeFilter
        ? filter.boardFilter || null
        : filter || activeBoardFilter;
      const searchFilter = hasCompositeFilter
        ? filter.searchFilter || null
        : activeSearchFilter;
      const normalizedBoardFilter = normalizeBoardFilter(boardFilter);
      const labelFilter = normalizedBoardFilter.label;
      const assigneeFilter = normalizedBoardFilter.assignee;
      const deadlineFilter = normalizedBoardFilter.deadline;

      const hasActiveSearchQuery =
        !!searchFilter &&
        typeof searchFilter.query === 'string' &&
        searchFilter.query.trim().length > 0;

      if (hasActiveSearchQuery) {
        // An active query with zero matches should hide all cards.
        if (searchIdsSet.size < 1) {
          return false;
        }

        const itemId =
          typeof item.id !== 'undefined' && item.id !== null
            ? String(item.id)
            : '';

        if (!itemId || !searchIdsSet.has(itemId)) {
          return false;
        }
      }

      if (!labelFilter && !assigneeFilter && !deadlineFilter) {
        return true;
      }

      if (assigneeFilter) {
        const assignees = Array.isArray(item.assignees) ? item.assignees : [];
        const hasAssigneeMatch = assignees.some(
          (assignee) =>
            assignee &&
            typeof assignee.id !== 'undefined' &&
            String(assignee.id) === String(assigneeFilter.id),
        );

        if (!hasAssigneeMatch) {
          return false;
        }
      }

      let labelMatch = true;
      if (labelFilter) {
        const labels = Array.isArray(item.labels) ? item.labels : [];
        const filterSlug = labelFilter.slug
          ? String(labelFilter.slug).toLowerCase()
          : '';
        const filterName = labelFilter.name
          ? String(labelFilter.name).toLowerCase()
          : '';

        labelMatch = labels.some((label) => {
          if (!label || typeof label !== 'object') {
            return false;
          }

          if (
            labelFilter.termId &&
            typeof label.term_id !== 'undefined' &&
            String(label.term_id) === String(labelFilter.termId)
          ) {
            return true;
          }

          if (
            filterSlug &&
            label.slug &&
            String(label.slug).toLowerCase() === filterSlug
          ) {
            return true;
          }

          if (
            filterName &&
            label.name &&
            String(label.name).toLowerCase() === filterName
          ) {
            return true;
          }

          return false;
        });
      }

      let deadlineMatch = true;
      if (deadlineFilter) {
        const rawDeadline =
          item.meta && item.meta.deadline && item.meta.deadline[0]
            ? item.meta.deadline[0]
            : null;

        const deadline = rawDeadline
          ? parseWpDateValue(rawDeadline, {
              treatDateOnlyAsLocalNoon: true,
            })
          : null;

        if (!deadline || Number.isNaN(deadline.getTime())) {
          deadlineMatch = false;
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          deadline.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil(
            (deadline - today) / (1000 * 60 * 60 * 24),
          );

          let deadlineState = 'future';
          if (diffDays < 0) {
            deadlineState = 'late';
          } else if (diffDays === 0) {
            deadlineState = 'today';
          } else if (diffDays < 8) {
            deadlineState = 'soon';
          }

          const selectedState = deadlineFilter.state
            ? String(deadlineFilter.state).toLowerCase()
            : '';
          deadlineMatch = !selectedState || selectedState === deadlineState;
        }
      }

      if (!labelMatch) {
        return false;
      }

      if (!deadlineMatch) {
        return false;
      }

      return true;
    },
    [activeBoardFilter, activeSearchFilter, normalizeBoardFilter, searchIdsSet],
  );

  /**
   * Update the `issue` query parameter in the URL.
   *
   * @param {string} issueValue The issue slug or ID.
   */
  const setIssueQueryParam = useCallback((issueValue) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('issue', issueValue);
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      const params = new URLSearchParams(window.location.search);
      params.set('issue', issueValue);
      const base = window.location.pathname + window.location.hash;
      const search = params.toString();
      window.history.pushState({}, '', base + (search ? `?${search}` : ''));
    }
  }, []);

  /**
   * Remove the `issue` query parameter from the URL.
   */
  const clearIssueQueryParam = useCallback(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('issue');
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      const params = new URLSearchParams(window.location.search);
      params.delete('issue');
      const base = window.location.pathname + window.location.hash;
      const search = params.toString();
      window.history.pushState({}, '', base + (search ? `?${search}` : ''));
    }
  }, []);

  /**
   * Show an issue not found snackbar.
   *
   * @param {string} issueSlug The unresolved issue identifier.
   */
  const showIssueNotFoundMessage = useCallback((issueSlug) => {
    setSelectedItem(null);
    setSnackbarClosing(false);
    setSnackbarMessage(__('Issue not found.', 'alpaca') + ` (${issueSlug})`);
    if (snackbarTimerRef.current) {
      clearTimeout(snackbarTimerRef.current);
    }
    if (snackbarFadeTimerRef.current) {
      clearTimeout(snackbarFadeTimerRef.current);
      snackbarFadeTimerRef.current = null;
    }
    snackbarTimerRef.current = setTimeout(() => {
      setSnackbarClosing(true);
      snackbarFadeTimerRef.current = setTimeout(() => {
        setSnackbarMessage(null);
        setSnackbarClosing(false);
        snackbarFadeTimerRef.current = null;
      }, 300);
      snackbarTimerRef.current = null;
    }, 4000);
  }, []);

  /**
   * Find an issue in containers by slug or ID.
   *
   * @param {string|number} issueIdentifier The issue identifier from URL/search.
   * @return {Object|null} Matching issue item or null.
   */
  const findIssueByIdentifier = useCallback(
    (issueIdentifier) => {
      if (!issueIdentifier) {
        return null;
      }

      const needle = String(issueIdentifier);
      for (const container of containers) {
        const found = container.items.find(
          (it) =>
            String(it.id) === needle ||
            it.slug === needle ||
            (it.meta && it.meta.slug === needle),
        );
        if (found) {
          return found;
        }
      }
      return null;
    },
    [containers],
  );

  // From BoardFrame.jsx
  useEffect(() => {
    const handleCreateBoardIssue = () => {
      setSelectedItem({ isCreating: true });
    };

    wp.hooks.addAction(
      'alpaca.createBoardIssue',
      'alpaca/board',
      handleCreateBoardIssue,
    );

    return () => {
      wp.hooks.removeAction('alpaca.createBoardIssue', 'alpaca/board');
    };
  }, []);

  // Effect to update cookie when hiddenContainerIds changes
  useEffect(() => {
    setCookie('alpaca_hidden_containers', hiddenContainerIds.join(','), 365);
  }, [hiddenContainerIds]);

  /**
   * Set active board filter from control.
   *
   * @param {Object|null} filter Filter payload.
   * @return {void}
   */
  const handleSetBoardFilter = useCallback(
    (filter) => {
      if (!filter || typeof filter !== 'object') {
        setActiveBoardFilter(null);
        return;
      }

      const filterType = filter.filterType || filter.type;

      if (filterType === 'assignee') {
        if (!filter.id) {
          setActiveBoardFilter((previous) => {
            const normalized = normalizeBoardFilter(previous);
            if (!normalized.label) {
              return null;
            }

            return {
              ...normalized,
              assignee: null,
            };
          });
          return;
        }

        setActiveBoardFilter((previous) => {
          const normalized = normalizeBoardFilter(previous);

          return {
            ...normalized,
            assignee: {
              type: 'assignee',
              id: String(filter.id),
              displayName:
                filter.displayName || filter.display_name || filter.name
                  ? String(
                      filter.displayName || filter.display_name || filter.name,
                    )
                  : '',
              avatar: filter.avatar || null,
            },
          };
        });
        return;
      }

      if (filterType === 'deadline') {
        if (!filter.state) {
          setActiveBoardFilter((previous) => {
            const normalized = normalizeBoardFilter(previous);
            if (!normalized.label && !normalized.assignee) {
              return null;
            }

            return {
              ...normalized,
              deadline: null,
            };
          });
          return;
        }

        setActiveBoardFilter((previous) => {
          const normalized = normalizeBoardFilter(previous);

          return {
            ...normalized,
            deadline: {
              type: 'deadline',
              state: String(filter.state).toLowerCase(),
            },
          };
        });
        return;
      }

      if (filterType !== 'label') {
        return;
      }

      setActiveBoardFilter((previous) => {
        const normalized = normalizeBoardFilter(previous);

        return {
          ...normalized,
          label: {
            type: 'label',
            termId:
              typeof filter.termId !== 'undefined' && filter.termId !== null
                ? String(filter.termId)
                : '',
            slug: filter.slug ? String(filter.slug).toLowerCase() : '',
            name: filter.name ? String(filter.name) : '',
            color: filter.color || null,
          },
        };
      });
    },
    [normalizeBoardFilter],
  );

  const handleClearBoardFilter = useCallback(
    (filterType = null) => {
      if (!filterType) {
        setActiveBoardFilter(null);
        return;
      }

      setActiveBoardFilter((previous) => {
        const normalized = normalizeBoardFilter(previous);

        if (filterType === 'assignee') {
          if (!normalized.label && !normalized.deadline) {
            return null;
          }

          return {
            ...normalized,
            assignee: null,
          };
        }

        if (filterType === 'label') {
          if (!normalized.assignee && !normalized.deadline) {
            return null;
          }

          return {
            ...normalized,
            label: null,
          };
        }

        if (filterType === 'deadline') {
          if (!normalized.label && !normalized.assignee) {
            return null;
          }

          return {
            ...normalized,
            deadline: null,
          };
        }

        return previous;
      });
    },
    [normalizeBoardFilter],
  );

  /**
   * Set active search filter from the search control.
   *
   * @param {Object|null} searchFilter Search filter payload.
   * @return {void}
   */
  const handleSetSearchFilter = useCallback((searchFilter) => {
    if (!searchFilter || typeof searchFilter !== 'object') {
      setActiveSearchFilter(null);
      return;
    }

    const normalizedQuery =
      typeof searchFilter.query === 'string' ? searchFilter.query.trim() : '';

    if (!normalizedQuery) {
      setActiveSearchFilter(null);
      return;
    }

    const normalizedIssueIds = Array.from(
      new Set(
        (Array.isArray(searchFilter.issueIds) ? searchFilter.issueIds : [])
          .map((issueId) =>
            typeof issueId !== 'undefined' && issueId !== null
              ? String(issueId)
              : '',
          )
          .filter(Boolean),
      ),
    );

    setActiveSearchFilter({
      type: 'search',
      query: normalizedQuery,
      issueIds: normalizedIssueIds,
    });
  }, []);

  const handleClearSearchFilter = useCallback(() => {
    setActiveSearchFilter(null);
  }, []);

  const searchScopeIssueIds = useMemo(
    () =>
      Array.from(
        new Set(
          containers
            .flatMap((container) =>
              Array.isArray(container?.items) ? container.items : [],
            )
            .filter((item) =>
              itemMatchesBoardFilter(item, {
                boardFilter: activeBoardFilter,
                searchFilter: null,
              }),
            )
            .map((item) =>
              typeof item?.id !== 'undefined' && item.id !== null
                ? String(item.id)
                : '',
            )
            .filter(Boolean),
        ),
      ),
    [containers, activeBoardFilter, itemMatchesBoardFilter],
  );

  // Sync selected issue with the URL `issue` query param and listen for Back/Forward.
  // Debounced to avoid rapid state churn when popstate events fire quickly.
  useEffect(() => {
    const syncFromUrl = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const issueSlug = params.get('issue');

        if (!issueSlug) {
          setSelectedItem(null);
          return;
        }

        // Ignore obviously malformed identifiers and clear the param.
        if (issueSlug !== '' && !/^[A-Za-z0-9_-]+$/.test(issueSlug)) {
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete('issue');
            window.history.replaceState({}, '', url.toString());
          } catch (error) {
            const fallbackParams = new URLSearchParams(window.location.search);
            fallbackParams.delete('issue');
            const base = window.location.pathname + window.location.hash;
            const search = fallbackParams.toString();
            window.history.replaceState(
              {},
              '',
              base + (search ? `?${search}` : ''),
            );
          }
          setSelectedItem(null);
          return;
        }
        const found = findIssueByIdentifier(issueSlug);
        if (found) {
          setSelectedItem(found);
          return;
        }

        showIssueNotFoundMessage(issueSlug);
      } catch (e) {
        // ignore malformed URL
      }
    };

    let popTimer = null;
    const popHandler = () => {
      if (popTimer) clearTimeout(popTimer);
      popTimer = setTimeout(() => {
        syncFromUrl();
        popTimer = null;
      }, 100);
    };

    window.addEventListener('popstate', popHandler);

    // Immediately sync once on mount
    syncFromUrl();

    return () => {
      window.removeEventListener('popstate', popHandler);
      if (popTimer) clearTimeout(popTimer);
    };
  }, [findIssueByIdentifier, showIssueNotFoundMessage]);

  // Open an issue via global action, used by cross-component controls such as search.
  useEffect(() => {
    const handleOpenIssue = (payload = {}) => {
      const issueSlug = payload.slug || payload.id;
      if (!issueSlug) {
        return;
      }

      const found = findIssueByIdentifier(issueSlug);
      if (found) {
        setSelectedItem(found);
        const value = found.slug || (found.meta && found.meta.slug) || found.id;
        setIssueQueryParam(value);
        return;
      }

      setIssueQueryParam(issueSlug);
      showIssueNotFoundMessage(issueSlug);
    };

    wp.hooks.addAction('alpaca.openIssue', 'alpaca/board', handleOpenIssue);

    return () => {
      wp.hooks.removeAction('alpaca.openIssue', 'alpaca/board');
    };
  }, [findIssueByIdentifier, setIssueQueryParam, showIssueNotFoundMessage]);

  const handleToggleHidden = (containerId) => {
    setHiddenContainerIds((prev) => {
      const newIds = new Set(prev);
      if (newIds.has(containerId)) {
        newIds.delete(containerId);
      } else {
        newIds.add(containerId);
      }
      return Array.from(newIds);
    });
  };

  // 🔹 Handle renaming a container
  const handleRenameContainer = (containerId, newTitle) => {
    const original = containers;
    const updated = containers.map((c) =>
      c.id === containerId ? { ...c, title: newTitle } : c,
    );
    setContainers(updated);

    // Persist via REST API
    wp.apiFetch({
      path: `/alpaca/v1/status/${containerId}`,
      method: 'POST',
      data: { name: newTitle },
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Error renaming container:', err);
      setContainers(original); // revert on failure
    });
  };

  function findContainerById(containerId) {
    return containers.find((c) => c.id === containerId);
  }

  function getItemById(itemId) {
    for (const container of containers) {
      const foundItem = container.items.find((item) => item.id === itemId);
      if (foundItem) return foundItem;
    }
    return null;
  }

  // (Atlaskit handler removed; using native drop handlers and `handleItemDrop`)

  const handleItemClick = (event, itemId) => {
    triggerRef.current = event.currentTarget;
    event.currentTarget.blur();

    const item = getItemById(itemId);
    setSelectedItem(item);
    // Update URL so the item can be shared via `?issue=slug` (fallback to id)
    const value = item?.slug || item?.meta?.slug || itemId;
    setIssueQueryParam(value);
  };

  const handleCommentCountChange = useCallback(
    (issueId, newCount, newCountByAgent = null) => {
      setContainers((prevContainers) =>
        prevContainers.map((container) => {
          const itemIndex = container.items.findIndex(
            (item) => item.id === issueId.toString(),
          );

          if (itemIndex === -1) {
            return container;
          }

          const newItems = [...container.items];
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            commentCount: newCount,
            commentCountByAgent:
              newCountByAgent &&
              typeof newCountByAgent === 'object' &&
              !Array.isArray(newCountByAgent)
                ? newCountByAgent
                : newItems[itemIndex].commentCountByAgent || null,
          };

          return { ...container, items: newItems };
        }),
      );
    },
    [],
  );

  useEffect(() => {
    const handleCommentCountChanged = (data) => {
      const { issueId, newCount, newCountByAgent } = data;
      handleCommentCountChange(issueId, newCount, newCountByAgent);
    };

    wp.hooks.addAction(
      'alpaca.commentCountChanged',
      'alpaca/boardmain',
      handleCommentCountChanged,
    );

    return () => {
      wp.hooks.removeAction('alpaca.commentCountChanged', 'alpaca/boardmain');
    };
  }, [handleCommentCountChange]);

  // Update labels on board when labels are changed elsewhere.
  useEffect(() => {
    const handleLabelsChanged = (data) => {
      const incoming = data && Array.isArray(data.labels) ? data.labels : [];
      if (!incoming || incoming.length < 1) return;

      const labelMap = new Map();
      incoming.forEach((l) => {
        if (l && typeof l.term_id !== 'undefined') {
          labelMap.set(String(l.term_id), {
            name: l.name || null,
            color: l.color || null,
            term_id: l.term_id,
          });
        }
      });

      if (labelMap.size < 1) return;

      setContainers((prev) =>
        prev.map((container) => ({
          ...container,
          items: container.items.map((item) => ({
            ...item,
            labels: Array.isArray(item.labels)
              ? item.labels.map((lab) => {
                  const id = lab && lab.term_id ? String(lab.term_id) : null;
                  if (id && labelMap.has(id)) {
                    const updated = labelMap.get(id);
                    return {
                      ...lab,
                      name: updated.name || lab.name,
                      color: updated.color || lab.color,
                    };
                  }
                  return lab;
                })
              : item.labels,
          })),
        })),
      );
    };

    wp.hooks.addAction(
      'alpaca.labelsChanged',
      'alpaca/board',
      handleLabelsChanged,
    );

    return () => {
      wp.hooks.removeAction('alpaca.labelsChanged', 'alpaca/board');
    };
  }, []);

  const handleLastActivityChange = useCallback((issueId, newLastActivity) => {
    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString(),
        );

        if (itemIndex === -1) {
          return container;
        }

        const newItems = [...container.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          meta: {
            ...newItems[itemIndex].meta,
            lastActivity: newLastActivity,
          },
        };

        return { ...container, items: newItems };
      }),
    );
  }, []);

  const handleSubissueProgressChange = useCallback((issueId, progress) => {
    const total = Number(progress?.total);
    const completed = Number(progress?.completed);

    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString(),
        );

        if (itemIndex === -1) {
          return container;
        }

        const newItems = [...container.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          meta: {
            ...newItems[itemIndex].meta,
            // eslint-disable-next-line camelcase
            subissue_progress: {
              total: Number.isFinite(total) ? total : 0,
              completed: Number.isFinite(completed) ? completed : 0,
            },
          },
        };

        return { ...container, items: newItems };
      }),
    );
  }, []);

  const handlePriorityChange = useCallback((issueId, isHighPriority) => {
    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString(),
        );

        if (itemIndex === -1) {
          return container;
        }

        const newItems = [...container.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          meta: {
            ...newItems[itemIndex].meta,
            // eslint-disable-next-line camelcase
            alpaca_high_priority: isHighPriority,
          },
        };

        return { ...container, items: newItems };
      }),
    );
  }, []);

  useEffect(() => {
    const priorityUpdatedCallback = (data) => {
      const { issueId, isHighPriority } = data;
      handlePriorityChange(issueId, isHighPriority);
    };

    const subissueProgressChangedCallback = (data) => {
      const { issueId, progress } = data;
      handleSubissueProgressChange(issueId, progress);
    };

    const lastActivityChangedCallback = (data) => {
      const { issueId, lastActivity } = data;
      handleLastActivityChange(issueId, lastActivity);
    };

    wp.hooks.addAction(
      'alpaca.priorityUpdated',
      'alpaca/boardmain',
      priorityUpdatedCallback,
    );

    wp.hooks.addAction(
      'alpaca.subissueProgressChanged',
      'alpaca/boardmain',
      subissueProgressChangedCallback,
    );

    wp.hooks.addAction(
      'alpaca.lastActivityChanged',
      'alpaca/boardmain',
      lastActivityChangedCallback,
    );

    return () => {
      wp.hooks.removeAction('alpaca.priorityUpdated', 'alpaca/boardmain');
      wp.hooks.removeAction(
        'alpaca.subissueProgressChanged',
        'alpaca/boardmain',
      );
      wp.hooks.removeAction('alpaca.lastActivityChanged', 'alpaca/boardmain');
    };
  }, [
    handlePriorityChange,
    handleSubissueProgressChange,
    handleLastActivityChange,
  ]);

  const moveAllItemsToNextContainer = (sourceContainerId) => {
    const containersCopy = containers.map((c) => ({
      ...c,
      items: [...c.items],
    }));

    const sourceIndex = containersCopy.findIndex(
      (c) => c.id === sourceContainerId,
    );

    if (sourceIndex === -1 || sourceIndex >= containersCopy.length - 1) {
      return;
    }

    const sourceContainer = containersCopy[sourceIndex];
    const nextContainer = containersCopy[sourceIndex + 1];
    const itemsToMove = [...sourceContainer.items];

    if (itemsToMove.length === 0) {
      return;
    }

    sourceContainer.items = [];
    nextContainer.items.push(...itemsToMove);

    itemsToMove.forEach((item) => {
      dispatchStatusChangedAction(
        item,
        sourceContainer.title,
        nextContainer.title,
      );

      updateIssue(item.id, {
        taxonomies: {
          status: [parseInt(nextContainer.id, 10)],
        },
        // eslint-disable-next-line no-console
      }).catch((err) => console.error(`Error updating issue ${item.id}:`, err));
    });

    setContainers(containersCopy);
    setNeedsSave(true);
  };

  const handleDeleteAll = (containerId) => {
    const originalContainers = containers;
    const containerToDeleteFrom = containers.find((c) => c.id === containerId);

    if (!containerToDeleteFrom) {
      // eslint-disable-next-line no-console
      console.warn(`Container with ID ${containerId} not found.`);
      return;
    }

    const itemsToDelete = containerToDeleteFrom.items.map((item) => item.id);

    // Optimistically update UI
    setContainers((prevContainers) =>
      prevContainers.map((c) =>
        c.id === containerId ? { ...c, items: [] } : c,
      ),
    );

    // API call to delete all issues in the container
    Promise.all(
      itemsToDelete.map((issueId) =>
        wp.apiFetch({
          path: `/alpaca/v1/delete/${issueId}`,
          method: 'DELETE',
        }),
      ),
    ).catch((err) => {
      // eslint-disable-next-line no-console
      console.error(
        `Error deleting issues from container ${containerId}:`,
        err,
      );
      setContainers(originalContainers); // Revert UI on error
    });
  };

  const handleAssigneesChange = async (issueId, newAssignees) => {
    const enrichedAssignees = await Promise.all(
      newAssignees.map(async (assignee) => {
        if (assignee && assignee.id && !assignee.displayName) {
          try {
            const fullUser = await getUser(assignee.id);
            return {
              ...assignee,
              displayName: fullUser.name,
              slug: fullUser.slug,
            };
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(
              `Error fetching user data for ID ${assignee.id}:`,
              error,
            );
            return assignee;
          }
        }
        return assignee;
      }),
    );

    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString(),
        );

        if (itemIndex === -1) {
          return container;
        }

        const newItems = [...container.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          assignees: enrichedAssignees,
        };

        return { ...container, items: newItems };
      }),
    );

    wp.hooks.doAction(
      'alpaca.issueAssigneesChanged',
      issueId,
      enrichedAssignees,
    );
  };

  const handleDeadlineChange = useCallback((issueId, newDeadline) => {
    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString(),
        );

        if (itemIndex === -1) {
          return container;
        }

        const newItems = [...container.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          meta: {
            ...newItems[itemIndex].meta,
            deadline: newDeadline ? [newDeadline] : null,
          },
        };

        return { ...container, items: newItems };
      }),
    );
  }, []);

  const handleLabelsChange = useCallback((issueId, newLabels) => {
    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString(),
        );

        if (itemIndex === -1) {
          return container;
        }

        const newItems = [...container.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          labels: newLabels,
        };

        return { ...container, items: newItems };
      }),
    );
  }, []);

  const handleStatusChange = useCallback((issueId, newStatusTerm) => {
    setContainers((prevContainers) => {
      const newContainers = prevContainers.map((container) => ({
        ...container,
        items: [...container.items],
      }));

      let movedItem = null;
      let oldContainerId = null;

      // Find the item and remove it from its current container
      for (const container of newContainers) {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString(),
        );
        if (itemIndex !== -1) {
          movedItem = container.items.splice(itemIndex, 1)[0];
          oldContainerId = container.id;
          break;
        }
      }

      if (movedItem) {
        // Update the item's status taxonomy
        movedItem.taxonomies = {
          ...movedItem.taxonomies,
          status: [newStatusTerm],
        };

        // Add the item to the new container
        const targetContainer = newContainers.find(
          (container) => container.id === newStatusTerm.term_id.toString(),
        );
        if (targetContainer) {
          targetContainer.items.push(movedItem);
          const sourceContainer = prevContainers.find(
            (c) => c.id === oldContainerId,
          );
          if (sourceContainer) {
            dispatchStatusChangedAction(
              movedItem,
              sourceContainer.title,
              targetContainer.title,
            );
          }
        }
      }

      return newContainers;
    });
    setNeedsSave(true);
  }, []);

  const handleIssueTitleChange = useCallback((issueId, newTitle) => {
    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        const itemIndex = container.items.findIndex(
          (item) => item.id === issueId.toString(),
        );

        if (itemIndex === -1) {
          return container;
        }

        const newItems = [...container.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          content: newTitle,
        };

        return { ...container, items: newItems };
      }),
    );
  }, []);

  const closeModal = () => {
    setSelectedItem(null);
    // Remove `issue` param from URL when modal is closed (create history entry).
    clearIssueQueryParam();
  };

  const handleRestoreDefaults = () => {
    setIsRestoring(true);
    setRestoreError(null);

    wp.apiFetch({
      path: '/alpaca/v1/statuses/restore-defaults',
      method: 'POST',
    })
      .then((response) => {
        if (response.success) {
          window.location.reload();
        } else {
          setRestoreError(
            response.message ||
              __('Failed to restore default statuses.', 'alpaca'),
          );
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error restoring default statuses:', err);
        setRestoreError(
          err.message ||
            __('An error occurred while restoring default statuses.', 'alpaca'),
        );
      })
      .finally(() => {
        setIsRestoring(false);
      });
  };

  const handleDeleteIssue = (issueId) => {
    // Optimistically remove the issue from the UI
    const originalContainers = containers;
    const newContainers = containers.map((c) => ({
      ...c,
      items: c.items.filter((item) => item.id !== issueId.toString()),
    }));
    setContainers(newContainers);
    closeModal();

    wp.apiFetch({
      path: `/alpaca/v1/delete/${issueId}`,
      method: 'DELETE',
    })
      .then(() => {
        wp.hooks.doAction('alpaca.issueDeletedAudit', issueId);
        wp.hooks.doAction('alpaca.issueDeleted', issueId);
      })
      .catch((err) => {
        // Revert if the delete fails
        // eslint-disable-next-line no-console
        console.error('Error deleting issue:', err);
        setContainers(originalContainers);
      });
  };

  const handleIssueCreated = (createdIssue) => {
    if (!createdIssue || !createdIssue.id) {
      console.error('Invalid issue data received:', createdIssue);
      window.location.reload();
      return;
    }

    setContainers((prevContainers) => {
      if (prevContainers.length === 0) {
        window.location.reload();
        return prevContainers;
      }

      const firstContainerIndex = 0;
      const updatedContainers = [...prevContainers];
      const firstContainer = { ...updatedContainers[firstContainerIndex] };

      const newItem = {
        id: createdIssue.id.toString(),
        slug: createdIssue.slug || '',
        content: createdIssue.title,
        assignees: createdIssue.assignees || [],
        labels: createdIssue.labels || [],
        commentCount: 1,
        commentCountByAgent: {
          create: 1,
        },
        meta: {
          deadline: createdIssue.deadline ? [createdIssue.deadline] : undefined,
          // eslint-disable-next-line camelcase
          alpaca_high_priority: createdIssue.isHighPriority ? '1' : undefined,
        },
      };

      // Add new issue to the top of the first container for immediate UI update
      firstContainer.items = [newItem, ...firstContainer.items];
      updatedContainers[firstContainerIndex] = firstContainer;

      return updatedContainers;
    });

    closeModal();
  };

  useEffect(() => {
    if (!selectedItem && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [selectedItem]);

  useEffect(() => {
    if (needsSave) {
      saveBoardOrder(containers);
      setNeedsSave(false);
    }
  }, [needsSave, containers]);

  useEffect(() => {
    const handleIssueSubmitted = (
      issue,
      statusId,
      _isHighPriority,
      submission = {},
    ) => {
      if (submission && submission.skipBoardInsert) {
        return;
      }

      if (!issue || !statusId) return;

      // Use functional update to ensure we have the latest state
      setContainers((prevContainers) => {
        const newContainers = prevContainers.map((container) => ({
          ...container,
          items: [...container.items],
        }));

        const targetContainer = newContainers.find(
          (c) => c.id === statusId.toString(),
        );

        if (targetContainer) {
          const newItem = {
            id: issue.id.toString(),
            slug: issue.slug || issue.post_name || '',
            content: decodeEntities(issue.title),
            postDate: issue.post_date_gmt || issue.post_date || '',
            authorName: issue.author_name,
            authorImg: issue.author_img,
            assignees: [],
            labels: issue.labels || [],
            commentCount: issue.comment_count ?? 0,
            commentCountByAgent: issue.comment_count_by_agent || null,
            meta: issue.meta || {},
          };

          // Add new issue to the top of the container for immediate UI update
          targetContainer.items.unshift(newItem);
        }

        return newContainers;
      });
    };

    const handleIssueDeletedFromHook = (issueId) => {
      if (!issueId) {
        return;
      }
      setContainers((prevContainers) =>
        prevContainers.map((container) => ({
          ...container,
          items: container.items.filter(
            (item) => item.id !== issueId.toString(),
          ),
        })),
      );
    };

    wp.hooks.addAction(
      'alpaca.issueSubmitted',
      'alpaca/boardmain',
      handleIssueSubmitted,
    );
    wp.hooks.addAction(
      'alpaca.issueInserted',
      'alpaca/boardmain',
      handleIssueSubmitted,
    );
    wp.hooks.addAction(
      'alpaca.issueDeleted',
      'alpaca/boardmain',
      handleIssueDeletedFromHook,
    );

    return () => {
      wp.hooks.removeAction('alpaca.issueSubmitted', 'alpaca/boardmain');
      wp.hooks.removeAction('alpaca.issueInserted', 'alpaca/boardmain');
      wp.hooks.removeAction('alpaca.issueDeleted', 'alpaca/boardmain');
    };
  }, []);

  useEffect(() => {
    const allAssignees = new Map();
    containers.forEach((container) => {
      container.items.forEach((item) => {
        if (item.assignees && Array.isArray(item.assignees)) {
          item.assignees.forEach((assignee) => {
            if (assignee && assignee.id) {
              const assigneeId = assignee.id.toString();
              const existing = allAssignees.get(assigneeId);
              if (
                !existing ||
                (!existing.displayName && assignee.displayName)
              ) {
                allAssignees.set(assigneeId, assignee);
              }
            }
          });
        }
      });
    });

    const assigneesArray = Array.from(allAssignees.values());

    wp.hooks.doAction('alpaca.allAssigneesUpdated', assigneesArray);
  }, [containers]);

  const hasNoStatuses = containers.length === 0;

  /**
   * Reorder items inside a container using a full ordered item ID list.
   *
   * @param {number|string}        containerId    Container identifier.
   * @param {Array<number|string>} orderedItemIds Ordered list of item IDs.
   * @return {void}
   */
  const handleBulkItemReorder = useCallback((containerId, orderedItemIds) => {
    if (!containerId || !Array.isArray(orderedItemIds)) {
      return;
    }

    setContainers((prevContainers) =>
      prevContainers.map((container) => {
        if (container.id.toString() !== containerId.toString()) {
          return container;
        }

        const itemMap = new Map();
        container.items.forEach((item) => {
          itemMap.set(item.id.toString(), item);
        });

        const reorderedItems = [];
        orderedItemIds.forEach((itemId) => {
          const itemKey = itemId.toString();
          if (itemMap.has(itemKey)) {
            reorderedItems.push(itemMap.get(itemKey));
            itemMap.delete(itemKey);
          }
        });

        itemMap.forEach((item) => {
          reorderedItems.push(item);
        });

        return {
          ...container,
          items: reorderedItems,
        };
      }),
    );

    setNeedsSave(true);
  }, []);

  // Handler invoked by Containers when an item is dropped
  const combinedBoardFilter =
    activeBoardFilter || activeSearchFilter
      ? {
          boardFilter: activeBoardFilter,
          searchFilter: activeSearchFilter,
        }
      : null;

  const handleItemDrop = (data) => {
    // data: { itemId, sourceContainerId, sourceIndex, destinationContainerId, destinationIndex }
    const {
      //   itemId,
      sourceContainerId,
      sourceIndex,
      destinationContainerId,
      destinationIndex,
      destinationVisibleIndex,
    } = data;

    if (!destinationContainerId) return;

    const sourceContainer = findContainerById(sourceContainerId);
    const destinationContainer = findContainerById(destinationContainerId);

    if (!sourceContainer || !destinationContainer) return;

    if (sourceContainer.id === destinationContainer.id) {
      setContainers((prev) => {
        const container = prev.find((c) => c.id === sourceContainerId);
        if (!container) return prev;

        const items = Array.from(container.items);

        // Bail if source index is out of bounds
        if (sourceIndex < 0 || sourceIndex >= items.length) {
          return prev;
        }

        const reorderedItems =
          combinedBoardFilter && typeof destinationVisibleIndex === 'number'
            ? reorderItemsWithinFilteredSlots({
                items,
                sourceIndex,
                destinationVisibleIndex,
                activeFilter: combinedBoardFilter,
                itemMatchesFilter: itemMatchesBoardFilter,
              })
            : (() => {
                const itemsCopy = Array.from(items);
                const [reorderedItem] = itemsCopy.splice(sourceIndex, 1);
                itemsCopy.splice(destinationIndex, 0, reorderedItem);
                return itemsCopy;
              })();

        return prev.map((c) =>
          c.id === sourceContainerId ? { ...c, items: reorderedItems } : c,
        );
      });
    } else {
      const sourceItems = Array.from(sourceContainer.items);
      const destItems = Array.from(destinationContainer.items);
      const [movedItem] = sourceItems.splice(sourceIndex, 1);
      destItems.splice(destinationIndex, 0, movedItem);

      setContainers((prev) =>
        prev.map((c) => {
          if (c.id === sourceContainer.id) {
            return { ...c, items: sourceItems };
          } else if (c.id === destinationContainer.id) {
            return { ...c, items: destItems };
          }
          return c;
        }),
      );

      dispatchStatusChangedAction(
        movedItem,
        sourceContainer.title,
        destinationContainer.title,
      );

      const movedItemId = parseInt(movedItem.id, 10);
      const newStatusTermId = parseInt(destinationContainer.id, 10);

      updateIssue(movedItemId, {
        taxonomies: {
          status: [newStatusTermId],
        },
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error updating issue:', err);
      });
    }

    setNeedsSave(true);
  };

  return (
    <>
      <BoardControls
        selector="#project-board-controls-mount"
        containers={containers}
        activeFilter={activeBoardFilter}
        activeSearchFilter={activeSearchFilter}
        searchScopeIssueIds={searchScopeIssueIds}
        onSetFilter={handleSetBoardFilter}
        onClearFilter={handleClearBoardFilter}
        onSetSearchFilter={handleSetSearchFilter}
        onClearSearchFilter={handleClearSearchFilter}
      />
      {hasNoStatuses ? (
        <div className="alpaca-empty-state">
          <Notice status="warning" isDismissible={false}>
            <p>
              <strong>
                {__(
                  'Oh no! All your project statuses have disappeared.',
                  'alpaca',
                )}
              </strong>
            </p>
            <p>
              {__(
                'Without statuses, you cannot view or manage issues on the board. Click the button below to restore the default statuses (Backlog, Next, In Progress, Done).',
                'alpaca',
              )}
            </p>
            <Button
              variant="primary"
              onClick={handleRestoreDefaults}
              isBusy={isRestoring}
              disabled={isRestoring}
            >
              {isRestoring
                ? __('Restoring…', 'alpaca')
                : __('Restore Default Statuses', 'alpaca')}
            </Button>
          </Notice>
          {restoreError && (
            <Notice status="error" isDismissible={false}>
              <p>{restoreError}</p>
            </Notice>
          )}
        </div>
      ) : (
        <div className="alpaca-wrap">
          {containers.map((container, index) => (
            <Container
              key={container.id}
              id={container.id}
              title={container.title}
              items={container.items}
              activeFilter={combinedBoardFilter}
              itemMatchesFilter={itemMatchesBoardFilter}
              onItemClick={handleItemClick}
              onMoveAllToNext={moveAllItemsToNextContainer}
              isLastContainer={index === containers.length - 1}
              isHidden={hiddenContainerIds.includes(container.id)}
              onToggleHidden={handleToggleHidden}
              onRename={handleRenameContainer}
              onDeleteAll={handleDeleteAll}
              onItemDrop={handleItemDrop}
              onBulkItemReorder={handleBulkItemReorder}
            />
          ))}
        </div>
      )}

      <AlpacaIssue
        key={selectedItem?.isCreating ? 'creating' : selectedItem?.id || 'none'}
        issueId={selectedItem?.id}
        isCreating={selectedItem?.isCreating}
        isOpen={!!selectedItem}
        activeSearchQuery={
          activeSearchFilter && typeof activeSearchFilter.query === 'string'
            ? activeSearchFilter.query
            : ''
        }
        onClose={closeModal}
        onDelete={handleDeleteIssue}
        triggerRef={triggerRef}
        onAssigneesChange={handleAssigneesChange}
        onLabelsChange={handleLabelsChange}
        onDeadlineChange={handleDeadlineChange}
        onStatusChange={handleStatusChange}
        onIssueTitleChange={handleIssueTitleChange}
        onIssueCreated={handleIssueCreated}
      />
      {snackbarMessage && (
        <Snackbar
          className={`alpaca-snackbar ${snackbarClosing ? 'is-closing' : ''}`}
          onClose={() => {
            // start fade then clear
            if (snackbarTimerRef.current) {
              clearTimeout(snackbarTimerRef.current);
              snackbarTimerRef.current = null;
            }
            if (snackbarFadeTimerRef.current) {
              clearTimeout(snackbarFadeTimerRef.current);
              snackbarFadeTimerRef.current = null;
            }
            setSnackbarClosing(true);
            snackbarFadeTimerRef.current = setTimeout(() => {
              setSnackbarMessage(null);
              setSnackbarClosing(false);
              snackbarFadeTimerRef.current = null;
            }, 300);
          }}
        >
          {snackbarMessage}
        </Snackbar>
      )}
    </>
  );
}

AlpacaBoard.displayName = 'AlpacaBoard';
