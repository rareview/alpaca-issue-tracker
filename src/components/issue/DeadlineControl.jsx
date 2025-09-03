const { useState, useRef, memo } = wp.element;
const { BaseControl, Popover, DatePicker, Button } = wp.components;

const { date } = wp;
const datesettings = wp.date.getSettings();

const DeadlineControl = memo(({ deadline, onChange, onClear, isLoading }) => {
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const calendarButtonRef = useRef();

  return (
    <BaseControl label="Deadline" className="alpaca-deadline-control">
      <div className="alpaca-deadline">
        <div className="alpaca-deadline-date">
          <input
            readOnly
            type="text"
            value={
              deadline
                ? date.format(datesettings.formats.date, deadline)
                : "No deadline set."
            }
            onClick={() => setIsEditingDeadline((prev) => !prev)}
            ref={calendarButtonRef}
            disabled={isLoading}
          />
        </div>

        {isEditingDeadline && (
          <Popover
            placement="bottom-start"
            onClose={() => setIsEditingDeadline(false)}
            anchor={calendarButtonRef.current}
            focusOnMount={false}
            className="alpaca-deadline-popover"
          >
            <DatePicker
              current={deadline}
              onChange={(newDate) => {
                onChange(newDate);
                setIsEditingDeadline(false);
              }}
            />
          </Popover>
        )}

        {deadline && (
          <Button
            icon="trash"
            label="Clear deadline"
            onClick={onClear}
            disabled={isLoading}
          />
        )}
      </div>
    </BaseControl>
  );
});

export default DeadlineControl;
