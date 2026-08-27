import './scss/main.scss';

import InboxControl from './components/InboxControl.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

const { createRoot } = wp.element;

document.querySelectorAll('[data-alpaca-inbox]').forEach((mount) => {
  createRoot(mount).render(
    <NotificationProvider>
      <InboxControl isEmbedded />
    </NotificationProvider>,
  );
});
