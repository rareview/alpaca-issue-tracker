import PropTypes from 'prop-types';

const { __ } = wp.i18n;
import { getTabsConfig } from '../utils/tabsConfig';
import useIssueData from '../hooks/useIssueData';
import useUserManagement from '../hooks/useUserManagement';
import useLoadingStates from '../hooks/useLoadingStates';
import useAutoExpandTextarea from '../hooks/useAutoExpandTextarea';

import { processAssigneeChanges } from '../utils/assigneeUtils';
import {
  fetchStatuses,
  fetchLabels,
  updateIssue,
  createIssue,
  createSubissue,
  deleteIssue,
} from '../services/issueApi';

import AssigneeSelector from './issue/AssigneeSelector';
import LabelsSelector from './issue/LabelsSelector';
import DeadlineControl from './issue/DeadlineControl';
import TabContent from './issue/TabContent';
import ErrorsTab from './issue/ErrorsTab';
import User from './User';
import Time from './Time';
import StarControl from './StarControl';
import { useWatchlist } from '../context/WatchlistContext';

/* THEN access WordPress globals */
const { useState, useEffect, useRef, useMemo, useCallback, memo } = wp.element;

const {
  Modal,
  TabPanel,
  Button,
  Popover,
  Tooltip,
  Dropdown,
  MenuGroup,
  MenuItem,
  ToggleControl,
  Snackbar,
  TextareaControl,
  CheckboxControl,
} = wp.components;

const { decodeEntities } = wp.htmlEntities;

// ----- Memoized rows -----
const PriorityRow = memo(
  ({ isHighPriority, onChange, isLoading }) => (
    <tr id="priority">
      <th scope="row">{__('Priority', 'alpaca')}</th>
      <td className="flexalign">
        <ToggleControl
          label={__('High Priority', 'alpaca')}
          checked={isHighPriority}
          onChange={onChange}
          disabled={isLoading}
          className="alpaca-priority-toggle"
        />
      </td>
    </tr>
  ),
  (prev, next) =>
    prev.isLoading === next.isLoading &&
    prev.isHighPriority === next.isHighPriority,
);

const AssigneeRow = memo(
  ({ assignees, allUsers, onChange, isLoading }) => (
    <tr id="assignees">
      <th scope="row">{__('Assignees', 'alpaca')}</th>
      <td className="flexalign">
        <AssigneeSelector
          assignees={assignees}
          allUsers={allUsers}
          onChange={onChange}
          isLoading={isLoading}
        />
      </td>
    </tr>
  ),
  (prev, next) =>
    prev.isLoading === next.isLoading &&
    prev.assignees.join(',') === next.assignees.join(',') &&
    prev.allUsers.join(',') === next.allUsers.join(','),
);

const LabelsRow = memo(
  ({ labels, selectedIds, onChange, isLoading }) => (
    <tr id="labels">
      <th scope="row">{__('Labels', 'alpaca')}</th>
      <td className="flexalign alpaca-issue-labels-cell">
        <LabelsSelector
          labels={labels}
          selectedIds={selectedIds}
          onChange={onChange}
          isLoading={isLoading}
        />
      </td>
    </tr>
  ),
  (prev, next) =>
    prev.isLoading === next.isLoading &&
    prev.labels === next.labels &&
    prev.selectedIds.join(',') === next.selectedIds.join(','),
);

const DeadlineRow = memo(
  ({ deadline, onChange, onClear, isLoading }) => (
    <tr id="deadline">
      <th scope="row">{__('Due Date', 'alpaca')}</th>
      <td className="flexalign">
        <DeadlineControl
          deadline={deadline}
          onChange={onChange}
          onClear={onClear}
          isLoading={isLoading}
        />
      </td>
    </tr>
  ),
  (prev, next) =>
    prev.isLoading === next.isLoading && prev.deadline === next.deadline,
);

const EditableTitle = memo(
  ({
    isEditing,
    title,
    onEditStart,
    onChange,
    onSave,
    onCancel,
    placeholder,
  }) => {
    const inputRef = useRef(null);

    useEffect(() => {
      if (isEditing && inputRef.current) {
        if (inputRef.current.textContent !== title) {
          inputRef.current.textContent = title;
        }
        // Auto-focus the input when entering edit mode
        inputRef.current.focus();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };

    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/heading-has-content
      <h3
        className="alpaca-issue-title"
        contentEditable={isEditing}
        suppressContentEditableWarning={isEditing}
        ref={isEditing ? inputRef : undefined}
        role={isEditing ? 'textbox' : 'button'}
        tabIndex={0}
        onClick={!isEditing ? onEditStart : undefined}
        onKeyDown={
          !isEditing ? (e) => e.key === 'Enter' && onEditStart() : handleKeyDown
        }
        onInput={
          isEditing ? (e) => onChange(e.currentTarget.textContent) : undefined
        }
        onBlur={isEditing ? onSave : undefined}
        aria-label="Issue title"
        data-placeholder={placeholder}
      >
        {!isEditing && title}
      </h3>
    );
  },
  (prev, next) =>
    prev.isEditing === next.isEditing && prev.title === next.title,
);

const SubissueAssigneeControl = memo(
  ({ assignees, allUsers, allUserObjects, onChange, isDraft, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const hasAssignees = assignees.length > 0;
    const previewUsers = assignees
      .map((assigneeValue) =>
        allUserObjects.find(
          (userObject) =>
            userObject.name === assigneeValue ||
            userObject.slug === assigneeValue,
        ),
      )
      .filter(Boolean);
    const assigneeText = assignees.join(', ');

    const openPopover = (event) => {
      event.stopPropagation();
      setIsOpen(true);
    };

    useEffect(() => {
      if (!isOpen) {
        return undefined;
      }

      const handlePointerDown = (event) => {
        const target = event.target;
        const isInsideTrigger = containerRef.current?.contains(target);
        const isInsidePopover = Boolean(
          target?.closest?.('.alpaca-subissues-assignee-popover'),
        );

        if (!isInsideTrigger && !isInsidePopover) {
          setIsOpen(false);
        }
      };

      const handleEscape = (event) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handlePointerDown, true);
      document.addEventListener('keydown', handleEscape, true);

      return () => {
        document.removeEventListener('mousedown', handlePointerDown, true);
        document.removeEventListener('keydown', handleEscape, true);
      };
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) {
        return undefined;
      }

      let animationFrameId = null;
      const focusInput = () => {
        const input = document.querySelector(
          '.alpaca-subissues-assignee-popover .components-form-token-field__input',
        );
        if (input && typeof input.focus === 'function') {
          input.focus();
        }
      };

      animationFrameId = window.requestAnimationFrame(focusInput);

      return () => {
        if (animationFrameId) {
          window.cancelAnimationFrame(animationFrameId);
        }
      };
    }, [isOpen]);

    return (
      <div className="alpaca-subissues-assignee" ref={containerRef}>
        {hasAssignees ? (
          <button
            type="button"
            className="alpaca-subissues-assignee-preview"
            title={assigneeText}
            aria-label={__('Edit assignees', 'alpaca')}
            onMouseDown={(event) => event.preventDefault()}
            onClick={openPopover}
          >
            {previewUsers.length > 0 ? (
              previewUsers.map((userObject) => (
                <img
                  key={userObject.id}
                  src={userObject.avatar}
                  alt={userObject.name}
                />
              ))
            ) : (
              <span className="alpaca-subissues-assignee-fallback dashicons dashicons-admin-users"></span>
            )}
          </button>
        ) : (
          <Button
            icon={<span className="alpaca-icon-assign"></span>}
            label={__('Assign', 'alpaca')}
            showTooltip
            tooltipPosition="top"
            onMouseDown={(event) => event.preventDefault()}
            onClick={openPopover}
            disabled={isDraft}
          />
        )}

        {isOpen && containerRef.current && (
          <Popover
            anchor={containerRef.current}
            placement="bottom-end"
            onClose={() => setIsOpen(false)}
            className="alpaca-subissues-assignee-popover"
            focusOnMount={false}
          >
            <div className="alpaca-subissues-assignee-popover-content">
              <AssigneeSelector
                assignees={assignees}
                allUsers={allUsers}
                onChange={onChange}
                isLoading={isLoading}
              />
            </div>
          </Popover>
        )}
      </div>
    );
  },
);

