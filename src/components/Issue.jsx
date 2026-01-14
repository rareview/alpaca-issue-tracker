import PropTypes from 'prop-types';

import { getTabsConfig } from '../utils/tabsConfig';
import useIssueData from '../hooks/useIssueData';
import useUserManagement from '../hooks/useUserManagement';
import useLoadingStates from '../hooks/useLoadingStates';

import { processAssigneeChanges } from '../utils/assigneeUtils';
import { fetchStatuses, updateIssue } from '../services/issueApi';

import AssigneeSelector from './issue/AssigneeSelector';
import DeadlineControl from './issue/DeadlineControl';
import TabContent from './issue/TabContent';
import Lightbox from './issue/Lightbox';
import ErrorsTab from './issue/ErrorsTab';
import AttachmentRow from './issue/AttachmentRow';
import User from './User';
import Time from './Time';

/* THEN access WordPress globals */
const { useState, useEffect, useRef, useMemo, useCallback, memo } = wp.element;

const {
  Modal,
  TabPanel,
  Button,
  Tooltip,
  Dropdown,
  MenuGroup,
  MenuItem,
  ToggleControl,
} = wp.components;

const { decodeEntities } = wp.htmlEntities;

// ----- Memoized rows -----
const PriorityRow = memo(
  ({ isHighPriority, onChange, isLoading }) => (
    <tr>
      <th scope="row">Priority</th>
      <td className="flexalign">
        <ToggleControl
          label="High Priority"
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
    <tr>
      <th scope="row">Assignees</th>
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

const DeadlineRow = memo(
  ({ deadline, onChange, onClear, isLoading }) => (
    <tr>
      <th scope="row">Due Date</th>
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
  ({ isEditing, title, onEditStart, onChange, onSave, onCancel }) => {
    const inputRef = useRef(null);

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.textContent = title;
        inputRef.current.focus();
        const range = document.createRange();
        const sel = inputRef.current.ownerDocument.defaultView.getSelection();
        range.selectNodeContents(inputRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, [isEditing, title]);

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
      >
        {title}
      </h3>
    );
  },
  (prev, next) =>
    prev.isEditing === next.isEditing && prev.title === next.title,
);

// ----- Main Component -----
const AlpacaIssue = ({
  issueId,
  isOpen,
  onClose,
  onDelete,
  onAssigneesChange,
  onDeadlineChange,
  onStatusChange,
  onIssueTitleChange,
}) => {
  const {
    issueDetails,
    setIssueDetails,
    isLoadingDetails,
    error,
    refetchData,
  } = useIssueData(issueId, isOpen);

  const { allUsers, allUserObjects, userMap } = useUserManagement();
  const { loadingStates, setLoading } = useLoadingStates();

  const [assignees, setAssignees] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [allStatuses, setAllStatuses] = useState([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [commentRefreshKey] = useState(0);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteScreenshotConfirm, setShowDeleteScreenshotConfirm] =
    useState(false);

  const showNotification = useCallback((message, type = 'error') => {
    setNotificationMessage({ message, type });
    setTimeout(() => setNotificationMessage(null), 5000);
  }, []);

  // Fetch statuses
  useEffect(() => {
    fetchStatuses()
      .then(setAllStatuses)
      .catch(() => showNotification('Failed to load statuses.', 'error'));
  }, [showNotification]);

  // Initialize issue data
  useEffect(() => {
    if (issueDetails && issueDetails.success && allUserObjects.length > 0) {
      setDeadline(issueDetails.meta.deadline || null);
      setIsHighPriority(
        issueDetails.meta.alpaca_high_priority === '1' ||
          issueDetails.meta.alpaca_high_priority === 1 ||
          issueDetails.meta.alpaca_high_priority === true,
      );

      // Assignees
      const assigneeNames =
        issueDetails.taxonomies?.assignee?.map((t) => {
          const userObj = allUserObjects.find((u) => u.slug === t.slug);
          return userObj ? userObj.name : t.name;
        }) || [];
      setAssignees(assigneeNames);

      // Title
      setEditedTitle(decodeEntities(issueDetails.post_data.post_content));
    }
  }, [issueDetails, allUserObjects]);

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
          const user = allUserObjects.find((u) => u.name === name);
          wp.hooks.doAction('alpaca.assigneeChanged', issueDetails, user, true);
        });
        removed.forEach((name) => {
          const user = allUserObjects.find((u) => u.name === name);
          wp.hooks.doAction(
            'alpaca.assigneeChanged',
            issueDetails,
            user,
            false,
          );
        });
      } catch (err) {
        console.error(err);
        showNotification('Failed to update assignees.', 'error');
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
      setLoading('priority', true);
      setIsHighPriority(newValue);

      try {
        await updateIssue(issueId, {
          meta: {
            // eslint-disable-next-line camelcase
            alpaca_high_priority: newValue ? 1 : 0,
          },
        });

        if (issueDetails) {
          setIssueDetails({
            ...issueDetails,
            meta: {
              ...issueDetails.meta,
              ...issueDetails.meta,
              // eslint-disable-next-line camelcase
              alpaca_high_priority: newValue ? 1 : 0,
            },
          });
        }

        wp.hooks.doAction('alpaca.issueUpdated', issueId);
        wp.hooks.doAction('alpaca.priorityUpdated', {
          issueId,
          isHighPriority: newValue,
          issue: issueDetails,
        });
      } catch (err) {
        console.error(err);
        showNotification('Failed to update priority.', 'error');
        setIsHighPriority(!newValue);
      } finally {
        setLoading('priority', false);
      }
    },
    [issueId, issueDetails, setIssueDetails, setLoading, showNotification],
  );

  useEffect(() => {
    if (issueDetails && issueDetails.success && allUserObjects.length > 0) {
      setDeadline(
        issueDetails.meta.alpaca_deadline || issueDetails.meta.deadline || null,
      );

      // Handle assignees
      if (
        issueDetails.taxonomies &&
        issueDetails.taxonomies.assignee &&
        Array.isArray(issueDetails.taxonomies.assignee)
      ) {
        const assigneeNames = issueDetails.taxonomies.assignee.map((t) => {
          const userObject = allUserObjects.find(
            (user) => user.slug === t.slug,
          );
          return userObject ? userObject.name : t.name;
        });
        setAssignees(assigneeNames);
      } else {
        setAssignees([]);
      }
    }
  }, [issueDetails, allUserObjects]);

  // Event handlers
  const handleAssigneeChange = useCallback(
    (newAssignees) => {
      const oldAssignees = [...assignees];
      const { added, removed } = processAssigneeChanges(
        oldAssignees,
        newAssignees,
      );
      setAssignees(newAssignees);

      const slugs = newAssignees.map((a) => userMap[a] || a);
      updateAssignees(issueId, slugs, newAssignees, added, removed);
    },
    [assignees, issueId, updateAssignees, userMap],
  );

  // Deadline handlers
  const handleDeadlineChange = useCallback(
    (newDate) => {
      const oldDeadline = deadline;
      setDeadline(newDate);
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
    [issueId, onDeadlineChange, setLoading, deadline, issueDetails],
  );

  const handleDeadlineClear = useCallback(() => {
    handleDeadlineChange(null);
  }, [handleDeadlineChange]);

  // Lightbox
  const handleLightboxClose = useCallback(() => setLightboxSrc(null), []);

  const confirmScreenshotDelete = useCallback(() => {
    setShowDeleteScreenshotConfirm(true);
  }, []);

  const handleScreenshotDelete = useCallback(async () => {
    setShowDeleteScreenshotConfirm(false);
    setLoading('screenshot', true);
    try {
      await updateIssue(issueId, { meta: { screenshot: '' } });

      // Update local state to remove screenshot
      setIssueDetails((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          alpaca_screenshot: null,
          screenshot: null,
        },
      }));

      showNotification('Screenshot deleted successfully.', 'success');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error deleting screenshot:', err);
      showNotification('Failed to delete screenshot.', 'error');
    } finally {
      setLoading('screenshot', false);
    }
  }, [issueId, setIssueDetails, setLoading, showNotification]);

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
      onStatusChange?.(issueId, nextStatus);
    } catch (err) {
      showNotification('Failed to progress issue status.', 'error');
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
      showNotification('Failed to update issue title.', 'error');
    } finally {
      setLoading('title', false);
      setIsEditingTitle(false);
    }
  }, [
    editedTitle,
    issueDetails,
    issueId,
    onIssueTitleChange,
    setIssueDetails,
    setLoading,
    showNotification,
  ]);

  const handleTitleCancel = useCallback(() => {
    setIsEditingTitle(false);
    if (issueDetails?.success) {
      setEditedTitle(decodeEntities(issueDetails.post_data.post_content));
    }
  }, [issueDetails]);

  // Memoized stable props
  const stableUsers = useMemo(() => allUsers, [allUsers]);
  const stableAssignees = useMemo(() => assignees, [assignees]);
  const stableIsLoading = useMemo(
    () => loadingStates.assignees,
    [loadingStates.assignees],
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
        className="alpaca-details-modal"
        headerActions={
          <Dropdown
            popoverProps={{ placement: 'bottom-end' }}
            renderToggle={({ onToggle }) => (
              <Tooltip text="Options">
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
                    Progress Issue
                  </MenuItem>
                )}
                <MenuItem
                  icon="trash"
                  iconPosition="left"
                  isDestructive
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Trash Issue
                </MenuItem>
              </MenuGroup>
            )}
          />
        }
      >
        {error && (
          <div className="notice notice-error">
            <p>{error}</p>
            <Button onClick={refetchData}>Retry</Button>
          </div>
        )}

        {notificationMessage && (
          <div className={`notice notice-${notificationMessage.type}`}>
            <p>{notificationMessage.message}</p>
          </div>
        )}

        {isLoadingDetails && <p>Loading...</p>}
        {!isLoadingDetails && issueDetails && issueDetails.success && (
          <div className="alpaca-issue-details">
            <div className="alpaca-issue-main column">
              <EditableTitle
                isEditing={isEditingTitle}
                title={editedTitle}
                onEditStart={() => setIsEditingTitle(true)}
                onChange={setEditedTitle}
                onSave={handleTitleSave}
                onCancel={handleTitleCancel}
              />

              <div className="alpaca-issue-meta flexalign">
                Created by <User user={issueDetails.post_data.post_author} />{' '}
                <Time
                  value={issueDetails.post_data.post_date}
                  type="relative"
                />
              </div>

              <table className="alpaca-issue-details">
                <tbody>
                  <tr>
                    <th scope="row">Status</th>
                    <td>{currentStatus?.name || 'Unknown'}</td>
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

                  <AttachmentRow
                    attachments={
                      issueDetails.meta.alpaca_screenshot ||
                      issueDetails.meta.screenshot
                        ? [
                            {
                              url:
                                issueDetails.meta.alpaca_screenshot ||
                                issueDetails.meta.screenshot,
                            },
                          ]
                        : []
                    }
                    onAttachmentClick={setLightboxSrc}
                    onAttachmentDelete={confirmScreenshotDelete}
                    isLoading={loadingStates.screenshot}
                  />
                </tbody>
              </table>

              {wp.hooks.applyFilters('alpaca.issue.abovetabs', null, {
                issueId,
                meta: issueDetails.meta,
              })}

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
                    />
                  );
                }}
              </TabPanel>
            </div>
          </div>
        )}
        {!isLoadingDetails && (!issueDetails || !issueDetails.success) && (
          <p>{issueDetails?.message || 'Could not load issue details.'}</p>
        )}

        {showDeleteScreenshotConfirm && (
          <Modal
            title="Delete Screenshot?"
            onRequestClose={() => setShowDeleteScreenshotConfirm(false)}
            className="alpaca-modal"
          >
            <p>Are you sure you want to delete this screenshot?</p>
            <div className="alpaca-actions flexalign">
              <Button isPrimary onClick={handleScreenshotDelete}>
                Delete
              </Button>
              <Button onClick={() => setShowDeleteScreenshotConfirm(false)}>
                Cancel
              </Button>
            </div>
          </Modal>
        )}
      </Modal>

      {showDeleteConfirm && (
        <div className="alpaca-confirm-overlay">
          <div className="alpaca-confirm-box">
            <h2>Delete Issue?</h2>
            <p>Are you sure you want to trash this issue?</p>

            <div>
              <Button
                isPrimary
                isDestructive
                onClick={() => {
                  onDelete(issueId);
                  setShowDeleteConfirm(false);
                }}
              >
                Delete
              </Button>

              <Button onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={handleLightboxClose} />
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
  onStatusChange: PropTypes.func.isRequired,
  onIssueTitleChange: PropTypes.func.isRequired,
};

export default AlpacaIssue;
