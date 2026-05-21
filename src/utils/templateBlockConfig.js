/**
 * Build settings for an Alpaca Issue Tracker notification template placeholder block.
 *
 * @param {Object}   definition    Block definition.
 * @param {string}   icon          Dashicon slug.
 * @param {Function} renderPreview Preview render callback.
 * @return {Object} Block settings.
 */
function getTemplateBlockSettings(definition, icon, renderPreview) {
  return {
    apiVersion: 3,
    title: definition.title,
    description: definition.description,
    icon,
    category: 'widgets',
    supports: {
      html: false,
      reusable: false,
      multiple:
        typeof definition.multiple === 'boolean' ? definition.multiple : true,
    },
    edit: renderPreview,
    save: () => null,
  };
}

module.exports = {
  getTemplateBlockSettings,
};
