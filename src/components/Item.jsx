const { forwardRef, useState, useEffect } = wp.element;
import User from "./User";

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

    const watchedClass = isWatched ? "is-watched item-highlight" : "";

    const deadline =
      meta && meta.deadline && meta.deadline[0]
        ? new Date(meta.deadline[0])
        : null;
    const isValidDeadline = deadline && !isNaN(deadline);

    let diffDays = null;
    if (isValidDeadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    }

    const lateClass = diffDays < 0 ? "is-late" : "";

    return (
      <div
        ref={ref}
        className={`${className} ${watchedClass} ${lateClass}`.trim()}
        style={style}
        data-id={id}
        data-diff-days={diffDays}
        {...assigneeDataAttributes}
        {...props}
      >
        <div className="alpaca-item-upper">
          <div className="alpaca-item-content">{content}</div>
          <div className="alpaca-item-controls">
            <div
              className="dashicons dashicons-star-filled"
              onClick={toggleWatch}
            ></div>
          </div>
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
                <User key={assignee.id} user={assignee} />
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
          {isValidDeadline && (
            <div className="alpaca-item-deadline has-dashicon">
              <span
                className="dashicons dashicons-calendar"
                aria-hidden="true"
              ></span>
              {/* deadline.toLocaleDateString(undefined, { month: "short", day: "numeric", }) */}
              {diffDays > 0
                ? `${diffDays} day${diffDays > 1 ? "s" : ""} left`
                : diffDays === 0
                ? "Today"
                : `${Math.abs(diffDays)} day${diffDays < -1 ? "s" : ""} ago`}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default Item;