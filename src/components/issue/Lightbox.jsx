const { useEffect, memo, createPortal } = wp.element;
const { __ } = wp.i18n;
import PropTypes from 'prop-types';

/**
 * Lightbox component for displaying enlarged images.
 *
 * @param {Object}   root0         - Props object
 * @param {string}   root0.src     - Image source URL
 * @param {Function} root0.onClose - Close handler
 * @return {JSX.Element} Lightbox component
 */
const Lightbox = memo(({ src, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999999999999,
      }}
      onClick={onClose}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClose();
        }
      }}
    >
      <img
        src={src}
        alt={__('Enlarged screenshot', 'alpaca-issue-tracker')}
        style={{
          maxWidth: '90%',
          maxHeight: '90%',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        }}
      />
    </div>,
    document.body,
  );
});

Lightbox.propTypes = {
  src: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

Lightbox.displayName = 'Lightbox';

export default Lightbox;
