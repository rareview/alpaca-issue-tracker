import AlpacaModal from './Modal.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import AdminSidebarInboxBadge from './components/notifications/AdminSidebarInboxBadge.jsx';

const DOCUMENTATION_URL = 'https://docs.alpacaissuetracker.com';

/**
 * Mount the Alpaca Issue Tracker UI that should be available across wp-admin screens.
 *
 * @param {Function} mountReactTree           Shared React mount helper.
 * @param {boolean}  contextualCaptureEnabled Whether contextual capture is enabled.
 * @return {void}
 */
export const mountAdminGlobalUi = (
  mountReactTree,
  contextualCaptureEnabled = true,
) => {
  if (
    typeof document === 'undefined' ||
    !document.body.classList.contains('wp-admin')
  ) {
    return;
  }

  if (
    contextualCaptureEnabled &&
    document.querySelector('#wp-admin-bar-alpaca-report')
  ) {
    let adminBarModalContainer = document.getElementById(
      'alpaca-admin-bar-modal-mount',
    );

    if (!adminBarModalContainer) {
      adminBarModalContainer = document.createElement('div');
      adminBarModalContainer.id = 'alpaca-admin-bar-modal-mount';
      document.body.appendChild(adminBarModalContainer);
    }

    mountReactTree(<AlpacaModal />, adminBarModalContainer);
  }

  const projectBoardSubmenu = document.querySelector(
    '#toplevel_page_project-board .wp-submenu',
  );

  if (!projectBoardSubmenu) {
    return;
  }

  const documentationLink = projectBoardSubmenu.querySelector(
    'a[href$="page=alpaca-docs"]',
  );

  if (documentationLink) {
    documentationLink.href = DOCUMENTATION_URL;
    documentationLink.target = '_blank';
    documentationLink.rel = 'noopener noreferrer';
  }

  const projectBoardSubmenuLink = projectBoardSubmenu.querySelector(
    'li.wp-first-item > a',
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

    mountReactTree(
      <NotificationProvider>
        <AdminSidebarInboxBadge />
      </NotificationProvider>,
      menuBadgeMount,
    );
  }
};
