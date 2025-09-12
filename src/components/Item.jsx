const { forwardRef } = wp.element;
import { useWatchlist } from "../context/WatchlistContext";
import User from "./User";
import ChecklistIcon from "./icons/ChecklistIcon";
import CommentIcon from "./icons/CommentIcon";
import CalendarIcon from "./icons/CalendarIcon";

const { date } = wp;
const datesettings = wp.date.getSettings();

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
      onClick,
      ...props
    },
    ref
  ) => {
    const { isWatched, toggleWatch } = useWatchlist();
    const watched = isWatched(id);

    const assigneeDataAttributes = assignees.reduce((acc, assignee) => {
      if (assignee && assignee.id) {
        acc[`data-assignee-${assignee.id}`] = "";
      }
      return acc;
    }, {});

    const watchedClass = watched ? "is-watched item-highlight" : "";

    const deadline =
      meta && meta.deadline && meta.deadline[0]
        ? new Date(meta.deadline[0])
        : null;
    const isValidDeadline = deadline && !isNaN(deadline);

    const deadlineFormatted = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(deadline);

    let diffDays = null;
    if (isValidDeadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    }

    const lateClass = diffDays < 0 ? "is-late" : "";

    const checklistItems = meta?.checklist || [];
    const totalChecklistItems = checklistItems.length;
    const checkedChecklistItems = checklistItems.filter(
      (item) => item.checked !== 0
    ).length;

    return (
      <div
        ref={ref}
        className={`${className} ${watchedClass} ${lateClass}`.trim()}
        style={style}
        data-id={id}
        data-days-left={diffDays}
        {...assigneeDataAttributes}
        {...props}
        onClick={onClick}
      >
        <div className="alpaca-item-upper">
          <div className="alpaca-item-content">{content}</div>
          <div className="alpaca-item-controls">
            <div
              className="dashicons dashicons-star-filled"
              onClick={(e) => {
                e.stopPropagation();
                toggleWatch(id);
              }}
            ></div>
          </div>
        </div>
        <div className="alpaca-item-meta">
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

          {typeof comment_count !== "undefined" && comment_count > 0 && (
            <div className="alpaca-item-icon alpaca-item-comment-count">
              <CommentIcon />
              {comment_count}
            </div>
          )}

          {totalChecklistItems > 0 && (
            <div className="alpaca-item-icon alpaca-item-checklist-count">
              <ChecklistIcon />
              {`${checkedChecklistItems}/${totalChecklistItems}`}
            </div>
          )}

          {isValidDeadline && (
            <div className="alpaca-item-icon alpaca-item-deadline">
              <CalendarIcon />
              {diffDays > 0
                ? deadlineFormatted
                : diffDays === 0
                ? "Today"
                : diffDays === 1
                ? "Tomorrow"
                : diffDays === -1
                ? "Yesterday"
                : deadlineFormatted}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default Item;
