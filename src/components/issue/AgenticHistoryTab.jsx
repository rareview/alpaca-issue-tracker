const { __ } = wp.i18n;
import PropTypes from 'prop-types';
import {
  formatAgenticSentDate,
  readAgenticSendHistoryFromMeta,
} from '../../utils/agenticHistory';

/**
 * AI Issue Resolver history tab content.
 *
 * @param {Object} props
 * @param {Object} props.issueDetails Issue details payload.
 * @return {JSX.Element} AgenticHistoryTab component
 */
const AgenticHistoryTab = ({ issueDetails }) => {
  const sendHistory = readAgenticSendHistoryFromMeta(issueDetails?.meta || {});

  if (!sendHistory.length) {
    return (
      <div className="agentic-history-tab">
        <p className="agentic-history-tab__empty">
          {__(
            'No AI Issue Resolver history yet. Use "Send to AI agent on GitHub" to create one.',
            'alpaca-issue-tracker',
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="agentic-history-tab">
      <div className="agentic-status-list__heading">
        {__('Sent to GitHub AI Agent:', 'alpaca-issue-tracker')}
      </div>
      <div className="agentic-status-list" role="status">
        {sendHistory.map((send, index) => {
          const sentDate = formatAgenticSentDate(send.sentAt);

          return (
            <div
              key={(send.url || 'send') + '-' + index}
              className="agentic-status-strip"
            >
              {sentDate ? (
                <span className="agentic-status-strip__date">{sentDate}</span>
              ) : null}
              {send.targetBranch ? (
                <span className="agentic-status-strip__branch">
                  {'→ ' + send.targetBranch}
                </span>
              ) : null}
              <a
                className="agentic-status-strip__link"
                href={send.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                {send.url}
              </a>
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
