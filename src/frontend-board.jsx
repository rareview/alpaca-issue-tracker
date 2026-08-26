import './scss/main.scss';

import { AlpacaBoard } from './Board.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { installAlpacaApiRootMiddleware } from './utils/restApiRoot.js';

const { createRoot } = wp.element;

installAlpacaApiRootMiddleware();

const boardInstances = window.alpaistrFrontendBoards || {};

Object.entries(boardInstances).forEach(([instanceId, settings]) => {
  const boardMount = document.getElementById(`${instanceId}-board`);

  if (!boardMount) {
    return;
  }

  createRoot(boardMount).render(
    <WatchlistProvider>
      <AlpacaBoard
        boardData={Array.isArray(settings.boardData) ? settings.boardData : []}
        controlsSelector={`#${instanceId}-controls`}
        showFilters={settings.showFilters !== false}
        showInbox={false}
        showSearch={settings.showSearch !== false}
      />
    </WatchlistProvider>,
  );
});