const SubissueTitleField = memo(
  ({
    value,
    placeholder,
    disabled,
    autoFocusOnMount,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
  }) => {
    const textareaRef = useRef(null);
    useAutoExpandTextarea(textareaRef, value, true);

    useEffect(() => {
      if (!autoFocusOnMount || !textareaRef.current) {
        return undefined;
      }

      const focusTextarea = () => {
        if (
          textareaRef.current &&
          typeof textareaRef.current.focus === 'function'
        ) {
          textareaRef.current.focus();
        }
      };

      const animationFrameId = window.requestAnimationFrame(focusTextarea);
      return () => {
        window.cancelAnimationFrame(animationFrameId);
      };
    }, [autoFocusOnMount]);

    return (
      <TextareaControl
        className="alpaca-subissues-text-control"
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        disabled={disabled}
        rows={1}
        ref={textareaRef}
        __nextHasNoMarginBottom
      />
    );
  },
);

/**
 * Normalize one subissue object from API or local draft state.
 *
 * @param {Object} subissue Raw subissue object.
 * @return {Object} Normalized subissue object.
 */
const normalizeSubissue = (subissue) => {
  const assignees = Array.isArray(subissue?.assignees)
    ? subissue.assignees
    : [];
  const status = Array.isArray(subissue?.status) ? subissue.status : [];
  const isCompletedValue = subissue?.is_completed ?? subissue?.isCompleted;
  const normalizedTitle = subissue?.title || subissue?.content || '';

  return {
    id: subissue?.id,
    slug: subissue?.slug || '',
    title: normalizedTitle,
    originalTitle: subissue?.originalTitle ?? normalizedTitle,
    postParent: Number(subissue?.post_parent || subissue?.postParent || 0),
    isCompleted:
      isCompletedValue === true ||
      isCompletedValue === 1 ||
      isCompletedValue === '1',
    assignees,
    status,
    isDraft: Boolean(subissue?.isDraft),
    isEditing: Boolean(subissue?.isEditing),
    showAssignControl: Boolean(subissue?.showAssignControl),
  };
};

/**
 * Build a draft subissue object.
 *
 * @return {Object} Draft subissue.
 */
const createDraftSubissue = () => ({
  id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: '',
  originalTitle: '',
  postParent: 0,
  isCompleted: false,
  assignees: [],
  status: [],
  isDraft: true,
  isEditing: true,
  showAssignControl: false,
});

/**
 * Resolve a user object by name or slug.
 *
 * @param {Array}  users      Available user objects.
 * @param {string} identifier User name or slug.
 * @return {Object|undefined} Matched user object.
 */
const findUserByNameOrSlug = (users, identifier) =>
  users.find(
    (userObject) =>
      userObject.name === identifier || userObject.slug === identifier,
  );

