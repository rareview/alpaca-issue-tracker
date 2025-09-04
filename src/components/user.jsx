const { useMemo } = wp.element;
import { useUser } from '../hooks/useUser';

const User = ({ user: userProp }) => {
  const { user, loading } = useUser(userProp);

  const { userName, avatarUrl } = useMemo(() => {
    if (!user) return { userName: null, avatarUrl: null };
    const { name, avatar, display_name, avatar_urls } = user;
    const userName = display_name || name;
    const avatarUrl = avatar || (avatar_urls && avatar_urls[96]);
    return { userName, avatarUrl };
  }, [user]);

  if (loading) return <div className="alpaca-user">Loading...</div>;
  if (!user) return null;

  return (
    <div className="alpaca-user" title={userName}>
      {avatarUrl && (
        <div className="alpaca-user-avatar">
          <img src={avatarUrl} alt={`Avatar of ${userName}`} />
        </div>
      )}
      <div className="alpaca-user-name">{userName}</div>
    </div>
  );
};

export default User;
