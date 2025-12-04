import StatusManager from './components/StatusManager';
import DefaultStatusSelector from './components/DefaultStatusSelector';
import EnableTestLogsControl from './components/EnableTestLogsControl';
import WebhookEndpointDisplay from './components/WebhookEndpointDisplay';
import WebhookServiceKey from './components/WebhookServiceKey';
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

  const webhookServices = ['GitHub'];

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

      <hr />
      <h3>Webhooks</h3>
      <p>
        Some cloud services can send a message back to your website when a
        certain event occurs on their platform.
      </p>
      <table className="form-table">
        <tbody>
          <WebhookEndpointDisplay />
        </tbody>
      </table>
      <p>
        Some services will ask you to supply a &apos;secret&apos; for security
        purposes. Copy these random strings, and paste into the webhook creation
        screen.
      </p>
      <table className="form-table">
        <tbody>
          {webhookServices.map((service) => (
            <WebhookServiceKey key={service} service={service} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlpacaSettings;
