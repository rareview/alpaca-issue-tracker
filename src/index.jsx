import './scss/main.scss';

import './utils/issueCommentHandler.js';
import './utils/boardHelpers.js';
import { installAlpacaApiRootMiddleware } from './utils/restApiRoot.js';
import reactMountUtils from './utils/reactMount';
import { initializeAlpacaDataDump } from './utils/dataDump.js';
import './agentic.js';

// Import Prism.js and required languages
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-uri';
import 'prismjs/components/prism-markup';

// Make Prism available globally
window.Prism = Prism;

// Register custom Prism language on load
import './utils/prismKeyValue';

import AlpacaToolbar from './Toolbar.jsx';
import AlpacaSettings from './Settings.jsx';
import AgenticSettings from './AgenticSettings.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { AlpacaBoard } from './Board.jsx';
import Presence from './components/Presence';
import NotificationPreferences from './components/NotificationPreferences.jsx';
import EmailTemplatesScreen from './components/EmailTemplatesScreen.jsx';
import AlpacaDashboardWidget from './DashboardWidget.jsx';
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
const contextualCaptureEnabled =
  typeof window !== 'undefined' &&
  (window.alpaistrSettings?.contextualCaptureEnabled === true ||
    window.alpaistrSettings?.contextualCaptureEnabled === 1 ||
    window.alpaistrSettings?.contextualCaptureEnabled === '1' ||
    typeof window.alpaistrSettings?.contextualCaptureEnabled === 'undefined');
const canViewNotificationInbox =
  typeof window !== 'undefined' &&
  (window.alpaistrSettings?.canViewNotificationInbox === true ||
    window.alpaistrSettings?.canViewNotificationInbox === 1 ||
    window.alpaistrSettings?.canViewNotificationInbox === '1');
const mountReactTree = createMountReactTree({
  createRoot,
  legacyRender,
});

if (isAdmin) {
  if (contextualCaptureEnabled) {
    initializeAlpacaDataDump();
  }

  mountAdminGlobalUi(mountReactTree, contextualCaptureEnabled);
}

if (!isAdmin && contextualCaptureEnabled) {
  initializeAlpacaDataDump();

  const toolbarContainer = document.createElement('div');
  toolbarContainer.id = 'alpaca-toolbar-mount';
  document.body.appendChild(toolbarContainer);

  const toolbar = <AlpacaToolbar showUnreadBadge={canViewNotificationInbox} />;

  mountReactTree(
    canViewNotificationInbox ? (
      <NotificationProvider>{toolbar}</NotificationProvider>
    ) : (
      toolbar
    ),
    toolbarContainer,
  );
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
    console.error(
      'Alpaca Issue Tracker dashboard widget: invalid data-props',
      e,
    );
  }
  mountReactTree(<AlpacaDashboardWidget data={data} />, el);
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

if (document.querySelector('#alpaca-fix-with-ai-page')) {
  mountReactTree(
    <AgenticSettings />,
    document.querySelector('#alpaca-fix-with-ai-page'),
  );
}
