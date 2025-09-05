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
  ];
};
