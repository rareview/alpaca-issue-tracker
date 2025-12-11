import PropTypes from 'prop-types';

const { useState, useEffect, useRef, useMemo, useCallback, memo } = wp.element;
import { getTabsConfig } from '../utils/tabsConfig';
const { Modal, TabPanel, Button, Tooltip, Dropdown, MenuGroup, MenuItem } =
  wp.components;

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
import User from './User';
import Time from './Time';

const { decodeEntities } = wp.htmlEntities;

// ----- Memoized rows -----
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
  ({ isEditing, title, onEditStart, onChange, onSave }) => {
    const inputRef = useRef(null);

    useEffect(() => {
      if (isEditing && inputRef.current) inputRef.current.focus();
    }, [isEditing]);

    if (isEditing) {
      return (
        <div
          role="textbox"
          aria-label="Edit issue title"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSave();
            }
          }}
          onBlur={onSave}
        >
          <h3
            className="alpaca-issue-title"
            contentEditable
            suppressContentEditableWarning
            ref={inputRef}
            onInput={(e) => onChange(e.currentTarget.textContent)}
          >
            {title}
          </h3>
        </div>
      );
    }

    return (
      <div className="alpaca-issue-title-wrapper has-sidecontrols">
        <h3 className="alpaca-issue-title">{title}</h3>
        <div className="sidecontrols">
          <Tooltip text="Edit title">
            <Button
              className="alpaca-edit-title-button"
              icon="edit"
              onClick={onEditStart}
            />
          </Tooltip>
        </div>
      </div>
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
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [allStatuses, setAllStatuses] = useState([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [commentRefreshKey, setCommentRefreshKey] = useState(0);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

      // Checklist
      const parsedChecklist = issueDetails.meta.checklist
        ? parseChecklist(issueDetails.meta.checklist)
        : [];
      setChecklistItems(Array.isArray(parsedChecklist) ? parsedChecklist : []);

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

  // Process issue details when they change
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
      setDeadline(newDate);
      setLoading('deadline', true);
      updateIssue(issueId, { meta: { deadline: newDate } })
        .then(() => onDeadlineChange?.(issueId, newDate))
        .finally(() => setLoading('deadline', false));
    },
    [issueId, onDeadlineChange, setLoading],
  );

  const handleDeadlineClear = useCallback(() => {
    handleDeadlineChange(null);
  }, [handleDeadlineChange]);

  // Lightbox
  const handleLightboxClose = useCallback(() => setLightboxSrc(null), []);

  const handleScreenshotDelete = useCallback((_screenshotId) => {
    // TODO: Implement screenshot deletion
  }, []);

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

                  {/* Attachments row - to be implemented */}
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
                      onScreenshotDelete={handleScreenshotDelete}
                      loadingStates={loadingStates}
                      onScreenshotClick={setLightboxSrc}
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
      </Modal>

      {showDeleteConfirm && (
        <Modal
          title="Delete Issue?"
          onRequestClose={() => setShowDeleteConfirm(false)}
          className="alpaca-modal"
        >
          <p>Are you sure you want to trash this issue?</p>
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
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
        </Modal>
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
