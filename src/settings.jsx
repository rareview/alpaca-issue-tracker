import StatusManager from "./components/StatusManager";
import DefaultStatusSelector from "./components/DefaultStatusSelector";
const { useState, useEffect, useCallback } = wp.element;

const AlpacaSettings = () => {
  const [statuses, setStatuses] = useState([]);
  const [currentStatuses, setCurrentStatuses] = useState([]); // Track current order
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatuses = useCallback(() => {
    setIsLoading(true);
    wp.apiFetch({ path: "/alpaca/v1/statuses" })
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
    <>
      <h2>Status Management</h2>
      <p>
        Define the statuses (columns) for your project board. Use the arrow
        buttons to reorder.
      </p>
      <StatusManager
        statuses={statuses}
        fetchStatuses={fetchStatuses}
        isLoading={isLoading}
        error={error}
        onStatusesChange={handleStatusesOrderChange}
      />
      <hr style={{ marginTop: "2rem" }} />
      <DefaultStatusSelector statuses={currentStatuses} />
    </>
  );
};

export default AlpacaSettings;
