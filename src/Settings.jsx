import StatusManager from './components/StatusManager';
import DefaultStatusSelector from './components/DefaultStatusSelector';
import EnableTestLogsControl from './components/EnableTestLogsControl';
const { useState, useEffect, useCallback } = wp.element;

const AlpacaSettings = () => {
  const [statuses, setStatuses] = useState([]);
  const [currentStatuses, setCurrentStatuses] = useState([]); // Track current order
  const [defaultStatusId, setDefaultStatusId] = useState(''); // Track default status
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

  // Handle when DefaultStatusSelector changes the default
  const handleDefaultStatusChange = useCallback((newDefaultId) => {
    setDefaultStatusId(newDefaultId);
  }, []);

  return (
    <div className="alpaca-settings-wrap">
      <StatusManager
        statuses={statuses}
        fetchStatuses={fetchStatuses}
        isLoading={isLoading}
        error={error}
        onStatusesChange={handleStatusesOrderChange}
        defaultStatusId={defaultStatusId}
      />

      <hr />

      <h3>Settings</h3>

      <table className="form-table">
        <tbody>
          <DefaultStatusSelector
            statuses={currentStatuses}
            onDefaultChange={handleDefaultStatusChange}
          />
          <EnableTestLogsControl />
        </tbody>
      </table>
    </div>
  );
};

export default AlpacaSettings;
