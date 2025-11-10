const { createContext, useState, useEffect, useContext, useCallback } =
  wp.element;
import PropTypes from 'prop-types';

export const WatchlistContext = createContext();

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

  const fetchWatchlist = useCallback(async () => {
    try {
      const response = await wp.apiFetch({ path: '/alpaca/v1/watchlist' });
      if (response.success && Array.isArray(response.watchlist)) {
        setWatchlist(response.watchlist);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const toggleWatch = useCallback(
    async (issueId) => {
      const numericId = Number(issueId);
      const currentWatchlist = watchlist;

      // Optimistically update the UI
      const newWatchlist = currentWatchlist.includes(numericId)
        ? currentWatchlist.filter((id) => id !== numericId)
        : [...currentWatchlist, numericId];
      setWatchlist(newWatchlist);

      // Then send the request to the server
      try {
        const response = await wp.apiFetch({
          path: '/alpaca/v1/watchlist',
          method: 'POST',
          data: { issue_id: numericId },
        });
        // If the server response is different, update the state again to ensure consistency
        if (response.success && Array.isArray(response.watchlist)) {
          setWatchlist(response.watchlist);
        }
      } catch (error) {
        console.error('Error updating watchlist:', error);
        // If the API call fails, revert the optimistic update
        setWatchlist(currentWatchlist);
      }
    },
    [watchlist],
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
