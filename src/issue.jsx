import AlpacaCommenting from "./commenting.jsx";
const { useState, useEffect } = wp.element;
const { Modal, FormTokenField } = wp.components;
const { decodeEntities } = wp.htmlEntities;

const AlpacaIssue = ({
  issueId,
  isOpen,
  onClose,
  triggerRef,
  onCommentCountChange,
  onAssigneesChange, // <-- Add this prop
}) => {
  const [issueDetails, setIssueDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [allUsers, setAllUsers] = useState([]); // display names for suggestions
  const [allUserObjects, setAllUserObjects] = useState([]); // full user objects
  const [assignees, setAssignees] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [userMap, setUserMap] = useState({}); // Map display name -> slug

  // Fetch all users and issue details concurrently
  useEffect(() => {
    if (issueId && isOpen) {
      setIsLoadingDetails(true);

      const usersPromise = wp.apiFetch({ path: "/wp/v2/users?per_page=100" });
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

          // 3. Now that the user map is guaranteed to exist, populate assignees
          if (
            issueData.taxonomies &&
            issueData.taxonomies.assignee &&
            Array.isArray(issueData.taxonomies.assignee)
          ) {
            const assigneeNames = issueData.taxonomies.assignee.map((t) => {
              // Find the user's display name from their slug (t.slug)
              const userObject = usersWithAvatar.find(
                (user) => user.slug === t.slug
              );
              return userObject ? userObject.name : t.name; // Fallback to term name
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
      title={
        <>
          Issue Details
          <span className="alpaca-issue-id"> #{issueId}</span>
        </>
      }
      size="large"
      onRequestClose={onClose}
      className="alpaca-details-modal"
    >
      {isLoadingDetails ? (
        <p>Loading...</p>
      ) : issueDetails && issueDetails.success ? (
        <div className="alpaca-issue-details">
          <table className="wp-list-table widefat striped">
            <tbody>
              <tr>
                <th scope="row">Assigned to:</th>
                <td>
                  <FormTokenField
                    label=""
                    value={assignees}
                    suggestions={allUsers}
                    onChange={(newAssignees) => {
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
                          // Notify parent/board to refresh
                          if (typeof onAssigneesChange === "function") {
                            // Find the full user objects for the selected assignees
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
                </td>
              </tr>

              {issueDetails.meta.screenshot && (
                <tr>
                  <th scope="row">Screenshot</th>
                  <td>
                    <p>
                      <img
                        src={issueDetails.meta.screenshot}
                        className="alpaca-screenshot"
                        alt="Screenshot"
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
                              // Remove screenshot from local state
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
                  </td>
                </tr>
              )}
              <tr>
                <th scope="row">Submitted</th>
                <td>
                  {new Date(issueDetails.post_data.post_date).toLocaleString()}{" "}
                  by {issueDetails.post_data.post_author_display_name} (
                  {issueDetails.post_data.post_author})
                </td>
              </tr>
              <tr>
                <th scope="row">Last modified</th>
                <td>
                  {new Date(
                    issueDetails.post_data.post_modified
                  ).toLocaleString()}{" "}
                </td>
              </tr>
              <tr>
                <th scope="row">Description</th>
                <td>{decodeEntities(issueDetails.post_data.post_content)}</td>
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
                <th scope="row">Screen Size</th>
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

          <AlpacaCommenting
            issueId={issueId}
            onCommentCountChange={onCommentCountChange}
          />
        </div>
      ) : (
        <p>{issueDetails?.message || "Could not load issue details."}</p>
      )}
    </Modal>
  );
};

export default AlpacaIssue;
