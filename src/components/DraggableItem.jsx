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
 * @param {string}          root0.postDate       - Item creation date
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
  postDate,
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
      postDate,
      assignees,
      commentCount,
      meta,
    };

    try {
      e.dataTransfer.setData('application/json', JSON.stringify(payload));
      // @url https://stackoverflow.com/a/23522755/5038063
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      if ( ! isSafari ) {

        // Clone the element for the drag image
        const dragImage = e.currentTarget.cloneNode(true);
        dragImage.style.transform = 'rotate(3deg)';
        dragImage.style.boxShadow = '0 4px 8px rgb(0 0 0 / 10%)';
        dragImage.style.position = 'absolute';
        dragImage.style.width = '100%';
        dragImage.style.top = '-1000px';
        dragImage.style.left = '-1000px';
        const container = document.body.querySelector(".alpaca-items");
        if (container) {
          container.appendChild(dragImage);

          // Set the custom drag image.
          e.dataTransfer.setDragImage(
            dragImage,
            dragImage.clientWidth / 2,
            dragImage.clientHeight / 2
          );

          // Remove the temporary drag image immediately after snapshot
          setTimeout(() => {
            dragImage.remove();
          }, 0);
        }
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
      data-id={id}
      className={`${className} ${isDragging ? 'dragging' : ''}`}
    >
      <Item
        id={id}
        content={content}
        postDate={postDate}
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
  postDate: PropTypes.string,
  className: PropTypes.string,
  isDragDisabled: PropTypes.bool,
  onClick: PropTypes.func,
  assignees: PropTypes.array,
  commentCount: PropTypes.number,
  meta: PropTypes.object,
};

export default DraggableItem;
