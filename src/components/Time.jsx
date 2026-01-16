import PropTypes from 'prop-types';

const { useReducer, useEffect, useMemo, memo } = wp.element;
const { __ } = wp.i18n;
const { Tooltip } = wp.components;

const Time = memo(({ value, type = 'absolute', format, autoUpdate = true, className }) => {
  // useReducer to force re-render for relative time updates
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Auto-update every 15 seconds
  useEffect(() => {
    if (type !== 'relative' || !autoUpdate) return;
    const interval = setInterval(forceUpdate, 15000);
    return () => clearInterval(interval);
  }, [type, autoUpdate]);

  // Convert string to JS Date
  const dateObj = useMemo(
    () => (value ? new Date(`${value}Z`) : null),
    [value],
  );
  if (!dateObj || isNaN(dateObj.getTime())) return null;

  const wpFormat = format || wp.date.getSettings().formats.datetime;
  const formattedAbsolute = wp.date.dateI18n(wpFormat, dateObj);
  const spanClassName = ['timestamp', className].filter(Boolean).join(' ');

  if (type === 'relative') {
    const secondsDiff = Math.floor((new Date() - dateObj) / 1000);

    // Show "just now" for the first minute
    const relative =
      secondsDiff < 60
        ? __('just now', 'alpaca')
        : window.moment(dateObj).fromNow();

    return (
      <Tooltip text={formattedAbsolute}>
        <span className={spanClassName}>{relative}</span>
      </Tooltip>
    );
  }

  return <span className={spanClassName}>{formattedAbsolute}</span>;
});

Time.propTypes = {
  value: PropTypes.string,
  type: PropTypes.oneOf(['absolute', 'relative']),
  format: PropTypes.string,
  autoUpdate: PropTypes.bool,
  className: PropTypes.string,
};

Time.displayName = 'Time';

export default Time;
