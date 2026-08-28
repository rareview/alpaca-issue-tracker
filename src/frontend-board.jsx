import './scss/main.scss';

import { AlpacaBoard } from './Board.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import Presence from './components/Presence.jsx';
import { installAlpacaApiRootMiddleware } from './utils/restApiRoot.js';

const { createRoot } = wp.element;

installAlpacaApiRootMiddleware();

const boardInstances = window.alpaistrFrontendBoards || {};

Object.entries(boardInstances).forEach(([instanceId, settings]) => {
  const boardMount = document.getElementById(`${instanceId}-board`);

  if (!boardMount) {
    return;
  }

  const presenceMount = document.getElementById(`${instanceId}-presence`);

  if (presenceMount) {
    createRoot(presenceMount).render(<Presence />);
  }

  createRoot(boardMount).render(
    <WatchlistProvider>
      <AlpacaBoard
        boardData={Array.isArray(settings.boardData) ? settings.boardData : []}
        controlsSelector={`#${instanceId}-controls`}
        showFilters={settings.showFilters !== false}
        showAddIssue={settings.isAnonymousReadOnly !== true}
        showInbox={false}
        showSearch={settings.showSearch !== false}
        readOnly={settings.isAnonymousReadOnly === true}
        allowIssueDetail={
          settings.isAnonymousReadOnly !== true ||
          settings.anonymousDetailMode === 'issue_detail'
        }
        publicDetailTokens={settings.publicDetailTokens || {}}
      />
    </WatchlistProvider>,
  );
});
