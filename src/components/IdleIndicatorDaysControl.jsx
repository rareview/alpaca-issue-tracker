const { useState, useEffect, useCallback } = wp.element;
const { __, _n } = wp.i18n;
const { Spinner } = wp.components;
const NumberControl =
  wp.components.NumberControl || wp.components.__experimentalNumberControl;

/**
 * Normalize an idle indicator threshold value.
 *
 * @param {unknown} value Potential numeric value.
 * @return {number} Normalized threshold value.
 */
const normalizeIdleDays = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
};

/**
 * Settings row for idle indicator threshold.
 *
 * @return {JSX.Element} Settings row.
 */
const IdleIndicatorDaysControl = () => {
  const [idleDays, setIdleDays] = useState(1);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchOption = useCallback(() => {
    setIsFetching(true);
    wp.apiFetch({ path: '/wp/v2/settings' })
      .then((settings) => {
        setIdleDays(normalizeIdleDays(settings.alpaca_idle_indicator_days));
      })
      .finally(() => setIsFetching(false));
  }, []);

  useEffect(() => {
    fetchOption();
  }, [fetchOption]);

  const handleIdleDaysChange = (value) => {
    setIdleDays(normalizeIdleDays(value));
  };

  const handleIdleDaysBlur = () => {
    const normalizedValue = normalizeIdleDays(idleDays);
    const payload = {
      // eslint-disable-next-line camelcase
      alpaca_idle_indicator_days: normalizedValue,
    };
    setIdleDays(normalizedValue);
    setIsSaving(true);

    wp.apiFetch({
      path: '/wp/v2/settings',
      method: 'POST',
      data: payload,
    })
      .then(() => {
        if (window.alpacaSettings) {
          window.alpacaSettings.idleIndicatorDays = normalizedValue;
        }
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <tr>
      <th>{__('Idle Indicator', 'alpaca')}</th>
      <td>
        <div className="alpaca-idle-indicator-control-row">
          {NumberControl && (
            <NumberControl
              className="alpaca-small-number-control small-text"
              min={1}
              step={1}
              value={idleDays}
              onChange={handleIdleDaysChange}
              onBlur={handleIdleDaysBlur}
              disabled={isFetching || isSaving}
              suffix={
                <span className="alpaca-number-control-suffix">
                  {_n('day', 'days', idleDays, 'alpaca')}
                </span>
              }
              help={__(
                'Cards will show a count of calendar days since the last recorded activity, when the count reaches this value.',
                'alpaca',
              )}
            />
          )}
          {(isFetching || isSaving) && <Spinner />}
        </div>
      </td>
    </tr>
  );
};

export default IdleIndicatorDaysControl;
