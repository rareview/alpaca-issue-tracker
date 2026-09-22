export const processAssigneeChanges = (oldAssignees, newAssignees) => {
  const added = newAssignees.filter((name) => !oldAssignees.includes(name));
  const removed = oldAssignees.filter((name) => !newAssignees.includes(name));
  return { added, removed };
};
