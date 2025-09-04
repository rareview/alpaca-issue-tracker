import AlpacaCommenting from "./commenting.jsx";
import Checklist from "./issue/checklist.jsx";
import { generateStatusChangeComment } from "../utils/comments.js";

const { useState, useEffect, useRef, useMemo, useCallback } = wp.element;
import { getTabsConfig } from "../utils/tabsConfig";
const { useDebounce } = wp.compose;
const { Modal, TabPanel, Button, Tooltip } = wp.components;

import useIssueData from "../hooks/useIssueData";
import useUserManagement from "../hooks/useUserManagement";
import useLoadingStates from "../hooks/useLoadingStates";

import {
  processAssigneeChanges,
  createAssigneeComments,
} from "../utils/assigneeUtils";
import { parseChecklist } from "../utils/checklistUtils";
import { fetchStatuses, updateIssue } from "../services/issueApi";

import AssigneeSelector from "./issue/AssigneeSelector";
import DeadlineControl from "./issue/DeadlineControl";
import JsonTable from "./issue/JsonTable";
import ReportTab from "./issue/ReportTab";
import TabContent from "./issue/TabContent";
import Lightbox from "./issue/Lightbox";
const { decodeEntities } = wp.htmlEntities;
const { date } = wp;
const datesettings = wp.date.getSettings();

// Custom hooks

// Memoized components

