const { forwardRef, useState, useEffect } = wp.element;

const Item = forwardRef(
  (
    {
      id,
      content,
      assignees = [],
      comment_count,
      meta,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [isWatched, setIsWatched] = useState(false);

    useEffect(() => {
      wp.apiFetch({ path: "/alpaca/v1/watchlist" }).then((watchlist) => {
        if (watchlist && Array.isArray(watchlist) && watchlist.includes(id)) {
          setIsWatched(true);
        }
      });
    }, [id]);

    const toggleWatch = (e) => {
      e.stopPropagation();
      wp.apiFetch({
        path: "/alpaca/v1/watchlist",
        method: "POST",
        data: { issue_id: id },
      }).then((response) => {
        if (response.success) {
          setIsWatched(response.watchlist.includes(id));
        }
      });
    };

    const assigneeDataAttributes = assignees.reduce((acc, assignee) => {
      if (assignee && assignee.id) {
        acc[`data-assignee-${assignee.id}`] = "";
      }
      return acc;
    }, {});

    const watchedClass = isWatched ? "is-watched" : "";

    const deadline =
      meta && meta.deadline && meta.deadline[0]
        ? new Date(meta.deadline[0])
        : null;
    const isValidDate = deadline && !isNaN(deadline);

    return (
      <div
        ref={ref}
        className={`${className} ${watchedClass}`}
        style={style}
        data-id={id}
        {...assigneeDataAttributes}
        {...props}
      >
        <div className="alpaca-item-content">{content}</div>
        <div className="alpaca-item-controls">
          <div
            className="dashicons dashicons-star-filled"
            onClick={toggleWatch}
          ></div>
        </div>
        <div className="alpaca-item-meta">
          {/* --- Assignees --- */}
          {assignees.length > 0 && (
            <div
              className="alpaca-item-assignees"
              data-assignees={assignees.length}
              title={
                assignees.length === 1
                  ? assignees[0].display_name || assignees[0].name
                  : assignees.map((a) => a.display_name || a.name).join(", ")
              }
            >
              {assignees.map((assignee) => (
                <div key={assignee.id} className="alpaca-item-assignee">
                  {assignee.avatar && (
                    <img
                      className="alpaca-item-user-img"
                      src={assignee.avatar}
                      alt={assignee.display_name || assignee.name}
                      title={assignee.display_name || assignee.name}
                    />
                  )}
                  <div className="alpaca-item-assignee-name">
                    {assignee.display_name || assignee.name}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* If no assignees, show nothing */}

          {typeof comment_count !== "undefined" && comment_count > 0 && (
            <div className="alpaca-item-comment-count has-dashicon">
              <span
                className="dashicons dashicons-admin-comments"
                aria-hidden="true"
              ></span>
              {comment_count}
            </div>
          )}

          {/* --- Deadline --- */}
          {isValidDate && (
            <div className="alpaca-item-deadline has-dashicon">
              <span
                className="dashicons dashicons-calendar"
                aria-hidden="true"
              ></span>
              {deadline.toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default Item;
