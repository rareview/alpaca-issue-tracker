export const getTabsConfig = (issueDetails) => {
  return [
    { name: 'comments', title: 'Timeline', className: 'comments' },
    { name: 'report', title: 'Report', className: 'report' },
    ...((issueDetails?.meta?.alpaca_queried_object &&
      issueDetails.meta.alpaca_queried_object !== 'null') ||
    (issueDetails?.meta?.queriedObject &&
      issueDetails.meta.queriedObject !== 'null')
      ? [
          {
            name: 'queriedobject',
            title: 'Queried Object',
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
            title: 'Headers',
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
            title: 'Errors',
            className: 'errors',
          },
        ]
      : []),
  ];
};
