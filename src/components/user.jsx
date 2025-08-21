const { useState, useEffect } = wp.element;
import { getUser } from "../utils/usercache";

const User = ({ user }) => {
  const [userData, setUserData] = useState(
    typeof user === "object" ? user : null
  );
  const [loading, setLoading] = useState(typeof user === "number");

  useEffect(() => {
    if (
      typeof user === "number" ||
      (typeof user === "string" && !isNaN(user))
    ) {
      const userId = parseInt(user, 10);
      setLoading(true);
      getUser(userId)
        .then(setUserData)
        .catch((err) => {
          console.error("Error fetching user:", err);
          setUserData(null);
        })
        .finally(() => setLoading(false));
    } else if (typeof user === "object") {
      setUserData(user);
    } else {
      setUserData(null);
    }
  }, [user]);

  if (loading) return <div className="alpaca-user">Loading...</div>;
  if (!userData) return null;

  const { name, avatar, display_name, avatar_urls } = userData;
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
