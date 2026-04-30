const { FormTokenField } = wp.components;
const { __ } = wp.i18n;
const { memo, useCallback, useMemo } = wp.element;

const AssigneeSelector = memo(
  ({ assignees, allUsers, allUserObjects, onChange, isLoading }) => {
    const usersBySuggestion = useMemo(() => {
      const map = new Map();

      (allUserObjects || []).forEach((userObject) => {
        if (userObject?.name) {
          map.set(userObject.name, userObject);
        }

        if (userObject?.slug) {
          map.set(userObject.slug, userObject);
        }
      });

      return map;
    }, [allUserObjects]);

    const renderSuggestionItem = useCallback(
      ({ item }) => {
        const userObject = usersBySuggestion.get(item);
        const avatar = userObject?.avatar || '';
        const displayName = userObject?.name || item;

        return (
          <span className="alpaca-assignee-suggestion-item">
            {avatar ? (
              <img
                className="alpaca-assignee-suggestion-avatar"
                src={avatar}
                alt=""
                aria-hidden="true"
              />
            ) : (
              <span
                className="alpaca-assignee-suggestion-avatar alpaca-assignee-suggestion-avatar-fallback dashicons dashicons-admin-users"
                aria-hidden="true"
              ></span>
            )}
            <span className="alpaca-assignee-suggestion-name">
              {displayName}
            </span>
          </span>
        );
      },
      [usersBySuggestion],
    );

    return (
      <div className="alpaca-assignees-selector">
        <FormTokenField
          label=""
          placeholder={__('Enter username(s)', 'alpaca')}
          value={assignees}
          suggestions={allUsers}
          onChange={onChange}
          disabled={isLoading}
          __nextHasNoMarginBottom
          __next40pxDefaultSize
          __experimentalRenderItem={renderSuggestionItem}
        />
      </div>
    );
  },
  // Only re-render if these props actually change
  (prev, next) =>
    prev.isLoading === next.isLoading &&
    prev.assignees.join(',') === next.assignees.join(',') &&
    prev.allUsers.join(',') === next.allUsers.join(',') &&
    prev.allUserObjects === next.allUserObjects,
);

export default AssigneeSelector;
