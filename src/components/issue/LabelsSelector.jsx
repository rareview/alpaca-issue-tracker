import PropTypes from 'prop-types';

const { __ } = wp.i18n;
const { memo, useState, useRef, useEffect } = wp.element;
const { Button, Popover } = wp.components;

/**
 * Label selector for issue modal.
 *
 * @param {Object}   root0             Component props.
 * @param {Array}    root0.labels      Available labels.
 * @param {Array}    root0.selectedIds Selected label term IDs.
 * @param {Function} root0.onChange    Called with updated selected IDs.
 * @param {boolean}  root0.isLoading   Whether selector is disabled.
 * @return {JSX.Element} Label selector dropdown.
 */
const LabelsSelector = memo(
  ({ labels, selectedIds, onChange, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const controlRef = useRef(null);
    const selectedLabels = labels.filter((label) =>
      selectedIds.includes(Number(label.term_id)),
    );

    const toggleLabel = (termId, isChecked) => {
      if (isChecked) {
        onChange([...selectedIds, termId]);
        return;
      }

      onChange(selectedIds.filter((id) => id !== termId));
    };

    useEffect(() => {
      if (!isOpen) {
        return undefined;
      }

      const handleClickAway = (event) => {
        const clickInsidePopover = event.target.closest(
          '.alpaca-labels-selector-popover',
        );

        if (clickInsidePopover) {
          return;
        }

        if (!controlRef.current) {
          return;
        }

        if (!controlRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickAway);

      return () => {
        document.removeEventListener('mousedown', handleClickAway);
      };
    }, [isOpen]);

    return (
      <div className="alpaca-labels-selector" ref={controlRef}>
        <Button
          variant="link"
          className="alpaca-labels-selector-toggle"
          onClick={() => setIsOpen((previous) => !previous)}
          disabled={isLoading}
        >
          {selectedLabels.length > 0 && (
            <span className="alpaca-item-labels alpaca-labels-selector-pills">
              {selectedLabels.map((label) => (
                <span
                  key={label.term_id}
                  className="alpaca-item-label alpaca-label-pill"
                  style={{
                    backgroundColor: label.color || '#172b4d',
                    color: '#fff',
                  }}
                >
                  {label.name}
                </span>
              ))}
            </span>
          )}
          {selectedLabels.length < 1 && (
            <span className="alpaca-labels-selector-toggle-text">
              {__('Edit labels', 'alpaca')}
            </span>
          )}
        </Button>

        {isOpen && (
          <Popover
            placement="bottom-start"
            onClose={() => setIsOpen(false)}
            focusOnMount={false}
            anchor={controlRef.current}
            className="alpaca-labels-selector-popover"
          >
            <div className="alpaca-labels-selector-menu">
              {labels.length < 1 && (
                <p className="alpaca-labels-selector-empty">
                  {__('No labels are configured yet.', 'alpaca')}
                </p>
              )}

              {labels.map((label) => {
                const labelId = Number(label.term_id);
                const checkboxId = `alpaca-label-option-${labelId}`;
                const isChecked = selectedIds.includes(labelId);
                return (
                  <div
                    key={labelId}
                    className="alpaca-labels-selector-option"
                  >
                    <input
                      className="alpaca-labels-selector-checkbox"
                      id={checkboxId}
                      type="checkbox"
                      checked={isChecked}
                      disabled={isLoading}
                      onChange={(event) =>
                        toggleLabel(labelId, event.target.checked)
                      }
                    />
                    <label
                      htmlFor={checkboxId}
                      className="alpaca-item-label alpaca-label-pill alpaca-labels-selector-option-pill"
                      style={{
                        backgroundColor: label.color || '#172b4d',
                        color: '#fff',
                      }}
                    >
                      {label.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </Popover>
        )}
      </div>
    );
  },
  (prev, next) =>
    prev.isLoading === next.isLoading &&
    prev.labels === next.labels &&
    prev.selectedIds.join(',') === next.selectedIds.join(','),
);

LabelsSelector.propTypes = {
  labels: PropTypes.arrayOf(
    PropTypes.shape({
      term_id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string,
    }),
  ),
  selectedIds: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func,
  isLoading: PropTypes.bool,
};

LabelsSelector.defaultProps = {
  labels: [],
  selectedIds: [],
  onChange: () => {},
  isLoading: false,
};

export default LabelsSelector;
