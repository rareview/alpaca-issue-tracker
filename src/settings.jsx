import StatusManager from "./components/StatusManager";
import DefaultStatusSelector from "./components/DefaultStatusSelector";
const { useState, useEffect, useCallback } = wp.element;

const AlpacaSettings = () => {
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatuses = useCallback(() => {
    setIsLoading(true);
    wp.apiFetch({ path: "/alpaca/v1/statuses" })
      .then((data) => {
        setStatuses(data);
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

  return (
    <>
      <h2>Status Management</h2>
      <p>
        Define the statuses (columns) for your project board. Drag and drop to
        reorder.
      </p>
      <StatusManager statuses={statuses} fetchStatuses={fetchStatuses} isLoading={isLoading} error={error} />
      <hr style={{ marginTop: "2rem" }} />
      <DefaultStatusSelector statuses={statuses} />
    </>
  );
};

export default AlpacaSettings;
