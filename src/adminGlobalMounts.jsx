import AlpacaModal from './Modal.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import AdminSidebarInboxBadge from './components/notifications/AdminSidebarInboxBadge.jsx';

/**
 * Mount the Alpaca UI that should be available across wp-admin screens.
 *
 * @param {Function} mountReactTree Shared React mount helper.
 * @return {void}
 */
export const mountAdminGlobalUi = (mountReactTree) => {
  if (
    typeof document === 'undefined' ||
    !document.body.classList.contains('wp-admin')
  ) {
    return;
  }

  if (document.querySelector('#wp-admin-bar-alpaca-report')) {
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

  const projectBoardSubmenuLink = document.querySelector(
    '#toplevel_page_project-board .wp-submenu li.wp-first-item > a',
  );

  if (!projectBoardSubmenuLink) {
    return;
  }

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
};
