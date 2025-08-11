import handleSnapdomCapture from "./snapdom-handler.js";

const { Button, Modal, TextareaControl, RangeControl, BaseControl, Spinner } =
  wp.components;
const { useState } = wp.element;

const AlpacaModal = () => {
  const [isOpen, setOpen] = useState(false);
  const [severity, setSeverity] = useState("2");
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  const openModal = () => {
    setMessage("");
    setStatus("idle");
    setFeedback("");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setStatus("idle");
  };

  const submitIssue = async () => {
    setMessage("");

    try {
      // Start the async operation without changing status yet
      const server = JSON.parse(atob(alpaca_data.env));

      // Now set submitting to trigger spinner and disable UI
      setStatus("submitting");

      const screenshot = await handleSnapdomCapture();

      const submitted = {
        userinput: { feedback, severity },
        client: alpaca_data.device,
        screenshot,
      };

      const payload = { ...submitted, ...server };

      const response = await fetch(wpApiSettings.root + "issue/v1/submit", {
        method: "POST",
        credentials: "include",
        headers: new Headers({
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-WP-Nonce": wpApiSettings.nonce,
        }),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      setStatus("success");
      setMessage("Your issue has been submitted successfully.");
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
      setMessage("There was an error submitting your issue. Please try again.");
    }
  };

  return (
    <>
      <a
        className="ab-item"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          openModal();
        }}
      >
        Report an issue
      </a>

      {isOpen && (
        <Modal
          size="medium"
          className="alpaca-modal"
          title="Report an issue"
          onRequestClose={closeModal}
          isDismissible={false}
        >
          {status === "success" || status === "error" ? (
            <>
              <p>{message}</p>
              <Button variant="primary" onClick={closeModal}>
                Close
              </Button>
            </>
          ) : (
            <>
              <TextareaControl
                placeholder="Explain the problem"
                id="alpaca-modal-textarea"
                value={feedback}
                onChange={(value) => setFeedback(value)}
                disabled={status === "submitting"}
              />

              <div className="alpaca-grid">
                <div className="alpaca-row">
                  <div className="alpaca-label">
                    <BaseControl label="Severity" />
                  </div>
                  <div className="alpaca-field">
                    <RangeControl
                      id="alpaca-modal-severity"
                      value={severity}
                      onChange={(s) => setSeverity(s)}
                      marks={[
                        { label: "Low", value: 1 },
                        { label: "Med", value: 2 },
                        { label: "High", value: 3 },
                      ]}
                      max={3}
                      min={1}
                      step={1}
                      withInputField={false}
                      disabled={status === "submitting"}
                    />
                  </div>
                </div>
                <small>
                  Further technical information will also be shared with the
                  development team.
                </small>
              </div>

              <div className="alpaca-actions" style={{ marginTop: "1rem" }}>
                <Button
                  variant="primary"
                  onClick={submitIssue}
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? <Spinner /> : "Submit"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={closeModal}
                  disabled={status === "submitting"}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
};

export default AlpacaModal;
