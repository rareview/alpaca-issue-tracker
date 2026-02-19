import PropTypes from 'prop-types';
import Item from './Item';

const { forwardRef, useState, useEffect } = wp.element;

const DraggableItem = forwardRef(
  (
    {
      id,
      index,
      containerId,
      content,
      postDate,
      className,
      isDragDisabled = false,
      onClick,
      assignees = [],
      labels = [],
      commentCount,
      meta,
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleClick = (event) => {
      if (onClick) {
        onClick(event, id);
      }
    };

    const handleDragStart = (e) => {
      setIsDragging(true);

      const payload = {
        itemId: id,
        sourceContainerId: containerId,
        sourceIndex: index,
        content,
        postDate,
        assignees,
        labels,
        commentCount,
        meta,
      };

      try {
        e.dataTransfer.setData('application/json', JSON.stringify(payload));
        // Use browser detection from alpacaDataDump if available, fallback to regex
        const isSafari =
          (typeof alpacaDataDump !== 'undefined' &&
            alpacaDataDump.device?.browser?.name === 'Safari') ||
          /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (!isSafari) {
          // 1. Capture exact dimensions of the original element to prevent wrapping
          const rect = e.currentTarget.getBoundingClientRect();

          // 2. Clone the element
          const clone = e.currentTarget.cloneNode(true);

          // Clone element and lock dimensions
          clone.style.width = `${rect.width}px`;
          clone.style.height = `${rect.height}px`;
          clone.style.boxSizing = 'border-box';
          clone.classList.add('alpaca-drag-clone');

          // Rotate clone
          clone.style.transform = 'rotate(3deg)';
          clone.style.transformOrigin = 'center center';
          clone.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          clone.style.opacity = '1';

          // Create wrapper to preserve rotation
          const wrapper = document.createElement('div');
          wrapper.style.position = 'absolute';
          wrapper.style.top = '-9999px';
          wrapper.style.left = '-9999px';
          // Make wrapper large enough to hold the rotated clone without clipping
          wrapper.style.width = `${rect.width + 40}px`;
          wrapper.style.height = `${rect.height + 40}px`;

          // Center the clone inside the wrapper
          clone.style.position = 'absolute';
          clone.style.top = '20px';
          clone.style.left = '20px';
          clone.style.margin = '0';

          wrapper.appendChild(clone);
          document.body.appendChild(wrapper);

          // 6. Set the drag image
          e.dataTransfer.setDragImage(
            wrapper,
            rect.width / 2 + 20,
            rect.height / 2 + 20,
          );

          // 7. Cleanup
          setTimeout(() => {
            if (document.body.contains(wrapper)) {
              document.body.removeChild(wrapper);
            }
          }, 0);
        }
      } catch (err) {
        // ignore
      }

      // Fallback: store payload on window so dragover handlers can read it
      try {
        window.__alpacaDragState = payload;
      } catch (err) {
        // ignore
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      try {
        if (typeof window !== 'undefined') {
          delete window.__alpacaDragState;
        }
      } catch (err) {
        // ignore
      }
    };

    useEffect(() => {
      const onGlobalDragEnd = () => {
        setIsDragging(false);
      };
      window.addEventListener('dragend', onGlobalDragEnd);
      return () => {
        window.removeEventListener('dragend', onGlobalDragEnd);
      };
    }, []);

    return (
      <div
        ref={ref}
        draggable={!isDragDisabled}
        role="listitem"
        aria-grabbed={isDragging}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        data-index={index}
        data-id={id}
        /* distinct class for the source item being dragged */
        className={`${className} ${isDragging ? 'alpaca-item-dragging' : ''}`}
      >
        <Item
          id={id}
          content={content}
          postDate={postDate}
          assignees={assignees}
          labels={labels}
          commentCount={commentCount}
          meta={meta}
          className="alpaca-item-inner"
          onClick={handleClick}
        />
      </div>
    );
  },
);

DraggableItem.displayName = 'DraggableItem';

DraggableItem.propTypes = {
  id: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  containerId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  content: PropTypes.string.isRequired,
  postDate: PropTypes.string,
  className: PropTypes.string,
  isDragDisabled: PropTypes.bool,
  onClick: PropTypes.func,
  assignees: PropTypes.array,
  labels: PropTypes.array,
  commentCount: PropTypes.number,
  meta: PropTypes.object,
};

export default DraggableItem;
