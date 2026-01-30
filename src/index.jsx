import './alpaca.scss';

import './apiTest.js';
import './utils/issueCommentHandler.js';
import './utils/dataDump.js';
import './utils/boardHelpers.js';

import AlpacaModal from './Modal.jsx';
import AlpacaToolbar from './Toolbar.jsx';
import AlpacaSettings from './Settings.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { AlpacaBoard } from './Board.jsx';
import Presence from './components/Presence';
import AlpacaDashboardWidget from './DashboardWidget.jsx';
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

const { render, createElement } = wp.element;
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

// Mount presence widget into the board admin page placeholder.
if (
  typeof document !== 'undefined' &&
  document.getElementById('alpaca-presence')
) {
  const el = document.getElementById('alpaca-presence');
  render(createElement(Presence), el);
}

if (document.querySelector('#alpaca-dashboard-widget')) {
  const el = document.querySelector('#alpaca-dashboard-widget');
  let data = null;
  try {
    data = el.dataset.props ? JSON.parse(el.dataset.props) : null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Alpaca dashboard widget: invalid data-props', e);
  }
  render(<AlpacaDashboardWidget data={data} />, el);
}

if (document.querySelector('#alpaca-about-page')) {
  render(<About />, document.querySelector('#alpaca-about-page'));
}
