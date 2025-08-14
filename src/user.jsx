const { useState, useRef, useEffect } = wp.element;

// Main AlpacaUser component which will be rendered by WordPress
// It now accepts a 'userId' prop
const AlpacaUser = ({ userId }) => {
  // State to hold the user data being displayed
  const [displayedUser, setDisplayedUser] = useState(null);
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for error messages
  const [error, setError] = useState(null);

  /**
   * Fetches user data from the WordPress REST API.
   * @param {string | number | null} idToFetch - The ID of the user to fetch. If null, fetches data for the current user ('me' endpoint).
   */
  const fetchUserData = async (idToFetch = null) => {
    // Ensure wpApiSettings is available, which is exposed by WordPress in the admin area
    if (
      typeof window.wpApiSettings === "undefined" ||
      !window.wpApiSettings.root
    ) {
      setError(
        "WordPress API settings not found. Ensure this component is loaded within a WordPress admin context."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Determine the API endpoint based on whether an ID is provided
      const endpoint = idToFetch
        ? `wp/v2/users/${idToFetch}`
        : `wp/v2/users/me`;
      const apiUrl = `${window.wpApiSettings.root}${endpoint}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Include the WordPress nonce for authentication and CSRF protection.
          // wpApiSettings.nonce is usually localized by WordPress for backend scripts.
          "X-WP-Nonce": window.wpApiSettings.nonce || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const userData = await response.json();
      setDisplayedUser(userData); // Update the displayed user
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setDisplayedUser(null); // Clear displayed user on error
      setError(`Error loading user data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Effect hook to fetch data when the component mounts or when the 'userId' prop changes
  useEffect(() => {
    // If a userId prop is provided, fetch that specific user, otherwise fetch the current user
    if (userId) {
      fetchUserData(userId);
    } else {
      fetchUserData(); // Calls without an ID to get the current user
    }
  }, [userId]); // Re-run effect if the userId prop changes

  // Get the highest resolution avatar URL available from the displayedUser object
  const avatarUrl = displayedUser?.avatar_urls
    ? displayedUser.avatar_urls["96"] ||
      displayedUser.avatar_urls["48"] ||
      displayedUser.avatar_urls["24"]
    : "https://placehold.co/96x96/cccccc/333333?text=Avatar"; // Placeholder if no avatar URL is found

  return (
    <div className="alpaca-user-container">
      {/* Conditional rendering for loading, error, or user data */}
      {loading && "Loading user data..."}

      {error && !loading && (
        <div className="alpaca-error-message" role="alert">
          <strong>Error!</strong>
          <span className="alpaca-error-text">{error}</span>
        </div>
      )}

      {!displayedUser && !loading && !error && (
        <div className="alpaca-error-message" role="alert">
          <strong>Error!</strong>
          <span className="alpaca-error-text">No user data available</span>
        </div>
      )}

      {displayedUser && !loading && (
        <>
          <div>
            <img src={avatarUrl} alt={`Avatar of ${displayedUser.name}`} />
          </div>
          <div>
            {displayedUser.name} ({displayedUser.id})
          </div>
        </>
      )}
    </div>
  );
};

// Export the AlpacaUser component as default for React to render
export default AlpacaUser;
