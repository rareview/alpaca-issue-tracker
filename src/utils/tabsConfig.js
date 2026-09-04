const { __ } = wp.i18n;
import { hasAgenticHistory } from './agenticHistory';

export const getTabsConfig = (issueDetails) => {
  const hasBrowserContext =
    issueDetails?.meta?.alpaca_url ||
    issueDetails?.meta?.alpaca_screenshot ||
    issueDetails?.meta?.alpaca_queried_object ||
    issueDetails?.meta?.alpaca_headers;

  return [
    {
      name: 'comments',
      title: __('Timeline', 'alpaca-issue-tracker'),
      className: 'comments',
    },
    ...(hasBrowserContext
      ? [
          {
            name: 'report',
            title: __('Report', 'alpaca-issue-tracker'),
            className: 'report',
          },
        ]
      : []),
    ...((issueDetails?.meta?.alpaca_queried_object &&
      issueDetails.meta.alpaca_queried_object !== 'null') ||
    (issueDetails?.meta?.queriedObject &&
      issueDetails.meta.queriedObject !== 'null')
      ? [
          {
            name: 'queriedobject',
            title: __('Queried Object', 'alpaca-issue-tracker'),
            className: 'queried-object',
          },
        ]
      : []),
    ...((issueDetails?.meta?.alpaca_headers &&
      issueDetails.meta.alpaca_headers !== 'null') ||
    (issueDetails?.meta?.headers && issueDetails.meta.headers !== 'null')
      ? [
          {
            name: 'headers',
            title: __('Headers', 'alpaca-issue-tracker'),
            className: 'headers',
          },
        ]
      : []),
    ...((issueDetails?.meta?.alpaca_errors &&
      issueDetails.meta.alpaca_errors.length > 2) ||
    (issueDetails?.meta?.errors && issueDetails.meta.errors.length > 2)
      ? [
          {
            name: 'errors',
            title: __('Errors', 'alpaca-issue-tracker'),
            className: 'errors',
          },
        ]
      : []),
    // Only when the issue has Fix with AI activity history.
    ...(hasAgenticHistory(issueDetails?.meta)
      ? [
          {
            name: 'agentic',
            title: __('AI Log', 'alpaca-issue-tracker'),
            className: 'agentic',
          },
        ]
      : []),
  ];
};