// ----- Main Component -----
const AlpacaIssue = ({
  issueId,
  isCreating,
  isOpen,
  onClose,
  onDelete,
  onAssigneesChange,
  onDeadlineChange,
  onStatusChange,
  onIssueTitleChange,
  onIssueCreated,
  onLabelsChange,
}) => {
  const {
    issueDetails,
    setIssueDetails,
    isLoadingDetails,
    error,
    refetchData,
  } = useIssueData(isCreating ? null : issueId, isOpen);

  const { allUsers, allUserObjects, userMap } = useUserManagement();
  const { loadingStates, setLoading } = useLoadingStates();
  const {
    isWatched,
    toggleWatch,
    loading: isWatchlistLoading,
  } = useWatchlist();

  const [assignees, setAssignees] = useState([]);
  const [allLabels, setAllLabels] = useState([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [allStatuses, setAllStatuses] = useState([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [subissues, setSubissues] = useState([]);
  const [commentRefreshKey] = useState(0);
  const [snackbars, setSnackbars] = useState([]);
  const snackbarTimersRef = useRef({});
  const snackbarCloseTimersRef = useRef({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isIssueWatched = !isCreating && issueId && isWatched(issueId);

  const handleWatchToggle = useCallback(
    (event) => {
      event.stopPropagation();
      if (isCreating || !issueId) {
        return;
      }
      toggleWatch(issueId);
    },
    [isCreating, issueId, toggleWatch],
  );

  const dismissSnackbar = useCallback((id) => {
    setSnackbars((prev) =>
      prev.map((snackbar) =>
        snackbar.id === id ? { ...snackbar, isClosing: true } : snackbar,
      ),
    );

    if (snackbarCloseTimersRef.current[id]) {
      clearTimeout(snackbarCloseTimersRef.current[id]);
    }

    snackbarCloseTimersRef.current[id] = setTimeout(() => {
      setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
      delete snackbarCloseTimersRef.current[id];
    }, 300);

    if (snackbarTimersRef.current[id]) {
      clearTimeout(snackbarTimersRef.current[id]);
      delete snackbarTimersRef.current[id];
    }
  }, []);

  const showNotification = useCallback(
    (message, type = 'error') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setSnackbars((prev) => [
        ...prev,
        { id, message, type, isClosing: false },
      ]);

      snackbarTimersRef.current[id] = setTimeout(
        () => dismissSnackbar(id),
        5000,
      );
    },
    [dismissSnackbar],
  );

  useEffect(
    () => () => {
      Object.values(snackbarTimersRef.current).forEach(clearTimeout);
      Object.values(snackbarCloseTimersRef.current).forEach(clearTimeout);
    },
    [],
  );

  // Fetch statuses
  useEffect(() => {
    fetchStatuses()
      .then(setAllStatuses)
      .catch(() =>
        showNotification(__('Failed to load statuses.', 'alpaca'), 'error'),
      );
  }, [showNotification]);

  useEffect(() => {
    fetchLabels()
      .then((labels) => setAllLabels(Array.isArray(labels) ? labels : []))
      .catch(() =>
        showNotification(__('Failed to load labels.', 'alpaca'), 'error'),
      );
  }, [showNotification]);

  const getAssigneeNamesFromIssue = useCallback(
    (details) => {
      if (
        !details ||
        !details.taxonomies ||
        !Array.isArray(details.taxonomies.assignee)
      ) {
        return [];
      }

      return details.taxonomies.assignee.map((term) => {
        const userObject = allUserObjects.find(
          (user) => user.slug === term.slug,
        );
        if (userObject) {
          return userObject.name;
        }

        return term.name;
      });
    },
    [allUserObjects],
  );

  const getLabelIdsFromIssue = useCallback((details) => {
    if (
      !details ||
      !details.taxonomies ||
      !Array.isArray(details.taxonomies.label)
    ) {
      return [];
    }

    return details.taxonomies.label
      .map((term) => Number(term.term_id))
      .filter((value) => value > 0);
  }, []);

  useEffect(() => {
    if (isOpen && isCreating) {
      setIsEditingTitle(true);
      setEditedTitle('');
      setAssignees([]);
      setSelectedLabelIds([]);
      setDeadline(null);
      setIsHighPriority(false);
      setSubissues([]);
    }

    // Cleanup: reset form state when modal closes in create mode
    if (!isOpen && isCreating) {
      setEditedTitle('');
      setAssignees([]);
      setSelectedLabelIds([]);
      setDeadline(null);
      setIsHighPriority(false);
      setIsEditingTitle(false);
      setSubissues([]);
    }
  }, [isOpen, isCreating]);

  // Initialize issue data
  useEffect(() => {
    if (isCreating || !issueDetails || !issueDetails.success) {
      return;
    }

    setDeadline(
      issueDetails.meta.alpaca_deadline || issueDetails.meta.deadline || null,
    );
    setIsHighPriority(
      issueDetails.meta.alpaca_high_priority === '1' ||
        issueDetails.meta.alpaca_high_priority === 1 ||
        issueDetails.meta.alpaca_high_priority === true,
    );
    setAssignees(getAssigneeNamesFromIssue(issueDetails));
    setSelectedLabelIds(getLabelIdsFromIssue(issueDetails));
    setEditedTitle(decodeEntities(issueDetails.post_data.post_content));
    setSubissues(
      Array.isArray(issueDetails.subissues)
        ? issueDetails.subissues.map((subissue) => normalizeSubissue(subissue))
        : [],
    );
  }, [
    getAssigneeNamesFromIssue,
    getLabelIdsFromIssue,
    isCreating,
    issueDetails,
  ]);

  useEffect(() => {
    if (isCreating || !issueId) {
      return;
    }

    const savedSubissues = subissues.filter(
      (subissue) => !subissue?.isDraft && subissue?.id,
    );
    const completedSubissues = savedSubissues.filter(
      (subissue) => subissue?.isCompleted,
    );

    wp.hooks.doAction('alpaca.subissueProgressChanged', {
      issueId,
      progress: {
        total: savedSubissues.length,
        completed: completedSubissues.length,
      },
    });
  }, [isCreating, issueId, subissues]);

  // Update assignees API call
  const updateAssignees = useCallback(
    async (updatedIssueId, slugs, newAssignees, added, removed) => {
      setLoading('assignees', true);
      try {
        await updateIssue(updatedIssueId, { taxonomies: { assignee: slugs } });

        if (typeof onAssigneesChange === 'function') {
          const selectedAssignees = allUserObjects.filter(
            (u) =>
              newAssignees.includes(u.name) || newAssignees.includes(u.slug),
          );
          onAssigneesChange(updatedIssueId, selectedAssignees);
        }

        added.forEach((name) => {
          const user = findUserByNameOrSlug(allUserObjects, name);
          wp.hooks.doAction(
            'alpaca.assigneeChanged',
            issueDetails,
            user,
            true,
            name,
          );
        });
        removed.forEach((name) => {
          const user = findUserByNameOrSlug(allUserObjects, name);
          wp.hooks.doAction(
            'alpaca.assigneeChanged',
            issueDetails,
            user,
            false,
            name,
          );
        });
      } catch (err) {
        console.error(err);
        showNotification(__('Failed to update assignees.', 'alpaca'), 'error');
      } finally {
        setLoading('assignees', false);
      }
    },
    [
      allUserObjects,
      issueDetails,
      onAssigneesChange,
      setLoading,
      showNotification,
    ],
  );

  const handlePriorityChange = useCallback(
    async (newValue) => {
      setIsHighPriority(newValue);

      if (isCreating) {
        return;
      }

      setLoading('priority', true);

      try {
        await updateIssue(issueId, {
          meta: {
            // eslint-disable-next-line camelcase
            alpaca_high_priority: newValue ? 1 : 0,
          },
        });

        wp.hooks.doAction('alpaca.issueUpdated', issueId);
        wp.hooks.doAction('alpaca.priorityUpdated', {
          issueId,
          isHighPriority: newValue,
          issue: issueDetails,
        });
      } catch (err) {
        console.error(err);
        showNotification(__('Failed to update priority.', 'alpaca'), 'error');
        setIsHighPriority(!newValue);
      } finally {
        setLoading('priority', false);
      }
    },
    [isCreating, issueId, issueDetails, setLoading, showNotification],
  );

  // Event handlers
  const handleAssigneeChange = useCallback(
    (newAssignees) => {
      setAssignees(newAssignees);

      if (isCreating) {
        return;
      }

      const oldAssignees = [...assignees];
      const { added, removed } = processAssigneeChanges(
        oldAssignees,
        newAssignees,
      );

      const slugs = newAssignees.map((a) => userMap[a] || a);
      updateAssignees(issueId, slugs, newAssignees, added, removed);
    },
    [isCreating, assignees, issueId, updateAssignees, userMap],
  );

  const handleLabelChange = useCallback(
    async (newSelectedIds) => {
      const normalizedIds = newSelectedIds
        .map((termId) => Number(termId))
        .filter((termId) => termId > 0);
      setSelectedLabelIds(normalizedIds);

      if (isCreating) {
        return;
      }

      setLoading('labels', true);
      try {
        await updateIssue(issueId, { taxonomies: { label: normalizedIds } });
        if (typeof onLabelsChange === 'function') {
          const selectedLabels = allLabels.filter((label) =>
            normalizedIds.includes(Number(label.term_id)),
          );
          onLabelsChange(issueId, selectedLabels);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        showNotification(__('Failed to update labels.', 'alpaca'), 'error');
      } finally {
        setLoading('labels', false);
      }
    },
    [
      allLabels,
      isCreating,
      issueId,
      onLabelsChange,
      setLoading,
      showNotification,
    ],
  );

  // Deadline handlers
  const handleDeadlineChange = useCallback(
    (newDate) => {
      setDeadline(newDate);

      if (isCreating) {
        return;
      }

      const oldDeadline = deadline;
      setLoading('deadline', true);
      updateIssue(issueId, { meta: { deadline: newDate } })
        .then(() => {
          onDeadlineChange?.(issueId, newDate);

          if (newDate !== oldDeadline) {
            let changeType = 'changed';
            if (!oldDeadline) {
              changeType = 'added';
            } else if (!newDate) {
              changeType = 'deleted';
            }

            wp.hooks.doAction('alpaca.deadlineUpdated', {
              issueId,
              changeType,
              newDeadline: newDate,
              oldDeadline,
              issue: issueDetails,
            });
          }
        })
        .finally(() => setLoading('deadline', false));
    },
    [isCreating, issueId, onDeadlineChange, setLoading, deadline, issueDetails],
  );

  const handleDeadlineClear = useCallback(() => {
    handleDeadlineChange(null);
  }, [handleDeadlineChange]);

  // Status progression
  const handleProgressIssue = useCallback(async () => {
    if (!issueDetails || !allStatuses.length) return;
    const currentStatus = issueDetails.taxonomies?.status?.[0];
    if (!currentStatus) return;

    const currentIndex = allStatuses.findIndex(
      (s) => s.term_id === currentStatus.term_id,
    );
    if (currentIndex === -1 || currentIndex === allStatuses.length - 1) return;

    const nextStatus = allStatuses[currentIndex + 1];
    setLoading('status', true);
    try {
      await updateIssue(issueId, {
        taxonomies: { status: [nextStatus.term_id] },
      });
      setIssueDetails((prev) => ({
        ...prev,
        taxonomies: { ...prev.taxonomies, status: [nextStatus] },
      }));
      onStatusChange?.(issueId, nextStatus, currentStatus, issueDetails);
    } catch (err) {
      showNotification(
        __('Failed to progress issue status.', 'alpaca'),
        'error',
      );
    } finally {
      setLoading('status', false);
    }
  }, [
    allStatuses,
    issueDetails,
    issueId,
    onStatusChange,
    setIssueDetails,
    setLoading,
    showNotification,
  ]);

  // Title editing
  const handleTitleSave = useCallback(async () => {
    if (isCreating) {
      if (editedTitle && editedTitle.trim()) {
        setIsEditingTitle(false);
      }
      return;
    }

    if (editedTitle === decodeEntities(issueDetails.post_data.post_content)) {
      setIsEditingTitle(false);
      return;
    }
    setLoading('title', true);
    try {
      await updateIssue(issueId, { content: editedTitle, title: editedTitle });
      setIssueDetails((prev) => ({
        ...prev,
        post_data: {
          ...prev.post_data,
          post_content: editedTitle,
          post_title: editedTitle,
        },
      }));
      onIssueTitleChange?.(issueId, editedTitle);
    } catch {
      showNotification(__('Failed to update issue title.', 'alpaca'), 'error');
    } finally {
      setLoading('title', false);
      setIsEditingTitle(false);
    }
  }, [
    isCreating,
    editedTitle,
    issueDetails,
    issueId,
    onIssueTitleChange,
    setIssueDetails,
    setLoading,
    showNotification,
  ]);

  const handleTitleCancel = useCallback(() => {
    if (isCreating) {
      onClose();
      return;
    }

    setIsEditingTitle(false);
    if (issueDetails?.success) {
      setEditedTitle(decodeEntities(issueDetails.post_data.post_content));
    }
  }, [issueDetails, isCreating, onClose]);

  const handleCreateIssue = useCallback(async () => {
    if (!isCreating || !editedTitle || !editedTitle.trim()) {
      return;
    }

    setLoading('title', true);
    try {
      const server = {};
      if (typeof alpacaDataDump !== 'undefined' && alpacaDataDump.env) {
        try {
          const loadedServer = JSON.parse(atob(alpacaDataDump.env));
          Object.assign(server, loadedServer);
        } catch (e) {
          // Ignore parse errors
        }
      }

      const payload = {
        userinput: {
          feedback: editedTitle,
          includeContext: false, // Board issues don't need browser context
          isHighPriority,
        },
        client:
          typeof alpacaDataDump !== 'undefined' ? alpacaDataDump.device : {},
        errors: [],
        screenshot: '',
        ...server,
      };

      const response = await createIssue(payload);

      if (response && response.issue) {
        const newIssueId = response.issue.id;
        let createdIssueLabels = [];

        if (deadline) {
          try {
            await updateIssue(newIssueId, { meta: { deadline } });
          } catch (err) {
            console.error('Failed to set deadline:', err);
          }
        }

        if (assignees && assignees.length > 0) {
          try {
            const slugs = assignees.map((a) => userMap[a] || a);
            await updateAssignees(newIssueId, slugs, assignees, assignees, []);
          } catch (err) {
            console.error('Failed to set assignees:', err);
          }
        }

        if (selectedLabelIds.length > 0) {
          try {
            await updateIssue(newIssueId, {
              taxonomies: { label: selectedLabelIds },
            });
            createdIssueLabels = allLabels.filter((label) =>
              selectedLabelIds.includes(Number(label.term_id)),
            );
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to set labels:', err);
            showNotification(
              __('Issue created, but labels could not be saved.', 'alpaca'),
              'error',
            );
          }
        }

        wp.hooks.doAction(
          'alpaca.issueSubmitted',
          response.issue,
          response.statusId,
          isHighPriority,
          {
            feedback: editedTitle,
            screenshotUrl: '',
            skipBoardInsert: true,
          },
        );

        if (onIssueCreated) {
          onIssueCreated({
            id: newIssueId,
            slug: response.issue.slug || response.issue.post_name || '',
            title: editedTitle,
            assignees: assignees || [],
            labels: createdIssueLabels,
            deadline: deadline || null,
            isHighPriority,
          });
        }

        setEditedTitle('');
        setAssignees([]);
        setSelectedLabelIds([]);
        setDeadline(null);
        setIsHighPriority(false);
        setLoading('title', false);
      }
    } catch (err) {
      console.error(err);
      showNotification(__('Failed to create issue.', 'alpaca'), 'error');
      setLoading('title', false);
    }
  }, [
    isCreating,
    editedTitle,
    isHighPriority,
    setLoading,
    showNotification,
    onIssueCreated,
    deadline,
    assignees,
    allLabels,
    userMap,
    updateAssignees,
    selectedLabelIds,
  ]);

  const persistDraftSubissue = useCallback(
    async (subissueId, options = {}) => {
      const { addNewDraftAfterSave = false } = options;
      const draftSubissue = subissues.find(
        (item) => item.id === subissueId && item.isDraft,
      );
      if (!draftSubissue) {
        return null;
      }

      const trimmedTitle = draftSubissue.title.trim();
      if (!trimmedTitle) {
        return null;
      }

      setLoading(`subissue-${subissueId}`, true);
      try {
        const response = await createSubissue({
          // eslint-disable-next-line camelcase
          parent_id: issueId,
          content: trimmedTitle,
        });
        const createdSubissue = normalizeSubissue(response?.subissue || {});

        setSubissues((prev) => {
          const updated = prev.map((item) =>
            item.id === subissueId
              ? {
                  ...createdSubissue,
                  isDraft: false,
                  isEditing: false,
                }
              : item,
          );

          if (addNewDraftAfterSave) {
            updated.push(createDraftSubissue());
          }

          return updated;
        });

        wp.hooks.doAction(
          'alpaca.subissueCreated',
          issueDetails,
          createdSubissue,
        );

        return createdSubissue;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error creating subissue:', err);
        showNotification(__('Failed to create subissue.', 'alpaca'), 'error');
        return null;
      } finally {
        setLoading(`subissue-${subissueId}`, false);
      }
    },
    [issueDetails, issueId, setLoading, showNotification, subissues],
  );

  const handleAddSubissueDraft = useCallback(async () => {
    const existingDraft = subissues.find((subissue) => subissue.isDraft);

    if (!existingDraft) {
      setSubissues((prev) => [...prev, createDraftSubissue()]);
      return;
    }

    if (loadingStates[`subissue-${existingDraft.id}`]) {
      return;
    }

    if (!existingDraft.title.trim()) {
      setSubissues((prev) =>
        prev.map((item) =>
          item.id === existingDraft.id ? { ...item, isEditing: true } : item,
        ),
      );
      return;
    }

    await persistDraftSubissue(existingDraft.id, {
      addNewDraftAfterSave: true,
    });
  }, [loadingStates, persistDraftSubissue, subissues]);

  const handleSubissueDraftChange = useCallback((subissueId, newTitle) => {
    setSubissues((prev) =>
      prev.map((subissue) =>
        subissue.id === subissueId
          ? { ...subissue, title: newTitle }
          : subissue,
      ),
    );
  }, []);

  const handleSubissueTitleSave = useCallback(
    async (subissueId) => {
      const subissue = subissues.find((item) => item.id === subissueId);
      if (!subissue) {
        return;
      }

      const previousTitle =
        typeof subissue.originalTitle === 'string'
          ? subissue.originalTitle
          : subissue.title;
      const trimmedTitle = subissue.title.trim();

      if (!trimmedTitle) {
        if (subissue.isDraft) {
          setSubissues((prev) => prev.filter((item) => item.id !== subissueId));
        } else {
          setSubissues((prev) =>
            prev.map((item) =>
              item.id === subissueId
                ? {
                    ...item,
                    title: item.originalTitle || '',
                    isEditing: false,
                  }
                : item,
            ),
          );
        }
        return;
      }

      if (subissue.isDraft) {
        await persistDraftSubissue(subissueId);
        return;
      }

      const oldTitle =
        typeof previousTitle === 'string' ? previousTitle.trim() : '';
      setLoading(`subissue-${subissueId}`, true);
      try {
        await updateIssue(subissue.id, {
          title: trimmedTitle,
          content: trimmedTitle,
        });

        setSubissues((prev) =>
          prev.map((item) =>
            item.id === subissueId
              ? {
                  ...item,
                  title: trimmedTitle,
                  originalTitle: trimmedTitle,
                  isEditing: false,
                }
              : item,
          ),
        );

        if (oldTitle !== trimmedTitle) {
          wp.hooks.doAction(
            'alpaca.subissueTitleChanged',
            issueDetails,
            { ...subissue, title: trimmedTitle },
            oldTitle,
            trimmedTitle,
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error updating subissue title:', err);
        showNotification(
          __('Failed to update subissue title.', 'alpaca'),
          'error',
        );
      } finally {
        setLoading(`subissue-${subissueId}`, false);
      }
    },
    [
      issueDetails,
      persistDraftSubissue,
      setLoading,
      showNotification,
      subissues,
    ],
  );

  const handleSubissueTitleCancel = useCallback((subissueId) => {
    setSubissues((prev) => {
      const subissue = prev.find((item) => item.id === subissueId);
      if (!subissue) {
        return prev;
      }
      if (subissue.isDraft) {
        return prev.filter((item) => item.id !== subissueId);
      }
      return prev.map((item) =>
        item.id === subissueId
          ? {
              ...item,
              title: item.originalTitle || '',
              isEditing: false,
            }
          : item,
      );
    });
  }, []);

  const handleSubissueToggleCompleted = useCallback(
    async (subissueId, isCompleted) => {
      const subissue = subissues.find((item) => item.id === subissueId);
      if (!subissue || subissue.isDraft) {
        return;
      }

      setSubissues((prev) =>
        prev.map((item) =>
          item.id === subissueId ? { ...item, isCompleted } : item,
        ),
      );
      setLoading(`subissue-complete-${subissueId}`, true);
      try {
        await updateIssue(subissue.id, {
          meta: {
            // eslint-disable-next-line camelcase
            subissue_completed: isCompleted ? 1 : 0,
          },
        });
        wp.hooks.doAction(
          'alpaca.subissueCompletionToggled',
          issueDetails,
          { ...subissue, isCompleted },
          isCompleted,
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error updating subissue completion:', err);
        setSubissues((prev) =>
          prev.map((item) =>
            item.id === subissueId
              ? { ...item, isCompleted: !isCompleted }
              : item,
          ),
        );
        showNotification(
          __('Failed to update subissue completion.', 'alpaca'),
          'error',
        );
      } finally {
        setLoading(`subissue-complete-${subissueId}`, false);
      }
    },
    [issueDetails, setLoading, showNotification, subissues],
  );

  const handleSubissueAssigneeChange = useCallback(
    async (subissueId, newAssignees) => {
      const subissue = subissues.find((item) => item.id === subissueId);
      if (!subissue || subissue.isDraft) {
        return;
      }

      const oldAssignees = subissue.assignees.map((assignee) => assignee.name);
      const { added, removed } = processAssigneeChanges(
        oldAssignees,
        newAssignees,
      );
      const previousAssignees = (
        Array.isArray(subissue.assignees) ? subissue.assignees : []
      ).map((assignee) => ({ ...assignee }));

      const normalizedAssignees = newAssignees
        .map((nameOrSlug) =>
          allUserObjects.find(
            (userObject) =>
              userObject.name === nameOrSlug || userObject.slug === nameOrSlug,
          ),
        )
        .filter(Boolean)
        .map((userObject) => ({
          id: userObject.id,
          name: userObject.name,
          slug: userObject.slug,
        }));

      setSubissues((prev) =>
        prev.map((item) =>
          item.id === subissueId
            ? { ...item, assignees: normalizedAssignees }
            : item,
        ),
      );

      const slugs = newAssignees.map((name) => userMap[name] || name);
      setLoading(`subissue-assignees-${subissueId}`, true);
      try {
        await updateIssue(subissue.id, { taxonomies: { assignee: slugs } });
        added.forEach((name) => {
          const user = allUserObjects.find((u) => u.name === name);
          wp.hooks.doAction(
            'alpaca.subissueAssigneeChanged',
            issueDetails,
            subissue,
            user,
            true,
            name,
          );
        });
        removed.forEach((name) => {
          const user = allUserObjects.find((u) => u.name === name);
          wp.hooks.doAction(
            'alpaca.subissueAssigneeChanged',
            issueDetails,
            subissue,
            user,
            false,
            name,
          );
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error updating subissue assignees:', err);
        setSubissues((prev) =>
          prev.map((item) =>
            item.id === subissueId
              ? { ...item, assignees: previousAssignees }
              : item,
          ),
        );
        showNotification(
          __('Failed to update subissue assignees.', 'alpaca'),
          'error',
        );
      } finally {
        setLoading(`subissue-assignees-${subissueId}`, false);
      }
    },
    [
      allUserObjects,
      issueDetails,
      setLoading,
      showNotification,
      subissues,
      userMap,
    ],
  );

  const handleSubissuePromote = useCallback(
    async (subissueId) => {
      const subissue = subissues.find((item) => item.id === subissueId);
      if (!subissue || subissue.isDraft) {
        return;
      }

      const parentStatusId = issueDetails?.taxonomies?.status?.[0]?.term_id;
      const payload = {
        // eslint-disable-next-line camelcase
        post_parent: 0,
      };

      if (parentStatusId) {
        payload.taxonomies = {
          status: [parentStatusId],
        };
      }

      setLoading(`subissue-promote-${subissueId}`, true);
      try {
        const optimisticSlug = subissue.slug || '';
        const promotedAssignees = (subissue.assignees || [])
          .map((assignee) =>
            allUserObjects.find(
              (userObject) =>
                userObject.id === assignee.id ||
                userObject.slug === assignee.slug ||
                userObject.name === assignee.name,
            ),
          )
          .filter(Boolean)
          .map((userObject) => ({
            id: userObject.id,
            slug: userObject.slug,
            name: userObject.name,
            displayName: userObject.name,
            avatar: userObject.avatar,
          }));

        if (parentStatusId) {
          wp.hooks.doAction(
            'alpaca.issueInserted',
            {
              id: subissue.id,
              slug: optimisticSlug,
              title: subissue.title,
              // eslint-disable-next-line camelcase
              post_date: new Date().toISOString(),
              assignees: promotedAssignees,
              comment_count: 0,
              meta: {},
            },
            parentStatusId,
          );
        }

        const promoteResponse = await updateIssue(subissue.id, payload);
        const promotedSlug = promoteResponse?.issue?.slug || optimisticSlug;
        setSubissues((prev) => prev.filter((item) => item.id !== subissueId));

        if (parentStatusId && promotedSlug && promotedSlug !== optimisticSlug) {
          wp.hooks.doAction('alpaca.issueDeleted', subissue.id);
          wp.hooks.doAction(
            'alpaca.issueInserted',
            {
              id: subissue.id,
              slug: promotedSlug,
              title: subissue.title,
              // eslint-disable-next-line camelcase
              post_date: new Date().toISOString(),
              assignees: promotedAssignees,
              comment_count: 0,
              meta: {},
            },
            parentStatusId,
          );
        }

        wp.hooks.doAction('alpaca.subissuePromoted', {
          parentIssue: {
            id: issueDetails?.post_id || issueId,
            slug: issueDetails?.post_data?.post_name || '',
            title:
              issueDetails?.post_data?.post_title ||
              issueDetails?.post_data?.post_content ||
              __('Unknown issue', 'alpaca'),
          },
          promotedIssue: {
            id: subissue.id,
            slug: promotedSlug,
            title: subissue.title,
          },
          subissue,
        });
      } catch (err) {
        wp.hooks.doAction('alpaca.issueDeleted', subissue.id);
        // eslint-disable-next-line no-console
        console.error('Error promoting subissue:', err);
        showNotification(__('Failed to promote subissue.', 'alpaca'), 'error');
      } finally {
        setLoading(`subissue-promote-${subissueId}`, false);
      }
    },
    [
      allUserObjects,
      issueDetails,
      issueId,
      setLoading,
      showNotification,
      subissues,
    ],
  );

  const handleSubissueDelete = useCallback(
    async (subissueId) => {
      const subissue = subissues.find((item) => item.id === subissueId);
      if (!subissue) {
        return;
      }
      if (subissue.isDraft) {
        setSubissues((prev) => prev.filter((item) => item.id !== subissueId));
        return;
      }

      setLoading(`subissue-delete-${subissueId}`, true);
      try {
        await deleteIssue(subissue.id);
        setSubissues((prev) => prev.filter((item) => item.id !== subissueId));
        wp.hooks.doAction('alpaca.subissueDeleted', issueDetails, subissue);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error deleting subissue:', err);
        showNotification(__('Failed to delete subissue.', 'alpaca'), 'error');
      } finally {
        setLoading(`subissue-delete-${subissueId}`, false);
      }
    },
    [issueDetails, setLoading, showNotification, subissues],
  );

  // Memoized stable props
  const stableUsers = useMemo(() => allUsers, [allUsers]);
  const stableAssignees = useMemo(() => assignees, [assignees]);
  const stableLabels = useMemo(() => allLabels, [allLabels]);
  const stableSelectedLabelIds = useMemo(
    () => selectedLabelIds,
    [selectedLabelIds],
  );
  const stableIsLoading = useMemo(
    () => loadingStates.assignees,
    [loadingStates.assignees],
  );
  const isSubissueAddDisabled = useMemo(
    () =>
      subissues.some(
        (subissue) =>
          subissue.isDraft && loadingStates[`subissue-${subissue.id}`],
      ),
    [loadingStates, subissues],
  );
  const stableIsLabelLoading = useMemo(
    () => loadingStates.labels,
    [loadingStates.labels],
  );
  const currentStatus = issueDetails?.taxonomies?.status?.[0];
  const isLastStatus = useMemo(() => {
    if (!currentStatus || !allStatuses.length) return true;
    return (
      allStatuses.findIndex((s) => s.term_id === currentStatus.term_id) ===
      allStatuses.length - 1
    );
  }, [currentStatus, allStatuses]);

  if (!isOpen) return null;

  return (
    <>
      <Modal
        size="fill"
        onRequestClose={onClose}
        className="alpaca-details-modal alpaca-side-panel"
        headerActions={
          !isCreating && (
            <Dropdown
              popoverProps={{ placement: 'bottom-end' }}
              renderToggle={({ onToggle }) => (
                <Tooltip text={__('Options', 'alpaca')}>
                  <Button
                    className="alpaca-modal-options-button components-button has-icon"
                    onClick={onToggle}
                  >
                    <span className="dashicons dashicons-ellipsis"></span>
                  </Button>
                </Tooltip>
              )}
              renderContent={() => (
                <MenuGroup>
                  {!isLastStatus && (
                    <MenuItem
                      icon="arrow-right-alt"
                      iconPosition="left"
                      onClick={handleProgressIssue}
                      disabled={loadingStates.status}
                    >
                      {__('Progress Issue', 'alpaca')}
                    </MenuItem>
                  )}
                  <MenuItem
                    icon="trash"
                    iconPosition="left"
                    isDestructive
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    {__('Trash Issue', 'alpaca')}
                  </MenuItem>
                </MenuGroup>
              )}
            />
          )
        }
      >
        {error && (
          <div className="notice notice-error">
            <p>{error}</p>
            <Button onClick={refetchData}>{__('Retry', 'alpaca')}</Button>
          </div>
        )}

        {isLoadingDetails && !isCreating && <p>{__('Loading…', 'alpaca')}</p>}
        {((!isLoadingDetails && issueDetails && issueDetails.success) ||
          isCreating) && (
          <div className="alpaca-issue-details">
            <div className="alpaca-issue-main column">
              <div className="alpaca-issue-title-row">
                <EditableTitle
                  isEditing={isEditingTitle}
                  title={editedTitle}
                  onEditStart={() => setIsEditingTitle(true)}
                  onChange={setEditedTitle}
                  onSave={handleTitleSave}
                  onCancel={handleTitleCancel}
                  placeholder={
                    isCreating
                      ? __('Enter a title to create issue…', 'alpaca')
                      : ''
                  }
                />
                {!isCreating && (
                  <StarControl
                    className="alpaca-issue-watch-indicator"
                    watched={Boolean(isIssueWatched)}
                    onToggle={handleWatchToggle}
                    disabled={isWatchlistLoading}
                  />
                )}
              </div>

              {!isCreating && (
                <div className="alpaca-issue-meta flexalign">
                  Created by <User user={issueDetails.post_data.post_author} />{' '}
                  <Time
                    value={issueDetails.post_data.post_date}
                    type="relative"
                  />
                </div>
              )}

              <table className="alpaca-issue-details">
                <tbody>
                  <tr id="status">
                    <th scope="row">{__('Status', 'alpaca')}</th>
                    <td>
                      {isCreating
                        ? (() => {
                            if (!allStatuses.length)
                              return __('Unknown', 'alpaca');
                            const sorted = [...allStatuses].sort(
                              (a, b) =>
                                (a.term_score || 0) - (b.term_score || 0),
                            );
                            return sorted[0]?.name || __('Unknown', 'alpaca');
                          })()
                        : currentStatus?.name || __('Unknown', 'alpaca')}
                    </td>
                  </tr>

                  <PriorityRow
                    isHighPriority={isHighPriority}
                    onChange={handlePriorityChange}
                    isLoading={loadingStates.priority}
                  />

                  <DeadlineRow
                    deadline={deadline}
                    onChange={handleDeadlineChange}
                    onClear={handleDeadlineClear}
                    isLoading={loadingStates.deadline}
                  />

                  <AssigneeRow
                    assignees={stableAssignees}
                    allUsers={stableUsers}
                    onChange={handleAssigneeChange}
                    isLoading={stableIsLoading}
                  />

                  <LabelsRow
                    labels={stableLabels}
                    selectedIds={stableSelectedLabelIds}
                    onChange={handleLabelChange}
                    isLoading={stableIsLabelLoading}
                  />

                  {!isCreating && (
                    <tr id="subissues">
                      <th scope="row">{__('Checklist', 'alpaca')}</th>
                      <td>
                        <div className="alpaca-subissues">
                          <ul className="alpaca-subissues-list">
                            {subissues.map((subissue) => {
                              const subissueAssignees = (
                                Array.isArray(subissue.assignees)
                                  ? subissue.assignees
                                  : []
                              ).map((assignee) => assignee.name);
                              const isCompleteLoading =
                                loadingStates[
                                  `subissue-complete-${subissue.id}`
                                ];
                              const isDeleteLoading =
                                loadingStates[`subissue-delete-${subissue.id}`];
                              const isPromoteLoading =
                                loadingStates[
                                  `subissue-promote-${subissue.id}`
                                ];
                              const isSaveLoading =
                                loadingStates[`subissue-${subissue.id}`];
                              const isAssigneeLoading =
                                loadingStates[
                                  `subissue-assignees-${subissue.id}`
                                ];

                              return (
                                <li
                                  key={subissue.id}
                                  className={`alpaca-subissues-item ${
                                    subissue.isCompleted ? 'is-completed' : ''
                                  }`}
                                >
                                  <div className="alpaca-subissues-main">
                                    <CheckboxControl
                                      label=""
                                      hideLabelFromVision
                                      checked={subissue.isCompleted}
                                      onChange={(isChecked) =>
                                        handleSubissueToggleCompleted(
                                          subissue.id,
                                          isChecked,
                                        )
                                      }
                                      disabled={
                                        subissue.isDraft || isCompleteLoading
                                      }
                                    />
                                    <SubissueTitleField
                                      value={subissue.title}
                                      placeholder={__('Enter title…', 'alpaca')}
                                      autoFocusOnMount={
                                        subissue.isDraft && subissue.isEditing
                                      }
                                      onChange={(newValue) =>
                                        handleSubissueDraftChange(
                                          subissue.id,
                                          newValue,
                                        )
                                      }
                                      onFocus={() =>
                                        setSubissues((prev) =>
                                          prev.map((item) =>
                                            item.id === subissue.id
                                              ? { ...item, isEditing: true }
                                              : item,
                                          ),
                                        )
                                      }
                                      onBlur={() =>
                                        handleSubissueTitleSave(subissue.id)
                                      }
                                      onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                          event.preventDefault();
                                          handleSubissueTitleSave(subissue.id);
                                        } else if (event.key === 'Escape') {
                                          event.preventDefault();
                                          handleSubissueTitleCancel(
                                            subissue.id,
                                          );
                                        }
                                      }}
                                      disabled={isSaveLoading}
                                    />
                                    <SubissueAssigneeControl
                                      assignees={subissueAssignees}
                                      allUsers={stableUsers}
                                      allUserObjects={allUserObjects}
                                      onChange={(newAssignees) =>
                                        handleSubissueAssigneeChange(
                                          subissue.id,
                                          newAssignees,
                                        )
                                      }
                                      isDraft={subissue.isDraft}
                                      isLoading={isAssigneeLoading}
                                    />
                                    <Button
                                      className="alpaca-subissues-promote"
                                      icon={
                                        <span className="alpaca-icon-promote"></span>
                                      }
                                      label={__('Promote', 'alpaca')}
                                      showTooltip
                                      tooltipPosition="top"
                                      onMouseDown={(event) =>
                                        event.preventDefault()
                                      }
                                      onClick={() =>
                                        handleSubissuePromote(subissue.id)
                                      }
                                      disabled={
                                        subissue.isDraft || isPromoteLoading
                                      }
                                    />
                                    <Button
                                      className="alpaca-subissues-delete"
                                      icon="trash"
                                      label={__('Delete', 'alpaca')}
                                      showTooltip
                                      tooltipPosition="top"
                                      isDestructive
                                      onMouseDown={(event) =>
                                        event.preventDefault()
                                      }
                                      onClick={() =>
                                        handleSubissueDelete(subissue.id)
                                      }
                                      disabled={isDeleteLoading}
                                    />
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                          <Button
                            variant="secondary"
                            className="alpaca-subissues-add-button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={handleAddSubissueDraft}
                            disabled={isSubissueAddDisabled}
                          >
                            {__('Add New', 'alpaca')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {wp.hooks.applyFilters('alpaca.issue.abovetabs', null, {
                issueId,
                meta: issueDetails?.meta || {},
              })}

              {!isCreating && (
                <TabPanel
                  className="alpaca-issue-tabs"
                  initialTabName="comments"
                  tabs={getTabsConfig(issueDetails)}
                >
                  {(tab) => {
                    if (tab.name === 'errors') {
                      return (
                        <ErrorsTab
                          errorsJson={
                            issueDetails.meta.alpaca_errors ||
                            issueDetails.meta.errors
                          }
                        />
                      );
                    }
                    return (
                      <TabContent
                        tab={tab}
                        issueDetails={issueDetails}
                        issueId={issueId}
                        commentRefreshKey={commentRefreshKey}
                        showNotification={showNotification}
                      />
                    );
                  }}
                </TabPanel>
              )}
            </div>
          </div>
        )}

        {/* Create Issue Footer - only shown in create mode */}
        {isCreating && (
          <div
            className="alpaca-modal-footer"
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <Button
              variant="primary"
              onClick={handleCreateIssue}
              disabled={
                !editedTitle || !editedTitle.trim() || loadingStates.title
              }
            >
              {loadingStates.title
                ? __('Creating…', 'alpaca')
                : __('Create Issue', 'alpaca')}
            </Button>
          </div>
        )}

        {!isCreating &&
          !isLoadingDetails &&
          (!issueDetails || !issueDetails.success) && (
            <p>
              {issueDetails?.message ||
                __('Could not load issue details.', 'alpaca')}
            </p>
          )}

        {snackbars.length > 0 && (
          <div className="alpaca-snackbar-stack">
            {snackbars.map((snackbar) => (
              <Snackbar
                key={snackbar.id}
                className={`alpaca-snackbar alpaca-snackbar-${
                  snackbar.type || 'error'
                } ${snackbar.isClosing ? 'is-closing' : ''}`}
                onClose={() => dismissSnackbar(snackbar.id)}
              >
                <div className="alpaca-snackbar-content">
                  <span>{snackbar.message}</span>
                </div>
              </Snackbar>
            ))}
          </div>
        )}
      </Modal>

      {showDeleteConfirm && (
        <div className="alpaca-confirm-overlay">
          <div className="alpaca-confirm-box">
            <h2>{__('Delete Issue?', 'alpaca')}</h2>
            <p>{__('Are you sure you want to trash this issue?', 'alpaca')}</p>

            <div>
              <Button
                isPrimary
                isDestructive
                onClick={() => {
                  onDelete(issueId);
                  setShowDeleteConfirm(false);
                }}
              >
                {__('Delete', 'alpaca')}
              </Button>

              <Button onClick={() => setShowDeleteConfirm(false)}>
                {__('Cancel', 'alpaca')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

AlpacaIssue.propTypes = {
  issueId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAssigneesChange: PropTypes.func.isRequired,
  onDeadlineChange: PropTypes.func.isRequired,
  /**
   * Called when the issue status changes.
   *
   * @param {number} issueId       Issue ID.
   * @param {Object} nextStatus    New status term object.
   * @param {Object} currentStatus Previous status term object.
   * @param {Object} issueDetails  Full issue details.
   */
  onStatusChange: PropTypes.func.isRequired,
  onIssueTitleChange: PropTypes.func.isRequired,
  onLabelsChange: PropTypes.func,
  isCreating: PropTypes.bool,
  onIssueCreated: PropTypes.func,
};

export default AlpacaIssue;
