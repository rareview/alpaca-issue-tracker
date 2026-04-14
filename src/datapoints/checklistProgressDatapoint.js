const { __ } = wp.i18n;
const { Tooltip } = wp.components;
import Icon from '../components/icons/Icon';

/**
 * Filter to add checklist progress to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original datapoints content.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} Checklist progress markup or original content.
 */
export const addChecklistProgressDatapoint = (originalContent, itemProps) => {
  const subissueProgress = itemProps?.meta?.subissue_progress;
  const subissueTotal = Number(subissueProgress?.total);
  const subissueCompleted = Number(subissueProgress?.completed);

  if (
    Number.isFinite(subissueTotal) &&
    Number.isFinite(subissueCompleted) &&
    subissueTotal > 0
  ) {
    return (
      <>
        {originalContent}
        <Tooltip text={__('Checklist Progress', 'alpaca')}>
          <div className="alpaca-item-icon alpaca-item-checklist-progress">
            <Icon name="check2-square" />
            {`${subissueCompleted}/${subissueTotal}`}
          </div>
        </Tooltip>
      </>
    );
  }

  return originalContent;
};

export const checklistProgressDatapointRegistration = {
  slug: 'checklist_progress',
  label: __('Checklist Progress', 'alpaca'),
  namespace: 'alpaca/item/addChecklistProgressDatapoint',
  callback: addChecklistProgressDatapoint,
  defaultEnabled: true,
};
