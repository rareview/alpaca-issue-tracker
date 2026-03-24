const { __ } = wp.i18n;
import HourglassIcon from '../components/icons/HourglassIcon';
import Time from '../components/Time';

/**
 * Filter to add last comment activity time to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original datapoints content.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} Last activity markup or original content.
 */
export const addLastCommentActivityDatapoint = (originalContent, itemProps) => {
  const { meta } = itemProps;
  const lastActivityDateString = meta?.lastActivity;

  if (!lastActivityDateString) {
    return originalContent;
  }

  return (
    <>
      {originalContent}
      <div className="alpaca-item-icon alpaca-item-last-activity">
        <HourglassIcon />
        <Time value={lastActivityDateString} type="relative" />
      </div>
    </>
  );
};

export const lastCommentActivityDatapointRegistration = {
  slug: 'last_activity',
  label: __('Last Activity', 'alpaca'),
  namespace: 'alpaca/item/addLastCommentActivityDatapoint',
  callback: addLastCommentActivityDatapoint,
  defaultEnabled: true,
};
