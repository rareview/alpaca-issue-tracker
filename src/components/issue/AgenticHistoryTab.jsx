const { __, sprintf } = wp.i18n;
const { useState, useEffect } = wp.element;
import PropTypes from 'prop-types';
import Time from '../Time';
import {
  groupAgenticHistoryIntoSessions,
  mergeLivePullRequestIntoSentEntry,
  readAgenticHistoryFromMeta,
  readLivePullRequests,
  takeAgenticSessionFocus,
} from '../../utils/agenticHistory';

/**
 * Label for a GitHub pull request state.
 *
 * @param {string} state Stored or live PR state.
 * @return {string} Label.
 */
function pullRequestStateLabel(state) {
  if ('merged' === state) {
    return __('Merged', 'alpaca-issue-tracker');
  }
  if ('open' === state) {
    return __('Open', 'alpaca-issue-tracker');
  }
  if ('closed' === state) {
    return __('Closed without merging', 'alpaca-issue-tracker');
  }
  return __('Waiting for pull request', 'alpaca-issue-tracker');
}

/**
 * Badge class for a GitHub pull request state.
 *
 * @param {string} state Stored or live PR state.
 * @return {string} Class name.
 */
function pullRequestBadgeClassName(state) {
  const suffix = ['open', 'merged', 'closed'].includes(state)
    ? state
    : 'waiting';
  return 'agentic-pr-badge agentic-pr-badge--' + suffix;
}

/**
 * Action label for a send within a fixing session.
 *
 * @param {number} sendIndex 0-based index within the session.
 * @return {string} Label.
 */
function sessionSendActionLabel(sendIndex) {
  if (0 === sendIndex) {
    return __('Fix with AI', 'alpaca-issue-tracker');
  }
  return sprintf(
    /* translators: %d: follow-up request number, starting at 1. */
    __('Request a change %d', 'alpaca-issue-tracker'),
    sendIndex,
  );
}

/**
 * Outcome label for a Request a change step.
 *
 * @param {Object} entry Normalized change_requested entry.
 * @return {string} Label.
 */
function changeRequestOutcomeLabel(entry) {
  if ('pr' === entry.target) {
    return entry.prNumber
      ? sprintf(
          /* translators: %d: GitHub pull request number. */
          __('New commits on pull request #%d', 'alpaca-issue-tracker'),
          entry.prNumber,
        )
      : __('New commits on the open pull request', 'alpaca-issue-tracker');
  }
  if ('issue' === entry.target || entry.githubNumber) {
    return entry.githubNumber
      ? sprintf(
          /* translators: %d: GitHub issue number. */
          __('Requested a new pull request on issue #%d', 'alpaca-issue-tracker'),
          entry.githubNumber,
        )
      : __('Requested a new pull request', 'alpaca-issue-tracker');
  }
  return __('Requested a change on GitHub', 'alpaca-issue-tracker');
}

/**
 * One Fix with AI send or Request a change step inside a fixing session.
 *
 * @param {Object} props
 * @param {Object} props.entry     Normalized sent or change_requested entry.
 * @param {number} props.sendIndex 0-based index within the session.
 * @return {JSX.Element} Step row.
 */
