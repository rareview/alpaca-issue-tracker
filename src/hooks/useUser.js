const { useState, useEffect } = wp.element;

const cache = new Map();

export async function getUser(id = 'me') {
  if (cache.has(id)) {
    return cache.get(id);
  }
  const user = await wp.apiFetch({ path: `/wp/v2/users/${id}` });
  cache.set(id, user);
  return user;
}

export async function getUsers(ids) {
  const users = await Promise.all(ids.map(getUser));
  return users;
}

export const useUser = (user) => {
  const [userData, setUserData] = useState(
    typeof user === 'object' ? user : null,
  );
  const [loading, setLoading] = useState(
    typeof user === 'number' || (typeof user === 'string' && !isNaN(user)),
  );

  useEffect(() => {
    if (
      typeof user === 'number' ||
      (typeof user === 'string' && !isNaN(user))
    ) {
      const userId = parseInt(user, 10);
      setLoading(true);
      getUser(userId)
        .then(setUserData)
        .catch((err) => {
          console.error('Error fetching user:', err);
          setUserData(null);
        })
        .finally(() => setLoading(false));
    } else if (typeof user === 'object') {
      setUserData(user);
      setLoading(false);
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [user]);

  return { user: userData, loading };
};

/**
 * Generates HTML for an assignee span to be used in comments.
 * @param {Object}  user       The user object for the assignee.
 * @param {boolean} withAvatar Whether to include avatar.
 * @return {string} HTML string.
 */
export const generateAssigneeSpan = (user, withAvatar = false) => {
  if (!user) return '';

  const el = user.avatar && withAvatar === true ? 'strong' : 'span';
  const avatarAttr =
    user.avatar && withAvatar === true ? ` data-avatar="${user.avatar}"` : '';
  const displayName =
    user.name || user.display_name || user.username || 'Unknown';

  return `<${el} class="alpaca-status-assignee" data-userid="${user.id}"${avatarAttr}>${displayName}</${el}>`;
};
