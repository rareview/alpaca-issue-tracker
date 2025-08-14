import AlpacaUser from "./user";
const { useState, useEffect } = wp.element;
const { Modal, TextareaControl, Button } = wp.components;

const AlpacaIssue = ({ issueId, isOpen, onClose, triggerRef }) => {
  const [issueDetails, setIssueDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // When the modal closes, return focus to the element that opened it.
  useEffect(() => {
    if (!isOpen && triggerRef && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    if (issueId && isOpen) {
      setIsLoadingDetails(true);
      setIssueDetails(null); // Clear previous details

      wp.apiFetch({
        path: `/issue/v1/get/${issueId}`,
      })
        .then((data) => {
          setIssueDetails(data);
          setIsLoadingDetails(false);
        })
        .catch((err) => {
          console.error("Error fetching issue details:", err);
          setIssueDetails({ error: "Failed to load details." });
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

          <h3>Comments</h3>

          <div id="alpaca-comments" className="alpaca-grid">
            <div className="alpaca-row">
              <div className="alpaca-meta">
                <AlpacaUser />
              </div>
              <div className="alpaca-comment">
                <TextareaControl
                  placeholder="Not implemented yet"
                  id="alpaca-comment-textarea"
                  value={""} // No comment input in this version
                  onChange={() => {}}
                  disabled={true} // Disable input for now
                />
                <Button isPrimary>Submit Comment</Button>
              </div>
            </div>

            <div className="alpaca-row">
              <div className="alpaca-meta">
                <div className="alpaca-author">Author</div>
              </div>
              <div className="alpaca-comment">Comment</div>
            </div>
          </div>
        </div>
      ) : (
        <p>{issueDetails?.message || "Could not load issue details."}</p>
      )}
    </Modal>
  );
};

export default AlpacaIssue;
