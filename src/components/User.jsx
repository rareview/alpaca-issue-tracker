const { useMemo } = wp.element;
import PropTypes from 'prop-types';
import { useUser } from '../hooks/useUser';

const User = ({ user: userProp, showAvatar = true, showName = true }) => {
  const { user, loading } = useUser(userProp);

  const { userName, avatarUrl } = useMemo(() => {
    if (!user) return { userName: null, avatarUrl: null };
    const apiData = user;
    const displayName =
      apiData.displayName || apiData.display_name || apiData.name; // eslint-disable-line camelcase
    const avatarUrls = apiData.avatar_urls; // eslint-disable-line camelcase
    return {
      userName: displayName,
      avatarUrl: apiData.avatar || (avatarUrls && avatarUrls[96]), // eslint-disable-line camelcase
    };
  }, [user]);

  if (loading) return <div className="alpaca-user">Loading...</div>;
  if (!user) return null;

  return (
    <div className="alpaca-user" title={userName}>
      {showAvatar && avatarUrl && (
        <div className="alpaca-user-avatar">
          <img src={avatarUrl} alt={`Avatar of ${userName}`} />
        </div>
      )}
      {showName && <div className="alpaca-user-name">{userName}</div>}
    </div>
  );
};

User.propTypes = {
  user: PropTypes.object,
  showAvatar: PropTypes.bool,
  showName: PropTypes.bool,
};

export default User;
