import './scss/main.scss';

import './utils/issueCommentHandler.js';
import './utils/dataDump.js';
import './utils/boardHelpers.js';
import { installAlpacaApiRootMiddleware } from './utils/restApiRoot.js';
import reactMountUtils from './utils/reactMount';

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

import AlpacaToolbar from './Toolbar.jsx';
import AlpacaSettings from './Settings.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { AlpacaBoard } from './Board.jsx';
import Presence from './components/Presence';
import NotificationPreferences from './components/NotificationPreferences.jsx';
import EmailTemplatesScreen from './components/EmailTemplatesScreen.jsx';
import AlpacaDashboardWidget from './DashboardWidget.jsx';
import About from './about/About.jsx';
import Activity from './Activity.jsx';
import { mountAdminGlobalUi } from './adminGlobalMounts.jsx';

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

const { createRoot, render: legacyRender } = wp.element;
const { createMountReactTree } = reactMountUtils;
const isAdmin = document.body.classList.contains('wp-admin');
const mountReactTree = createMountReactTree({
  createRoot,
  legacyRender,
});

if (isAdmin) {
  mountAdminGlobalUi(mountReactTree);
}

if (!isAdmin) {
  const toolbarContainer = document.createElement('div');
  toolbarContainer.id = 'alpaca-toolbar-mount';
  document.body.appendChild(toolbarContainer);
  mountReactTree(<AlpacaToolbar />, toolbarContainer);
}

if (document.querySelector('#alpaca-settings-internal')) {
  mountReactTree(
    <AlpacaSettings />,
    document.querySelector('#alpaca-settings-internal'),
  );
}

if (document.querySelector('#project-board')) {
  mountReactTree(
    <NotificationProvider>
      <WatchlistProvider>
        <AlpacaBoard />
      </WatchlistProvider>
    </NotificationProvider>,
    document.querySelector('#project-board'),
  );
}

// Mount presence widget into the board admin page placeholder.
if (
  typeof document !== 'undefined' &&
  document.getElementById('alpaca-presence')
) {
  const el = document.getElementById('alpaca-presence');
  mountReactTree(<Presence />, el);
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
  mountReactTree(<AlpacaDashboardWidget data={data} />, el);
}

if (document.querySelector('#alpaca-about-page')) {
  mountReactTree(<About />, document.querySelector('#alpaca-about-page'));
}

if (document.querySelector('#alpaca-activity-page')) {
  mountReactTree(
    <NotificationProvider>
      <WatchlistProvider>
        <Activity />
      </WatchlistProvider>
    </NotificationProvider>,
    document.querySelector('#alpaca-activity-page'),
  );
}

if (document.querySelector('#alpaca-notifications-page')) {
  mountReactTree(
    <NotificationPreferences />,
    document.querySelector('#alpaca-notifications-page'),
  );
}

if (document.querySelector('#alpaca-email-templates-page')) {
  mountReactTree(
    <EmailTemplatesScreen />,
    document.querySelector('#alpaca-email-templates-page'),
  );
}
