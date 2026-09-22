/**
 * Get the default label color provided by the WordPress runtime.
 *
 * @return {string} Default label color.
 */
export const getDefaultLabelColor = () => {
  const defaultLabelColor = window.alpaistrSettings?.defaultLabelColor;

  if (typeof defaultLabelColor !== 'string') {
    return '';
  }

  return defaultLabelColor.trim();
};

/**
 * Normalize a possible label color to the shared default fallback.
 *
 * @param {string|null|undefined} color Candidate color value.
 * @return {string} Normalized color.
 */
export const normalizeLabelColor = (color) => {
  if (typeof color !== 'string' || color.trim() === '') {
    return getDefaultLabelColor();
  }

  return color;
};
