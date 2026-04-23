import PropTypes from 'prop-types';
import { fetchNotificationInboxCount } from '../services/notificationApi';

const {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
} = wp.element;

const NotificationContext = createContext();

const POLL_INTERVAL_MS = 30000;

const unreadCountStore = {
  count: 0,
  listeners: new Set(),
  isPolling: false,
  subscribe: (listener) => {
    unreadCountStore.listeners.add(listener);
    return () => unreadCountStore.listeners.delete(listener);
  },
  getSnapshot: () => unreadCountStore.count,
  updateCount: (newCount) => {
    unreadCountStore.count = newCount;
    unreadCountStore.listeners.forEach((cb) => cb());
  },
  startPolling: () => {
    if (unreadCountStore.isPolling) return;
    unreadCountStore.isPolling = true;
    // polling logic here
  },
};

export const NotificationProvider = ({ children }) => {
  const unreadCount = useSyncExternalStore(
    unreadCountStore.subscribe,
    unreadCountStore.getSnapshot,
  );

  const loadUnreadCount = useCallback(() => {
    fetchNotificationInboxCount()
      .then((response) => {
        unreadCountStore.updateCount(Number(response?.unread_count || 0));
      })
      .catch(() => {
        unreadCountStore.updateCount(0);
      });
  }, []);

  useEffect(() => {
    if (unreadCountStore.isPolling) return;
    unreadCountStore.isPolling = true;

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
      unreadCountStore.isPolling = false;
    };
  }, [loadUnreadCount]);

  const updateUnreadCount = useCallback((newCount) => {
    unreadCountStore.updateCount(Number(newCount || 0));
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, updateUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
