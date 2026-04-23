import { useNotification } from '../../context/NotificationContext';
import UnreadCountBadge from './UnreadCountBadge';

/**
 * Render the unread inbox badge in the WordPress admin sidebar.
 *
 * @return {JSX.Element|null} Sidebar badge.
 */
function AdminSidebarInboxBadge() {
  const { unreadCount } = useNotification();

  return <UnreadCountBadge count={unreadCount} variant="admin-menu" />;
}

export default AdminSidebarInboxBadge;
