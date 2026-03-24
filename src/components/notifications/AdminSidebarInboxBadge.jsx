import { fetchNotificationInboxCount } from '../../services/notificationApi';
import UnreadCountBadge from './UnreadCountBadge';

const { useCallback, useEffect, useState } = wp.element;

const POLL_INTERVAL_MS = 30000;

/**
 * Render the unread inbox badge in the WordPress admin sidebar.
 *
 * @return {JSX.Element|null} Sidebar badge.
 */
function AdminSidebarInboxBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(() => {
    fetchNotificationInboxCount()
      .then((response) => {
        setUnreadCount(Number(response?.unread_count || 0));
      })
      .catch(() => {
        setUnreadCount(0);
      });
  }, []);

  useEffect(() => {
    loadUnreadCount();

    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        loadUnreadCount();
      }
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadUnreadCount]);

  return <UnreadCountBadge count={unreadCount} variant="admin-menu" />;
}

export default AdminSidebarInboxBadge;
