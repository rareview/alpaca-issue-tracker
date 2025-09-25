import handleSnapdomCapture from "./snapdom-handler.js";
import { useTestLogger } from "./utils/test-logger.js";

const { Button, Modal, TextareaControl, Spinner, CheckboxControl } =
  wp.components;
const { doAction } = wp.hooks;
const { useState, useRef, useEffect, useCallback } = wp.element;

const AlpacaModal = () => {
  const [isOpen, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [includeContext, setIncludeContext] = useState(true); // <-- new state

  const textareaRef = useRef(null);
  const closeBtnRef = useRef(null);

  const [enableTestLogs, setEnableTestLogs] = useState(false);

  useEffect(() => {
    wp.apiFetch({ path: "/wp/v2/settings" }).then((settings) => {
      setEnableTestLogs(settings.alpaca_enable_test_logs === "1");
    });

    const handleTestLogSettingChange = (value) => {
      setEnableTestLogs(value);
    };

    wp.hooks.addAction(
      "alpaca.enableTestLogsChanged",
      "alpaca/modal",
      handleTestLogSettingChange
    );

    return () => {
      wp.hooks.removeAction("alpaca.enableTestLogsChanged", "alpaca/modal");
    };
  }, []);

  useTestLogger(enableTestLogs);

  const openModal = useCallback(() => {
    setMessage("");
    setStatus("idle");
    setFeedback("");
    setIncludeContext(true); // reset to default each time modal opens
    setOpen(true);
  }, []);

  const closeModal = () => {
    setOpen(false);
    setStatus("idle");
  };

  // Listen for a global event to open the modal
  useEffect(() => {
    const handleOpen = () => openModal();
    wp.hooks.addAction("alpaca.openModal", "alpaca/modal", handleOpen);
    return () => wp.hooks.removeAction("alpaca.openModal", "alpaca/modal");
  }, [openModal]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && status === "idle" && textareaRef.current) {
      setTimeout(() => textareaRef.current.focus(), 10);
    }
  }, [isOpen, status]);

  // Focus close button on success or error
  useEffect(() => {
    if ((status === "success" || status === "error") && closeBtnRef.current) {
      setTimeout(() => closeBtnRef.current.focus(), 10);
    }
  }, [status]);

  const submitIssue = async () => {
    setMessage("");

    try {
      const server = JSON.parse(atob(alpaca_data.env));
      setStatus("submitting");

      const screenshot = await handleSnapdomCapture();

      const submitted = {
        userinput: {
          feedback,
          includeContext, // <-- include checkbox status
        },
        client: alpaca_data.device,
        screenshot,
        errors: alpaca_data.errors,
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

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || `HTTP ${response.status}`);
      }

      setStatus("success");
      setMessage("Your issue has been submitted successfully.");

      doAction(
        "alpaca.issueSubmitted",
        responseData.issue,
        responseData.statusId
      );

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
                <CheckboxControl
                  id="alpaca-include-context"
                  checked={includeContext}
                  onChange={(val) => setIncludeContext(val)} // <-- update state
                  label="Include full context with report?"
                  help="Always do this, unless you are sure it is not relevant"
                  disabled={status === "submitting"}
                />
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
