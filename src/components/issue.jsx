import AlpacaCommenting from "./commenting.jsx";
const { useState, useEffect, useRef, createPortal } = wp.element;
const { Modal, FormTokenField, DatePicker, Popover, BaseControl } =
  wp.components;
const { decodeEntities } = wp.htmlEntities;
import User from "./User";
const { date } = wp;
const datesettings = wp.date.getSettings();

const AlpacaIssue = ({
  issueId,
  isOpen,
  onClose,
  triggerRef,
  onCommentCountChange,
  onAssigneesChange,
  onDeadlineChange,
  createIssueComment,
  generateAssigneeChangeComment,
}) => {
  const [issueDetails, setIssueDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [allUsers, setAllUsers] = useState([]); // display names for suggestions
  const [allUserObjects, setAllUserObjects] = useState([]); // full user objects
  const [assignees, setAssignees] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [userMap, setUserMap] = useState({}); // Map display name -> slug
  const [commentRefreshKey, setCommentRefreshKey] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const calendarButtonRef = useRef();

  // Close lightbox on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setLightboxSrc(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch all users and issue details concurrently
  useEffect(() => {
    if (issueId && isOpen) {
      setIsLoadingDetails(true);

      const usersPromise = wp.apiFetch({ path: "/alpaca/v1/users" });
      const issuePromise = wp.apiFetch({ path: `/issue/v1/get/${issueId}` });

      Promise.all([usersPromise, issuePromise])
        .then(([users, issueData]) => {
          // 1. Process users first to build the map
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
            localUserMap[u.slug] = u.slug; // For reverse lookup if needed
          });
          setUserMap(localUserMap);
          setAllUsers(usersWithAvatar.map((u) => u.name));
          setAllUserObjects(usersWithAvatar);

          // 2. Process issue details
          setIssueDetails(issueData);
          setDeadline(issueData.meta.deadline || null);

          // 3. Now that the user map is guaranteed to exist, populate assignees
          if (
            issueData.taxonomies &&
            issueData.taxonomies.assignee &&
            Array.isArray(issueData.taxonomies.assignee)
          ) {
            const assigneeNames = issueData.taxonomies.assignee.map((t) => {
              const userObject = usersWithAvatar.find(
                (user) => user.slug === t.slug
              );
              return userObject ? userObject.name : t.name;
            });
            setAssignees(assigneeNames);
          } else {
            setAssignees([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching issue data:", err);
          setIssueDetails({ error: "Failed to load details." });
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    }
  }, [issueId, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      size="large"
      onRequestClose={onClose}
      className="alpaca-details-modal"
    >
      {isLoadingDetails ? (
        <p>Loading...</p>
      ) : issueDetails && issueDetails.success ? (
        <div className="alpaca-issue-details">
          <div className="alpaca-issue-main column">
            <div className="alpaca-issue-slug">
              {issueDetails.post_data.post_name}
            </div>
            <div className="alpaca-issue-identity">
              <div className="alpaca-issue-author">
                <User user={issueDetails.post_data.post_author} />
              </div>
              <h3 className="alpaca-issue-title">
                {decodeEntities(issueDetails.post_data.post_title)}
              </h3>
            </div>
            <div className="alpaca-issue-main-controls">
              <FormTokenField
                label="Assigned To"
                value={assignees}
                suggestions={allUsers}
                onChange={(newAssignees) => {
                  const oldAssignees = [...assignees];

                  const added = newAssignees.filter(
                    (name) => !oldAssignees.includes(name)
                  );
                  const removed = oldAssignees.filter(
                    (name) => !newAssignees.includes(name)
                  );

                  if (createIssueComment && generateAssigneeChangeComment) {
                    const commentPromises = [];
                    added.forEach((name) => {
                      const user = allUserObjects.find((u) => u.name === name);
                      if (user) {
                        commentPromises.push(
                          createIssueComment(
                            issueId,
                            generateAssigneeChangeComment(user, true)
                          )
                        );
                      }
                    });
                    removed.forEach((name) => {
                      const user = allUserObjects.find((u) => u.name === name);
                      if (user) {
                        commentPromises.push(
                          createIssueComment(
                            issueId,
                            generateAssigneeChangeComment(user, false)
                          )
                        );
                      }
                    });

                    if (commentPromises.length > 0) {
                      Promise.all(commentPromises)
                        .then(() => {
                          setCommentRefreshKey((prevKey) => prevKey + 1);
                        })
                        .catch((err) => {
                          console.error(
                            "Failed to create one or more assignee comments",
                            err
                          );
                        });
                    }
                  }
                  setAssignees(newAssignees);
                  const slugs = newAssignees.map((a) => userMap[a] || a);
                  setIsSaving(true);
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
                            newAssignees.includes(u.name) ||
                            newAssignees.includes(u.slug)
                        );
                        onAssigneesChange(issueId, assigneeObjects);
                      }
                    })
                    .finally(() => setIsSaving(false));
                }}
              />

              <BaseControl label="Deadline" className="alpaca-deadline-control">
                <div className="alpaca-deadline">
                  <div className="alpaca-deadline-date">
                    {deadline
                      ? date.format(datesettings.formats.date, deadline)
                      : "No deadline set."}
                  </div>

                  <button
                    ref={calendarButtonRef}
                    onClick={() => setIsEditingDeadline((prev) => !prev)}
                    className="button-link"
                  >
                    <span className="dashicons dashicons-calendar"></span>
                  </button>

                  {isEditingDeadline && (
                    <Popover
                      placement="bottom-start"
                      onClose={() => setIsEditingDeadline(false)}
                      anchor={calendarButtonRef.current}
                      focusOnMount={false}
                    >
                      <DatePicker
                        current={deadline}
                        onChange={(newDate) => {
                          setDeadline(newDate);
                          setIsSaving(true);
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
                            .finally(() => {
                              setIsSaving(false);
                              setIsEditingDeadline(false);
                            });
                        }}
                      />
                    </Popover>
                  )}

                  {deadline && (
                    <button
                      onClick={() => {
                        setDeadline(null);
                        setIsSaving(true);
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
                          .finally(() => setIsSaving(false));
                      }}
                      className="button-link"
                    >
                      <span className="dashicons dashicons-trash"></span>
                    </button>
                  )}
                </div>
              </BaseControl>
            </div>
            <AlpacaCommenting
              issueId={issueId}
              onCommentCountChange={onCommentCountChange}
              commentRefreshKey={commentRefreshKey}
            />
          </div>

          <div className="alpaca-issue-sidebar column">
            {issueDetails.meta.screenshot && (
              <div>
                <p>
                  <img
                    src={issueDetails.meta.screenshot}
                    className="alpaca-screenshot"
                    alt="Screenshot"
                    style={{ cursor: "zoom-in", maxWidth: "100%" }}
                    onClick={() => setLightboxSrc(issueDetails.meta.screenshot)}
                  />
                </p>
                <p>
                  <button
                    type="button"
                    className="button-link-delete"
                    disabled={isSaving}
                    onClick={() => {
                      setIsSaving(true);
                      wp.apiFetch({
                        path: `/issue/v1/update/${issueId}`,
                        method: "POST",
                        data: {
                          meta: {
                            screenshot: "",
                          },
                        },
                      })
                        .then(() => {
                          setIssueDetails((prev) => ({
                            ...prev,
                            meta: {
                              ...prev.meta,
                              screenshot: "",
                            },
                          }));
                        })
                        .finally(() => setIsSaving(false));
                    }}
                  >
                    Delete
                  </button>
                </p>
              </div>
            )}
            <table className="">
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
                      new Date(issueDetails.post_data.post_date)
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
                    {issueDetails.meta.screenwidth &&
                    issueDetails.meta.screenheight
                      ? `${issueDetails.meta.screenwidth} x ${issueDetails.meta.screenheight}`
                      : "N/A"}
                  </td>
                </tr>
                {Object.entries(issueDetails.taxonomies)
                  .filter(([taxonomy]) => taxonomy !== "assignee")
                  .map(([taxonomy, terms]) => (
                    <tr key={taxonomy}>
                      <th scope="row" style={{ textTransform: "capitalize" }}>
                        {taxonomy}
                      </th>
                      <td>{terms.map((term) => term.name).join(", ")}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p>{issueDetails?.message || "Could not load issue details."}</p>
      )}

      {lightboxSrc &&
        createPortal(
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
              zIndex: 99999999999999, // higher than Modal
            }}
            onClick={() => setLightboxSrc(null)}
          >
            <img
              src={lightboxSrc}
              alt="Enlarged screenshot"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              }}
            />
          </div>,
          document.body
        )}
    </Modal>
  );
};

export default AlpacaIssue;
