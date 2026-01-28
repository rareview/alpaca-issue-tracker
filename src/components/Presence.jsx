/* global jQuery */
const { useEffect, useState, useRef, useCallback } = wp.element;
const { __ } = wp.i18n;
const apiFetch = wp.apiFetch;
import User from './User';

const Presence = () => {
  const [presentUsers, setPresentUsers] = useState([]);
  const lastPingRef = useRef(0);
  const MIN_PING_INTERVAL = 15000; // ms

  const fetchPresence = useCallback(() => {
    if (typeof document !== 'undefined' && document.hidden) return;
    if (Date.now() - lastPingRef.current < MIN_PING_INTERVAL) return;
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
        /* noop */
      });
  }, []);

  useEffect(() => {
    fetchPresence();

    if (typeof wp !== 'undefined' && wp.heartbeat && wp.heartbeat.on) {
      wp.heartbeat.on('tick', fetchPresence);
    }

    // jQuery heartbeat fallback if available.
    if (typeof jQuery !== 'undefined' && jQuery && jQuery(document).on) {
      jQuery(document).on('heartbeat-tick.alpaca_presence', fetchPresence);
    }

    const iv = setInterval(fetchPresence, MIN_PING_INTERVAL);

    const onVisibility = () => {
      if (!document.hidden) fetchPresence();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (typeof wp !== 'undefined' && wp.heartbeat && wp.heartbeat.off) {
        wp.heartbeat.off('tick', fetchPresence);
      }
      if (typeof jQuery !== 'undefined' && jQuery && jQuery(document).off) {
        jQuery(document).off('heartbeat-tick.alpaca_presence', fetchPresence);
      }
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchPresence]);

  if (!presentUsers || presentUsers.length === 0) {
    return (
      <div className="alpaca-presence-msg alpaca-presence-empty">
        {__('Nobody else is viewing the board right now', 'alpaca')}
      </div>
    );
  }

  return (
    <div className="alpaca-presence-list">
      <div className="alpaca-presence-msg">
        {__('Currently viewing the board: ', 'alpaca')}
      </div>
      {presentUsers.map((u) => (
        <User key={u.id} user={u} showAvatar={true} showName={true} />
      ))}
    </div>
  );
};

export default Presence;
