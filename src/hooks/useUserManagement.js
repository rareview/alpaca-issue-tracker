const { useState, useEffect } = wp.element;
import { fetchUsers } from '../services/issueApi'; // Assuming this will be created

const useUserManagement = (enabled = true) => {
  const [allUsers, setAllUsers] = useState([]);
  const [allUserObjects, setAllUserObjects] = useState([]);
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    if (!enabled) {
      return;
    }

    fetchUsers()
      .then((users) => {
        const usersWithAvatar = users.map((u) => ({
          ...u,
          avatar:
            u.avatar_urls?.['48'] ||
            u.avatar_urls?.['96'] ||
            u.avatar_urls?.['24'] ||
            '',
        }));

        const localUserMap = {};
        usersWithAvatar.forEach((u) => {
          localUserMap[u.name] = u.slug;
          localUserMap[u.slug] = u.slug;
        });

        setUserMap(localUserMap);
        setAllUsers(usersWithAvatar.map((u) => u.name));
        setAllUserObjects(usersWithAvatar);
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
      });
  }, [enabled]);

  return { allUsers, allUserObjects, userMap };
};

export default useUserManagement;
