const { useState, useEffect, useCallback, useMemo } = wp.element;
const { SelectControl, Spinner } = wp.components;

const DefaultStatusSelector = ({ statuses, onDefaultChange }) => {
  const [defaultStatus, setDefaultStatus] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchOption = useCallback(() => {
    setIsFetching(true);
    wp.apiFetch({
      path: "/alpaca/v1/options/default_status",
    })
      .then((option) => {
        const value = option.value ? option.value.toString() : "";
        setDefaultStatus(value);
        // Notify parent of the initial value
        if (onDefaultChange) {
          onDefaultChange(value);
        }
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Could not load default status settings.");
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, []);

  useEffect(() => {
    fetchOption();
  }, [fetchOption]);

  const handleStatusChange = (newValue) => {
    setIsSaving(true);
    setDefaultStatus(newValue);

    // Notify parent of the change
    if (onDefaultChange) {
      onDefaultChange(newValue);
    }

    wp.apiFetch({
      path: "/alpaca/v1/options/default_status",
      method: "POST",
      data: { value: newValue },
    })
      .catch((err) => {
        console.error("Error saving default status:", err);
        alert("Error saving setting: " + err.message);
        fetchOption(); // Revert on error
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  // Memoize status options to ensure they update when statuses order changes
  const statusOptions = useMemo(
    () => [
      { label: "Select a default status...", value: "" },
      ...statuses.map((status) => ({
        label: status.name,
        value: status.term_id.toString(),
      })),
    ],
    [statuses]
  );

  if (error) {
    return <p className="alpaca-error">{error}</p>;
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Default Status for New Issues</h2>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <SelectControl
          label="Default Status"
          hideLabelFromVision={true}
          value={defaultStatus}
          options={statusOptions}
          onChange={handleStatusChange}
          disabled={isSaving || isFetching}
        />
        {(isFetching || isSaving) && <Spinner />}
      </div>
    </div>
  );
};

export default DefaultStatusSelector;
