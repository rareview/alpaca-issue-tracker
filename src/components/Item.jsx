const { forwardRef } = wp.element;

const Item = forwardRef(
  (
    { id, content, assignees = [], comment_count, className, style, ...props },
    ref
  ) => {
    const assigneeDataAttributes = assignees.reduce((acc, assignee) => {
      if (assignee && assignee.id) {
        acc[`data-assignee-${assignee.id}`] = "";
      }
      return acc;
    }, {});

    return (
      <div
        ref={ref}
        className={className}
        style={style}
        data-id={id}
        {...assigneeDataAttributes}
        {...props}
      >
        <div className="alpaca-item-content">{content}</div>
        <div className="alpaca-item-controls">
          <div className="dashicons dashicons-star-filled"></div>
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
        </div>
      </div>
    );
  }
);

export default Item;
