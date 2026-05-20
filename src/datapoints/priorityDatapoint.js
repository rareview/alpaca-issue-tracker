const { __ } = wp.i18n;
const { Tooltip } = wp.components;
import Icon from '../components/icons/Icon';

/**
 * Filter to add a priority badge to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original datapoints content.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} Priority badge markup or original content.
 */
export const addPriorityDatapoint = (originalContent, itemProps) => {
  const { meta } = itemProps;

  if (
    meta &&
    (meta.alpaca_high_priority === '1' ||
      meta.alpaca_high_priority === 1 ||
      meta.alpaca_high_priority === true)
  ) {
    return (
      <>
        {originalContent}
        <Tooltip text={__('Priority', 'alpaca-issue-tracker')}>
          <div className="alpaca-item-priority-badge">
            <Icon name="priority" /> {__('Priority', 'alpaca-issue-tracker')}
          </div>
        </Tooltip>
      </>
    );
  }

  return originalContent;
};

export const priorityDatapointRegistration = {
  slug: 'priority',
  label: __('Priority', 'alpaca-issue-tracker'),
  namespace: 'alpaca/item/addPriorityDatapoint',
  callback: addPriorityDatapoint,
  defaultEnabled: true,
};