const AlpacaIssue = ({
  issueId,
  isOpen,
  onClose,
  onDelete,
  triggerRef,
  onAssigneesChange,
  onDeadlineChange,
  createIssueComment,
  generateAssigneeChangeComment,
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
  const [commentRefreshKey, setCommentRefreshKey] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [allStatuses, setAllStatuses] = useState([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const titleInputRef = useRef(null);
  const [notificationMessage, setNotificationMessage] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotificationMessage({ message, type });
    setTimeout(() => setNotificationMessage(null), 5000); // Clear after 5 seconds
  };

  useEffect(() => {
    fetchStatuses()
      .then(setAllStatuses)
      .catch((err) => {
        console.error("Error fetching statuses:", err);
        showNotification("Failed to load statuses.", "error");
      });
  }, []);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  // Memoized values
  const assigneeObjects = useMemo(
    () =>
      allUserObjects.filter(
        (u) => assignees.includes(u.name) || assignees.includes(u.slug)
      ),
    [allUserObjects, assignees]
  );

  const tabsConfig = getTabsConfig(issueDetails);

  // Debounced API calls
  const updateAssignees = useCallback(
    async (issueId, slugs, newAssignees) => {
      console.log(
        "updateAssignees: Updating issue",
        issueId,
        "with slugs:",
        slugs
      );
      await updateIssue(issueId, {
        taxonomies: {
          assignee: slugs,
        },
      })
        .then(() => {
          console.log("updateAssignees: updateIssue successful.");
          if (typeof onAssigneesChange === "function") {
            const assigneeObjects = allUserObjects.filter(
              (u) =>
                newAssignees.includes(u.name) || newAssignees.includes(u.slug)
            );
            onAssigneesChange(issueId, assigneeObjects);
          }
          refetchData();
        })
        .catch((error) => {
          console.error("updateAssignees: updateIssue failed:", error);
          showNotification("Failed to update assignees.", "error");
        })
        .finally(() => setLoading("assignees", false));
    },
    [onAssigneesChange, refetchData, setLoading, allUserObjects]
  );

  const updateDeadline = useCallback(
    async (issueId, newDate) => {
      setLoading("deadline", true);
      try {
        await updateIssue(issueId, {
          meta: { deadline: newDate },
        });
        if (typeof onDeadlineChange === "function") {
          onDeadlineChange(issueId, newDate);
        }
      } catch (error) {
        console.error("Failed to update deadline:", error);
        showNotification("Failed to update deadline.", "error");
      } finally {
        setLoading("deadline", false);
      }
    },
    [onDeadlineChange, setLoading, showNotification]
  );

  // Process issue details when they change
  useEffect(() => {
    if (issueDetails && issueDetails.success && allUserObjects.length > 0) {
      setDeadline(issueDetails.meta.deadline || null);

      // Handle checklist
      if (issueDetails.meta.checklist) {
        const parsedChecklist = parseChecklist(issueDetails.meta.checklist);
        if (Array.isArray(parsedChecklist)) {
          setChecklistItems(parsedChecklist);
        }
      } else {
        setChecklistItems([]);
      }

      // Handle assignees
      if (
        issueDetails.taxonomies &&
        issueDetails.taxonomies.assignee &&
        Array.isArray(issueDetails.taxonomies.assignee)
      ) {
        const assigneeNames = issueDetails.taxonomies.assignee.map((t) => {
          const userObject = allUserObjects.find(
            (user) => user.slug === t.slug
          );
          return userObject ? userObject.name : t.name;
        });
        setAssignees(assigneeNames);
        console.log("useEffect: Initial assignees set to", assigneeNames);
      } else {
        setAssignees([]);
        console.log("useEffect: Initial assignees set to empty array");
      }
    }
  }, [issueDetails, allUserObjects]);

  // Event handlers
  const handleAssigneeChange = useCallback(
    async (newAssignees) => {
      const oldAssignees = [...assignees];
      const { added, removed } = processAssigneeChanges(
        oldAssignees,
        newAssignees
      );

      added.forEach((assignee) => {
        const user = allUserObjects.find((u) => u.name === assignee);
        wp.hooks.doAction("alpaca.assigneeChanged", issueDetails, user, true);
      });

      removed.forEach((assignee) => {
        const user = allUserObjects.find((u) => u.name === assignee);
        wp.hooks.doAction("alpaca.assigneeChanged", issueDetails, user, false);
      });

      console.log(
        "handleAssigneeChange: newAssignees before setAssignees",
        newAssignees
      );
      setAssignees(newAssignees);
      console.log(
        "handleAssigneeChange: assignees state after setAssignees (may not reflect immediately)",
        assignees
      );
      const slugs = newAssignees.map((a) => userMap[a] || a);
      console.log("handleAssigneeChange: slugs being sent", slugs);
      setLoading("assignees", true);
      updateAssignees(issueId, slugs, newAssignees);
    },
    [
      assignees,
      allUserObjects,
      issueDetails,
      issueId,
      userMap,
      updateAssignees,
      setLoading,
    ]
  );

  const handleDeadlineChange = useCallback(
    (newDate) => {
      setDeadline(newDate);
      updateDeadline(issueId, newDate);
    },
    [issueId, updateDeadline]
  );

  const handleDeadlineClear = useCallback(() => {
    setDeadline(null);
    setLoading("deadline", true);
    updateIssue(issueId, {
      meta: { deadline: "" },
    })
      .then(() => {
        if (typeof onDeadlineChange === "function") {
          onDeadlineChange(issueId, null);
        }
      })
      .finally(() => setLoading("deadline", false));
  }, [issueId, onDeadlineChange, setLoading]);

  const handleScreenshotDelete = useCallback(() => {
    setLoading("screenshot", true);
    updateIssue(issueId, { meta: { screenshot: "" } })
      .then(() => {
        setIssueDetails((prev) => ({
          ...prev,
          meta: { ...prev.meta, screenshot: "" },
        }));
      })
      .finally(() => setLoading("screenshot", false));
  }, [issueId, setIssueDetails, setLoading]);

  const handleLightboxClose = useCallback(() => {
    setLightboxSrc(null);
  }, []);

  const handleProgressIssue = useCallback(async () => {
    if (!issueDetails || !allStatuses.length) return;

    const currentStatusTerm = issueDetails.taxonomies?.status?.[0];
    if (!currentStatusTerm) return;

    const currentIndex = allStatuses.findIndex(
      (s) => s.term_id === currentStatusTerm.term_id
    );

    if (currentIndex === -1 || currentIndex === allStatuses.length - 1) {
      // Already the last status or not found
      return;
    }

    const nextStatus = allStatuses[currentIndex + 1];

    setLoading("status", true);
    try {
      await updateIssue(issueId, {
        taxonomies: {
          status: [nextStatus.term_id],
        },
      });

      // Update local state to reflect the change
      setIssueDetails((prev) => ({
        ...prev,
        taxonomies: {
          ...prev.taxonomies,
          status: [nextStatus],
        },
      }));

      // Notify parent component about the status change
      if (typeof onStatusChange === "function") {
        onStatusChange(issueId, nextStatus);
      }

      wp.hooks.doAction(
        "alpaca.statusChanged",
        issueDetails,
        currentStatusTerm.name,
        nextStatus.name
      );
    } catch (error) {
      showNotification("Failed to progress issue status.", "error");
    } finally {
      setLoading("status", false);
    }
  }, [issueDetails, allStatuses, issueId, setIssueDetails, setLoading]);

  const handleTitleSave = useCallback(async () => {
    if (editedTitle === decodeEntities(issueDetails.post_data.post_content)) {
      setIsEditingTitle(false);
      return;
    }

    setLoading("title", true);
    try {
      await updateIssue(issueId, {
        content: editedTitle,
        title: editedTitle,
      });

      setIssueDetails((prev) => ({
        ...prev,
        post_data: {
          ...prev.post_data,
          post_content: editedTitle,
          post_title: editedTitle,
        },
      }));

      if (typeof onIssueTitleChange === "function") {
        onIssueTitleChange(issueId, editedTitle);
      }
    } catch (error) {
      showNotification("Failed to update issue title.", "error");
    } finally {
      setLoading("title", false);
      setIsEditingTitle(false);
    }
  }, [
    editedTitle,
    issueDetails,
    issueId,
    setIssueDetails,
    setLoading,
    onIssueTitleChange,
  ]);

  const currentStatus = issueDetails?.taxonomies?.status?.[0];
  const isLastStatus = useMemo(() => {
    if (!currentStatus || !allStatuses.length) return true;
    const currentIndex = allStatuses.findIndex(
      (s) => s.term_id === currentStatus.term_id
    );
    return currentIndex === allStatuses.length - 1;
  }, [currentStatus, allStatuses]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <Modal
        size="medium"
        onRequestClose={onClose}
        className="alpaca-details-modal"
        headerActions={
          !isLastStatus && (
            <Tooltip text="Progress issue to next status">
              <Button
                type="button"
                className="components-button has-icon"
                onClick={handleProgressIssue}
                disabled={loadingStates.status}
              >
                <span className="dashicons dashicons-arrow-right-alt"></span>
              </Button>
            </Tooltip>
          )
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

        {isLoadingDetails ? (
          <p>Loading...</p>
        ) : issueDetails && issueDetails.success ? (
          <div className="alpaca-issue-details">
            <div className="alpaca-issue-main column">
              <div className="alpaca-issue-slug">
                {issueDetails.post_data.post_name}
              </div>
              {isEditingTitle ? (
                <input
                  type="text"
                  className="alpaca-issue-title-input"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleTitleSave();
                    }
                  }}
                  disabled={loadingStates.title}
                  ref={titleInputRef}
                />
              ) : (
                <div className="alpaca-issue-title-wrapper">
                  <h3 className="alpaca-issue-title">
                    {decodeEntities(issueDetails.post_data.post_content)}
                  </h3>
                  <Tooltip text="Edit title">
                    <Button
                      className="alpaca-edit-title-button"
                      icon="edit"
                      onClick={() => {
                        setIsEditingTitle(true);
                        setEditedTitle(
                          decodeEntities(issueDetails.post_data.post_content)
                        );
                      }}
                    />
                  </Tooltip>
                </div>
              )}
              <div className="alpaca-issue-main-controls">
                <AssigneeSelector
                  assignees={assignees}
                  allUsers={allUsers}
                  onChange={handleAssigneeChange}
                  isLoading={loadingStates.assignees}
                />

                <DeadlineControl
                  deadline={deadline}
                  onChange={handleDeadlineChange}
                  onClear={handleDeadlineClear}
                  isLoading={loadingStates.deadline}
                />
              </div>

              <Checklist
                issueId={issueId}
                initialChecklistItems={checklistItems}
                isSaving={loadingStates.assignees || loadingStates.deadline}
                setIsSaving={(value) => setLoading("checklist", value)}
                setCommentRefreshKey={setCommentRefreshKey} // Add this line
              />

              <TabPanel
                className="alpaca-issue-tabs"
                initialTabName="comments"
                tabs={tabsConfig}
              >
                {(tab) => (
                  <TabContent
                    tab={tab}
                    issueDetails={issueDetails}
                    issueId={issueId}
                    commentRefreshKey={commentRefreshKey}
                    onScreenshotDelete={handleScreenshotDelete}
                    loadingStates={loadingStates}
                    onScreenshotClick={setLightboxSrc}
                  />
                )}
              </TabPanel>
            </div>
          </div>
        ) : (
          <p>{issueDetails?.message || "Could not load issue details."}</p>
        )}
      </Modal>

      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={handleLightboxClose} />
      )}
    </>
  );
};

export default AlpacaIssue;
