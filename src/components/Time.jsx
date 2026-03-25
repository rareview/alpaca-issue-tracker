import PropTypes from 'prop-types';
import { parseWpDateValue } from '../utils/date';

const { useReducer, useEffect, useMemo, memo } = wp.element;
const { __ } = wp.i18n;
const { Tooltip } = wp.components;

const Time = memo(
  ({ value, type = 'absolute', format, autoUpdate = true, className }) => {
    // useReducer to force re-render for relative time updates
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    // Auto-update every 15 seconds
    useEffect(() => {
      if (type !== 'relative' || !autoUpdate) return;
      const interval = setInterval(forceUpdate, 15000);
      return () => clearInterval(interval);
    }, [type, autoUpdate]);

    const dateObj = useMemo(() => parseWpDateValue(value), [value]);
    if (!dateObj) return null;

    const wpFormat = format || wp.date.getSettings().formats.datetime;
    const formattedAbsolute = wp.date.dateI18n(wpFormat, dateObj);
    const spanClassName = ['timestamp', className].filter(Boolean).join(' ');

    if (type === 'relative') {
      const now = new Date();
      const secondsDiff = Math.floor((now - dateObj) / 1000);

      // Show "just now" for the first minute.
      let relative = __('just now', 'alpaca');

      if (Math.abs(secondsDiff) >= 60) {
        // Intl gives locale-native unit words and grammar (for example Arabic).
        const locale = document.documentElement.lang || 'en';
        const deltaSeconds = Math.round(
          (dateObj.getTime() - now.getTime()) / 1000,
        );
        const absDelta = Math.abs(deltaSeconds);

        let unit = 'minute';
        let valueForUnit = Math.round(deltaSeconds / 60);

        if (absDelta >= 60 * 60 * 24 * 365) {
          unit = 'year';
          valueForUnit = Math.round(deltaSeconds / (60 * 60 * 24 * 365));
        } else if (absDelta >= 60 * 60 * 24 * 30) {
          unit = 'month';
          valueForUnit = Math.round(deltaSeconds / (60 * 60 * 24 * 30));
        } else if (absDelta >= 60 * 60 * 24 * 7) {
          unit = 'week';
          valueForUnit = Math.round(deltaSeconds / (60 * 60 * 24 * 7));
        } else if (absDelta >= 60 * 60 * 24) {
          unit = 'day';
          valueForUnit = Math.round(deltaSeconds / (60 * 60 * 24));
        } else if (absDelta >= 60 * 60) {
          unit = 'hour';
          valueForUnit = Math.round(deltaSeconds / (60 * 60));
        }

        relative = new Intl.RelativeTimeFormat(locale, {
          numeric: 'always',
        }).format(valueForUnit, unit);
      }

      return (
        <Tooltip text={formattedAbsolute}>
          <span className={spanClassName}>{relative}</span>
        </Tooltip>
      );
    }

    return <span className={spanClassName}>{formattedAbsolute}</span>;
  },
);

Time.propTypes = {
  value: PropTypes.string,
  type: PropTypes.oneOf(['absolute', 'relative']),
  format: PropTypes.string,
  autoUpdate: PropTypes.bool,
  className: PropTypes.string,
};

Time.displayName = 'Time';

export default Time;
