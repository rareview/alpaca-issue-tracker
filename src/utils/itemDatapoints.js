const { __, sprintf } = wp.i18n;
import HourglassIcon from '../components/icons/HourglassIcon';
import User from '../components/User';
import CommentIcon from '../components/icons/CommentIcon';
import CalendarIcon from '../components/icons/CalendarIcon';
import PriorityIcon from '../components/icons/PriorityIcon';

/**
 * Filter to add priority badge to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original content of the filter.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} The priority badge JSX or null.
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
        <div className="alpaca-item-priority-badge">
          <PriorityIcon /> {__('Priority', 'alpaca')}
        </div>
      </>
    );
  }
  return originalContent;
};

/**
 * Filter to add assignees to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original content of the filter.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} The assignees JSX or null.
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
              : assignees.map((a) => a.displayName || a.name).join(', ')
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

/**
 * Filter to add labels to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original content of the filter.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} The labels JSX or null.
 */
export const addLabelsDatapoint = (originalContent, itemProps) => {
  const { labels } = itemProps;

  if (!Array.isArray(labels) || labels.length < 1) {
    return originalContent;
  }

  return (
    <>
      {originalContent}
      <div className="alpaca-item-labels">
        {labels.map((label) => (
          <span
            key={label.term_id || `${label.slug}-${label.name}`}
            className="alpaca-item-label alpaca-label-pill"
            style={{
              backgroundColor: label.color || '#172b4d',
              color: '#fff',
            }}
            title={label.name}
          >
            {label.name}
          </span>
        ))}
      </div>
    </>
  );
};

/**
 * Filter to add comment count to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original content of the filter.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} The comment count JSX or null.
 */
export const addCommentCountDatapoint = (originalContent, itemProps) => {
  const { commentCount } = itemProps;

  if (typeof commentCount !== 'undefined' && commentCount > 0) {
    return (
      <>
        {originalContent}
        <div className="alpaca-item-icon alpaca-item-comment-count">
          <CommentIcon />
          {commentCount}
        </div>
      </>
    );
  }
  return originalContent;
};

/**
 * Filter to add days-idle count to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original content of the filter.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} The comment count JSX or null.
 */
export const addDaysIdleDatapoint = (originalContent, itemProps) => {
  const { meta } = itemProps;
  const { postDate } = itemProps;

  const lastActivityDateString = meta?.lastActivity || postDate;
  let idleText = null;

  if (lastActivityDateString) {
    const lastActivityDate = new Date(lastActivityDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastActivityDate.setHours(0, 0, 0, 0);
    const daysIdle = Math.floor(
      (today - lastActivityDate) / (1000 * 60 * 60 * 24),
    );

    if (daysIdle > 0) {
      // translators: %d: Number of days
      idleText = sprintf(__('%dd idle', 'alpaca'), daysIdle);
      return (
        <>
          {originalContent}
          <div className="alpaca-item-icon alpaca-item-idle-time">
            <HourglassIcon />
            {idleText}
          </div>
        </>
      );
    }
  }

  return originalContent;
};

/**
 * Filter to add deadline to item datapoints.
 *
 * @param {JSX.Element|null} originalContent The original content of the filter.
 * @param {Object}           itemProps       Props passed to the Item component.
 * @return {JSX.Element|null} The deadline JSX or null.
 */
export const addDeadlineDatapoint = (originalContent, itemProps) => {
  const { meta } = itemProps;
  const deadline =
    meta && meta.deadline && meta.deadline[0]
      ? new Date(meta.deadline[0])
      : null;
  const isValidDeadline = deadline && !isNaN(deadline);

  const deadlineFormatted = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(deadline);

  let diffDays = null;
  if (isValidDeadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  }

  // Format deadline display text
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
        <div
          className="alpaca-item-icon alpaca-item-deadline"
          data-days-left={diffDays}
          data-deadline-state={deadlineState}
        >
          <CalendarIcon />
          {deadlineText}
        </div>
      </>
    );
  }
  return originalContent;
};

// Register the filters
wp.hooks.addFilter(
  'alpaca.item.datapoints',
  'alpaca/item/addPriorityDatapoint',
  addPriorityDatapoint,
);

wp.hooks.addFilter(
  'alpaca.item.datapoints',
  'alpaca/item/addAssigneesDatapoint',
  addAssigneesDatapoint,
);

wp.hooks.addFilter(
  'alpaca.item.datapoints',
  'alpaca/item/addLabelsDatapoint',
  addLabelsDatapoint,
);

wp.hooks.addFilter(
  'alpaca.item.datapoints',
  'alpaca/item/addDaysIdleDatapoint',
  addDaysIdleDatapoint,
);

wp.hooks.addFilter(
  'alpaca.item.datapoints',
  'alpaca/item/addCommentCountDatapoint',
  addCommentCountDatapoint,
);

wp.hooks.addFilter(
  'alpaca.item.datapoints',
  'alpaca/item/addDeadlineDatapoint',
  addDeadlineDatapoint,
);
