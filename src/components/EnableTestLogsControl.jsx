const { useState, useEffect, useCallback } = wp.element;
const { __ } = wp.i18n;
const { CheckboxControl, Spinner } = wp.components;

const EnableTestLogsControl = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchOption = useCallback(() => {
    setIsFetching(true);
    wp.apiFetch({ path: '/wp/v2/settings' })
      .then((settings) => {
        setIsEnabled(settings.alpaca_enable_test_logs === '1');
      })
      .finally(() => setIsFetching(false));
  }, []);

  useEffect(() => {
    fetchOption();
  }, [fetchOption]);

  const handleChange = (value) => {
    setIsSaving(true);
    setIsEnabled(value);
    wp.apiFetch({
      path: '/wp/v2/settings',
      method: 'POST',
      data: { alpaca_enable_test_logs: value ? '1' : '0' },
    })
      .then(() => {
        wp.hooks.doAction('alpaca.enableTestLogsChanged', value);
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <tr>
      <th>{__('Debugging', 'alpaca')}</th>
      <td>
        <CheckboxControl
          label={__('Enable Browser Console Messages', 'alpaca')}
          checked={isEnabled}
          onChange={handleChange}
          disabled={isFetching || isSaving}
        />
        {(isFetching || isSaving) && <Spinner />}
      </td>
    </tr>
  );
};

export default EnableTestLogsControl;
