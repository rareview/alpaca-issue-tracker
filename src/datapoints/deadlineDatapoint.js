const { __ } = wp.i18n;
const { Tooltip } = wp.components;
import CalendarIcon from '../components/icons/CalendarIcon';
import { formatWpDateValue, parseWpDateValue } from '../utils/date';

/**
 * Filter to add deadline to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original datapoints content.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} Deadline markup or original content.
 */
export const addDeadlineDatapoint = (originalContent, itemProps) => {
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
    deadlineFormatted = formatWpDateValue(deadline, 'M j');
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
      deadlineText = __('Tomorrow', 'alpaca');
    } else if (diffDays === 0) {
      deadlineText = __('Today', 'alpaca');
    } else if (diffDays === -1) {
      deadlineText = __('Yesterday', 'alpaca');
    }
  }

  if (isValidDeadline) {
    return (
      <>
        {originalContent}
        <Tooltip text={__('Deadline', 'alpaca')}>
          <div
            className="alpaca-item-icon alpaca-item-deadline alpaca-label-pill"
            data-days-left={diffDays}
            data-deadline-state={deadlineState}
          >
            <CalendarIcon />
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
  label: __('Deadline', 'alpaca'),
  namespace: 'alpaca/item/addDeadlineDatapoint',
  callback: addDeadlineDatapoint,
  defaultEnabled: true,
};
