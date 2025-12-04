import { useClipboard } from '../hooks/useClipboard';
import PropTypes from 'prop-types';

const { Button } = wp.components;
const { useState, useEffect, useCallback } = wp.element;

/**
 * WebhookServiceKey component for displaying and managing webhook service secrets.
 *
 * @param {Object} root0         - Props object
 * @param {string} root0.service - Service name
 * @return {JSX.Element} WebhookServiceKey component
 */
const WebhookServiceKey = ({ service }) => {
  const [secret, setSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isClipboardSupported, copyToClipboard } = useClipboard();

  const fetchSecret = useCallback(() => {
    const serviceLowercase = service.toLowerCase();
    setIsLoading(true);
    wp.apiFetch({ path: `/alpaca/v1/webhook/secret/${serviceLowercase}` })
      .then((data) => {
        if (data.success && data.secret) {
          setSecret(data.secret);
        } else {
          setError('Invalid data received from server.');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [service]);

  const handleRegenerate = () => {
    const serviceLowercase = service.toLowerCase();
    setIsLoading(true);
    wp.apiFetch({
      path: `/alpaca/v1/webhook/secret/${serviceLowercase}/regenerate`,
      method: 'POST',
    })
      .then((data) => {
        if (data.success && data.secret) {
          setSecret(data.secret);
        } else {
          setError('Could not regenerate secret.');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  };

  const handleCopy = () => {
    copyToClipboard(
      secret,
      // eslint-disable-next-line no-alert
      () => alert(`${service} secret copied to clipboard!`),
      (err) => {
        console.error('Could not copy secret: ', err);
        // eslint-disable-next-line no-alert
        alert('Could not copy secret.');
      },
    );
  };

  useEffect(() => {
    fetchSecret();
  }, [fetchSecret]);

  const serviceLowercase = service.toLowerCase();

  if (error) {
    return (
      <tr>
        <th scope="row">{service}</th>
        <td style={{ color: 'red' }}>Error: {error}</td>
      </tr>
    );
  }

  return (
    <tr>
      <th scope="row">
        <label htmlFor={`webhook-secret-${serviceLowercase}`}>{service}</label>
      </th>
      <td className="alpaca-align-controls">
        <input
          id={`webhook-secret-${serviceLowercase}`}
          type="text"
          className="regular-text"
          value={isLoading ? 'Loading...' : secret}
          readOnly
        />
        {isClipboardSupported && (
          <Button onClick={handleCopy} disabled={isLoading} icon="clipboard" />
        )}
        <Button
          onClick={handleRegenerate}
          disabled={isLoading}
          icon="update"
          label="Regenerate"
        />
      </td>
    </tr>
  );
};

WebhookServiceKey.propTypes = {
  service: PropTypes.string.isRequired,
};

export default WebhookServiceKey;
