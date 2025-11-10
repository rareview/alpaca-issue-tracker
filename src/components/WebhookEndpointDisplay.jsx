import { useClipboard } from '../hooks/useClipboard';

const { Button } = wp.components;

const WebhookEndpointDisplay = () => {
  const { isClipboardSupported, copyToClipboard } = useClipboard();

  // The wpApiSettings object is available globally in the WordPress admin
  const apiRoot = window.wpApiSettings?.root || '';
  const webhookUrl = `${apiRoot}alpaca/v1/webhook`;

  const handleCopy = () => {
    copyToClipboard(
      webhookUrl,
      // eslint-disable-next-line no-alert
      () => alert('Webhook URL copied to clipboard!'),
      (err) => {
        console.error('Could not copy URL: ', err);
        // eslint-disable-next-line no-alert
        alert('Could not copy URL. Please copy it manually.');
      },
    );
  };

  return (
    <>
      <tr>
        <th scope="row">
          <label htmlFor="webhook-url">Payload URL</label>
        </th>
        <td>
          <input
            id="webhook-url"
            type="text"
            className="regular-text"
            value={webhookUrl}
            readOnly
          />
          {isClipboardSupported && (
            <Button onClick={handleCopy} icon="clipboard" />
          )}
          <p className="description">
            Tell supported services to send a payload to this URL
          </p>
        </td>
      </tr>
    </>
  );
};

export default WebhookEndpointDisplay;
