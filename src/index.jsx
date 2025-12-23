import './alpaca.scss';

import './apiTest.js';
import './utils/issueCommentHandler.js';
import './utils/dataDump.js';

import AlpacaModal from './Modal.jsx';
import AlpacaToolbar from './Toolbar.jsx';
import AlpacaSettings from './Settings.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { AlpacaBoard } from './Board.jsx';

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

if (isAdmin && document.querySelector('#wp-admin-bar-alpaca-menu')) {
  render(
    <AlpacaModal />,
    document.querySelector('#wp-admin-bar-alpaca-report'),
  );
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
