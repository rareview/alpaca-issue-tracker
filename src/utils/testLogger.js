const { useEffect } = wp.element;

export const useTestLogger = (enable) => {
  useEffect(() => {
    if (!enable) {
      return;
    }
    const logStatusChange = (
      movedItem,
      sourceContainerTitle,
      destinationContainerTitle,
    ) => {
      // eslint-disable-next-line no-console
      console.log(
        `Item "${movedItem.content}" moved from "${sourceContainerTitle}" to "${destinationContainerTitle}"`,
      );
    };

    const logAssigneesChange = (issueId, assignees) => {
      // eslint-disable-next-line no-console
      console.log(`Assignees changed for issue ${issueId}:`, assignees);
    };

    const logAssigneesUpdated = (assignees) => {
      // eslint-disable-next-line no-console
      console.log('Global assignees list updated:', assignees);
    };

    const logIssueSubmitted = (issue, statusId) => {
      // eslint-disable-next-line no-console
      console.log(`Issue submitted:`, issue, `with status ID:`, statusId);
    };

    const logCommentPosted = (comment) => {
      // eslint-disable-next-line no-console
      console.log(`Comment posted:`, comment);
    };

    const logCommentUpdated = (comment) => {
      // eslint-disable-next-line no-console
      console.log(`Comment updated:`, comment);
    };

    const logCommentDeleted = (comment) => {
      // eslint-disable-next-line no-console
      console.log(`Comment deleted:`, comment);
    };

    const logIssueDeleted = (issueId) => {
      // eslint-disable-next-line no-console
      console.log(`Issue ${issueId} deleted`);
    };

    wp.hooks.addAction('alpaca.statusChanged', 'alpaca/test', logStatusChange);
    wp.hooks.addAction(
      'alpaca.issueAssigneesChanged',
      'alpaca/test',
      logAssigneesChange,
    );
    wp.hooks.addAction(
      'alpaca.allAssigneesUpdated',
      'alpaca/test',
      logAssigneesUpdated,
    );
    wp.hooks.addAction(
      'alpaca.issueSubmitted',
      'alpaca/test',
      logIssueSubmitted,
    );
    wp.hooks.addAction('alpaca.commentPosted', 'alpaca/test', logCommentPosted);
    wp.hooks.addAction(
      'alpaca.commentUpdated',
      'alpaca/test',
      logCommentUpdated,
    );
    wp.hooks.addAction(
      'alpaca.commentDeleted',
      'alpaca/test',
      logCommentDeleted,
    );
    wp.hooks.addAction('alpaca.issueDeleted', 'alpaca/test', logIssueDeleted);

    const logCommentCountChanged = (data) => {
      // eslint-disable-next-line no-console
      console.log(`Comment count changed:`, data);
    };
    wp.hooks.addAction(
      'alpaca.commentCountChanged',
      'alpaca/test',
      logCommentCountChanged,
    );

    return () => {
      wp.hooks.removeAction('alpaca.statusChanged', 'alpaca/test');
      wp.hooks.removeAction('alpaca.issueAssigneesChanged', 'alpaca/test');
      wp.hooks.removeAction('alpaca.allAssigneesUpdated', 'alpaca/test');
      wp.hooks.removeAction('alpaca.issueSubmitted', 'alpaca/test');
      wp.hooks.removeAction('alpaca.commentPosted', 'alpaca/test');
      wp.hooks.removeAction('alpaca.commentUpdated', 'alpaca/test');
      wp.hooks.removeAction('alpaca.commentDeleted', 'alpaca/test');
      wp.hooks.removeAction('alpaca.issueDeleted', 'alpaca/test');
      wp.hooks.removeAction('alpaca.commentCountChanged', 'alpaca/test');
    };
  }, [enable]);
};
