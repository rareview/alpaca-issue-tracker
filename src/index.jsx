import './alpaca.scss';

import './apiTest.js';
import './utils/issueCommentHandler.js';
import './utils/dataDump.js';
import './utils/boardHelpers.js';

// Import Prism.js and required languages
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-uri';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism.css';

// Make Prism available globally
window.Prism = Prism;

// Register custom Prism language on load
import './utils/prismKeyValue';

import AlpacaModal from './Modal.jsx';
import AlpacaToolbar from './Toolbar.jsx';
import AlpacaSettings from './Settings.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { AlpacaBoard } from './Board.jsx';
import About from './about/About.jsx';

import { fetchAllAssignees } from './services/userApi.js';
import {
  fetchIssue,
  updateIssue,
  fetchStatuses,
  fetchUsers,
  fetchIssueCommentCount,
} from './services/issueApi.js';

if (!window.alpaca) {
  window.alpaca = {};
}
if (!window.alpaca.services) {
  window.alpaca.services = {};
}

window.alpaca.services.userApi = { fetchAllAssignees };
window.alpaca.services.issueApi = {
  fetchIssue,
  updateIssue,
  fetchStatuses,
  fetchUsers,
  fetchIssueCommentCount,
};

const { render } = wp.element;
const isAdmin = document.body.classList.contains('wp-admin');

if (isAdmin && document.querySelector('#wp-admin-bar-alpaca-report')) {
  const adminBarModalContainer = document.createElement('div');
  adminBarModalContainer.id = 'alpaca-admin-bar-modal-mount';
  document.body.appendChild(adminBarModalContainer);
  render(<AlpacaModal />, adminBarModalContainer);
}

if (!isAdmin) {
  const toolbarContainer = document.createElement('div');
  toolbarContainer.id = 'alpaca-toolbar-mount';
  document.body.appendChild(toolbarContainer);
  render(<AlpacaToolbar />, toolbarContainer);
}

if (document.querySelector('#alpaca-settings-internal')) {
  render(
    <AlpacaSettings />,
    document.querySelector('#alpaca-settings-internal'),
  );
}

if (document.querySelector('#alpaca-board')) {
  render(
    <WatchlistProvider>
      <AlpacaBoard />
    </WatchlistProvider>,
    document.querySelector('#alpaca-board'),
  );
}

if (document.querySelector('#alpaca-about-page')) {
  render(<About />, document.querySelector('#alpaca-about-page'));
}
