export const parseChecklist = (metaChecklist) => {
  if (!metaChecklist) return [];
  try {
    return typeof metaChecklist === "string"
      ? JSON.parse(metaChecklist)
      : Array.isArray(metaChecklist) ? metaChecklist : [];
  } catch {
    return [];
  }
};