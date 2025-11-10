import './alpaca.scss';

import './apiTest.js';
import './utils/issueCommentHandler.js';

import AlpacaModal from './modal.jsx';
import AlpacaSettings from './settings.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { AlpacaBoard, AlpacaBoardControls } from './board.jsx';

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

if (document.querySelector('#alpaca-board-controls')) {
  render(
    <AlpacaBoardControls />,
    document.querySelector('#alpaca-board-controls'),
  );
}
