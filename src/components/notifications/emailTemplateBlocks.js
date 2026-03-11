const { __ } = wp.i18n;
const { createElement } = wp.element;
const getBlockProps =
  wp.blockEditor && typeof wp.blockEditor.useBlockProps === 'function'
    ? wp.blockEditor.useBlockProps
    : (props = {}) => props;

const blockDefinitions = [
  {
    name: 'alpaca/email-issue-title',
    title: __('Issue Title', 'alpaca'),
    description: __('Insert the issue title.', 'alpaca'),
  },
  {
    name: 'alpaca/email-actor-name',
    title: __('Performed By', 'alpaca'),
    description: __(
      'Insert the name of the person who performed the activity.',
      'alpaca',
    ),
  },
  {
    name: 'alpaca/email-event-label',
    title: __('Event Label', 'alpaca'),
    description: __(
      'Insert the event label such as status change or comment.',
      'alpaca',
    ),
  },
  {
    name: 'alpaca/email-comment-content',
    title: __('Full Comment Content', 'alpaca'),
    description: __(
      'Insert the full issue comment, including attachment links.',
      'alpaca',
    ),
  },
  {
    name: 'alpaca/email-issue-link',
    title: __('Issue Link', 'alpaca'),
    description: __('Insert a link to the issue on the board.', 'alpaca'),
  },
  {
    name: 'alpaca/email-site-name',
    title: __('Site Title', 'alpaca'),
    description: __('Insert the current site title.', 'alpaca'),
  },
  {
    name: 'alpaca/email-site-tagline',
    title: __('Site Tagline', 'alpaca'),
    description: __('Insert the current site tagline.', 'alpaca'),
  },
  {
    name: 'alpaca/email-site-logo',
    title: __('Site Icon', 'alpaca'),
    description: __('Insert the current site icon.', 'alpaca'),
  },
  {
    name: 'alpaca/email-event-time',
    title: __('Event Time', 'alpaca'),
    description: __('Insert the event timestamp.', 'alpaca'),
  },
];

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
 * Register Alpaca email template placeholder blocks.
 *
 * @return {void}
 */
export const registerNotificationEmailBlocks = () => {
  if (!wp.blocks || typeof wp.blocks.registerBlockType !== 'function') {
    return;
  }

  if (
    wp.blockLibrary &&
    typeof wp.blockLibrary.registerCoreBlocks === 'function' &&
    !wp.blocks.getBlockType('core/paragraph')
  ) {
    wp.blockLibrary.registerCoreBlocks();
  }

  blockDefinitions.forEach((definition) => {
    if (wp.blocks.getBlockType(definition.name)) {
      return;
    }

    wp.blocks.registerBlockType(definition.name, {
      apiVersion: 2,
      title: definition.title,
      description: definition.description,
      icon: 'email',
      category: 'widgets',
      supports: {
        html: false,
        reusable: false,
      },
      edit: () =>
        createElement(PlaceholderPreview, {
          title: definition.title,
          description: definition.description,
        }),
      save: () => null,
    });
  });
};