function SessionSendStep({ entry, sendIndex }) {
  const isComment = 'change_requested' === entry.type;
  const prState = entry.prState || '';
  const pullRequestLabel = entry.prNumber
    ? sprintf(
        /* translators: %d: GitHub pull request number. */
        __('Pull request #%d', 'alpaca-issue-tracker'),
        entry.prNumber,
      )
    : entry.prUrl;
  const issueLabel = entry.githubNumber
    ? sprintf(
        /* translators: %d: GitHub issue number. */
        __('Issue #%d', 'alpaca-issue-tracker'),
        entry.githubNumber,
      )
    : entry.url;
  const commentLabel = isComment ? changeRequestOutcomeLabel(entry) : '';
  const stepTitle = String(entry.notes || '').trim();

  return (
    <div className="agentic-session-step">
      <div className="agentic-session-step__header">
        <span className="agentic-session-step__action">
          {sessionSendActionLabel(sendIndex)}
        </span>
        {entry.occurredAt ? (
          <Time
            value={entry.occurredAt}
            isGmt
            type="absolute"
            className="agentic-session-step__date"
          />
        ) : null}
      </div>
      {stepTitle ? (
        <span className="agentic-session-step__notes">{stepTitle}</span>
      ) : null}
      <div className="agentic-session-step__links">
        {isComment ? (
          entry.url ? (
            <a
              className="agentic-session-step__link"
              href={entry.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              {commentLabel}
            </a>
          ) : null
        ) : (
          <>
            {entry.url ? (
              <a
                className="agentic-session-step__link"
                href={entry.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                {issueLabel}
              </a>
            ) : null}
            {entry.prUrl ? (
              <a
                className="agentic-session-step__link"
                href={entry.prUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                {pullRequestLabel}
              </a>
            ) : null}
            {prState || !entry.prUrl ? (
              <span className={pullRequestBadgeClassName(prState)}>
                {pullRequestStateLabel(prState)}
              </span>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

SessionSendStep.propTypes = {
  entry: PropTypes.object.isRequired,
  sendIndex: PropTypes.number.isRequired,
};

/**
 * Final timeline step when the user started over.
 *
 * @param {Object} props
 * @param {Object} props.entry Normalized reverted history entry.
 * @return {JSX.Element} Cancellation step.
 */
function SessionCancelledStep({ entry }) {
  const branchNote =
    entry.branchResetNote ||
    (entry.branchReset
      ? __(
          'Target branch was reset to before this attempt.',
          'alpaca-issue-tracker',
        )
      : __('Target branch was not reset.', 'alpaca-issue-tracker'));

  return (
    <div className="agentic-session-step agentic-session-step--cancelled">
      <div className="agentic-session-step__header">
        <span className="agentic-session-step__action">
          {__('Started over', 'alpaca-issue-tracker')}
        </span>
        {entry.occurredAt ? (
          <Time
            value={entry.occurredAt}
            isGmt
            type="absolute"
            className="agentic-session-step__date"
          />
        ) : null}
      </div>
      <div className="agentic-session-step__links agentic-session-step__links--stack">
        <span>
          {__(
            'Open GitHub issues and pull requests were closed.',
            'alpaca-issue-tracker',
          )}
        </span>
        <span>{branchNote}</span>
      </div>
    </div>
  );
}

SessionCancelledStep.propTypes = {
  entry: PropTypes.object.isRequired,
};

/**
 * AI target branch used by a session, ignoring agent working branches.
 *
 * @param {Object} session Grouped fixing session.
 * @return {string} Target branch, or empty string.
 */
function readSessionTargetBranch(session) {
  const fromSends = session.sends
    .map((entry) => String(entry?.targetBranch || '').trim())
    .find(
      (branch) => branch && !/^agent\/(issue|fix)-\d+$/i.test(branch),
    );
  if (fromSends) {
    return fromSends;
  }
  return String(window.agenticConfig?.aiTargetBranch || '').trim();
}

/**
 * Sentence between session cards for the AI target branch, or a later change.
 *
 * @param {Object}  props
 * @param {string}  props.branch   Branch name.
 * @param {boolean} props.isChange Whether this is a later change, not the opening line.
 * @return {JSX.Element} Branch sentence.
 */
function SessionTargetBranchLine({ branch, isChange }) {
  const text = isChange
    ? sprintf(
        /* translators: %s: AI target branch name. */
        __('Target branch changed: %s', 'alpaca-issue-tracker'),
        branch,
      )
    : sprintf(
        /* translators: %s: AI target branch name. */
        __('AI target branch: %s', 'alpaca-issue-tracker'),
        branch,
      );

  return <div className="agentic-log-branch">{text}</div>;
}

SessionTargetBranchLine.propTypes = {
  branch: PropTypes.string.isRequired,
  isChange: PropTypes.bool.isRequired,
};

/**
 * Whether every pull request in the session was closed without merging.
 *
 * @param {Object} session Grouped fixing session.
 * @return {boolean} True when PRs exist and all of them are closed.
 */
function sessionPullRequestsWereClosed(session) {
  const withPr = session.sends.filter(
    (entry) => 'sent' === entry.type && entry.prUrl,
  );
  if (!withPr.length) {
    return false;
  }
  return withPr.every((entry) => 'closed' === entry.prState);
}

/**
 * One fixing session: Fix with AI, follow-up requests, and optional start over.
 *
 * @param {Object}  props
 * @param {Object}  props.session    Grouped fixing session.
 * @param {boolean} props.focusPulse Whether to pulse the card border briefly.
 * @return {JSX.Element} Session card.
 */
function FixingSessionCard({ session, focusPulse = false }) {
  const pullRequestsWereClosed = sessionPullRequestsWereClosed(session);
  const draft = [...session.sends]
    .reverse()
    .find((entry) => entry.draft)?.draft;

  let title;
  if (session.reverted) {
    title = sprintf(
      /* translators: %d: fix attempt number, starting at 1. */
      __('Fix attempt %d', 'alpaca-issue-tracker'),
      session.number,
    );
  } else if (session.isCurrent) {
    title = sprintf(
      /* translators: %d: fix attempt number, starting at 1. */
      __('Fix attempt %d (current)', 'alpaca-issue-tracker'),
      session.number,
    );
  } else if (pullRequestsWereClosed) {
    title = sprintf(
      /* translators: %d: fix attempt number, starting at 1. */
      __('Fix attempt %d (closed)', 'alpaca-issue-tracker'),
      session.number,
    );
  } else {
    title = sprintf(
      /* translators: %d: fix attempt number, starting at 1. */
      __('Fix attempt %d', 'alpaca-issue-tracker'),
      session.number,
    );
  }

  const cardClassName = [
    'agentic-session',
    session.isCurrent && !pullRequestsWereClosed
      ? 'agentic-session--current'
      : '',
    session.reverted ? 'agentic-session--cancelled' : '',
    !session.reverted && pullRequestsWereClosed
      ? 'agentic-session--closed'
      : '',
    focusPulse ? 'agentic-session--focus-pulse' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const details = draft ? (
    <div className="agentic-session__details">
      <p className="agentic-activity-strip__draft-title">{draft.title}</p>
      <pre className="agentic-activity-strip__draft-body">{draft.body}</pre>
    </div>
  ) : null;

  return (
    <section className={cardClassName}>
      <header className="agentic-session__header">
        {draft ? (
          <details className="agentic-session__disclosure">
            <summary className="agentic-session__title">{title}</summary>
            {details}
          </details>
        ) : (
          <h4 className="agentic-session__title">{title}</h4>
        )}
      </header>
      <div className="agentic-session__steps">
        {session.sends.map((entry, sendIndex) => (
          <SessionSendStep
            key={
              (entry.url || String(entry.githubNumber) || 'send') +
              '-' +
              sendIndex
            }
            entry={entry}
            sendIndex={sendIndex}
          />
        ))}
        {session.reverted ? (
          <SessionCancelledStep entry={session.reverted} />
        ) : null}
      </div>
    </section>
  );
}

FixingSessionCard.propTypes = {
  session: PropTypes.object.isRequired,
  focusPulse: PropTypes.bool,
};

/**
 * Fix with AI activity log tab content.
 *
 * @param {Object} props
 * @param {number} props.issueId      Alpaca issue post ID.
 * @param {Object} props.issueDetails Issue details payload.
 * @return {JSX.Element} AgenticHistoryTab component
 */
const AgenticHistoryTab = ({ issueId, issueDetails }) => {
  const history = readAgenticHistoryFromMeta(issueDetails?.meta || {});
  const [livePullRequests, setLivePullRequests] = useState(() =>
    readLivePullRequests(issueId),
  );
  const [focusCurrentSession, setFocusCurrentSession] = useState(() =>
    takeAgenticSessionFocus(issueId),
  );

  useEffect(() => {
    setLivePullRequests(readLivePullRequests(issueId));

    const applyLiveStatus = (payload) => {
      if (payload?.issueId !== issueId) {
        return;
      }
      setLivePullRequests(
        Array.isArray(payload.pullRequests) ? payload.pullRequests : [],
      );
    };

    if (wp.hooks && 'function' === typeof wp.hooks.addAction) {
      wp.hooks.addAction(
        'alpaca.agentic.status',
        'alpaca/agentic-history-prs',
        applyLiveStatus,
      );
    }

    return () => {
      if (wp.hooks && 'function' === typeof wp.hooks.removeAction) {
        wp.hooks.removeAction(
          'alpaca.agentic.status',
          'alpaca/agentic-history-prs',
        );
      }
    };
  }, [issueId]);

  useEffect(() => {
    const focusSession = (targetIssueId) => {
      if (targetIssueId === issueId) {
        setFocusCurrentSession(true);
      }
    };

    if (wp.hooks && 'function' === typeof wp.hooks.addAction) {
      wp.hooks.addAction(
        'alpaca.agentic.focusCurrentSession',
        'alpaca/agentic-history-focus',
        focusSession,
      );
    }

    return () => {
      if (wp.hooks && 'function' === typeof wp.hooks.removeAction) {
        wp.hooks.removeAction(
          'alpaca.agentic.focusCurrentSession',
          'alpaca/agentic-history-focus',
        );
      }
    };
  }, [issueId]);

  useEffect(() => {
    if (!focusCurrentSession) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setFocusCurrentSession(false);
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [focusCurrentSession]);

  const sessions = groupAgenticHistoryIntoSessions(
    history.map((entry) =>
      'sent' === entry.type
        ? mergeLivePullRequestIntoSentEntry(entry, livePullRequests)
        : entry,
    ),
  );

  const chronologicalSessions = [...sessions].reverse();
  const logItems = [];
  let lastTargetBranch = '';
  chronologicalSessions.forEach((session) => {
    const targetBranch = readSessionTargetBranch(session);
    if (targetBranch && targetBranch !== lastTargetBranch) {
      logItems.push({
        type: 'branch',
        key: 'branch-' + session.number,
        branch: targetBranch,
        isChange: '' !== lastTargetBranch,
      });
      lastTargetBranch = targetBranch;
    }
    logItems.push({
      type: 'session',
      key: 'session-' + session.number,
      session,
    });
  });
  logItems.reverse();

  if (!history.length) {
    return (
      <div className="agentic-history-tab">
        <p className="agentic-history-tab__empty">
          {__('No Fix with AI activity yet.', 'alpaca-issue-tracker')}
        </p>
      </div>
    );
  }

  return (
    <div className="agentic-history-tab">
      <div className="agentic-session-list">
        {logItems.map((item) => {
          if ('branch' === item.type) {
            return (
              <SessionTargetBranchLine
                key={item.key}
                branch={item.branch}
                isChange={item.isChange}
              />
            );
          }
          return (
            <FixingSessionCard
              key={item.key}
              session={item.session}
              focusPulse={
                item.session.isCurrent && focusCurrentSession
              }
            />
          );
        })}
      </div>
    </div>
  );
};

AgenticHistoryTab.propTypes = {
  issueId: PropTypes.number.isRequired,
  issueDetails: PropTypes.shape({
    meta: PropTypes.object,
  }),
};

export default AgenticHistoryTab;
