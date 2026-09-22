const { useState, useEffect, useCallback } = wp.element;

export const useCheckboxSetting = ({
  settingKey,
  defaultValue = false,
  onSave,
}) => {
  const [isEnabled, setIsEnabled] = useState(defaultValue);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchOption = useCallback(() => {
    setIsFetching(true);

    wp.apiFetch({ path: '/wp/v2/settings' })
      .then((settings) => {
        setIsEnabled(settings[settingKey] === '1');
      })
      .finally(() => setIsFetching(false));
  }, [settingKey]);

  useEffect(() => {
    fetchOption();
  }, [fetchOption]);

  const handleChange = useCallback(
    (value) => {
      setIsSaving(true);
      setIsEnabled(value);

      wp.apiFetch({
        path: '/wp/v2/settings',
        method: 'POST',
        data: { [settingKey]: value ? '1' : '0' },
      })
        .then(() => {
          if ('function' === typeof onSave) {
            onSave(value);
          }
        })
        .finally(() => setIsSaving(false));
    },
    [onSave, settingKey],
  );

  return {
    isEnabled,
    isFetching,
    isSaving,
    handleChange,
  };
};
