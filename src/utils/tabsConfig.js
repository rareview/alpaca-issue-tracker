const { __ } = wp.i18n;

export const getTabsConfig = (issueDetails) => {
  return [
    { name: 'comments', title: __('Timeline', 'alpaca'), className: 'comments' },
    { name: 'report', title: __('Report', 'alpaca'), className: 'report' },
    ...((issueDetails?.meta?.alpaca_queried_object &&
      issueDetails.meta.alpaca_queried_object !== 'null') ||
    (issueDetails?.meta?.queriedObject &&
      issueDetails.meta.queriedObject !== 'null')
      ? [
          {
            name: 'queriedobject',
            title: __('Queried Object', 'alpaca'),
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
            title: __('Headers', 'alpaca'),
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
            title: __('Errors', 'alpaca'),
            className: 'errors',
          },
        ]
      : []),
  ];
};
