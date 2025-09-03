import AlpacaCommenting from "./commenting.jsx";
import Checklist from "./checklist.jsx";
import User from "./User";
import { generateStatusChangeComment } from "../utils/comments.js";

const {
  useState,
  useEffect,
  useRef,
  createPortal,
  useMemo,
  useCallback,
  memo: ReactMemo,
} = wp.element;

const { useDebounce } = wp.compose;

const {
  Modal,
  FormTokenField,
  DatePicker,
  Popover,
  BaseControl,
  TabPanel,
  Button,
  Tooltip,
} = wp.components;
const { decodeEntities } = wp.htmlEntities;
const { date } = wp;
const datesettings = wp.date.getSettings();

// Utility functions
const processAssigneeChanges = (oldAssignees, newAssignees) => {
  const added = newAssignees.filter((name) => !oldAssignees.includes(name));
  const removed = oldAssignees.filter((name) => !newAssignees.includes(name));
  return { added, removed };
};

const createAssigneeComments = async (
  added,
  removed,
  allUserObjects,
  createComment,
  generateComment,
  issueId
) => {
  const commentPromises = [];

  added.forEach((name) => {
    const user = allUserObjects.find((u) => u.name === name);
    if (user) {
      commentPromises.push(createComment(issueId, generateComment(user, true)));
    }
  });

  removed.forEach((name) => {
    const user = allUserObjects.find((u) => u.name === name);
    if (user) {
      commentPromises.push(
        createComment(issueId, generateComment(user, false))
      );
    }
  });

  if (commentPromises.length > 0) {
    return Promise.all(commentPromises);
  }
  return Promise.resolve();
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Custom hooks
const useIssueData = (issueId, isOpen) => {
  const [issueDetails, setIssueDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (issueId && isOpen) {
      setIsLoadingDetails(true);
      setError(null);

      wp.apiFetch({ path: `/issue/v1/get/${issueId}` })
        .then((issueData) => {
          setIssueDetails(issueData);
        })
        .catch((err) => {
          console.error("Error fetching issue data:", err);
          setError("Failed to load issue details. Please try again.");
          setIssueDetails(null);
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    }
  }, [issueId, isOpen]);

  const refetchData = useCallback(() => {
    if (issueId && isOpen) {
      setIsLoadingDetails(true);
      setError(null);

      wp.apiFetch({ path: `/issue/v1/get/${issueId}` })
        .then(setIssueDetails)
        .catch((err) => {
          console.error("Error refetching issue data:", err);
          setError("Failed to load issue details. Please try again.");
        })
        .finally(() => setIsLoadingDetails(false));
    }
  }, [issueId, isOpen]);

  return {
    issueDetails,
    setIssueDetails,
    isLoadingDetails,
    error,
    refetchData,
  };
};

const useUserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [allUserObjects, setAllUserObjects] = useState([]);
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    wp.apiFetch({ path: "/alpaca/v1/users" })
      .then((users) => {
        const usersWithAvatar = users.map((u) => ({
          ...u,
          avatar:
            u.avatar_urls?.["48"] ||
            u.avatar_urls?.["96"] ||
            u.avatar_urls?.["24"] ||
            "",
        }));

        const localUserMap = {};
        usersWithAvatar.forEach((u) => {
          localUserMap[u.name] = u.slug;
          localUserMap[u.slug] = u.slug;
        });

        setUserMap(localUserMap);
        setAllUsers(usersWithAvatar.map((u) => u.name));
        setAllUserObjects(usersWithAvatar);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  }, []);

  return { allUsers, allUserObjects, userMap };
};

const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState({
    assignees: false,
    deadline: false,
    screenshot: false,
    title: false,
  });

  const setLoading = useCallback((key, value) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return { loadingStates, setLoading };
};

// Memoized components
const JsonTable = ReactMemo(({ data }) => {
  if (!data) return null;

  let parsedData;
  try {
    parsedData = JSON.parse(data);
  } catch (e) {
    return <p>Error parsing JSON data</p>;
  }

  return (
    <table
      className="alpaca-json-table widefat striped"
      style={{ borderCollapse: "collapse", width: "100%" }}
    >
      <tbody>
        {Object.entries(parsedData).map(([key, value]) => (
          <tr key={key}>
            <th>{key}</th>
            <td>{String(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

const AssigneeSelector = ReactMemo(
  ({ assignees, allUsers, onChange, isLoading }) => (
    <FormTokenField
      label="Assigned To"
      placeholder="Nobody"
      value={assignees}
      suggestions={allUsers}
      onChange={onChange}
      disabled={isLoading}
    />
  )
);

const DeadlineControl = ReactMemo(
  ({ deadline, onChange, onClear, isLoading }) => {
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const calendarButtonRef = useRef();

    return (
      <BaseControl label="Deadline" className="alpaca-deadline-control">
        <div className="alpaca-deadline">
          <div className="alpaca-deadline-date">
            <input
              readOnly
              type="text"
              value={
                deadline
                  ? date.format(datesettings.formats.date, deadline)
                  : "No deadline set."
              }
              onClick={() => setIsEditingDeadline((prev) => !prev)}
              ref={calendarButtonRef}
              disabled={isLoading}
            />
          </div>

          {isEditingDeadline && (
            <Popover
              placement="bottom-start"
              onClose={() => setIsEditingDeadline(false)}
              anchor={calendarButtonRef.current}
              focusOnMount={false}
              className="alpaca-deadline-popover"
            >
              <DatePicker
                current={deadline}
                onChange={(newDate) => {
                  onChange(newDate);
                  setIsEditingDeadline(false);
                }}
              />
            </Popover>
          )}

          {deadline && (
            <Button
              icon="trash"
              label="Clear deadline"
              onClick={onClear}
              disabled={isLoading}
            />
          )}
        </div>
      </BaseControl>
    );
  }
);

const ReportTab = ReactMemo(
  ({ issueDetails, onScreenshotDelete, isLoading, onScreenshotClick }) => (
    <div className="alpaca-report-tab">
      {issueDetails.meta.screenshot && (
        <div>
          <p>
            <img
              src={issueDetails.meta.screenshot}
              className="alpaca-screenshot"
              alt="Screenshot"
              style={{ cursor: "zoom-in", maxWidth: "100%" }}
              onClick={() => onScreenshotClick(issueDetails.meta.screenshot)}
            />
          </p>
          <p>
            <button
              type="button"
              className="button-link-delete"
              disabled={isLoading}
              onClick={onScreenshotDelete}
            >
              Delete
            </button>
          </p>
        </div>
      )}

      <table className="widefat striped">
        <tbody>
          <tr>
            <th scope="row">Reported</th>
            <td>
              {date.format(
                datesettings.formats.datetimeAbbreviated,
                new Date(issueDetails.post_data.post_date)
              )}
            </td>
          </tr>
          <tr>
            <th scope="row">Last edit</th>
            <td>
              {date.format(
                datesettings.formats.datetimeAbbreviated,
                new Date(issueDetails.post_data.post_modified)
              )}
            </td>
          </tr>
          <tr>
            <th scope="row">URL</th>
            <td>
              {issueDetails.meta.URL ? (
                <a
                  href={issueDetails.meta.URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {issueDetails.meta.URL}
                </a>
              ) : (
                "N/A"
              )}
            </td>
          </tr>
          <tr>
            <th scope="row">Screen</th>
            <td>
              {issueDetails.meta.screenwidth && issueDetails.meta.screenheight
                ? `${issueDetails.meta.screenwidth} x ${issueDetails.meta.screenheight}`
                : "N/A"}
            </td>
          </tr>
          {Object.entries(issueDetails.taxonomies)
            .filter(([taxonomy]) => taxonomy !== "assignee")
            .map(([taxonomy, terms]) => (
              <tr key={taxonomy}>
                <th style={{ textTransform: "capitalize" }}>{taxonomy}</th>
                <td>{terms.map((term) => term.name).join(", ")}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
);

const TabContent = ReactMemo(
  ({
    tab,
    issueDetails,
    issueId,
    commentRefreshKey,
    onScreenshotDelete,
    loadingStates,
    onScreenshotClick,
  }) => {
    switch (tab.name) {
      case "comments":
        return (
          <AlpacaCommenting
            issueId={issueId}
            commentRefreshKey={commentRefreshKey}
          />
        );
      case "report":
        return (
          <ReportTab
            issueDetails={issueDetails}
            onScreenshotDelete={onScreenshotDelete}
            isLoading={loadingStates.screenshot}
            onScreenshotClick={onScreenshotClick}
          />
        );
      case "queriedobject":
        return <JsonTable data={issueDetails.meta.queriedObject} />;
      case "headers":
        return <JsonTable data={issueDetails.meta.headers} />;
      default:
        return null;
    }
  }
);

const Lightbox = ReactMemo(({ src, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999999999999,
      }}
      onClick={onClose}
    >
      <img
        src={src}
        alt="Enlarged screenshot"
        style={{
          maxWidth: "90%",
          maxHeight: "90%",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        }}
      />
    </div>,
    document.body
  );
});

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

  useEffect(() => {
    wp.apiFetch({ path: "/alpaca/v1/statuses" })
      .then(setAllStatuses)
      .catch((err) => {
        console.error("Error fetching statuses:", err);
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

  const tabsConfig = useMemo(
    () => [
      { name: "comments", title: "Comments", className: "comments" },
      { name: "report", title: "Report", className: "report" },
      ...(issueDetails?.meta?.queriedObject &&
      issueDetails.meta.queriedObject !== "null"
        ? [
            {
              name: "queriedobject",
              title: "Queried Object",
              className: "queried-object",
            },
          ]
        : []),
      ...(issueDetails?.meta?.headers && issueDetails.meta.headers !== "null"
        ? [
            {
              name: "headers",
              title: "Headers",
              className: "headers",
            },
          ]
        : []),
    ],
    [issueDetails?.meta?.queriedObject, issueDetails?.meta?.headers]
  );

  // Debounced API calls
  const debouncedUpdateAssignees = useMemo(
    () =>
      debounce((issueId, slugs, newAssignees) => {
        wp.apiFetch({
          path: `/issue/v1/update/${issueId}`,
          method: "POST",
          data: {
            taxonomies: {
              assignee: slugs,
            },
          },
        })
          .then(() => {
            if (typeof onAssigneesChange === "function") {
              const assigneeObjects = allUserObjects.filter(
                (u) =>
                  newAssignees.includes(u.name) || newAssignees.includes(u.slug)
              );
              onAssigneesChange(issueId, assigneeObjects);
            }
          })
          .finally(() => setLoading("assignees", false));
      }, 300),
    [allUserObjects, onAssigneesChange, setLoading]
  );

  const debouncedUpdateDeadline = useMemo(
    () =>
      debounce((issueId, newDate) => {
        wp.apiFetch({
          path: `/issue/v1/update/${issueId}`,
          method: "POST",
          data: {
            meta: { deadline: newDate },
          },
        })
          .then(() => {
            if (typeof onDeadlineChange === "function") {
              onDeadlineChange(issueId, newDate);
            }
          })
          .finally(() => setLoading("deadline", false));
      }, 300),
    [onDeadlineChange, setLoading]
  );

  // Process issue details when they change
  useEffect(() => {
    if (issueDetails && issueDetails.success && allUserObjects.length > 0) {
      setDeadline(issueDetails.meta.deadline || null);

      // Handle checklist
      if (issueDetails.meta.checklist) {
        try {
          const parsedChecklist =
            typeof issueDetails.meta.checklist === "string"
              ? JSON.parse(issueDetails.meta.checklist)
              : issueDetails.meta.checklist;

          if (Array.isArray(parsedChecklist)) {
            setChecklistItems(parsedChecklist);
          }
        } catch (e) {
          console.error("Error parsing checklist", e);
          setChecklistItems([]);
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
      } else {
        setAssignees([]);
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

      // Handle comments for assignee changes
      if (createIssueComment && generateAssigneeChangeComment) {
        try {
          await createAssigneeComments(
            added,
            removed,
            allUserObjects,
            createIssueComment,
            generateAssigneeChangeComment,
            issueId
          );
          setCommentRefreshKey((prevKey) => prevKey + 1);
        } catch (err) {
          console.error("Failed to create assignee comments", err);
        }
      }

      setAssignees(newAssignees);
      const slugs = newAssignees.map((a) => userMap[a] || a);
      setLoading("assignees", true);
      debouncedUpdateAssignees(issueId, slugs, newAssignees);
    },
    [
      assignees,
      allUserObjects,
      createIssueComment,
      generateAssigneeChangeComment,
      issueId,
      userMap,
      debouncedUpdateAssignees,
      setLoading,
    ]
  );

  const handleDeadlineChange = useCallback(
    (newDate) => {
      setDeadline(newDate);
      setLoading("deadline", true);
      debouncedUpdateDeadline(issueId, newDate);
    },
    [issueId, debouncedUpdateDeadline, setLoading]
  );

  const handleDeadlineClear = useCallback(() => {
    setDeadline(null);
    setLoading("deadline", true);
    wp.apiFetch({
      path: `/issue/v1/update/${issueId}`,
      method: "POST",
      data: {
        meta: { deadline: "" },
      },
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
    wp.apiFetch({
      path: `/issue/v1/update/${issueId}`,
      method: "POST",
      data: { meta: { screenshot: "" } },
    })
      .then(() => {
        setIssueDetails((prev) => ({
          ...prev,
          meta: { ...prev.meta, screenshot: "" },
        }));
      })
      .finally(() => setLoading("screenshot", false));
  }, [issueId, setIssueDetails, setLoading]);

  const handleChecklistComment = useCallback(
    (issueId, commentContent) => {
      if (createIssueComment) {
        createIssueComment(issueId, commentContent)
          .then(() => {
            setCommentRefreshKey((prevKey) => prevKey + 1);
          })
          .catch((err) => {
            console.error("Error creating checklist comment:", err);
          });
      }
    },
    [createIssueComment]
  );

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
      await wp.apiFetch({
        path: `/issue/v1/update/${issueId}`,
        method: "POST",
        data: {
          taxonomies: {
            status: [nextStatus.term_id],
          },
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

      // Optionally, add a comment for status change
      if (createIssueComment) {
        const commentContent = generateStatusChangeComment(
          currentStatusTerm.name,
          nextStatus.name
        );
        await createIssueComment(issueId, commentContent);
        setCommentRefreshKey((prevKey) => prevKey + 1);
      }
    } catch (error) {
      console.error("Failed to progress issue status:", error);
      // Handle error, e.g., show a notice to the user
    } finally {
      setLoading("status", false);
    }
  }, [
    issueDetails,
    allStatuses,
    issueId,
    createIssueComment,
    setIssueDetails,
    setLoading,
  ]);

  const handleTitleSave = useCallback(async () => {
    if (editedTitle === decodeEntities(issueDetails.post_data.post_content)) {
      setIsEditingTitle(false);
      return;
    }

    setLoading("title", true);
    try {
      await wp.apiFetch({
        path: `/issue/v1/update/${issueId}`,
        method: "POST",
        data: {
          content: editedTitle,
        },
      });

      setIssueDetails((prev) => ({
        ...prev,
        post_data: {
          ...prev.post_data,
          post_content: editedTitle,
        },
      }));

      if (typeof onIssueTitleChange === "function") {
        onIssueTitleChange(issueId, editedTitle);
      }
    } catch (error) {
      console.error("Failed to update issue title:", error);
    } finally {
      setLoading("title", false);
      setIsEditingTitle(false);
    }
  }, [editedTitle, issueDetails, issueId, setIssueDetails, setLoading, onIssueTitleChange]);

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
        headerActions={[
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
          ),
          <Tooltip text="Delete issue">
            <Button
              type="button"
              className="alpaca-modal-delete-button components-button has-icon"
              isDestructive
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to delete this issue?")
                ) {
                  onDelete(issueId);
                }
              }}
            >
              <span className="dashicons dashicons-trash"></span>
            </Button>
          </Tooltip>,
        ].filter(Boolean)}
      >
        {error && (
          <div className="notice notice-error">
            <p>{error}</p>
            <Button onClick={refetchData}>Retry</Button>
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
                createIssueComment={handleChecklistComment}
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
