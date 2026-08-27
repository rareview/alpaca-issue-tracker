import './scss/main.scss';

import Activity from './Activity.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';

const { createRoot } = wp.element;

document.querySelectorAll('[data-alpaca-project-activity]').forEach((mount) => {
  createRoot(mount).render(
    <WatchlistProvider>
      <Activity isPopover rootId={mount.dataset.alpacaProjectActivity} />
    </WatchlistProvider>,
  );
});
