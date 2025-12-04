export const parseChecklist = (metaChecklist) => {
  if (!metaChecklist) return [];
  try {
    if (typeof metaChecklist === 'string') {
      return JSON.parse(metaChecklist);
    }
    if (Array.isArray(metaChecklist)) {
      return metaChecklist;
    }
    return [];
  } catch {
    return [];
  }
};
