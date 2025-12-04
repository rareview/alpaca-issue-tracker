import { fetchUsers } from './issueApi'; // Reusing existing fetchUsers

export const fetchAllAssignees = async () => {
  const users = await fetchUsers();
  return users.map((user) => ({
    id: user.id.toString(),
    displayName: user.display_name || user.name,
    slug: user.slug,
    avatar:
      user.avatar_urls?.['96'] ||
      user.avatar_urls?.['48'] ||
      user.avatar_urls?.['24'] ||
      '',
  }));
};
