const { useEffect, useState, useRef, useCallback, memo } = wp.element;
const { __ } = wp.i18n;
const apiFetch = wp.apiFetch;
import User from './User';

/**
 * Presence component: shows who else is currently viewing the board.
 * Pings /alpaca/v1/presence and syncs with WP Heartbeat when available.
 *
 * @return {JSX.Element} Presence list or empty message
 */
const PING_INTERVAL_MS = 10000; // Ping every 10s to reduce request frequency.

const Presence = memo(function Presence() {
  const [presentUsers, setPresentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastPingRef = useRef(0);

  const fetchPresence = useCallback((force = false) => {
    if (typeof document !== 'undefined' && document.hidden && !force) return;
    if (!force && Date.now() - lastPingRef.current < PING_INTERVAL_MS) {
      return;
    }
    lastPingRef.current = Date.now();

    if (typeof apiFetch !== 'function') return;

    apiFetch({ path: '/alpaca/v1/presence', method: 'POST', data: {} })
      .then((resp) => {
        const users = Array.isArray(resp.present_users)
          ? resp.present_users
          : [];
        setPresentUsers(users);
      })
      .catch(() => {
        /* Keep previous list on error to avoid flicker */
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const heartbeatHandler = () => fetchPresence(true);

    fetchPresence(true); // Initial ping immediately

    if (typeof wp !== 'undefined' && wp.heartbeat && wp.heartbeat.on) {
      wp.heartbeat.on('tick', heartbeatHandler);
    }

    const iv = setInterval(() => fetchPresence(false), PING_INTERVAL_MS);

    const onVisibility = () => {
      if (!document.hidden) fetchPresence(true); // Ping when tab visible
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (typeof wp !== 'undefined' && wp.heartbeat && wp.heartbeat.off) {
        wp.heartbeat.off('tick', heartbeatHandler);
      }
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchPresence]);

  if (isLoading) {
    return <div className="alpaca-presence-loading">Loading ...</div>;
  }

  if (!presentUsers || presentUsers.length === 0) {
    return (
      <div className="alpaca-presence-msg alpaca-presence-empty">
        {__(
          'Nobody else is viewing the board right now',
          'alpaca-issue-tracker',
        )}
      </div>
    );
  }

  return (
    <div className="alpaca-presence-list">
      <div className="alpaca-presence-msg">
        {__('Currently viewing the board: ', 'alpaca-issue-tracker')}
      </div>
      {presentUsers.map((u) => {
        const name =
          u.display_name ||
          u.displayName ||
          u.user_nicename ||
          __('User', 'alpaca-issue-tracker');
        return (
          <span
            key={u.id}
            className="alpaca-presence-user-wrap alpaca-board-tooltip"
            data-tooltip={name}
            title={name}
          >
            <User user={u} showAvatar={true} showName={true} />
          </span>
        );
      })}
    </div>
  );
});

Presence.displayName = 'Presence';

export default Presence;
