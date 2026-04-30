const { useState, useRef, memo } = wp.element;
const { __ } = wp.i18n;
import PropTypes from 'prop-types';

const { BaseControl, Popover, DatePicker, Button } = wp.components;

const { date } = wp;
const datesettings = wp.date.getSettings();

/**
 * DeadlineControl component for managing issue deadlines.
 *
 * @param {Object}   root0           - Props object
 * @param {string}   root0.deadline  - Deadline date string
 * @param {Function} root0.onChange  - Change handler
 * @param {Function} root0.onClear   - Clear handler
 * @param {boolean}  root0.isLoading - Loading state
 * @return {JSX.Element} DeadlineControl component
 */
const DeadlineControl = memo(({ deadline, onChange, onClear, isLoading }) => {
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const calendarButtonRef = useRef();

  return (
    <BaseControl
      id="alpaca-deadline-control"
      className="alpaca-deadline-control"
      __nextHasNoMarginBottom
    >
      <div className="alpaca-deadline alpaca-flex-align">
        <div
          ref={calendarButtonRef}
          className={`alpaca-input alpaca-deadline-display ${deadline ? '' : 'placeholder'}`}
          onClick={() => setIsEditingDeadline((prev) => !prev)}
          contentEditable={false} // read-only for now
          role="button"
          tabIndex={0} // makes it focusable
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsEditingDeadline(true);
              e.preventDefault();
            }
          }}
        >
          {deadline
            ? date.format(datesettings.formats.date, deadline)
            : __('Click to select a deadline', 'alpaca')}
        </div>

        {isEditingDeadline && (
          <Popover
            placement="bottom-start"
            onClose={() => setIsEditingDeadline(false)}
            anchor={calendarButtonRef.current}
            focusOnMount={true}
            className="alpaca-deadline-popover"
            onFocusOutside={() => setIsEditingDeadline(false)}
            onEscape={() => setIsEditingDeadline(false)}
          >
            <DatePicker
              currentDate={deadline}
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
            label={__('Clear deadline', 'alpaca')}
            onClick={onClear}
            disabled={isLoading}
            className="is-small"
          />
        )}
      </div>
    </BaseControl>
  );
});

DeadlineControl.propTypes = {
  deadline: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

DeadlineControl.displayName = 'DeadlineControl';

export default DeadlineControl;
