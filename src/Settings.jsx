import StatusManager from './components/StatusManager';
import EnableTestLogsControl from './components/EnableTestLogsControl';
const { useState, useEffect, useCallback } = wp.element;

const AlpacaSettings = () => {
  const [statuses, setStatuses] = useState([]);
  const [currentStatuses, setCurrentStatuses] = useState([]); // Track current order
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatuses = useCallback(() => {
    setIsLoading(true);
    wp.apiFetch({ path: '/alpaca/v1/statuses' })
      .then((data) => {
        setStatuses(data);
        setCurrentStatuses(data); // Initialize current order
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Handle when StatusManager reorders items
  const handleStatusesOrderChange = useCallback((newOrder) => {
    setCurrentStatuses(newOrder);
  }, []);

  return (
    <div className="alpaca-settings-wrap">
      <StatusManager
        statuses={statuses}
        fetchStatuses={fetchStatuses}
        isLoading={isLoading}
        error={error}
        onStatusesChange={handleStatusesOrderChange}
      />

      <hr />

      <h3>Settings</h3>

      <table className="form-table">
        <tbody>
          <EnableTestLogsControl />
          {/*
           * Action hook for adding additional settings.
           * @param {Object} context - Contains statuses array.
           */}
          {wp.hooks.applyFilters('alpaca.settings.additionalRows', null, {
            statuses: currentStatuses,
          })}
        </tbody>
      </table>

      {/* Extensibility hook for adding custom settings sections */}
      {wp.hooks.applyFilters('alpaca.settings.afterTable', null, {
        statuses: currentStatuses,
      })}
    </div>
  );
};

export default AlpacaSettings;
