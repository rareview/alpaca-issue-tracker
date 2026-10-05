/**
 * Plugins-page modal for removing the GitHub setup.
 *
 * Keep this entry free of shared src/utils imports. It loads beside
 * admin-global.js, and Parcel's shared runtime can resolve those modules wrong.
 */
import './scss/components/github-cleanup-modal.scss';
import GithubCleanup from './components/GithubCleanup.jsx';

const { render } = wp.element;
const { Modal } = wp.components;

/**
 * Modal shell around the GitHub cleanup controls.
 *
 * @param {Object}   props         Component props.
 * @param {string}   props.repo    Configured repository.
 * @param {string}   props.title   Modal title.
 * @param {Function} props.onClose Close the modal.
 * @return {JSX.Element} Modal.
 */
const GithubCleanupModal = ({ repo, title, onClose }) => (
  <Modal
    title={title}
    onRequestClose={onClose}
    className="alpaca-github-cleanup-modal"
    size="medium"
  >
    <GithubCleanup repo={repo} showTitle={false} />
  </Modal>
);

/**
 * Mount the cleanup modal into a body node.
 */
const openGithubCleanupModal = () => {
  const config = window.alpacaGithubCleanup || {};
  let container = document.getElementById('alpaca-github-cleanup-modal-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'alpaca-github-cleanup-modal-root';
    document.body.appendChild(container);
  }

  const closeModal = () => {
    render(null, container);
  };

  render(
    <GithubCleanupModal
      repo={config.repo || ''}
      title={config.title || ''}
      onClose={closeModal}
    />,
    container,
  );
};

const trigger = document.getElementById('alpaca-remove-github-setup');
if (trigger) {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openGithubCleanupModal();
  });
}
