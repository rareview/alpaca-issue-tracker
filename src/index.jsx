import './scss/main.scss';

import './utils/issueCommentHandler.js';
import './utils/dataDump.js';
import './utils/boardHelpers.js';
import { installAlpacaApiRootMiddleware } from './utils/restApiRoot.js';

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
import Presence from './components/Presence';
import NotificationPreferences from './components/NotificationPreferences.jsx';
import EmailTemplatesScreen from './components/EmailTemplatesScreen.jsx';
import AdminSidebarInboxBadge from './components/notifications/AdminSidebarInboxBadge.jsx';
import AlpacaDashboardWidget from './DashboardWidget.jsx';
import About from './about/About.jsx';
import Activity from './Activity.jsx';

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

installAlpacaApiRootMiddleware();

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

if (isAdmin) {
  const projectBoardSubmenuLink = document.querySelector(
    '#toplevel_page_project-board .wp-submenu li.wp-first-item > a',
  );

  if (projectBoardSubmenuLink) {
    let menuBadgeMount = projectBoardSubmenuLink.querySelector(
      '.alpaca-admin-menu-badge-mount',
    );

    if (!menuBadgeMount) {
      menuBadgeMount = document.createElement('span');
      menuBadgeMount.className = 'alpaca-admin-menu-badge-mount';
      projectBoardSubmenuLink.appendChild(menuBadgeMount);
    }

    render(<AdminSidebarInboxBadge />, menuBadgeMount);
  }
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

if (document.querySelector('#project-board')) {
  render(
    <WatchlistProvider>
      <AlpacaBoard />
    </WatchlistProvider>,
    document.querySelector('#project-board'),
  );
}

// Mount presence widget into the board admin page placeholder.
if (
  typeof document !== 'undefined' &&
  document.getElementById('alpaca-presence')
) {
  const el = document.getElementById('alpaca-presence');
  render(<Presence />, el);
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

if (document.querySelector('#alpaca-activity-page')) {
  render(
    <WatchlistProvider>
      <Activity />
    </WatchlistProvider>,
    document.querySelector('#alpaca-activity-page'),
  );
}

if (document.querySelector('#alpaca-notifications-page')) {
  render(
    <NotificationPreferences />,
    document.querySelector('#alpaca-notifications-page'),
  );
}

if (document.querySelector('#alpaca-email-templates-page')) {
  render(
    <EmailTemplatesScreen />,
    document.querySelector('#alpaca-email-templates-page'),
  );
}
