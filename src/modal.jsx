/**
 * Documentation: https://developer.wordpress.org/block-editor/reference-guides/components/modal/
 * Storybook: https://wordpress.github.io/gutenberg/?path=/docs/docs-introduction--page
 *
 */

const { Button, Modal, TextControl, TextareaControl } = wp.components;

const { useState } = wp.element;

const AlpacaModal = () => {
  const [isOpen, setOpen] = useState(false);

  const openModal = () => {
    // do extra things
    setOpen(true);
  };
  const closeModal = () => setOpen(false);

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
            label="Lorem ipsum sed adipiscing"
            placeholder="Explain the problem"
          />
          <div className="alpaca-grid">
            <TextControl
              label="Device"
              value={
                alpaca_data.device.vendor +
                " " +
                alpaca_data.device.type +
                " running " +
                alpaca_data.device.os +
                " v" +
                alpaca_data.device.version
              }
              readonly="readonly"
            />
            <TextControl
              label="Browser"
              value={
                alpaca_data.device.browser.name +
                " v" +
                alpaca_data.device.browser.version
              }
              readonly="readonly"
            />
            <TextControl
              label="Window size"
              value={
                alpaca_data.device.browser.width +
                " × " +
                alpaca_data.device.browser.height
              }
              readonly="readonly"
            />
            <small>
              Further technical information will also be shared with the
              development team.
            </small>
          </div>
          <Button variant="primary" onClick={closeModal}>
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
