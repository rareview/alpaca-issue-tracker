const { createElement } = wp.element;
import templateBlockConfigUtils from './templateBlockConfig';

const { getTemplateBlockSettings } = templateBlockConfigUtils;

const getBlockProps =
  wp.blockEditor && typeof wp.blockEditor.useBlockProps === 'function'
    ? wp.blockEditor.useBlockProps
    : (props = {}) => props;

/**
 * Render a placeholder preview for an Alpaca template block.
 *
 * @param {Object} props             Preview props.
 * @param {string} props.title       Block title.
 * @param {string} props.description Block description.
 * @return {*} Placeholder preview.
 */
const PlaceholderPreview = ({ title, description }) => {
  const blockProps = getBlockProps({
    className: 'alpaca-notification-token-block',
  });

  return createElement(
    'div',
    blockProps,
    createElement('strong', null, title),
    createElement('p', null, description),
  );
};

/**
 * Ensure the core block library is registered for the template editor.
 *
 * @return {void}
 */
const ensureCoreTemplateBlocks = () => {
  if (
    !wp.blockLibrary ||
    typeof wp.blockLibrary.registerCoreBlocks !== 'function'
  ) {
    return;
  }

  if (!wp.blocks.getBlockType('core/paragraph')) {
    wp.blockLibrary.registerCoreBlocks();
  }
};

/**
 * Register Alpaca template placeholder blocks from a shared definition list.
 *
 * @param {Object[]} definitions Block definitions.
 * @param {string}   icon        Dashicon slug.
 * @return {void}
 */
export const registerTemplateBlocks = (definitions, icon) => {
  if (!wp.blocks || typeof wp.blocks.registerBlockType !== 'function') {
    return;
  }

  ensureCoreTemplateBlocks();

  definitions.forEach((definition) => {
    if (wp.blocks.getBlockType(definition.name)) {
      return;
    }

    wp.blocks.registerBlockType(
      definition.name,
      getTemplateBlockSettings(definition, icon, () =>
        createElement(PlaceholderPreview, {
          title: definition.title,
          description: definition.description,
        }),
      ),
    );
  });
};
