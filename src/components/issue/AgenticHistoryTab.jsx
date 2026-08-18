const { __ } = wp.i18n;
import PropTypes from 'prop-types';
import {
  formatAgenticActivityDate,
  readAgenticHistoryFromMeta,
} from '../../utils/agenticHistory';

/**
 * Render one "sent" history entry: date, target branch, GitHub issue link.
 *
 * @param {Object} entry        History entry.
 * @param {string} activityDate Pre-formatted date string.
 * @return {JSX.Element} Row content.
 */
function renderSentEntry(entry, activityDate) {
  return (
    <>
      {activityDate ? (
        <span className="agentic-activity-strip__date">{activityDate}</span>
      ) : null}
      {entry.targetBranch ? (
        <span className="agentic-activity-strip__branch">
          {'→ ' + entry.targetBranch}
        </span>
      ) : null}
      <a
        className="agentic-activity-strip__link"
        href={entry.url}
        target="_blank"
        rel="noreferrer noopener"
      >
        {entry.url}
      </a>
    </>
  );
}

/**
 * Render a "deleted" (draft deleted/restarted) history entry.
 *
 * @param {string} activityDate Pre-formatted date string.
 * @return {JSX.Element} Row content.
 */
function renderDeletedEntry(activityDate) {
  return (
    <>
      {activityDate ? (
        <span className="agentic-activity-strip__date">{activityDate}</span>
      ) : null}
      <span className="agentic-activity-strip__label">
        {__('Draft deleted/restarted', 'alpaca-issue-tracker')}
      </span>
    </>
  );
}

/**
 * Render an "applied" (staging-tested fix applied to production) history entry.
 *
 * @param {Object} entry        History entry.
 * @param {string} activityDate Pre-formatted date string.
 * @return {JSX.Element} Row content.
 */
function renderAppliedEntry(entry, activityDate) {
  return (
    <>
      {activityDate ? (
        <span className="agentic-activity-strip__date">{activityDate}</span>
      ) : null}
      {entry.targetBranch ? (
        <span className="agentic-activity-strip__branch">
          {'→ ' + entry.targetBranch}
        </span>
      ) : null}
      <span className="agentic-activity-strip__label">
        {__('Applied tested fix from', 'alpaca-issue-tracker')}
      </span>
      <a
        className="agentic-activity-strip__link"
        href={entry.stagingPrUrl}
        target="_blank"
        rel="noreferrer noopener"
      >
        {entry.stagingPrUrl}
      </a>
    </>
  );
}

/**
 * AI Issue Resolver activity log tab content.
 *
 * @param {Object} props
 * @param {Object} props.issueDetails Issue details payload.
 * @return {JSX.Element} AgenticHistoryTab component
 */
const AgenticHistoryTab = ({ issueDetails }) => {
  const history = readAgenticHistoryFromMeta(issueDetails?.meta || {});

  if (!history.length) {
    return (
      <div className="agentic-history-tab">
        <p className="agentic-history-tab__empty">
          {__('No AI Issue Resolver activity yet.', 'alpaca-issue-tracker')}
        </p>
      </div>
    );
  }

  return (
    <div className="agentic-history-tab">
      <div className="agentic-activity-list__heading">
        {__('AI Issue Resolver activity:', 'alpaca-issue-tracker')}
      </div>
      <div className="agentic-activity-list" role="status">
        {history.map((entry, index) => {
          const activityDate = formatAgenticActivityDate(entry.occurredAt);
          const key =
            (entry.url || entry.stagingPrUrl || entry.type || 'entry') +
            '-' +
            index;

          let rowContent;
          if ('deleted' === entry.type) {
            rowContent = renderDeletedEntry(activityDate);
          } else if ('applied' === entry.type) {
            rowContent = renderAppliedEntry(entry, activityDate);
          } else {
            rowContent = renderSentEntry(entry, activityDate);
          }

          return (
            <div key={key} className="agentic-activity-strip">
              {rowContent}
            </div>
          );
        })}
      </div>
    </div>
  );
};

AgenticHistoryTab.propTypes = {
  issueDetails: PropTypes.shape({
    meta: PropTypes.object,
  }),
};

export default AgenticHistoryTab;
