const { registerBlockType } = wp.blocks;
const { useBlockProps } = wp.blockEditor;
const { __ } = wp.i18n;

/**
 * Inbox block editor interface.
 *
 * @return {JSX.Element} Block editor element.
 */
function InboxEdit() {
  const blockProps = useBlockProps({
    className: 'alpaca-inbox-editor-preview',
  });

  return (
    <div {...blockProps}>
      <strong>{__('Alpaca Inbox', 'alpaca-issue-tracker')}</strong>
      <p>
        {__('Notification inbox for authorized users.', 'alpaca-issue-tracker')}
      </p>
    </div>
  );
}

registerBlockType('alpaca/inbox', {
  edit: InboxEdit,
  save: () => null,
});
