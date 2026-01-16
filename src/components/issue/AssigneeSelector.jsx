const { FormTokenField } = wp.components;
const { __ } = wp.i18n;
const { memo } = wp.element;

const AssigneeSelector = memo(
  ({ assignees, allUsers, onChange, isLoading }) => (
    <FormTokenField
      label=""
      placeholder={__('Enter username(s)', 'alpaca')}
      value={assignees}
      suggestions={allUsers}
      onChange={onChange}
      disabled={isLoading}
    />
  ),
  // Only re-render if these props actually change
  (prev, next) =>
    prev.isLoading === next.isLoading &&
    prev.assignees.join(',') === next.assignees.join(',') &&
    prev.allUsers.join(',') === next.allUsers.join(','),
);

export default AssigneeSelector;
