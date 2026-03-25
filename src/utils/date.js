/**
 * Parse a date value while respecting WordPress date settings when available.
 *
 * @param {string|Date|number|null|undefined} rawValue                         Raw date value.
 * @param {Object}                            options                          Parse options.
 * @param {boolean}                           options.treatDateOnlyAsLocalNoon Whether YYYY-MM-DD values should use local noon fallback.
 * @param {boolean}                           options.treatMysqlAsUtc          Whether MySQL-style datetime strings should be interpreted as UTC.
 * @return {Date|null} Parsed date object or null when invalid.
 */
export const parseWpDateValue = (
  rawValue,
  { treatDateOnlyAsLocalNoon = false, treatMysqlAsUtc = false } = {},
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

  const mysqlDatePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
  const isoDateTimeWithoutOffsetPattern =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

  if (treatMysqlAsUtc) {
    let utcValue = normalizedValue;

    if (mysqlDatePattern.test(normalizedValue)) {
      utcValue = `${normalizedValue.replace(' ', 'T')}Z`;
    } else if (isoDateTimeWithoutOffsetPattern.test(normalizedValue)) {
      utcValue = `${normalizedValue}Z`;
    } else if (dateOnlyPattern.test(normalizedValue)) {
      utcValue = `${normalizedValue}T00:00:00Z`;
    }

    const utcDate = new Date(utcValue);
    return Number.isNaN(utcDate.getTime()) ? null : utcDate;
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
