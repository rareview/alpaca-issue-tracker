const { useEffect } = wp.element;

export const useTestLogger = (enable) => {
  useEffect(() => {
    if (!enable) {
      return;
    }
    const logStatusChange = (
      movedItem,
      sourceContainerTitle,
      destinationContainerTitle
    ) => {
      console.log(
        `Item "${movedItem.content}" moved from "${sourceContainerTitle}" to "${destinationContainerTitle}"`
      );
    };

    const logAssigneesChange = (issueId, assignees) => {
      console.log(`Assignees changed for issue ${issueId}:`, assignees);
    };

    const logAssigneesUpdated = (assignees) => {
      console.log("Global assignees list updated:", assignees);
    };

    const logIssueSubmitted = (issue, statusId) => {
      console.log(`Issue submitted:`, issue, `with status ID:`, statusId);
    };

    const logChecklistItemUpdated = (oldLabel, newLabel) => {
      if (!oldLabel) {
        console.log(`Checklist item created: ${newLabel}`);
      } else {
        console.log(
          `Checklist item updated from "${oldLabel}" to "${newLabel}"`
        );
      }
    };

    const logCommentPosted = (comment) => {
      console.log(`Comment posted:`, comment);
    };

    const logCommentUpdated = (comment) => {
      console.log(`Comment updated:`, comment);
    };

    const logCommentDeleted = (comment) => {
      console.log(`Comment deleted:`, comment);
    };

    const logIssueDeleted = (issueId) => {
      console.log(`Issue ${issueId} deleted`);
    };

    wp.hooks.addAction("alpaca.statusChanged", "alpaca/test", logStatusChange);
    wp.hooks.addAction(
      "alpaca.issueAssigneesChanged",
      "alpaca/test",
      logAssigneesChange
    );
    wp.hooks.addAction(
      "alpaca.allAssigneesUpdated",
      "alpaca/test",
      logAssigneesUpdated
    );
    wp.hooks.addAction(
      "alpaca.issueSubmitted",
      "alpaca/test",
      logIssueSubmitted
    );
    wp.hooks.addAction(
      "alpaca.checklistItemUpdated",
      "alpaca/test",
      logChecklistItemUpdated
    );
    wp.hooks.addAction("alpaca.commentPosted", "alpaca/test", logCommentPosted);
    wp.hooks.addAction("alpaca.commentUpdated", "alpaca/test", logCommentUpdated);
    wp.hooks.addAction("alpaca.commentDeleted", "alpaca/test", logCommentDeleted);
    wp.hooks.addAction("alpaca.issueDeleted", "alpaca/test", logIssueDeleted);

    return () => {
      wp.hooks.removeAction("alpaca.statusChanged", "alpaca/test");
      wp.hooks.removeAction("alpaca.issueAssigneesChanged", "alpaca/test");
      wp.hooks.removeAction("alpaca.allAssigneesUpdated", "alpaca/test");
      wp.hooks.removeAction("alpaca.issueSubmitted", "alpaca/test");
      wp.hooks.removeAction("alpaca.checklistItemUpdated", "alpaca/test");
      wp.hooks.removeAction("alpaca.commentPosted", "alpaca/test");
      wp.hooks.removeAction("alpaca.commentUpdated", "alpaca/test");
      wp.hooks.removeAction("alpaca.commentDeleted", "alpaca/test");
      wp.hooks.removeAction("alpaca.issueDeleted", "alpaca/test");
    };
  }, [enable]);
};
