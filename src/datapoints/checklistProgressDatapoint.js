const { __ } = wp.i18n;
import Check2SquareIcon from '../components/icons/Check2SquareIcon';

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
        <div className="alpaca-item-icon alpaca-item-checklist-progress">
          <Check2SquareIcon />
          {`${subissueCompleted}/${subissueTotal}`}
        </div>
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
