export const processAssigneeChanges = (oldAssignees, newAssignees) => {
  const added = newAssignees.filter((name) => !oldAssignees.includes(name));
  const removed = oldAssignees.filter((name) => !newAssignees.includes(name));
  return { added, removed };
};

export const createAssigneeComments = async (
  added,
  removed,
  allUserObjects,
  createComment,
  generateComment,
  issueId
) => {
  const commentPromises = [];

  added.forEach((name) => {
    const user = allUserObjects.find((u) => u.name === name);
    if (user) {
      commentPromises.push(createComment(issueId, generateComment(user, true)));
    }
  });

  removed.forEach((name) => {
    const user = allUserObjects.find((u) => u.name === name);
    if (user) {
      commentPromises.push(
        createComment(issueId, generateComment(user, false))
      );
    }
  });

  if (commentPromises.length > 0) {
    return Promise.all(commentPromises);
  }
  return Promise.resolve();
};
