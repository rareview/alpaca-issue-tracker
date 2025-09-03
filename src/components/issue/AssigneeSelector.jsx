const { FormTokenField } = wp.components;
const { memo } = wp.element;

const AssigneeSelector = memo(
  ({ assignees, allUsers, onChange, isLoading }) => (
    <FormTokenField
      label="Assigned To"
      placeholder="Nobody"
      value={assignees}
      suggestions={allUsers}
      onChange={onChange}
      disabled={isLoading}
    />
  )
);

export default AssigneeSelector;
