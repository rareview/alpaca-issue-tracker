const { __ } = wp.i18n;
import User from '../components/User';

/**
 * Filter to add assignees to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original datapoints content.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} Assignees markup or original content.
 */
export const addAssigneesDatapoint = (originalContent, itemProps) => {
  const { assignees } = itemProps;

  if (assignees && assignees.length > 0) {
    return (
      <>
        {originalContent}
        <div
          className="alpaca-item-assignees"
          data-assignees={assignees.length}
          title={
            assignees.length === 1
              ? assignees[0].displayName || assignees[0].name
              : assignees
                  .map((assignee) => assignee.displayName || assignee.name)
                  .join(', ')
          }
        >
          {assignees.map((assignee) => (
            <User key={assignee.id} user={assignee} />
          ))}
        </div>
      </>
    );
  }

  return originalContent;
};

export const assigneesDatapointRegistration = {
  slug: 'assignees',
  label: __('Assignees', 'alpaca'),
  namespace: 'alpaca/item/addAssigneesDatapoint',
  callback: addAssigneesDatapoint,
  defaultEnabled: true,
};
