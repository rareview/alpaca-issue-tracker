const { __ } = wp.i18n;
const { Tooltip } = wp.components;
import Icon from '../components/icons/Icon';
import { parseWpDateValue } from '../utils/date';

/**
 * Filter to add deadline to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original datapoints content.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} Deadline markup or original content.
 */
const addDeadlineDatapoint = (originalContent, itemProps) => {
  const { meta } = itemProps;
  let deadline = null;

  if (meta && meta.deadline && meta.deadline[0]) {
    deadline = parseWpDateValue(meta.deadline[0], {
      treatDateOnlyAsLocalNoon: true,
    });
  }

  const isValidDeadline = deadline && !isNaN(deadline);
  let deadlineFormatted = '';

  if (isValidDeadline) {
    const userLocale = wp.date.getSettings().l10n.locale.replace('_', '-');
    deadlineFormatted = new Intl.DateTimeFormat(userLocale, {
      month: 'short',
      day: 'numeric',
    }).format(deadline);
  }

  let diffDays = null;
  if (isValidDeadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  }

  let deadlineText = deadlineFormatted;
  let deadlineState;

  if (isValidDeadline) {
    if (diffDays < 0) {
      deadlineState = 'late';
    } else if (diffDays === 0) {
      deadlineState = 'today';
    } else if (diffDays < 8) {
      deadlineState = 'soon';
    } else {
      deadlineState = 'future';
    }

    if (diffDays === 1) {
      deadlineText = __('Tomorrow', 'alpaca-issue-tracker');
    } else if (diffDays === 0) {
      deadlineText = __('Today', 'alpaca-issue-tracker');
    } else if (diffDays === -1) {
      deadlineText = __('Yesterday', 'alpaca-issue-tracker');
    }
  }

  if (isValidDeadline) {
    return (
      <>
        {originalContent}
        <Tooltip text={__('Deadline', 'alpaca-issue-tracker')}>
          <div
            className="alpaca-item-icon alpaca-item-deadline alpaca-label-pill"
            data-days-left={diffDays}
            data-deadline-state={deadlineState}
          >
            <Icon name="calendar" />
            {deadlineText}
          </div>
        </Tooltip>
      </>
    );
  }

  return originalContent;
};

export const deadlineDatapointRegistration = {
  slug: 'deadline',
  label: __('Deadline', 'alpaca-issue-tracker'),
  namespace: 'alpaca/item/addDeadlineDatapoint',
  callback: addDeadlineDatapoint,
  defaultEnabled: true,
};
