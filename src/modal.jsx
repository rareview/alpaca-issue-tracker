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
          size="large"
          className="alpaca-modal"
          title="Report an issue"
          onRequestClose={closeModal}
        >
          <TextareaControl
            label="Lorem ipsum sed adipiscing"
            placeholder="Explain the problem"
          />
          <div className="alpaca-grid">
            <TextControl
              label="Lorem ipsum sed adipiscing"
              value={12345}
              readonly="readonly"
            />
            <TextControl
              label="Lorem ipsum sed adipiscing"
              value={12345}
              readonly="readonly"
            />
            <TextControl
              label="Lorem ipsum sed adipiscing"
              value={12345}
              readonly="readonly"
            />
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
