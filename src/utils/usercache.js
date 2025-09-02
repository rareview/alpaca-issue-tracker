const cache = new Map();

export async function getUser(id = 'me') {
  if (cache.has(id)) {
    return cache.get(id);
  }
  const user = await wp.apiFetch({ path: `/wp/v2/users/${id}` });
  cache.set(id, user);
  return user;
}
