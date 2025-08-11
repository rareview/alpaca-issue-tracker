/**
 * Documentation: https://developer.wordpress.org/block-editor/reference-guides/components/modal/
 * Storybook: https://wordpress.github.io/gutenberg/?path=/docs/docs-introduction--page
 *
 */

const {
  Button,
  Modal,
  TextControl,
  TextareaControl,
  RangeControl,
  BaseControl,
} = wp.components;

const { useState } = wp.element;

const AlpacaModal = () => {
  const [isOpen, setOpen] = useState(false);

  const openModal = () => {
    // do extra things
    setOpen(true);
  };
  const closeModal = () => setOpen(false);

  const submitIssue = () => {
    const feedback = document.querySelector("#alpaca-modal-textarea").value;

    const server_json = atob(alpaca_data.env);
    const server = JSON.parse(server_json);

    const submitted = {
      userinput: {
        feedback: feedback,
        severity: severity,
      },
      client: alpaca_data.device,
      screenshot: img_base64,
    };

    const payload = Object.assign(submitted, server); // merge server into submitted

    console.log(payload);

    closeModal();
  };

  // Sets a default severity value
  const [severity, setSeverity] = useState("2");

  return (
    <>
      <a className="ab-item" href="#" onClick={openModal}>
        Report an issue
      </a>
      {isOpen && (
        <Modal
          size="medium"
          className="alpaca-modal"
          title="Report an issue"
          onRequestClose={closeModal}
          isDismissible={false} // hides default Close button
        >
          <TextareaControl
            placeholder="Explain the problem"
            onChange={() => {}}
            id="alpaca-modal-textarea"
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
                    {
                      label: "Low",
                      value: 1,
                    },
                    {
                      label: "Med",
                      value: 2,
                    },
                    {
                      label: "High",
                      value: 3,
                    },
                  ]}
                  max={3}
                  min={1}
                  onBlur={() => {}}
                  onFocus={() => {}}
                  onMouseLeave={() => {}}
                  onMouseMove={() => {}}
                  step={1}
                  withInputField={false}
                />
              </div>
            </div>

            <small>
              Further technical information will also be shared with the
              development team.
            </small>
          </div>
          <Button variant="primary" onClick={submitIssue}>
            Submit
          </Button>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
        </Modal>
      )}
    </>
  );
};

export default AlpacaModal;
