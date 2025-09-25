export const getTabsConfig = (issueDetails) => {
  return [
    { name: "comments", title: "Timeline", className: "comments" },
    { name: "report", title: "Report", className: "report" },
    ...(issueDetails?.meta?.queriedObject &&
    issueDetails.meta.queriedObject !== "null"
      ? [
          {
            name: "queriedobject",
            title: "Queried Object",
            className: "queried-object",
          },
        ]
      : []),
    ...(issueDetails?.meta?.headers && issueDetails.meta.headers !== "null"
      ? [
          {
            name: "headers",
            title: "Headers",
            className: "headers",
          },
        ]
      : []),
    ...(issueDetails?.meta?.errors &&
    issueDetails.meta.errors.length > 2 // >2 to avoid empty array '[]'
      ? [
          {
            name: "errors",
            title: "Errors",
            className: "errors",
          },
        ]
      : []),
  ];
};
