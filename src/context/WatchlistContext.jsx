const { createContext, useState, useEffect, useContext, useCallback, useRef } =
  wp.element;
import PropTypes from 'prop-types';

export const WatchlistContext = createContext();
const WATCHLIST_UPDATED_ACTION = 'alpaca.watchlistUpdated';

/**
 * Normalize watchlist IDs into a unique numeric array.
 *
 * @param {Array} list Raw watchlist array.
 * @return {Array<number>} Normalized watchlist.
 */
function normalizeWatchlist(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];

  list.forEach((value) => {
    const numericId = Number(value);
    if (numericId <= 0 || seen.has(numericId)) {
      return;
    }
    seen.add(numericId);
    normalized.push(numericId);
  });

  return normalized;
}

/**
 * Compare two watchlists as unordered sets.
 *
 * @param {Array<number>} a First watchlist.
 * @param {Array<number>} b Second watchlist.
 * @return {boolean} Whether both lists have the same IDs.
 */
function areWatchlistsEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  const aSet = new Set(a);
  for (const id of b) {
    if (!aSet.has(id)) {
      return false;
    }
  }

  return true;
}

/**
 * WatchlistProvider component that manages watchlist state.
 *
 * @param {Object} root0          - Props object
 * @param {*}      root0.children - Child components
 * @return {JSX.Element} WatchlistProvider component
 */
export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enableTestLogs, setEnableTestLogs] = useState(false);
  const watchlistRef = useRef([]);
  const instanceIdRef = useRef(
    `watchlist-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const actionNamespaceRef = useRef(
    `alpaca/watchlist/${Math.random().toString(36).slice(2)}`,
  );

  const applyWatchlist = useCallback(
    (nextWatchlist, shouldBroadcast = true) => {
      const normalized = normalizeWatchlist(nextWatchlist);
      if (areWatchlistsEqual(watchlistRef.current, normalized)) {
        return;
      }

      setWatchlist(normalized);
      watchlistRef.current = normalized;

      if (
        shouldBroadcast &&
        wp &&
        wp.hooks &&
        typeof wp.hooks.doAction === 'function'
      ) {
        wp.hooks.doAction(WATCHLIST_UPDATED_ACTION, {
          source: instanceIdRef.current,
          watchlist: normalized,
        });
      }
    },
    [],
  );

  const emitWatchlistSyncedDebug = useCallback(
    (source, syncedWatchlist) => {
      if (!enableTestLogs) {
        return;
      }

      if (!wp || !wp.hooks || typeof wp.hooks.doAction !== 'function') {
        return;
      }

      wp.hooks.doAction('alpaca.watchlistSynced', {
        source,
        target: instanceIdRef.current,
        count: syncedWatchlist.length,
        watchlist: syncedWatchlist,
        timestamp: new Date().toISOString(),
      });
    },
    [enableTestLogs],
  );

  useEffect(() => {
    const instanceId = instanceIdRef.current;
    const actionNamespace = `alpaca/watchlist-logs/${instanceId}`;

    wp.apiFetch({ path: '/wp/v2/settings' })
      .then((settings) => {
        setEnableTestLogs(settings.alpaca_enable_test_logs === '1');
      })
      .catch(() => {
        setEnableTestLogs(false);
      });

    const handleTestLogSettingChange = (newValue) => {
      setEnableTestLogs(!!newValue);
    };

    wp.hooks.addAction(
      'alpaca.enableTestLogsChanged',
      actionNamespace,
      handleTestLogSettingChange,
    );

    return () => {
      wp.hooks.removeAction('alpaca.enableTestLogsChanged', actionNamespace);
    };
  }, []);

  const fetchWatchlist = useCallback(async () => {
    try {
      const response = await wp.apiFetch({ path: '/alpaca/v1/watchlist' });
      if (response.success && Array.isArray(response.watchlist)) {
        applyWatchlist(response.watchlist, true);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  }, [applyWatchlist]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  useEffect(() => {
    const actionNamespace = actionNamespaceRef.current;

    const handleWatchlistUpdated = (payload = {}) => {
      if (!payload || payload.source === instanceIdRef.current) {
        return;
      }

      if (!Array.isArray(payload.watchlist)) {
        return;
      }

      applyWatchlist(payload.watchlist, false);
      emitWatchlistSyncedDebug(payload.source, payload.watchlist);
    };

    wp.hooks.addAction(
      WATCHLIST_UPDATED_ACTION,
      actionNamespace,
      handleWatchlistUpdated,
    );

    return () => {
      wp.hooks.removeAction(WATCHLIST_UPDATED_ACTION, actionNamespace);
    };
  }, [applyWatchlist, emitWatchlistSyncedDebug]);

  const toggleWatch = useCallback(
    async (issueId) => {
      const numericId = Number(issueId);
      if (numericId <= 0) {
        return;
      }

      const currentWatchlist = watchlistRef.current;

      // Optimistically update the UI
      const newWatchlist = currentWatchlist.includes(numericId)
        ? currentWatchlist.filter((id) => id !== numericId)
        : [...currentWatchlist, numericId];
      applyWatchlist(newWatchlist, true);

      // Then send the request to the server
      try {
        const response = await wp.apiFetch({
          path: '/alpaca/v1/watchlist',
          method: 'POST',
          data: {
            issue_id: numericId,
          },
        });
        // If the server response is different, update the state again to ensure consistency
        if (response.success && Array.isArray(response.watchlist)) {
          applyWatchlist(response.watchlist, true);
        }
      } catch (error) {
        console.error('Error updating watchlist:', error);
        // If the API call fails, revert the optimistic update
        applyWatchlist(currentWatchlist, true);
      }
    },
    [applyWatchlist],
  );

  const isWatched = (issueId) => {
    return watchlist.includes(Number(issueId));
  };

  const value = {
    watchlist,
    loading,
    toggleWatch,
    isWatched,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};

WatchlistProvider.propTypes = {
  children: PropTypes.node,
};

export const useWatchlist = () => {
  return useContext(WatchlistContext);
};
