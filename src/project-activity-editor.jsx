const { registerBlockType } = wp.blocks;
const { useBlockProps } = wp.blockEditor;
const { __ } = wp.i18n;

/**
 * Project Activity block editor interface.
 *
 * @return {JSX.Element} Block editor element.
 */
function ProjectActivityEdit() {
  const blockProps = useBlockProps({
    className: 'alpaca-project-activity-editor-preview',
  });

  return (
    <div {...blockProps}>
      <strong>{__('Alpaca Project Activity', 'alpaca-issue-tracker')}</strong>
      <p>
        {__(
          'Compact project activity for authorized users.',
          'alpaca-issue-tracker',
        )}
      </p>
    </div>
  );
}

registerBlockType('alpaca/project-activity', {
  edit: ProjectActivityEdit,
  save: () => null,
});
