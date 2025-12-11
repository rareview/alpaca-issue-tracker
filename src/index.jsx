import './alpaca.scss';

import './apiTest.js';
import './utils/issueCommentHandler.js';

import AlpacaModal from './Modal.jsx';
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
if (document.querySelector('#wp-admin-bar-alpaca-menu')) {
  render(
    <AlpacaModal />,
    document.querySelector('#wp-admin-bar-alpaca-report'),
  );
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
