const { useState, useEffect, useCallback, useMemo } = wp.element;
const { SelectControl, Spinner } = wp.components;
import PropTypes from 'prop-types';

const DefaultStatusSelector = ({ statuses, onDefaultChange }) => {
  const [defaultStatus, setDefaultStatus] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchOption = useCallback(() => {
    setIsFetching(true);
    wp.apiFetch({
      path: '/alpaca/v1/options/default_status',
    })
      .then((option) => {
        const value = option.value ? option.value.toString() : '';
        setDefaultStatus(value);
        // Notify parent of the initial value
        if (onDefaultChange) {
          onDefaultChange(value);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error fetching data:', err);
        setError('Could not load default status settings.');
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [onDefaultChange]);

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
      path: '/alpaca/v1/options/default_status',
      method: 'POST',
      data: { value: newValue },
    })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error saving default status:', err);
        // TODO: Replace with WordPress notice API for better UX
        setError('Error saving setting: ' + err.message);
        fetchOption(); // Revert on error
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  // Memoize status options to ensure they update when statuses order changes
  const statusOptions = useMemo(
    () => [
      { label: 'Select a default status...', value: '' },
      ...statuses.map((status) => ({
        label: status.name,
        value: status.term_id.toString(),
      })),
    ],
    [statuses],
  );

  if (error) {
    return (
      <tr>
        <th>Default Status for New Issues</th>
        <td>
          <p className="alpaca-error">{error}</p>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <th>Default Status for New Issues</th>
      <td>
        <SelectControl
          label="Default Status"
          hideLabelFromVision={true}
          value={defaultStatus}
          options={statusOptions}
          onChange={handleStatusChange}
          disabled={isSaving || isFetching}
        />
        {(isFetching || isSaving) && <Spinner />}
      </td>
    </tr>
  );
};

DefaultStatusSelector.propTypes = {
  statuses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      term_id: PropTypes.number.isRequired,
    }),
  ).isRequired,
  onDefaultChange: PropTypes.func.isRequired,
};

export default DefaultStatusSelector;
