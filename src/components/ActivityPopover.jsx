import Activity from '../Activity';
import { WatchlistProvider } from '../context/WatchlistContext';

const { __ } = wp.i18n;
const { useEffect, useRef, useState, createPortal } = wp.element;

/**
 * Render the Project Activity toolbar control and popover.
 *
 * @return {JSX.Element} Activity toolbar control.
 */
const ActivityPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    closeButtonRef.current?.focus();

    return () => {
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        popoverRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="alpaca-activity-popover-control">
      <button
        ref={triggerRef}
        type="button"
        className={`alpaca-activity-trigger${isOpen ? ' is-open' : ''}`}
        onClick={() => setIsOpen((previousValue) => !previousValue)}
        aria-expanded={isOpen}
        aria-controls="alpaca-activity-popover"
      >
        <span className="dashicons dashicons-format-chat" aria-hidden="true" />
        {__('Project Activity', 'alpaca-issue-tracker')}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            id="alpaca-activity-popover"
            className="alpaca-activity-popover"
            role="dialog"
            aria-modal="true"
            aria-label={__('Project Activity', 'alpaca-issue-tracker')}
          >
            <div className="alpaca-activity-popover-header">
              <h2>{__('Project Activity', 'alpaca-issue-tracker')}</h2>
              <button
                type="button"
                ref={closeButtonRef}
                className="alpaca-activity-popover-close"
                onClick={() => setIsOpen(false)}
                aria-label={__(
                  'Close Project Activity',
                  'alpaca-issue-tracker',
                )}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <WatchlistProvider>
              <Activity isPopover />
            </WatchlistProvider>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ActivityPopover;
