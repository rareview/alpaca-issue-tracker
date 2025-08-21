const User = ({ user }) => {
  if (!user) {
    return null;
  }

  const { id, name, avatar, display_name, avatar_urls } = user;
  const userName = display_name || name;

  const avatarUrl =
    avatar ||
    (avatar_urls && avatar_urls[96]) ||
    "https://placehold.co/96x96/cccccc/333333?text=Avatar";

  return (
    <div className="alpaca-user">
      <div className="alpaca-user-avatar">
        <img src={avatarUrl} alt={userName} />
      </div>
      <div className="alpaca-user-name">{userName}</div>
    </div>
  );
};

export default User;
