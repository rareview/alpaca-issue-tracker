import PropTypes from 'prop-types';
import { parseWpDateValue } from '../utils/date';

const { useReducer, useEffect, useMemo, memo } = wp.element;
const { __, sprintf } = wp.i18n;
const { Tooltip } = wp.components;

const Time = memo(
  ({
    value,
    type = 'absolute',
    format,
    autoUpdate = true,
    className,
    isGmt = false,
    relativeWithDirection = true,
    relativeStyle = 'long',
    relativeUnitDisplay = 'short',
  }) => {
    // useReducer to force re-render for relative time updates
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    // Auto-update every 15 seconds
    useEffect(() => {
      if (type !== 'relative' || !autoUpdate) return;
      const interval = setInterval(forceUpdate, 15000);
      return () => clearInterval(interval);
    }, [type, autoUpdate]);

    const dateObj = useMemo(
      () => parseWpDateValue(value, { treatMysqlAsUtc: isGmt }),
      [value, isGmt],
    );
    if (!dateObj) return null;

    const wpFormat = format || wp.date.getSettings().formats.datetime;
    const formattedAbsolute = wp.date.dateI18n(wpFormat, dateObj);
    let formattedOffset = wp.date.dateI18n('P', dateObj);
    if ('Z' === formattedOffset) {
      formattedOffset = '+00:00';
    }
    /* translators: 1: formatted date/time. 2: UTC offset, e.g. +02:00. */
    const offsetFormatLabel = __('%1$s (UTC%2$s)', 'alpaca');
    const tooltipText = formattedOffset
      ? sprintf(offsetFormatLabel, formattedAbsolute, formattedOffset)
      : formattedAbsolute;
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

        if (relativeWithDirection) {
          relative = new Intl.RelativeTimeFormat(locale, {
            numeric: 'always',
            style: relativeStyle,
          }).format(valueForUnit, unit);
        } else {
          const absoluteValueForUnit = Math.abs(valueForUnit);

          try {
            relative = new Intl.NumberFormat(locale, {
              style: 'unit',
              unit,
              unitDisplay: relativeUnitDisplay,
              maximumFractionDigits: 0,
            }).format(absoluteValueForUnit);
          } catch (error) {
            const fallbackUnitLabels = {
              year: 'y',
              month: 'mo',
              week: 'w',
              day: 'd',
              hour: 'h',
              minute: 'm',
            };
            relative = `${absoluteValueForUnit}${fallbackUnitLabels[unit] || unit}`;
          }
        }
      }

      return (
        <Tooltip text={tooltipText}>
          <span className={spanClassName}>{relative}</span>
        </Tooltip>
      );
    }

    return <span className={spanClassName}>{formattedAbsolute}</span>;
  },
);

Time.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date),
  ]),
  type: PropTypes.oneOf(['absolute', 'relative']),
  format: PropTypes.string,
  autoUpdate: PropTypes.bool,
  className: PropTypes.string,
  isGmt: PropTypes.bool,
  relativeWithDirection: PropTypes.bool,
  relativeStyle: PropTypes.oneOf(['long', 'short', 'narrow']),
  relativeUnitDisplay: PropTypes.oneOf(['long', 'short', 'narrow']),
};

Time.displayName = 'Time';

export default Time;
