import handleSnapdomCapture from "./snapdom-handler.js";

const { Button, Modal, TextareaControl, RangeControl, BaseControl, Spinner } =
  wp.components;
const { useState, useRef, useEffect, useCallback } = wp.element;

const AlpacaModal = () => {
  const [isOpen, setOpen] = useState(false);
  const [severity, setSeverity] = useState("2");
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  const textareaRef = useRef(null);
  const closeBtnRef = useRef(null);

  const openModal = useCallback(() => {
    setMessage("");
    setStatus("idle");
    setFeedback("");
    setOpen(true);
  }, []);

  const closeModal = () => {
    setOpen(false);
    setStatus("idle");
  };

  // Listen for a global event to open the modal
  useEffect(() => {
    const handleOpen = () => openModal();
    document.addEventListener("alpaca:open-modal", handleOpen);
    return () => document.removeEventListener("alpaca:open-modal", handleOpen);
  }, [openModal]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && status === "idle" && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 10);
    }
  }, [isOpen, status]);

  // Focus close button on success or error
  useEffect(() => {
    if ((status === "success" || status === "error") && closeBtnRef.current) {
      setTimeout(() => {
        closeBtnRef.current.focus();
      }, 10);
    }
  }, [status]);

  const submitIssue = async () => {
    setMessage("");

    try {
      const server = JSON.parse(atob(alpaca_data.env));
      setStatus("submitting");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const screenshot = await handleSnapdomCapture();

      const submitted = {
        userinput: { feedback, severity },
        client: alpaca_data.device,
        screenshot,
      };

      const payload = { ...submitted, ...server };
      // console.log(payload);

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

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || `HTTP ${response.status}`);
      }

      setStatus("success");
      setMessage("Your issue has been submitted successfully.");

      // If on the board page, dispatch an event to add the new issue
      if (document.getElementById("alpaca-board")) {
        document.dispatchEvent(
          new CustomEvent("alpaca:issue-submitted", {
            detail: {
              issue: responseData.issue,
              statusId: responseData.statusId,
            },
          })
        );
      }

      setTimeout(closeModal, 1500);
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
        Report An Issue
      </a>

      {isOpen && (
        <Modal
          size="medium"
          className="alpaca-modal"
          title={
            status === "success"
              ? "Issue Submitted"
              : status === "error"
              ? "Submission Failed"
              : "Report An Issue"
          }
          onRequestClose={closeModal}
          isDismissible={false}
        >
          {status === "success" || status === "error" ? (
            <>
              <p>{message}</p>
              <Button variant="primary" onClick={closeModal} ref={closeBtnRef}>
                Close
              </Button>
            </>
          ) : (
            <>
              <TextareaControl
                placeholder="Describe the problem"
                id="alpaca-modal-textarea"
                value={feedback}
                onChange={(value) => setFeedback(value)}
                disabled={status === "submitting"}
                ref={textareaRef}
              />

              <div className="small-wrapper">
                <small>
                  Detailed technical information will also be shared with the
                  development team.
                </small>
              </div>

              <div className="alpaca-actions">
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
