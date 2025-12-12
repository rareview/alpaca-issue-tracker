import PropTypes from 'prop-types';
import Item from './Item';

const { useRef, useState } = wp.element;
// const { Draggable: WPDraggable } = wp.components || {};

/**
 * Draggable item wrapper component.
 *
 * @param {Object}          root0                - Props object
 * @param {number}          root0.id             - Item ID
 * @param {number}          root0.index          - Index in drag list
 * @param {string}          root0.content        - Item content text
 * @param {string}          root0.className      - CSS class name
 * @param {boolean}         root0.isDragDisabled - Whether dragging is disabled
 * @param {Function}        root0.onClick        - Click handler
 * @param {Array}           root0.assignees      - Array of assignees
 * @param {number}          root0.commentCount   - Comment count
 * @param {Object}          root0.meta           - Metadata object
 * @param {(number|string)} root0.containerId    - Container ID (number or string)
 * @return {JSX.Element}                          - Draggable item component
 */
function DraggableItem({
  id,
  index,
  containerId,
  content,
  className,
  isDragDisabled = false,
  onClick,
  assignees = [],
  commentCount,
  meta,
}) {
  const elRef = useRef(null);
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
      assignees,
      commentCount,
      meta,
    };

    try {
      e.dataTransfer.setData('application/json', JSON.stringify(payload));
    } catch (err) {
      // ignore
    }

    // Fallback: store payload on window so dragover handlers can read it
    try {
      window.__alpacaDragState = payload;
    } catch (err) {
      // ignore
    }

    // Create a lightweight drag image clone so user sees a preview
    if (elRef.current && e.dataTransfer && e.dataTransfer.setDragImage) {
      const original = elRef.current;
      const clone = original.cloneNode(true);
      const rect = original.getBoundingClientRect();

      // Recursively copy computed styles from original to clone so display:flex/grid
      // and child element styles are preserved in the preview.
      const copyComputedStylesRecursive = (src, dest) => {
        try {
          const cs = window.getComputedStyle(src);
          for (let i = 0; i < cs.length; i++) {
            const prop = cs[i];
            dest.style.setProperty(
              prop,
              cs.getPropertyValue(prop),
              cs.getPropertyPriority(prop),
            );
          }
        } catch (err) {
          // ignore copying styles on older browsers
        }

        const srcChildren = src.children || [];
        const destChildren = dest.children || [];
        for (
          let i = 0;
          i < srcChildren.length && i < destChildren.length;
          i++
        ) {
          copyComputedStylesRecursive(srcChildren[i], destChildren[i]);
        }
      };

      copyComputedStylesRecursive(original, clone);

      clone.style.position = 'absolute';
      clone.style.top = '-10000px';
      clone.style.left = '-10000px';
      // enforce size so width matches column width
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.margin = '0';
      clone.classList.add('alpaca-drag-clone');

      document.body.appendChild(clone);
      try {
        e.dataTransfer.setDragImage(clone, 10, 10);
      } catch (err) {
        // ignore
      }
      // remove the clone on next tick
      setTimeout(() => {
        try {
          document.body.removeChild(clone);
        } catch (err) {
          // ignore
        }
      }, 0);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    try {
      delete window.__alpacaDragState;
    } catch (err) {
      // ignore
    }
  };

  return (
    <div
      ref={elRef}
      draggable={!isDragDisabled}
      role="listitem"
      aria-grabbed={isDragging}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-index={index}
      className={`${className} ${isDragging ? 'dragging' : ''}`}
    >
      <Item
        id={id}
        content={content}
        assignees={assignees}
        commentCount={commentCount}
        meta={meta}
        className="alpaca-item-inner"
        onClick={handleClick}
      />
    </div>
  );
}

DraggableItem.propTypes = {
  id: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  containerId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  content: PropTypes.string.isRequired,
  className: PropTypes.string,
  isDragDisabled: PropTypes.bool,
  onClick: PropTypes.func,
  assignees: PropTypes.array,
  commentCount: PropTypes.number,
  meta: PropTypes.object,
};

export default DraggableItem;
