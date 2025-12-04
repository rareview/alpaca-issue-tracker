const { useState, useEffect, useMemo } = wp.element;
const { Tooltip } = wp.components;

const Time = ({ value, type = 'absolute', format, autoUpdate = true }) => {
  const [tick, setTick] = useState(0); // force re-render for relative time

  // Auto-update every 15 seconds
  useEffect(() => {
    if (type !== 'relative' || !autoUpdate) return;
    const interval = setInterval(() => setTick((prev) => prev + 1), 15000);
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

  if (type === 'relative') {
    const secondsDiff = Math.floor((new Date() - dateObj) / 1000);

    // Show "just now" for the first minute
    const relative =
      secondsDiff < 60 ? 'just now' : window.moment(dateObj).fromNow();

    return (
      <Tooltip text={formattedAbsolute}>
        <span className="timestamp">{relative}</span>
      </Tooltip>
    );
  }

  return <span className="timestamp">{formattedAbsolute}</span>;
};

export default Time;
