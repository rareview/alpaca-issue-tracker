/**
 * Parse a date value while respecting WordPress date settings when available.
 *
 * @param {string|Date|number|null|undefined} rawValue                         Raw date value.
 * @param {Object}                            options                          Parse options.
 * @param {boolean}                           options.treatDateOnlyAsLocalNoon Whether YYYY-MM-DD values should use local noon fallback.
 * @return {Date|null} Parsed date object or null when invalid.
 */
export const parseWpDateValue = (
  rawValue,
  { treatDateOnlyAsLocalNoon = false } = {},
) => {
  if (!rawValue) {
    return null;
  }

  if (rawValue instanceof Date) {
    return Number.isNaN(rawValue.getTime()) ? null : rawValue;
  }

  if ('number' === typeof rawValue) {
    const fromNumber = new Date(rawValue);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }

  if ('string' !== typeof rawValue) {
    return null;
  }

  const normalizedValue = rawValue.trim();
  if (!normalizedValue) {
    return null;
  }

  if ('function' === typeof wp?.date?.getDate) {
    const parsedByWpDate = wp.date.getDate(normalizedValue);
    if (
      parsedByWpDate instanceof Date &&
      !Number.isNaN(parsedByWpDate.getTime())
    ) {
      return parsedByWpDate;
    }
  }

  const mysqlDatePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

  let fallbackValue = normalizedValue;
  if (mysqlDatePattern.test(normalizedValue)) {
    fallbackValue = normalizedValue.replace(' ', 'T');
  } else if (
    treatDateOnlyAsLocalNoon &&
    dateOnlyPattern.test(normalizedValue)
  ) {
    // Local noon is less likely than midnight to sit on DST transition edges.
    fallbackValue = `${normalizedValue}T12:00:00`;
  }

  const fallbackDate = new Date(fallbackValue);

  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
};
