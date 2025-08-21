const User = ({ user }) => {
  if (!user) {
    return null;
  }

  const { name, avatar, display_name, avatar_urls } = user;
  const userName = display_name || name;

  const avatarUrl = avatar || (avatar_urls && avatar_urls[96]);

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