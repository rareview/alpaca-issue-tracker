const { __ } = wp.i18n;
const { Tooltip } = wp.components;
import Icon from '../components/icons/Icon';
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

  const lastActivityIsGmt = /(?:Z|[+-]\d{2}:\d{2})$/i.test(
    lastActivityDateString,
  );
  const lastActivityTooltipText = __('Last Activity', 'alpaca-issue-tracker');

  return (
    <>
      {originalContent}
      <Tooltip text={lastActivityTooltipText}>
        <div className="alpaca-item-icon alpaca-item-last-activity">
          <Icon name="hourglass" />
          <Time
            value={lastActivityDateString}
            isGmt={lastActivityIsGmt}
            type="relative"
            relativeWithDirection={false}
            relativeUnitDisplay="short"
          />
        </div>
      </Tooltip>
    </>
  );
};

export const lastCommentActivityDatapointRegistration = {
  slug: 'last_activity',
  label: __('Last Activity', 'alpaca-issue-tracker'),
  namespace: 'alpaca/item/addLastCommentActivityDatapoint',
  callback: addLastCommentActivityDatapoint,
  defaultEnabled: true,
};
