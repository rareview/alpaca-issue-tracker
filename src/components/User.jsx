const { useMemo } = wp.element;
const { __ } = wp.i18n;
import PropTypes from 'prop-types';
import { useUser } from '../hooks/useUser';

const User = ({
  user: userProp,
  showAvatar = true,
  showName = true,
  avatarAfterName = false,
  avatarSize,
}) => {
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

  if (loading)
    return <div className="alpaca-user">{__('Loading…', 'alpaca-issue-tracker')}</div>;
  if (!user) return null;

  const avatarInlineStyle =
    typeof avatarSize === 'number' && avatarSize > 0
      ? { width: avatarSize, height: avatarSize }
      : undefined;

  const avatarNode =
    showAvatar && avatarUrl ? (
      <div className="alpaca-user-avatar">
        <img
          src={avatarUrl}
          alt={`Avatar of ${userName}`}
          style={avatarInlineStyle}
        />
      </div>
    ) : null;

  return (
    <div className="alpaca-user alpaca-flex-align" title={userName}>
      {!avatarAfterName && avatarNode}
      {showName && <div className="alpaca-user-name">{userName}</div>}
      {avatarAfterName && avatarNode}
    </div>
  );
};

User.propTypes = {
  user: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
    PropTypes.string,
  ]),
  showAvatar: PropTypes.bool,
  showName: PropTypes.bool,
  avatarAfterName: PropTypes.bool,
  avatarSize: PropTypes.number,
};

export default User;
