const { __ } = wp.i18n;
const { Tooltip } = wp.components;
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
        <Tooltip text={__('Assignees', 'alpaca')}>
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
        </Tooltip>
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

// Register default `data-assignee-*` attributes for item cards.
// Third-party code can override or extend via the
// `alpaca.item.card.dataAttributes` filter. This keeps assignee-
// related logic colocated with the assignees datapoint.
if (wp && wp.hooks && typeof wp.hooks.addFilter === 'function') {
  wp.hooks.addFilter(
    'alpaca.item.card.dataAttributes',
    'alpaca/assignee-data-attributes',
    (attributes = {}, item = {}) => {
      const assignees = item.assignees || [];
      const assigneeAttrs = assignees.reduce((acc, assignee) => {
        if (assignee && assignee.id) {
          acc[`data-assignee-${assignee.id}`] = '';
        }
        return acc;
      }, {});

      return Object.assign({}, assigneeAttrs, attributes);
    },
  );
}
