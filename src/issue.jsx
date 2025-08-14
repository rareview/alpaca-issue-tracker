import AlpacaCommenting from "./commenting.jsx";
const { useState, useEffect } = wp.element;
const { Modal, FormTokenField } = wp.components;

const AlpacaIssue = ({
  issueId,
  isOpen,
  onClose,
  triggerRef,
  onCommentCountChange,
}) => {
  const [issueDetails, setIssueDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [userMap, setUserMap] = useState({}); // Map display name -> slug

  // Fetch all users for suggestions
  useEffect(() => {
    if (isOpen) {
      wp.apiFetch({ path: "/wp/v2/users?per_page=100" }).then((users) => {
        // Map display name and slug for lookup
        const map = {};
        users.forEach((u) => {
          map[u.name] = u.slug;
          map[u.slug] = u.slug; // allow slug as fallback
        });
        setUserMap(map);
        setAllUsers(users.map((u) => u.name)); // suggestions: display names
      });
    }
  }, [isOpen]);

  // Fetch issue details
  useEffect(() => {
    if (issueId && isOpen) {
      setIsLoadingDetails(true);

      wp.apiFetch({
        path: `/issue/v1/get/${issueId}`,
      })
        .then((data) => {
          setIssueDetails(data);
          // Pre-populate assignees from taxonomy
          if (
            data.taxonomies &&
            data.taxonomies.assignee &&
            Array.isArray(data.taxonomies.assignee)
          ) {
            setAssignees(
              data.taxonomies.assignee.map(
                (t) =>
                  Object.keys(userMap).find(
                    (k) => userMap[k] === (t.username || t.name)
                  ) ||
                  t.username ||
                  t.name
              )
            );
          } else {
            setAssignees([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching issue details:", err);
          setIssueDetails({ error: "Failed to load details." });
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    }
  }, [issueId, isOpen, userMap]);

  // Save handler for assignees
  const handleSaveAssignees = () => {
    setIsSaving(true);
    wp.apiFetch({
      path: `/issue/v1/update/${issueId}`,
      method: "POST",
      data: {
        taxonomies: {
          assignee: assignees, // send usernames
        },
      },
    })
      .then(() => {
        // Optionally refetch details or show a notice
      })
      .finally(() => setIsSaving(false));
  };

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
                      // Convert display names to slugs for saving
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
                          // Optionally refetch details or show a notice
                        })
                        .finally(() => setIsSaving(false));
                    }}
                  />
                </td>
              </tr>

              <tr>
                <th scope="row">Screenshot</th>
                <td>
                  <p>
                    <img
                      src={issueDetails.meta.screenshot}
                      alt="Screenshot"
                      style={{ height: "240px" }}
                    />
                  </p>
                </td>
              </tr>
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
                <td>{issueDetails.post_data.post_content}</td>
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
              {Object.entries(issueDetails.taxonomies).map(
                ([taxonomy, terms]) => (
                  <tr key={taxonomy}>
                    <th scope="row" style={{ textTransform: "capitalize" }}>
                      {taxonomy}
                    </th>
                    <td>{terms.map((term) => term.name).join(", ")}</td>
                  </tr>
                )
              )}
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
